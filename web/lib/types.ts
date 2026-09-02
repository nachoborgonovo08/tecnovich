export type Rol = "Docente" | "Coordinador";

export type Material = {
  clave: string;
  nombre: string;
  total: number;
  capacidad: number | null;
};

export type Reserva = {
  id: string;
  user_id: string;
  item: string;
  cantidad: number;
  fecha: string; // YYYY-MM-DD
  observaciones: string | null;
  created_at: string;
  usuario_nombre?: string | null;
};

export type Profile = {
  id: string;
  nombre: string;
  rol: Rol;
};

export const ITEM_META: Record<string, { icon: string }> = {
  portatiles:  { icon: "Laptop" },
  routers:     { icon: "Wifi" },
  proyectores: { icon: "Projector" },
  tallerA:     { icon: "School" },
  tallerB:     { icon: "School" },
};
