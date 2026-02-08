# Deploy na Vercel – Passo a passo (VS Code / Cursor)

Guia para fazer o deploy do projeto **Finleve Pay** na Vercel a partir do VS Code ou Cursor, com comandos.

---

## Pré-requisitos

- Conta na [Vercel](https://vercel.com) (grátis).
- Projeto na pasta **Finleve Pay** com **index.html** e pasta **api** (com `api/subscription-checkout.js`).

---

## Opção 1 – Deploy pela Vercel CLI (terminal no VS Code)

### Passo 1.1 – Abrir o terminal no VS Code

1. No VS Code/Cursor: **Terminal** → **New Terminal** (ou `` Ctrl+` ``).
2. Confirme que está na pasta do projeto:
   ```bash
   cd "c:\Users\leand\OneDrive\Desktop\Finleve Pay"
   ```

### Passo 1.2 – Instalar a Vercel CLI (se ainda não tiver)

```bash
npm install -g vercel
```

Se der erro de permissão no Windows, use:

```bash
npx vercel
```

(e pule o `npm install -g vercel`).

### Passo 1.3 – Fazer login na Vercel (só na primeira vez)

```bash
vercel login
```

Abra o link que aparecer no navegador e autorize. Depois volte ao terminal.

### Passo 1.4 – Deploy

Na pasta do projeto:

```bash
vercel
```

Na primeira vez a Vercel pergunta:

- **Set up and deploy?** → `Y` (Yes)
- **Which scope?** → escolha sua conta (Enter)
- **Link to existing project?** → `N` (No)
- **Project name?** → `finleve-pay` (ou o nome que quiser, Enter)
- **In which directory is your code?** → `./` (Enter)

O deploy sobe e no final aparece algo como:

```
Production: https://finleve-pay-xxx.vercel.app
```

Para publicar no domínio que você já usa (ex.: **finleve.vercel.app**), use:

```bash
vercel --prod
```

Ou configure o domínio no dashboard da Vercel (Project → Settings → Domains).

---

## Opção 2 – Deploy pelo Git (GitHub + Vercel)

### Passo 2.1 – Inicializar Git (se o projeto ainda não for um repositório)

No terminal, na pasta do projeto:

```bash
cd "c:\Users\leand\OneDrive\Desktop\Finleve Pay"
git init
```

### Passo 2.2 – Criar arquivo .gitignore (opcional)

```bash
echo node_modules >> .gitignore
echo .vercel >> .gitignore
```

### Passo 2.3 – Primeiro commit

```bash
git add .
git commit -m "Deploy Finleve Pay com api subscription-checkout"
```

### Passo 2.4 – Criar repositório no GitHub e enviar o código

1. No [GitHub](https://github.com/new), crie um repositório novo (ex.: `finleve-pay`), **sem** README, .gitignore ou licença.
2. No terminal, execute (troque `SEU_USUARIO` e `finleve-pay` pelo seu usuário e nome do repo):

```bash
git remote add origin https://github.com/SEU_USUARIO/finleve-pay.git
git branch -M main
git push -u origin main
```

Se pedir usuário/senha, use um **Personal Access Token** do GitHub em vez da senha.

### Passo 2.5 – Conectar o repositório na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login.
2. **Add New** → **Project**.
3. **Import** o repositório **finleve-pay** (ou o nome que você usou).
4. **Root Directory:** deixe em branco (ou `./`).
5. **Framework Preset:** deixe **Other** (projeto estático + API).
6. Clique em **Deploy**.

Quando terminar, a Vercel mostra a URL do projeto (ex.: **https://finleve-pay-xxx.vercel.app**). Para usar **finleve.vercel.app**, vá em **Project → Settings → Domains** e adicione o domínio.

---

## Resumo dos comandos (Opção 1 – CLI)

Copie e cole no terminal (uma vez por linha), na pasta do projeto:

```bash
cd "c:\Users\leand\OneDrive\Desktop\Finleve Pay"
npx vercel login
npx vercel
```

Na primeira vez responda às perguntas (project name, etc.). Depois, para deploy em produção:

```bash
npx vercel --prod
```

---

## Conferir se a API subiu

Depois do deploy, teste o proxy:

- **GET** (só para testar se a rota existe):  
  `https://finleve.vercel.app/api/subscription-checkout`  
  → pode retornar 405 Method Not Allowed (é esperado; a API aceita só POST).

- O **checkout no site** (Cartão → Finalizar) faz **POST** para `/api/subscription-checkout` e deve redirecionar para a página de pagamento da AbacatePay sem erro de CORS.

---

## Se der erro

- **"vercel: command not found"** → use `npx vercel` em vez de `vercel`.
- **Erro de permissão no Windows** → rode o terminal como administrador ou use `npx vercel`.
- **API 404** → confirme que a pasta **api** está na raiz do projeto e que o arquivo **api/subscription-checkout.js** foi commitado/enviado.
- **Domínio diferente** → em **Vercel → Project → Settings → Domains** adicione **finleve.vercel.app** e aponte o DNS conforme a Vercel indicar.

Com isso você faz o deploy do VS Code/Cursor para a Vercel passo a passo e com os códigos/comandos necessários.
