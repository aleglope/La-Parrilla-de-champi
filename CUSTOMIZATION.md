# 🎨 Guía de Personalización

Esta guía te ayudará a personalizar la web según tus necesidades.

---

## 🎨 Colores de Marca

Los colores se definen en `tailwind.config.ts`:

```typescript
colors: {
  charcoal: {
    DEFAULT: '#283435',  // Fondo principal
    dark: '#1a2324',     // Fondo más oscuro
    light: '#314042',    // Fondo más claro
  },
  ocean: {
    DEFAULT: '#273A46',  // Azul marino
    deep: '#1e2d36',
    light: '#314a5a',
  },
  fire: {
    red: '#C01F19',      // Rojo fuego principal
    'red-glow': '#e02820',
    'red-dark': '#9a1813',
  },
  flame: {
    blue: '#314A78',     // Azul llama
    'blue-bright': '#1789C0',
    'blue-glow': '#2699d0',
  },
}
```

### Cambiar el color principal (Rojo Fuego)

Busca y reemplaza `#C01F19` por tu color en `tailwind.config.ts`.

### Cambiar el color secundario (Azul Llama)

Busca y reemplaza `#1789C0` por tu color.

---

## 📝 Textos y Contenidos

### Slogan principal

**Archivo**: `components/hero/HeroBentoBox.tsx`

```tsx
// Línea ~60
<p className="text-fire-red font-bold text-lg md:text-xl">
  ¡Que pasa gentuza! 🔥
</p>
```

### Título del restaurante

**Archivo**: `components/hero/HeroBentoBox.tsx`

```tsx
// Línea ~52
<h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
  <span className="text-ember">La Parrilla</span>
  <br />
  <span className="text-white">de Champi</span>
</h1>
```

### Historia del restaurante

**Archivo**: `components/story/StorySection.tsx`

Modifica el array `storyBlocks` (~21-50) con tu historia:

```tsx
const storyBlocks = [
  {
    title: 'Tu título',
    content: 'Tu historia aquí...',
    icon: '🔥', // Emoji que quieras
    gradient: 'from-fire-red/20 to-transparent',
  },
  // ... más bloques
];
```

---

## 🖼️ Imágenes y Assets

### Logo del restaurante

**Archivo**: `components/hero/AnimatedLogo.tsx`

Reemplaza el emoji por tu logo:

```tsx
// Línea ~35
<span className="text-6xl md:text-7xl">
  🔥  {/* Cambia esto por una imagen */}
</span>

// O usa una imagen:
<Image src="/logo.png" alt="Logo" width={80} height={80} />
```

### Video de fondo (Hero)

**Archivo**: `components/hero/VideoBlock.tsx`

Actualiza las rutas del video (~34):

```tsx
<source src="/videos/tu-video.mp4" type="video/mp4" />
<source src="/videos/tu-video.webm" type="video/webm" />
```

### Imagen de fondo

**Archivo**: `tailwind.config.ts`

```typescript
backgroundImage: {
  'charcoal-texture': "url('/textures/tu-textura.jpg')",
}
```

---

## 🎭 Animaciones

### Desactivar partículas globalmente

**Archivo**: `app/page.tsx`

Comenta o elimina la línea ~11:

```tsx
{/* <ParticleSystem /> */}
```

### Velocidad de las animaciones

**Archivo**: `tailwind.config.ts`

Modifica los keyframes (~73-96):

```typescript
animation: {
  'ember-float': 'emberFloat 8s ease-in-out infinite', // Cambia 8s
  'scale-pulse': 'scalePulse 3s ease-in-out infinite', // Cambia 3s
}
```

### Efecto de scroll en Hero

**Archivo**: `components/hero/HeroBentoBox.tsx`

Ajusta el scale en línea ~22:

```typescript
const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]); // [inicial, final]
const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);
```

---

## 🍽️ Menú Digital

### Número de platos por fila

**Archivo**: `components/menu/MenuContent.tsx`

Línea ~53, cambia las clases de grid:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 col móvil, 2 tablet, 3 desktop */}
  {/* Para 4 columnas en desktop: lg:grid-cols-4 */}
</div>
```

### Tiempo de revalidación (ISR)

**Archivo**: `app/menu/page.tsx`

Línea ~11, cambia el tiempo:

```typescript
export const revalidate = 60; // Segundos (60 = 1 minuto)
// Para actualizaciones más rápidas: 30
// Para mejor cache: 300 (5 minutos)
```

### Mostrar platos agotados

**Archivo**: `components/menu/MenuContent.tsx`

Línea ~21, elimina el filtro de disponibilidad:

```typescript
// Antes:
const filteredDishes = selectedCategory
  ? dishes.filter(dish => dish.category_id === selectedCategory && dish.is_available)
  : dishes.filter(dish => dish.is_available);

// Después (muestra todos):
const filteredDishes = selectedCategory
  ? dishes.filter(dish => dish.category_id === selectedCategory)
  : dishes;
```

---

## 🔐 Seguridad del Admin

### Cambiar credenciales

**Método 1**: Variables de entorno (Recomendado)

En Vercel Dashboard → Settings → Environment Variables:
```
ADMIN_EMAIL=tu-email@ejemplo.com
ADMIN_PASSWORD=TuPasswordSeguro123!
```

**Método 2**: Archivo `.env.local`

```env
ADMIN_EMAIL=tu-email@ejemplo.com
ADMIN_PASSWORD=TuPasswordSeguro123!
```

### Cambiar duración de sesión

**Archivo**: `app/api/admin/login/route.ts`

Línea ~23, ajusta maxAge:

```typescript
maxAge: 60 * 60 * 24 * 7, // Segundos (7 días)
// Para 24 horas: 60 * 60 * 24
// Para 1 hora: 60 * 60
```

---

## 📱 Diseño Responsive

### Breakpoints personalizados

**Archivo**: `tailwind.config.ts`

Agrega en `theme.extend`:

```typescript
screens: {
  'xs': '475px',
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}
```

Úsalo en componentes:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

---

## 🌐 SEO y Metadatos

### Título y descripción

**Archivo**: `app/layout.tsx`

Línea ~8-20:

```typescript
export const metadata: Metadata = {
  title: "Tu Restaurante | Descripción",
  description: "Tu descripción aquí...",
  keywords: "palabras, clave, separadas, por, comas",
  // ...
};
```

### Open Graph (Redes Sociales)

Mismo archivo:

```typescript
openGraph: {
  title: "Tu Restaurante",
  description: "Tu descripción",
  images: ['/og-image.jpg'], // Imagen 1200x630px
  type: "website",
  locale: "es_ES",
},
```

---

## 🚀 Performance

### Reducir cantidad de partículas

**Archivo**: `components/particles/ParticleSystem.tsx`

Línea ~102:

```typescript
number: {
  value: 50, // Reduce a 25 o menos para mejor performance
  limit: 100,
}
```

### Optimizar imágenes automáticamente

Ya configurado en `next.config.mjs`, pero puedes ajustar:

```javascript
images: {
  formats: ['image/avif', 'image/webp'], // AVIF es más ligero
  deviceSizes: [640, 750, 828, 1080, 1200], // Tamaños generados
}
```

---

## 🎵 Sonidos (Opcional)

Para agregar sonido al hacer hover en botones:

**Archivo**: `components/hero/HeroBentoBox.tsx`

```tsx
const playSound = () => {
  const audio = new Audio('/sounds/hover.mp3');
  audio.play();
};

<button 
  onMouseEnter={playSound}
  className="btn-fire"
>
  Ver Carta
</button>
```

---

## 📧 Formulario de Contacto (Extensión)

Para agregar un formulario:

1. Crea `components/forms/ContactForm.tsx`
2. Usa [Resend](https://resend.com) o [EmailJS](https://www.emailjs.com/)
3. Agrega a la página principal

---

## 🔔 Notificaciones Push (Avanzado)

Para notificar ofertas especiales:

1. Instala: `npm install web-push`
2. Configura Service Worker
3. Integra con Firebase Cloud Messaging

Documentación: [web.dev/push-notifications](https://web.dev/push-notifications/)

---

## 💡 Tips Finales

- **Siempre prueba localmente** antes de deployar
- **Haz backups** de tu base de datos regularmente
- **Optimiza imágenes** antes de subirlas (usa TinyPNG)
- **Monitorea el rendimiento** con Vercel Analytics
- **Escucha a tus clientes** y mejora basándote en feedback

---

**¿Necesitas más personalización?**

Revisa la documentación oficial:
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

---

🔥 **¡Que pasa gentuza!**

