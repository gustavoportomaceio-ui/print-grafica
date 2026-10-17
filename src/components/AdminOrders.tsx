import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/catalog";

const statuses = [
  { value: "recebido", label: "Recebido" },
  { value: "em_producao", label: "Em produção" },
  { value: "pronto", label: "Pronto" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
] as const;

type OrderStatus = (typeof statuses)[number]["value"];

export function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function updateStatus(id: string, status: OrderStatus) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      alert("Não foi possível atualizar o pedido: " + error.message);
      return;
    }
    await qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Pedidos</h2>
          <p className="text-sm text-muted-foreground">Pedidos salvos quando o cliente inicia o envio pelo WhatsApp.</p>
        </div>
        <span className="rounded-full border px-3 py-1 text-sm">{orders.length} pedido(s)</span>
      </div>
      {isLoading ? <p className="py-8 text-center text-muted-foreground">Carregando pedidos…</p> :
       error ? <p className="rounded-lg border p-4 text-sm text-destructive">Não foi possível carregar pedidos. Confirme a migração do banco e as permissões de administrador.</p> :
       orders.length === 0 ? <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">Ainda não há pedidos registrados.</div> :
       <div className="space-y-3">
        {orders.map((order) => (
          <article key={order.id} className="rounded-2xl border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold">{order.customer_name}</p>
                <p className="text-sm text-muted-foreground">{order.customer_whatsapp}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString("pt-BR")}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{order.has_quote ? "A partir de " : ""}{brl(Number(order.total))}</p>
                <p className="text-xs text-muted-foreground">{order.payment_method}</p>
              </div>
            </div>
            <p className="mt-3 text-sm"><span className="font-semibold">Entrega:</span> {order.delivery_address}</p>
            <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm">
              <p className="mb-2 font-semibold">Itens</p>
              <ul className="space-y-1">
                {(Array.isArray(order.items) ? order.items as Array<{name?: string; quantity?: number; subtotal?: number; options?: string[]; notes?: string}> : []).map((item, i) => (
                  <li key={i}>{item.quantity ?? 1}× {item.name ?? "Produto"}{item.options?.length ? ` — ${item.options.join(", ")}` : ""}{typeof item.subtotal === "number" ? ` · ${brl(item.subtotal)}` : ""}{item.notes ? ` · ${item.notes}` : ""}</li>
                ))}
              </ul>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Status</span>
              <select aria-label={`Status do pedido de ${order.customer_name}`} className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={order.status} onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}>
                {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
              </select>
            </div>
          </article>
        ))}
       </div>}
    </section>
  );
}
