import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { MessageCircle, ShoppingBag, Menu, X, Search, ArrowRight, BadgeCheck, Zap, Headset } from "lucide-react";
import { productsQuery, settingsQuery } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { OrderCart } from "@/components/OrderCart";
import { brl, type Product } from "@/lib/catalog";
import { cartSchema, orderTotals, resolveCart, type CartItem } from "@/lib/order";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Print Center | Gráfica e Comunicação Visual" },
      { name: "description", content: "Print Center: cartões, panfletos, banners, adesivos e materiais gráficos personalizados. Monte seu pedido e finalize pelo WhatsApp." },
      { property: "og:title", content: "Print Center | Gráfica e Comunicação Visual" },
      { property: "og:description", content: "Personalize seus materiais gráficos, reúna seus itens no carrinho e conclua o pedido pelo WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(productsQuery),
      context.queryClient.ensureQueryData(settingsQuery),
    ]),
  component: Index,
});

function Index() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const visible = products.filter((p) => p.active);
  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(visible.map((p) => p.category)))],
    [visible],
  );
  const [cat, setCat] = useState("Todos");
  const [search, setSearch] = useState("");
  const filtered = cat === "Todos" ? visible : visible.filter((p) => p.category === cat);
  const list = filtered.filter((p) => (p.name + " " + p.description + " " + p.category).toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR")));
  const phone = settings.whatsapp.replace(/\D/g, "");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartError, setCartError] = useState("");
  const items = resolveCart(cart, products);
  const { total, count, hasQuote } = orderTotals(items);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("prisma-cart-v1");
      if (stored) {
        const parsed = cartSchema.safeParse(JSON.parse(stored));
        if (parsed.success) setCart(parsed.data);
      }
    } catch {
      // Storage may be unavailable; the cart still works in memory.
    }
    setCartReady(true);
  }, []);

  useEffect(() => {
    if (!cartReady) return;
    try { localStorage.setItem("prisma-cart-v1", JSON.stringify(cart)); } catch {
      // No customer details are persisted.
    }
  }, [cart, cartReady]);

  function addItem(product: Product, selected: Record<string, number>, notes: string) {
    if (cart.length >= 100) { setCartError("Carrinho cheio. Revise seus itens antes de adicionar mais."); return false; }
    setCartError("");
    setCart((previous) => [...previous, { id: crypto.randomUUID(), productId: product.id, selected: { ...selected }, notes: notes.trim(), quantity: 1 }]);
    return true;
  }

  const gridClass = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <div className="min-h-screen pb-24">
      <div className="cmyk-bar h-1.5" />
      <header className="site-header sticky top-0 z-20 border-b border-white/10 bg-[#070d22]/95 text-white backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Print Center - início" className="flex shrink-0 items-center">
            <img src="/images/print-center-horizontal.svg" alt="Print Center" className="site-logo h-auto w-[170px] max-w-[45vw] object-contain sm:w-[250px]" />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-200 lg:flex" aria-label="Navegação principal">
            <a className="nav-link nav-link-active" href="#inicio">Início</a>
            <a className="nav-link" href="#catalogo">Produtos</a>
            <a className="nav-link" href="#catalogo">Acabamentos</a>
            <a className="nav-link" href="#diferenciais">Sobre nós</a>
            <a className="nav-link" href="#contato">Contato</a>
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Button asChild className="h-10 gap-2 rounded-xl px-3 text-xs font-bold sm:h-11 sm:px-5 sm:text-sm">
              <a href={phone ? "https://wa.me/" + phone : "#contato"} target={phone ? "_blank" : undefined} rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> <span className="hidden sm:inline">Solicitar orçamento</span><span className="sm:hidden">Orçamento</span>
              </a>
            </Button>
            <Button variant="ghost" className="relative h-11 w-11 p-0 text-white hover:bg-white/10 hover:text-white" aria-label={"Abrir carrinho, " + count + " itens"} onClick={() => setCartOpen(true)}>
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-magenta px-1 text-[10px] font-bold text-white">{count}</span>
            </Button>
            <Button variant="ghost" className="h-11 w-10 p-0 lg:hidden" aria-label="Abrir menu" onClick={() => setMobileMenuOpen((s) => !s)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#070d22] px-4 py-3 lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-wrap gap-2" aria-label="Menu móvel">
              {categories.map((c) => (
                <Button key={c} onClick={() => { setCat(c); setMobileMenuOpen(false); document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" }); }} variant={cat === c ? "default" : "outline"} className="h-10 rounded-full px-4 text-sm">
                  {c}
                </Button>
              ))}
              <a href="#diferenciais" onClick={() => setMobileMenuOpen(false)} className="inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-sm font-semibold text-white">Sobre nós</a>
              <a href="#contato" onClick={() => setMobileMenuOpen(false)} className="inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-sm font-semibold text-white">Contato</a>
            </nav>
          </div>
        )}
      </header>

      <section id="inicio" className="hero-section relative isolate overflow-hidden bg-ink text-ink-foreground">
        <div className="hero-image absolute inset-y-0 right-0 w-full md:w-[57%]">
          <img src="/images/banner.jpg" alt="Materiais gráficos impressos" className="h-full w-full object-cover object-center" />
        </div>
        <div className="hero-shade absolute inset-0" />
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:px-6 md:min-h-[430px] md:grid-cols-[0.95fr_1.05fr] md:py-14 lg:px-8">
          <div className="hero-copy max-w-2xl">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.28em] text-cyan">Impressão profissional</p>
            <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.03] tracking-tight sm:text-5xl lg:text-[3.35rem]">
              Sua marca merece uma <span className="text-cyan">impressão extraordinária.</span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">Materiais gráficos de alta qualidade para destacar sua empresa em cada detalhe.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#catalogo" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-magenta px-5 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:brightness-105 sm:px-6">
                <ShoppingBag className="h-5 w-5" /> Explorar produtos <ArrowRight className="h-4 w-4" />
              </a>
              <a href={phone ? "https://wa.me/" + phone : "#contato"} target={phone ? "_blank" : undefined} rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-white/75 bg-ink/35 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10 sm:px-6">
                <MessageCircle className="h-5 w-5" /> Falar com especialista
              </a>
            </div>
            <div id="diferenciais" className="mt-8 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3"><span className="hero-feature-icon"><BadgeCheck className="h-5 w-5" /></span><span><strong className="block text-sm">Qualidade profissional</strong><small className="mt-1 block text-xs text-white/65">Impressão de alto padrão</small></span></div>
              <div className="flex items-start gap-3"><span className="hero-feature-icon"><Zap className="h-5 w-5" /></span><span><strong className="block text-sm">Produção ágil</strong><small className="mt-1 block text-xs text-white/65">Seus materiais no prazo</small></span></div>
              <div className="flex items-start gap-3"><span className="hero-feature-icon"><Headset className="h-5 w-5" /></span><span><strong className="block text-sm">Atendimento especializado</strong><small className="mt-1 block text-xs text-white/65">Do orçamento à entrega</small></span></div>
            </div>
          </div>
          <div className="hidden md:block" aria-hidden="true" />
        </div>
      </section>

      <main id="catalogo" className="catalog-section mx-auto max-w-7xl px-4 py-8 text-white sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.22em] text-cyan">Nossos produtos</p>
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-3xl">Encontre o material ideal para sua marca</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">Soluções completas em impressão gráfica, com qualidade profissional e o melhor custo-benefício.</p>
          </div>
          <span className="text-sm text-slate-300 md:hidden">{list.length} {list.length === 1 ? "produto" : "produtos"}</span>
          <label className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-white/15 bg-[#11182d] px-4 shadow-sm transition focus-within:border-cyan focus-within:ring-2 focus-within:ring-cyan/20 md:max-w-sm">
            <Search className="h-5 w-5 shrink-0 text-slate-500" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar produtos..." aria-label="Buscar produtos" className="h-12 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400" />
            {search && <button type="button" onClick={() => setSearch("")} className="text-sm font-semibold text-cyan">Limpar</button>}
          </label>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
          {categories.map((c) => (
            <Button key={c} onClick={() => setCat(c)} variant="outline" aria-pressed={cat === c} className={"h-10 shrink-0 rounded-full border px-5 text-sm font-semibold transition " + (cat === c ? "border-magenta bg-magenta text-white hover:bg-magenta/90 hover:text-white" : "border-white/15 bg-[#11182d] text-slate-200 hover:border-cyan hover:bg-[#18223b] hover:text-white")}>
              {c}
            </Button>
          ))}
        </div>

        <div className={gridClass}>
          {list.map((p) => <ProductCard key={p.id} product={p} onAdd={addItem} />)}
        </div>
        {list.length === 0 && <p className="py-20 text-center text-muted-foreground">Nenhum produto nesta categoria.</p>}
      </main>

      <footer id="contato" className="border-t border-white/10 bg-[#070d22]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-7 text-sm text-slate-300 sm:flex-row sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Print Center · Impressão que destaca sua marca.</span>
          <div className="flex items-center gap-4"><a href={phone ? "https://wa.me/" + phone : "#catalogo"} target={phone ? "_blank" : undefined} rel="noopener noreferrer" className="font-semibold text-white hover:text-cyan">Fale conosco</a><Link to="/admin" className="text-slate-300 hover:text-white">Área do administrador</Link></div>
        </div>
      </footer>

      {cartError && <p role="alert" className="px-4 text-center text-sm text-destructive">{cartError}</p>}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#070d22]/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 text-white shadow-card backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="min-w-0"><p className="text-xs text-slate-300">{count} {count === 1 ? "item" : "itens"}{hasQuote ? " · + sob consulta" : ""}</p><p className="font-display text-lg font-extrabold text-white">{brl(total)}</p></div>
          <Button className="h-12 rounded-xl px-5 text-sm font-extrabold" onClick={() => setCartOpen(true)}><ShoppingBag className="h-4 w-4" /> {count ? "Ver pedido" : "Ver carrinho"}</Button>
        </div>
      </div>

      <OrderCart open={cartOpen} onOpenChange={setCartOpen} items={items} settings={settings}
        onRemove={(id) => setCart((previous) => previous.filter((item) => item.id !== id))}
        onChange={(id, update) => setCart((previous) => previous.map((item) => item.id === id ? { ...item, ...update, selected: update.selected ?? item.selected, quantity: update.quantity ?? item.quantity } : item))}
        onClear={() => setCart([])}
      />
    </div>
  );
}
