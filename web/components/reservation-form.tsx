"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fmtDate, todayISO } from "@/lib/utils";
import { supabaseBrowser } from "@/lib/supabase-client";
import type { Material } from "@/lib/types";

export function ReservationForm({ materiales }: { materiales: Material[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [f, setF] = useState({
    item: materiales[0]?.clave ?? "",
    cantidad: 1,
    fecha: todayISO(),
    obs: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setOk(null);

    const it = materiales.find((m) => m.clave === f.item);
    if (!it)                     return setError("Material inválido.");
    if (f.fecha < todayISO())    return setError("No se puede reservar en una fecha pasada.");
    if (f.cantidad < 1)          return setError("La cantidad debe ser al menos 1.");

    start(async () => {
      const sb = supabaseBrowser();
      const { data: userData } = await sb.auth.getUser();
      if (!userData.user) { setError("Sesión expirada."); return; }

      // Verificar disponibilidad en esa fecha
      const { data: rows, error: qErr } = await sb
        .from("reservas")
        .select("cantidad")
        .eq("item", f.item)
        .eq("fecha", f.fecha);
      if (qErr) { setError(qErr.message); return; }

      const usado = (rows ?? []).reduce((s, r: any) => s + (r.cantidad ?? 0), 0);
      const disponible = it.total - usado;
      if (f.cantidad > disponible) {
        setError(`Solo hay ${disponible} ${it.nombre} disponible(s) para el ${fmtDate(f.fecha)}.`);
        return;
      }

      const { error: insErr } = await sb.from("reservas").insert({
        user_id: userData.user.id,
        item: f.item,
        cantidad: f.cantidad,
        fecha: f.fecha,
        observaciones: f.obs || null,
      });
      if (insErr) { setError(insErr.message); return; }

      setOk(`Reserva confirmada: ${f.cantidad} × ${it.nombre} para el ${fmtDate(f.fecha)}.`);
      setF({ ...f, cantidad: 1, obs: "" });
      router.refresh();
      setTimeout(() => setOk(null), 4000);
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-1.5">
        <Label>Material</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={f.item}
          onChange={(e) => setF({ ...f, item: e.target.value })}
        >
          {materiales.map((m) => (
            <option key={m.clave} value={m.clave}>{m.nombre}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label>Cantidad</Label>
        <Input
          type="number" min={1} value={f.cantidad}
          onChange={(e) => setF({ ...f, cantidad: parseInt(e.target.value || "1", 10) })}
        />
      </div>
      <div className="grid gap-1.5">
        <Label>Fecha</Label>
        <Input
          type="date" min={todayISO()} value={f.fecha}
          onChange={(e) => setF({ ...f, fecha: e.target.value })}
        />
      </div>
      <div className="grid gap-1.5">
        <Label>Observaciones</Label>
        <Input
          type="text" placeholder="Notas adicionales..."
          value={f.obs}
          onChange={(e) => setF({ ...f, obs: e.target.value })}
        />
      </div>
      {error && <div className="rounded-md bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-950/40">{error}</div>}
      {ok    && <div className="rounded-md bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/40">{ok}</div>}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando..." : "Confirmar Reserva"}
      </Button>
    </form>
  );
}
