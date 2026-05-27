import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { offerApi } from '../services/api';
import AppNav from '../components/AppNav';

interface Offer {
  id: string;
  listingId: string;
  quantity: number;
  unitPrice: number;
  status: string;
  message?: string;
  createdAt: string;
  listing: { title: string; unit?: string; category?: { name: string }; organization?: { name: string; country: string } };
  buyer?: { name: string; country: string };
}

type Tab = 'received' | 'sent';

export default function Offers() {
  const [tab, setTab] = useState<Tab>('received');
  const [received, setReceived] = useState<Offer[]>([]);
  const [sent, setSent] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const [sellerRes, buyerRes] = await Promise.all([
        offerApi.getForSeller(),
        offerApi.getForBuyer(),
      ]);
      setReceived(sellerRes.data);
      setSent(buyerRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offerId: string) => {
    try {
      await offerApi.accept(offerId);
      alert('Oferta aceptada. Se creó el pedido y ya puedes chatear en Mensajes.');
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

  const offers = tab === 'received' ? received : sent;
  const totalValue = offers.reduce((sum, o) => sum + (Number(o.quantity) * Number(o.unitPrice)), 0);
  const pendingReceived = received.filter(o => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <header className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-light">🌸 SubPro</Link>
            <AppNav active="offers" />
          </div>
          <Link to="/dashboard" className="text-sm opacity-80 hover:opacity-100">← Dashboard</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Ofertas</h1>
            <p className="text-gray-500 text-sm mt-1">
              Recibidas en tus productos · Enviadas a otros vendedores
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total en pestaña actual</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent">
              ${totalValue.toLocaleString('es-CO')}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTab('received')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              tab === 'received'
                ? 'bg-gradient-to-r from-rose-500 to-purple-500 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-rose-200'
            }`}
          >
            Recibidas {pendingReceived > 0 && `(${pendingReceived})`}
          </button>
          <button
            type="button"
            onClick={() => setTab('sent')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              tab === 'sent'
                ? 'bg-gradient-to-r from-rose-500 to-purple-500 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-rose-200'
            }`}
          >
            Enviadas ({sent.length})
          </button>
        </div>

        {tab === 'received' && (
          <p className="text-sm text-gray-500 mb-4 bg-white/80 border border-rose-100 rounded-lg px-4 py-3">
            Las ofertas nuevas aparecen aquí. <strong>Mensajes</strong> se habilita cuando aceptas una oferta (se crea el pedido).
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
          </div>
        ) : offers.length === 0 ? (
          <div className="card text-center py-16">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {tab === 'received' ? 'No has recibido ofertas' : 'No has enviado ofertas'}
            </h3>
            <p className="text-gray-500 mb-4">
              {tab === 'received'
                ? 'Cuando alguien oferte por tus productos activos, las verás aquí.'
                : 'Explora el catálogo y haz una oferta desde el detalle del producto.'}
            </p>
            <Link
              to="/catalog"
              className="inline-block bg-gradient-to-r from-rose-500 to-purple-500 text-white px-6 py-2 rounded-full font-medium"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map(offer => (
              <div key={offer.id} className="card p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800">{offer.listing.title}</h3>
                      {getStatusBadge(offer.status)}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{offer.listing.category?.name}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        <span className="font-medium">{offer.quantity}</span>{' '}
                        {offer.listing.unit || 'unidades'}
                      </span>
                      <span className="text-gray-600">
                        <span className="font-medium">${Number(offer.unitPrice).toLocaleString('es-CO')}</span>/unidad
                      </span>
                      <span className="font-bold text-rose-600">
                        Total: ${(Number(offer.quantity) * Number(offer.unitPrice)).toLocaleString('es-CO')}
                      </span>
                    </div>
                    {offer.message && (
                      <p className="mt-2 text-sm text-gray-600 bg-rose-50/50 p-2 rounded border border-rose-100">
                        "{offer.message}"
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {tab === 'received' && offer.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAccept(offer.id)}
                          className="px-4 py-2 bg-gradient-to-r from-rose-500 to-purple-500 text-white rounded-full hover:from-rose-600 hover:to-purple-600 transition font-medium text-sm"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => handleReject(offer.id)}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-full hover:bg-red-50 transition text-sm"
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                    {tab === 'sent' && offer.status === 'accepted' && (
                      <Link
                        to="/messages"
                        className="px-4 py-2 bg-gradient-to-r from-rose-500 to-purple-500 text-white rounded-full text-sm font-medium"
                      >
                        Ir a mensajes
                      </Link>
                    )}
                    <Link
                      to={`/catalog/${offer.listingId}`}
                      className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition text-sm"
                    >
                      Ver producto
                    </Link>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                  {tab === 'received' ? (
                    <>Oferta de: <strong className="text-gray-600">{offer.buyer?.name}</strong> ({offer.buyer?.country})</>
                  ) : (
                    <>Vendedor: <strong className="text-gray-600">{offer.listing.organization?.name}</strong> ({offer.listing.organization?.country})</>
                  )}
                  {' • '}{new Date(offer.createdAt).toLocaleDateString('es-CO')}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
