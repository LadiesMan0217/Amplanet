# 🚀 Como Criar o Repositório no GitHub

## Passo 1: Criar Repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique no botão **"+"** no canto superior direito → **"New repository"**
3. Configure o repositório:
   - **Repository name**: `amplanet` (ou o nome que preferir)
   - **Description**: "Site institucional da Amplanet com mapa de cobertura interativo"
   - **Visibility**: Escolha **Public** ou **Private**
   - ⚠️ **NÃO** marque "Initialize this repository with a README" (já temos um)
   - ⚠️ **NÃO** adicione .gitignore ou license (já temos)

4. Clique em **"Create repository"**

## Passo 2: Conectar o Repositório Local ao GitHub

Após criar o repositório no GitHub, você verá uma página com instruções. Execute os comandos abaixo no terminal:

### Opção 1: Se o repositório está vazio (recomendado)

```bash
# Navegue até a pasta do projeto (se ainda não estiver)
cd "c:\Users\krodr\OneDrive\Documentos\Projetos\Amplanet"

# Adicione o remote do GitHub (SUBSTITUA seu-usuario pelo seu usuário do GitHub)
git remote add origin https://github.com/seu-usuario/amplanet.git

# Renomeie a branch para main (se necessário)
git branch -M main

# Envie todos os commits para o GitHub
git push -u origin main
```

### Opção 2: Se você já tem um remote configurado

```bash
# Verifique o remote atual
git remote -v

# Se precisar atualizar o URL
git remote set-url origin https://github.com/seu-usuario/amplanet.git

# Faça o push
git push -u origin main
```

## Passo 3: Verificar

1. Atualize a página do repositório no GitHub
2. Você deve ver todos os arquivos do projeto
3. O README.md deve aparecer na página principal

## 🔐 Autenticação

Se o GitHub pedir autenticação:

### Opção A: Token de Acesso Pessoal (recomendado)

1. Vá em Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Gere um novo token com permissão `repo`
3. Use o token como senha quando o Git pedir

### Opção B: GitHub CLI

```bash
# Instale o GitHub CLI se ainda não tiver
# Depois execute:
gh auth login
```

### Opção C: SSH (se configurado)

Se você tem SSH configurado, use:
```bash
git remote add origin git@github.com:seu-usuario/amplanet.git
```

## 📝 Comandos Úteis

```bash
# Ver status do repositório
git status

# Ver histórico de commits
git log --oneline

# Ver remotes configurados
git remote -v

# Atualizar depois de mudanças locais
git add .
git commit -m "Sua mensagem de commit"
git push
```

## ✅ Checklist

- [ ] Repositório criado no GitHub
- [ ] Remote configurado (`git remote -v` mostra o GitHub)
- [ ] Push realizado com sucesso
- [ ] Arquivos visíveis no GitHub
- [ ] README.md aparecendo na página principal

## 🆘 Problemas Comuns

### "repository not found"
- Verifique se o nome do usuário e repositório estão corretos
- Verifique se você tem permissão no repositório

### "permission denied"
- Configure autenticação (token ou SSH)
- Verifique suas credenciais do GitHub

### "failed to push"
- Certifique-se de ter feito `git pull` primeiro se houver conflitos
- Verifique sua conexão com a internet

---

**Pronto!** Após seguir estes passos, seu projeto estará no GitHub! 🎉

