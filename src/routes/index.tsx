import { createFileRoute } from "@tanstack/react-router";
import { Storefront } from "@/components/Storefront";
import { productsQuery, settingsQuery } from "@/lib/catalog";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Criattiva | Presentes e brindes personalizados",
      "Presentes especiais, brindes personalizados e produtos criativos. Monte seu orçamento e converse pelo WhatsApp.",
    ),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(productsQuery),
      context.queryClient.ensureQueryData(settingsQuery),
    ]),
  component: Page,
});
function Page() {
  return <Storefront view="home" />;
}
