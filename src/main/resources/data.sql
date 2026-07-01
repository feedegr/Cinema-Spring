INSERT INTO movies (title, duration_minutes, genre, synopsis) VALUES
    ('Matrix', 136, 'Ciencia ficcion', 'Un programador descubre que la realidad es una simulacion.'),
    ('El Padrino', 175, 'Drama', 'La historia de una familia mafiosa en Nueva York.'),
    ('Coco', 105, 'Animacion', 'Un nino viaja al mundo de los muertos en busca de su tatarabuelo musico.')
ON CONFLICT DO NOTHING;
