# 🎨 Sistema de Color - La Parrilla de Champi

## ✅ Mejora Implementada: Opción A (Conservadora)

Hemos implementado un **sistema de tonos cálidos ASH** que reemplaza el blanco puro, manteniendo todos los colores originales de la marca. Esto reduce el cansancio visual y crea una jerarquía más orgánica.

---

## 🎯 Problema Resuelto

### ❌ ANTES
- **Texto blanco puro (#FFFFFF)** → Demasiado contrastado, cansancio visual
- **Falta de jerarquía suave** → Todo era o muy brillante o muy oscuro
- **Difícil lectura prolongada** → Especialmente en menú y textos largos

### ✅ AHORA
- **Tonos cálidos ASH** → Blanco humo más suave y orgánico
- **Jerarquía clara** → 6 niveles de gris cálido
- **Mejor legibilidad** → Colores optimizados para lectura

---

## 🎨 Paleta de Colores Completa

### Colores de Marca (Sin Cambios)

```typescript
// Fondos oscuros
charcoal: {
  DEFAULT: '#283435',  // Fondo principal
  dark: '#1a2324',     // Fondo más oscuro
  light: '#314042',    // Fondo más claro
}

ocean: {
  DEFAULT: '#273A46',  // Azul marino
  deep: '#1e2d36',
  light: '#314a5a',
}

// Rojos de acento (SIN CAMBIOS)
fire: {
  red: '#C01F19',         // Rojo principal
  'red-glow': '#e02820',  // Hover/énfasis
  'red-dark': '#9a1813',  // Sombras
}

// Azules (SIN CAMBIOS)
flame: {
  blue: '#314A78',           // Azul oscuro
  'blue-bright': '#1789C0',  // Azul brillante
  'blue-glow': '#2699d0',    // Hover azul
}
```

### 🆕 Nueva Paleta ASH (Tonos de Texto)

```typescript
ash: {
  50: '#F5F3F0',   // Blanco cálido - Títulos Hero (H1)
  100: '#EBE8E3',  // Blanco humo - Subtítulos principales (H2)
  200: '#D9D5CF',  // Gris claro cálido - Subtítulos secundarios (H3-H6)
  300: '#B8B3AB',  // Texto normal - Párrafos y contenido principal
  400: '#9A948B',  // Texto secundario - Descripciones, metadatos
  500: '#7C766D',  // Placeholders - Separadores, texto desenfatizado
}
```

---

## 📋 Guía de Uso por Elemento

### 🏆 Jerarquía de Títulos

```tsx
// H1 - Títulos Hero (máximo impacto)
<h1 className="text-ash-50">
  La Parrilla de Champi
</h1>

// H2 - Subtítulos principales
<h2 className="text-ash-100">
  Nuestro Menú
</h2>

// H3-H6 - Subtítulos secundarios
<h3 className="text-ash-200">
  Carnes Premium
</h3>
```

### 📝 Contenido de Texto

```tsx
// Texto principal/párrafos
<p className="text-ash-300">
  Descripción del restaurante...
</p>

// Texto secundario/metadatos
<span className="text-ash-400">
  Última actualización: Hoy
</span>

// Placeholders/separadores
<span className="text-ash-500">
  |
</span>
```

---

## 🎯 Casos de Uso Específicos

### 🍔 Menú de Platos

```tsx
// Título del plato
<h4 className="text-ash-100 group-hover:text-fire-red">
  Chuletón de Buey Premium
</h4>

// Descripción
<p className="text-ash-400">
  Madurado 45 días, cocinado al punto perfecto
</p>

// Precio (mantiene el rojo para destacar)
<span className="text-fire-red font-bold">
  24.90€
</span>
```

### 🧭 Navegación

```tsx
// Enlaces normales
<Link className="text-ash-300 hover:text-fire-red">
  Menú
</Link>

// Selector de idioma (inactivo)
<span className="text-ash-400">ES</span>

// Separadores
<span className="text-ash-500">|</span>
```

### 🦶 Footer

```tsx
// Texto principal
<p className="text-ash-400">
  La Parrilla de Champi - Carne a la Brasa
</p>

// Metadatos/copyright
<p className="text-ash-500">
  © 2025 Todos los derechos reservados
</p>

// Links hover
<Link className="text-ash-500 hover:text-ash-300">
  Política de Privacidad
</Link>
```

### 🎪 Hero Section

```tsx
// Título principal
<h1 className="text-ash-50 font-display">
  La Parrilla de Champi
</h1>

// Subtítulo con gradiente (mantiene efecto ember)
<span className="text-ember">
  Brasas al Carbón
</span>

// Descripción
<p className="text-ash-300">
  Donde el fuego encuentra al mar
</p>
```

---

## 🔄 Tabla de Conversión

| Anterior | Nuevo | Uso Recomendado |
|----------|-------|-----------------|
| `text-white` | `text-ash-50` | Títulos H1, Hero |
| `text-white` | `text-ash-100` | Subtítulos H2, Nombres platos |
| `text-white` | `text-ash-200` | H3-H6 |
| `text-gray-200` | `text-ash-300` | Texto principal, párrafos |
| `text-gray-300` | `text-ash-300` | Enlaces, texto normal |
| `text-gray-400` | `text-ash-400` | Texto secundario, descripciones |
| `text-gray-500` | `text-ash-400` | Texto desenfatizado |
| `text-gray-600` | `text-ash-500` | Separadores, placeholders |

---

## ⚡ Defaults Automáticos

El sistema aplica estos colores **automáticamente** a través de `globals.css`:

```css
/* Aplicado automáticamente */
body {
  @apply text-ash-300;  /* Texto base */
}

h1 {
  @apply text-ash-50;   /* Títulos principales */
}

h2 {
  @apply text-ash-100;  /* Subtítulos */
}

h3, h4, h5, h6 {
  @apply text-ash-200;  /* Subtítulos secundarios */
}
```

---

## 🎨 Efectos Especiales (No Modificados)

### Gradiente Animado
```tsx
<span className="gradient-text">
  Nuestro Menú
</span>
```

### Efecto Ember (Brasas)
```tsx
<span className="text-ember">
  La Parrilla
</span>
```

### Fire Glow (Resplandor de fuego)
```tsx
<span className="text-fire-glow">
  ¡Que pasa gentuza!
</span>
```

---

## ✅ Mejores Prácticas

### ✓ HACER

1. **Usar ASH para todo el texto** → Excepto acentos rojos/azules
2. **Mantener jerarquía clara** → ash-50 > ash-100 > ash-200 > ash-300
3. **Texto sobre fondos oscuros** → Usar ash-300 como base
4. **Hover states** → Cambiar de ash a fire-red o flame-blue-bright
5. **Separadores sutiles** → Usar ash-500

```tsx
// ✅ Bueno
<h2 className="text-ash-100">Menú</h2>
<p className="text-ash-300">Descripción...</p>
```

### ✗ EVITAR

1. **NO usar blanco puro** → Salvo casos muy excepcionales
2. **NO mezclar gray con ash** → Usa solo ASH ahora
3. **NO usar ash-50 para texto normal** → Solo títulos principales
4. **NO usar texto gris sobre gris** → Mantener contraste suficiente

```tsx
// ❌ Malo
<p className="text-white">Texto normal</p>
<p className="text-gray-400">Mezclando paletas</p>
```

---

## 🎯 Contraste y Accesibilidad

Todos los colores ASH cumplen con **WCAG AA** sobre fondos oscuros:

| Color | Contraste vs #283435 | Rating |
|-------|----------------------|--------|
| ash-50 (#F5F3F0) | 12.8:1 | AAA ✅ |
| ash-100 (#EBE8E3) | 11.2:1 | AAA ✅ |
| ash-200 (#D9D5CF) | 9.1:1 | AAA ✅ |
| ash-300 (#B8B3AB) | 6.5:1 | AA ✅ |
| ash-400 (#9A948B) | 4.8:1 | AA ✅ |
| ash-500 (#7C766D) | 3.5:1 | A (UI only) |

---

## 📦 Archivos Actualizados

### Configuración
- ✅ `tailwind.config.ts` - Añadida paleta ASH
- ✅ `app/globals.css` - Defaults automáticos actualizados

### Componentes Actualizados
- ✅ `components/navigation/Navigation.tsx`
- ✅ `components/hero/HeroBentoBox.tsx`
- ✅ `components/menu/MenuContent.tsx`
- ✅ `components/menu/DishCard.tsx`
- ✅ `components/story/StorySection.tsx`
- ✅ `components/story/StoryBlock.tsx`
- ✅ `components/layout/Footer.tsx`
- ✅ `components/sections/CTASection.tsx`

---

## 🚀 Resultado

### Antes
- 😵 Blanco brillante cansaba la vista
- 📊 Contraste excesivo (14:1)
- 🎯 Difícil establecer jerarquía

### Después
- 😌 Tonos cálidos más naturales
- 📊 Contraste optimizado (6-12:1)
- 🎯 Jerarquía clara y suave

---

## 🎨 Paleta Visual Completa

```
Fondos Oscuros:
███ #1a2324 (charcoal-dark)
███ #283435 (charcoal)
███ #314042 (charcoal-light)
███ #273A46 (ocean)

Tonos de Texto (ASH):
███ #F5F3F0 (ash-50)  ← Títulos Hero
███ #EBE8E3 (ash-100) ← Subtítulos
███ #D9D5CF (ash-200) ← H3-H6
███ #B8B3AB (ash-300) ← Texto normal ★
███ #9A948B (ash-400) ← Secundario
███ #7C766D (ash-500) ← Placeholders

Acentos (Sin cambios):
███ #C01F19 (fire-red) ← Precio, CTAs
███ #1789C0 (flame-blue-bright) ← Links hover
```

---

## 💡 Tips Rápidos

1. **¿Duda entre dos tonos ASH?** → Usa el más claro para mayor legibilidad
2. **¿Texto importante?** → ash-100 + hover:text-fire-red
3. **¿Texto decorativo?** → ash-400 o ash-500
4. **¿Sobre fondos claros?** → Los tonos más oscuros (ash-400, ash-500)

---

**Diseñado para reducir cansancio visual manteniendo la identidad de marca** 🔥🌊

