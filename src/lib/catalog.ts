import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Choice = { label: string; price: number | "quote" };
export type ProductOption = { name: string; choices: Choice[] };
export type Product = {
  id: string;
  name: string;
  category: string;
  showcase: "servicos" | "produtos";
  description: string;
  image_url: string | null;
  base_price: number | null;
  price_note: string | null;
  options: ProductOption[];
  featured: boolean;
  active: boolean;
  sort_order: number;
};
export type Settings = { store_name: string; whatsapp: string; tagline: string };

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order")
      .order("created_at");
    if (error) throw error;
    return (data ?? []).map((p) => ({
      ...p,
      base_price: p.base_price === null ? null : Number(p.base_price),
      options: (p.options as unknown as ProductOption[]) ?? [],
    })) as Product[];
  },
});

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return (data ?? { store_name: "Gráfica", whatsapp: "", tagline: "" }) as Settings;
  },
});

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function calcPrice(p: Product, selected: Record<string, number>) {
  if (p.base_price === null) return null;
  const choices = p.options.map((o) => o.choices[selected[o.name] ?? 0]);
  if (choices.some((choice) => choice?.price === "quote")) return null;
  return choices.reduce((sum, choice) => sum + (Number(choice?.price) || 0), p.base_price);
}

export function whatsappLink(
  settings: Settings,
  p: Product,
  selected: Record<string, number>,
  notes?: string,
) {
  const price = calcPrice(p, selected);
  const lines = [
    `Olá! Gostaria de fazer um pedido 😊`,
    ``,
    `*Produto:* ${p.name}`,
    ...p.options.map((o) => `*${o.name}:* ${o.choices[selected[o.name] ?? 0]?.label ?? "-"}`),
    `*Preço:* ${price !== null ? brl(price) : p.price_note || "A combinar"}`,
  ];
  if (notes?.trim()) lines.push(`*Observações:* ${notes.trim()}`);
  const text = encodeURIComponent(lines.join("\n"));
  const phone = settings.whatsapp.replace(/\D/g, "");
  return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
}
