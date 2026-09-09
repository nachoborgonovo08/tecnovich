"use client";

import { useRouter } from "next/navigation";
import { CTASection } from "@/components/ui/hero-dithering-card";

export function PanelHeroCTA() {
  const router = useRouter();
  return (
    <CTASection
      eyebrow="Acción rápida · Panel"
      headline="Reservá materiales,"
      headlineDim="en dos clics."
      description="Portátiles, routers, proyectores y talleres, todo en un solo lugar. La disponibilidad se actualiza en tiempo real."
      ctaLabel="Nueva Reserva"
      onCtaClick={() => router.push("/reservas")}
    />
  );
}
