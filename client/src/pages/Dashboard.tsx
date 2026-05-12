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
              <Link to="/offers" className="hover:text-white/80 transition">Ofertas</Link>
              <Link to="/contracts" className="hover:text-white/80 transition">Contratos</Link>
              <Link to="/orders" className="hover:text-white/80 transition">Pedidos</Link>
              <Link to="/payments" className="hover:text-white/80 transition">Pagos</Link>
              <Link to="/disputes" className="hover:text-white/80 transition">Disputas</Link>
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
        <div className="card mb-8 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold">{organization?.name?.charAt(0)}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">{organization?.name}</h2>
                <p className="text-white/80">{organization?.sector} • {organization?.country}</p>
                <div className="flex items-center gap-3 mt-2 text-sm">
                  <span className="text-white/60">NIT: <span className="text-white font-medium">{organization?.taxId}</span></span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    organization?.kybStatus === 'approved' ? 'bg-white/20 text-white' :
                    organization?.kybStatus === 'rejected' ? 'bg-red-500 text-white' :
                    'bg-amber-500 text-white'
                  }`}>
                    {organization?.kybStatus === 'approved' ? '✓ Verificado' : 
                     organization?.kybStatus === 'rejected' ? '✗ Rechazado' : '⏳ Pendiente KYB'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm text-white/60">Plan</span>
              <p className="text-2xl font-bold">{organization?.plan || 'Free'}</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to="/offers" className="card p-4 hover:shadow-lg transition text-center group">
            <div className="w-12 h-12 mx-auto mb-2 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-medium text-gray-800">Ofertas</p>
            <p className="text-xs text-gray-500">Ver ofertas</p>
          </Link>
          <Link to="/contracts" className="card p-4 hover:shadow-lg transition text-center group">
            <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-medium text-gray-800">Contratos</p>
            <p className="text-xs text-gray-500">Firmar</p>
          </Link>
          <Link to="/orders" className="card p-4 hover:shadow-lg transition text-center group">
            <div className="w-12 h-12 mx-auto mb-2 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="font-medium text-gray-800">Pedidos</p>
            <p className="text-xs text-gray-500">Seguimiento</p>
          </Link>
          <Link to="/catalog" className="card p-4 hover:shadow-lg transition text-center group">
            <div className="w-12 h-12 mx-auto mb-2 bg-cyan-100 rounded-xl flex items-center justify-center group-hover:bg-cyan-200">
              <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="font-medium text-gray-800">Catálogo</p>
            <p className="text-xs text-gray-500">Explorar</p>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
            <div className="w-12 h-12 mx-auto mb-2 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{listings.length}</p>
            <p className="text-gray-500 text-sm">Listados</p>
          </div>
          <div className="card text-center bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {listings.filter(l => l.status === 'active').length}
            </p>
            <p className="text-gray-500 text-sm">Activos</p>
          </div>
          <div className="card text-center bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="w-12 h-12 mx-auto mb-2 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {listings.filter(l => l.status === 'pending_review').length}
            </p>
            <p className="text-gray-500 text-sm">Pendientes</p>
          </div>
          <div className="card text-center bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-purple-600">0</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map(listing => (
                <div key={listing.id} className="card p-0 overflow-hidden group">
                  <div className="aspect-video bg-gray-100 relative">
                    {listing.photos?.[0] ? (
                      <img src={listing.photos[0]} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
                        <svg className="w-16 h-16 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(listing.status)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {listing.title}
                    </h4>
                    <p className="text-sm text-gray-500 mb-3">{listing.category?.name}</p>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-gray-600">
                        <span className="font-bold text-gray-800">{listing.quantity}</span> {listing.unit}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {new Date(listing.createdAt).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {listing.status === 'draft' && (
                        <button
                          onClick={() => listingApi.publish(listing.id).then(() => {
                            setListings(prev => prev.map(l => 
                              l.id === listing.id ? { ...l, status: 'pending_review' } : l
                            ));
                          })}
                          className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
                        >
                          Publicar
                        </button>
                      )}
                      <Link
                        to={`/catalog/${listing.id}`}
                        className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-center"
                      >
                        Ver
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}