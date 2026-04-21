import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';
import { listingApi } from '../services/api';
import { Listing } from '../types/listing';

export default function Dashboard() {
  const { user, organization, logout, isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      listingApi.getMy()
        .then(r => setListings(r.data))
        .catch(console.error)
        .finally(() => setLoadingListings(false));
    }
  }, [isAuthenticated]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-600',
      pending_review: 'bg-amber-100 text-amber-700',
      active: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-600',
    };
    const labels: Record<string, string> = {
      draft: 'Borrador',
      pending_review: 'En revisión',
      active: 'Activo',
      rejected: 'Rechazado',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const isModerator = user?.role === 'admin' || user?.role === 'moderator';

  if (isLoading || loadingListings) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-bold">SubPro Exchange</Link>
            <nav className="hidden md:flex gap-4 ml-8">
              <Link to="/catalog" className="hover:text-white/80 transition">Catálogo</Link>
              <Link to="/dashboard" className="hover:text-white/80 transition font-medium">Dashboard</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {isModerator && (
              <Link to="/moderation" className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition font-medium">
                Panel de Moderación
              </Link>
            )}
            <div className="flex items-center gap-3">
              <span className="text-sm">{user?.email}</span>
              <button onClick={logout} className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition text-sm">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Company Card */}
        <div className="card mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{organization?.name}</h2>
              <p className="text-gray-600">{organization?.sector} • {organization?.country}</p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="text-gray-500">NIT: <span className="text-gray-700 font-medium">{organization?.taxId}</span></span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  organization?.kybStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  organization?.kybStatus === 'rejected' ? 'bg-red-100 text-red-600' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {organization?.kybStatus === 'approved' ? '✓ Verificado' : 
                   organization?.kybStatus === 'rejected' ? '✗ Rechazado' : '⏳ Pendiente KYB'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-500">Plan</span>
              <p className="text-lg font-bold text-emerald-600">{organization?.plan || 'Free'}</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <p className="text-3xl font-bold text-emerald-600">{listings.length}</p>
            <p className="text-gray-500 text-sm">Listados</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-emerald-600">
              {listings.filter(l => l.status === 'active').length}
            </p>
            <p className="text-gray-500 text-sm">Activos</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-emerald-600">
              {listings.filter(l => l.status === 'pending_review').length}
            </p>
            <p className="text-gray-500 text-sm">Pendientes</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-gray-400">0</p>
            <p className="text-gray-500 text-sm">Transacciones</p>
          </div>
        </div>

        {/* Listings Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Mis Listados</h3>
            <Link to="/listings/create" className="btn-primary">
              + Nuevo Listado
            </Link>
          </div>
          
          {listings.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h4 className="text-lg font-medium text-gray-700 mb-2">No hay listados publicados</h4>
              <p className="text-gray-500 mb-4">Comienza publicando tu primer subproducto</p>
              <Link to="/listings/create" className="btn-primary">
                Crear mi primer listado
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Título</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Categoría</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Cantidad</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Estado</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Fecha</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map(listing => (
                    <tr key={listing.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-800">{listing.title}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{listing.category?.name}</td>
                      <td className="py-3 px-4 text-gray-600">{listing.quantity} {listing.unit}</td>
                      <td className="py-3 px-4">{getStatusBadge(listing.status)}</td>
                      <td className="py-3 px-4 text-gray-500 text-sm">
                        {new Date(listing.createdAt).toLocaleDateString('es-CO')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {listing.status === 'draft' && (
                          <button
                            onClick={() => listingApi.publish(listing.id).then(() => {
                              setListings(prev => prev.map(l => 
                                l.id === listing.id ? { ...l, status: 'pending_review' } : l
                              ));
                            })}
                            className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                          >
                            Publicar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}