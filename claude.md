# fede-proyecto-cine

Sistema de reservas de cine. Backend Spring Boot + PostgreSQL + Hibernate, frontend React + Vite + Tailwind + React Query + React Router. Git local, GitHub todavía no conectado (sin remoto, sin push).

El usuario (feedecs96@gmail.com) es nuevo en Java/Spring Boot y en VSCode para este stack, pero no en programación en general. Explicar el "por qué" de las decisiones de Spring/Hibernate, no solo el "qué" — lo pidió explícitamente.

## Stack y versiones

- **Spring Boot 4.1.0** (release estable, no confundir con SNAPSHOT — el scaffold original de Spring Initializr traía `4.1.1-SNAPSHOT` con un repo de snapshots agregado a mano; se corrigió a la versión estable real). Java 21.
- **Hibernate** vía `spring-boot-starter-data-jpa` (JPA + Hibernate como proveedor, todo autoconfigurado).
- **PostgreSQL** como base real (driver `org.postgresql:postgresql`). H2 quedó en `scope=test` únicamente, ya no es la base de runtime.
- **Frontend**: Vite + React + TypeScript (`frontend/`), Tailwind CSS v4 (`@tailwindcss/vite`, config CSS-first en `index.css`, sin `tailwind.config.js`), `@tanstack/react-query` + `react-router-dom`.
- **Docker**: `Dockerfile` + `docker-compose.yml` existen pero **no se usan en el día a día** (ver sección Postgres más abajo).

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
  - `Booking` N—1 `User`, N—1 `Showtime`, N—N `Seat` — **todavía sin controller**, es el próximo paso real.
  - `Movie` (`title` único, `posterUrl` con placeholders de picsum.photos).
  - Todas las unique constraints existen para que `data.sql` sea idempotente vía `ON CONFLICT DO NOTHING` (sin constraint real, ese `ON CONFLICT` no tiene nada contra qué comparar).
  - `Room.seats` usa `@JsonManagedReference` / `Seat.room` usa `@JsonBackReference` (corta el loop infinito de serialización).
- `repository/` — un `JpaRepository` por entidad (incluye `CinemaRepository`).
- `controller/` — **`Movie`, `Cinema`, `Room`, `Showtime`, `Seat`** conectados de punta a punta (GET, GET/{id}, POST). Falta `Booking` y `User`.
- `config/WebConfig.java` — CORS para `http://localhost:5173`.
- Deliberadamente **sin capa `service`** — se introduce con el endpoint de `Booking` (primera lógica de negocio real: validar butacas ya reservadas).
- `ddl-auto=update`: no apto para producción, migrar a Flyway cuando el modelo se estabilice.

### Gotcha de `data.sql`: solo agrega, nunca borra

`ddl-auto=update` + `ON CONFLICT DO NOTHING` es aditivo puro: si cambiás a qué sala/horario apunta una función (o cualquier fila) en `data.sql`, **la fila vieja no se borra sola**, queda huérfana en la base real. Ya pasó dos veces en este proyecto:
- Al agregar la columna `language`, filas insertadas antes de ese cambio quedaron con `language = NULL` (hubo que hacer `UPDATE` manual).
- Al mover "Toy Story" de Sala 1 a Sala 3, la fila vieja (Sala 1) quedó viva en paralelo.

**Cómo detectarlo**: comparar `SELECT count(*) FROM showtimes` (o la tabla que sea) contra lo que `data.sql` realmente declara. Si no coincide, buscar la fila que no matchea ninguna línea del archivo y borrarla a mano por `id`.

`data.sql` actual: 5 películas, 3 cines (Recoleta/Palermo/Belgrano) con una sala cada uno (Sala 1/2/3, 25 butacas en total), y **15 funciones** repartidas entre los 3 cines/horarios/idiomas para variedad.

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
  - `ShowtimesPage` ("Funciones") — lee `cinemaId` de query params (`useSearchParams`) para filtrar por cine, con link "Ver todos los cines" para sacar el filtro.
  - No hay `RoomsPage` separada — se fusionó dentro de `CinemasPage` a pedido del usuario.
- Falta: página/flujo de reserva (selección de butacas) — depende del endpoint de `Booking`.

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
2. **Endpoint de Booking real**: `POST /api/bookings` con `showtimeId` + `seatIds` + `userId`, validando que las butacas no estén ya reservadas para esa función — acá aparece la primera lógica de negocio real y el motivo para introducir la capa `service`.
3. Frontend del flujo de reserva (selección de butacas + vista de "mis reservas").
4. Autenticación básica (hoy `Booking.user` no tiene forma real de saber quién está logueado).
5. Solidez técnica: tests del flujo de reserva, migrar `ddl-auto=update` a Flyway antes de tener datos reales, manejo de errores consistente (`@ControllerAdvice`, hoy un error de validación devuelve 500 en vez de 400).
6. Conectar repositorio remoto en GitHub (a propósito todavía no, esperar a que el flujo de reserva básico esté probado).
