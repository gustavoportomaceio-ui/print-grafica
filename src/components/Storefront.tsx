import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gift,
  Heart,
  Menu,
  MessageCircle,
  Search,
  UserRound,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { OrderCart } from "@/components/OrderCart";
import { brl, productsQuery, settingsQuery, type Product } from "@/lib/catalog";
import { cartSchema, orderTotals, resolveCart, type CartItem } from "@/lib/order";
import { catalogCategories, filterCategory } from "@/lib/categories";
import gifts from "@/assets/criattiva-gifts.jpg";

export function Storefront({
  view = "home",
  category = "",
}: {
  view?: "home" | "products" | "about" | "contact";
  category?: string;
}) {
  const { data: products } = useSuspenseQuery(productsQuery);
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const visible = products.filter((p) => p.active);
  const [search, setSearch] = useState("");
  const matchesSearch = (p: Product) =>
    (p.name + " " + p.description + " " + p.category)
      .toLocaleLowerCase("pt-BR")
      .includes(search.trim().toLocaleLowerCase("pt-BR"));
  const featuredItems = visible.filter((p) => p.featured);
  const phone = "5582996926540";
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
    try {
      localStorage.setItem("prisma-cart-v1", JSON.stringify(cart));
    } catch {
      // No customer details are persisted.
    }
  }, [cart, cartReady]);

  function addItem(
    product: Product,
    selected: Record<string, number>,
    notes: string,
    quantity: number,
  ) {
    if (cart.length >= 100) {
      setCartError("Carrinho cheio. Revise seus itens antes de adicionar mais.");
      return false;
    }
    setCartError("");
    setCart((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        productId: product.id,
        selected: { ...selected },
        notes: notes.trim(),
        quantity,
      },
    ]);
    return true;
  }

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const contactText =
    "Olá, Criattiva!\n\nNome: " +
    (contactName.trim() || "Não informado") +
    "\nE-mail: " +
    (contactEmail.trim() || "Não informado") +
    "\n\nMensagem: " +
    (contactMessage.trim() || "Gostaria de tirar uma dúvida.");
  const contactUrl = "https://wa.me/" + phone + "?text=" + encodeURIComponent(contactText);
  const emailUrl =
    "mailto:printcentermaceio@gmail.com?subject=" +
    encodeURIComponent("Contato pelo site - Criattiva") +
    "&body=" +
    encodeURIComponent(contactText);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const featuredCarouselRef = useRef<HTMLDivElement>(null);
  const categories = catalogCategories(visible);
  const catalogItems = filterCategory(visible.filter(matchesSearch), category);
  const slide = (direction: -1 | 1) => {
    const track = featuredCarouselRef.current;
    if (!track) return;
    const positions = Array.from(track.children).map(
      (child) =>
        child.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft,
    );
    const target =
      direction > 0
        ? positions.find((x) => x > track.scrollLeft + 4)
        : [...positions].reverse().find((x) => x < track.scrollLeft - 4);
    if (target !== undefined)
      track.scrollTo({
        left: target,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  };
  const productLinks = (
    <>
      <Link
        to="/produtos"
        search={{ categoria: "" }}
        onClick={() => {
          setProductsMenuOpen(false);
          setMobileMenuOpen(false);
        }}
      >
        Todos os produtos
      </Link>
      {categories.map((c) => (
        <Link
          key={c}
          to="/produtos"
          search={{ categoria: c }}
          onClick={() => {
            setProductsMenuOpen(false);
            setMobileMenuOpen(false);
          }}
        >
          {c}
        </Link>
      ))}
    </>
  );
  return (
    <div className="criattiva-site min-h-screen pb-24">
      <header className="store-header sticky top-0 z-20 border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to="/"
            aria-label="Criattiva — início"
            className="brand-name flex shrink-0 items-center font-display text-4xl font-black tracking-tight text-primary"
          >
            Criattiva<span className="brand-star" aria-hidden="true">✦</span>
          </Link>
          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-8 text-sm font-bold lg:flex"
          >
            <Link to="/" className={view === "home" ? "nav-current" : "nav-link"}>
              Início
            </Link>
            <div className="relative">
              <Button
                variant="ghost"
                className="nav-link px-0 text-sm font-bold"
                aria-expanded={productsMenuOpen}
                aria-controls="product-menu"
                onClick={() => setProductsMenuOpen((v) => !v)}
              >
                Produtos <ChevronDown />
              {productsMenuOpen && (
                <nav
                  id="product-menu"
                  aria-label="Categorias de produtos"
                  className="category-menu absolute left-0 top-full mt-3 w-72 border border-border bg-card p-2 shadow-card"
                >
                  {productLinks}
                </nav>
              )}
            </div>
            <Link to="/sobre">Sobre nós</Link>
            <Link to="/contato">Contato</Link>
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hidden h-11 w-11 text-secondary sm:inline-flex"
              aria-label="Ver produtos"
              onClick={() => { window.location.href = "/produtos"; }}
            >
              <Search className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden h-11 w-11 text-secondary sm:inline-flex"
              aria-label="Área do administrador"
              onClick={() => { window.location.href = "/admin"; }}
            >
              <UserRound className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-11 w-11 text-secondary"
              aria-label={"Abrir carrinho, " + count + " itens"}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag />
              <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-xs text-secondary-foreground">
                {count}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 lg:hidden"
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav
            aria-label="Menu móvel"
            className="category-menu border-t border-border px-4 pb-5 lg:hidden"
          >
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              Início
            </Link>
            <strong className="block px-3 pt-3 text-secondary">Produtos</strong>
            {productLinks}
            <Link to="/sobre" onClick={() => setMobileMenuOpen(false)}>
              Sobre nós
            </Link>
            <Link to="/contato" onClick={() => setMobileMenuOpen(false)}>
              Contato
            </Link>
          </nav>
        )}
      </header>
      {view === "home" && (
        <>
          <section className="gift-banner relative isolate overflow-hidden">
            <img
              src={gifts}
              alt="Composição ilustrativa de presentes personalizados: canecas, garrafa, bolsa e caixa de presente"
              width={1536}
              height={1024}
              className="gift-banner-image absolute inset-0 h-full w-full object-cover"
            />
            <div className="gift-banner-shade absolute inset-0" />
            <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
              <div className="gift-copy max-w-lg">
                <p className="mb-3 text-sm font-extrabold uppercase tracking-wider text-secondary">Criativos • Autênticos • Com a sua marca</p>
                <h1 className="font-display text-5xl font-black leading-[0.94] text-secondary sm:text-6xl lg:text-7xl">
                  Presentes e<br />Brindes<br />Personalizados
                </h1>
                <Button asChild className="mt-7 h-12 rounded-full bg-secondary px-7 font-bold text-secondary-foreground hover:bg-secondary/90">
                  <Link to="/produtos" search={{ categoria: "" }}>
                    Conheça nossos produtos <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
            <svg
              className="banner-wave absolute bottom-0 left-0 h-12 w-full"
              viewBox="0 0 1440 70"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0 30C180 90 350 0 550 30S880 80 1080 30 1300 10 1440 35V70H0Z" />
            </svg>
          </section>
          <section
            aria-label="Benefícios Criattiva"
            className="benefits-band"
          >
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-5 gap-y-6 px-5 py-8 lg:grid-cols-4 lg:px-8">
              {[
                { icon: Heart, label: "Presentes especiais" },
                { icon: Gift, label: "Brindes personalizados" },
                { icon: Sparkles, label: "Produtos criativos" },
                { icon: BadgeCheck, label: "Qualidade e autenticidade" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon className="h-8 w-8 shrink-0" strokeWidth={1.5} />
                  <h2 className="text-sm font-bold leading-snug sm:text-base">{label}</h2>
                </div>
              ))}
            </div>
          </section>
          <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-7 flex items-center justify-between gap-3">
              <div>
                <h2 className="featured-heading text-3xl font-black text-secondary sm:text-4xl lg:text-5xl">
                  <span aria-hidden="true">〰</span> Nossos Destaques <span aria-hidden="true">〰</span>
                </h2>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 touch-manipulation rounded-full"
                  aria-label="Destaques anteriores"
                  onClick={() => slide(-1)}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 touch-manipulation rounded-full"
                  aria-label="Próximos destaques"
                  onClick={() => slide(1)}
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
            <div
              ref={featuredCarouselRef}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 touch-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {featuredItems.map((p) => (
                <div
                  key={p.id}
                  data-carousel-card
                  className="w-full min-w-0 shrink-0 snap-start sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]"
                >
                  <ProductCard product={p} onAdd={addItem} />
                </div>
              ))}
            </div>
            {!featuredItems.length && (
              <p className="py-8 text-muted-foreground">Nenhum produto em destaque no momento.</p>
            )}
            <div className="mt-6 text-center">
              <Button variant="outline" asChild className="h-12 px-6">
                <Link to="/produtos" search={{ categoria: "" }}>
                  Todos os produtos <ArrowRight />
                </Link>
              </Button>
            </div>
          </main>
          <section className="creative-band relative overflow-hidden bg-secondary px-5 py-12 text-secondary-foreground">
            <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <p className="mb-2 text-sm font-bold text-yellow">
                  Sua ideia, nosso toque criativo.
                </p>
                <h2 className="text-3xl font-extrabold">Pequenos detalhes. Grandes sorrisos.</h2>
              </div>
              <Button asChild>
                <Link to="/sobre">
                  Conheça a Criattiva <ArrowRight />
                </Link>
              </Button>
            </div>
          </section>
        </>
      )}
      {view === "products" && (
        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-sm font-bold text-primary">Catálogo Criattiva</p>
              <h1 className="text-3xl font-extrabold text-secondary sm:text-4xl">
                {category || "Todos os produtos"}
              </h1>
            </div>
            <label className="flex w-full items-center gap-3 rounded-md border border-border bg-card px-3 md:max-w-sm">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar no catálogo..."
                aria-label="Buscar no catálogo"
                className="h-12 min-w-0 flex-1 bg-transparent outline-none"
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Limpar busca"
                  onClick={() => setSearch("")}
                >
                  <X />
                </Button>
              )}
            </label>
          </div>
          <nav aria-label="Filtrar categorias" className="mb-8 flex flex-wrap gap-2">
            <Button asChild variant={category ? "outline" : "default"}>
              <Link to="/produtos" search={{ categoria: "" }}>
                Todos os produtos
              </Link>
            </Button>
            {categories.map((c) => (
              <Button
                asChild
                key={c}
                variant={category === c ? "default" : "outline"}
                className="h-auto min-h-10 whitespace-normal text-left"
              >
                <Link to="/produtos" search={{ categoria: c }}>
                  {c}
                </Link>
              </Button>
            ))}
          </nav>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {catalogItems.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={addItem} />
            ))}
          </div>
          {!catalogItems.length && (
            <p className="py-16 text-center text-muted-foreground">
              Nenhum produto encontrado nesta categoria.
            </p>
          )}
        </main>
      )}
      {view === "about" && (
        <main className="mx-auto max-w-4xl px-5 py-16">
          <p className="mb-3 font-bold text-primary">Sobre nós</p>
          <h1 className="text-4xl font-extrabold text-secondary">Criattiva</h1>
          <h2 className="mt-8 text-2xl font-bold">Criatividade que aproxima.</h2>
          <p className="mt-5 text-lg leading-relaxed">
            Presentes especiais, brindes personalizados e produtos criativos para dar forma às suas
            ideias. Cada escolha carrega um pouco de quem presenteia e de quem recebe.
          </p>
          <p className="mt-5 text-lg leading-relaxed">
            Qualidade, autenticidade e atenção aos detalhes para celebrar pessoas e valorizar
            marcas.
          </p>
          <Button asChild className="mt-8 h-12">
            <Link to="/contato">
              Vamos conversar <ArrowRight />
            </Link>
          </Button>
        </main>
      )}
      {view === "contact" && (
        <main className="mx-auto max-w-4xl px-5 py-16">
          <p className="mb-3 font-bold text-primary">Contato</p>
          <h1 className="text-4xl font-extrabold text-secondary">Fale com a Criattiva</h1>
          <p className="mt-6 text-lg leading-relaxed">
            Vamos dar vida à sua ideia? Converse com a gente sobre produtos, personalização e
            orçamento.
          </p>
          <div className="mt-8 grid gap-5">
            <label className="grid gap-2 font-semibold">
              Seu nome
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                maxLength={100}
                className="h-12 rounded-md border border-input bg-card px-3"
              />
            </label>
            <label className="grid gap-2 font-semibold">
              Seu e-mail (opcional)
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                maxLength={254}
                className="h-12 rounded-md border border-input bg-card px-3"
              />
            </label>
            <label className="grid gap-2 font-semibold">
              Como podemos ajudar?
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                maxLength={2000}
                rows={4}
                className="rounded-md border border-input bg-card p-3"
              />
            </label>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="h-12">
              <a href={contactUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle /> Falar pelo WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" className="h-12">
              <a href={emailUrl}>
                Enviar e-mail <ArrowRight />
              </a>
            </Button>
          </div>
        </main>
      )}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 py-8 sm:flex-row">
          <div>
            <strong className="font-display text-2xl text-primary">Criattiva</strong>
            <p className="mt-2 text-sm text-muted-foreground">
              © {new Date().getFullYear()} · Criatividade para presentear.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-sm">
            <Link to="/contato">Fale conosco</Link>
            <Link to="/admin">Área do administrador</Link>
          </div>
        </div>
      </footer>
      {cartError && (
        <p role="alert" className="px-4 text-center text-sm text-destructive">
          {cartError}
        </p>
      )}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              {count} {count === 1 ? "item" : "itens"}
              {hasQuote ? " · + sob consulta" : ""}
            </p>
            <p className="text-lg font-extrabold text-secondary">{brl(total)}</p>
          </div>
          <Button className="h-12 px-4 sm:px-6" onClick={() => setCartOpen(true)}>
            <ShoppingBag /> Ver orçamento
          </Button>
        </div>
      </div>
      <OrderCart
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={items}
        settings={settings}
        onRemove={(id) => setCart((previous) => previous.filter((item) => item.id !== id))}
        onChange={(id, update) =>
          setCart((previous) =>
            previous.map((item) =>
              item.id === id
                ? {
                    ...item,
                    ...update,
                    selected: update.selected ?? item.selected,
                    quantity: update.quantity ?? item.quantity,
                  }
                : item,
            ),
          )
        }
        onClear={() => setCart([])}
      />
    </div>
  );
}
