# 🍽️ Sistema de Reservas - La Parrilla de Champi

Sistema completo de gestión de reservas para el restaurante, con formulario web público, panel administrativo, y control granular de disponibilidad.

## 📋 Características

### Para Clientes (Público)

- ✅ **Formulario de reserva web** - Interfaz moderna y fácil de usar
- ✅ **Disponibilidad en tiempo real** - Solo muestra horarios disponibles
- ✅ **Confirmación instantánea** - Pantalla de confirmación con número de reserva
- ✅ **Diseño responsivo** - Optimizado para móviles
- ✅ **Bilingüe** - Español y Gallego

### Para el Restaurante (Admin)

- ✅ **Panel de administración** - Vista centralizada de todas las reservas
- ✅ **Reservas telefónicas** - Entrada manual para reservas por teléfono
- ✅ **Gestión de estados** - Confirmar, cancelar, completar reservas
- ✅ **Filtros avanzados** - Por fecha, estado, origen (web/teléfono)
- ✅ **Control de disponibilidad** - Abrir/cerrar días específicos
- 🔄 **Notificaciones email** - (Pendiente de configurar)

## 🗂️ Estructura del Proyecto

```
### Backend (Supabase)
supabase/migrations/               # Migraciones SQL de la base de datos (incluye reservas)

### API Routes
app/api/reservations/
├── availability/route.ts           # GET - Consultar horarios disponibles
├── create/route.ts                 # POST - Crear nueva reserva
├── list/route.ts                   # GET - Listar reservas (admin)
└── [id]/status/route.ts           # PATCH - Actualizar estado

app/api/admin/
└── availability/route.ts          # GET/POST/DELETE - Gestionar disponibilidad

### Frontend Público
app/reservas/
├── page.tsx                       # Página de reservas
└── page.module.css               # Estilos

components/reservations/
├── ReservationForm.tsx           # Formulario principal
└── ReservationForm.module.css   # Estilos del formulario

### Frontend Admin
app/admin/reservations/
└── page.tsx                      # Página admin de reservas

components/admin/reservations/
├── ReservationsDashboard.tsx     # Dashboard principal
└── ReservationsDashboard.module.css

### Utilidades
lib/types/reservations.ts         # TypeScript types
lib/i18n/translations.ts          # Traducciones ES/GL (actualizado)
```

## 🚀 Configuración Inicial

### 1. Configurar Base de Datos (Supabase)

Aplica las migraciones de `supabase/migrations/` en tu proyecto de Supabase:

```bash
# Opción 1: Desde el dashboard de Supabase
# 1. Ve a SQL Editor
# 2. Pega cada archivo de supabase/migrations/ en orden
# 3. Ejecuta cada script

# Opción 2: Usando la CLI de Supabase (si la tienes instalada)
supabase db push
```

Esto creará:

- ✅ Tabla `reservations` - Almacena todas las reservas
- ✅ Tabla `time_slots` - Define horarios disponibles
- ✅ Tabla `availability_settings` - Control de apertura/cierre
- ✅ Función `check_reservation_availability()` - Verifica disponibilidad
- ✅ Políticas RLS - Seguridad
- ✅ Datos iniciales - Time slots predeterminados

### 2. Configuración Predeterminada

El sistema viene configurado con:

**Horarios de Comida** (13:00 - 16:00):

- 13:00, 13:30, 14:00, 14:30, 15:00, 15:30

**Horarios de Cena** (20:00 - 23:00):

- 20:00, 20:30, 21:00, 21:30, 22:00, 22:30

**Capacidad por slot**: 40 comensales (configurable)

### 3. Personalizar Configuración

Para cambiar los horarios o capacidad, puedes:

**Opción A: Modificar el SQL inicial**
Edita la migración correspondiente de `supabase/migrations/` antes de aplicarla (en proyectos nuevos).

**Opción B: Usar la interfaz de Supabase**

1. Ve a Table Editor
2. Tabla `time_slots`
3. Edita, añade o elimina time slots
4. Ajusta `max_capacity` según necesites

## 📱 Uso del Sistema

### Para Clientes

1. Visitar `/reservas`
2. Seleccionar fecha (solo fechas futuras)
3. Elegir horario disponible
4. Completar datos personales
5. Enviar reserva
6. Recibir confirmación en pantalla (y email si está configurado)

### Para Administradores

1. Iniciar sesión en `/admin/login`
2. Visitar `/admin/reservations`
3. Ver todas las reservas
4. Filtrar por fecha, estado, origen
5. Actualizar estados:
   - **Pendiente** → Confirmar
   - **Confirmada** → Completar o Cancelar
   - **Cancelar** - En cualquier momento

### Entrada Manual (Reservas Telefónicas)

**Método Actual:**
Usa la API directamente o crea un componente de formulario simple en el admin.

**Próximamente:**
Formulario dedicado en el panel admin.

## 🔧 Configuración de Email (Próximo Paso)

El sistema está preparado para enviar emails pero requiere configuración:

### Opción Recomendada: Resend

1. Crear cuenta en [resend.com](https://resend.com) (3,000 emails/mes gratis)
2. Obtener API key
3. Agregar a `.env.local`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```
4. Instalar dependencia:
   ```bash
   pnpm add resend
   ```
5. Descomentar código de email en `app/api/reservations/create/route.ts`

## 🎨 Personalización

### Cambiar Colores del Tema

Los colores principales están definidos en los CSS modules:

- **Principal**: `#ff6b35` (naranja)
- **Secundario**: `#2c3e50` (azul oscuro)
- **Éxito**: `#27ae60` (verde)
- **Error**: `#e74c3c` (rojo)

Busca y reemplaza estos valores en:

- `ReservationForm.module.css`
- `page.module.css`
- `ReservationsDashboard.module.css`

### Modificar Textos

Todos los textos están centralizados en `lib/i18n/translations.ts`:

```typescript
reservations: {
  title: "Reservas",
  subtitle: "Reserva tu mesa",
  // ... más textos
}
```

Modifica ahí para cambiar cualquier texto del sistema.

## 🐛 Solución de Problemas

### "No se muestran los time slots"

1. Verifica que ejecutaste el SQL correctamente
2. Revisa que `time_slots` tenga datos con `is_active = true`
3. Comprueba la consola del navegador para errores

### "Error 401 Unauthorized en admin"

1. Asegúrate de estar autenticado en `/admin/login`
2. Verifica que la sesión de Supabase esté activa
3. Revisa las políticas RLS en Supabase

### "Disponibilidad incorrecta"

1. Verifica la fecha del servidor vs. cliente
2. Comprueba que no haya configuraciones en `availability_settings` cerrando esos días
3. Revisa la consola del navegador para errores de API

### "Estilos no se aplican"

1. Verifica que los archivos `.module.css` existen
2. Reinicia el servidor de desarrollo: `pnpm dev`
3. Limpia la caché: Ctrl+Shift+R

## 📊 API Endpoints

### Público

**GET** `/api/reservations/availability?date=YYYY-MM-DD`

- Retorna time slots disponibles para una fecha
- Response: `{ date, isOpen, timeSlots: [{ time, available, remainingCapacity }] }`

**POST** `/api/reservations/create`

- Crea una nueva reserva
- Body: `{ guestName, guestEmail, guestPhone, reservationDate, timeSlot, guestsCount, specialRequests?, source? }`
- Response: `{ success, reservation, message }`

### Admin (Requiere autenticación)

**GET** `/api/reservations/list?date=...&status=...&source=...`

- Lista reservas con filtros
- Response: `{ reservations[], total, limit, offset }`

**PATCH** `/api/reservations/[id]/status`

- Actualiza estado de una reserva
- Body: `{ status: 'pending'|'confirmed'|'cancelled'|'no_show'|'completed' }`

**GET/POST/DELETE** `/api/admin/availability`

- Gestiona configuración de disponibilidad por día

## 🔐 Seguridad

- ✅ Row Level Security (RLS) habilitado en todas las tablas
- ✅ Validación de entrada en cliente y servidor
- ✅ Protección contra SQL injection (Supabase)
- ✅ Verificación de disponibilidad con función de base de datos
- ✅ Autenticación requerida para endpoints admin

## 🚧 Próximas Mejoras

- [ ] Sistema de emails con Resend
- [ ] Formulario manual de reservas en admin
- [ ] Calendario visual de disponibilidad
- [ ] Recordatorios automáticos por email
- [ ] Exportación de reservas a CSV/Excel
- [ ] Estadísticas y gráficos
- [ ] Integración con Google Calendar
- [ ] Sistema de lista de espera
- [ ] Reservas recurrentes

## 📞 Soporte

Para problemas o preguntas:

1. Revisa esta documentación
2. Comprueba los logs en la consola del navegador
3. Verifica los logs de Supabase
4. Contacta al desarrollador

---

**Desarrollado con ❤️ para La Parrilla de Champi**
