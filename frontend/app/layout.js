import './globals.css';
import Link from 'next/link';
import Image from 'next/image';
import NavLinks from '../components/NavLinks';

export const metadata = {
  title: 'Smart Locker',
  description: 'Gerenciamento de lockers inteligentes'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 h-14">
              <Link href="/dashboard" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Smart Locker"
                  width={120}
                  height={40}
                  className="h-8 w-auto object-contain"
                  priority
                />
              </Link>
              <NavLinks />
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
