# Configuración de Resend para Emails

## Paso 1: Crear cuenta en Resend

1. Ve a [https://resend.com/signup](https://resend.com/signup)
2. Regístrate con tu email
3. Verifica tu cuenta

## Paso 2: Obtener API Key

1. Una vez logeado, ve a **API Keys** en el menú lateral
2. Click en **Create API Key**
3. Dale un nombre (ej: "La Parrilla - Production")
4. Copia la API key que te dan (solo se muestra una vez)

## Paso 3: Configurar en tu proyecto

Añade la API key a tu archivo `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxx
ADMIN_EMAIL=tumail@tudominio.com
```

**Notas:**

- `RESEND_API_KEY`: La key que copiaste de Resend
- `ADMIN_EMAIL`: El email donde quieres recibir notificaciones de nuevas reservas

## Paso 4: Configurar dominio (Opcional pero recomendado)

Para producción, es mejor usar tu propio dominio:

1. En Resend, ve a **Domains**
2. Click en **Add Domain**
3. Ingresa tu dominio (ej: `laparrilladechampi.com`)
4. Sigue las instrucciones para añadir los registros DNS
5. Verifica el dominio

Una vez verificado, actualiza el email service en `lib/email/EmailService.ts`:

```typescript
// Cambiar de:
from: 'La Parrilla de Champi <reservas@laparrilladechampi.com>',

// A:
from: 'La Parrilla de Champi <reservas@tudominio.com>',
```

## Paso 5: Reiniciar servidor

Después de agregar las variables de entorno:

```bash
# Detener el servidor (Ctrl+C en la terminal)
# Volver a iniciar:
npm run dev
```

## Paso 6: Probar

1. Crea una reserva de prueba en `/reservas`
2. Revisa la consola del servidor para mensajes de email
3. Verifica que llegue el email de confirmación
4. Verifica que llegue el email de notificación al admin

## Troubleshooting

### "Resend API key not configured"

- Verifica que agregaste `RESEND_API_KEY` a `.env.local`
- Reinicia el servidor de desarrollo

### "Failed to send email"

- Verifica que la API key sea correcta
- Verifica que el dominio esté configurado (o usa el dominio de prueba de Resend)
- Revisa los logs en el dashboard de Resend

### Emails no llegan

- Revisa la carpeta de spam
- En development, Resend solo envía a emails verificados
- Para producción, verifica tu dominio en Resend

## Plan Gratuito de Resend

- **3,000 emails/mes gratis**
- Perfecto para comenzar
- Puedes actualizar si necesitas más

## Emails de prueba (desarrollo)

Por defecto, Resend en desarrollo solo envía emails a:

- El email del propietario de la cuenta de Resend
- Emails que hayas agregado como "Testing emails" en Resend

Para testing con emails reales, necesitas:

1. Añadir esos emails en Resend Dashboard > Settings > Te sting Emails
2. O verificar tu dominio para producción
