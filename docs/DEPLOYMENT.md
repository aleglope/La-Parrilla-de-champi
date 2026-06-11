# 🚀 Guía de Despliegue - La Parrilla de Champi

Esta guía te llevará paso a paso para desplegar tu web en producción.

---

## 📋 Pre-requisitos

- Cuenta en [Supabase](https://supabase.com) (gratis)
- Cuenta en [Vercel](https://vercel.com) (gratis)
- Node.js 20+ y pnpm 10+ instalados localmente

---

## 1️⃣ Configurar Supabase

### Crear proyecto

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto:
   - **Nombre**: la-parrilla-champi
   - **Database Password**: Guarda esta contraseña de forma segura
   - **Region**: Elige la más cercana a tu ubicación

### Aplicar las migraciones de base de datos

1. Las migraciones viven en `supabase/migrations/` (numeradas, se aplican en orden)
2. Opción A — Supabase CLI: vincula el proyecto (`supabase link`) y ejecuta `supabase db push`
3. Opción B — SQL Editor: pega y ejecuta cada archivo de `supabase/migrations/` en orden, uno por uno
4. Verifica que se crearon las tablas `categories`, `dishes`, `reservations` y `time_slots`

### Obtener credenciales

1. Ve a **Settings** → **API**
2. Copia estos valores:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Mantén esto secreto)

---

## 2️⃣ Configurar Variables de Entorno

### Para desarrollo local

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env.local
```

2. Edita `.env.local` con tus credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Credenciales del admin (cámbialas)
ADMIN_EMAIL=admin@laparrilla.com
ADMIN_PASSWORD=TuPasswordSeguro123!
```

---

## 3️⃣ Probar Localmente

### Instalar dependencias

```bash
pnpm install
```

### Ejecutar en modo desarrollo

```bash
pnpm dev
```

### Verificar funcionamiento

1. Abre http://localhost:3000
2. Verifica que carguen las animaciones
3. Ve a http://localhost:3000/menu y verifica que carguen los platos
4. Ve a http://localhost:3000/admin/login y prueba el login con tus credenciales

---

## 4️⃣ Desplegar en Vercel

### Método 1: Deploy desde CLI

```bash
# Instalar Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Método 2: Deploy desde GitHub (Recomendado)

1. Sube tu código a GitHub:
```bash
git init
git add .
git commit -m "Initial commit - La Parrilla de Champi"
git branch -M main
git remote add origin https://github.com/tu-usuario/la-parrilla-champi.git
git push -u origin main
```

2. Ve a [vercel.com/new](https://vercel.com/new)
3. Importa tu repositorio de GitHub
4. Configura las variables de entorno:
   - Agrega las mismas variables de `.env.local`
   - **⚠️ IMPORTANTE**: Cambia `ADMIN_PASSWORD` por algo seguro

5. Haz clic en **Deploy**

---

## 5️⃣ Configurar Dominio Personalizado (Opcional)

### En Vercel

1. Ve a tu proyecto en Vercel
2. **Settings** → **Domains**
3. Agrega tu dominio (ej: `laparrillachampi.com`)
4. Sigue las instrucciones para configurar los DNS

### SSL Automático

Vercel configura automáticamente HTTPS. ¡No necesitas hacer nada!

---

## 6️⃣ Generar Código QR para el Menú

### Herramientas recomendadas

- [QR Code Generator](https://www.qr-code-generator.com/)
- [QR Code Monkey](https://www.qrcode-monkey.com/)

### URL del menú

```
https://tu-dominio.vercel.app/menu
```

### Consejos para el QR

- **Tamaño**: Mínimo 5x5 cm para imprimir
- **Formato**: PNG o SVG (mejor calidad)
- **Corrección de errores**: Nivel H (máximo)
- **Personalización**: Agrega tu logo en el centro

### Dónde colocarlo

- En cada mesa (plastificado)
- En la entrada del restaurante
- En las redes sociales
- En la carta física

---

## 7️⃣ Optimizaciones Post-Deploy

### Verificar Performance

1. Ve a [PageSpeed Insights](https://pagespeed.web.dev/)
2. Analiza tu URL
3. Verifica que obtienes:
   - **Performance**: >90
   - **SEO**: >95
   - **Accessibility**: >90

### Configurar Analytics (Opcional)

```bash
# Instalar Vercel Analytics
pnpm add @vercel/analytics
```

Agrega en `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

// Dentro del return
<Analytics />
```

---

## 8️⃣ Mantenimiento

### Actualizar el menú

1. Accede a `https://tu-dominio.vercel.app/admin`
2. Login con tus credenciales
3. Gestiona platos y categorías
4. Los cambios se reflejan automáticamente en el menú público (60s máximo por ISR)

### Backups de Supabase

Supabase hace backups automáticos diarios en el plan gratuito. Para descargar:
1. **Database** → **Backups** → **Download**

### Monitoreo de Vercel

- **Analytics**: Visitas y rendimiento
- **Logs**: Errores en tiempo real
- **Speed Insights**: Métricas de velocidad

---

## 🔧 Solución de Problemas

### Las partículas no aparecen en móvil

✅ **Normal**: Se desactivan automáticamente en dispositivos de bajo rendimiento.

### El menú no se actualiza tras cambios en admin

1. Espera 60 segundos (ISR cache)
2. Recarga la página con Ctrl+F5
3. Verifica que se llamó a `/api/revalidate`

### Error 500 en Supabase

1. Verifica las credenciales en variables de entorno
2. Comprueba que las tablas existen en Supabase
3. Revisa los logs en Vercel

### Problemas de autenticación admin

1. Verifica `ADMIN_EMAIL` y `ADMIN_PASSWORD` en Vercel
2. Limpia cookies del navegador
3. Prueba en ventana de incógnito

---

## 📊 Capacidad y Escalabilidad

### Plan Gratuito de Vercel

- **Bandwidth**: 100 GB/mes
- **Invocaciones**: 100,000/día
- **Edge Requests**: Ilimitados

**Capacidad estimada**: 50,000+ visitas/mes sin problemas

### Plan Gratuito de Supabase

- **Database**: 500 MB
- **Storage**: 1 GB
- **Bandwidth**: 2 GB

**Capacidad estimada**: 10,000+ platos con imágenes

### ¿Cuántos usuarios simultáneos soporta?

Con la configuración actual (SSG + CDN):
- **50 usuarios**: ✅ Sin problemas
- **500 usuarios**: ✅ Funciona perfectamente
- **5,000+ usuarios**: ✅ Vercel escala automáticamente

---

## 🎉 ¡Listo!

Tu web está online y lista para recibir clientes. 

### Próximos pasos sugeridos

- [ ] Imprimir códigos QR
- [ ] Configurar Google Analytics
- [ ] Subir imágenes reales de tus platos
- [ ] Configurar dominio personalizado
- [ ] Promocionar en redes sociales

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Vercel Dashboard
2. Consulta la [documentación de Next.js](https://nextjs.org/docs)
3. Revisa la [documentación de Supabase](https://supabase.com/docs)

---

**¡Que pasa gentuza! 🔥**

Desarrollado con pasión para La Parrilla de Champi.

