import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const seedProducts = async () => {
  try {
    console.log('🌱 Iniciando seed de productos...');

    // Obtener IDs de categorías
    const categoriesRes = await pool.query('SELECT id, slug FROM categories');
    const categories = {};
    categoriesRes.rows.forEach((cat) => {
      categories[cat.slug] = cat.id;
    });

    const products = [
      // Línea Íntima
      {
        category_slug: 'linea-intima',
        name: 'Conjunto Encaje Suave',
        slug: 'conjunto-encaje-suave',
        description: 'Conjunto de lencería en encaje suave y delicado, diseño elegante y cómodo',
        price: 45000,
        stock: 15,
        image: 'https://via.placeholder.com/500x500?text=Conjunto+Encaje',
      },
      {
        category_slug: 'linea-intima',
        name: 'Pijama Seda Suave',
        slug: 'pijama-seda-suave',
        description: 'Pijama en tela de seda premium, ideal para dormir con estilo',
        price: 65000,
        stock: 12,
        image: 'https://via.placeholder.com/500x500?text=Pijama+Seda',
      },
      {
        category_slug: 'linea-intima',
        name: 'Liguero Elegante',
        slug: 'liguero-elegante',
        description: 'Liguero ajustable en tela elástica, detalles de encaje premium',
        price: 35000,
        stock: 20,
        image: 'https://via.placeholder.com/500x500?text=Liguero+Elegante',
      },

      // Smart Pleasure
      {
        category_slug: 'smart-pleasure',
        name: 'Vibrador Recargable Silicona',
        slug: 'vibrador-recargable-silicona',
        description: 'Vibrador en silicona de grado médico, recargable USB, 10 modos de vibración',
        price: 120000,
        stock: 8,
        image: 'https://via.placeholder.com/500x500?text=Vibrador+Smart',
      },
      {
        category_slug: 'smart-pleasure',
        name: 'Huevo Vibrador Controlado',
        slug: 'huevo-vibrador-controlado',
        description: 'Huevo vibrador con control remoto inalámbrico, discreto y silencioso',
        price: 85000,
        stock: 10,
        image: 'https://via.placeholder.com/500x500?text=Huevo+Vibrador',
      },
      {
        category_slug: 'smart-pleasure',
        name: 'Estimulador Inteligente',
        slug: 'estimulador-inteligente',
        description: 'Estimulador inteligente con sensores de temperatura, conectividad Bluetooth',
        price: 180000,
        stock: 5,
        image: 'https://via.placeholder.com/500x500?text=Estimulador+Inteligente',
      },

      // Lub & Care
      {
        category_slug: 'lub-care',
        name: 'Lubricante Base Agua Premium',
        slug: 'lubricante-base-agua-premium',
        description: 'Lubricante de alta calidad base agua, hipoalergénico, seguro para juguetes',
        price: 28000,
        stock: 30,
        image: 'https://via.placeholder.com/500x500?text=Lubricante+Premium',
      },
      {
        category_slug: 'lub-care',
        name: 'Gel Limpiador Íntimo',
        slug: 'gel-limpiador-intimo',
        description: 'Gel limpiador específico para juguetes y cuidado íntimo, pH equilibrado',
        price: 22000,
        stock: 25,
        image: 'https://via.placeholder.com/500x500?text=Gel+Limpiador',
      },
      {
        category_slug: 'lub-care',
        name: 'Toallitas Refrescantes',
        slug: 'toallitas-refrescantes',
        description: 'Toallitas íntimas refrescantes, empaques discretos de 10 unidades',
        price: 18000,
        stock: 40,
        image: 'https://via.placeholder.com/500x500?text=Toallitas+Refrescantes',
      },

      // Power Up
      {
        category_slug: 'power-up',
        name: 'Vibrador Potente Recargable',
        slug: 'vibrador-potente-recargable',
        description: 'Vibrador de alto rendimiento, batería de larga duración, 12 modos',
        price: 150000,
        stock: 7,
        image: 'https://via.placeholder.com/500x500?text=Vibrador+Potente',
      },
      {
        category_slug: 'power-up',
        name: 'Bomba de Vacío Premium',
        slug: 'bomba-de-vacio-premium',
        description: 'Bomba de vacío con control de intensidad, material premium duradero',
        price: 95000,
        stock: 6,
        image: 'https://via.placeholder.com/500x500?text=Bomba+Vacio',
      },
      {
        category_slug: 'power-up',
        name: 'Máquina de Amor Compacta',
        slug: 'maquina-amor-compacta',
        description: 'Máquina de amor tamaño compacto, 8 velocidades, silenciosa y potente',
        price: 220000,
        stock: 4,
        image: 'https://via.placeholder.com/500x500?text=Maquina+Amor',
      },

      // Zona Fetish
      {
        category_slug: 'zona-fetish',
        name: 'Set de Esposas Suave',
        slug: 'set-esposas-suave',
        description: 'Set de esposas acolchadas, material suave, ajustable y seguro',
        price: 55000,
        stock: 9,
        image: 'https://via.placeholder.com/500x500?text=Esposas+Suave',
      },
      {
        category_slug: 'zona-fetish',
        name: 'Antifaz de Seda Negra',
        slug: 'antifaz-seda-negra',
        description: 'Antifaz en seda pura, bloquea completamente la luz, cómodo para dormir',
        price: 32000,
        stock: 18,
        image: 'https://via.placeholder.com/500x500?text=Antifaz+Seda',
      },
      {
        category_slug: 'zona-fetish',
        name: 'Kit Exploración BDSM Principiante',
        slug: 'kit-exploracion-bdsm',
        description: 'Kit completo para principiantes, incluye varios accesorios de calidad',
        price: 130000,
        stock: 5,
        image: 'https://via.placeholder.com/500x500?text=Kit+BDSM',
      },
    ];

    // Insertar productos
    let insertedCount = 0;
    for (const product of products) {
      const categoryId = categories[product.category_slug];
      if (!categoryId) {
        console.warn(`⚠️  Categoría no encontrada: ${product.category_slug}`);
        continue;
      }

      await pool.query(
        `INSERT INTO products (category_id, name, slug, description, price, stock, main_image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (slug) DO NOTHING`,
        [categoryId, product.name, product.slug, product.description, product.price, product.stock, product.image]
      );

      insertedCount++;
      console.log(`✅ Insertado: ${product.name}`);
    }

    console.log(`\n🌱 Seed completado: ${insertedCount} productos insertados`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

seedProducts();
