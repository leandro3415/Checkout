# Como testar no DEV (AbacatePay) e ver se o produto é entregue

Guia para testar o fluxo completo em conta **DEV** da AbacatePay e conferir se a entrega do produto no WhatsApp acontece quando o pagamento é confirmado.

---

## Antes de começar

1. **n8n:** Workflow **workflow-n8n-PixCode-Completo.json** importado e **ativo**.
2. **AbacatePay:** Webhook **billing.paid** apontando para  
   `https://n8n-agente-n8n.vugtol.easypanel.host/webhook/abacatepay-callback`  
   e criado no **ambiente DEV** (webhooks de DEV só recebem eventos de DEV).
3. **Supabase:** Pelo menos um lead na tabela **leads** com:
   - `id` (ex.: `abc-123`)
   - `phone` (ex.: `5511999999999` para WhatsApp)
   - Colunas `pix_chave_oferta1` e `id_transacao_oferta1` podem ficar vazias no início.

---

## Passo 1 – Gerar um PIX (criar o QR em DEV)

Você precisa de um PIX criado **em modo DEV** para poder simular o pagamento depois.

### Opção A – Pelo checkout (recomendado)

1. Abra o checkout Finleve com o **id do lead** na URL, por exemplo:  
   `https://finleve.vercel.app?id=SEU_LEAD_ID`  
   ou `https://finleve.vercel.app/SEU_LEAD_ID`
2. Escolha **PIX**, clique em **Gerar PIX**.
3. O n8n vai:
   - Chamar a AbacatePay (DEV) e criar o PIX
   - Gravar no lead `pix_chave_oferta1` e **`id_transacao_oferta1`** (ID do PIX)
   - Enviar “Acesse por aqui” no WhatsApp

Anote ou guarde o **id do lead**; o **id da transação PIX** estará no Supabase na coluna **id_transacao_oferta1** desse lead.

### Opção B – Direto pelo n8n (Postman/curl)

1. **POST** para:  
   `https://n8n-agente-n8n.vugtol.easypanel.host/webhook/pix-push`
2. **Headers:** `Content-Type: application/json`
3. **Body (JSON):**
   ```json
   {
     "id": "SEU_LEAD_ID",
     "value": 1000
   }
   ```
4. Na resposta, você recebe `qr_code` e `qr_code_base64`. O **id da transação PIX** é o que o n8n salvou no lead em **id_transacao_oferta1**. Abra o Supabase, vá naquele lead e copie o valor de **id_transacao_oferta1** (algo como `pix_char_xxxxx`).

---

## Passo 2 – Simular o pagamento na AbacatePay (DEV)

Quando você “simula” o pagamento, a AbacatePay marca esse PIX como pago e dispara o evento **billing.paid** para o seu webhook. O n8n então busca o lead e manda o link do produto no WhatsApp.

1. Pegue o **ID do PIX** (igual a **id_transacao_oferta1** do lead):
   - Pelo Supabase: coluna **id_transacao_oferta1** do lead que você usou no passo 1.
   - Ou use o `id` que a API da AbacatePay devolveu ao criar o PIX (no n8n, saída do nó “GerarPix” → `data.id`).

2. Chame a API **Simular Pagamento** da AbacatePay (só funciona em DEV):

   **Postman / Insomnia / curl:**

   - **Método:** POST  
   - **URL:**  
     `https://api.abacatepay.com/v1/pixQrCode/simulate-payment?id=ID_DO_PIX`  
     Troque `ID_DO_PIX` pelo valor de **id_transacao_oferta1** (ex.: `pix_char_xxxxx`).

   - **Headers:**
     - `Authorization: Bearer abc_dev_HthWHAh54y1HRMt66pUzAphX`  
       (use sua chave **DEV** da AbacatePay)
     - `Content-Type: application/json`

   - **Body (JSON):**
     ```json
     {}
     ```
     ou
     ```json
     { "metadata": {} }
     ```

   **Exemplo em curl:**
   ```bash
   curl -X POST "https://api.abacatepay.com/v1/pixQrCode/simulate-payment?id=ID_DO_PIX" \
     -H "Authorization: Bearer abc_dev_SUA_CHAVE_DEV" \
     -H "Content-Type: application/json" \
     -d "{}"
   ```

3. Se der certo, a API responde 200 e a AbacatePay envia o **billing.paid** para:  
   `https://n8n-agente-n8n.vugtol.easypanel.host/webhook/abacatepay-callback`

---

## Passo 3 – Conferir se o produto foi “entregue”

1. **n8n**
   - Abra **Executions** no workflow que tem o webhook **abacatepay-callback**.
   - Deve aparecer uma execução nova disparada pelo **Webhook abacatepay-callback**.
   - Confira se passou por: **Se PIX foi pago** → **Buscar Lead por transação** → **Se tem lead** → **Enviar produto WhatsApp** → **Responde 200**.

2. **WhatsApp**
   - No número do lead (coluna **phone** da tabela **leads**) deve chegar a mensagem com o link do produto, por exemplo:  
     “Pagamento confirmado! Acesse seu produto aqui: https://drive.google.com/...”

3. **Supabase**
   - Nada obrigatório a alterar aqui; o importante é o lead ter **phone** e **id_transacao_oferta1** preenchidos (o fluxo já preenche ao gerar o PIX).

---

## Resumo do fluxo de teste

| Ordem | O que fazer | Onde |
|-------|-------------|------|
| 1 | Ter um lead com `id` e `phone` | Supabase |
| 2 | Gerar PIX (checkout ou POST em pix-push) | Checkout ou n8n |
| 3 | Pegar o ID do PIX (id_transacao_oferta1) | Supabase ou resposta da API |
| 4 | Chamar simulate-payment com esse ID | AbacatePay API (DEV) |
| 5 | Ver execução no n8n e mensagem no WhatsApp | n8n + WhatsApp |

---

## Se algo não funcionar

- **Webhook não dispara no n8n:** confirme na AbacatePay que o webhook **billing.paid** foi criado no **ambiente DEV** e que a URL é exatamente a do **abacatepay-callback**.
- **Lead não encontrado:** o **id_transacao_oferta1** do lead tem que ser **exatamente** o mesmo `id` do PIX que você passou em `simulate-payment`.
- **WhatsApp não envia:** confira no n8n a credencial da Evolution API e o campo **phone** do lead (formato ex.: `5511999999999`).
- **Simulate-payment dá 401:** use a chave de API **DEV** (ex.: `abc_dev_...`) no header `Authorization`.

Depois desses passos, você consegue testar todos os eventos em DEV e ver se o produto é realmente entregue quando o pagamento é confirmado (simulado).
