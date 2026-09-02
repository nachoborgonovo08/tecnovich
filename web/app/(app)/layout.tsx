import { redirect } from "next/navigation";
import Nav from "@/components/nav";
import { supabaseServer } from "@/lib/supabase-server";
import type { Profile } from "@/lib/types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sb = supabaseServer();
  const { data: userData } = await sb.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: prof } = await sb
    .from("profiles")
    .select("id, nombre, rol")
    .eq("id", userData.user.id)
    .maybeSingle();

  // Si el perfil fue borrado desde la base, cerramos la sesión y lo mandamos al login.
  // Así el usuario deja de tener acceso aunque su cuenta de auth siga existiendo.
  if (!prof) {
    await sb.auth.signOut();
    redirect("/login?motivo=perfil-eliminado");
  }

  const profile: Profile = {
    id: userData.user.id,
    nombre: prof.nombre || userData.user.email?.split("@")[0] || "Usuario",
    rol: prof.rol as Profile["rol"],
  };

  return (
    <>
      <Nav profile={profile} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </>
  );
}
