# fede-proyecto-cine — frontend

Frontend del sistema de reservas de cine. React + Vite + TypeScript + Tailwind CSS v4 + React Query + React Router.

Corre junto al backend con `npm run dev` desde la raíz del proyecto (ver `claude.md` en la raíz para más detalle del stack completo).

## Usuarios de prueba

Sembrados en `data.sql` del backend, todos con la misma contraseña:

| Nombre      | Email             | Contraseña | Rol   |
|-------------|-------------------|------------|-------|
| Fede Test   | fede@test.com     | cine1234   | ADMIN |
| Ana Gomez   | ana@test.com      | cine1234   | USER  |
| Lucas Perez | lucas@test.com    | cine1234   | USER  |
| Sofia Ruiz  | sofia@test.com    | cine1234   | USER  |

También se puede crear una cuenta nueva desde "Registrarse" — queda como `USER` por default.
