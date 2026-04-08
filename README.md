# Sistema Smart Locker - Dispetral

## 📋 Visão Geral

Sistema completo de gerenciamento de lockers inteligentes para armazenamento e retirada de encomendas. Desenvolvido com Node.js/Express no backend e React/Next.js no frontend.

## 🏗️ Arquitetura

### Backend (Node.js + Express + Prisma + SQL Server)
- **Porta:** 4000
- **Banco:** Microsoft SQL Server
- **ORM:** Prisma
- **Autenticação:** JWT (implementação futura)

### Frontend (React + Next.js)
- **Framework:** Next.js 13+
- **Estilização:** Tailwind CSS
- **Estado:** React Hooks
- **API:** Fetch nativo

## 📁 Estrutura de Arquivos

```
SistemaLocker/
├── backend/
│   ├── server.js                    # Servidor principal
│   ├── package.json                 # Dependências
│   ├── .env                         # Variáveis de ambiente
│   ├── src/
│   │   ├── controllers/             # Controladores da API
│   │   │   ├── compartmentController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── deliveryController.js
│   │   │   ├── deliveriesListController.js
│   │   │   ├── deliveriesManageController.js
│   │   │   ├── lockersManageController.js
│   │   │   ├── pickupController.js
│   │   │   └── reportController.js
│   │   ├── services/               # Lógica de negócio
│   │   │   ├── deliveryService.js
│   │   │   ├── emailService.js
│   │   │   ├── reportService.js
│   │   │   └── analyticsService.js
│   │   ├── routes/                  # Rotas da API
│   │   │   ├── compartmentRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── deliveryRoutes.js
│   │   │   ├── deliveriesListRoutes.js
│   │   │   ├── deliveriesManageRoutes.js
│   │   │   ├── lockersRoutes.js
│   │   │   ├── lockersManageRoutes.js
│   │   │   ├── pickupRoutes.js
│   │   │   └── reportRoutes.js
│   │   ├── db/
│   │   │   └── prisma.js            # Conexão com banco
│   │   └── utils/
│   │       └── gerarCodigo.js      # Utilitários
│   ├── prisma/
│   │   ├── schema.prisma            # Schema do banco
│   │   └── migrations/              # Migrações
│   └── templates/
│       └── emailTemplate.js         # Templates de e-mail
└── frontend/
    ├── app/
    │   ├── dashboard/
    │   │   └── DashboardClient.js   # Dashboard principal
    │   ├── pedidos/
    │   │   └── PedidosClient.js     # Gestão de pedidos
    │   ├── deliveriesManage/
    │   │   └── DeliveriesManageClient.js
    │   └── components/
    │       └── AnalyticsDashboard.js
    ├── components/                  # Componentes reutilizáveis
    └── pages/                       # Páginas Next.js
```

## 🛣️ API Routes

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/logout` - Logout de usuário

### Lockers
- `GET /api/lockers` - Listar todos os lockers
- `POST /api/lockers` - Criar novo locker
- `PUT /api/lockers/:id` - Atualizar locker
- `DELETE /api/lockers/:id` - Deletar locker

### Compartimentos (Caixas)
- `GET /api/compartment` - Listar compartimentos
- `POST /api/compartment/toggle-status` - Bloquear/Desbloquear compartimento
- `GET /api/compartment/:lockerId` - Listar por locker

### Entregas
- `GET /api/deliveries` - Listar entregas
- `POST /api/deliveries/generate-code` - Gerar código de depósito
- `POST /api/deliveries/deposit` - Depositar encomenda
- `POST /api/deliveries/corrigir-status` - Corrigir status inconsistentes
- `DELETE /api/deliveries/:id` - Deletar entrega

### Lista de Entregas
- `GET /api/deliveries-list` - Listar todas as entregas com detalhes

### Gestão de Entregas
- `GET /api/deliveries-manage` - Listar entregas para gestão
- `DELETE /api/deliveries-manage/:id` - Deletar entrega

### Retirada (Pickup)
- `POST /api/pickup` - Retirar encomenda (tablet)
- `POST /api/pickup/verify` - Verificar código de retirada
- `POST /api/pickup/complete` - Completar retirada

### Dashboard
- `GET /api/dashboard/grid/:lockerId` - Grid de compartimentos
- `GET /api/dashboard/stats/:lockerId` - Estatísticas do locker

### Relatórios
- `GET /api/report/deliveries` - Relatório de entregas
- `GET /api/report/analytics` - Analytics do sistema

### Gestão de Lockers
- `GET /api/lockers-manage` - Listar lockers para gestão
- `POST /api/lockers-manage` - Criar locker
- `PUT /api/lockers-manage/:id` - Atualizar locker
- `DELETE /api/lockers-manage/:id` - Deletar locker

## 📊 Status do Sistema

### Status das Entregas
- `PENDENTE_DEPOSITO` - Aguardando depósito
- `PRONTO_PARA_RETIRADA` - Pronta para retirada
- `RETIRADO` - Item retirado

### Status dos Compartimentos
- `DISPONIVEL` - Disponível para uso
- `BLOQUEADO` - Bloqueado manualmente
- `OCUPADO` - Ocupado com encomenda pronta
- `RESERVADO` - Reservado para depósito

## 📧 Sistema de E-mail

### Configuração SMTP (Gmail)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
EMAIL_FROM=seu-email@gmail.com
```

### Tipos de E-mail
1. **Código de Retirada** - Enviado após depósito da encomenda
2. **Confirmação de Retirada** - Enviado após retirada do item

### Templates
- Localização: `backend/templates/emailTemplate.js`
- Suporte para HTML e texto puro
- Variáveis dinâmicas personalizadas

## 🔧 Configuração do Ambiente

### Backend
```bash
# Instalar dependências
npm install

# Gerar cliente Prisma
npx prisma generate

# Rodar servidor em desenvolvimento
npm run dev

# Rodar em produção
npm start
```

### Frontend
```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Banco de Dados
```bash
# Criar migração
npx prisma migrate dev --name nome-migracao

# Visualizar banco
npx prisma studio
```

## 🔄 Fluxo do Sistema

### 1. Criação de Entrega
1. Usuário solicita código de depósito
2. Sistema gera códigos únicos
3. Envia e-mail com código de retirada
4. Entrega fica com status `PENDENTE_DEPOSITO`

### 2. Depósito
1. Entregador usa código de depósito
2. Sistema valida e atualiza status
3. Compartimento fica `OCUPADO`
4. Entrega fica `PRONTO_PARA_RETIRADA`

### 3. Retirada
1. Usuário insere código de retirada no tablet
2. Sistema valida e processa retirada
3. Compartimento volta para `DISPONIVEL`
4. Entrega fica `RETIRADO`
5. Envia e-mail de confirmação

## 🛡️ Validações e Regras

### Regras de Negócio
- Compartimentos `BLOQUEADOS` só podem ser desbloqueados manualmente
- Entregas `RETIRADO` não impedem uso do compartimento
- Sistema ignora entregas `RETIRADO` para disponibilidade
- Apenas entregas ativas bloqueiam operações

### Validações Técnicas
- Códigos únicos de 6 dígitos
- Validação de formato de e-mail
- Verificação de disponibilidade de compartimentos
- Tratamento de erros com logs detalhados

## 📱 Funcionalidades Principais

### Dashboard
- Visualização em tempo real dos compartimentos
- Status baseado em entregas ativas
- Operações de bloqueio/desbloqueio
- Estatísticas e analytics

### Gestão de Entregas
- Listagem completa com filtros
- Busca por código, status, data
- Operações de exclusão (regras aplicadas)
- Histórico completo

### Sistema de Retirada
- Interface tablet-friendly
- Validação em tempo real
- Feedback visual imediato
- Logs de operações

## 🔮 Próximos Melhorias

### Em Desenvolvimento
- [ ] Sistema de autenticação JWT
- [ ] Interface mobile app
- [ ] Notificações push
- [ ] Integração com APIs externas

### Futuras
- [ ] Multi-locker support
- [ ] Relatórios avançados
- [ ] Sistema de assinaturas
- [ ] Analytics em tempo real

## 🐛 Troubleshooting

### Problemas Comuns
1. **E-mail não enviado** - Verificar configuração SMTP
2. **Compartimento bloqueado** - Verificar entregas ativas
3. **Status inconsistente** - Usar endpoint de correção
4. **Cache do frontend** - Limpar cache do navegador

### Logs e Debug
- Logs detalhados em todas as operações
- Status de e-mail claramente indicado
- Erros com stack trace completo
- Monitoramento em tempo real

## 📞 Suporte

Para suporte técnico ou dúvidas:
- Verificar logs do sistema
- Consultar documentação da API
- Validar configuração de ambiente

---

**Versão:** 1.0.0  
**Última atualização:** Março 2026  
**Desenvolvido por:** Murilo Carias
# sistemaLocker
# SistemaLocker
