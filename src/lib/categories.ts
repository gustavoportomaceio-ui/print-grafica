import type { Product } from "./catalog";

export const baseCategories = ["Canecas e copos", "Garrafas e squeezes", "T-shirts, bolsas e bonés", "Kits corporativos"];

export function catalogCategories(products: Pick<Product, "category">[]) {
  return [...new Set([...baseCategories, ...products.map((p) => p.category.trim()).filter(Boolean)])];
}

export function filterCategory<T extends Pick<Product, "category">>(products: T[], category: string) {
  return category ? products.filter((p) => p.category.trim() === category) : products;
}