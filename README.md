# VINIDEV TECH

Plataforma genérica para gestão de eventos de tecnologia, palestrantes e ouvintes.

## 🚀 Tecnologias
- **Frontend**: React, Vite, TailwindCSS (ou Vanilla CSS), Lucide React.
- **Backend**: Node.js, Express, Prisma (SQLite).
- **Banco de Dados**: SQLite (`prisma/dev.db`).

## 🛠️ Como Rodar

### 1. Backend
```bash
cd backend
npm install
npx prisma generate
npm run dev
```

### 2. Frontend
```bash
cd landinpage
npm install
npm run dev
```

## 🔑 Acesso Inicial (Admin)
- **E-mail**: `admin@gmail.com`
- **Senha**: `123`

## 📝 Notas
- O sistema usa **SQLite** por padrão para facilitar o desenvolvimento local.
- O proxy do Vite está configurado para redirecionar `/api` para `http://localhost:3000`.
