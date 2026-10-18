import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Plus, Trash2, Save, LogOut, ImagePlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { productsQuery, settingsQuery, type Product, type ProductOption } from "@/lib/catalog";
import { AdminOrders } from "@/components/AdminOrders";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel do administrador — Catálogo Gráfico" },
      { name: "description", content: "Gerencie produtos, preços e fotos do catálogo." },
      { property: "og:title", content: "Painel do administrador" },
      { property: "og:description", content: "Gerencie o catálogo de serviços gráficos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const input =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const btn =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 h-10 text-sm font-semibold transition disabled:opacity-50";

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return setIsAdmin(null);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  if (!ready) return null;
  if (!session) return <AuthForm />;
  if (isAdmin === null) return <p className="p-10 text-center">Carregando…</p>;
  if (!isAdmin)
    return (
      <div className="p-10 text-center">
        <p>Esta conta não tem permissão de administrador.</p>
        <button className={`${btn} mt-4 border`} onClick={() => supabase.auth.signOut()}>Sair</button>
      </div>
    );
  return <Dashboard />;
}

function AuthForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = username.trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,32}$/.test(normalized)) {
      setMsg("Use um usuário de 3 a 32 caracteres: letras, números, ponto, hífen ou sublinhado.");
      return;
    }
    setBusy(true);
    setMsg("");
    const { error } = await supabase.auth.signInWithPassword({
      email: `${normalized}@printgrafica-admin.com`,
      password,
    });
    setBusy(false);
    if (error) setMsg("Usuário ou senha inválidos. Confirme também se o acesso administrativo foi configurado.");
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-card p-6 shadow-card">
        <h1 className="text-2xl font-extrabold">Painel do administrador</h1>
        <p className="text-sm text-muted-foreground">Entre com seu usuário e senha.</p>
        <input className={input} type="text" autoComplete="username" required minLength={3} maxLength={32} placeholder="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className={input} type="password" autoComplete="current-password" required minLength={8} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
        {msg && <p role="alert" className="text-sm text-destructive">{msg}</p>}
        <button disabled={busy} className={`${btn} w-full bg-primary text-primary-foreground`}>
          {busy ? "Entrando…" : "Entrar"}
        </button>
        <Link to="/" className="block text-center text-sm text-muted-foreground">← Voltar ao catálogo</Link>
      </form>
    </div>
  );
}

function Dashboard() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery(productsQuery);
  const [editing, setEditing] = useState<Product | null>(null);

  const blank: Product = {
    id: "", name: "", category: "Outros", showcase: "produtos", description: "", image_url: null, base_price: 0,
    price_note: "", options: [{ name: "Quantidade", choices: [{ label: "100 unidades", price: 0 }] }],
    featured: false, active: true, sort_order: products.length + 1,
  };

  return (
    <div className="min-h-screen">
      <div className="cmyk-bar h-1.5" />
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold">Painel</h1>
          <div className="flex gap-2">
            <Link to="/" className={`${btn} border`}>Ver catálogo</Link>
            <button className={`${btn} border`} onClick={() => supabase.auth.signOut()}><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <AdminOrders />
        <SettingsForm />
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Produtos</h2>
            <button className={`${btn} bg-primary text-primary-foreground`} onClick={() => setEditing(blank)}>
              <Plus className="h-4 w-4" /> Novo produto
            </button>
          </div>
          <div className="divide-y rounded-2xl border bg-card">
            {products.map((p) => (
              <button key={p.id} onClick={() => setEditing(p)} className="flex w-full items-center gap-4 p-3 text-left hover:bg-muted">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{p.name} {!p.active && <span className="text-xs text-muted-foreground">(oculto)</span>}</div>
                  <div className="text-sm text-muted-foreground">{p.category} · {p.showcase === "servicos" ? "Serviços" : "Produtos"}</div>
                </div>
                <div className="text-sm font-semibold">
                  {p.base_price !== null ? `R$ ${p.base_price.toFixed(2)}` : p.price_note || "Sob consulta"}
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
      {editing && (
        <ProductEditor
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["products"] }); setEditing(null); }}
        />
      )}
    </div>
  );
}

function SettingsForm() {
  const qc = useQueryClient();
  const { data } = useQuery(settingsQuery);
  const [s, setS] = useState({ store_name: "", whatsapp: "", tagline: "" });
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (data) setS(data); }, [data]);

  async function save() {
    const { error } = await supabase.from("settings").update(s).eq("id", 1);
    if (error) return alert(error.message);
    qc.invalidateQueries({ queryKey: ["settings"] });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section className="rounded-2xl border bg-card p-5">
      <h2 className="mb-4 text-xl font-bold">Dados da loja</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Nome da loja"><input className={input} value={s.store_name} onChange={(e) => setS({ ...s, store_name: e.target.value })} /></Field>
        <Field label="WhatsApp (com DDI e DDD)"><input className={input} placeholder="5511999999999" value={s.whatsapp} onChange={(e) => setS({ ...s, whatsapp: e.target.value })} /></Field>
        <Field label="Frase de destaque"><input className={input} value={s.tagline} onChange={(e) => setS({ ...s, tagline: e.target.value })} /></Field>
      </div>
      <button onClick={save} className={`${btn} mt-4 bg-ink text-ink-foreground`}><Save className="h-4 w-4" /> {saved ? "Salvo!" : "Salvar"}</button>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

async function fileToDataUrl(file: File): Promise<string> {
  const img = await createImageBitmap(file);
  const max = 1200;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.82);
}

function ProductEditor({ product, onClose, onSaved }: { product: Product; onClose: () => void; onSaved: () => void }) {
  const [p, setP] = useState<Product>(structuredClone(product));
  const [hasPrice, setHasPrice] = useState(product.base_price !== null);
  const [busy, setBusy] = useState(false);

  const setOpt = (i: number, o: ProductOption) => setP({ ...p, options: p.options.map((x, j) => (j === i ? o : x)) });

  async function save() {
    if (!p.name.trim()) return alert("Informe o nome do produto.");
    setBusy(true);
    const row = {
      name: p.name, category: p.category, showcase: p.showcase, description: p.description, image_url: p.image_url,
      base_price: hasPrice ? Number(p.base_price) || 0 : null, price_note: p.price_note,
      options: p.options as unknown as never, featured: p.featured, active: p.active, sort_order: p.sort_order,
    };
    const { error } = p.id
      ? await supabase.from("products").update(row).eq("id", p.id)
      : await supabase.from("products").insert(row);
    setBusy(false);
    if (error) return alert(error.message);
    onSaved();
  }

  async function remove() {
    if (!confirm("Excluir este produto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) return alert(error.message);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 sm:items-center sm:p-4">
      <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-card p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{p.id ? "Editar produto" : "Novo produto"}</h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center gap-4">
            <div className="h-24 w-32 overflow-hidden rounded-lg bg-muted">
              {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}
            </div>
            <label className={`${btn} cursor-pointer border`}>
              <ImagePlus className="h-4 w-4" /> Trocar foto
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) setP({ ...p, image_url: await fileToDataUrl(f) });
              }} />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nome"><input className={input} value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></Field>
            <Field label="Categoria do item"><input className={input} value={p.category} onChange={(e) => setP({ ...p, category: e.target.value })} placeholder="Ex.: Cartões, Copos, Chaveiros" /></Field>
            <Field label="Exibir na vitrine">
              <select className={input} value={p.showcase} onChange={(e) => setP({ ...p, showcase: e.target.value as Product["showcase"] })}>
                <option value="servicos">Serviços</option>
                <option value="produtos">Produtos</option>
              </select>
            </Field>
          </div>
          <Field label="Descrição">
            <textarea className={`${input} h-24 py-2`} value={p.description} onChange={(e) => setP({ ...p, description: e.target.value })} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={hasPrice} onChange={(e) => setHasPrice(e.target.checked)} /> Mostrar preço
            </label>
            {hasPrice ? (
              <Field label="Preço base (R$)"><input type="number" step="0.01" className={input} value={p.base_price ?? 0} onChange={(e) => setP({ ...p, base_price: Number(e.target.value) })} /></Field>
            ) : (
              <Field label="Texto do preço"><input className={input} placeholder="Sob consulta" value={p.price_note ?? ""} onChange={(e) => setP({ ...p, price_note: e.target.value })} /></Field>
            )}
            <Field label="Ordem"><input type="number" className={input} value={p.sort_order} onChange={(e) => setP({ ...p, sort_order: Number(e.target.value) })} /></Field>
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <label className="flex items-center gap-2"><input type="checkbox" checked={p.active} onChange={(e) => setP({ ...p, active: e.target.checked })} /> Visível no catálogo</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={p.featured} onChange={(e) => setP({ ...p, featured: e.target.checked })} /> Selo "Mais pedido"</label>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-bold">Opções (tamanho, quantidade, acabamento…)</h3>
              <button className="text-sm font-semibold text-primary" onClick={() => setP({ ...p, options: [...p.options, { name: "Nova opção", choices: [{ label: "Opção 1", price: 0 }] }] })}>+ Opção</button>
            </div>
            <div className="space-y-3">
              {p.options.map((o, i) => (
                <div key={i} className="rounded-xl border bg-background p-3">
                  <div className="mb-2 flex gap-2">
                    <input className={input} value={o.name} onChange={(e) => setOpt(i, { ...o, name: e.target.value })} />
                    <button className="px-2 text-destructive" onClick={() => setP({ ...p, options: p.options.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></button>
                  </div>
                  {o.choices.map((c, k) => (
                    <div key={k} className="mb-2 flex gap-2">
                      <input className={input} placeholder="Escolha" value={c.label} onChange={(e) => setOpt(i, { ...o, choices: o.choices.map((x, m) => (m === k ? { ...x, label: e.target.value } : x)) })} />
                      {hasPrice && (
                        <input type="number" step="0.01" title="Acréscimo em R$" className={`${input} w-28`} value={c.price} onChange={(e) => setOpt(i, { ...o, choices: o.choices.map((x, m) => (m === k ? { ...x, price: Number(e.target.value) } : x)) })} />
                      )}
                      <button className="px-2 text-muted-foreground" onClick={() => setOpt(i, { ...o, choices: o.choices.filter((_, m) => m !== k) })}><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                  <button className="text-sm text-primary" onClick={() => setOpt(i, { ...o, choices: [...o.choices, { label: "", price: 0 }] })}>+ Escolha</button>
                </div>
              ))}
            </div>
            {hasPrice && <p className="mt-2 text-xs text-muted-foreground">O valor ao lado de cada escolha é somado ao preço base.</p>}
          </div>
        </div>

        <div className="mt-6 flex justify-between gap-2">
          {p.id ? <button onClick={remove} className={`${btn} text-destructive`}><Trash2 className="h-4 w-4" /> Excluir</button> : <span />}
          <button disabled={busy} onClick={save} className={`${btn} bg-primary text-primary-foreground`}><Save className="h-4 w-4" /> Salvar</button>
        </div>
      </div>
    </div>
  );
}
