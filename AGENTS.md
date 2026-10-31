<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep cart calculation, validation and WhatsApp message assembly in a shared browser-safe order module so the UI and tests follow the same rules.
- Persist only product selections in browser storage after hydration; keep checkout personal data in component state to avoid storing customer details.
- WhatsApp checkout is client-only and does not create an account, store customer data, or process payments; no server receives checkout inputs.
- Public storefront pages share a browser-safe Storefront component; keep catalog queries, cart storage keys and quotation behavior stable across visual changes.
- Derive navigation categories from fixed public categories plus existing product category values; admin edits categories on products, without introducing a competing category store.
