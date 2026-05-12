import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { offerApi } from '../services/api';

interface Offer {
  id: string;
  listingId: string;
  quantity: number;
  unitPrice: number;
  status: string;
  message?: string;
  createdAt: string;
  listing: { title: string; category?: { name: string } };
  buyer: { name: string; country: string };
}

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const { data } = await offerApi.getForBuyer();
      setOffers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offerId: string) => {
    try {
      await offerApi.accept(offerId);
      loadOffers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al aceptar');
    }
  };

  const handleReject = async (offerId: string) => {
    try {
      await offerApi.reject(offerId);
      loadOffers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al rechazar');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      accepted: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-600',
      countered: 'bg-blue-100 text-blue-700',
      countered_by_seller: 'bg-purple-100 text-purple-700',
    };
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      accepted: 'Aceptada',
      rejected: 'Rechazada',
      countered: 'Contraoferta',
      countered_by_seller: 'Contraoferta del vendedor',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const totalValue = offers.reduce((sum, o) => sum + (o.quantity * o.unitPrice), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-bold">SubPro Exchange</Link>
            <nav className="hidden md:flex gap-4 ml-8">
              <Link to="/dashboard" className="hover:text-white/80 transition">Dashboard</Link>
              <Link to="/offers" className="hover:text-white/80 transition font-medium">Ofertas</Link>
              <Link to="/contracts" className="hover:text-white/80 transition">Contratos</Link>
              <Link to="/orders" className="hover:text-white/80 transition">Pedidos</Link>
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
            <h1 className="text-2xl font-bold text-gray-800">Ofertas</h1>
            <p className="text-gray-500">Gestiona las ofertas de tus productos</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total en ofertas</p>
            <p className="text-2xl font-bold text-emerald-600">
              ${totalValue.toLocaleString('es-CO')}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : offers.length === 0 ? (
          <div className="card text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay ofertas</h3>
            <p className="text-gray-500">Las ofertas que recibas aparecerán aquí</p>
            <Link to="/catalog" className="btn-primary mt-4 inline-block">
              Ver Catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map(offer => (
              <div key={offer.id} className="card p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">{offer.listing.title}</h3>
                      {getStatusBadge(offer.status)}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{offer.listing.category?.name}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        <span className="font-medium">{offer.quantity}</span> unidades
                      </span>
                      <span className="text-gray-600">
                        <span className="font-medium">${offer.unitPrice.toLocaleString('es-CO')}</span>/unidad
                      </span>
                      <span className="font-bold text-emerald-600">
                        Total: ${(offer.quantity * offer.unitPrice).toLocaleString('es-CO')}
                      </span>
                    </div>
                    {offer.message && (
                      <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        "{offer.message}"
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {offer.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAccept(offer.id)}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => handleReject(offer.id)}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                    <Link
                      to={`/catalog/${offer.listingId}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Ver producto
                    </Link>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                  Oferta de: {offer.buyer.name} ({offer.buyer.country}) • {new Date(offer.createdAt).toLocaleDateString('es-CO')}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}