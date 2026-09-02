import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Tone = "primary" | "success" | "warning" | "muted";

const TONES: Record<Tone, string> = {
  primary: "bg-primary text-primary-foreground",
  success: "bg-emerald-500 text-white",
  warning: "bg-orange-500 text-white",
  muted:   "bg-accent text-accent-foreground",
};

export function KpiCard({
  label, value, sub, Icon, tone = "primary",
}: {
  label: string;
  value: string | number;
  sub?: string;
  Icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("grid h-12 w-12 place-items-center rounded-xl", TONES[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="font-mono text-3xl font-bold leading-none">{value}</div>
          {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
