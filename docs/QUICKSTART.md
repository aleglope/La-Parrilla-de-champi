# 🚀 Quick Start - La Parrilla de Champi

Guía ultra-rápida para tener tu web funcionando en **5 minutos**.

---

## ⚡ Opción Rápida: Solo Ver el Proyecto

Si solo quieres ver cómo se ve sin configurar base de datos:

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo de entorno (temporal sin Supabase)
echo "NEXT_PUBLIC_SUPABASE_URL=https://demo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo
SUPABASE_SERVICE_ROLE_KEY=demo
ADMIN_EMAIL=admin@laparrilla.com
ADMIN_PASSWORD=admin123" > .env.local

# 3. Ejecutar
npm run dev

# 4. Abrir navegador
# http://localhost:3000
```

**⚠️ Nota**: El menú estará vacío sin Supabase. Para funcionalidad completa, sigue el setup completo.

---

## 🎯 Setup Completo en 5 Pasos

### 1️⃣ Instalar Dependencias (30 segundos)

```bash
npm install
```

### 2️⃣ Configurar Supabase (2 minutos)

1. Ve a [supabase.com](https://supabase.com) → Crear cuenta
2. Crea un proyecto nuevo
3. Aplica las migraciones de `supabase/migrations/` en orden: vía Supabase CLI (`supabase db push`) o pegando cada archivo en el **SQL Editor** → **Run**
4. Ve a **Settings** → **API** → Copia las 3 claves

### 3️⃣ Variables de Entorno (30 segundos)

```bash
# Copia el ejemplo
cp .env.example .env.local

# Edita .env.local con tus credenciales de Supabase
# (Usa nano, vim, o tu editor favorito)
nano .env.local
```

Pega tus claves:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
ADMIN_EMAIL=admin@laparrilla.com
ADMIN_PASSWORD=admin123
```

### 4️⃣ Ejecutar en Local (10 segundos)

```bash
npm run dev
```

### 5️⃣ Verificar (1 minuto)

✅ Abre: http://localhost:3000  
✅ Verifica animaciones y partículas  
✅ Ve al menú: http://localhost:3000/menu  
✅ Login admin: http://localhost:3000/admin/login  

---

## 🌐 Deploy a Producción (5 minutos)

### Vercel (Recomendado - Gratis)

```bash
# Opción 1: CLI
npm i -g vercel
vercel login
vercel --prod

# Opción 2: GitHub
# 1. Sube a GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main

# 2. Ve a vercel.com/new
# 3. Importa tu repo
# 4. Agrega las variables de entorno
# 5. Deploy!
```

### Configurar Variables en Vercel

Ve a: **Settings** → **Environment Variables**

Agrega las mismas 5 variables de `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

---

## 📱 Crear Código QR del Menú

### Opción 1: Online (Rápido)

1. Ve a [qr-code-generator.com](https://www.qr-code-generator.com/)
2. URL: `https://tu-dominio.vercel.app/menu`
3. Descarga PNG (mínimo 1000x1000px)
4. Imprime en A4 o plastifica para las mesas

### Opción 2: Con Logo (Profesional)

1. Ve a [qrcode-monkey.com](https://www.qrcode-monkey.com/)
2. URL: Tu menú
3. Sube tu logo en el centro
4. Colores: Usa #C01F19 (rojo fuego)
5. Descarga en alta calidad

---

## 🎨 Personalización Básica

### Cambiar Slogan

**Archivo**: `components/hero/HeroBentoBox.tsx` (línea ~60)

```tsx
¡Que pasa gentuza! 🔥
// Cámbialo por tu slogan
```

### Cambiar Colores

**Archivo**: `tailwind.config.ts`

```typescript
fire: {
  red: '#C01F19',  // Tu color principal
}
```

### Cambiar Nombre del Restaurante

**Archivo**: `components/hero/HeroBentoBox.tsx` (línea ~52)

```tsx
<span>La Parrilla</span>
<span>de Champi</span>
```

**Archivo**: `app/layout.tsx` (línea ~9)

```typescript
title: "Tu Restaurante | Carne a la Brasa",
```

---

## 🍽️ Agregar Platos

### Desde el Admin (Recomendado)

1. Ve a `/admin/login`
2. Login: `admin@laparrilla.com` / `admin123`
3. Click en "Crear Plato"
4. Rellena los campos
5. ¡Listo! Aparece automáticamente en el menú

### Desde Supabase (Directo)

1. Ve a Supabase → **Table Editor**
2. Tabla `dishes` → **Insert Row**
3. Rellena los campos manualmente
4. El menú se actualiza en <60 segundos

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev           # Inicia servidor en localhost:3000

# Producción
npm run build         # Compila para producción
npm start             # Ejecuta build de producción
npm run lint          # Verifica errores de código

# Vercel
vercel                # Deploy preview
vercel --prod         # Deploy a producción
vercel logs           # Ver logs en tiempo real
```

---

## 🐛 Solución Rápida de Problemas

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Error de Supabase"
- Verifica que las URLs y keys sean correctas
- Asegúrate de haber ejecutado el SQL
- Revisa que las tablas existan en Supabase

### "El menú no carga"
- Verifica que haya datos en la tabla `dishes`
- Revisa la consola del navegador (F12)
- Verifica las variables de entorno

### "Las partículas no se ven"
- Es normal en móviles antiguos (optimización)
- Revisa la consola: ¿hay mensaje de "bajo consumo"?
- Prueba en desktop con Chrome

### "El admin no deja entrar"
- Verifica `ADMIN_EMAIL` y `ADMIN_PASSWORD` en `.env.local`
- Limpia cookies del navegador
- Prueba en ventana de incógnito

---

## 📚 Recursos Adicionales

- **Guía de Deploy Completa**: `DEPLOYMENT.md`
- **Personalización Avanzada**: `CUSTOMIZATION.md`
- **Lista de Características**: `FEATURES.md`
- **README Principal**: `README.md`

---

## 💡 Próximos Pasos Sugeridos

Después del deploy:

- [ ] Cambiar `ADMIN_PASSWORD` por algo seguro
- [ ] Subir imágenes reales de tus platos a Supabase Storage
- [ ] Agregar todos tus platos y categorías
- [ ] Imprimir códigos QR para las mesas
- [ ] Configurar dominio personalizado en Vercel
- [ ] Agregar Google Analytics (opcional)
- [ ] Testear con 3-5 clientes reales
- [ ] Recoger feedback y ajustar

---

## 🆘 Ayuda

¿Problemas? Revisa:

1. **Logs de Vercel**: `vercel logs --follow`
2. **Consola del navegador**: F12 → Console
3. **Logs de Supabase**: Dashboard → Logs
4. **Este archivo**: Solución rápida arriba ⬆️

---

## ✅ Checklist Final Antes de Abrir al Público

- [ ] ✅ Deploy exitoso en Vercel
- [ ] ✅ Menú carga en <1 segundo
- [ ] ✅ Todos los platos tienen fotos y precios correctos
- [ ] ✅ Admin protegido con contraseña segura
- [ ] ✅ Código QR impreso y en las mesas
- [ ] ✅ Probado en móvil (iPhone y Android)
- [ ] ✅ Probado en tablets
- [ ] ✅ Animaciones funcionan suavemente
- [ ] ✅ Dominio personalizado configurado (opcional)
- [ ] ✅ Staff sabe cómo actualizar el menú

---

**🔥 ¡Que pasa gentuza! Estás listo para lanzar.**

Si tienes dudas, revisa los otros archivos de documentación o la [documentación oficial de Next.js](https://nextjs.org/docs).

---

**Tiempo total de setup: ~10 minutos**  
**Tiempo de deploy: ~5 minutos**  
**Total: 15 minutos desde cero hasta producción** 🚀

