import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type StockLow = { nombre: string; free: number; total: number };

export function AlertBanner({ items }: { items: StockLow[] }) {
  if (!items.length) return null;
  const critical = items.some((i) => i.free === 0);
  return (
    <div
      className={cn(
        "mb-4 flex items-start gap-3 rounded-xl border-2 p-4 text-sm font-semibold",
        critical
          ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-950/40"
          : "border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-950/40",
      )}
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
      <div className="flex-1">
        <div>{critical ? "Stock agotado" : "Stock bajo detectado"} en {items.length} categoría{items.length > 1 ? "s" : ""}:</div>
        <ul className="mt-1 ml-4 list-disc font-medium text-foreground">
          {items.map((it) => (
            <li key={it.nombre}>
              {it.nombre} — {it.free} de {it.total} disponible{it.free === 1 ? "" : "s"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
