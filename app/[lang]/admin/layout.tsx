import type { Metadata } from "next";

/**
 * El panel entero fuera del índice: login, gestión de la carta y reservas.
 *
 * robots.txt solo pide que no se rastree; esto además pide que no se indexe,
 * que es lo que impide que la pantalla de login aparezca en resultados si
 * alguien la enlaza desde fuera.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
