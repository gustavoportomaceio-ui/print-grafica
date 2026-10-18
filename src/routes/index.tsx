import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, ShoppingBag, Menu, X, Search, ArrowRight, BadgeCheck, Zap, Headset, ChevronLeft, ChevronRight, Mail, Send } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const matchesSearch = (p: Product) => (p.name + " " + p.description + " " + p.category).toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR"));
  const serviceItems = visible.filter((p) => p.showcase === "servicos" && matchesSearch(p));
  const productItems = visible.filter((p) => p.showcase === "produtos" && matchesSearch(p));
  const featuredItems = visible.filter((p) => p.featured && matchesSearch(p));
  const phone = "5582996926540";
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartError, setCartError] = useState("");
  const items = resolveCart(cart, products);
  const { total, count, hasQuote } = orderTotals(items);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const contactEmailAddress = "printcentermaceio@gmail.com";
  const contactWhatsApp = "5582996926540";
  const contactText = "Olá, Print Center!\n\nNome: " + (contactName.trim() || "Não informado") + "\nE-mail: " + (contactEmail.trim() || "Não informado") + "\n\nMensagem: " + (contactMessage.trim() || "Gostaria de tirar uma dúvida.");
  const whatsappContactUrl = "https://wa.me/" + contactWhatsApp + "?text=" + encodeURIComponent(contactText);
  const emailContactUrl = "mailto:" + contactEmailAddress + "?subject=" + encodeURIComponent("Contato pelo site - Print Center") + "&body=" + encodeURIComponent(contactText);

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

  const featuredCarouselRef = useRef<HTMLDivElement>(null);
  const catalogCarouselRef = useRef<HTMLDivElement>(null);
  const scrollCarousel = (ref: { current: HTMLDivElement | null }, direction: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>("[data-carousel-card]");
    const distance = firstCard ? firstCard.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: distance * direction, behavior: "smooth" });
  };
  const carouselCardClass = "min-w-0";
  const catalogItems = [...serviceItems, ...productItems];
  const catalogPages = Array.from({ length: Math.ceil(catalogItems.length / 8) }, (_, page) => catalogItems.slice(page * 8, page * 8 + 8));
  const scrollCatalog = (direction: -1 | 1) => {
    const el = catalogCarouselRef.current;
    if (el) el.scrollBy({ left: el.clientWidth * direction, behavior: "smooth" });
  };

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
            <a className="nav-link" href="#servicos">Serviços</a>
            <a className="nav-link" href="#catalogo">Produtos</a>
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
              <a href="#inicio" onClick={() => setMobileMenuOpen(false)} className="inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-sm font-semibold text-white">Início</a>
              <a href="#servicos" onClick={() => setMobileMenuOpen(false)} className="inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-sm font-semibold text-white">Serviços</a>
              <a href="#catalogo" onClick={() => setMobileMenuOpen(false)} className="inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-sm font-semibold text-white">Produtos</a>
              <a href="#diferenciais" onClick={() => setMobileMenuOpen(false)} className="inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-sm font-semibold text-white">Sobre nós</a>
              <a href="#contato" onClick={() => setMobileMenuOpen(false)} className="inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-sm font-semibold text-white">Contato</a>
            </nav>
          </div>
        )}
      </header>

      <section id="inicio" className="hero-section relative isolate overflow-hidden bg-ink text-ink-foreground">
        <div className="hero-image absolute inset-y-0 right-0 w-full md:w-[57%]">
          <img src="/images/print_center_banner_com_logo_svg_original.png" alt="Materiais gráficos e brindes personalizados da Print Center" className="h-full w-full object-cover object-right" />
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
            <div className="mt-8 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3"><span className="hero-feature-icon"><BadgeCheck className="h-5 w-5" /></span><span><strong className="block text-sm">Qualidade profissional</strong><small className="mt-1 block text-xs text-white/65">Impressão de alto padrão</small></span></div>
              <div className="flex items-start gap-3"><span className="hero-feature-icon"><Zap className="h-5 w-5" /></span><span><strong className="block text-sm">Produção ágil</strong><small className="mt-1 block text-xs text-white/65">Seus materiais no prazo</small></span></div>
              <div className="flex items-start gap-3"><span className="hero-feature-icon"><Headset className="h-5 w-5" /></span><span><strong className="block text-sm">Atendimento especializado</strong><small className="mt-1 block text-xs text-white/65">Do orçamento à entrega</small></span></div>
            </div>
          </div>
          <div className="hidden md:block" aria-hidden="true" />
        </div>
      </section>

      <main className="catalog-section mx-auto max-w-7xl px-4 py-8 text-white sm:px-6 lg:px-8 lg:py-10">
        {featuredItems.length > 0 && (
          <section className="mb-10 rounded-3xl border border-magenta/25 bg-gradient-to-br from-[#11182d] via-[#101a35] to-[#172441] p-4 shadow-card sm:p-6" aria-label="Produtos em destaque">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.22em] text-cyan">Seleção especial Print Center</p>
                <h2 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">{(!settings.tagline?.trim() || settings.tagline.trim() === "Impressão de qualidade, entrega rápida.") ? "Tudo o que você precisa para o volta às aulas do seu filho(a)!" : settings.tagline.trim()}</h2>
                <p className="mt-2 text-sm text-slate-300">Confira nossos produtos em destaque.</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" aria-label="Destaques anteriores" onClick={() => scrollCarousel(featuredCarouselRef, -1)} className="h-10 w-10 rounded-full border-white/20 bg-[#11182d] p-0 text-white shadow-sm transition hover:border-cyan/50 hover:bg-[#18223b] hover:text-cyan"><ChevronLeft className="h-5 w-5" /></Button>
                <Button variant="outline" aria-label="Próximos destaques" onClick={() => scrollCarousel(featuredCarouselRef, 1)} className="h-10 w-10 rounded-full border-white/20 bg-[#11182d] p-0 text-white shadow-sm transition hover:border-cyan/50 hover:bg-[#18223b] hover:text-cyan"><ChevronRight className="h-5 w-5" /></Button>
              </div>
            </div>
            <div ref={featuredCarouselRef} className="flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 active:cursor-grabbing touch-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {featuredItems.map((p) => <div key={p.id} data-carousel-card className={carouselCardClass}><ProductCard product={p} onAdd={addItem} /></div>)}
            </div>
          </section>
        )}
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.22em] text-cyan">Catálogo Print Center</p>
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-3xl">Soluções para destacar sua marca</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">Explore nossos serviços gráficos e produtos personalizados.</p>
          </div>
          <label className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-white/15 bg-[#11182d] px-4 shadow-sm transition focus-within:border-cyan focus-within:ring-2 focus-within:ring-cyan/20 md:max-w-sm">
            <Search className="h-5 w-5 shrink-0 text-slate-500" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar no catálogo..." aria-label="Buscar no catálogo" className="h-12 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-400" />
            {search && <button type="button" onClick={() => setSearch("")} className="text-sm font-semibold text-cyan">Limpar</button>}
          </label>
        </div>

        <section id="catalogo" className="scroll-mt-28 pb-10" aria-label="Serviços e produtos">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-cyan">Catálogo Print Center</p>
              <h2 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">Serviços/Produtos</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-sm text-slate-300">Impressos, soluções gráficas e produtos personalizados.</p>
                <span className="rounded-full border border-cyan/20 bg-cyan/10 px-2.5 py-1 text-xs font-bold text-cyan">{catalogItems.length} {catalogItems.length === 1 ? "item" : "itens"}</span>
              </div>
            </div>
            {catalogItems.length > 8 && (
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" aria-label="Itens anteriores" onClick={() => scrollCatalog(-1)} className="h-10 w-10 rounded-full border-white/20 bg-[#11182d] p-0 text-white shadow-sm transition hover:border-cyan/50 hover:bg-[#18223b] hover:text-cyan"><ChevronLeft className="h-5 w-5" /></Button>
                <Button variant="outline" aria-label="Próximos itens" onClick={() => scrollCatalog(1)} className="h-10 w-10 rounded-full border-white/20 bg-[#11182d] p-0 text-white shadow-sm transition hover:border-cyan/50 hover:bg-[#18223b] hover:text-cyan"><ChevronRight className="h-5 w-5" /></Button>
              </div>
            )}
          </div>
          {catalogItems.length > 0 ? (
            <div ref={catalogCarouselRef} className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-auto">
              {catalogPages.map((pageItems, pageIndex) => (
                <div key={pageIndex} data-carousel-card className="w-full shrink-0 snap-start pr-1">
                  <div className="grid grid-cols-2 grid-rows-4 gap-3 sm:gap-4 md:grid-cols-4 md:grid-rows-2">
                    {pageItems.map((p) => <div key={p.id} className={carouselCardClass}><ProductCard product={p} onAdd={addItem} /></div>)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-white/10 bg-[#11182d] px-5 py-8 text-sm text-slate-300">Nenhum serviço ou produto cadastrado nesta seção ainda.</p>
          )}
        </section>
      </main>

      <section id="diferenciais" className="scroll-mt-24 border-t border-white/10 bg-[#0b1228] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.22em] text-cyan">Conheça a Print Center</p>
            <h2 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">Sua marca merece ser <span className="text-cyan">lembrada.</span></h2>
            <p className="mt-5 text-base leading-relaxed text-slate-300">Na <strong className="text-white">Print Center</strong>, acreditamos que cada impressão é uma oportunidade de destacar sua marca, transmitir confiança e deixar uma ótima impressão. Há mais de 5 anos no mercado, trabalhamos para transformar ideias em materiais gráficos que valorizam negócios, fortalecem marcas e aproximam empresas de seus clientes.</p>
            <p className="mt-4 text-base leading-relaxed text-slate-300">Oferecemos soluções gráficas para diferentes necessidades, de cartões de visita e panfletos a banners, adesivos e materiais personalizados. Nosso compromisso é unir qualidade, atenção aos detalhes e atendimento próximo para ajudar cada cliente a encontrar a melhor solução para seu projeto.</p>
            <p className="mt-4 text-base leading-relaxed text-slate-300">Sabemos que por trás de cada pedido existe um objetivo: divulgar um negócio, conquistar novos clientes, apresentar um produto ou tornar uma marca mais presente no dia a dia. Por isso, cada trabalho é uma oportunidade de contribuir para o crescimento de quem confia em nós.</p>
            <div className="mt-6 rounded-r-2xl border-l-4 border-magenta bg-white/[0.04] px-5 py-4">
              <p className="text-lg font-extrabold leading-relaxed text-white sm:text-xl">Mais do que imprimir, queremos fazer parte da sua história.</p>
              <p className="mt-2 text-sm font-semibold text-cyan">Print Center — Impressão que destaca sua marca.</p>
            </div>
            <a href="#contato" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-magenta px-5 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:brightness-110">Vamos conversar? <ArrowRight className="h-4 w-4" /></a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#11182d] p-5 transition hover:border-cyan/35 sm:col-span-2 sm:p-6">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan/10 text-cyan"><BadgeCheck className="h-6 w-6" /></span>
              <h3 className="text-lg font-extrabold text-white">Qualidade em cada detalhe</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">Materiais gráficos pensados para apresentar sua marca com profissionalismo e cuidado.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#11182d] p-5 transition hover:border-cyan/35">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-magenta/10 text-pink-300"><Zap className="h-6 w-6" /></span>
              <h3 className="text-lg font-extrabold text-white">Soluções para sua ideia</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">Uma variedade de opções para divulgar seu negócio e fortalecer sua identidade.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#11182d] p-5 transition hover:border-cyan/35">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan/10 text-cyan"><Headset className="h-6 w-6" /></span>
              <h3 className="text-lg font-extrabold text-white">Atendimento próximo</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">Ajudamos você a encontrar a solução mais adequada para cada projeto.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contato" className="border-t border-white/10 bg-gradient-to-b from-[#11182d] to-[#070d22] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.22em] text-cyan">Estamos aqui para ajudar</p>
            <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">Fale com a Print Center</h2>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-slate-300">Tem dúvidas sobre um produto, prazo, arte ou orçamento? Envie sua mensagem pelo canal que preferir. É rápido e fácil.</p>
            <div className="mt-6 grid gap-3">
              <a href={"mailto:" + contactEmailAddress} className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-[#070d22]/65 p-4 transition hover:border-cyan/40 hover:bg-[#070d22]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan/10 text-cyan"><Mail className="h-5 w-5" /></span>
                <span className="min-w-0"><span className="block text-xs font-semibold text-slate-400">E-mail de atendimento</span><span className="block break-all text-sm font-bold text-white sm:text-base">{contactEmailAddress}</span></span>
              </a>
              <a href={whatsappContactUrl} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-[#070d22]/65 p-4 transition hover:border-magenta/50 hover:bg-[#070d22]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-magenta/10 text-pink-300"><MessageCircle className="h-5 w-5" /></span>
                <span className="min-w-0"><span className="block text-xs font-semibold text-slate-400">WhatsApp</span><span className="block text-sm font-bold text-white sm:text-base">(82) 99692-6540</span></span>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-400" />
              </a>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#070d22]/80 p-5 shadow-card sm:p-7">
            <h3 className="text-xl font-bold text-white">Envie sua mensagem</h3>
            <p className="mt-1 text-sm text-slate-400">Preencha os campos e escolha como quer enviar.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold text-slate-200">Seu nome <input value={contactName} onChange={(event) => setContactName(event.target.value)} maxLength={100} placeholder="Como podemos chamar você?" className="h-12 min-w-0 rounded-xl border border-white/15 bg-[#11182d] px-3 font-normal text-white outline-none transition placeholder:text-slate-500 focus:border-cyan focus:ring-2 focus:ring-cyan/20" /></label>
              <label className="grid gap-1.5 text-sm font-semibold text-slate-200">Seu e-mail (opcional) <input type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} maxLength={254} placeholder="voce@exemplo.com" className="h-12 min-w-0 rounded-xl border border-white/15 bg-[#11182d] px-3 font-normal text-white outline-none transition placeholder:text-slate-500 focus:border-cyan focus:ring-2 focus:ring-cyan/20" /></label>
              <label className="grid gap-1.5 text-sm font-semibold text-slate-200 sm:col-span-2">Como podemos ajudar? <textarea value={contactMessage} onChange={(event) => setContactMessage(event.target.value)} maxLength={2000} rows={4} placeholder="Ex.: Gostaria de saber o prazo para produzir 500 cartões de visita." className="min-w-0 resize-y rounded-xl border border-white/15 bg-[#11182d] px-3 py-3 font-normal text-white outline-none transition placeholder:text-slate-500 focus:border-cyan focus:ring-2 focus:ring-cyan/20" /></label>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a href={whatsappContactUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-magenta px-4 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:brightness-110"><MessageCircle className="h-4 w-4" /> Enviar pelo WhatsApp</a>
              <a href={emailContactUrl} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-extrabold text-white transition hover:border-cyan/50 hover:bg-white/5"><Send className="h-4 w-4" /> Enviar por e-mail</a>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">O envio abre o WhatsApp ou o aplicativo de e-mail do seu dispositivo para você revisar e enviar a mensagem.</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#070d22]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-7 text-sm text-slate-300 sm:flex-row sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Print Center · Impressão que destaca sua marca.</span>
          <div className="flex items-center gap-4"><a href={phone ? "https://wa.me/" + phone : "#catalogo"} target={phone ? "_blank" : undefined} rel="noopener noreferrer" className="font-semibold text-white hover:text-cyan">Fale conosco</a><Link to="/admin" className="text-slate-300 hover:text-white">Área do administrador</Link></div>
        </div>
      </footer>

      {cartError && <p role="alert" className="px-4 text-center text-sm text-destructive">{cartError}</p>}
      <div className="fixed bottom-0 left-0 right-0 z-30 box-border w-full max-w-full overflow-hidden border-t border-white/10 bg-[#070d22]/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 text-white shadow-card backdrop-blur">
        <div className="mx-auto flex w-full min-w-0 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
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
