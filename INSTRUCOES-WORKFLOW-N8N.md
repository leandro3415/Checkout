# Instruções – Workflow n8n Completo (PIX + Cartão + Entrega)

Este documento explica o fluxo **workflow-n8n-PixCode-Completo.json** e como configurá-lo no n8n e na AbacatePay.

---

## O que o fluxo faz

1. **Geração de PIX (igual ao anterior)**  
   - Webhook `pix-push` → gera PIX (AbacatePay) → responde QR → atualiza lead → envia “Acesse por aqui” no WhatsApp.

2. **Quando o pagamento PIX é confirmado → entrega do produto no WhatsApp**  
   - Webhook `abacatepay-callback` recebe o evento da AbacatePay (o mesmo URL que você já configurou no dashboard).  
   - Se for `billing.paid` com `pixQrCode`, busca o lead pelo `id_transacao_oferta1` e envia o link do produto no WhatsApp (Evolution API).

3. **Pagamento com cartão (Cheap Plano)**  
   - Webhook `subscription-checkout` recebe `{ id, value }` do front.  
   - Cria cobrança com **cartão** na AbacatePay (`billing/create` com `methods: ["CARD"]`) e responde com `checkout_url` para o front redirecionar.

---

## Configuração no n8n

### 1. Importar o workflow

- No n8n: **Workflows** → **Import from File** → escolha `workflow-n8n-PixCode-Completo.json`.

### 2. Ajustar credenciais

- **Supabase** (BASE CHAT VENDAS): usada em “Atualiza Lead”, “Buscar Lead por transação”.  
- **Evolution API**: usada em “Enviar texto” e “Enviar produto WhatsApp”.  
- **AbacatePay**: o Bearer está nos nós HTTP; em produção prefira variáveis de ambiente ou credenciais do n8n.

### 3. URLs do seu n8n

Troque pelos seus domínios onde aplicável, por exemplo:

- Base: `https://n8n-agente-n8n.vugtol.easypanel.host`
- Webhooks:
  - PIX: `https://SEU-N8N/webhook/pix-push`
  - Pagamento confirmado: `https://SEU-N8N/webhook/abacatepay-callback`
  - Cartão: `https://SEU-N8N/webhook/subscription-checkout`

---

## Configuração na AbacatePay

### Webhook “Pagamento confirmado”

1. No dashboard da AbacatePay: **Webhooks** → **Criar**.
2. **URL**:  
   `https://n8n-agente-n8n.vugtol.easypanel.host/webhook/abacatepay-callback`  
   (ou use o mesmo que você já configurou na imagem.)  
   (adicione o `?webhookSecret=SEU_SECRET` se a AbacatePay exigir.)
3. **Evento**: marque **billing.paid** (pagamento confirmado).
4. Salve.

Assim, quando um PIX for pago, a AbacatePay chama esse webhook, o n8n busca o lead pela transação e envia o link do produto no WhatsApp.

---

## Tabela `leads` (Supabase)

Garanta que a tabela `leads` tenha pelo menos:

- `id` (PK)
- `phone` (texto; número para WhatsApp, ex: `5511999999999`)
- `pix_chave_oferta1` (texto)
- `id_transacao_oferta1` (texto) – usado para buscar o lead quando o pagamento é confirmado
- `produto_entregue_oferta1` (boolean, opcional) – marcado como true quando o produto é enviado no WhatsApp
- `data_entrega_oferta1` (timestamptz ou texto, opcional) – data/hora em que o produto foi entregue

---

## Link do produto (entrega no WhatsApp)

O link enviado quando o pagamento é confirmado está no nó **“Enviar produto WhatsApp”**:

- Mensagem:  
  `Pagamento confirmado! Acesse seu produto aqui: https://drive.google.com/drive/folders/15p7h95MtRMtkYS9MCWm4cogBEMdovRyM?usp=sharing`

Para mudar o link: edite o campo **messageText** desse nó no n8n.

---

## Cartão (Cheap Plano) – AbacatePay

- O fluxo usa **billing/create** com `methods: ["CARD"]` (cartão em beta na AbacatePay).
- O front (Finleve) já chama `subscription-checkout` com `{ value, id }`; o n8n devolve `{ checkout_url }` e o usuário é redirecionado para o checkout de cartão.
- **returnUrl** e **completionUrl** estão como `https://finleve.vercel.app`; altere no nó “Criar Billing Cartão” se usar outro domínio.

---

## Resumo dos webhooks

| Path                         | Método | Uso                                      |
|-----------------------------|--------|------------------------------------------|
| `pix-push`                  | POST   | Gerar PIX (body: `id`, `value`)          |
| `abacatepay-callback`          | POST   | Receber evento de pagamento confirmado (billing.paid) |
| `subscription-checkout`     | POST   | Criar checkout cartão (body: `id`, `value`) |

Depois de importar, ative o workflow no n8n e teste cada path conforme seu front e sua conta AbacatePay.
