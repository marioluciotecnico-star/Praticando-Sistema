# 📦 API de Controle de Estoque (Inventory Control System)

API RESTful para gerenciamento de usuários, produtos e movimentações de estoque (entradas e saídas), desenvolvida com Node.js, Express, TypeScript, MySQL e Prisma ORM.

---

## 🛠️ Tecnologias Utilizadas

- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Runtime / Framework:** [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- **Banco de Dados:** [MySQL](https://www.mysql.com/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Execução em Dev:** [ts-node-dev](https://github.com/wclr/ts-node-dev)
- **Variáveis de Ambiente:** [dotenv](https://github.com/motdotla/dotenv)

---

## 📁 Estrutura do Projeto

```text
├── prisma/
│   └── schema.prisma      # Definição do banco de dados e modelos do Prisma
├── src/
│   ├── routes/
│   │   ├── product.ts     # Rotas CRUD de Produtos
│   │   ├── stock.ts       # Rotas de Movimentação de Estoque
│   │   └── users.ts       # Rotas CRUD de Usuários
│   ├── types/
│   │   ├── product.types.ts
│   │   ├── stock.types.ts
│   │   └── user.types.ts
│   └── server.ts          # Arquivo principal e servidor Express
├── .env                   # Variáveis de ambiente (não versionado)
├── .env.example           # Exemplo de configuração de variáveis de ambiente
├── package.json
├── tsconfig.json
└── README.md