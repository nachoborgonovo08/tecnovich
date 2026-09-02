"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import DotBorderButton from "@/components/ui/dot-border-button";

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}

function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [rol, setRol] = useState<"Docente" | "Coordinador">("Docente");
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    if (params.get("motivo") === "perfil-eliminado")
      setErr("Tu perfil fue eliminado por un administrador. Contactá al Coordinador.");
  }, [params]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    start(async () => {
      const sb = supabaseBrowser();
      if (mode === "login") {
        const { error } = await sb.auth.signInWithPassword({ email, password: pass });
        if (error) return setErr(error.message);
        router.replace("/panel");
      } else {
        const { data, error } = await sb.auth.signUp({ email, password: pass });
        if (error) return setErr(error.message);
        if (data.user) {
          await sb.from("profiles").upsert({ id: data.user.id, nombre, rol });
        }
        setErr("Cuenta creada. Revisá tu email para confirmar y después ingresá.");
        setMode("login");
      }
    });
  }

  return (
    <main className="auth-bg min-h-screen w-full grid lg:grid-cols-2">
      {/* Panel izquierdo con el botón animado del prompt */}
      <div className="hidden lg:flex flex-col items-center justify-center p-10 gap-8">
        <div className="text-white/80 max-w-sm">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="h-3 w-3" />
            Tecnovich · Taller Integrador
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Sistema de Reservas
          </h1>
          <p className="mt-3 text-white/70">
            Gestión inteligente de materiales y talleres. Con estadísticas por día, semana y
            alertas de bajo stock en tiempo real.
          </p>
        </div>
        <div className="h-64 w-full max-w-md rounded-2xl overflow-hidden border border-white/10">
          <DotBorderButton mode="dark" label="Start Creating" />
        </div>
      </div>

      {/* Panel derecho: formulario */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl bg-background/95 p-8 shadow-2xl backdrop-blur">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground text-xl font-bold">SR</div>
            <h2 className="text-xl font-bold tracking-tight">
              {mode === "login" ? "Ingresar al sistema" : "Crear cuenta"}
            </h2>
            <p className="text-xs text-muted-foreground">Gestión de Materiales</p>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3">
            {mode === "signup" && (
              <>
                <div className="grid gap-1.5">
                  <Label>Nombre</Label>
                  <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" required />
                </div>
                <div className="grid gap-1.5">
                  <Label>Rol</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={rol}
                    onChange={(e) => setRol(e.target.value as any)}
                  >
                    <option value="Docente">Docente</option>
                    <option value="Coordinador">Coordinador</option>
                  </select>
                </div>
              </>
            )}
            <div className="grid gap-1.5">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" required />
            </div>
            <div className="grid gap-1.5">
              <Label>Contraseña</Label>
              <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>

            {err && <div className="rounded-md bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-950/40">{err}</div>}

            <Button type="submit" disabled={pending}>
              {pending ? "Procesando..." : mode === "login" ? "Ingresar" : "Registrarme"}
            </Button>
          </form>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            {mode === "login" ? (
              <>¿No tenés cuenta?{" "}
                <button className="font-semibold text-primary hover:underline" onClick={() => setMode("signup")}>
                  Registrarte
                </button>
              </>
            ) : (
              <>¿Ya tenés cuenta?{" "}
                <button className="font-semibold text-primary hover:underline" onClick={() => setMode("login")}>
                  Ingresar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
