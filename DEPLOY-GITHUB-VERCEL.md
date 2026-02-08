# Deploy via GitHub → Vercel (automático)

O projeto já está no GitHub. Basta **enviar as alterações** (commit + push) e a Vercel faz o deploy automaticamente (se o repositório já estiver conectado).

---

## 1. Enviar o código para o GitHub

No terminal (VS Code/Cursor), na pasta do projeto:

```bash
cd "c:\Users\leand\OneDrive\Desktop\Finleve Pay"
git add .
git status
git commit -m "Add api subscription-checkout proxy and deploy docs"
git push origin main
```

Se a branch principal for `master` em vez de `main`:

```bash
git push origin master
```

Assim a pasta **api** (com `subscription-checkout.js`) e as outras alterações sobem para o GitHub.

---

## 2. Deploy automático na Vercel

- Se o repositório **já está conectado** a um projeto na Vercel, o deploy roda sozinho após o `git push`. A Vercel detecta o push e publica a nova versão.
- Se **ainda não conectou** o repo à Vercel:
  1. Acesse [vercel.com](https://vercel.com) e faça login.
  2. **Add New** → **Project**.
  3. **Import** o repositório do GitHub (ex.: `finleve-pay` ou o nome do seu repo).
  4. **Deploy** (pode deixar as opções padrão).
  5. Depois disso, todo **push** nesse repositório dispara um deploy automático na Vercel.

---

## 3. Conferir o deploy

- No dashboard da Vercel: **Deployments** → o último deploy deve aparecer como **Ready**.
- Teste o site: **https://finleve.vercel.app** (ou a URL do projeto).
- Teste o cartão: aba **Cartão de crédito** → **Finalizar** → deve redirecionar sem erro de CORS (o front chama `/api/subscription-checkout`, que a Vercel serve).

---

## Resumo dos comandos

```bash
cd "c:\Users\leand\OneDrive\Desktop\Finleve Pay"
git add .
git commit -m "Add api subscription-checkout proxy"
git push origin main
```

Depois do push, o deploy na Vercel aparece sozinho (se o repo já estiver conectado).
