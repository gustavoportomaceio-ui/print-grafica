import { z } from "zod";
import { brl, calcPrice, type Product, type Settings } from "@/lib/catalog";

export const cartItemSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  selected: z.record(z.number().int().min(0).max(1000)),
  notes: z.string().trim().max(500),
  quantity: z.number().int().min(1).max(99),
});
export const cartSchema = z.array(cartItemSchema).max(100);
export type CartItem = z.infer<typeof cartItemSchema>;
export type OrderItem = CartItem & { product: Product };
export const customerSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(100, "Use até 100 caracteres."),
  whatsapp: z.string().trim().max(30).refine((value) => /^\+?[\d\s().-]+$/.test(value) && value.replace(/\D/g, "").length >= 10 && value.replace(/\D/g, "").length <= 15, "Informe um WhatsApp válido com DDD."),
  address: z.string().trim().min(10, "Informe o endereço completo para entrega.").max(500, "Use até 500 caracteres."),
  payment: z.enum(["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro"], { errorMap: () => ({ message: "Escolha a forma de pagamento." }) }),
});
export type Customer = z.infer<typeof customerSchema>;

export function resolveCart(cart: CartItem[], products: Product[]): OrderItem[] {
  return cart.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId && p.active);
    if (!product || product.options.some((o) => !o.choices[item.selected[o.name] ?? 0])) return [];
    return [{ ...item, product }];
  });
}

export function orderTotals(items: OrderItem[]) {
  return {
    total: items.reduce((sum, item) => sum + (calcPrice(item.product, item.selected) ?? 0) * item.quantity, 0),
    hasQuote: items.some((item) => item.product.base_price === null),
    count: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export function buildOrderLink(settings: Settings, items: OrderItem[], input: unknown) {
  const customer = customerSchema.parse(input);
  cartSchema.min(1).parse(items);
  const { total, hasQuote } = orderTotals(items);
  const lines = ["Olá! Gostaria de concluir meu pedido.", "", "*PEDIDO*"];
  items.forEach((item, index) => {
    const price = calcPrice(item.product, item.selected);
    lines.push("", `${index + 1}. *${item.product.name}*`, `Quantidade de pedidos: ${item.quantity}`,
      ...item.product.options.map((o) => `${o.name}: ${o.choices[item.selected[o.name] ?? 0]?.label ?? "-"}`),
      `Valor por pedido: ${price === null ? item.product.price_note || "Sob consulta" : brl(price)}`,
      `Subtotal: ${price === null ? "Sob consulta" : brl(price * item.quantity)}`);
    if (item.notes) lines.push(`Observações: ${item.notes}`);
  });
  lines.push("", `*${hasQuote ? "Subtotal dos itens com preço" : "Total dos produtos"}:* ${brl(total)}`);
  if (hasQuote) lines.push("Itens sob consulta: valores a combinar.");
  lines.push("Frete e condições de pagamento a confirmar.", "", "*DADOS DO CLIENTE*", `Nome: ${customer.name}`, `WhatsApp: ${customer.whatsapp}`, `Endereço de entrega: ${customer.address}`, `Forma de pagamento: ${customer.payment}`);
  const phone = settings.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}