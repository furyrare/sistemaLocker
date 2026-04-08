# 📚 Smart Locker - Frontend Documentation

## 🎯 **Overview**

Aplicação web frontend para gerenciamento de lockers inteligentes construída com React, Next.js e Tailwind CSS.

### **Tech Stack**
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS
- **State Management:** React Hooks
- **HTTP Client:** Fetch API
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **Forms:** React DatePicker

---

## 🏗️ **Architecture**

### **Project Structure**
```
frontend/
├── app/
│   ├── dashboard/        # Dashboard principal
│   ├── entregas/         # Gestão de entregas
│   ├── pedidos/          # Gerenciamento de pedidos
│   ├── analise/          # Análise e relatórios
│   ├── tablet/           # Interface tablet
│   ├── lockers/          # Gestão de lockers
│   ├── pickup/           # Retirada de itens
│   ├── deposit/          # Depósito de itens
│   ├── layout.js         # Layout principal
│   └── page.js           # Home (redirect)
├── components/           # Componentes reutilizáveis
│   ├── api.js            # Cliente HTTP
│   ├── modals/           # Modais reutilizáveis
│   └── ui/               # Componentes UI
├── public/               # Arquivos estáticos
├── tailwind.config.js    # Configuração Tailwind
└── package.json          # Dependências
```

---

## 🎨 **UI Components**

### **Layout Principal**
```javascript
// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen">
          <header className="border-b bg-white">
            <nav className="flex gap-4">
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/entregas">Entregas</Link>
              <Link href="/pedidos">Pedidos</Link>
              <Link href="/analise">Analise</Link>
              <Link href="/tablet">Tablet</Link>
              <Link href="/lockers">Gerenciar Lockers</Link>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
```

### **Dashboard Client**
```javascript
// app/dashboard/DashboardClient.js
export default function DashboardClient() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {
    try {
      const response = await apiGet('/dashboard');
      setData(response);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SummaryCard 
        title="Disponíveis" 
        value={data?.available} 
        icon="📦" 
        color="blue" 
      />
      {/* Cards adicionais */}
    </div>
  );
}
```

---

## 📱 **Pages**

### **1. Dashboard**
- **Path:** `/dashboard`
- **Component:** `DashboardClient`
- **Features:**
  - Estatísticas em tempo real
  - Cards de status
  - Gráficos de ocupação

### **2. Entregas**
- **Path:** `/entregas`
- **Component:** `DeliveriesClient`
- **Features:**
  - Formulário de criação
  - Lista de entregas
  - Modal de detalhes

### **3. Pedidos**
- **Path:** `/pedidos`
- **Component:** `PedidosClient`
- **Features:**
  - Lista de pedidos
  - Filtros e busca
  - Cancelamento
  - Modal de detalhes

### **4. Análise**
- **Path:** `/analise`
- **Component:** `AnalyticsDashboard`
- **Features:**
  - Gráficos analíticos
  - Filtros por data
  - Exportação CSV

### **5. Tablet**
- **Path:** `/tablet`
- **Component:** `KioskClient`
- **Features:**
  - Interface simplificada
  - Teclado numérico
  - Processamento rápido

### **6. Lockers**
- **Path:** `/lockers`
- **Component:** `LockersManageClient`
- **Features:**
  - CRUD de lockers
  - Status management
  - Visualização de compartimentos

---

## 🧩 **Reusable Components**

### **API Client**
```javascript
// components/api.js
export const API_BASE = 'http://localhost:4000/api';

export async function apiGet(path) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { cache: 'no-store' });
  
  if (!res.ok) {
    const data = await safeJson(res);
    throw new Error(data?.error || `Falha na requisição: ${res.status}`);
  }
  
  return res.json();
}

export async function apiPost(path, body) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  if (!res.ok) {
    const data = await safeJson(res);
    throw new Error(data?.error || `Falha na requisição: ${res.status}`);
  }
  
  return res.json();
}
```

### **Confirm Modal**
```javascript
// components/ConfirmModal.js
export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-600 mt-2">{message}</p>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
```

### **Details Modal**
```javascript
// components/DetailsModalUltimate.js
export default function DetailsModalUltimate({ 
  delivery, 
  isOpen, 
  onClose 
}) {
  if (!isOpen || !delivery) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">Detalhes do Pedido</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Nome</label>
              <p className="font-medium">{delivery.recipientName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium">{delivery.recipientEmail}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Código Depósito</label>
              <p className="font-mono font-bold text-blue-600">{delivery.depositCode}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Código Retirada</label>
              <p className="font-mono font-bold text-green-600">{delivery.pickupCode}</p>
            </div>
          </div>
          
          {/* Informações de locker e compartimento */}
          {/* Status e datas */}
        </div>
      </div>
    </div>
  );
}
```

---

## 🎨 **Styling System**

### **Tailwind Configuration**
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}
```

### **Design Tokens**
```css
/* Cores do Sistema */
:root {
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  
  --success-500: #10b981;
  --warning-500: #f59e0b;
  --error-500: #ef4444;
  
  --gray-50: #f9fafb;
  --gray-500: #6b7280;
  --gray-900: #111827;
}
```

### **Component Patterns**
```javascript
// Card Pattern
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

// Button Patterns
const Button = ({ variant = "primary", children, ...props }) => {
  const baseClasses = "px-4 py-2 rounded font-medium transition-colors";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };
  
  return (
    <button className={`${baseClasses} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
};
```

---

## 🔄 **State Management**

### **React Hooks Pattern**
```javascript
// Estado local com useEffect
function useApiData(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await apiGet(endpoint);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [endpoint]);
  
  return { data, loading, error };
}

// Uso no componente
function Dashboard() {
  const { data: stats, loading, error } = useApiData('/dashboard');
  
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  
  return <DashboardContent data={stats} />;
}
```

### **Modal Management**
```javascript
// Gerenciamento de múltiplos modais
function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);
  
  const open = (modalData) => {
    setData(modalData);
    setIsOpen(true);
  };
  
  const close = () => {
    setIsOpen(false);
    setData(null);
  };
  
  return { isOpen, data, open, close };
}
```

---

## 📱 **Responsive Design**

### **Breakpoints**
```javascript
// Tailwind breakpoints
sm: 640px   // Tablets
md: 768px   // Small desktops
lg: 1024px  // Desktops
xl: 1280px  // Large desktops
```

### **Grid System**
```javascript
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Cards */}
</div>

// Responsive layout
<div className="flex flex-col lg:flex-row gap-6">
  <div className="flex-1">
    {/* Main content */}
  </div>
  <div className="w-full lg:w-80">
    {/* Sidebar */}
  </div>
</div>
```

---

## 🚀 **Performance**

### **Code Splitting**
```javascript
// Lazy loading de componentes
const AnalyticsDashboard = dynamic(() => import('../components/AnalyticsDashboard'), {
  loading: () => <div>Carregando...</div>
});

// Uso em página
export default function AnalisePage() {
  return (
    <div>
      <AnalyticsDashboard />
    </div>
  );
}
```

### **Caching Strategy**
```javascript
// API caching com Next.js
export async function getServerSideProps() {
  const data = await fetch('http://localhost:4000/api/dashboard', {
    cache: 'no-store' // Sem cache para dados em tempo real
  });
  
  return {
    props: { data: await data.json() }
  };
}
```

---

## 🔒 **Security**

### **Environment Variables**
```javascript
// .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=Smart Locker
```

### **Input Validation**
```javascript
// Client-side validation
function validateDeliveryForm(data) {
  const errors = {};
  
  if (!data.recipientName || data.recipientName.length < 3) {
    errors.recipientName = 'Nome é obrigatório (mínimo 3 caracteres)';
  }
  
  if (!data.recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.recipientEmail)) {
    errors.recipientEmail = 'Email inválido';
  }
  
  return Object.keys(errors).length === 0 ? null : errors;
}
```

---

## 🧪 **Testing**

### **Component Testing**
```javascript
// Exemplo de teste com Jest
import { render, screen } from '@testing-library/react';
import DashboardClient from '../DashboardClient';

test('renders dashboard with stats', async () => {
  render(<DashboardClient />);
  
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
  expect(screen.getByText('Disponíveis')).toBeInTheDocument();
});
```

### **Manual Testing Checklist**
- [ ] Dashboard carrega estatísticas
- [ ] Formulário de entrega funciona
- [ ] Modais abrem e fecham corretamente
- [ ] Responsividade em diferentes tamanhos
- [ ] Navegação entre páginas
- [ ] Filtros e busca funcionam

---

## 🚀 **Setup & Installation**

### **Prerequisites**
- Node.js 18+
- NPM ou Yarn

### **Installation**
```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local

# 3. Iniciar servidor de desenvolvimento
npm run dev

# 4. Build para produção
npm run build

# 5. Iniciar servidor de produção
npm start
```

### **Environment Variables**
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=Smart Locker
```

---

## 📊 **Analytics & Data Visualization**

### **Charts Integration**
```javascript
// Exemplo de gráfico com Chart.js
import { Chart } from 'react-chartjs-2';

function DeliveryChart({ data }) {
  const chartData = {
    labels: ['Aguardando', 'Prontas', 'Retiradas'],
    datasets: [{
      label: 'Entregas',
      data: [
        data.pending || 0,
        data.ready || 0,
        data.pickedUp || 0
      ],
      backgroundColor: ['#f59e0b', '#3b82f6', '#10b981']
    }]
  };
  
  return (
    <div className="bg-white p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Status das Entregas</h3>
      <Chart type="doughnut" data={chartData} />
    </div>
  );
}
```

---

## 📱 **PWA Features**

### **Manifest Configuration**
```json
// public/manifest.json
{
  "name": "Smart Locker",
  "short_name": "Locker",
  "description": "Gerenciamento de lockers inteligentes",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6"
}
```

### **Service Worker**
```javascript
// public/sw.js
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/',
        '/dashboard',
        '/static/js/bundle.js'
      ]);
    })
  );
});
```

---

## 🔧 **Development Tools**

### **ESLint Configuration**
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

### **Prettier Configuration**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **API Connection Error**
```javascript
// Verificar API_BASE em components/api.js
console.log('API Base:', process.env.NEXT_PUBLIC_API_URL);
```

#### **Build Issues**
```bash
# Limpar cache
rm -rf .next
npm run build

# Verificar dependências
npm audit fix
```

#### **Styling Issues**
```bash
# Verificar Tailwind
npx tailwindcss --help

# Limpar cache CSS
rm -rf .next/static/css
```

### **Debug Mode**
```javascript
// Debug component
function DebugComponent({ data }) {
  console.log('Debug data:', data);
  return <Component data={data} />;
}
```

---

## 📝 **Changelog**

### **v1.0.0 - Initial Release**
- ✅ Sistema básico de dashboard
- ✅ Gestão de entregas
- ✅ Interface de pedidos
- ✅ Análises e relatórios

### **v1.1.0 - Enhanced Features**
- ✅ Interface tablet otimizada
- ✅ Modais melhorados
- ✅ Performance otimizada
- ✅ Design responsivo

### **v1.2.0 - Latest**
- ✅ Limpeza de código
- ✅ Componentes reutilizáveis
- ✅ Documentação completa
- ✅ PWA features

---

## 🤝 **Component Reference**

### **Button Variants**
```javascript
<Button variant="primary">Ação Principal</Button>
<Button variant="secondary">Ação Secundária</Button>
<Button variant="danger">Excluir</Button>
```

### **Modal Usage**
```javascript
const { isOpen, open, close } = useModal();

<DetailsModal 
  isOpen={isOpen}
  delivery={selectedDelivery}
  onClose={close}
/>
```

### **API Integration**
```javascript
const { data, loading, error } = useApiData('/dashboard');

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

---

**📚 Documentação completa do frontend Smart Locker v1.2.0**
