import { supabaseServer } from "@/lib/supabase-server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RingCard } from "@/components/ring-card";
import { ReservationForm } from "@/components/reservation-form";
import { ReservationsList } from "@/components/reservations-list";
import { todayISO } from "@/lib/utils";
import type { Material, Reserva } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReservasPage() {
  const sb = supabaseServer();
  const { data: userData } = await sb.auth.getUser();
  const uid = userData.user!.id;

  const [{ data: mats }, { data: resv }] = await Promise.all([
    sb.from("materiales").select("clave,nombre,total,capacidad").order("clave"),
    sb.from("reservas").select("*").gte("fecha", todayISO()).order("fecha"),
  ]);
  const materiales: Material[] = (mats ?? []) as Material[];
  const reservas: Reserva[] = (resv ?? []) as Reserva[];
  const mias = reservas.filter((r) => r.user_id === uid);

  const today = todayISO();
  const usedToday = (clave: string) =>
    reservas.filter((r) => r.item === clave && r.fecha === today).reduce((s, r) => s + r.cantidad, 0);

  const totalFree = materiales.reduce((s, m) => s + Math.max(0, m.total - usedToday(m.clave)), 0);
  const totalAll  = materiales.reduce((s, m) => s + m.total, 0);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
        <p className="text-sm text-muted-foreground">Gestioná tus reservas de materiales.</p>
      </header>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Items Disponibles</CardTitle>
          <Badge variant="outline" className="font-mono">{totalFree} / {totalAll}</Badge>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materiales.map((m) => {
            const used = usedToday(m.clave);
            const free = Math.max(0, m.total - used);
            return (
              <RingCard
                key={m.clave}
                name={m.nombre}
                free={free}
                total={m.total}
                subLeft={{ label: m.capacidad ? "Capacidad" : "Libres", value: m.capacidad ?? free }}
                subRight={{ label: "En uso", value: used }}
              />
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Mis Reservas Activas</CardTitle>
            <Badge variant="outline" className="font-mono">{mias.length}</Badge>
          </CardHeader>
          <CardContent>
            <ReservationsList reservas={mias} materiales={materiales} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nueva Reserva</CardTitle>
          </CardHeader>
          <CardContent>
            <ReservationForm materiales={materiales} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
