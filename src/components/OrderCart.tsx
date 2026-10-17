import { useState } from "react";
import { ArrowLeft, MessageCircle, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { brl, calcPrice, type Settings } from "@/lib/catalog";
import { buildOrderLink, customerSchema, orderTotals, type CartItem, type OrderItem } from "@/lib/order";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: OrderItem[];
  settings: Settings;
  onChange: (id: string, update: Partial<CartItem>) => void;
  onRemove: (id: string) => void;
};

export function OrderCart({ open, onOpenChange, items, settings, onChange, onRemove }: Props) {
  const [step, setStep] = useState<"cart" | "details">("cart");
  const [errors, setErrors] = useState<Partial<Record<"name" | "whatsapp" | "address" | "payment", string>>>({});
  const [customer, setCustomer] = useState({ name: "", whatsapp: "", address: "", payment: "" });
  const { total, hasQuote, count } = orderTotals(items);
  const totalLabel = hasQuote ? "Subtotal com preço" : "Total dos produtos";
  const changeOpen = (next: boolean) => {
    onOpenChange(next);
    if (!next) setStep("cart");
  };

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = customerSchema.safeParse(customer);
    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      return;
    }
    if (!items.length) { setStep("cart"); return; }
    setErrors({});
    window.open(buildOrderLink(settings, items, result.data), "_blank", "noopener,noreferrer");
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="flex max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-xl flex-col gap-0 overflow-hidden rounded-lg p-0">
        <div className="border-b px-5 py-5 pr-12">
          <DialogTitle className="flex items-center gap-2 font-display text-xl tracking-normal">
            {step === "details" && <Button variant="ghost" size="icon" aria-label="Voltar ao carrinho" onClick={() => setStep("cart")}><ArrowLeft /></Button>}
            {step === "cart" ? `Seu carrinho (${count})` : "Dados do pedido"}
          </DialogTitle>
          <DialogDescription className="mt-2">{step === "cart" ? "Seu pedido" : "Entrega e pagamento"}</DialogDescription>
        </div>

        {step === "cart" ? <>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5">
            {items.length === 0 ? <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground"><ShoppingBag className="h-10 w-10" /><p>Seu carrinho está vazio.</p><Button variant="outline" onClick={() => changeOpen(false)}>Escolher produtos</Button></div> : items.map((item) => {
              const price = calcPrice(item.product, item.selected);
              return <article key={item.id} className="border-b py-5 last:border-0">
                <div className="flex items-start gap-3">
                  {item.product.image_url && <img src={item.product.image_url} alt={item.product.name} className="h-16 w-16 shrink-0 rounded-md object-cover" />}
                  <div className="min-w-0 flex-1"><h3 className="font-bold">{item.product.name}</h3><p className="mt-1 text-sm text-muted-foreground">{item.product.options.map((o) => item.product.options.length ? `${o.name}: ${o.choices[item.selected[o.name] ?? 0]?.label}` : "").join(" · ")}</p>{item.notes && <p className="mt-1 break-words text-sm text-muted-foreground">{item.notes}</p>}</div>
                  <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0" aria-label={`Remover ${item.product.name}`} onClick={() => onRemove(item.id)}><Trash2 /></Button>
                </div>
                <details className="mt-3 text-sm"><summary className="cursor-pointer py-2 font-medium text-primary">Alterar opções</summary><div className="grid gap-3 pt-2">{item.product.options.map((o) => <label key={o.name} className="grid gap-1"><span>{o.name}</span><select className="h-11 min-w-0 rounded-md border bg-background px-3 text-base" value={item.selected[o.name] ?? 0} onChange={(event) => onChange(item.id, { selected: { ...item.selected, [o.name]: Number(event.target.value) } })}>{o.choices.map((choice, index) => <option key={index} value={index}>{choice.label}</option>)}</select></label>)}<label className="grid gap-1"><span>Observações</span><Input value={item.notes} maxLength={500} className="h-11" onChange={(event) => onChange(item.id, { notes: event.target.value })} /></label></div></details>
                <div className="mt-3 flex items-center justify-between gap-2"><div className="flex items-center gap-2"><Button variant="outline" size="icon" className="h-11 w-11" aria-label={`Diminuir quantidade de ${item.product.name}`} disabled={item.quantity === 1} onClick={() => onChange(item.id, { quantity: item.quantity - 1 })}><Minus /></Button><span className="min-w-6 text-center font-semibold">{item.quantity}</span><Button variant="outline" size="icon" className="h-11 w-11" aria-label={`Aumentar quantidade de ${item.product.name}`} disabled={item.quantity === 99} onClick={() => onChange(item.id, { quantity: item.quantity + 1 })}><Plus /></Button></div><span className="text-right font-bold">{price === null ? "Sob consulta" : brl(price * item.quantity)}</span></div>
              </article>;
            })}
          </div>
          {items.length > 0 && <div className="border-t bg-card p-5"><div className="mb-2 flex justify-between gap-3 text-sm"><span>{totalLabel}</span><strong className="text-lg">{brl(total)}</strong></div><p className="mb-4 text-xs text-muted-foreground">{hasQuote ? "Itens sob consulta, frete e pagamento a confirmar." : "Frete e condições de pagamento a confirmar."}</p><Button className="h-12 w-full whitespace-normal bg-whatsapp text-base font-bold text-whatsapp-foreground hover:bg-whatsapp/90" onClick={() => setStep("details")}><MessageCircle /> Concluir pedido via whatsapp</Button></div>}
        </> : <form className="flex min-h-0 flex-col" noValidate onSubmit={submit}>
          <div className="grid min-h-0 gap-4 overflow-y-auto overscroll-contain px-5 py-5">
            {([
              { key: "name", label: "Nome", placeholder: "Seu nome completo", autoComplete: "name", type: "text" },
              { key: "whatsapp", label: "WhatsApp", placeholder: "(11) 99999-9999", autoComplete: "tel", type: "tel" },
            ] as const).map((field) => <label key={field.key} className="grid gap-1.5 text-sm font-semibold"><span>{field.label}</span><Input className="h-12 text-base" type={field.type} autoComplete={field.autoComplete} maxLength={field.key === "name" ? 100 : 30} placeholder={field.placeholder} value={customer[field.key]} required aria-invalid={!!errors[field.key]} aria-describedby={errors[field.key] ? `${field.key}-error` : undefined} onChange={(event) => setCustomer({ ...customer, [field.key]: event.target.value })} />{errors[field.key] && <span id={`${field.key}-error`} className="text-sm font-normal text-destructive" role="alert">{errors[field.key]}</span>}</label>)}
            <label className="grid gap-1.5 text-sm font-semibold"><span>Endereço de entrega</span><textarea className="min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-3 text-base font-normal focus:outline-none focus:ring-2 focus:ring-ring" autoComplete="street-address" maxLength={500} placeholder="Rua, número, complemento, bairro, cidade e CEP" required value={customer.address} aria-invalid={!!errors.address} aria-describedby={errors.address ? "address-error" : undefined} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} />{errors.address && <span id="address-error" role="alert" className="font-normal text-destructive">{errors.address}</span>}</label>
            <label className="grid gap-1.5 text-sm font-semibold"><span>Forma de pagamento</span><select className="h-12 w-full rounded-md border border-input bg-background px-3 text-base font-normal focus:outline-none focus:ring-2 focus:ring-ring" required value={customer.payment} aria-invalid={!!errors.payment} aria-describedby={errors.payment ? "payment-error" : undefined} onChange={(event) => setCustomer({ ...customer, payment: event.target.value })}><option value="" disabled>Selecione</option>{["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro"].map((payment) => <option key={payment}>{payment}</option>)}</select>{errors.payment && <span id="payment-error" role="alert" className="font-normal text-destructive">{errors.payment}</span>}</label>
          </div>
          <div className="border-t bg-card p-5"><div className="mb-3 flex justify-between gap-2 text-sm"><span>{count} {count === 1 ? "item" : "itens"} · {totalLabel}</span><strong>{brl(total)}</strong></div>{!settings.whatsapp.replace(/\D/g, "") && <p className="mb-3 text-sm text-muted-foreground">O número da loja ainda não foi configurado. Selecione o destinatário no WhatsApp.</p>}<Button type="submit" className="h-12 w-full whitespace-normal bg-whatsapp text-base font-bold text-whatsapp-foreground hover:bg-whatsapp/90"><MessageCircle /> Concluir pedido via whatsapp</Button></div>
        </form>}
      </DialogContent>
    </Dialog>
  );
}