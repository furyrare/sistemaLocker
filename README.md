# Sistema Smart Locker - Dispetral

## 📋 Visão Geral

Sistema completo de gerenciamento de lockers inteligentes para armazenamento e retirada de encomendas. Desenvolvido com Node.js/Express no backend e React/Next.js no frontend.

## 🏗️ Arquitetura

### Backend (Node.js + Express + Prisma + SQL Server)
- **Porta:** 4000
- **Banco:** Microsoft SQL Server
- **ORM:** Prisma 5.22
- **E-mail:** Nodemailer (SMTP)
- **Validação:** Zod
- **Segurança:** bcryptjs, crypto

### Frontend (React + Next.js)
- **Framework:** Next.js 14 (App Router)
- **Estilização:** Tailwind CSS + fonte Inter
- **Estado:** React Hooks
- **API:** Fetch nativo centralizado em `components/api.js`

## 📁 Estrutura de Arquivos

```
SistemaLocker/
├── backend/
│   ├── server.js                          # Servidor principal (porta 4000)
│   ├── .env                               # Variáveis de ambiente (ver seção abaixo)
│   ├── prisma/
│   │   └── schema.prisma                  # Schema do banco de dados
│   └── src/
│       ├── controllers/                   # Controladores da API
│       │   ├── compartmentController.js
│       │   ├── dashboardController.js
│       │   ├── deliveryController.js
│       │   ├── deliveriesManageController.js
│       │   ├── lockersManageController.js
│       │   ├── pickupController.js
│       │   └── reportController.js
│       ├── services/                      # Lógica de negócio
│       │   ├── deliveryService.js
│       │   ├── emailService.js
│       │   ├── reportService.js
│       │   └── analyticsService.js
│       ├── routes/                        # Rotas da API
│       ├── db/
│       │   └── prisma.js                  # Conexão com banco
│       └── utils/
│           └── gerarCodigo.js             # Gerador de códigos de 6 dígitos
│
└── frontend/
    ├── app/
    │   ├── layout.js                      # Layout raiz com header sticky
    │   ├── globals.css                    # Fonte Inter + Tailwind base
    │   ├── dashboard/DashboardClient.js   # Grid de compartimentos em tempo real
    │   ├── entregas/                      # Formulário de nova entrega
    │   ├── pedidos/PedidosClient.js       # Gestão de pedidos ativos e histórico
    │   ├── lockers/                       # Cadastro de lockers
    │   ├── compartments/                  # Visualização de caixas reservadas
    │   ├── tablet/KioskClient.js          # Interface quiosque (tablet)
    │   ├── analise/                       # Analytics e relatórios
    │   └── deliveriesManage/              # Gestão avançada de encomendas
    ├── components/
    │   ├── api.js                         # Cliente HTTP centralizado
    │   ├── NavLinks.js                    # Navegação com link ativo destacado
    │   ├── ConfirmModal.js                # Modal de confirmação (React Portal)
    │   ├── DetailsModalUltimate.js        # Modal de detalhes do pedido (React Portal)
    │   ├── CreateDeliveryModal.js         # Modal para criar encomenda
    │   ├── AddLockerModal.js              # Modal para adicionar/editar locker
    │   ├── ConfirmModal.js                # Modal genérico de confirmação
    │   └── AnalyticsDashboard.js          # Dashboard de análises
    └── lib/
        └── utils.js                       # Funções compartilhadas (status, formatação)
```

## 🚀 Como ligar o sistema

### Pré-requisito: arquivo `backend/.env`
```env
PORT=4000
DATABASE_URL="sqlserver://HOST;database=NOME_DB;user=USUARIO;password=SENHA;trustServerCertificate=true"

# E-mail (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu@email.com
SMTP_PASS=sua_senha_de_app
EMAIL_FROM=seu@email.com

# WhatsApp via Suri (ChatbotMaker) — opcional, mas recomendado
SURI_URL=https://cbm-wap-babysuri-cb89467489-dispe.azurewebsites.net
SURI_TOKEN=seu_token_suri_aqui
SURI_CHANNEL_ID=wp1015760648278458

NODE_ENV=development
JWT_SECRET=sua_chave_secreta
```

### Terminal 1 — Backend
```bash
cd backend
npm install        # apenas na primeira vez
npm run dev        # desenvolvimento (nodemon)
# ou
npm start          # produção
```

### Terminal 2 — Frontend
```bash
cd frontend
npm install        # apenas na primeira vez
npm run dev        # http://localhost:3000
```

### Primeira vez (banco de dados)
```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

## 🛣️ Rotas da API

### Lockers
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/lockers-manage` | Listar lockers |
| POST | `/api/lockers-manage` | Criar locker |
| PUT | `/api/lockers-manage/:id` | Atualizar locker |
| DELETE | `/api/lockers-manage/:id` | Deletar locker |

### Compartimentos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/dashboard/grid?lockerId={id}` | Grid de compartimentos |
| POST | `/api/compartment/toggle-status` | Bloquear / desbloquear |

### Entregas
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/deliveries/generate-code` | Gerar código de depósito |
| POST | `/api/deliveries/deposit` | Depositar encomenda |
| GET | `/api/deliveries-manage` | Listar entregas (filtro por lockerId) |
| DELETE | `/api/deliveries-manage/:id` | Deletar entrega |
| POST | `/api/deliveries/corrigir-status` | Corrigir status inconsistentes |

### Retirada
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/pickup` | Retirar encomenda (tablet) |
| POST | `/api/pickup/verify` | Verificar código de retirada |

### Analytics / Relatórios
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/analytics` | Dados de análise (filtro por locker e datas) |
| GET | `/api/report/deliveries` | Relatório em CSV |
| GET | `/api/dashboard/stats` | Estatísticas gerais |

## 📊 Status do Sistema

### Status das Entregas
| Status | Descrição |
|--------|-----------|
| `PENDENTE_DEPOSITO` | Aguardando depósito do entregador |
| `PRONTO_PARA_RETIRADA` | Depositado, aguardando retirada |
| `RETIRADO` | Encomenda retirada pelo destinatário |

### Status dos Compartimentos
| Status | Descrição |
|--------|-----------|
| `DISPONIVEL` | Livre para uso |
| `RESERVADO` | Reservado (código gerado, depósito pendente) |
| `OCUPADO` | Encomenda depositada aguardando retirada |
| `BLOQUEADO` | Bloqueado manualmente pelo administrador |

## 🔄 Fluxo do Sistema

### 1. Criação de Entrega
1. Admin gera código de depósito informando dados do destinatário
2. Sistema reserva um compartimento aleatório disponível
3. Entrega fica com status `PENDENTE_DEPOSITO`

### 2. Depósito
1. Entregador insere código de depósito no tablet
2. Sistema valida o código e atualiza o status
3. E-mail com **código de retirada** é enviado ao destinatário
4. Compartimento fica `OCUPADO`, entrega fica `PRONTO_PARA_RETIRADA`

### 3. Retirada
1. Destinatário insere código de retirada no tablet
2. Sistema valida e processa a retirada
3. Compartimento volta para `DISPONIVEL`, entrega fica `RETIRADO`
4. E-mail de confirmação enviado ao destinatário (e ao remetente, se informado)

## 📱 Integração WhatsApp (Suri / ChatbotMaker)

O sistema envia notificações via WhatsApp **em paralelo ao e-mail**, usando a plataforma Suri da Dispetral.

### Fluxo de notificações

| Evento | E-mail | WhatsApp |
|--------|--------|----------|
| Após depósito | ✅ Código de retirada para destinatário | ✅ Mesma mensagem (se telefone informado) |
| Após retirada | ✅ Confirmação para destinatário | ✅ Confirmação (se telefone informado) |
| Após retirada | ✅ Aviso para remetente (se informado) | — |

### Comportamento
- Se o WhatsApp falhar, o sistema **não é interrompido** — e-mail ainda é enviado
- `dataNotificacao` é marcado se **qualquer canal** (e-mail ou WhatsApp) for bem-sucedido
- Telefone é normalizado automaticamente (adiciona `55` se não tiver código do país)
- Se `SURI_TOKEN` não estiver configurado, o envio é simplesmente ignorado

### Mensagens enviadas

**Código de retirada (após depósito):**
> Olá, *[Nome]*! Seu pedido está disponível para retirada na Dispetral...
> 1️⃣ Abra o portão com a senha: *[descrição]*
> 2️⃣ No tablet, digite o pin: *[código]*

**Confirmação de retirada:**
> Seu pedido foi retirado com sucesso. ✅
> A Dispetral agradece pela preferência!

## 📧 Configuração de E-mail

O sistema usa Nodemailer com SMTP. Se o SMTP não estiver configurado, o sistema registra no log mas **não bloqueia** o fluxo de depósito.

> **Importante:** A retirada só é liberada após o e-mail ser enviado com sucesso (`dataNotificacao` preenchida). Se o SMTP falhar, o administrador pode reenviar manualmente ou liberar via endpoint de correção de status.

### Tipos de E-mail
1. **Código de Retirada** — enviado ao destinatário após depósito
2. **Confirmação de Retirada** — enviado ao destinatário e ao remetente após retirada

## 🔒 Segurança

- Queries SQL parametrizadas via `prisma.$queryRaw` (sem interpolação de strings)
- Validação de entrada com Zod nos endpoints críticos
- Códigos de 6 dígitos gerados com `Math.random` (não criptográfico — adequado para esse caso de uso)
- Sem exposição de dados sensíveis nas respostas da API

## 🛡️ Regras de Negócio

- Compartimentos `OCUPADO` ou `RESERVADO` não podem ser bloqueados manualmente
- A retirada só é permitida se o e-mail de notificação foi enviado com sucesso
- Apenas entregas `PENDENTE_DEPOSITO` podem ser deletadas
- Entregas `RETIRADO` são mantidas como histórico (não deletáveis)
- `emailRemetente` é opcional — e-mail de confirmação ao remetente é enviado apenas se informado
- Seleção de compartimento é aleatória entre os disponíveis

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| E-mail não enviado | Verificar variáveis SMTP no `.env` |
| Retirada bloqueada ("e-mail não enviado") | Verificar logs do SMTP; reenviar ou usar endpoint de correção |
| Status inconsistente no dashboard | Acessar `POST /api/deliveries/corrigir-status` |
| Frontend não conecta ao backend | Confirmar `NEXT_PUBLIC_API_URL` no `frontend/.env.local` |
| Porta 3000 ocupada | Rodar com `npm run dev -- -p 3001` |

## 📱 Páginas do Frontend

| Rota | Descrição |
|------|-----------|
| `/dashboard` | Visualização em tempo real dos compartimentos por locker |
| `/entregas` | Formulário para gerar nova entrega |
| `/pedidos` | Lista de pedidos ativos e histórico |
| `/analise` | Analytics com filtros por locker e período |
| `/tablet` | Interface quiosque para depósito e retirada |
| `/lockers` | Cadastro e gestão de lockers |
| `/compartments` | Visualização detalhada de caixas reservadas |
| `/deliveriesManage` | Gestão avançada de encomendas com busca |

---

## 📝 Changelog

### v1.2.0 — Junho 2026

#### 🔴 Correções críticas (backend)
- **SQL Injection corrigido:** `analyticsService.js` substituiu `$queryRawUnsafe` com interpolação de string por `$queryRaw` com template literals parametrizados
- **Case sensitivity do Prisma corrigido:** accessors de modelo dentro de transações padronizados para camelCase (`tx.retiradaLog`, `tx.entrega`, `tx.compartimento`) em `deliveriesManageController.js` e `deliveryService.js`
- **`gerarCodigo` corrigido:** função agora aceita e respeita o parâmetro `length` (antes ignorado)
- **`dataNotificacao` corrigido:** campo só é marcado se o e-mail foi enviado com sucesso (antes marcava mesmo em falha)
- **Null pointer em `emailRemetente` corrigido:** e-mail de confirmação ao remetente só é enviado se o campo estiver preenchido
- **Race condition corrigida:** `corrigirStatusInconsistentes` envolve updates em `prisma.$transaction()`

#### 🟡 Melhorias de código (frontend)
- **`lib/utils.js` criado:** funções `getStatusColor`, `getStatusText`, `getStatusIcon`, `getSizeText`, `formatDate` centralizadas — elimina duplicação em 4+ arquivos
- **Modais reescritos como React puro:** `ConfirmModal` e `DetailsModalUltimate` agora usam `ReactDOM.createPortal` em vez de manipulação direta de DOM (`document.createElement`)
- **Console.logs de debug removidos:** `DashboardClient.js` limpado
- **Funções duplicadas removidas:** `PedidosClient.js` tinha `handleDeleteClick` e `confirmDelete` declarados duas vezes
- **`API_BASE` usa variável de ambiente:** `NEXT_PUBLIC_API_URL` em vez de URL hardcoded

#### ✨ Melhorias visuais (frontend)
- **Fonte Inter** carregada via Google Fonts com `antialiased`
- **Header sticky** com efeito de blur/transparência (`backdrop-blur`)
- **NavLinks com link ativo destacado:** rota atual recebe fundo preto via `usePathname`
- **Dashboard:** skeleton loader animado durante carregamento, contadores de status por tipo, cards de caixas com animação de scale no hover
- **Modais:** design mais limpo com `rounded-2xl`, overlay com `backdrop-blur`, botão fechar com SVG

### v1.3.0 — Junho 2026

#### 📱 Integração WhatsApp via Suri (ChatbotMaker)
- Criado `whatsappService.js` com integração à API Suri da Dispetral
- Notificações enviadas em paralelo ao e-mail nos dois eventos:
  - Após depósito: código de retirada + instruções (mesma mensagem do e-mail)
  - Após retirada: confirmação de recebimento
- Telefone normalizado automaticamente (adiciona DDI 55 se necessário)
- Falha do WhatsApp não interrompe o fluxo — sistema continua normalmente
- `dataNotificacao` marcado se qualquer canal (e-mail ou WhatsApp) for bem-sucedido
- Configuração via variáveis de ambiente: `SURI_URL`, `SURI_TOKEN`, `SURI_CHANNEL_ID`
- README atualizado com seção completa de integração WhatsApp

### v1.1.0 — Abril 2026
- Filtro de lockers na aba de pedidos
- Formato de data corrigido no export CSV

### v1.0.0 — Março 2026
- Versão inicial do sistema

---

**Versão:** 1.3.0
**Última atualização:** Junho 2026
**Desenvolvido por:** Murilo Carias
