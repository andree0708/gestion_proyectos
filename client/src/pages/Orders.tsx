import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../services/api';

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  platformFee: number;
  netAmount: number;
  createdAt: string;
  offer: {
    listing: { title: string; category?: { name: string } };
    buyer: { name: string };
    quantity: number;
    unitPrice: number;
  };
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await orderApi.getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      confirmed: 'bg-blue-100 text-blue-700',
      in_transit: 'bg-purple-100 text-purple-700',
      delivered: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-red-100 text-red-600',
    };
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      in_transit: 'En tránsito',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const totalValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-bold">SubPro Exchange</Link>
            <nav className="hidden md:flex gap-4 ml-8">
              <Link to="/dashboard" className="hover:text-white/80 transition">Dashboard</Link>
              <Link to="/offers" className="hover:text-white/80 transition">Ofertas</Link>
              <Link to="/contracts" className="hover:text-white/80 transition">Contratos</Link>
              <Link to="/orders" className="hover:text-white/80 transition font-medium">Pedidos</Link>
            </nav>
          </div>
          <Link to="/dashboard" className="text-sm opacity-80 hover:opacity-100">
            ← Volver al Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pedidos</h1>
            <p className="text-gray-500">Seguimiento de tus transacciones</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Valor total</p>
            <p className="text-2xl font-bold text-emerald-600">
              ${totalValue.toLocaleString('es-CO')}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="card text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay pedidos</h3>
            <p className="text-gray-500">Los pedidos aparecerán cuando aceptes una oferta</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map(order => (
              <div key={order.id} className="card p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">{order.offer.listing.title}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{order.offer.listing.category?.name}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        <span className="font-medium">{order.offer.quantity}</span> unidades
                      </span>
                      <span className="text-gray-600">
                        <span className="font-medium">${order.offer.unitPrice.toLocaleString('es-CO')}</span>/unidad
                      </span>
                      <span className="font-bold text-emerald-600">
                        Total: ${order.totalAmount.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div className="mt-2 flex gap-4 text-xs text-gray-500">
                      <span>Comisión plataforma: ${order.platformFee.toLocaleString('es-CO')}</span>
                      <span>Neto: ${order.netAmount.toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {order.status === 'confirmed' && (
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                        Marcar en tránsito
                      </button>
                    )}
                    {order.status === 'in_transit' && (
                      <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm">
                        Confirmar entrega
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                  Comprador: {order.offer.buyer.name} • {new Date(order.createdAt).toLocaleDateString('es-CO')}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}