import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const CIRC = 282.74; // 2π·45

export function RingCard({
  name, free, total, subLeft, subRight,
}: {
  name: string;
  free: number;
  total: number;
  subLeft: { label: string; value: number | string };
  subRight: { label: string; value: number | string };
}) {
  const pct = total > 0 ? (free / total) * 100 : 0;
  const offset = CIRC * (1 - pct / 100);

  let variant: "success" | "warning" | "danger" = "success";
  let label = "Libre";
  let color = "hsl(142 76% 45%)";
  if (free === 0)     { variant = "danger"; label = "Sin stock"; color = "hsl(0 84% 60%)"; }
  else if (pct < 40)  { variant = "warning"; label = "Bajo";     color = "hsl(24 90% 55%)"; }

  return (
    <Card className="relative transition-all hover:-translate-y-1 hover:shadow-lg">
      <Badge variant={variant} className="absolute right-3 top-3">{label}</Badge>
      <CardContent className="flex flex-col items-center p-6 pt-8">
        <div className="relative h-28 w-28">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
            <circle
              cx="55" cy="55" r="45"
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-mono text-2xl font-bold leading-none">{free}</div>
            <div className="mt-1 font-mono text-[11px] text-muted-foreground">de {total}</div>
          </div>
        </div>
        <div className="mt-3 text-center text-sm font-semibold">{name}</div>
        <div className="mt-1 text-xs font-bold" style={{ color }}>
          {Math.round(pct)}% disponible
        </div>
        <div className="mt-3 grid w-full grid-cols-2 gap-1 border-t border-dashed border-border pt-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>{subLeft.label} <b className="ml-1 font-mono text-foreground">{subLeft.value}</b></span>
          <span>{subRight.label} <b className="ml-1 font-mono text-foreground">{subRight.value}</b></span>
        </div>
      </CardContent>
    </Card>
  );
}
