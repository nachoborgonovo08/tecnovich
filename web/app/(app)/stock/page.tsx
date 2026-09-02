import { supabaseServer } from "@/lib/supabase-server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminPanel } from "@/components/admin-panel";
import { todayISO } from "@/lib/utils";
import type { Material, Reserva } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const sb = supabaseServer();
  const { data: userData } = await sb.auth.getUser();
  const { data: prof } = await sb
    .from("profiles").select("rol").eq("id", userData.user!.id).maybeSingle();
  const esCoordinador = prof?.rol === "Coordinador";

  const [{ data: mats }, { data: resv }] = await Promise.all([
    sb.from("materiales").select("clave,nombre,total,capacidad").order("clave"),
    sb.from("reservas").select("*").eq("fecha", todayISO()),
  ]);
  const materiales: Material[] = (mats ?? []) as Material[];
  const reservas: Reserva[] = (resv ?? []) as Reserva[];

  const usedByItem: Record<string, number> = {};
  for (const m of materiales) {
    usedByItem[m.clave] = reservas.filter((r) => r.item === m.clave).reduce((s, r) => s + r.cantidad, 0);
  }
  const total = materiales.reduce((s, m) => s + m.total, 0);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Stock</h1>
        <p className="text-sm text-muted-foreground">Estado actual del inventario de materiales.</p>
      </header>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Inventario Completo</CardTitle>
          <Badge variant="outline" className="font-mono">{total} unidades</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {materiales.map((m) => {
            const used = usedByItem[m.clave] ?? 0;
            const free = m.total - used;
            const pct = m.total > 0 ? Math.round((free / m.total) * 100) : 0;
            return (
              <div key={m.clave}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">{m.nombre}</span>
                  <span className="font-mono text-sm font-semibold text-primary">{free}/{m.total}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-accent">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {esCoordinador && (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Administración de Inventario</CardTitle>
            <Badge variant="warning">Coordinador</Badge>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Ajustá la cantidad total de cada material.
            </p>
            <AdminPanel materiales={materiales} usedByItem={usedByItem} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
