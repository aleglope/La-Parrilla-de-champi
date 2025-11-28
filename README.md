# 🔥 La Parrilla de Champi - Web Inmersiva

Web moderna y minimalista para restaurante de carne a la brasa con experiencia mobile-first, animaciones complejas y dashboard de administración.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + Tailwind CSS
- **Animaciones**: Framer Motion + React Particles
- **Backend**: Supabase (Database + Auth)
- **Hosting**: Vercel (CDN optimizado para 50+ usuarios simultáneos)

## 🎨 Características Principales

- ✨ **Hero Bento Box**: Layout modular mobile-first con animaciones
- 🔥 **Sistema de Partículas**: Brasas flotantes y chispas reactivas al scroll
- 📱 **Menú Digital QR**: Carga instantánea (<1s) con SSG/ISR
- 🎭 **Scrollytelling**: Narrativa visual con animaciones al hacer scroll
- 🔐 **Dashboard Admin**: CRUD en tiempo real para gestión de menú
- ⚡ **Performance**: Optimizado para picos de tráfico

## 🛠️ Instalación

\`\`\`bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Edita .env.local con tus credenciales de Supabase

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
npm start
\`\`\`

## 🎨 Paleta de Colores

- **Charcoal**: #283435 (Fondo carbonizado)
- **Ocean Deep**: #273A46 (Fondo marino)
- **Fire Red**: #C01F19 (CTAs y énfasis)
- **Flame Blue**: #314A78 / #1789C0 (Detalles y partículas)

## 📱 Optimizaciones Móviles

- Detección automática de dispositivos antiguos
- Desactivación de partículas en modo ahorro de energía
- Imágenes optimizadas con AVIF/WebP
- Cache agresivo del menú digital

## 🔧 Estructura del Proyecto

\`\`\`
├── app/
│   ├── (home)/          # Landing page con hero y story
│   ├── menu/            # Menú digital (acceso QR)
│   ├── admin/           # Dashboard privado
│   └── api/             # API Routes
├── components/
│   ├── hero/            # Hero Bento Box
│   ├── particles/       # Sistema de partículas
│   ├── story/           # Scrollytelling sections
│   └── menu/            # Componentes del menú
├── lib/
│   ├── supabase/        # Cliente Supabase
│   └── utils/           # Utilidades
└── public/
    ├── textures/        # Texturas de fondo
    └── images/          # Assets optimizados
\`\`\`

## 📝 Configuración de Supabase

### Crear tablas:

\`\`\`sql
-- Tabla de categorías
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de platos
CREATE TABLE dishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_dishes_category ON dishes(category_id);
CREATE INDEX idx_dishes_available ON dishes(is_available);
\`\`\`

## 🚀 Deploy en Vercel

\`\`\`bash
# Conectar con Vercel CLI
vercel login
vercel link
vercel env pull

# Deploy
vercel --prod
\`\`\`

## 📖 Uso del Dashboard Admin

1. Accede a `/admin`
2. Login con credenciales (configuradas en .env.local)
3. Gestiona categorías y platos
4. Los cambios se reflejan instantáneamente en el menú público

## 💡 Slogan

**"¡Que pasa gentuza!"** - Tono atrevido, divertido y directo.

---

Desarrollado con 🔥 y pasión por la carne a la brasa.

