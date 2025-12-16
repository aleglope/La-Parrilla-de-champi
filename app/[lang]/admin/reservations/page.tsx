import type { Metadata } from "next";
import ReservationsDashboard from "@/components/admin/reservations/ReservationsDashboard";

export const metadata: Metadata = {
  title: "Gestión de Reservas | Admin",
  description: "Panel de administración de reservas",
};

export default function AdminReservationsPage() {
  return <ReservationsDashboard />;
}
