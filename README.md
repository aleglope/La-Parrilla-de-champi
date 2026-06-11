<div align="center">

<!-- Logo principal -->
<img src="public/Logo-Champi.webp" alt="La Parrilla de Champi" width="220" />

# 🔥 La Parrilla de Champi

### *Donde el sabor se encuentra con la tecnología*

[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.39-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

---

**Plataforma web completa para la gestión integral de un restaurante de parrilla: carta digital interactiva, sistema de reservas en tiempo real y panel de administración.**

[🌐 Ver Demo](#) · [🐛 Reportar Bug](https://github.com/aleglope/la-parrilla-de-champi/issues) · [✨ Solicitar Feature](https://github.com/aleglope/la-parrilla-de-champi/issues)

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tech Stack](#-tech-stack)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Variables de Entorno](#-variables-de-entorno)
- [Base de Datos (Supabase)](#base-de-datos-supabase)
- [Uso](#-uso)
- [Despliegue](#despliegue)
- [Contribución](#-contribución)
- [Licencia](#-licencia)
- [Contacto](#-contacto)

---

## ✨ Características

<table>
<tr>
<td width="50%">

### 🍖 Carta Digital Interactiva
- Gestión dinámica de platos y categorías
- Imágenes optimizadas con **Sharp**
- Filtrado por categorías con tabs animados
- Soporte multiidioma (es / gl — español / gallego)

</td>
<td width="50%">

### 📅 Sistema de Reservas
- Calendario interactivo con **React Day Picker**
- Gestión de capacidad en tiempo real
- Días de cierre configurables
- Reservas manuales desde el panel admin

</td>
</tr>
<tr>
<td width="50%">

### 🎨 Experiencia Visual Premium
- Animaciones fluidas con **Framer Motion** y **GSAP**
- Sistema de partículas con **Three.js**
- Hero Bento Box con logo reveal animado
- Diseño responsive pixel-perfect

</td>
<td width="50%">

### 🔐 Panel de Administración
- Autenticación con cookie de sesión **JWT firmada (HMAC)** con expiración
- CRUD completo de platos y categorías
- Dashboard de reservas con filtros
- Subida y compresión de imágenes

</td>
</tr>
</table>

---

## 🏗 Arquitectura

```mermaid
graph TB
    subgraph Cliente["🖥️ Cliente (Next.js 14)"]
        A[App Router - i18n] --> B[Componentes React]
        B --> C[Framer Motion / GSAP]
        B --> D[Three.js Particles]
        B --> E[Zustand State]
    end

    subgraph API["⚡ API Layer"]
        F[Next.js API Routes]
        G[Server Components]
        H[Resend Email API]
    end

    subgraph Backend["🗄️ Backend (Supabase)"]
        I[(PostgreSQL DB)]
        K[Storage Bucket]
    end

    subgraph Deploy["🚀 Deployment"]
        L[Vercel Edge Network]
        M[Vercel Analytics]
        N[Speed Insights]
    end

    Cliente --> API
    API --> Backend
    Cliente --> Deploy
    
    style Cliente fill:#1a1a2e,stroke:#e94560,color:#fff
    style API fill:#16213e,stroke:#0f3460,color:#fff
    style Backend fill:#0f3460,stroke:#533483,color:#fff
    style Deploy fill:#533483,stroke:#e94560,color:#fff
```

### Flujo de Reservas

```mermaid
sequenceDiagram
    actor U as 👤 Cliente
    participant W as 🌐 Web App
    participant S as ⚡ Supabase
    participant E as 📧 Resend
    participant A as 🔐 Admin

    U->>W: Selecciona fecha y hora
    W->>S: Consulta disponibilidad
    S-->>W: Capacidad disponible
    W->>U: Muestra slots libres
    U->>W: Confirma reserva
    W->>S: Guarda reserva
    W->>E: Envía email confirmación
    E-->>U: 📩 Email de confirmación
    A->>S: Consulta reservas del día
    S-->>A: Lista de reservas
```

---

## 🛠 Tech Stack

<div align="center">

| Categoría | Tecnologías |
|:-:|:-:|
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=fff&style=flat-square) ![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=000&style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff&style=flat-square) |
| **Estilos** | ![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=fff&style=flat-square) |
| **Animaciones** | ![Framer](https://img.shields.io/badge/Framer_Motion-0055FF?logo=framer&logoColor=fff&style=flat-square) ![GSAP](https://img.shields.io/badge/GSAP-88CE02?logo=greensock&logoColor=000&style=flat-square) ![Three.js](https://img.shields.io/badge/Three.js-000?logo=threedotjs&logoColor=fff&style=flat-square) |
| **Backend** | ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=fff&style=flat-square) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=fff&style=flat-square) |
| **Email** | ![Resend](https://img.shields.io/badge/Resend-000?logo=resend&logoColor=fff&style=flat-square) |
| **Deploy** | ![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=fff&style=flat-square) |
| **Estado** | ![Zustand](https://img.shields.io/badge/Zustand-433E38?logo=react&logoColor=fff&style=flat-square) |

</div>

---

## 📁 Estructura del Proyecto

```
la-parrilla-de-champi/
├── 📂 app/
│   └── 📂 [lang]/                # Rutas internacionalizadas (es/gl)
│       ├── 📄 page.tsx           # Página principal
│       ├── 📂 menu/              # Carta digital
│       ├── 📂 reservas/          # Sistema de reservas
│       ├── 📂 admin/             # Panel de administración
│       │   ├── 📂 login/         # Autenticación admin
│       │   └── 📂 reservations/  # Gestión de reservas
│       ├── 📂 aviso-legal/       # Aviso legal
│       ├── 📂 politica-privacidad/
│       └── 📂 politica-cookies/
├── 📂 components/
│   ├── 📂 admin/                 # Componentes del panel admin
│   ├── 📂 hero/                  # Hero section con animaciones
│   ├── 📂 layout/                # Footer, estructura
│   ├── 📂 menu/                  # Carta y platos
│   ├── 📂 navigation/            # Menú burbuja + navegación
│   ├── 📂 particles/             # Sistema de partículas 3D
│   ├── 📂 reservations/          # Formulario de reservas
│   ├── 📂 sections/              # CTA y secciones
│   ├── 📂 social/                # Redes sociales
│   ├── 📂 story/                 # Sección "Nuestra Historia"
│   └── 📂 ui/                    # Componentes reutilizables
├── 📂 lib/
│   └── 📂 i18n/                  # Contexto de idioma
├── 📂 public/                    # Assets estáticos y logos
└── 📄 tailwind.config.ts         # Configuración Tailwind
```

---

## 🚀 Instalación

### Prerrequisitos

- ![Node.js](https://img.shields.io/badge/Node.js-≥20-339933?logo=nodedotjs&logoColor=fff&style=flat-square)
- ![pnpm](https://img.shields.io/badge/pnpm-≥10-F69220?logo=pnpm&logoColor=fff&style=flat-square)
- Un proyecto de [Supabase](https://supabase.com) (plan gratuito suficiente)
- Una cuenta de [Resend](https://resend.com) para el email transaccional (opcional en local)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/aleglope/la-parrilla-de-champi.git

# 2. Entrar al directorio
cd la-parrilla-de-champi

# 3. Instalar dependencias
pnpm install

# 4. Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales (ver "Variables de Entorno")

# 5. Aplicar las migraciones de base de datos (ver "Base de Datos (Supabase)")

# 6. Ejecutar en desarrollo
pnpm dev
```

> La aplicación estará disponible en `http://localhost:3000`

---

## 🔑 Variables de Entorno

La plantilla [`.env.example`](.env.example) documenta **todas** las variables con instrucciones para obtener cada valor. Cópiala y rellénala:

```bash
cp .env.example .env.local
```

| Categoría | Variables | Para qué |
|-----------|-----------|----------|
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Base de datos y Storage |
| **Resend** | `RESEND_API_KEY` | Emails de confirmación de reservas |
| **Admin** | `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`, `REVALIDATE_SECRET` | Login del panel y firma de la cookie de sesión |
| **Sentry** (opcional) | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN` | Observabilidad; si se omiten, Sentry queda desactivado |

> Los secretos (`ADMIN_JWT_SECRET`, `REVALIDATE_SECRET`) se generan con `openssl rand -base64 32`. Los valores reales viven solo en `.env.local` (gitignoreado) y en Vercel.

---

## Base de Datos (Supabase)

El esquema completo (carta, reservas, RLS y datos iniciales) se versiona como migraciones SQL en [`supabase/migrations/`](supabase/migrations/). Para montar la base de datos en un proyecto de Supabase:

**Opción A — Supabase CLI (recomendada):**

```bash
supabase link --project-ref tu-project-ref
supabase db push
```

**Opción B — SQL Editor:** pega y ejecuta cada archivo de `supabase/migrations/` **en orden** (están numerados) en el SQL Editor del dashboard de Supabase.

Al terminar deberías ver las tablas `categories`, `dishes`, `reservations`, `time_slots` y `availability_settings`, con RLS habilitado.

---

## 💻 Uso

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | 🔧 Servidor de desarrollo con hot-reload |
| `pnpm build` | 📦 Build de producción optimizado |
| `pnpm start` | 🚀 Servidor de producción |
| `pnpm lint` | 🔍 Análisis estático con ESLint |
| `pnpm typecheck` | Comprobación de tipos con TypeScript |
| `pnpm test` | Tests con Vitest en modo watch |
| `pnpm test:ci` | Tests en modo CI (una pasada) |

---

## Despliegue

El proyecto está pensado para [Vercel](https://vercel.com):

1. Sube el repositorio a GitHub e impórtalo en [vercel.com/new](https://vercel.com/new) (Vercel detecta Next.js y pnpm automáticamente).
2. En **Settings → Environment Variables**, añade las mismas variables de `.env.local` (ver [Variables de Entorno](#-variables-de-entorno)); usa valores de producción para `ADMIN_PASSWORD` y los secretos.
3. Aplica las migraciones de `supabase/migrations/` en tu proyecto de Supabase de producción (si no lo hiciste ya).
4. Haz clic en **Deploy**. Cada push a la rama principal despliega automáticamente.

> Guía paso a paso (dominio propio, QR del menú, checklist post-deploy): [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Sigue estos pasos:

```mermaid
graph LR
    A[🍴 Fork] --> B[🌿 Branch]
    B --> C[💻 Código]
    C --> D[✅ Commit]
    D --> E[📤 Push]
    E --> F[🔀 Pull Request]
    
    style A fill:#e94560,stroke:#fff,color:#fff
    style B fill:#0f3460,stroke:#fff,color:#fff
    style C fill:#16213e,stroke:#fff,color:#fff
    style D fill:#533483,stroke:#fff,color:#fff
    style E fill:#e94560,stroke:#fff,color:#fff
    style F fill:#0f3460,stroke:#fff,color:#fff
```

1. **Fork** el repositorio
2. Crea tu rama (`git checkout -b feature/MiFeature`)
3. Commitea tus cambios (`git commit -m 'feat: añadir nueva característica'`)
4. Push a la rama (`git push origin feature/MiFeature`)
5. Abre un **Pull Request**

---

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Consulta el archivo [`LICENSE`](LICENSE) para más detalles.

---

## 📬 Contacto

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-aleglope-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/aleglope)
[![Issues](https://img.shields.io/badge/Issues-Reportar-red?style=for-the-badge&logo=github&logoColor=white)](https://github.com/aleglope/la-parrilla-de-champi/issues)

---

<img src="public/Logo-Bento-Hero.svg" alt="Champi Bento" width="80" />

**Hecho con ❤️ y mucha parrilla**

</div>
