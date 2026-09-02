"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Laptop, Wifi, Projector, School, X } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-client";
import { fmtDate } from "@/lib/utils";
import type { Material, Reserva } from "@/lib/types";

const ICONS: Record<string, any> = {
  portatiles: Laptop, routers: Wifi, proyectores: Projector,
  tallerA: School,   tallerB: School,
};

export function ReservationsList({
  reservas, materiales,
}: {
  reservas: Reserva[];
  materiales: Material[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  async function cancel(id: string) {
    if (!confirm("¿Cancelar esta reserva?")) return;
    start(async () => {
      await supabaseBrowser().from("reservas").delete().eq("id", id);
      router.refresh();
    });
  }

  if (!reservas.length)
    return (
      <div className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
        No hay reservas activas
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      {reservas.map((r) => {
        const it = materiales.find((m) => m.clave === r.item);
        const Icon = ICONS[r.item] ?? Laptop;
        return (
          <div
            key={r.id}
            className="grid grid-cols-[44px_1fr_auto] items-center gap-4 rounded-lg border-2 p-3"
          >
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">{it?.nombre ?? r.item}</div>
              <div className="text-xs text-muted-foreground">
                Fecha: <b className="font-mono text-foreground">{fmtDate(r.fecha)}</b>
                {" · "}Cantidad: <b className="font-mono text-foreground">{r.cantidad}</b>
                {r.observaciones && <> · {r.observaciones}</>}
              </div>
            </div>
            <button
              onClick={() => cancel(r.id)}
              disabled={pending}
              className="inline-flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/40"
            >
              <X className="h-3 w-3" />
              Cancelar
            </button>
          </div>
        );
      })}
    </div>
  );
}
