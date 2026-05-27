import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';
import { listingApi, analyticsApi, catalogApi } from '../services/api';
import { uploadsSrc } from '../utils/mediaUrl';
import { Listing } from '../types/listing';
import AppNav from '../components/AppNav';
import { getOrgStatusLabel } from '../utils/orgStatus';
import { logisticsBadge } from '../utils/logistics';

export default function Dashboard() {
  const { user, organization, logout, isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [marketplaceListings, setMarketplaceListings] = useState<Listing[]>([]);
  const [marketplaceTotal, setMarketplaceTotal] = useState(0);
  const [loadingListings, setLoadingListings] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  const loadDashboardData = async () => {
    const [listingsRes, catalogRes, statsRes] = await Promise.all([
      listingApi.getMy(),
      catalogApi.search({ page: 1, limit: 50 }),
      analyticsApi.getStats(),
    ]);

    const myListings = listingsRes.data;
    const catalogListings: Listing[] = catalogRes.data.listings;
    const catalogIds = new Set(catalogListings.map(l => l.id));

    const myPending = myListings
      .filter(l => l.status !== 'active' && !catalogIds.has(l.id))
      .map(l => ({
        ...l,
        organization: organization
          ? { id: organization.id, name: organization.name, kybStatus: organization.kybStatus, country: organization.country }
          : l.organization,
      }));

    setListings(myListings);
    setMarketplaceListings([...catalogListings, ...myPending]);
    setMarketplaceTotal(catalogRes.data.pagination?.total ?? catalogListings.length);
    setStats(statsRes.data);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadDashboardData()
      .catch(console.error)
      .finally(() => setLoadingListings(false));
  }, [isAuthenticated, organization?.id]);

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
  const isOwnListing = (listing: Listing) => listing.orgId === organization?.id;

  const handlePublishListing = async (listingId: string) => {
    await listingApi.publish(listingId);
    await loadDashboardData();
  };

  const renderMarketplaceCard = (listing: Listing) => {
    const isDraft = listing.status === 'draft' || listing.status === 'pending_review';
    const own = isOwnListing(listing);

    return (
    <div key={listing.id} className={`card p-0 overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-0.5 ${isDraft ? 'ring-2 ring-amber-200' : ''}`}>
      <Link to={`/catalog/${listing.id}`} className="block">
      <div className="aspect-video bg-gray-100 relative">
        {listing.photos?.[0] ? (
          <img
            src={uploadsSrc(listing.photos[0])}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-purple-100">
            <svg className="w-14 h-14 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 right-2">
          {isDraft ? (
            <span className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
              {listing.status === 'draft' ? 'Borrador' : 'En revisión'}
            </span>
          ) : (
            <span className="px-2 py-1 bg-white/90 backdrop-blur text-xs font-medium text-gray-700 rounded-full shadow-sm">
              {listing.priceType === 'fixed' && listing.priceAmount
                ? `$${Number(listing.priceAmount).toLocaleString('es-CO')}`
                : 'Negociar'}
            </span>
          )}
        </div>
        {own && !isDraft && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-rose-500 text-white text-xs font-medium rounded-full">Tu producto</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-gray-800 group-hover:text-rose-500 transition-colors line-clamp-2 mb-1">
          {listing.title}
        </h4>
        <p className="text-sm text-gray-500 mb-2">{listing.category?.name}</p>
        {listing.logisticsType && (
          <p className="text-xs text-rose-600 mb-1">{logisticsBadge(listing.logisticsType)} · {listing.originDepartment || 'Colombia'}</p>
        )}
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-gray-600">
            <span className="font-bold text-gray-800">{listing.quantity}</span> {listing.unit}
          </span>
        </div>
        <div className="pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-100 to-purple-100 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-rose-600">
              {listing.organization?.name?.charAt(0) ?? '?'}
            </span>
          </div>
          <span className="font-medium text-gray-700 truncate">{listing.organization?.name}</span>
          {listing.organization?.country && (
            <>
              <span className="text-gray-300">•</span>
              <span className="truncate">{listing.organization.country}</span>
            </>
          )}
        </div>
      </div>
      </Link>
      {own && listing.status === 'draft' && (
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={() => handlePublishListing(listing.id)}
            className="w-full bg-gradient-to-r from-rose-500 to-purple-500 text-white py-2 rounded-full text-sm font-medium hover:from-rose-600 hover:to-purple-600"
          >
            Publicar ahora
          </button>
        </div>
      )}
    </div>
  );
  };

  if (isLoading || loadingListings) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌸</span>
              <Link to="/" className="text-2xl font-light tracking-wide">SubPro</Link>
            </div>
            <AppNav active="dashboard" />
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
        <div className="card mb-8 bg-gradient-to-r from-rose-400 via-pink-400 to-purple-500 text-white shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                <span className="text-2xl">{organization?.name?.charAt(0)}</span>
              </div>
              <div>
                <h2 className="text-xl font-light">{organization?.name}</h2>
                <p className="text-white/80">{organization?.sector}</p>
                <p className="text-white/70 text-sm">{organization?.city}{organization?.department ? `, ${organization.department}` : ''}</p>
                <div className="flex items-center gap-3 mt-2 text-sm flex-wrap">
                  <span className="text-white/60">NIT: <span className="text-white font-medium">{organization?.taxId}</span></span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                    ✓ {getOrgStatusLabel(organization?.kybStatus)}
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
          <Link to="/listings/create" className="card p-4 hover:shadow-lg transition text-center group border-rose-100">
            <p className="text-2xl mb-1">+</p>
            <p className="font-medium text-gray-800">Nuevo producto</p>
          </Link>
          <Link to="/offers" className="card p-4 hover:shadow-lg transition text-center group">
            <p className="font-medium text-gray-800">Ofertas</p>
            <p className="text-xs text-gray-500">Recibidas / enviadas</p>
          </Link>
          <Link to="/orders" className="card p-4 hover:shadow-lg transition text-center group">
            <p className="font-medium text-gray-800">Pedidos</p>
            <p className="text-xs text-gray-500">Envío y entrega</p>
          </Link>
          <Link to="/catalog" className="card p-4 hover:shadow-lg transition text-center group">
            <p className="font-medium text-gray-800">Catálogo</p>
            <p className="text-xs text-gray-500">Comprar subproductos</p>
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
            <p className="text-gray-500 text-sm">Mis listados</p>
          </div>
          <div className="card text-center bg-gradient-to-br from-rose-50 to-purple-50 border-rose-200">
            <div className="w-12 h-12 mx-auto mb-2 bg-rose-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-rose-600">{marketplaceTotal}</p>
            <p className="text-gray-500 text-sm">En la plataforma</p>
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
          <div className="card text-center bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
            <div className="w-12 h-12 mx-auto mb-2 bg-red-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {listings.filter(l => l.quantity <= 0).length}
            </p>
            <p className="text-gray-500 text-sm">Agotados</p>
          </div>
          <div className="card text-center bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats?.totalOrders ?? 0}</p>
            <p className="text-gray-500 text-sm">Transacciones</p>
          </div>
        </div>

        {/* Marketplace — todos los productos publicados */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Productos de la plataforma</h3>
              <p className="text-sm text-gray-500">
                Subproductos publicados por empresas y asociaciones registradas
              </p>
            </div>
            <Link
              to="/catalog"
              className="text-sm text-rose-500 font-medium hover:underline shrink-0 ml-4"
            >
              Ver catálogo completo →
            </Link>
          </div>

          {marketplaceListings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">No hay productos en la plataforma todavía.</p>
              <Link to="/listings/create" className="text-rose-500 font-medium hover:underline">
                Publicar el primer producto
              </Link>
            </div>
          ) : (
            <>
              {listings.some(l => l.status === 'draft') && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                  Tienes productos en <strong>borrador</strong>. Pulsa <strong>Publicar ahora</strong> para que los vean todas las empresas.
                </p>
              )}
              <p className="text-xs text-gray-400 mb-4">
                {marketplaceTotal} activos en la plataforma · {marketplaceListings.length} mostrados
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {marketplaceListings.map(renderMarketplaceCard)}
              </div>
            </>
          )}
        </div>

        {/* Mis listados — gestión propia */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Mis Listados</h3>
              <p className="text-sm text-gray-500">Productos que publicaste con tu cuenta</p>
            </div>
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
                      <img src={uploadsSrc(listing.photos[0])} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
                        <svg className="w-16 h-16 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      {listing.quantity <= 0 && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">Agotado</span>
                      )}
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
                      <span className={`text-xs font-medium ${listing.quantity <= 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {listing.quantity <= 0 ? 'Sin stock' : `${listing.quantity} disp.`}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {listing.status === 'draft' && (
                        <button
                          onClick={() => handlePublishListing(listing.id)}
                          className="flex-1 bg-gradient-to-r from-rose-500 to-purple-500 text-white py-2 rounded-full hover:from-rose-600 hover:to-purple-600 transition text-sm font-medium"
                        >
                          Publicar
                        </button>
                      )}
                      <Link
                        to={`/listings/edit/${listing.id}`}
                        className="flex-1 border border-rose-300 text-rose-600 py-2 rounded-full hover:bg-rose-50 transition text-sm font-medium text-center"
                      >
                        Editar
                      </Link>
                      <Link
                        to={`/catalog/${listing.id}`}
                        className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-full hover:bg-gray-50 transition text-sm font-medium text-center"
                      >
                        Ver
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm('¿Estás seguro de eliminar este producto?')) {
                            listingApi.delete(listing.id).then(() => {
                              setListings(prev => prev.filter(l => l.id !== listing.id));
                            });
                          }
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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