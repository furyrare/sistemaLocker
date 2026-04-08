# 🚀 Smart Locker - Sistema Completo

## 🎯 **Visão Geral**

Sistema completo para gerenciamento de lockers inteligentes, permitindo controle total de entregas, retiradas e análise de dados em tempo real.

### **Arquitetura**
- **Frontend:** React + Next.js + Tailwind CSS
- **Backend:** Node.js + Express + PostgreSQL
- **Comunicação:** REST API
- **Deploy:** Docker/Local

---

## 🏗️ **Estrutura do Projeto**

```
SistemaLocker/
├── backend/                 # API e banco de dados
│   ├── src/
│   │   ├── controllers/     # Lógica de negócio
│   │   ├── routes/         # Rotas da API
│   │   ├── services/       # Serviços
│   │   └── middleware/     # Middlewares
│   ├── prisma/            # Schema e migrações
│   ├── templates/         # Templates de email
│   └── docs/              # Documentação backend
├── frontend/              # Aplicação web
│   ├── app/              # Páginas Next.js
│   ├── components/       # Componentes React
│   ├── public/          # Arquivos estáticos
│   └── docs/            # Documentação frontend
└── docs/               # Documentação geral
```

---

## 🚀 **Setup Rápido**

### **1. Pré-requisitos**
- Node.js 18+
- PostgreSQL 13+
- NPM ou Yarn

### **2. Backend Setup**
```bash
cd backend
npm install

# Configurar ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Setup do banco
npx prisma migrate dev
npx prisma generate

# Iniciar servidor
npm run dev
```

### **3. Frontend Setup**
```bash
cd frontend
npm install

# Configurar ambiente
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" > .env.local

# Iniciar servidor
npm run dev
```

### **4. Acessar Sistema**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000/api
- **Database Admin:** npx prisma studio

---

## 🌐 **Funcionalidades Principais**

### **📊 Dashboard**
- Estatísticas em tempo real
- Cards de status (disponíveis, ocupados, bloqueados)
- Gráficos de ocupação
- Indicadores de performance

### **📦 Entregas**
- Criar novas entregas
- Gerar códigos de depósito/retirada
- Enviar emails automáticos
- Status tracking

### **📋 Pedidos**
- Lista completa de pedidos
- Filtros e busca
- Cancelamento de pedidos
- Detalhes completos

### **📈 Análise**
- Relatórios detalhados
- Exportação CSV
- Filtros por data e locker
- Métricas de performance

### **📱 Tablet Interface**
- Interface simplificada
- Teclado numérico
- Processamento rápido
- Modo kiosk

### **🔧 Gestão de Lockers**
- CRUD de lockers
- Status management
- Visualização de compartimentos
- Bloqueio/desbloqueio

---

## 🔌 **API Endpoints**

### **Dashboard**
```http
GET /api/dashboard
# Response: Estatísticas gerais do sistema
```

### **Entregas**
```http
GET    /api/deliveries          # Listar entregas
POST   /api/deliveries          # Criar entrega
GET    /api/deliveries-list     # Lista gerenciável
DELETE /api/deliveries-manage/:id  # Remover entrega
```

### **Pickup**
```http
POST /api/pickup
# Body: { "pickupCode": "123456" }
# Response: Processamento de retirada
```

### **Analytics**
```http
GET /api/analytics?startDate=2024-01-01&endDate=2024-12-31
# Response: Dados analíticos filtrados
```

### **Lockers**
```http
GET    /api/lockers              # Listar lockers
POST   /api/lockers              # Criar locker
PUT    /api/lockers/:id         # Atualizar locker
DELETE /api/lockers/:id         # Remover locker
```

---

## 🗄️ **Database Schema**

### **Models Principais**

#### **Locker**
```sql
CREATE TABLE lockers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Compartment**
```sql
CREATE TABLE compartments (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL,
  size TEXT NOT NULL,
  status TEXT DEFAULT 'AVAILABLE',
  locker_id TEXT REFERENCES lockers(id),
  delivery_id TEXT REFERENCES deliveries(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Delivery**
```sql
CREATE TABLE deliveries (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_phone TEXT,
  status TEXT DEFAULT 'PENDING_DEPOSIT',
  deposit_code TEXT,
  pickup_code TEXT,
  locker_id TEXT REFERENCES lockers(id),
  compartment_id TEXT REFERENCES compartments(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎨 **Frontend Components**

### **Pages Structure**
```
app/
├── dashboard/          # Dashboard principal
├── entregas/          # Gestão de entregas
├── pedidos/           # Gerenciamento de pedidos
├── analise/           # Análise e relatórios
├── tablet/            # Interface tablet
├── lockers/           # Gestão de lockers
├── pickup/            # Retirada de itens
└── deposit/           # Depósito de itens
```

### **Reusable Components**
```
components/
├── api.js                    # Cliente HTTP
├── ConfirmModal.js          # Modal de confirmação
├── DetailsModalUltimate.js  # Modal de detalhes
├── CreateDeliveryModal.js   # Modal de criação
├── AddLockerModal.js        # Modal de lockers
└── AnalyticsDashboard.js    # Dashboard analítico
```

---

## 🔄 **Fluxo de Trabalho**

### **1. Criar Entrega**
1. Usuário preenche formulário em `/entregas`
2. Frontend envia para `POST /api/deliveries`
3. Backend gera códigos e encontra compartimento
4. Envia email com código de depósito
5. Retorna entrega criada

### **2. Processar Depósito**
1. Usuário vai ao tablet `/tablet`
2. Digita código de depósito
3. Frontend envia para `POST /api/deposit`
4. Backend valida e atualiza status
5. Compartimento é aberto

### **3. Processar Retirada**
1. Usuário recebe email com código
2. Vai ao tablet ou `/pickup`
3. Digita código de retirada
4. Frontend envia para `POST /api/pickup`
5. Backend valida e libera compartimento

### **4. Análise e Relatórios**
1. Admin acessa `/analise`
2. Aplica filtros (data, locker)
3. Frontend busca de `GET /api/analytics`
4. Backend processa dados
5. Exibe gráficos e relatórios

---

## 📱 **Deploy**

### **Local Development**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### **Production Deploy**
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

### **Docker Deploy**
```dockerfile
# Dockerfile backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

---

## 🔧 **Configuração**

### **Environment Variables**
```env
# Backend (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/smart_locker"
PORT=4000
NODE_ENV=production

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=Smart Locker
```

### **Database Setup**
```bash
# Criar database
createdb smart_locker

# Rodar migrações
npx prisma migrate dev

# Popular dados iniciais
npx prisma db seed
```

---

## 🧪 **Testing**

### **API Testing**
```bash
# Health check
curl http://localhost:4000/health

# Dashboard stats
curl http://localhost:4000/api/dashboard

# Criar entrega
curl -X POST http://localhost:4000/api/deliveries \
  -H "Content-Type: application/json" \
  -d '{
    "recipientName": "João Silva",
    "recipientEmail": "joao@email.com",
    "lockerId": "locker-id"
  }'
```

### **Frontend Testing**
```bash
# Run tests
npm test

# Build check
npm run build

# Lint check
npm run lint
```

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Database Connection**
```bash
Error: Can't reach database
Solution: Verificar DATABASE_URL no .env
```

#### **Port Conflicts**
```bash
Error: EADDRINUSE :::3000
Solution: Mudar porta ou matar processo
```

#### **API Connection**
```bash
Error: Network request failed
Solution: Verificar se backend está rodando
```

#### **Build Issues**
```bash
Error: Build failed
Solution: Limpar cache .next e rebuild
```

### **Debug Commands**
```bash
# Verificar processos
netstat -ano | findstr :3000
netstat -ano | findstr :4000

# Limpar caches
rm -rf .next
rm -rf node_modules
npm install

# Verificar database
npx prisma studio
```

---

## 📊 **Performance**

### **Backend Optimization**
- Database indexing
- Query optimization
- Response caching
- Connection pooling

### **Frontend Optimization**
- Code splitting
- Image optimization
- Lazy loading
- Bundle size reduction

### **Monitoring**
```javascript
// Performance monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
});
```

---

## 🔒 **Security**

### **Backend Security**
- Input validation com Zod
- SQL injection prevention com Prisma
- CORS configuration
- Rate limiting

### **Frontend Security**
- XSS prevention
- Environment variables protection
- Input sanitization
- HTTPS enforcement

---

## 📝 **Changelog**

### **v1.0.0 - MVP**
- ✅ Sistema básico funcional
- ✅ CRUD de entregas
- ✅ Dashboard principal
- ✅ Interface tablet

### **v1.1.0 - Enhanced**
- ✅ Análises e relatórios
- ✅ Exportação CSV
- ✅ Melhorias de UI/UX
- ✅ Performance otimizada

### **v1.2.0 - Polished**
- ✅ Limpeza de código
- ✅ Documentação completa
- ✅ Componentes reutilizáveis
- ✅ PWA features

---

## 🤝 **Contribuição**

### **Development Workflow**
1. Fork do projeto
2. Criar feature branch
3. Fazer alterações
4. Testar thoroughly
5. Submit PR

### **Code Standards**
- ESLint para JavaScript
- Prettier para formatação
- Conventional Commits
- Test coverage > 80%

---

## 📞 **Suporte**

### **Documentação**
- [Backend Documentation](./01-backend.md)
- [Frontend Documentation](./02-frontend.md)

### **Contato**
- Issues: GitHub Issues
- Email: support@smartlocker.com
- Docs: [Documentation](./)

---

## 🚀 **Roadmap**

### **v1.3.0 - Next Features**
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced analytics
- [ ] Multi-tenant support

### **v2.0.0 - Future**
- [ ] Machine learning predictions
- [ ] IoT integration
- [ ] Advanced security
- [ ] Cloud deployment

---

**📚 Sistema Smart Locker v1.2.0 - Documentação Completa**

*Última atualização: Março 2024*
