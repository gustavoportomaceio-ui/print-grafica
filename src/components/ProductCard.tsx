import { useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Plus,
  Minus,
  ZoomIn,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { brl, calcPrice, type Product } from "@/lib/catalog";

export function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (
    product: Product,
    selected: Record<string, number>,
    notes: string,
    quantity: number,
  ) => boolean;
}) {
  const [sel, setSel] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imageOpen, setImageOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const photos = product.image_urls?.length
    ? product.image_urls
    : product.image_url
      ? [product.image_url]
      : [];
  const scrollPhotos = (direction: -1 | 1) =>
    galleryRef.current?.scrollBy({
      left: galleryRef.current.clientWidth * direction,
      behavior: "smooth",
    });
  const [infoOpen, setInfoOpen] = useState(false);
  const price = calcPrice(product, sel);

  return (
    <>
      <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition duration-300 hover:-translate-y-1 hover:border-primary/40 ">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {photos.length > 0 ? (
            <>
              <div
                ref={galleryRef}
                onScroll={(e) =>
                  setActivePhoto(
                    Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth),
                  )
                }
                className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-auto"
              >
                {photos.map((url, index) => (
                  <Button
                    variant="ghost"
                    key={url + index}
                    type="button"
                    onClick={() => {
                      setActivePhoto(index);
                      setImageOpen(true);
                    }}
                    aria-label={`Ampliar foto ${index + 1} de ${product.name}`}
                    className="relative h-full w-full shrink-0 snap-start cursor-zoom-in"
                  >
                    <img
                      src={url}
                      alt={`${product.name} — foto ${index + 1}`}
                      loading="lazy"
                      width={1024}
                      height={1024}
                      className="h-full w-full object-contain p-1 sm:p-2"
                    />
                  </Button>
                ))}
              </div>
              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    type="button"
                    aria-label="Foto anterior"
                    onClick={() => scrollPhotos(-1)}
                    className="absolute z-10 touch-manipulation left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/95 text-foreground shadow-lg"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    aria-label="Próxima foto"
                    onClick={() => scrollPhotos(1)}
                    className="absolute z-10 touch-manipulation right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/95 text-foreground shadow-lg"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/95 px-2.5 py-1 text-xs font-semibold text-foreground">
                    {activePhoto + 1}/{photos.length}
                  </span>
                </>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageIcon className="h-9 w-9 opacity-70" />
              <span className="text-xs font-semibold">Foto em breve</span>
            </div>
          )}
          <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-border bg-background/95 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
            {product.category}
          </span>
          {product.featured && (
            <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-lg">
              Em destaque
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <div>
            <h3 className="text-xl font-bold leading-tight text-foreground">{product.name}</h3>
            <p className="mt-2 line-clamp-3 min-h-[3.75rem] text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>

          <div className="mt-auto">
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="min-w-0">
                <div className="text-xs font-medium text-muted-foreground">
                  {price !== null ? "Valor por pedido" : "Preço"}
                </div>
                <div className="break-words font-display text-2xl font-extrabold text-foreground">
                  {price !== null ? brl(price) : product.price_note || "Sob consulta"}
                </div>
              </div>
              {(product.options.length > 0 || product.description.trim().length > 0) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInfoOpen(true)}
                  className="h-10 shrink-0 border-secondary/30 px-3 text-sm text-secondary hover:bg-accent"
                >
                  <Info className="h-4 w-4" /> + Info
                </Button>
              )}
            </div>
            <div className="mt-3 flex h-11 items-center justify-between rounded-xl border border-border bg-background px-3">
              <span className="text-sm font-semibold text-muted-foreground">Quantidade</span>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  aria-label={`Diminuir quantidade de ${product.name}`}
                  disabled={quantity <= 1}
                  onClick={() => {
                    setQuantity((q) => Math.max(1, q - 1));
                    setAdded(false);
                  }}
                  className="h-8 w-8 rounded-lg border-border p-0 text-foreground"
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span
                  className="min-w-5 text-center text-sm font-bold text-foreground"
                  aria-live="polite"
                >
                  {quantity}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  aria-label={`Aumentar quantidade de ${product.name}`}
                  disabled={quantity >= 99}
                  onClick={() => {
                    setQuantity((q) => Math.min(99, q + 1));
                    setAdded(false);
                  }}
                  className="h-8 w-8 rounded-lg border-border p-0 text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <Button
              onClick={() => {
                if (onAdd(product, sel, notes, quantity)) setAdded(true);
              }}
              className="mt-3 h-12 w-full text-base font-bold"
            >
              {added ? <Check /> : <Plus />} {added ? "Adicionar mais" : "Adicionar ao carrinho"}
            </Button>
          </div>
          <span className="sr-only" aria-live="polite">
            {added ? `${product.name} adicionado ao carrinho.` : ""}
          </span>

          <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
            <DialogContent className="w-[calc(100vw-2rem)] max-w-lg border-border bg-background p-5 text-foreground">
              <DialogTitle className="pr-8 text-xl font-bold">{product.name}</DialogTitle>
              <div className="max-h-[65vh] space-y-4 overflow-y-auto">
                {product.description.trim() && (
                  <div>
                    <h3 className="text-sm font-bold text-secondary">Informações do produto</h3>
                    <p className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground">
                      {product.description}
                    </p>
                  </div>
                )}
                {product.options.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-secondary">Escolha as opções</h3>
                    {product.options.map((o) => (
                      <label key={o.name} className="grid gap-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {o.name}
                        </span>
                        <select
                          value={sel[o.name] ?? 0}
                          onChange={(e) => {
                            setSel({ ...sel, [o.name]: Number(e.target.value) });
                            setAdded(false);
                          }}
                          className="h-12 w-full min-w-0 rounded-md border border-input bg-background px-3 text-base font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          {o.choices.map((choice, i) => (
                            <option key={i} value={i}>
                              {choice.label}
                              {choice.price === "quote"
                                ? " (A consultar)"
                                : product.base_price !== null && Number(choice.price) > 0
                                  ? ` (+${brl(Number(choice.price))})`
                                  : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                    <label className="grid gap-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Observações (opcional)
                      </span>
                      <Input
                        value={notes}
                        maxLength={500}
                        onChange={(e) => {
                          setNotes(e.target.value);
                          setAdded(false);
                        }}
                        placeholder="Ex.: já tenho a arte pronta"
                        className="h-12 text-base"
                      />
                    </label>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {price !== null ? "Valor por pedido" : "Preço"}
                  </p>
                  <p className="text-xl font-extrabold">
                    {price !== null ? brl(price) : product.price_note || "Sob consulta"}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    if (onAdd(product, sel, notes, quantity)) {
                      setAdded(true);
                      setInfoOpen(false);
                    }
                  }}
                  className="h-11 font-bold"
                >
                  {added ? <Check /> : <Plus />} Adicionar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </article>

      {photos.length > 0 && (
        <Dialog open={imageOpen} onOpenChange={setImageOpen}>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-6xl border-border bg-background p-3 text-foreground sm:p-5">
            <div className="grid max-h-[82vh] grid-cols-1 gap-4 overflow-y-auto md:grid-cols-[1.2fr_0.8fr] md:items-start">
              <div className="flex min-h-0 items-center justify-center rounded-lg bg-muted p-2">
                <img
                  src={photos[activePhoto] ?? photos[0]}
                  alt={`Imagem ampliada ${activePhoto + 1} de ${product.name}`}
                  className="max-h-[65vh] max-w-full object-contain"
                />
              </div>
              <div className="min-w-0 px-1 pb-2 md:py-2">
                <DialogTitle className="pr-10 text-lg font-bold leading-tight sm:text-xl">
                  {product.name}
                </DialogTitle>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-secondary">
                  {product.category}
                </p>
                <h3 className="mt-5 text-sm font-bold text-foreground">Descrição completa</h3>
                <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground">
                  {product.description || "Não há descrição cadastrada para este item."}
                </p>
                <div className="mt-5 rounded-xl border border-border bg-muted p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    {price !== null ? "Valor por pedido" : "Preço"}
                  </p>
                  <p className="mt-1 break-words text-xl font-extrabold text-foreground">
                    {price !== null ? brl(price) : product.price_note || "Sob consulta"}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Clique fora da janela ou no X para fechar.
            </p>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
