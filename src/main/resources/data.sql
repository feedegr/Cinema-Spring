-- poster_url son placeholders (picsum.photos) - reemplazar por links reales de poster cuando se hardcodee el catalogo final
INSERT INTO movies (title, duration_minutes, genre, synopsis, poster_url) VALUES
    ('Interstellar', 169, 'Ciencia ficcion', 'Un grupo de astronautas viaja a traves de un agujero de gusano en busca de un nuevo hogar para la humanidad.', 'https://picsum.photos/seed/interstellar/200/300'),
    ('Whiplash', 107, 'Drama', 'Un joven baterista de jazz es empujado al limite por un profesor implacable que busca la perfeccion.', 'https://picsum.photos/seed/whiplash/200/300'),
    ('El Rey Leon', 88, 'Animacion', 'Un joven leon debe aceptar su destino y reclamar su lugar como rey tras la muerte de su padre.', 'https://picsum.photos/seed/reyleon/200/300'),
    ('Pulp Fiction', 154, 'Crimen', 'Las vidas de dos sicarios, un boxeador y una pareja de ladrones se entrelazan en Los Angeles.', 'https://picsum.photos/seed/pulpfiction/200/300'),
    ('Toy Story', 81, 'Animacion', 'Un vaquero de juguete siente celos cuando llega un nuevo juguete espacial que se vuelve el favorito de su dueno.', 'https://picsum.photos/seed/toystory/200/300')
ON CONFLICT DO NOTHING;

-- Usuarios de prueba sembrados de entrada (el resto se crean via /api/auth/signup, ahi
-- quedan como USER por default). Todos comparten la misma contrasena en texto plano
-- para loguearse: cine1234 (el hash de abajo es BCrypt de esa contrasena, generado una
-- sola vez con jshell - se repite igual para los 4, no hace falta uno distinto por fila).
INSERT INTO users (name, email, password, role) VALUES
    ('Fede Test', 'fede@test.com', '$2a$10$9fjoPByr/GnSzMmrdT8RRONWYRDNsxfi61G9w6wD2gHXDWYhv6j4O', 'ADMIN'),
    ('Ana Gomez', 'ana@test.com', '$2a$10$9fjoPByr/GnSzMmrdT8RRONWYRDNsxfi61G9w6wD2gHXDWYhv6j4O', 'USER'),
    ('Lucas Perez', 'lucas@test.com', '$2a$10$9fjoPByr/GnSzMmrdT8RRONWYRDNsxfi61G9w6wD2gHXDWYhv6j4O', 'USER'),
    ('Sofia Ruiz', 'sofia@test.com', '$2a$10$9fjoPByr/GnSzMmrdT8RRONWYRDNsxfi61G9w6wD2gHXDWYhv6j4O', 'USER')
ON CONFLICT DO NOTHING;

INSERT INTO cinemas (name, address) VALUES
    ('Cine Recoleta', 'Av. Callao 1000'),
    ('Cine Palermo', 'Av. Santa Fe 3253'),
    ('Cine Belgrano', 'Av. Cabildo 2049')
ON CONFLICT DO NOTHING;

INSERT INTO rooms (name, capacity, cinema_id)
SELECT 'Sala 1', 50, c.id FROM cinemas c WHERE c.name = 'Cine Recoleta'
UNION ALL
SELECT 'Sala 2', 30, c.id FROM cinemas c WHERE c.name = 'Cine Palermo'
UNION ALL
SELECT 'Sala 3', 40, c.id FROM cinemas c WHERE c.name = 'Cine Belgrano'
ON CONFLICT DO NOTHING;

-- La cantidad de butacas sembradas coincide con la "capacity" declarada de cada sala
-- (10 butacas por fila): Sala 1 = 50 (filas A-E), Sala 2 = 30 (filas A-C), Sala 3 = 40 (filas A-D).
INSERT INTO seats (seat_row, number, room_id)
SELECT row_letter, n, rm.id
FROM (SELECT id FROM rooms WHERE name = 'Sala 1') rm,
     unnest(ARRAY['A', 'B', 'C', 'D', 'E']) AS row_letter,
     generate_series(1, 10) AS n
ON CONFLICT DO NOTHING;

INSERT INTO seats (seat_row, number, room_id)
SELECT row_letter, n, rm.id
FROM (SELECT id FROM rooms WHERE name = 'Sala 2') rm,
     unnest(ARRAY['A', 'B', 'C']) AS row_letter,
     generate_series(1, 10) AS n
ON CONFLICT DO NOTHING;

INSERT INTO seats (seat_row, number, room_id)
SELECT row_letter, n, rm.id
FROM (SELECT id FROM rooms WHERE name = 'Sala 3') rm,
     unnest(ARRAY['A', 'B', 'C', 'D']) AS row_letter,
     generate_series(1, 10) AS n
ON CONFLICT DO NOTHING;

INSERT INTO showtimes (start_time, language, movie_id, room_id)
SELECT '2026-07-05 20:00:00'::timestamp, 'SUBTITULADA', m.id, rm.id FROM movies m, rooms rm WHERE m.title = 'Interstellar' AND rm.name = 'Sala 1'
UNION ALL
SELECT '2026-07-05 22:30:00'::timestamp, 'DOBLADA', m.id, rm.id FROM movies m, rooms rm WHERE m.title = 'Interstellar' AND rm.name = 'Sala 3'
UNION ALL
SELECT '2026-07-07 19:00:00'::timestamp, 'SUBTITULADA', m.id, rm.id FROM movies m, rooms rm WHERE m.title = 'Interstellar' AND rm.name = 'Sala 2'
UNION ALL
SELECT '2026-07-05 22:00:00'::timestamp, 'SUBTITULADA', m.id, rm.id FROM movies m, rooms rm WHERE m.title = 'Whiplash' AND rm.name = 'Sala 2'
UNION ALL
SELECT '2026-07-06 20:00:00'::timestamp, 'SUBTITULADA', m.id, rm.id FROM movies m, rooms rm WHERE m.title = 'Whiplash' AND rm.name = 'Sala 1'
UNION ALL
SELECT '2026-07-07 21:30:00'::timestamp, 'SUBTITULADA', m.id, rm.id FROM movies m, rooms rm WHERE m.title = 'Whiplash' AND rm.name = 'Sala 3'
UNION ALL
SELECT '2026-07-06 17:00:00'::timestamp, 'DOBLADA', m.id, rm.id FROM movies m, rooms rm WHERE m.title = 'El Rey Leon' AND rm.name = 'Sala 1'
UNION ALL
SELECT '2026-07-06 14:00:00'::timestamp, 'DOBLADA', m.id, rm.id FROM movies m, rooms rm WHERE m.title = 'El Rey Leon' AND rm.name = 'Sala 2'
UNION ALL
SELECT '2026-07-07 16:00:00'::timestamp, 'DOBLADA', m.id, rm.id FROM movies m, rooms rm WHERE m.title = 'El Rey Leon' AND rm.name = 'Sala 3'
UNION ALL
SELECT '2026-07-06 21:00:00'::timestamp, 'SUBTITULADA', m.id, rm.id FROM movies m, rooms rm WHERE m.title = 'Pulp Fiction' AND rm.name = 'Sala 2'
UNION ALL
SELECT '2026-07-07 22:00:00'::timestamp, 'SUBTITULADA', m.id, rm.id FROM movies m, rooms rm WHERE m.title = 'Pulp Fiction' AND rm.name = 'Sala 1'
UNION ALL
SELECT '2026-07-05 23:00:00'::timestamp, 'SUBTITULADA', m.id, rm.id FROM movies m, rooms rm WHERE m.title = 'Pulp Fiction' AND rm.name = 'Sala 3'
UNION ALL
SELECT '2026-07-06 15:00:00'::timestamp, 'DOBLADA', m.id, rm.id FROM movies m, rooms rm WHERE m.title = 'Toy Story' AND rm.name = 'Sala 3'
UNION ALL
SELECT '2026-07-05 16:00:00'::timestamp, 'DOBLADA', m.id, rm.id FROM movies m, rooms rm WHERE m.title = 'Toy Story' AND rm.name = 'Sala 1'
UNION ALL
SELECT '2026-07-07 14:30:00'::timestamp, 'SUBTITULADA', m.id, rm.id FROM movies m, rooms rm WHERE m.title = 'Toy Story' AND rm.name = 'Sala 2'
ON CONFLICT DO NOTHING;
