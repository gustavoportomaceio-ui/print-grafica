# Configuração do painel administrativo — Print Grafica

## 1. Aplicar a migração do banco

No projeto Supabase ligado ao Print Grafica, abra **SQL Editor**, copie e execute o conteúdo de:

`supabase/migrations/20261017000000_create_orders.sql`

A migração cria a tabela `public.orders`, índices e políticas RLS. Clientes não autenticados podem criar um pedido, mas não podem consultar pedidos; somente usuários com a função `admin` podem consultar e atualizar status.

## 2. Criar o primeiro usuário administrativo

O formulário usa um nome de usuário, mas o Supabase Auth autentica por e-mail e senha. Para o usuário `gustavo`, o e-mail interno reservado será `gustavo@printgrafica-admin.com`.

1. No Supabase, abra **Authentication → Users → Add user**.
2. Crie o usuário com o e-mail `SEU_USUARIO@printgrafica-admin.com`, substituindo `SEU_USUARIO` pelo nome de usuário desejado em letras minúsculas. Use uma senha forte e marque a confirmação do e-mail, se essa opção aparecer.
3. Abra o **SQL Editor** e execute o comando abaixo, substituindo o e-mail pelo mesmo e-mail interno criado no passo anterior:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where email = 'SEU_USUARIO@printgrafica-admin.com'
  and not exists (
    select 1 from public.user_roles
    where user_id = auth.users.id and role = 'admin'::public.app_role
  );
```

4. Acesse `/admin` no site e entre usando apenas `SEU_USUARIO` e a senha definida no Supabase.

**Não habilite cadastro público para administradores.** O painel não tem botão de criação de conta. Crie usuários administrativos manualmente e atribua a função `admin` somente a pessoas autorizadas. Como o e-mail interno não é uma caixa postal real, recuperação de senha deve ser feita por um administrador no Supabase.

## 3. Validar o fluxo

- Faça um pedido de teste pelo catálogo.
- Confirme que ele aparece na tabela `public.orders` no Supabase.
- Confirme que o WhatsApp abre com a mensagem do pedido.
- Entre em `/admin` e confira se o pedido aparece e se o status pode ser alterado.

Os pedidos com produtos sob consulta exibem o subtotal dos produtos com preço; confirme os valores finais e frete com o cliente pelo WhatsApp antes de iniciar a produção. Esta implementação não processa pagamentos.

## 4. Git e Lovable

As alterações estão na branch `feature/admin-orders`, para revisão antes de integrar em `main`. Depois de revisar e mesclar a branch, atualize o projeto local com `git pull`. O Lovable sincroniza alterações do GitHub conforme a integração e a branch principal configuradas no projeto.
