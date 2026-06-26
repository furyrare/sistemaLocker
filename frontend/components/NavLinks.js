'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard',        label: 'Dashboard' },
  { href: '/entregas',         label: 'Entregas' },
  { href: '/pedidos',          label: 'Pedidos' },
  { href: '/analise',          label: 'Análise' },
  { href: '/tablet',           label: 'Tablet' },
  { href: '/lockers',          label: 'Lockers' },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${active
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }
            `}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
