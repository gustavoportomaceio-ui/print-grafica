import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { MessageCircle, ShoppingBag, Menu, X, Search } from "lucide-react";
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
  const list = filtered.filter((p) => `${p.name} ${p.description} ${p.category}`.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR")));
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

  const gridClass = "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3";

  return (
    <div className="min-h-screen pb-24">
      <div className="cmyk-bar h-1.5" />
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="/images/print-center-logo.svg" alt="Print Center" className="h-11 w-auto max-w-[180px] object-contain" />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" className="h-11 w-11 p-0 sm:hidden" aria-label="Abrir menu" onClick={() => setMobileMenuOpen((s) => !s)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Button asChild variant="ghost" className="h-11 w-11 p-0 sm:w-auto sm:px-3" aria-label="Fale conosco pelo WhatsApp">
              <a href={phone ? `https://wa.me/${phone}` : "#catalogo"} target={phone ? "_blank" : undefined} rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> <span className="hidden sm:inline">Fale conosco</span>
              </a>
            </Button>
            <Button variant="outline" className="h-11 gap-1.5 px-3" aria-label={`Abrir carrinho, ${count} itens`} onClick={() => setCartOpen(true)}><ShoppingBag /><span>{count}</span></Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden border-t bg-background/95 px-4 py-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <strong className="font-display">Navegação</strong>
                <span className="text-sm text-muted-foreground">· {list.length} produtos</span>
              </div>
            </div>
            <div className="-mx-4 mb-2 flex gap-2 overflow-x-auto px-4 pb-2">
              {categories.map((c) => (
                <Button
                  key={c}
                  onClick={() => { setCat(c); setMobileMenuOpen(false); }}
                  variant={cat === c ? "default" : "outline"}
                  className={`h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${cat === c ? "border-ink bg-ink text-ink-foreground" : "bg-card hover:border-foreground/40"}`}
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>
        )}
      </header>

      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-6xl px-4 py-7 md:py-10">
          <p className="mb-2 text-xs font-semibold uppercase text-primary">Serviços gráficos</p>
          <h1 className="max-w-3xl break-words text-3xl font-extrabold leading-tight md:text-5xl">Impressão que destaca sua marca.</h1>
          <p className="mt-2 max-w-xl text-base text-ink-foreground/70">{settings.tagline || "Soluções gráficas para sua empresa, seu negócio e suas ideias."}</p>
          <a href="#catalogo" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 font-bold text-primary-foreground transition hover:opacity-90">Ver produtos</a>
        </div>
      </section>

      <main id="catalogo" className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-xl font-bold">Nossos produtos</h2>
          <span className="shrink-0 text-sm text-muted-foreground">{list.length} {list.length === 1 ? "produto" : "produtos"}</span>
        </div>
        <label className="mb-4 flex min-h-12 items-center gap-3 rounded-xl border bg-card px-4 shadow-sm focus-within:ring-2 focus-within:ring-ring">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cartões, banners, adesivos..." aria-label="Buscar produtos" className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground" />
          {search && <button type="button" onClick={() => setSearch("")} className="text-sm font-semibold text-primary">Limpar</button>}
        </label>

        <div className="-mx-4 mb-5 hidden gap-2 overflow-x-auto px-4 pb-2 sm:flex">
          {categories.map((c) => (
            <Button
              key={c}
              onClick={() => setCat(c)}
              variant="outline"
              aria-pressed={cat === c}
              className={`h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                cat === c ? "border-ink bg-ink text-ink-foreground" : "bg-card hover:border-foreground/40"
              }`}
            >
              {c}
            </Button>
          ))}
        </div>

        <div className={gridClass}>
          {list.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={addItem} />
          ))}
        </div>
        {list.length === 0 && (
          <p className="py-20 text-center text-muted-foreground">Nenhum produto nesta categoria.</p>
        )}
      </main>

      {cartError && <p role="alert" className="px-4 text-center text-sm text-destructive">{cartError}</p>}

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Print Center</span>
          <Link to="/admin" className="hover:text-foreground">Área do administrador</Link>
        </div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{count} {count === 1 ? "item" : "itens"}{hasQuote ? " · + sob consulta" : ""}</p>
            <p className="font-display text-lg font-bold">{brl(total)}</p>
          </div>
          <Button className="h-12 px-5 text-base font-bold" onClick={() => setCartOpen(true)}><ShoppingBag /> {count ? "Ver pedido" : "Ver carrinho"}</Button>
        </div>
      </div>

      <OrderCart
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={items}
        settings={settings}
        onRemove={(id) => setCart((previous) => previous.filter((item) => item.id !== id))}
        onChange={(id, update) => setCart((previous) => previous.map((item) => item.id === id ? { ...item, ...update, selected: update.selected ?? item.selected, quantity: update.quantity ?? item.quantity } : item))}
        onClear={() => setCart([])}
      />
    </div>
  );
}
