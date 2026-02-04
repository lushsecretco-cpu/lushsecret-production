-- Productos de prueba para LushSecret
-- Ejecuta esto en Neon SQL Editor después de ejecutar schema.sql

-- Crear usuario administrador
INSERT INTO users (email, password_hash, name, role, is_verified)
VALUES ('admin@lushsecret.co', '$2a$10$fbts1bbbRVG4RdcWQskRvuM1HqJ2hUpIXdGDJJDHPyeTcGT9WILjS', 'Admin', 'ADMIN', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, price, stock, main_image_url)
VALUES
-- Línea Íntima (category_id = 1)
(1, 'Conjunto Encaje Suave', 'conjunto-encaje-suave', 'Conjunto de lencería en encaje suave y delicado, diseño elegante y cómodo', 45000, 15, 'https://via.placeholder.com/500x500?text=Conjunto+Encaje'),
(1, 'Pijama Seda Suave', 'pijama-seda-suave', 'Pijama en tela de seda premium, ideal para dormir con estilo', 65000, 12, 'https://via.placeholder.com/500x500?text=Pijama+Seda'),
(1, 'Liguero Elegante', 'liguero-elegante', 'Liguero ajustable en tela elástica, detalles de encaje premium', 35000, 20, 'https://via.placeholder.com/500x500?text=Liguero+Elegante'),

-- Smart Pleasure (category_id = 2)
(2, 'Vibrador Recargable Silicona', 'vibrador-recargable-silicona', 'Vibrador en silicona de grado médico, recargable USB, 10 modos de vibración', 120000, 8, 'https://via.placeholder.com/500x500?text=Vibrador+Smart'),
(2, 'Huevo Vibrador Controlado', 'huevo-vibrador-controlado', 'Huevo vibrador con control remoto inalámbrico, discreto y silencioso', 85000, 10, 'https://via.placeholder.com/500x500?text=Huevo+Vibrador'),
(2, 'Estimulador Inteligente', 'estimulador-inteligente', 'Estimulador inteligente con sensores de temperatura, conectividad Bluetooth', 180000, 5, 'https://via.placeholder.com/500x500?text=Estimulador+Inteligente'),

-- Lub & Care (category_id = 3)
(3, 'Lubricante Base Agua Premium', 'lubricante-base-agua-premium', 'Lubricante de alta calidad base agua, hipoalergénico, seguro para juguetes', 28000, 30, 'https://via.placeholder.com/500x500?text=Lubricante+Premium'),
(3, 'Gel Limpiador Íntimo', 'gel-limpiador-intimo', 'Gel limpiador específico para juguetes y cuidado íntimo, pH equilibrado', 22000, 25, 'https://via.placeholder.com/500x500?text=Gel+Limpiador'),
(3, 'Toallitas Refrescantes', 'toallitas-refrescantes', 'Toallitas íntimas refrescantes, empaques discretos de 10 unidades', 18000, 40, 'https://via.placeholder.com/500x500?text=Toallitas+Refrescantes'),

-- Power Up (category_id = 4)
(4, 'Vibrador Potente Recargable', 'vibrador-potente-recargable', 'Vibrador de alto rendimiento, batería de larga duración, 12 modos', 150000, 7, 'https://via.placeholder.com/500x500?text=Vibrador+Potente'),
(4, 'Bomba de Vacío Premium', 'bomba-de-vacio-premium', 'Bomba de vacío con control de intensidad, material premium duradero', 95000, 6, 'https://via.placeholder.com/500x500?text=Bomba+Vacio'),
(4, 'Máquina de Amor Compacta', 'maquina-amor-compacta', 'Máquina de amor tamaño compacto, 8 velocidades, silenciosa y potente', 220000, 4, 'https://via.placeholder.com/500x500?text=Maquina+Amor'),

-- Zona Fetish (category_id = 5)
(5, 'Set de Esposas Suave', 'set-esposas-suave', 'Set de esposas acolchadas, material suave, ajustable y seguro', 55000, 9, 'https://via.placeholder.com/500x500?text=Esposas+Suave'),
(5, 'Antifaz de Seda Negra', 'antifaz-seda-negra', 'Antifaz en seda pura, bloquea completamente la luz, cómodo para dormir', 32000, 18, 'https://via.placeholder.com/500x500?text=Antifaz+Seda'),
(5, 'Kit Exploración BDSM Principiante', 'kit-exploracion-bdsm', 'Kit completo para principiantes, incluye varios accesorios de calidad', 130000, 5, 'https://via.placeholder.com/500x500?text=Kit+BDSM')
ON CONFLICT (slug) DO NOTHING;
