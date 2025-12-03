# Sistema de Tipografía - La Parrilla de Champi

## 🔥 Fuentes Implementadas

Hemos implementado un sistema de tres fuentes complementarias que reflejan el estilo dinámico de fuego y humo del restaurante:

### 1. **Bebas Neue** - Display Font
- **Uso:** Títulos principales, headers de hero, CTAs importantes
- **Variable CSS:** `--font-display`
- **Clase Tailwind:** `font-display`
- **Características:** Bold, condensada, impacto visual potente
- **Ideal para:** Títulos que necesitan captar atención inmediata

### 2. **Barlow Condensed** - Heading Font
- **Uso:** Subtítulos (h2-h6), navegación, nombres de platos, botones
- **Variable CSS:** `--font-heading`
- **Clase Tailwind:** `font-heading`
- **Pesos disponibles:** 400, 600, 700
- **Características:** Moderna, industrial, versátil
- **Ideal para:** Estructura y jerarquía visual

### 3. **Inter** - Body Font
- **Uso:** Texto corrido, descripciones, párrafos, footer
- **Variable CSS:** `--font-body`
- **Clase Tailwind:** `font-body`
- **Características:** Alta legibilidad, moderna, limpia
- **Ideal para:** Todo el contenido que requiere lectura prolongada

---

## 📐 Jerarquía Visual

```tsx
// Títulos Hero (máximo impacto)
<h1 className="font-display text-6xl">La Parrilla de Champi</h1>

// Subtítulos principales
<h2 className="font-heading text-4xl font-bold">Nuestra Historia</h2>

// Subtítulos secundarios
<h3 className="font-heading text-2xl font-semibold">Carbón Premium</h3>

// Texto corrido
<p className="font-body text-lg">Descripción del plato...</p>

// Botones y CTAs
<button className="font-heading font-bold">Ver Menú</button>
```

---

## 🎨 Aplicación por Componente

### Hero Section
```tsx
// Título principal - DISPLAY
<h1 className="font-display text-5xl md:text-7xl tracking-wider">
  
// Subtítulo - BODY
<p className="font-body text-xl">

// Slogan - HEADING
<p className="font-heading font-bold">
```

### Menú
```tsx
// Título de sección - DISPLAY
<h2 className="font-display text-4xl">

// Nombre de categoría - HEADING
<h3 className="font-heading font-bold text-2xl">

// Nombre de plato - HEADING
<h4 className="font-heading font-bold text-lg">

// Descripción - BODY
<p className="font-body text-sm">

// Precio - HEADING (para consistencia visual)
<span className="font-heading font-bold text-2xl">
```

### Navegación
```tsx
// Logo - DISPLAY
<h1 className="font-display">

// Enlaces de menú - BODY
<Link className="font-body">

// Botones - HEADING
<button className="font-heading font-bold">
```

### Footer
```tsx
// Todo usa BODY para legibilidad
<p className="font-body">
```

---

## 🔧 Configuración Técnica

### Variables CSS Globales
Definidas automáticamente por Next.js `next/font/google`:
```css
--font-display: 'Bebas Neue', sans-serif;
--font-heading: 'Barlow Condensed', sans-serif;
--font-body: 'Inter', sans-serif;
```

### Tailwind Config
```typescript
fontFamily: {
  sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
  display: ['var(--font-display)', 'Impact', 'sans-serif'],
  heading: ['var(--font-heading)', 'sans-serif'],
  body: ['var(--font-body)', 'system-ui', 'sans-serif'],
}
```

### Valores por Defecto
- **Body:** Todos los elementos heredan `font-body` por defecto
- **Headings (h1-h6):** Aplican automáticamente `font-heading`
- **Display:** Debe aplicarse manualmente con `font-display` donde sea necesario

---

## ✅ Mejores Prácticas

### ✓ Hacer
- Usar `font-display` en títulos principales (h1) y CTAs importantes
- Usar `font-heading` en subtítulos (h2-h6), nombres de platos, botones
- Usar `font-body` en todo el texto descriptivo
- Combinar con pesos de fuente: `font-bold`, `font-semibold`, `font-normal`
- Agregar `tracking-wider` a `font-display` para mejorar legibilidad

### ✗ Evitar
- Mezclar `font-display` en párrafos largos (dificulta lectura)
- Usar `font-body` en títulos que necesiten impacto
- Olvidar especificar pesos de fuente cuando uses `font-heading`
- Usar tamaños de fuente muy pequeños con `font-display`

---

## 🎯 Ejemplos Prácticos

### Card de Plato
```tsx
<div className="glass-card">
  <h4 className="font-heading font-bold text-lg text-white">
    Chuletón Premium
  </h4>
  <p className="font-body text-sm text-gray-400">
    Selección especial de carne madurada, cocinada al punto perfecto
  </p>
  <span className="font-heading font-bold text-2xl text-fire-red">
    24.90€
  </span>
</div>
```

### Hero Principal
```tsx
<div>
  <h1 className="font-display text-7xl tracking-wider text-white">
    La Parrilla de Champi
  </h1>
  <p className="font-body text-xl text-gray-200">
    Donde el fuego encuentra al mar
  </p>
  <button className="font-heading font-bold text-base">
    Ver Carta
  </button>
</div>
```

### Sección de Historia
```tsx
<section>
  <h2 className="font-display text-6xl gradient-text">
    Nuestra Historia
  </h2>
  <h3 className="font-heading font-bold text-4xl">
    El Fuego que nos une
  </h3>
  <p className="font-body text-xl leading-relaxed">
    Más de 20 años cocinando con pasión...
  </p>
</section>
```

---

## 🚀 Optimizaciones Aplicadas

1. **Font Display Swap:** Todas las fuentes usan `display: 'swap'` para evitar FOIT
2. **Preconnect:** Headers optimizados para Google Fonts
3. **Variable Fonts:** Next.js optimiza automáticamente la carga
4. **Subsets:** Solo cargamos el subset 'latin' necesario
5. **CSS Variables:** Permite cambios globales fáciles

---

## 📱 Responsive

Las fuentes se ajustan bien en todos los dispositivos. Recomendaciones:

```tsx
// Mobile first approach
<h1 className="font-display text-4xl md:text-6xl lg:text-7xl">

<p className="font-body text-base md:text-lg lg:text-xl">
```

---

## 🎨 Combinación con Efectos

### Text Gradient
```tsx
<h1 className="font-display gradient-text">
  Título con efecto degradado
</h1>
```

### Fire Glow
```tsx
<span className="font-display text-fire-glow">
  ¡Que pasa gentuza!
</span>
```

### Ember Effect
```tsx
<span className="font-display text-ember">
  Brasas al Carbón
</span>
```

---

## 🔍 Testing

Para probar las fuentes en desarrollo:
1. Verifica que todas las fuentes se carguen correctamente
2. Revisa la jerarquía visual en diferentes viewports
3. Asegúrate de que los textos largos usan `font-body`
4. Comprueba que los CTAs destacan con `font-display` o `font-heading bold`

---

**Diseñado para complementar el estilo de fuego 🔥 y humo del restaurante**

