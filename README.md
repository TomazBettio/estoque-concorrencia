# Sistema de Estoque com Controle de Concorrência

Este projeto é uma prova de conceito (PoC) demonstrando um sistema de e-commerce robusto, focado em resolver o problema de **Race Conditions** (Condições de Corrida) no gerenciamento de estoque.

O sistema utiliza **Optimistic Locking** (Bloqueio Otimista) para garantir que o estoque nunca fique negativo, mesmo quando múltiplas requisições tentam comprar o mesmo produto simultaneamente.

## Tecnologias Utilizadas

### Backend
- **Node.js** & **Express**: Servidor API REST.
- **PostgreSQL**: Banco de dados relacional (hospedado no Neon).
- **Knex.js**: Query Builder e gerenciador de Migrations/Seeds.
- **Zod**: Validação de dados.
- **Dotenv**: Gerenciamento de variáveis de ambiente.

### Frontend
- **Vue.js 3** (Composition API): Framework.
- **Vite**: Build tool.
- **TypeScript**: Tipagem estática.
- **Lucide Vue**: Ícones.
- **CSS Nativo**: Estilização customizada e responsiva.

---

## Instalação e Configuração

### Pré-requisitos
- Node.js (v18+)
- PostgreSQL (Local ou Cloud)

### 1. Configurar o Backend

1. Navegue até a pasta do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o arquivo `.env` na raiz do backend com a URL do seu banco de dados:
   ```env
   DATABASE_URL=postgres://user:password@host:port/database
   PORT=3000
   ```
4. Rode as migrações para criar as tabelas:
   ```bash
   npx knex migrate:latest
   ```
5. (Opcional) Popule o banco com dados iniciais:
   ```bash
   npx knex seed:run
   ```
6. Inicie o servidor:
   ```bash
   npm start
   ```
   > O servidor rodará em `http://localhost:3000`

### 2. Configurar o Frontend

1. Navegue até a pasta do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   > O frontend estará acessível em `http://localhost:5173` (ou outra porta indicada).

---

## Testando a Concorrência

O projeto inclui scripts específicos para simular ataques de concorrência e validar a robustez do sistema.

### Script de Teste Básico
Dispara 20 requisições simultâneas tentando comprar o mesmo produto.
```bash
node backend/test-concurrency.js
```

### Script com Retry (Pílula)
Simula um cenário real onde clientes "insistem" na compra. Se receberem um erro `409 Conflict`, o script aguarda um tempo aleatório (backoff) e tenta novamente.
```bash
node backend/test-concurrency-pill.js
```

**Resultado Esperado:**
- O sistema deve processar apenas as compras para as quais há estoque.
- NENHUMA venda deve exceder o estoque (estoque negativo é impossível).
- Requisições conflitantes retornam `409 Conflict`.

---

## Documentação da API

### Produtos

- **GET /products**: Lista todos os produtos.
- **GET /products/:id**: Detalhes de um produto.
- **POST /products**: Cria um novo produto.
  - Body: `{ "name": "Notebook", "stock": 10 }`
- **PUT /products/:id**: Atualiza um produto.
- **DELETE /products/:id**: Remove um produto.

### Pedidos

- **POST /orders**: Cria um novo pedido.
  - Body: `{ "items": [{ "productId": 1, "quantity": 2 }] }`
- **GET /orders**: Lista histórico de pedidos.

---

## Estrutura do Banco de Dados

```mermaid
erDiagram
    products ||--o{ order_items : "contém"
    orders ||--o{ order_items : "possui"

    products {
        integer id PK
        string name
        integer stock
        integer version "Optimistic Lock"
    }

    orders {
        integer id PK
        timestamp created_at
        string status
        decimal total
    }

    order_items {
        integer id PK
        integer order_id FK
        integer product_id FK
        integer quantity
    }
```

---

## Melhorias Futuras

Devido ao tempo limitado proposto para este case, algumas otimizações de arquitetura para altíssima escala não foram implementadas, mas são recomendadas para uma evolução do produto:

1.  **Redis como Middleware de Estoque (Pattern de Reserva)**:
    *   Utilizar Redis para decrementar o estoque atomicamente em memória antes de persistir no banco relacional.
    *   **Benefício**: Reduz drasticamente a carga no PostgreSQL e elimina a latência de rejeições por concorrência.

2.  **Arquitetura Assíncrona com Filas (BullMQ/RabbitMQ)**:
    *   Implementar filas para serializar as requisições de compra em momentos de pico (ex: Black Friday).
    *   **Benefício**: Garante que todas as requisições sejam processadas na ordem de chegada e elimina a necessidade de *retries* do cliente causados pelo Optimistic Locking, melhorando a experiência do usuário.