"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-client";
import type { Material } from "@/lib/types";

export function AdminPanel({
  materiales, usedByItem,
}: {
  materiales: Material[];
  usedByItem: Record<string, number>;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [locals, setLocals] = useState<Record<string, number>>(
    Object.fromEntries(materiales.map((m) => [m.clave, m.total])),
  );

  async function save(clave: string) {
    const val = locals[clave];
    const used = usedByItem[clave] ?? 0;
    if (val < used) {
      alert(`No se puede bajar a ${val}: hay ${used} unidades reservadas hoy.`);
      return;
    }
    start(async () => {
      await supabaseBrowser().from("materiales").update({ total: val }).eq("clave", clave);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {materiales.map((m) => {
        const used = usedByItem[m.clave] ?? 0;
        return (
          <div key={m.clave} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg bg-accent px-4 py-3">
            <span className="text-sm font-semibold">{m.nombre}</span>
            <span className="rounded-md bg-background px-2 py-1 font-mono text-xs text-muted-foreground">
              {m.total - used} libres · {used} en uso
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number" min={0}
                className="h-9 w-20 rounded-md border border-input bg-background text-center font-mono text-sm"
                value={locals[m.clave]}
                onChange={(e) => setLocals({ ...locals, [m.clave]: parseInt(e.target.value || "0", 10) })}
              />
              <button
                onClick={() => save(m.clave)}
                disabled={pending || locals[m.clave] === m.total}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40"
              >
                Guardar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
