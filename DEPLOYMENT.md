# 🚀 GUIA DE DEPLOY - NETLIFY

## INTRODUÇÃO

Este guia descreve como fazer deploy do Mirobaldo para Netlify com Netlify Functions (serverless).

---

## PASSO 1: PREPARAR REPO GITHUB

```bash
# 1. Inicializar git (se ainda não estiver)
git init

# 2. Adicionar remote
git remote add origin https://github.com/seu-usuario/mirobaldo.git

# 3. Commit inicial
git add .
git commit -m "Prepare for Netlify deployment"

# 4. Push para GitHub
git branch -M main
git push -u origin main
```

---

## PASSO 2: CONFIGURAR NETLIFY

### Opção A: Via UI (Recomendado para iniciantes)

1. Aceder a [netlify.com](https://netlify.com)
2. Fazer login com GitHub
3. Clicar "New site from Git"
4. Selecionar "GitHub"
5. Autorizar acesso
6. Selecionar repositório "mirobaldo"
7. Configurar build:
   - **Base directory**: (deixar vazio)
   - **Build command**: `npm run build`
   - **Publish directory**: `public`
8. Clicar "Advanced build settings"
9. Adicionar variáveis de ambiente:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: [Sua chave OpenAI]
10. Clicar "Deploy site"

### Opção B: Via CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Fazer login
netlify login

# Deploy
netlify deploy --prod

# Ou: Iniciar o projeto
netlify init
```

---

## PASSO 3: CONFIGURAR VARIÁVEIS DE AMBIENTE

No dashboard do Netlify:

1. Ir para **Site Settings** → **Build & Deploy** → **Environment**
2. Clicar "Edit variables"
3. Adicionar:
   ```
   OPENAI_API_KEY=sk-proj-xxxxx
   NODE_ENV=production
   ```

---

## PASSO 4: CONFIGURAR netlify.toml

✅ Já foi criado! Verifica que inclui:

- **Build command**: `npm run build`
- **Functions directory**: `netlify/functions`
- **Publish directory**: `public`
- **Redirects**: `/api/*` → `/.netlify/functions/api/:splat`
- **Cache headers**: Para imagens e assets

---

## PASSO 5: ESTRUTURA NETLIFY FUNCTIONS

O arquivo `netlify/functions/api.js` é a função serverless que:

1. Recebe requests em `/.netlify/functions/api`
2. Roteia para `/api/chat`
3. Executa agents
4. Retorna resposta

**URL da função:**
```
https://seu-site.netlify.app/.netlify/functions/api/chat
```

---

## PASSO 6: TESTAR DEPLOY

### Após deploy inicial:

```bash
# 1. Testar endpoint da função
curl https://seu-site.netlify.app/.netlify/functions/api/chat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"message": "Quem foi Paco Fortes?"}'

# 2. Verificar logs no Netlify
netlify logs
```

---

## PASSO 7: CONFIGURAR DOMÍNIO CUSTOMIZADO (Opcional)

1. No Netlify dashboard → **Domain settings**
2. Clicar "Add domain"
3. Entrar domínio customizado
4. Configurar DNS records (instruções fornecidas pelo Netlify)
5. Esperar propagação (15-30 min)

---

## ESTRUTURA DEPLOY

```
Netlify CDN
    ↓
Static Assets (public/)
├── index.html
├── script.js
├── styles.css
└── mirobaldo_chatbot.png
    ↓
Netlify Functions
├── api.js (POST /api/chat)
└── history.js (GET /api/history)
    ↓
Agents (backend logic)
└── Chamadas OpenAI API
```

---

## VARIÁVEIS DE AMBIENTE

| Variável | Valor | Obrigatório |
|----------|-------|------------|
| `OPENAI_API_KEY` | sk-proj-... | ✅ Sim |
| `NODE_ENV` | production | ✅ Sim |

---

## TROUBLESHOOTING

### ❌ "Function not found"

```bash
# Verificar que netlify.toml existe
ls netlify.toml

# Verificar que functions estão em netlify/functions/
ls netlify/functions/

# Deploy novamente
git add .
git commit -m "Fix functions"
git push origin main
```

### ❌ "OPENAI_API_KEY is undefined"

```bash
# Verificar variáveis de ambiente
netlify env:list

# Adicionar a variável
netlify env:set OPENAI_API_KEY sk-proj-xxxxx

# Re-deploy
netlify deploy --prod
```

### ❌ "CORS error"

✅ Já configurado! Headers CORS estão em `netlify.toml`

### ❌ "Cannot find module"

```bash
# Instalar dependências
npm install

# Fazer commit e push
git add package-lock.json
git commit -m "Update dependencies"
git push origin main
```

---

## MONITORAMENTO

### Logs

```bash
# Ver logs em tempo real
netlify logs --follow

# Ver logs específicos de uma função
netlify logs --functions=api
```

### Analytics

No Netlify dashboard → **Analytics**:
- Page views
- Bandwidth usage
- Function invocations
- Cold start times

---

## PERFORMANCE TIPS

1. **Cold starts**: Funções dormem após 15 min inatividade
   - Primeira chamada pode ser mais lenta (~2-3s)
   - Chamadas subsequentes são rápidas (<500ms)

2. **Cache**: Configurado em `netlify.toml`
   - Imagens: 1 ano
   - CSS/JS: 1 ano
   - JSON: 1 hora

3. **Limites**: Plano Netlify Pro
   - 125,000 invocações/mês grátis
   - Upgrade: $19/mês para 1M invocações

---

## PRÓXIMOS PASSOS

- ✅ Netlify deployed
- ⬜ Adicionar analytics (Plausible, Fathom)
- ⬜ Configurar backup automático de dados
- ⬜ Adicionar CI/CD com GitHub Actions
- ⬜ Monitorar performance com Sentry

---

## REFERÊNCIAS

- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [OpenAI API](https://platform.openai.com/docs)
- [Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)

---

**Versão**: 1.0
**Última atualização**: Oct 2025
