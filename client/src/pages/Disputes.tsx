import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { disputeApi } from '../services/api';
import { useAuthStore } from '../hooks/useAuth';

interface Dispute {
  id: string;
  reason: string;
  description: string;
  status: string;
  resolution?: string;
  createdAt: string;
  order: {
    id: string;
    totalAmount: number;
    offer: { listing: { title: string } };
    buyer: { name: string };
    seller: { name: string };
  };
  evidences: Array<{ type: string; description: string; createdAt: string }>;
}

export default function Disputes() {
  const { user } = useAuthStore();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ orderId: '', reason: '', description: '' });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = isAdmin ? await disputeApi.getAll() : await disputeApi.getMy();
      setDisputes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await disputeApi.create(formData.orderId, { reason: formData.reason, description: formData.description });
      setShowForm(false);
      setFormData({ orderId: '', reason: '', description: '' });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al crear disputa');
    }
  };

  const handleResolve = async (disputeId: string) => {
    const resolution = prompt('Ingresa la resolución de la disputa:');
    if (!resolution) return;
    try {
      await disputeApi.resolve(disputeId, resolution);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al resolver');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-red-100 text-red-700',
      resolved: 'bg-emerald-100 text-emerald-700',
    };
    const labels: Record<string, string> = { open: 'Abierta', resolved: 'Resuelta' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      damaged: 'Producto dañado',
      wrong_quantity: 'Cantidad incorrecta',
      not_delivered: 'No entregado',
      not_as_described: 'No como se describió',
      other: 'Otro',
    };
    return labels[reason] || reason;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-bold">SubPro Exchange</Link>
            <nav className="hidden md:flex gap-4 ml-8">
              <Link to="/dashboard" className="hover:text-white/80">Dashboard</Link>
              <Link to="/payments" className="hover:text-white/80">Pagos</Link>
              <Link to="/disputes" className="font-medium">Disputas</Link>
            </nav>
          </div>
          <Link to="/dashboard" className="text-sm opacity-80">← Volver</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Centro de Disputas</h1>
            <p className="text-gray-500">{isAdmin ? 'Administra todas las disputas' : 'Gestiona tus disputas'}</p>
          </div>
          {!isAdmin && (
            <button onClick={() => setShowForm(!showForm)} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Abrir disputa
            </button>
          )}
        </div>

        {showForm && (
          <div className="card mb-8 p-4">
            <h3 className="font-semibold mb-4">Nueva Disputa</h3>
            <form onSubmit={handleCreateDispute} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">ID de la orden</label>
                <input value={formData.orderId} onChange={e => setFormData({ ...formData, orderId: e.target.value })} className="w-full p-2 border rounded" placeholder="UUID de la orden" required />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Motivo</label>
                <select value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} className="w-full p-2 border rounded" required>
                  <option value="">Seleccionar</option>
                  <option value="damaged">Producto dañado</option>
                  <option value="wrong_quantity">Cantidad incorrecta</option>
                  <option value="not_delivered">No entregado</option>
                  <option value="not_as_described">No como se describió</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Descripción</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded" rows={3} placeholder="Describe el problema..." required />
              </div>
              <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Enviar disputa</button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>
        ) : disputes.length === 0 ? (
          <div className="card text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay disputas</h3>
            <p className="text-gray-500">{isAdmin ? 'Todas las disputas resueltas' : 'No has abierto ninguna disputa'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map(dispute => (
              <div key={dispute.id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{dispute.order?.offer?.listing?.title}</h3>
                      {getStatusBadge(dispute.status)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {dispute.order?.buyer?.name} → {dispute.order?.seller?.name} • ${Number(dispute.order?.totalAmount).toLocaleString('es-CO')}
                    </p>
                  </div>
                  {isAdmin && dispute.status === 'open' && (
                    <button onClick={() => handleResolve(dispute.id)} className="bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700">
                      Resolver
                    </button>
                  )}
                </div>
                <div className="bg-gray-50 p-3 rounded mb-4">
                  <p className="text-sm"><span className="font-medium">Motivo:</span> {getReasonLabel(dispute.reason)}</p>
                  <p className="text-sm mt-1"><span className="font-medium">Descripción:</span> {dispute.description}</p>
                </div>
                {dispute.evidences?.length > 0 && (
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Evidencia:</span> {dispute.evidences.length} archivo(s) enviado(s)
                  </div>
                )}
                {dispute.resolution && (
                  <div className="mt-3 p-3 bg-emerald-50 text-emerald-700 rounded text-sm">
                    <span className="font-medium">Resolución:</span> {dispute.resolution}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-3">Creada: {new Date(dispute.createdAt).toLocaleDateString('es-CO')}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}