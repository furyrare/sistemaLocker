# 📚 Smart Locker - Backend Documentation

## 🎯 **Overview**

Sistema backend para gerenciamento de lockers inteligentes construído com Node.js, Express e PostgreSQL.

### **Tech Stack**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Email:** Nodemailer
- **Validation:** Zod
- **Authentication:** bcryptjs

---

## 🏗️ **Architecture**

### **Project Structure**
```
backend/
├── src/
│   ├── controllers/     # Lógica de negócio
│   ├── routes/         # Definição de rotas
│   ├── middleware/     # Middlewares personalizados
│   ├── services/       # Serviços reutilizáveis
│   └── utils/          # Utilitários
├── prisma/
│   ├── schema.prisma   # Modelo de dados
│   └── seed.js         # Dados iniciais
├── templates/          # Templates de email
├── .env               # Variáveis de ambiente
└── server.js          # Ponto de entrada
```

---

## 🗄️ **Database Schema**

### **Models Principais**

#### **Locker**
```prisma
model Locker {
  id          String   @id @default(cuid())
  name        String
  location    String?
  description String?
  status      String   @default("ACTIVE")
  compartments Compartment[]
  deliveries   Delivery[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### **Compartment**
```prisma
model Compartment {
  id          String   @id @default(cuid())
  number      String
  size        String
  status      String   @default("AVAILABLE")
  lockerId    String
  locker      Locker    @relation(fields: [lockerId], references: [id])
  delivery    Delivery?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### **Delivery**
```prisma
model Delivery {
  id              String   @id @default(cuid())
  orderNumber     String   @unique
  recipientName   String
  recipientEmail  String
  recipientPhone  String?
  status          String   @default("PENDING_DEPOSIT")
  depositCode     String?
  pickupCode      String?
  lockerId        String
  locker          Locker    @relation(fields: [lockerId], references: [id])
  compartmentId   String?
  compartment     Compartment? @relation(fields: [compartmentId], references: [id])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### **Status Values**
- **Delivery:** `PENDING_DEPOSIT`, `READY_FOR_PICKUP`, `PICKED_UP`, `CANCELED`
- **Compartment:** `AVAILABLE`, `RESERVED`, `OCCUPIED`, `BLOCKED`
- **Locker:** `ACTIVE`, `INACTIVE`, `MAINTENANCE`

---

## 🔌 **API Endpoints**

### **Dashboard**
- `GET /api/dashboard` - Estatísticas gerais

### **Lockers**
- `GET /api/lockers` - Listar todos os lockers
- `POST /api/lockers` - Criar novo locker
- `PUT /api/lockers/:id` - Atualizar locker
- `DELETE /api/lockers/:id` - Remover locker

### **Compartments**
- `GET /api/compartment` - Listar compartimentos
- `GET /api/compartment/lockers/:lockerId/compartments` - Compartimentos por locker
- `POST /api/compartment/toggle-status` - Bloquear/Desbloquear compartimento

### **Deliveries**
- `GET /api/deliveries` - Listar entregas
- `POST /api/deliveries` - Criar nova entrega
- `GET /api/deliveries-list` - Listar entregas gerenciáveis
- `POST /api/deliveries-manage/:id/cancel` - Cancelar entrega
- `DELETE /api/deliveries-manage/:id` - Remover entrega

### **Pickup**
- `POST /api/pickup` - Processar retirada

### **Analytics**
- `GET /api/analytics` - Dados analíticos
- `GET /api/reports/csv` - Exportar relatório CSV

---

## 🧩 **Controllers**

### **Dashboard Controller**
```javascript
// Estatísticas do sistema
async function getDashboardStats(req, res) {
  const stats = await prisma.delivery.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  
  // Calcular estatísticas de compartimentos
  const compartments = await prisma.compartment.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  
  res.json({
    deliveries: stats,
    compartments: compartments
  });
}
```

### **Delivery Controller**
```javascript
// Criar nova entrega
async function createDelivery(req, res) {
  const { recipientName, recipientEmail, lockerId } = req.body;
  
  // Gerar códigos
  const depositCode = generateDepositCode();
  const pickupCode = generatePickupCode();
  
  // Encontrar compartimento disponível
  const compartment = await findAvailableCompartment(lockerId);
  
  // Criar entrega
  const delivery = await prisma.delivery.create({
    data: {
      recipientName,
      recipientEmail,
      lockerId,
      compartmentId: compartment.id,
      depositCode,
      pickupCode,
      orderNumber: generateOrderNumber()
    }
  });
  
  // Enviar email
  await sendDepositEmail(delivery);
  
  res.json(delivery);
}
```

### **Pickup Controller**
```javascript
// Processar retirada
async function processPickup(req, res) {
  const { pickupCode } = req.body;
  
  // Encontrar entrega
  const delivery = await prisma.delivery.findFirst({
    where: { pickupCode }
  });
  
  if (!delivery) {
    return res.status(404).json({ error: 'Código inválido' });
  }
  
  // Atualizar status
  await prisma.delivery.update({
    where: { id: delivery.id },
    data: { status: 'PICKED_UP' }
  });
  
  // Liberar compartimento
  await prisma.compartment.update({
    where: { id: delivery.compartmentId },
    data: { status: 'AVAILABLE' }
  });
  
  res.json({ success: true });
}
```

---

## 🛣️ **Routes**

### **Structure**
```javascript
// dashboardRoutes.js
router.get('/', dashboardController.getDashboardStats);

// deliveriesRoutes.js
router.get('/', deliveriesController.getDeliveries);
router.post('/', deliveriesController.createDelivery);

// pickupRoutes.js
router.post('/', pickupController.processPickup);
```

### **Middleware**
```javascript
// errorHandler.js
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  res.status(500).json({ error: 'Erro interno do servidor' });
}
```

---

## 📧 **Email System**

### **Templates**
- **Depósito:** Notificação com código de depósito
- **Retirada:** Confirmação com código de retirada
- **Cancelamento:** Notificação de cancelamento

### **Configuration**
```javascript
// emailService.js
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
```

---

## 🔐 **Security**

### **Password Hashing**
```javascript
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}
```

### **Input Validation**
```javascript
// Zod schemas
const deliverySchema = z.object({
  recipientName: z.string().min(3),
  recipientEmail: z.string().email(),
  lockerId: z.string().min(1)
});
```

### **CORS Configuration**
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.10.75:3000'],
  credentials: true
}));
```

---

## 🚀 **Setup & Installation**

### **Prerequisites**
- Node.js 18+
- PostgreSQL 13+
- NPM ou Yarn

### **Installation**
```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Rodar migrações
npx prisma migrate dev

# 4. Gerar Prisma Client
npx prisma generate

# 5. Iniciar servidor
npm run dev
```

### **Environment Variables**
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smart_locker"

# Server
PORT=4000
NODE_ENV=development

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha
```

---

## 🧪 **Testing**

### **API Testing**
```bash
# Testar health endpoint
curl http://localhost:4000/health

# Testar dashboard
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

---

## 📊 **Analytics & Reports**

### **Analytics Controller**
```javascript
async function getAnalytics(req, res) {
  const { startDate, endDate, lockerId } = req.query;
  
  const deliveries = await prisma.delivery.findMany({
    where: {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      },
      ...(lockerId && { lockerId })
    }
  });
  
  // Processar dados
  const analytics = processDeliveryData(deliveries);
  
  res.json(analytics);
}
```

### **CSV Export**
```javascript
async function exportCSV(req, res) {
  const deliveries = await prisma.delivery.findMany({
    include: { locker: true, compartment: true }
  });
  
  const csv = convertToCSV(deliveries);
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=deliveries.csv');
  res.send(csv);
}
```

---

## 🔧 **Maintenance**

### **Database Commands**
```bash
# Reset database
npx prisma migrate reset

# View database
npx prisma studio

# Deploy migrations
npx prisma migrate deploy
```

### **Logs**
```javascript
// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
```

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Database Connection**
```bash
Error: Can't reach database server
Solution: Verificar DATABASE_URL no .env
```

#### **Port Already in Use**
```bash
Error: listen EADDRINUSE :::4000
Solution: Mudar porta ou matar processo
```

#### **Prisma Client Not Generated**
```bash
Error: Prisma Client is not configured
Solution: npx prisma generate
```

### **Debug Mode**
```bash
# Debug mode
DEBUG=* npm run dev

# Verbose logs
npm run dev -- --verbose
```

---

## 📝 **Changelog**

### **v1.0.0 - Initial Release**
- ✅ Sistema básico de lockers
- ✅ CRUD de entregas
- ✅ Sistema de pickup
- ✅ Emails automáticos
- ✅ Dashboard analytics

### **v1.1.0 - Enhanced Features**
- ✅ Cancelamento de entregas
- ✅ Bloqueio de compartimentos
- ✅ Exportação CSV
- ✅ Melhorias de UI

---

## 🤝 **API Reference**

### **Response Format**
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

### **Error Format**
```json
{
  "success": false,
  "data": null,
  "error": "Error message"
}
```

### **Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

**📚 Documentação completa do backend Smart Locker v1.1.0**
