# Passo a passo completo – O que fazer agora

Siga esta ordem para deixar o fluxo PIX + Cartão + Entrega funcionando de ponta a ponta.

---

## Parte 1 – n8n

### Passo 1.1 – Importar o workflow

1. Abra o n8n: `https://n8n-agente-n8n.vugtol.easypanel.host`
2. Menu **Workflows** → **Import from File** (ou arraste o arquivo).
3. Selecione o arquivo **workflow-n8n-PixCode-Completo.json** (pasta Finleve Pay).
4. O workflow será criado com todos os nós (PIX, callback, cartão).

### Passo 1.2 – Conferir credenciais nos nós

1. **Supabase**  
   - Nós: *Atualiza Lead*, *Buscar Lead por transação*.  
   - Confira se a credencial **BASE CHAT VENDAS** está selecionada e válida (URL + chave do projeto no Supabase).

2. **Evolution API**  
   - Nós: *Enviar texto*, *Enviar produto WhatsApp*.  
   - Confira a instância (ex.: *chat n8n*) e se a credencial está ativa.

3. **AbacatePay**  
   - Os nós *GerarPix* e *Criar Billing Cartão* usam o Bearer direto no corpo.  
   - Se sua chave mudou, edite cada nó e atualize o header `Authorization: Bearer SUA_CHAVE`.

### Passo 1.3 – Ativar o workflow

1. No canto superior direito do workflow, ligue o interruptor **Active** (ficar verde).
2. Com o workflow ativo, os webhooks passam a aceitar requisições.

---

## Parte 2 – AbacatePay (webhook de pagamento)

### Passo 2.1 – Webhook já configurado

Você já tem:

- **Evento:** `billing.paid`
- **URL:** `https://n8n-agente-n8n.vugtol.easypanel.host/webhook/abacatepay-callback`

Não precisa criar outro webhook. Só confirme no dashboard da AbacatePay que essa URL está correta e que o evento **billing.paid** está marcado.

---

## Parte 3 – Supabase (tabela de leads)

### Passo 3.1 – Colunas na tabela `leads`

No Supabase, na tabela **leads**, garanta que existam:

| Coluna               | Tipo   | Uso |
|----------------------|--------|-----|
| `id`                 | (PK)   | Identificador do lead |
| `phone`              | TEXT   | Número para WhatsApp (ex: `5511999999999`) |
| `pix_chave_oferta1`  | TEXT   | Código PIX (preenchido ao gerar PIX) |
| `id_transacao_oferta1` | TEXT | ID da transação PIX (usado quando o pagamento é confirmado) |

Se alguma coluna não existir, crie no Supabase (Table Editor → sua tabela → Add column).

---

## Parte 4 – Front (checkout Finleve)

### Passo 4.1 – URLs no front

No seu **index.html** (ou onde estiver o checkout), as chamadas devem apontar para o seu n8n:

1. **Gerar PIX**  
   - POST para:  
     `https://n8n-agente-n8n.vugtol.easypanel.host/webhook/pix-push`  
   - Body: `{ "id": "<id_do_lead>", "value": <valor_em_centavos> }`

2. **Cartão (Cheap Plano)**  
   - POST para:  
     `https://n8n-agente-n8n.vugtol.easypanel.host/webhook/subscription-checkout`  
   - Body: `{ "id": "<id_do_lead>", "value": <valor_em_centavos>, "type": "subscription" }`  
   - Resposta esperada: `{ "checkout_url": "..." }` para redirecionar o usuário.

Se o front já usa essas URLs, não precisa mudar nada.

### Passo 4.2 – CORS

O workflow já está com **allowedOrigins** para `https://finleve.vercel.app` nos webhooks que o front chama. Se o checkout estiver em outro domínio, edite nos nós de Webhook do n8n e adicione esse domínio.

---

## Parte 5 – Link do produto (entrega no WhatsApp)

### Passo 5.1 – Onde alterar

Quando o pagamento é confirmado (PIX ou, se você implementar, cartão), o n8n envia uma mensagem no WhatsApp com o link do produto.

- **Onde editar:** no n8n, abra o nó **Enviar produto WhatsApp**.
- **Campo:** **messageText**.
- O link padrão é o do Google Drive que está na sticky note. Troque pela URL real do seu produto se for diferente.

---

## Parte 6 – Ordem do fluxo (resumo)

1. **Cliente no checkout**  
   - Informa valor/plano e id do lead (da URL ou do seu sistema).

2. **Se escolher PIX**  
   - Front chama **pix-push** com `id` e `value`.  
   - n8n gera PIX na AbacatePay, atualiza o lead com `pix_chave_oferta1` e `id_transacao_oferta1`, responde com QR/código e envia “Acesse por aqui” no WhatsApp.

3. **Quando o cliente paga o PIX**  
   - AbacatePay dispara **billing.paid** para **abacatepay-callback**.  
   - n8n busca o lead por `id_transacao_oferta1`, envia o link do produto no WhatsApp e responde 200.

4. **Se escolher cartão**  
   - Front chama **subscription-checkout** com `id` e `value`.  
   - n8n cria a cobrança com cartão na AbacatePay e devolve `checkout_url`.  
   - Front redireciona o cliente para essa URL para pagar.  
   - Quando o pagamento com cartão for confirmado, a AbacatePay dispara o **mesmo** **billing.paid** para **abacatepay-callback** (payload com `data.billing`). Se quiser entregar o produto também nesse caso, basta adicionar um ramo no workflow para `data.billing`.

---

## Checklist final

- [ ] Workflow **workflow-n8n-PixCode-Completo.json** importado no n8n  
- [ ] Credenciais Supabase e Evolution conferidas nos nós  
- [ ] Bearer da AbacatePay correto nos nós HTTP (se necessário)  
- [ ] Workflow **ativo** (interruptor verde)  
- [ ] Webhook na AbacatePay: URL **abacatepay-callback** e evento **billing.paid**  
- [ ] Tabela **leads** com colunas `id`, `phone`, `pix_chave_oferta1`, `id_transacao_oferta1`  
- [ ] Front chamando **pix-push** e **subscription-checkout** na URL correta do n8n  
- [ ] Link do produto ajustado no nó **Enviar produto WhatsApp** (se precisar)

Depois disso, faça um teste completo: gerar PIX → pagar (ou simular) → conferir se a mensagem com o link do produto chegou no WhatsApp.
