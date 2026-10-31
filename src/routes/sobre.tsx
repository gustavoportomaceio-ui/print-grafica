import { createFileRoute } from "@tanstack/react-router";
import { Storefront } from "@/components/Storefront";
import { productsQuery, settingsQuery } from "@/lib/catalog";
import { pageHead } from "@/lib/page-head";
export const Route = createFileRoute("/sobre")({
  head: () => pageHead("Sobre nós | Criattiva", "Conheça a Criattiva: criatividade, qualidade e autenticidade em presentes e brindes personalizados."),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(productsQuery), context.queryClient.ensureQueryData(settingsQuery)]),
  component: Page,
});
function Page() { return <Storefront view="about" />; }
