import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Smart Locker',
  description: 'Gerenciamento de lockers inteligentes'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen">
          <header className="border-b bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
              <div className="font-semibold tracking-tight">Smart Locker</div>
              <nav className="flex gap-4">
                <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">Dashboard</Link>
                <Link href="/entregas" className="text-slate-600 hover:text-slate-900">Entregas</Link>
                <Link href="/pedidos" className="text-slate-600 hover:text-slate-900">Pedidos</Link>
                <Link href="/analise" className="text-slate-600 hover:text-slate-900">Analise</Link>
                <Link href="/tablet" className="text-slate-600 hover:text-slate-900">Tablet</Link>
                <Link href="/lockers" className="text-slate-600 hover:text-slate-900">Gerenciar Lockers</Link>
              </nav>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
