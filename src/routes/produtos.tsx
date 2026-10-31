import { createFileRoute } from "@tanstack/react-router";
import { Storefront } from "@/components/Storefront";
import { productsQuery, settingsQuery } from "@/lib/catalog";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/produtos")({
  validateSearch: (search: Record<string, unknown>) => ({
    categoria: typeof search["categoria"] === "string" ? search["categoria"] : "",
  }),
  head: () =>
    pageHead(
      "Produtos | Criattiva",
      "Explore os produtos personalizados da Criattiva e reúna seus favoritos em um orçamento pelo WhatsApp.",
    ),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(productsQuery),
      context.queryClient.ensureQueryData(settingsQuery),
    ]),
  component: Page,
});
function Page() {
  const { categoria } = Route.useSearch();
  return <Storefront view="products" category={categoria} />;
}
