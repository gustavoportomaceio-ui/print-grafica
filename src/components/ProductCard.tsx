import { useState } from "react";
import { Check, ChevronDown, Image as ImageIcon, Plus, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { brl, calcPrice, type Product } from "@/lib/catalog";

export function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product, selected: Record<string, number>, notes: string) => boolean }) {
  const [sel, setSel] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [added, setAdded] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const price = calcPrice(product, sel);

  return (
    <>
      <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#11182d] shadow-card transition duration-300 hover:-translate-y-1 hover:border-cyan/40 hover:shadow-[0_18px_45px_-24px_rgba(8,196,233,0.55)]">
        <div className="relative aspect-square overflow-hidden bg-[#18223b]">
          {product.image_url && (
            <button
              type="button"
              onClick={() => setImageOpen(true)}
              aria-label={`Ampliar imagem de ${product.name}`}
              className="absolute inset-0 flex h-full w-full cursor-zoom-in items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan"
            >
              <img
                src={product.image_url}
                alt={product.name}
                loading="lazy"
                width={1024}
                height={1024}
                className="h-full w-full object-contain p-1 transition-transform duration-300 group-hover:scale-[1.02] sm:p-2"
              />
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[#070d22]/85 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg backdrop-blur transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <ZoomIn className="h-4 w-4" /> Ampliar
              </span>
            </button>
          )}
          {!product.image_url && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400"><ImageIcon className="h-9 w-9 opacity-70" /><span className="text-xs font-semibold">Foto em breve</span></div>}
          <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/10 bg-[#070d22]/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {product.category}
          </span>
          {product.featured && (
            <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-magenta px-3 py-1 text-xs font-bold text-white shadow-lg">
              Em destaque
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <div>
            <h3 className="text-xl font-bold leading-tight text-white">{product.name}</h3>
            <p className="mt-2 line-clamp-3 min-h-[3.75rem] text-sm leading-relaxed text-slate-300">{product.description}</p>
          </div>

          {product.options.length > 0 && (
          <details className="group" onToggle={() => setAdded(false)}>
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 border-y border-white/10 py-2 text-sm font-semibold text-slate-100">Personalizar pedido <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" /></summary>
            <div className="grid gap-3 pt-3">
            {product.options.map((o) => (
              <label key={o.name} className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {o.name}
                </span>
                <select
                  value={sel[o.name] ?? 0}
                  onChange={(e) => { setSel({ ...sel, [o.name]: Number(e.target.value) }); setAdded(false); }}
                  className="h-12 w-full min-w-0 rounded-md border border-input bg-background px-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {o.choices.map((c, i) => (
                    <option key={i} value={i}>
                      {c.label}
                      {product.base_price !== null && Number(c.price) > 0 ? ` (+${brl(Number(c.price))})` : ""}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Observações (opcional)
              </span>
              <Input
                value={notes}
                maxLength={500}
                onChange={(e) => { setNotes(e.target.value); setAdded(false); }}
                placeholder="Ex.: já tenho a arte pronta"
                className="h-12 text-base"
              />
            </label>
            </div>
          </details>
          )}

          <div className="mt-auto flex items-end justify-between gap-3 pt-1">
            <div>
              <div className="text-xs font-medium text-slate-400">{price !== null ? "Valor por pedido" : "Preço"}</div>
              <div className="break-words font-display text-2xl font-extrabold text-white">
                {price !== null ? brl(price) : product.price_note || "Sob consulta"}
              </div>
            </div>
          </div>
          <Button
            onClick={() => { if (onAdd(product, sel, notes)) setAdded(true); }}
            className="h-12 w-full text-base font-bold"
          >
            {added ? <Check /> : <Plus />} {added ? "Adicionar mais um" : "Adicionar ao carrinho"}
          </Button>
          <span className="sr-only" aria-live="polite">{added ? `${product.name} adicionado ao carrinho.` : ""}</span>
        </div>
      </article>

      {product.image_url && (
        <Dialog open={imageOpen} onOpenChange={setImageOpen}>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-6xl border-white/10 bg-[#070d22] p-3 text-white sm:p-5">
            <div className="grid max-h-[82vh] grid-cols-1 gap-4 overflow-y-auto md:grid-cols-[1.2fr_0.8fr] md:items-start">
              <div className="flex min-h-0 items-center justify-center rounded-lg bg-black/20 p-2">
                <img
                  src={product.image_url}
                  alt={`Imagem ampliada de ${product.name}`}
                  className="max-h-[65vh] max-w-full object-contain"
                />
              </div>
              <div className="min-w-0 px-1 pb-2 md:py-2">
                <DialogTitle className="pr-10 text-lg font-bold leading-tight sm:text-xl">{product.name}</DialogTitle>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-cyan">{product.category}</p>
                <h3 className="mt-5 text-sm font-bold text-white">Descrição completa</h3>
                <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-slate-300">{product.description || "Não há descrição cadastrada para este item."}</p>
                <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs font-medium text-slate-400">{price !== null ? "Valor por pedido" : "Preço"}</p>
                  <p className="mt-1 break-words text-xl font-extrabold text-white">{price !== null ? brl(price) : product.price_note || "Sob consulta"}</p>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-slate-400">Clique fora da janela ou no X para fechar.</p>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
