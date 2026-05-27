import { Link } from 'react-router-dom';

const links = [
  { to: '/catalog', label: 'Explorar', key: 'catalog' },
  { to: '/dashboard', label: 'Dashboard', key: 'dashboard' },
  { to: '/offers', label: 'Ofertas', key: 'offers' },
  { to: '/orders', label: 'Pedidos', key: 'orders' },
  { to: '/payments', label: 'Pagos', key: 'payments' },
  { to: '/messages', label: 'Mensajes', key: 'messages' },
];

export default function AppNav({ active }: { active?: string }) {
  return (
    <nav className="hidden md:flex gap-4 ml-8">
      {links.map(l => (
        <Link
          key={l.key}
          to={l.to}
          className={`hover:text-white/90 transition ${active === l.key ? 'font-medium' : 'hover:text-white/80'}`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
