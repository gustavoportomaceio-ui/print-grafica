import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { brl, calcPrice, whatsappLink, type Product, type Settings } from "@/lib/catalog";

export function ProductCard({ product, settings }: { product: Product; settings: Settings }) {
  const [sel, setSel] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const price = calcPrice(product, sel);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
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

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="text-xl font-bold">{product.name}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
        </div>

        <div className="grid gap-3">
          {product.options.map((o) => (
            <label key={o.name} className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {o.name}
              </span>
              <select
                value={sel[o.name] ?? 0}
                onChange={(e) => setSel({ ...sel, [o.name]: Number(e.target.value) })}
                className="h-11 rounded-lg border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
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
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: já tenho a arte pronta"
              className="h-11 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t pt-4">
          <div>
            <div className="text-xs text-muted-foreground">{price !== null ? "Total" : "Preço"}</div>
            <div className="font-display text-2xl font-extrabold">
              {price !== null ? brl(price) : product.price_note || "Sob consulta"}
            </div>
          </div>
        </div>
        <a
          href={whatsappLink(settings, product, sel, notes)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 font-bold text-whatsapp-foreground transition hover:brightness-110 active:scale-[0.98]"
        >
          <MessageCircle className="h-5 w-5" /> Pedir pelo WhatsApp
        </a>
      </div>
    </article>
  );
}
