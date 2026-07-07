# fede-proyecto-cine

Sistema de reservas de cine. Backend Spring Boot + PostgreSQL + Hibernate, frontend React + Vite + Tailwind + React Query + React Router. Conectado a GitHub: remoto `origin` → https://github.com/feedegr/Cinema-Spring.git, rama `master`.

El usuario (feedecs96@gmail.com) es nuevo en Java/Spring Boot y en VSCode para este stack, pero no en programación en general. Explicar el "por qué" de las decisiones de Spring/Hibernate, no solo el "qué" — lo pidió explícitamente.

## Stack y versiones

- **Spring Boot 4.1.0** (release estable, no confundir con SNAPSHOT — el scaffold original de Spring Initializr traía `4.1.1-SNAPSHOT` con un repo de snapshots agregado a mano; se corrigió a la versión estable real). Java 21.
- **Hibernate** vía `spring-boot-starter-data-jpa` (JPA + Hibernate como proveedor, todo autoconfigurado).
- **PostgreSQL** como base real (driver `org.postgresql:postgresql`). H2 quedó en `scope=test` únicamente, ya no es la base de runtime.
- **Frontend**: Vite + React + TypeScript (`frontend/`), Tailwind CSS v4 (`@tailwindcss/vite`, config CSS-first en `index.css`, sin `tailwind.config.js`), `@tanstack/react-query` + `react-router-dom`.
- **Docker**: `Dockerfile` + `docker-compose.yml` existen pero **no se usan en el día a día** (ver sección Postgres más abajo).
- **Auth básica**: `spring-security-crypto` (solo el hasher BCrypt, no el starter completo de Spring Security — sin `SecurityFilterChain`, ningún endpoint está protegido de verdad todavía). **TODO**: migrar a `spring-boot-starter-security` + JWT cuando haga falta proteger endpoints por rol de verdad (decisión explícita del usuario: arrancar simple, reforzar después).

## Postgres: nativo, no Docker

El backend corre contra el **PostgreSQL nativo instalado en esta máquina** (servicio de Windows `postgresql-x64-18`, versión 18), no contra el contenedor de `docker-compose.yml`. Rol `cine_user` (password `cine_pass`) y base `cine_db`, exactamente lo que `application.properties` ya esperaba por default (`${DB_HOST:localhost}`, etc.).

- El servicio de Windows tiene que estar corriendo (arranca solo).
- `pg_hba.conf` quedó con `scram-sha-256` normal — nunca se dejó `trust` permanente.
- `docker-compose.yml`/`Dockerfile` quedan para cuando se quiera containerizar más adelante, pero no forman parte de `npm run dev`.

## Estructura backend

Paquete base: `com.grandinetti.spring.fede_proyecto_cine`

- `domain/`:
  - `Cinema` (nombre único, dirección) 1—N `Room`.
  - `Room` (nombre, capacidad) N—1 `Cinema`, 1—N `Seat`. Unique constraint **compuesta** `(cinema_id, name)` — no global — para que dos cines distintos puedan tener cada uno su propia "Sala 1".
  - `Seat` (fila, número) N—1 `Room`. Unique compuesta `(room_id, seat_row, number)`.
  - `Showtime` (horario, `language` enum `DOBLADA`/`SUBTITULADA`) N—1 `Movie`, N—1 `Room`. Unique compuesta `(movie_id, room_id, start_time)`. `language` mapeado con `@Enumerated(EnumType.STRING)` (guarda texto, no el ordinal).
  - `Booking` N—1 `User`, N—1 `Showtime`, N—N `Seat` (`booking_seats`) — con `BookingController` + `BookingService` (ver abajo).
  - `Movie` (`title` único, `posterUrl` con placeholders de picsum.photos).
  - `User` (`email` único además de `@Email`/`@NotBlank`) — necesario para que el usuario de prueba en `data.sql` sea idempotente. Tiene además `password` (hash BCrypt, `@JsonIgnore` — nunca sale en un JSON, ni siquiera el hash, porque `Booking.user` serializa el `User` completo) y `role` (`Enumerated(STRING)`, `Role.ADMIN`/`Role.USER`, default `USER` vía inicializador de campo).
  - Todas las unique constraints existen para que `data.sql` sea idempotente vía `ON CONFLICT DO NOTHING` (sin constraint real, ese `ON CONFLICT` no tiene nada contra qué comparar).
  - `Room.seats` usa `@JsonManagedReference` / `Seat.room` usa `@JsonBackReference` (corta el loop infinito de serialización). Mismo patrón invertido en `User.bookings` (`@JsonBackReference`, se omite) vs `Booking.user` (sin anotar, se serializa completo) — acá el lado que se quiere ver completo es el del `Booking`, no el del `User`.
- `repository/` — un `JpaRepository` por entidad (incluye `CinemaRepository`). `BookingRepository` tiene además `findBookedSeatIds(showtimeId, seatIds)` (`@Query` JPQL) para chequear disponibilidad.
- `controller/` — **`Movie`, `Cinema`, `Room`, `Showtime`, `Seat`, `Booking`** conectados de punta a punta (GET, GET/{id}, POST). Falta `User` (como recurso CRUD — la creación de usuarios pasa por `/api/auth/signup`, no por un `UserController`). `BookingController.getAll` acepta `?userId=X` opcional (`@RequestParam(required = false)`) para filtrar — sin el parámetro devuelve todas las reservas, con él usa `BookingRepository.findByUserIdOrderByBookedAtDesc` (query derivada por nombre de método, sin `@Query` manual).
  - `AuthController` (`/api/auth`) — `POST /signup` y `POST /login`, ambos devuelven `dto.AuthResponse` (id/nombre/email/rol, nunca el password). `AuthService.signup()` valida email único (409 si ya existe), hashea con `PasswordEncoder` y guarda como `Role.USER`. `login()` busca por email y compara con `passwordEncoder.matches(...)` — mismo mensaje de error para "no existe" y "contraseña incorrecta" (401), para no confirmarle a un atacante qué emails están registrados.
  - `config/SecurityConfig.java` — un solo `@Bean PasswordEncoder` (`BCryptPasswordEncoder`). Nada más: sin el starter de Spring Security no hay filtros que proteger, así que ningún endpoint valida todavía quién está logueado del lado del servidor (ver TODO en Stack y versiones).
- `service/BookingService.java` — **primera capa `service` del proyecto**. `create()`:
  1. Valida que `user`/`showtime` vengan en el body y que haya al menos una butaca.
  2. Busca las entidades reales por id (`userRepository.findById(...)`, etc.) en vez de confiar en el objeto que manda el cliente — el JSON de entrada solo trae `{"id": X}`, un objeto "shell" sin el resto de los campos, y Hibernate no lo rehidrata solo para guardar la FK. Si no se buscan de nuevo, la respuesta devuelve `user`/`showtime` con todo en `null` salvo el id. Buscarlos también da un 404 prolijo si el id no existe, en vez de un error crudo de constraint de la base.
  3. Chequea con `findBookedSeatIds` que ninguna butaca pedida esté ya reservada para esa función — si alguna lo está, `409 CONFLICT` con el detalle de cuáles.
  4. Si todo OK, arma la `Booking` con las entidades reales, setea `bookedAt = now()` y guarda.
  - `getSeatAvailability(showtimeId)`: devuelve las butacas de la sala de esa función con un flag `occupied` calculado (reusa `findBookedSeatIds`). Expuesto en `GET /api/showtimes/{id}/seats`, devuelve `dto.SeatAvailability` (record, no es una entidad JPA — `occupied` es un dato calculado por función, no un atributo propio de `Seat`).
- `config/WebConfig.java` — CORS para `http://localhost:5173`.
- `ddl-auto=update`: no apto para producción, migrar a Flyway cuando el modelo se estabilice.

### Gotcha de `data.sql`: solo agrega, nunca borra

`ddl-auto=update` + `ON CONFLICT DO NOTHING` es aditivo puro: si cambiás a qué sala/horario apunta una función (o cualquier fila) en `data.sql`, **la fila vieja no se borra sola**, queda huérfana en la base real. Ya pasó dos veces en este proyecto:
- Al agregar la columna `language`, filas insertadas antes de ese cambio quedaron con `language = NULL` (hubo que hacer `UPDATE` manual).
- Al mover "Toy Story" de Sala 1 a Sala 3, la fila vieja (Sala 1) quedó viva en paralelo.

**Cómo detectarlo**: comparar `SELECT count(*) FROM showtimes` (o la tabla que sea) contra lo que `data.sql` realmente declara. Si no coincide, buscar la fila que no matchea ninguna línea del archivo y borrarla a mano por `id`.

**Caso encontrado en `users`** (al agregar `password`/`role`): la tabla real en Postgres **nunca tuvo** el unique constraint sobre `email` que el código declara hace rato (`@Column(unique = true)`) — probablemente porque el constraint intentó agregarse en algún `ddl-auto=update` con datos ya duplicados y falló en silencio. Resultado: `ON CONFLICT DO NOTHING` sobre `users` era un no-op total, y **cada restart del backend insertaba una fila nueva** de "Fede Test" — la tabla tenía 9 filas idénticas antes de notarlo (todas las `bookings` apuntaban igual a la primera, `id=1`, así que no rompía nada visible, solo acumulaba basura). Se arregló a mano: `DELETE FROM users WHERE id <> 1`, después `ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email)`. Moraleja: cuando se agrega una unique constraint nueva a una entidad que ya tiene datos reales, conviene verificar con `pg_constraint` que Hibernate realmente la haya creado (`SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'tabla'::regclass`), no asumirlo por leer el código Java.

**Columna nueva `NOT NULL` sobre una tabla con filas existentes**: al agregar `password` (con `@NotBlank`, que Hibernate traduce a `NOT NULL` en la columna), el `ALTER TABLE ... ADD COLUMN password ... NOT NULL` falló porque la fila de "Fede Test" ya existente no tenía valor para completarla. Se resolvió a mano: agregar la columna sin `NOT NULL`, hacer `UPDATE` con el hash BCrypt correspondiente, y recién ahí `ALTER TABLE ... ALTER COLUMN password SET NOT NULL`. Aplica cada vez que se agregue una columna `@NotBlank`/`@NotNull` nueva a una entidad con datos ya sembrados.

`data.sql` actual: 4 usuarios de prueba, todos con contraseña `cine1234` (`Fede Test`/`fede@test.com` como único `ADMIN`; `Ana Gomez`, `Lucas Perez`, `Sofia Ruiz` como `USER` — tabla completa en `frontend/README.md`; cualquier otro usuario se crea por `/api/auth/signup` y queda como `USER`), 5 películas, 3 cines (Recoleta/Palermo/Belgrano) con una sala cada uno, y **15 funciones** repartidas entre los 3 cines/horarios/idiomas para variedad. Las butacas de cada sala se generan con `generate_series`/`unnest` (10 butacas por fila) para que coincidan exactamente con la `capacity` declarada: Sala 1 = 50 (filas A-E), Sala 2 = 30 (filas A-C), Sala 3 = 40 (filas A-D) — antes había un desfasaje (`capacity` decía un número, pero se habían sembrado menos butacas reales de las que decía).

## Cómo correr todo junto

```
npm run dev
```

Backend (`.\mvnw.cmd spring-boot:run`, hot-reload vía devtools) + frontend (`npm run dev` de Vite) en paralelo. `Ctrl+C` corta los dos. Postgres nativo tiene que estar corriendo (servicio de Windows, arranca solo).

Scripts individuales: `npm run dev:backend`, `npm run dev:frontend`. `npm run dev:db` (`docker compose up db`) sigue existiendo pero es standalone.

## Frontend

- **Diseño**: tema oscuro "sala de cine" con Tailwind v4 — paleta `curtain`/`marquee`/`velvet`/`screen`/`muted` definida en `@theme` (`index.css`), tipografía `Bebas Neue` (display, estilo marquesina) + `Inter` (body), y un elemento firma: `.film-strip`, una tira de perforaciones de película de 35mm (radial-gradient repetido) usada como divisor.
- **Páginas**:
  - `MoviesPage` ("En cartelera") — **carrousel horizontal** (scroll-snap nativo, sin librería) con botones prev/next, cards con póster/título/género/duración/sinopsis.
  - `CinemasPage` ("Cines") — fusiona cine + sus salas (chips con capacidad). Cada card es un link a `/showtimes?cinemaId=X`.
  - `ShowtimesPage` ("Funciones") — lee `cinemaId` de query params (`useSearchParams`) para filtrar por cine, con link "Ver todos los cines" para sacar el filtro. Cada fila es un `Link` a `/showtimes/:id/seats`.
  - `ShowtimeSeatsPage` (mapa de butacas) — al clickear una función, muestra sus butacas agrupadas por fila, verde (`bg-available`) = disponible, rojo (`bg-occupied`) = ocupada (calculado server-side contra las reservas ya hechas para esa función puntual). Las butacas disponibles son clickeables (toggle verde/rojo, seleccion local con `useState<Set<number>>`). Ya **no** crea la reserva ella misma — el botón "Continuar con N butacas" navega a `/showtimes/:id/checkout` pasando los `seatIds` elegidos vía `navigate(..., { state })`.
  - `CheckoutPage` (checkout ficticio) — lee `seatIds` de `location.state` (si no hay ninguno, ej. entrando directo por URL/refresh, muestra un mensaje y link para volver a elegir). Resumen con butacas + precio ficticio (`PRICE_PER_SEAT = 3000`, constante local, no existe en el modelo de datos — solo se muestra, no se persiste). Si no hay sesión iniciada (`useAuth().user` es `null`), muestra "Iniciá sesión para completar tu compra" en vez del botón de pago. El botón "Pagar" dispara `POST /api/bookings` (`useCreateBooking`) con el `id` del usuario logueado. Éxito → pantalla de confirmación; error (ej. 409 porque alguien más agarró la butaca mientras "pagabas") → mensaje + link para volver a elegir butacas.
  - **TODO conocido**: como el pago es ficticio y la reserva no se crea hasta confirmar el pago, la butaca no queda "retenida" durante el checkout — otro usuario podría reservarla mientras el primero está en `CheckoutPage`. Hoy se maneja mostrando el error 409 y mandando de vuelta a elegir, pero la solución real sería un holding/lock temporal de butacas al entrar al checkout (con expiración). Pendiente para más adelante.
  - `MyBookingsPage` ("Mis reservas") — trae `GET /api/bookings?userId={user.id}` del usuario logueado (hook `useBookings`, con `enabled: userId != null` para no disparar la query si no hay sesión), lista cada reserva con película, cine/sala/horario, idioma, butacas y fecha en que se hizo la reserva. Sin sesión, muestra "Iniciá sesión para ver tus reservas" (no aparece en el nav si no estás logueado). Sin reservas, muestra mensaje + link a la cartelera.
  - No hay `RoomsPage` separada — se fusionó dentro de `CinemasPage` a pedido del usuario.
- **Autenticación (login/signup)**:
  - `context/AuthContext.tsx` — `AuthProvider` envuelve `<App />` en `main.tsx` (dentro de `QueryClientProvider`) y guarda `user: User | null` en estado + `localStorage` (`cine_auth_user`) para sobrevivir un refresh. **No hay token/JWT todavía** (ver TODO en Stack y versiones) — lo único persistido es el objeto de usuario que ya devuelve el backend sin password. `login`/`signup` llaman a `api/client.ts` y, si el backend responde bien, guardan el usuario en contexto; si no, propagan el `Error` para que el modal lo muestre.
  - `components/Modal.tsx` — overlay genérico reusable (cierra con click afuera o `Escape`).
  - `components/AuthModal.tsx` — un solo componente parametrizado por `mode: "login" | "signup"` (son casi el mismo formulario, difieren en el campo `name` y en qué función de contexto llaman) en vez de dos componentes separados.
  - Nav en `App.tsx`: sin sesión, botones "Iniciar sesión" / "Registrarse" que abren el modal correspondiente. Con sesión, muestra el nombre (+ chip "Admin" si `role === "ADMIN"`) y "Cerrar sesión"; el link "Mis reservas" solo aparece logueado.
  - Nada en el frontend ni el backend restringe todavía acciones por rol — `ADMIN` hoy es solo un dato mostrado (chip en el nav), no protege ninguna ruta ni endpoint. Es la base para cuando se implemente algo tipo panel de administración.

## Gotchas del entorno (Windows, esta máquina)

- **JDK por defecto es 17, el proyecto pide 21.** JDK 21 en `C:\Program Files\Java\jdk-21.0.11`. `.vscode/settings.json` (gitignored) configurado para VSCode. `dev:backend` en `package.json` setea `JAVA_HOME` para esa invocación.
- **`mvnw.cmd` necesita el prefijo `.\` explícito en Windows** — ni cmd.exe ni PowerShell lo resuelven por nombre pelado.
- **No usar `cross-env`** para `JAVA_HOME`: rompe el prefijo `.\` al relanzar el comando. Se usa `set "JAVA_HOME=..." && .\mvnw.cmd ...` (sintaxis nativa de cmd, ok porque el script ya es Windows-only).
- **Postgres nativo, no Docker Desktop** — ver sección propia arriba.
- **Devtools + procesos colgados**: al matar procesos de `mvnw.cmd`/`npm run dev` con `timeout` desde una terminal, a veces el JVM hijo que devtools spawnea sigue vivo y se queda ocupando el puerto 8080. Si el próximo arranque tira "Port 8080 was already in use", buscar el PID con `netstat -ano | grep :8080` y matarlo (`taskkill //PID <pid> //F`).

## Convenciones

- Nombres de clase en inglés (`Movie`, `Room`, `Cinema`, etc.) aunque el dominio se piense en español — sigue la convención del paquete (`FedeProyectoCineApplication`).
- Lombok (`@Getter @Setter @NoArgsConstructor @AllArgsConstructor`) para las entidades.
- Inyección por constructor en los controllers, no `@Autowired` en el campo.

## Estado / próximos pasos naturales

En orden de prioridad (el usuario acordó este orden):

1. ~~Controllers para Room, Showtime, Seat~~ — hecho.
2. ~~Endpoint de Booking real~~ — hecho. `POST /api/bookings` (body: `{"user":{"id":X},"showtime":{"id":Y},"seats":[{"id":A},{"id":B}]}`), valida existencia de user/showtime/seats y rechaza butacas ya ocupadas con 409. Probado a mano con curl: reserva ok, butaca duplicada (409), user/showtime/seat inexistente (404), sin butacas (400).
3. ~~Frontend del flujo de reserva~~ — hecho. `ShowtimeSeatsPage` (ver butacas + seleccionarlas) → `CheckoutPage` (resumen + precio ficticio + "Pagar", ahí se crea la reserva de verdad). Probado end-to-end con curl simulando el POST del frontend: la reserva se crea y el mapa pasa esas butacas a ocupadas.
   - **TODO pendiente** (anotado por el usuario a propósito, no se resuelve todavía): las butacas no quedan retenidas mientras estás en el checkout ficticio — alguien más podría reservarlas antes de que confirmes el pago. Se maneja hoy con el 409 + volver a elegir, pero la solución real es un holding/lock temporal con expiración al entrar al checkout.
   - ~~Vista de "mis reservas" (historial)~~ — hecho. `GET /api/bookings?userId=X` (filtro opcional sobre el mismo endpoint que ya listaba todas) + `MyBookingsPage` en `/mis-reservas`, link agregado al nav.
4. Autenticación básica — en progreso, 3 sub-pasos acordados con el usuario:
   - ~~Login/signup real~~ — hecho. `POST /api/auth/{login,signup}`, `User` con `password` (hash BCrypt) + `role` (`ADMIN`/`USER`, default `USER`). Frontend: `AuthContext` + `AuthModal` (modal de login y de signup, mismo componente parametrizado), botones en el nav, `CheckoutPage`/`MyBookingsPage` ya usan el usuario logueado en vez de un id hardcodeado. Sin JWT/sesión de servidor todavía (TODO en Stack y versiones) y sin protección real de endpoints por rol (el chip "Admin" es solo visual por ahora).
   - ~~Crear más usuarios reales en `data.sql`~~ — hecho. Además del admin (`Fede Test`), 3 usuarios `USER` de ejemplo (Ana Gomez, Lucas Perez, Sofia Ruiz), los 4 con la misma contraseña de prueba `cine1234` (mismo hash BCrypt repetido en las 4 filas — no hay problema en reusarlo para cuentas de prueba). Documentado en `frontend/README.md` (tabla de usuarios/contraseñas) para no tener que buscarlo en `data.sql` cada vez.
   - **Falta**: por usuario, separar en `MyBookingsPage` un "historial de películas ya vistas" (reservas cuyo `showtime.startTime` ya pasó) de las "reservas actuales/próximas" (`startTime` futuro) — no necesita entidad nueva, se deriva de `Booking`+`Showtime` que ya existen.
5. Solidez técnica: tests del flujo de reserva, migrar `ddl-auto=update` a Flyway antes de tener datos reales, manejo de errores consistente (`@ControllerAdvice`, el resto de los controllers todavía devuelve 500 en vez de 400 ante errores de validación — `Booking` es el único con manejo de errores prolijo por ahora), y el holding de butacas durante checkout (punto 3).
6. ~~Conectar repositorio remoto en GitHub~~ — hecho (el usuario decidió adelantarlo antes de terminar el flujo de reserva).

## Backlog de ideas (funcionalidades futuras, sin orden ni prioridad)

Anotado por el usuario para hacer crecer el proyecto más adelante, no forman parte del roadmap ordenado de arriba todavía:

- Distintos precios por función/sala (hoy `PRICE_PER_SEAT = 3000` es una constante fija en el frontend, no existe el concepto de precio en el modelo de datos).
- Descuentos y promociones.
- Funciones 2D / 3D (nuevo atributo de `Showtime`, similar a como `language` distingue DOBLADA/SUBTITULADA).
- Salas VIP (probablemente un atributo de `Room`, posiblemente ligado a un precio distinto).
- Venta de snacks/combos.
- QR del ticket.
- Envío de la entrada por email.
- Código de compra (identificador corto y humano para cada `Booking`, distinto del `id` interno).
