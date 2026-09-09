"use client";

import { ArrowRight } from "lucide-react";
import { useState, Suspense, lazy, type ReactNode } from "react";

const Dithering = lazy(() =>
  import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering })),
);

export type HeroDitheringCardProps = {
  eyebrow?: string;
  headline?: ReactNode;
  headlineDim?: ReactNode;
  description?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  accent?: string;
};

export function CTASection({
  eyebrow = "Tecnovich · Taller Integrador",
  headline = "Reservas más simples,",
  headlineDim = "para toda la escuela.",
  description = "Gestioná materiales y talleres desde un solo lugar. Estadísticas por día, alertas de bajo stock y control de disponibilidad en tiempo real.",
  ctaLabel = "Empezar",
  onCtaClick,
  accent = "#5B14C5",
}: HeroDitheringCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="flex w-full items-center justify-center px-4 py-8 md:px-6">
      <div
        className="relative w-full max-w-3xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative flex min-h-[520px] flex-col items-center justify-center overflow-hidden rounded-[48px] border border-border bg-card shadow-sm duration-500">
          <Suspense fallback={<div className="absolute inset-0 bg-muted/20" />}>
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply dark:opacity-30 dark:mix-blend-screen">
              <Dithering
                colorBack="#00000000"
                colorFront={accent}
                shape="warp"
                type="4x4"
                speed={isHovered ? 0.6 : 0.2}
                className="size-full"
                minPixelRatio={1}
              />
            </div>
          </Suspense>

          <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              {eyebrow}
            </div>

            <h2 className="mb-6 font-serif text-4xl font-medium leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
              {headline} <br />
              <span className="text-foreground/70">{headlineDim}</span>
            </h2>

            <p className="mb-10 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {description}
            </p>

            <button
              onClick={onCtaClick}
              type="button"
              className="group relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full bg-primary px-10 text-base font-medium text-primary-foreground transition-all duration-300 hover:scale-105 hover:bg-primary/90 hover:ring-4 hover:ring-primary/20 active:scale-95"
            >
              <span className="relative z-10">{ctaLabel}</span>
              <ArrowRight className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
