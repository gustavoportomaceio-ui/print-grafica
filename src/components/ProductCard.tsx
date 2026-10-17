import { useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { brl, calcPrice, type Product } from "@/lib/catalog";

export function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product, selected: Record<string, number>, notes: string) => boolean }) {
  const [sel, setSel] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [added, setAdded] = useState(false);
  const price = calcPrice(product, sel);

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card shadow-card">
      <div className="relative aspect-[16/9] overflow-hidden bg-muted sm:aspect-[4/3]">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            width={1024}
            height={768}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
          {product.category}
        </span>
        {product.featured && (
          <span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
            Mais pedido
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div>
          <h3 className="text-xl font-bold">{product.name}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
        </div>

        <details className="group" onToggle={() => setAdded(false)}>
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 border-y py-2 text-sm font-semibold">Personalizar pedido <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" /></summary>
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

        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <div>
            <div className="text-xs text-muted-foreground">{price !== null ? "Valor por pedido" : "Preço"}</div>
            <div className="break-words font-display text-2xl font-extrabold">
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
  );
}
