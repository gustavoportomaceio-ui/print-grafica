import { describe, expect, it } from "vitest";
import { buildOrderLink, customerSchema, orderTotals, resolveCart, type OrderItem } from "@/lib/order";
import type { Product } from "@/lib/catalog";

const product: Product = { id: "00000000-0000-4000-8000-000000000001", name: "Cartão de visita", category: "Cartões", showcase: "servicos", image_urls: [], description: "", image_url: null, base_price: 100, price_note: "", options: [{ name: "Acabamento", choices: [{ label: "Fosco", price: 0 }, { label: "Brilho", price: 20 }] }], featured: false, active: true, sort_order: 0 };
const item: OrderItem = { id: "00000000-0000-4000-8000-000000000002", productId: product.id, product, selected: { Acabamento: 1 }, notes: "Arte pronta", quantity: 2 };
const customer = { name: "Ana Silva", whatsapp: "(11) 99999-9999", address: "Rua das Flores, 10, Centro, São Paulo, 01000-000", payment: "Pix" };
const settings = { store_name: "Gráfica", whatsapp: "55 (11) 98888-7777", tagline: "" };

describe("Grouped WhatsApp orders", () => {
  it("adds selected option prices and multiplies by cart quantity", () => {
    expect(orderTotals([item])).toEqual({ total: 240, count: 2, hasQuote: false });
  });
  it("groups every product with its options, quantity and notes in one message", () => {
    const second = { ...item, id: "00000000-0000-4000-8000-000000000003", quantity: 1, product: { ...product, name: "Banner" } };
    const url = new URL(buildOrderLink(settings, [item, second], customer));
    expect(url.pathname).toBe("/5511988887777");
    const text = url.searchParams.get("text");
    expect(text).toContain("1. *Cartão de visita*");
    expect(text).toContain("2. *Banner*");
    expect(text).toContain("Acabamento: Brilho");
    expect(text).toContain("Quantidade de pedidos: 2");
    expect(text).toContain("Observações: Arte pronta");
    expect(text).toContain("360,00");
  });
  it("includes name, WhatsApp, delivery address and payment preference", () => {
    const text = new URL(buildOrderLink(settings, [item], customer)).searchParams.get("text");
    expect(text).toContain("Nome: Ana Silva");
    expect(text).toContain("WhatsApp: (11) 99999-9999");
    expect(text).toContain(`Endereço de entrega: ${customer.address}`);
    expect(text).toContain("Forma de pagamento: Pix");
  });
  it("requires all four customer fields before sending", () => {
    for (const field of ["name", "whatsapp", "address", "payment"]) {
      expect(customerSchema.safeParse({ ...customer, [field]: "" }).success).toBe(false);
    }
  });
  it("keeps quote-only products out of the numeric total", () => {
    const quote = { ...item, product: { ...product, base_price: null } };
    expect(orderTotals([item, quote])).toEqual({ total: 240, count: 4, hasQuote: true });
    expect(new URL(buildOrderLink(settings, [quote], customer)).searchParams.get("text")).toContain("valores a combinar");
  });
  it("excludes inactive products and stale options from an order", () => {
    expect(resolveCart([item], [{ ...product, active: false }])).toEqual([]);
    expect(resolveCart([{ ...item, selected: { Acabamento: 9 } }], [product])).toEqual([]);
  });
});