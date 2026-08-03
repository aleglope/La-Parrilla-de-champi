import "server-only";
import { cookies } from "next/headers";
import { verifySession } from "./session";

/**
 * Comprueba que la petición actual lleva una sesión admin válida.
 *
 * Pensado para Server Actions: son endpoints POST invocables directamente
 * con su Action ID (que viaja en los chunks estáticos, servidos sin
 * autenticación), así que proteger la página que las usa NO las protege.
 * El gate de Next contra CSRF tampoco autentica: solo compara Origin, y ni
 * siquiera lo exige cuando la cabecera no viene.
 *
 * Se aísla de `session.ts` a propósito: aquí se importa `next/headers`, que
 * ata el módulo al runtime de servidor con contexto de petición.
 */
export async function isAdminRequest(): Promise<boolean> {
  const token = cookies().get("admin-session")?.value;
  return verifySession(token);
}
