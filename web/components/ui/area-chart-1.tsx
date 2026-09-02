"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  LinearXAxis,
  LinearXAxisTickSeries,
  LinearXAxisTickLabel,
  LinearYAxis,
  LinearYAxisTickSeries,
  AreaSeries,
  Area,
  Gradient,
  GradientStop,
  GridlineSeries,
  Gridline,
} from "reaviz";
import {
  CalendarCheck2,
  TrendingUp,
  TrendingDown,
  Zap,
} from "lucide-react";

type ChartDataPoint = { key: Date; data: number };
type ChartSeries = { key: string; data: ChartDataPoint[] };

export type WeeklyReportProps = {
  /** Series semanales — 3 items. Si no se pasa, usa datos de ejemplo. */
  series?: ChartSeries[];
  /** KPIs a mostrar. Si no se pasan, se derivan del series. */
  metrics?: MetricInfo[];
  title?: string;
  className?: string;
};

const LEGEND_ITEMS = [
  { name: "Portátiles",   color: "#5B14C5" },
  { name: "Routers WiFi", color: "#B58BF3" },
  { name: "Proyectores",  color: "#DAC5F9" },
];

const now = new Date();
const dayAgo = (offset: number) => {
  const d = new Date(now);
  d.setDate(now.getDate() - offset);
  return d;
};

const DEFAULT_SERIES: ChartSeries[] = [
  {
    key: "Portátiles",
    data: [
      { key: dayAgo(6), data: 4 }, { key: dayAgo(5), data: 5 },
      { key: dayAgo(4), data: 7 }, { key: dayAgo(3), data: 9 },
      { key: dayAgo(2), data: 5 }, { key: dayAgo(1), data: 5 },
      { key: dayAgo(0), data: 7 },
    ],
  },
  {
    key: "Proyectores",
    data: [
      { key: dayAgo(6), data: 3 }, { key: dayAgo(5), data: 3 },
      { key: dayAgo(4), data: 4 }, { key: dayAgo(3), data: 5 },
      { key: dayAgo(2), data: 2 }, { key: dayAgo(1), data: 3 },
      { key: dayAgo(0), data: 4 },
    ],
  },
  {
    key: "Routers WiFi",
    data: [
      { key: dayAgo(6), data: 2 }, { key: dayAgo(5), data: 3 },
      { key: dayAgo(4), data: 3 }, { key: dayAgo(3), data: 4 },
      { key: dayAgo(2), data: 2 }, { key: dayAgo(1), data: 1 },
      { key: dayAgo(0), data: 3 },
    ],
  },
];

type MetricInfo = {
  id: string;
  Icon: React.FC<{ className?: string }>;
  label: string;
  value: string;
  trend: "up" | "down" | "flat";
  delay: number;
};

const TrendChip: React.FC<{ dir: "up" | "down" | "flat" }> = ({ dir }) => {
  if (dir === "up")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-500">
        <TrendingUp className="h-3 w-3" />
      </span>
    );
  if (dir === "down")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-1 text-xs font-semibold text-red-500">
        <TrendingDown className="h-3 w-3" />
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
      —
    </span>
  );
};

function computeDefaultMetrics(series: ChartSeries[]): MetricInfo[] {
  const flat = series.flatMap((s) => s.data.map((d) => d.data));
  const total = flat.reduce((a, b) => a + b, 0);
  const avg = Math.round(total / 7);
  const peak = Math.max(...flat);
  return [
    {
      id: "week", Icon: CalendarCheck2,
      label: "Reservas de la semana", value: String(total),
      trend: "up", delay: 0,
    },
    {
      id: "avg", Icon: Zap,
      label: "Promedio diario", value: String(avg),
      trend: "flat", delay: 0.05,
    },
    {
      id: "peak", Icon: TrendingUp,
      label: "Pico del día", value: String(peak),
      trend: "up", delay: 0.1,
    },
  ];
}

const WeeklyReportCard: React.FC<WeeklyReportProps> = ({
  series = DEFAULT_SERIES,
  metrics,
  title = "Reporte Semanal",
  className,
}) => {
  const cleaned = series.map((s) => ({
    ...s,
    data: s.data.map((d) => ({ ...d, data: Number.isFinite(d.data) ? d.data : 0 })),
  }));
  const kpis = metrics ?? computeDefaultMetrics(cleaned);

  return (
    <div
      className={`flex flex-col rounded-3xl bg-card text-card-foreground shadow-xl border w-full max-w-md min-h-[580px] overflow-hidden ${className ?? ""}`}
    >
      <style jsx global>{`
        .reaviz-chart-container {
          --reaviz-tick-fill: hsl(var(--muted-foreground));
          --reaviz-gridline-stroke: hsl(var(--border));
        }
      `}</style>
      <h3 className="text-2xl font-bold text-left px-7 pt-6 pb-6 tracking-tight">
        {title}
      </h3>
      <div className="flex justify-between w-full px-8 mb-4">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.name} className="flex gap-2 items-center">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground text-xs">{item.name}</span>
          </div>
        ))}
      </div>
      <div className="reaviz-chart-container h-[200px] px-2">
        <AreaChart
          height={200}
          id="tecnovich-weekly-report"
          data={cleaned}
          xAxis={
            <LinearXAxis
              type="time"
              tickSeries={
                <LinearXAxisTickSeries
                  label={
                    <LinearXAxisTickLabel
                      format={(v: Date) =>
                        new Date(v).toLocaleDateString("es-AR", { day: "numeric", month: "numeric" })
                      }
                      fill="var(--reaviz-tick-fill)"
                    />
                  }
                  tickSize={10}
                />
              }
            />
          }
          yAxis={
            <LinearYAxis
              axisLine={null}
              tickSeries={<LinearYAxisTickSeries line={null} label={null} tickSize={10} />}
            />
          }
          series={
            <AreaSeries
              type="grouped"
              interpolation="smooth"
              area={
                <Area
                  gradient={
                    <Gradient
                      stops={[
                        <GradientStop key={1} stopOpacity={0} />,
                        <GradientStop key={2} offset="100%" stopOpacity={0.4} />,
                      ]}
                    />
                  }
                />
              }
              colorScheme={["#5B14C5", "#DAC5F9", "#B58BF3"]}
            />
          }
          gridlines={<GridlineSeries line={<Gridline strokeColor="var(--reaviz-gridline-stroke)" />} />}
        />
      </div>
      <div className="flex flex-col px-8 pt-6 font-mono divide-y divide-border">
        {kpis.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: m.delay }}
            className="flex w-full py-4 items-center gap-2"
          >
            <div className="flex flex-row gap-2 items-center text-base w-1/2 text-muted-foreground">
              <m.Icon className="h-5 w-5" />
              <span className="truncate">{m.label}</span>
            </div>
            <div className="flex gap-2 w-1/2 justify-end items-center">
              <span className="font-semibold text-xl">{m.value}</span>
              <TrendChip dir={m.trend} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyReportCard;
