# Café com Testemunho

Plataforma institucional mobile-first para apresentação do projeto, agenda de encontros, testemunhos públicos moderados e painel administrativo.

## Stack
- Next.js + React + TypeScript
- Supabase Auth + Postgres/RLS para autenticação e conteúdo
- Vercel Blob para mídia
- Neon preparado via `neon.ts` e `DATABASE_URL`
- Deploy na Vercel

## Ambiente
Copie `.env.example` para `.env.local` e configure as variáveis.

## Neon
O projeto está preparado para Config-as-Code:
```bash
npm i -g neon@latest
neon login
neon skills -y
neon mcp -y
neon link --project-id frosty-field-72931210 --branch production -y
neon config init
neon deploy
```

O arquivo `neon.ts` já está no formato solicitado.

## Segurança
Testemunhos entram como privados. O banco usa RLS. O primeiro usuário autenticado pode se tornar Administrador somente quando ainda não existe nenhum perfil interno.
