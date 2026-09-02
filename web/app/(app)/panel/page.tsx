import { Boxes, Calendar, CircleAlert, PackageCheck } from "lucide-react";
import { supabaseServer } from "@/lib/supabase-server";
import { KpiCard } from "@/components/kpi-card";
import { AlertBanner } from "@/components/alert-banner";
import WeeklyReportCard from "@/components/ui/area-chart-1";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { todayISO } from "@/lib/utils";
import type { Material, Reserva } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const sb = supabaseServer();
  const [{ data: mats }, { data: resv }] = await Promise.all([
    sb.from("materiales").select("clave,nombre,total,capacidad").order("clave"),
    sb.from("reservas").select("*").gte("fecha", todayISO()),
  ]);
  const materiales: Material[] = (mats ?? []) as Material[];
  const reservas: Reserva[] = (resv ?? []) as Reserva[];

  const today = todayISO();
  const usedToday = (clave: string) =>
    reservas.filter((r) => r.item === clave && r.fecha === today).reduce((s, r) => s + r.cantidad, 0);

  const totalUnits = materiales.reduce((s, m) => s + m.total, 0);
  const usedUnits  = materiales.reduce((s, m) => s + usedToday(m.clave), 0);
  const freeUnits  = totalUnits - usedUnits;
  const resvHoy    = reservas.filter((r) => r.fecha === today).length;
  const pctUsed    = totalUnits > 0 ? Math.round((usedUnits / totalUnits) * 100) : 0;
  const pctFree    = totalUnits > 0 ? Math.round((freeUnits / totalUnits) * 100) : 0;

  const lowStock = materiales
    .map((m) => ({ nombre: m.nombre, free: m.total - usedToday(m.clave), total: m.total }))
    .filter((x) => x.total > 0 && x.free / x.total < 0.4);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Panel Principal</h1>
        <p className="text-sm text-muted-foreground">Resumen del sistema de reservas.</p>
      </header>

      <AlertBanner items={lowStock} />

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Materiales Totales" value={totalUnits} sub={`${materiales.length} categorías`} Icon={Boxes} tone="primary" />
        <KpiCard label="Reservas Activas"   value={reservas.length} sub={resvHoy ? `${resvHoy} hoy` : "Sin reservas hoy"} Icon={Calendar} tone="success" />
        <KpiCard label="Items Reservados"   value={usedUnits} sub={`${pctUsed}% del stock`} Icon={CircleAlert} tone="warning" />
        <KpiCard label="Items Disponibles"  value={freeUnits} sub={`${pctFree}% disponible`} Icon={PackageCheck} tone="muted" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_auto]">
        <Card>
          <CardHeader>
            <CardTitle>Uso de la última semana</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-sm text-muted-foreground">
              Ver reservas por categoría durante los últimos 7 días.
            </p>
            <WeeklyReportCard className="mx-auto" />
          </CardContent>
        </Card>

        <Card className="lg:w-[380px]">
          <CardHeader>
            <CardTitle>Categorías</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {materiales.map((m) => {
              const used = usedToday(m.clave);
              const free = m.total - used;
              const pct = m.total > 0 ? Math.round((free / m.total) * 100) : 0;
              return (
                <div key={m.clave} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{m.nombre}</div>
                    <div className="text-xs text-muted-foreground">{free} de {m.total} libres</div>
                  </div>
                  <div className="font-mono text-sm font-bold">{pct}%</div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
