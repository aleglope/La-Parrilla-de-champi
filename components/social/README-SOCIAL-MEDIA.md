# Componente de Redes Sociales

Este componente muestra una tarjeta interactiva con los enlaces a las redes sociales de "La Parrilla de Champi".

## Características

✨ **Diseño Adaptativo**: Funciona perfectamente en todos los dispositivos (móviles, tablets y escritorio)
🎨 **Colores de Marca**: Utiliza la paleta de colores oficial de La Parrilla de Champi
📱 **Interactivo en Móviles**: En dispositivos móviles y tablets, la tarjeta requiere un toque para expandirse
🌐 **Multiidioma**: Soporta español y gallego usando el sistema de traducciones
✨ **Animaciones Fluidas**: Animaciones suaves y profesionales con Framer Motion

## Personalización de Enlaces

Para cambiar las URLs de las redes sociales, edita el archivo:

**`components/social/SocialMediaCard.tsx`**

Busca la sección `socialLinks` y actualiza los enlaces:

```typescript
const socialLinks: SocialLink[] = [
  {
    name: 'Instagram Principal',
    href: 'https://www.instagram.com/laparrilladechampi/', // Instagram principal de La Parrilla
    // ...
  },
  {
    name: 'Instagram Champi Muros',
    href: 'https://www.instagram.com/champimuros/', // Instagram secundario
    // ...
  },
  {
    name: 'Twitter/X',
    href: 'https://twitter.com/TU_USUARIO', // ⬅️ Pendiente de actualizar
    // ...
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com/TU_PAGINA', // ⬅️ Cambia esto
    // ...
  },
];
```

## Añadir o Eliminar Redes Sociales

### Para Añadir una Red Social:

1. Ve al archivo `components/social/SocialMediaCard.tsx`
2. Añade un nuevo objeto al array `socialLinks`:

```typescript
{
  name: 'TikTok',
  href: 'https://tiktok.com/@tu_usuario',
  icon: (
    // SVG del icono de TikTok
  ),
  gradient: 'from-[#000000] to-[#fe2c55]',
  delay: 0.8, // Incrementa el delay para cada nuevo botón
}
```

### Para Eliminar una Red Social:

Simplemente elimina el objeto correspondiente del array `socialLinks`.

## Colores Utilizados

El componente usa los colores oficiales de la marca:

- 🔥 **Fire Red**: `#C01F19` - Color principal de fuego
- 💙 **Flame Blue**: `#314A78` - Azul llama
- 💎 **Bright Blue**: `#1789C0` - Azul brillante
- ⚫ **Charcoal**: `#283435` - Gris carbón

## Ubicación en la Página

El componente está integrado en la página principal (`app/page.tsx`) justo antes del Footer:

```tsx
{/* Social Media Section */}
<section id="social" className="relative z-10 py-8 md:py-12">
  <div className="container-custom">
    <SocialMediaCard />
  </div>
</section>
```

## Comportamiento por Dispositivo

### 🖥️ **Escritorio (>1024px)**
- La tarjeta inicia colapsada mostrando solo "Síguenos" en el centro
- **Al hacer hover** sobre la tarjeta:
  - El texto "Síguenos" se mueve sutilmente hacia arriba
  - Los botones de redes sociales aparecen con animación en cascada
  - La tarjeta hace un ligero zoom (scale 1.02)
- Al quitar el hover, todo vuelve a su estado inicial
- Hover sobre cada botón muestra su gradiente característico

### 📱 **Móvil y Tablet (<1024px)**
- La tarjeta inicia colapsada mostrando solo "Síguenos"
- Al tocar la tarjeta, se expande mostrando los botones con animación
- Indicador "Toca aquí" parpadeante cuando está colapsada
- Al tocar de nuevo, se colapsa y vuelve al estado inicial

## Traducciones

Para cambiar los textos, edita el archivo:

**`lib/i18n/translations.ts`**

```typescript
social: {
  title: 'Síguenos',      // Título principal
  tapHere: 'Toca aquí',   // Indicador móvil
  instagram: 'Instagram',
  twitter: 'Twitter',
  facebook: 'Facebook'
},
```

## Iconos de Redes Sociales

Los iconos están incluidos como SVG inline para mejor rendimiento. Si necesitas cambiar un icono:

1. Ve a [heroicons.com](https://heroicons.com) o [simpleicons.org](https://simpleicons.org)
2. Copia el código SVG
3. Reemplaza el contenido del campo `icon` en el objeto correspondiente

---

**Desarrollado para La Parrilla de Champi** 🔥

