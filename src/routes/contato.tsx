import { createFileRoute } from "@tanstack/react-router";
import { Storefront } from "@/components/Storefront";
import { productsQuery, settingsQuery } from "@/lib/catalog";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/contato")({
  head: () =>
    pageHead(
      "Contato | Criattiva",
      "Fale com a Criattiva pelo WhatsApp para personalizar produtos e solicitar um orçamento.",
    ),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(productsQuery),
      context.queryClient.ensureQueryData(settingsQuery),
    ]),
  component: Page,
});
function Page() {
  return <Storefront view="contact" />;
}
