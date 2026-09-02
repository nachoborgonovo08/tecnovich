import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";

export default async function Home() {
  const sb = supabaseServer();
  const { data } = await sb.auth.getUser();
  redirect(data.user ? "/panel" : "/login");
}
