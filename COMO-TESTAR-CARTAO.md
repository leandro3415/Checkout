# Como testar o pagamento por cartão

Passo a passo para testar o fluxo de **cartão (Cheap Plano)** em DEV.

---

## O que vai acontecer

1. O checkout (ou Postman) chama o webhook **subscription-checkout** com `id` (lead) e `value` (centavos).
2. O n8n cria uma cobrança com **cartão** na AbacatePay e devolve **checkout_url**.
3. Você é redirecionado para a página da AbacatePay para pagar com cartão.
4. Em **DEV**, o pagamento é simulado (sem cobrança real).
5. Quando o pagamento é confirmado, a AbacatePay envia **billing.paid** para **abacatepay-callback** (payload com `data.billing`).

---

## Opção A – Testar pelo checkout (recomendado)

1. **Tenha um lead no Supabase**  
   Com `id` (ex.: `abc-123`) e, se quiser receber produto no WhatsApp depois, com `phone`.

2. **Abra o checkout com o id do lead na URL**  
   Exemplo:  
   `https://finleve.vercel.app?id=SEU_LEAD_ID`  
   ou  
   `https://finleve.vercel.app/SEU_LEAD_ID`

3. **Escolha “Cartão de crédito”**  
   Clique na aba **Cartão de crédito**.

4. **Preencha o formulário**  
   Número, validade, CVV e nome do titular (em DEV pode usar dados de teste).

5. **Clique em “Finalizar”**  
   O front chama `.../webhook/subscription-checkout` com `{ id, value, type: 'subscription' }`.

6. **Confira o redirecionamento**  
   - Se o n8n estiver certo, a resposta terá `checkout_url` e você será redirecionado para a página de pagamento da AbacatePay.  
   - Na página da AbacatePay, conclua o pagamento com cartão (em DEV é ambiente de teste).

7. **Depois do pagamento**  
   A AbacatePay dispara **billing.paid** para `.../webhook/abacatepay-callback`.  
   O workflow trata **PIX pago** (`data.pixQrCode`) e **cartão pago** (`data.billing`): em ambos os casos o produto é enviado no WhatsApp e o lead é atualizado (produto_entregue_oferta1, data_entrega_oferta1).

---

## Opção B – Testar direto no n8n (Postman/curl)

1. **POST** para:  
   `https://n8n-agente-n8n.vugtol.easypanel.host/webhook/subscription-checkout`

2. **Headers:**  
   `Content-Type: application/json`

3. **Body (JSON):**  
   ```json
   {
     "id": "SEU_LEAD_ID",
     "value": 1000,
     "type": "subscription"
   }
   ```  
   (`value` em centavos; 1000 = R$ 10,00)

4. **Resposta esperada:**  
   ```json
   {
     "checkout_url": "https://pay.abacatepay.com/bill-xxxxx"
   }
   ```

5. **Abra o `checkout_url`** no navegador e conclua o pagamento com cartão na página da AbacatePay (em DEV, use cartão de teste se a AbacatePay informar).

---

## Se der erro

- **“Webhook não retornou checkout_url”**  
  Confira no n8n: nó **Criar Billing Cartão** (URL da AbacatePay, Bearer **DEV**) e nó **Responde Checkout URL** (resposta com `checkout_url` = `$json.data.url`).

- **401 na AbacatePay**  
  Use a chave de API **DEV** (`abc_dev_...`) no nó **Criar Billing Cartão**.

- **CARD não disponível**  
  O método **CARD** pode estar em beta na AbacatePay. Confirme no dashboard/contato se o cartão está habilitado para sua conta DEV.

- **Produto não enviado no WhatsApp após pagar com cartão**  
  O workflow já trata **cartão pago** (`data.billing`): quando o pagamento com cartão é confirmado, o n8n envia o produto no WhatsApp e atualiza o lead (produto_entregue_oferta1, data_entrega_oferta1). O **Criar Billing Cartão** envia `externalId: id_lead` para a AbacatePay; no webhook billing.paid esse `externalId` é usado para identificar o lead e atualizar a linha.

---

## Resumo

| Passo | Onde |
|-------|------|
| 1 | Ter lead com `id` (e `phone` se for usar entrega) |
| 2 | Checkout com `?id=LEAD_ID` ou POST em subscription-checkout |
| 3 | Clicar em “Finalizar” (cartão) ou usar o `checkout_url` da resposta |
| 4 | Pagar na página da AbacatePay (DEV = teste) |
| 5 | Cartão pago já envia produto no WhatsApp e atualiza o lead (workflow atual) |

Depois disso você consegue testar o método de pagamento por cartão de ponta a ponta.
