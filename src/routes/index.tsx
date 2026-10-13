import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MessageCircle, Zap, BadgeCheck, Truck } from "lucide-react";
import { productsQuery, settingsQuery } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Catálogo de Serviços Gráficos — Peça pelo WhatsApp" },
      { name: "description", content: "Cartões de visita, panfletos, banners, adesivos e lonas. Escolha as opções e peça pelo WhatsApp em um clique." },
      { property: "og:title", content: "Catálogo de Serviços Gráficos" },
      { property: "og:description", content: "Escolha seu material gráfico e peça pelo WhatsApp em um clique." },
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
  const list = cat === "Todos" ? visible : visible.filter((p) => p.category === cat);
  const phone = settings.whatsapp.replace(/\D/g, "");

  return (
    <div className="min-h-screen">
      <div className="cmyk-bar h-1.5" />
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-ink font-display text-lg font-extrabold text-ink-foreground">
              {settings.store_name.charAt(0)}
            </div>
            <span className="font-display text-lg font-bold">{settings.store_name}</span>
          </div>
          <a
            href={phone ? `https://wa.me/${phone}` : "#catalogo"}
            target={phone ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-4 py-2 text-sm font-bold text-whatsapp-foreground"
          >
            <MessageCircle className="h-4 w-4" /> <span className="hidden sm:inline">Fale conosco</span>
          </a>
        </div>
      </header>

      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <p className="mb-3 inline-block rounded-full border border-ink-foreground/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Gráfica rápida
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] md:text-6xl">
            Sua marca impressa com <span className="text-primary">qualidade</span>.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-foreground/70">{settings.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-foreground/80">
            <span className="flex items-center gap-2"><Zap className="h-4 w-4 text-yellow" /> Orçamento na hora</span>
            <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-cyan" /> Sem cadastro</span>
            <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-magenta" /> Entrega rápida</span>
          </div>
        </div>
      </section>

      <main id="catalogo" className="mx-auto max-w-6xl px-4 py-10">
        <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                cat === c ? "border-ink bg-ink text-ink-foreground" : "bg-card hover:border-foreground/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} settings={settings} />
          ))}
        </div>
        {list.length === 0 && (
          <p className="py-20 text-center text-muted-foreground">Nenhum produto nesta categoria.</p>
        )}
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} {settings.store_name}</span>
          <Link to="/admin" className="hover:text-foreground">Área do administrador</Link>
        </div>
      </footer>
    </div>
  );
}
