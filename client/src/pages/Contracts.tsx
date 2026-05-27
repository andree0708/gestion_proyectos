import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../services/api';

interface Contract {
  id: string;
  orderId: string;
  status: string;
  contentHash: string;
  createdAt: string;
  signatures: Array<{ signerId: string; signerOrgId: string; signature: string; createdAt: string }>;
  order: {
    totalAmount: number;
    netAmount: number;
    status: string;
    offer: { listing: { title: string } };
  };
}

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const { data } = await orderApi.getMyOrders();
      setContracts(data.filter((o: any) => o.contract));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending_signature: 'bg-amber-100 text-amber-700',
      signed: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-red-100 text-red-600',
    };
    const labels: Record<string, string> = {
      pending_signature: 'Pendiente firma',
      signed: 'Firmado',
      cancelled: 'Cancelado',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <header className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-light">🌸 SubPro</Link>
            <nav className="hidden md:flex gap-4 ml-8">
              <Link to="/dashboard" className="hover:text-white/80 transition">Dashboard</Link>
              <Link to="/offers" className="hover:text-white/80 transition">Ofertas</Link>
              <Link to="/contracts" className="hover:text-white/80 transition font-medium">Contratos</Link>
              <Link to="/orders" className="hover:text-white/80 transition">Pedidos</Link>
            </nav>
          </div>
          <Link to="/dashboard" className="text-sm opacity-80 hover:opacity-100">
            ← Volver al Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Contratos Digitales</h1>
          <p className="text-gray-500">Gestiona la firma de tus contratos</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : contracts.length === 0 ? (
          <div className="card text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay contratos</h3>
            <p className="text-gray-500">Los contratos se crean automáticamente al aceptar una oferta</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contracts.map(contract => (
              <div key={contract.id} className="card p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">{contract.order?.offer?.listing?.title}</h3>
                      {getStatusBadge(contract.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Monto total</p>
                        <p className="font-medium">${contract.order?.totalAmount?.toLocaleString('es-CO')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Neto</p>
                        <p className="font-medium">${contract.order?.netAmount?.toLocaleString('es-CO')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Hash del contrato</p>
                        <p className="font-mono text-xs text-gray-600 truncate max-w-[150px]">
                          {contract.contentHash?.slice(0, 8)}...
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Firmas</p>
                        <p className="font-medium">{contract.signatures?.length || 0} / 2</p>
                      </div>
                    </div>
                  </div>
                  {contract.status === 'pending_signature' && (
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium">
                      Firmar contrato
                    </button>
                  )}
                </div>
                {contract.signatures && contract.signatures.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Firmantes:</p>
                    <div className="flex gap-2">
                      {contract.signatures.map((sig, i) => (
                        <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded">
                          ✓ Firma #{i + 1}: {sig.signature?.slice(0, 8)}...
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}