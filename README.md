# 📦 Sistema de Controle de Estoque Corporativo (Node.js + Express + Prisma + MySQL)

Este projeto é uma API RESTful completa para gestão e controle de estoque corporativo, cobrindo desde o cadastro de usuários e fornecedores parceiros até movimentações de auditoria de saldo (entradas/saídas) e emissão de ordens de compra automatizadas.

---

## 🛠️ Tecnologias Utilizadas

- **Linguagem:** [TypeScript](https://www.typescriptlang.org/) (Tipagem estática e segurança de código)
- **Runtime & Framework:** [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **ORM:** [Prisma](https://www.prisma.io/) (Mapeamento objeto-relacional e migrations)
- **Banco de Dados:** [MySQL](https://www.mysql.com/) (Banco relacional)
- **Execução em Desenvolvimento:** [ts-node-dev](https://github.com/wclr/ts-node-dev)
- **Variáveis de Ambiente:** [dotenv](https://github.com/motdotla/dotenv)

---

## 🧠 Como Cheguei à Lógica e Arquitetura do Sistema

A construção deste sistema seguiu uma abordagem evolutiva, priorizando a integridade dos dados e a regra de negócio do controle de inventário:

1. **Modelagem de Dados e Relacionamentos (Prisma Schema):**
   - **Fornecedores (`Supplier`):** Identifiquei que um produto não pode existir de forma isolada no contexto corporativo. Por isso, criei a regra de que todo `Product` deve possuir uma chave estrangeira (`supplierId`) vinculada a um fornecedor ativo.
   - **Estoque Mínimo (`minQuantity`):** Para evitar que o estoque zerasse sem aviso, adicionei a propriedade `minQuantity` em cada produto. Esse valor serve de gatilho para a inteligência do sistema.

2. **Garantia de Integridade e Operações Atômicas (Transactions):**
   - Na movimentação de estoque (`IN` / `OUT`), a atualização do saldo do produto e a criação do registro histórico no `StockMovement` **precisam acontecer juntas**. Se uma operação falhar, a outra deve ser cancelada.
   - Utilizei o `prisma.$transaction()` para garantir que o banco de dados nunca fique com histórico sem alteração de saldo ou saldo alterado sem histórico.

3. **Validação de Regras de Negócio de Estoque:**
   - **Trava de Estoque Insuficiente:** Na rota de saída (`OUT`), o sistema compara a quantidade solicitada com o saldo atual (`stock`). Caso a quantidade seja maior, o sistema interrompe a requisição com código `400 Bad Request`.
   - **Geração de Ordens de Compra Automáticas:** Criei uma rota que varre a tabela de produtos buscando aqueles onde `stock <= minQuantity`. O sistema agrupa esses itens e gera ordens de compra (`PurchaseOrder`) vinculadas aos respectivos fornecedores com os valores calculados.

---

## 📁 Estrutura do Projeto

```text
.
├── prisma/
│   └── schema.prisma         # Definição das tabelas e relacionamentos MySQL
├── src/
│   ├── routes/
│   │   ├── users.ts          # Rotas de cadastro e consulta de usuários
│   │   ├── product.ts        # Rotas auxiliares de produtos
│   │   └── stock.ts          # Rotas de estoque (Fornecedores, Movimentações e Ordens de Compra)
│   ├── types/
│   │   ├── product.types.ts
│   │   ├── stock.types.ts    # Tipagens TypeScript para requisições de estoque
│   │   └── user.types.ts
│   └── server.ts             # Servidor Express e registro central das rotas
├── .env                      # Variáveis de ambiente (Connection String e Porta)
├── package.json
└── README.md