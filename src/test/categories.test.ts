import { describe, expect, it } from "vitest";
import { catalogCategories, filterCategory } from "../lib/categories";

describe("Public categories", () => {
  it("includes the four requested categories and future admin product categories", () => {
    expect(catalogCategories([{ category: "Nova categoria" }])).toEqual(["Canecas e copos", "Garrafas e squeezes", "T-shirts, bolsas e bonés", "Kits corporativos", "Nova categoria"]);
  });
  it("filters without modifying or reclassifying existing products", () => {
    const products = [{ category: "Canecas e copos" }, { category: "Cartões" }];
    expect(filterCategory(products, "Canecas e copos")).toEqual([products[0]]);
    expect(filterCategory(products, "")).toEqual(products);
    expect(filterCategory(products, "Kits corporativos")).toEqual([]);
  });
});