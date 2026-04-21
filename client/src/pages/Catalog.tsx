import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { catalogApi, categoryApi } from '../services/api';
import { Listing, Category } from '../types/listing';

export default function Catalog() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    unit: '',
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  useEffect(() => {
    categoryApi.getAll().then(r => setCategories(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    loadListings();
  }, [pagination.page, filters]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const params: any = { page: pagination.page, limit: pagination.limit };
      if (search) params.search = search;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.minPrice) params.minPrice = parseFloat(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = parseFloat(filters.maxPrice);
      if (filters.unit) params.unit = filters.unit;

      const { data } = await catalogApi.search(params);
      setListings(data.listings);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadListings();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <Link to="/" className="text-2xl font-bold">SubPro Exchange</Link>
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition font-medium">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="px-4 py-2 bg-white text-emerald-700 rounded-lg hover:bg-gray-100 transition font-medium">
                Registrarse
              </Link>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Buscar subproductos industriales, materiales reciclables, residuos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-6 py-4 text-lg rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 text-gray-800"
            />
            <button type="submit" className="absolute right-2 top-2 bottom-2 px-6 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition font-medium">
              Buscar
            </button>
          </form>
          
          <div className="mt-4 flex gap-2 flex-wrap">
            <span className="text-white/80 text-sm">Búsquedas populares:</span>
            {['Chatarra', 'Plástico PET', 'Metal', 'Residuos'].map(tag => (
              <button key={tag} onClick={() => setSearch(tag)} className="px-3 py-1 bg-white/20 rounded-full text-sm hover:bg-white/30 transition">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="w-72 flex-shrink-0">
            <div className="card sticky top-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Categoría</label>
                  <select
                    value={filters.categoryId}
                    onChange={e => setFilters({ ...filters, categoryId: e.target.value })}
                    className="input"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Precio mín.</label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
                      className="input"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="label">Precio máx.</label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
                      className="input"
                      placeholder="∞"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Unidad de medida</label>
                  <select
                    value={filters.unit}
                    onChange={e => setFilters({ ...filters, unit: e.target.value })}
                    className="input"
                  >
                    <option value="">Cualquiera</option>
                    <option value="toneladas">Toneladas</option>
                    <option value="kg">Kilogramos</option>
                    <option value="m3">Metros cúbicos</option>
                    <option value="unidades">Unidades</option>
                  </select>
                </div>

                <button
                  onClick={() => setFilters({ categoryId: '', minPrice: '', maxPrice: '', unit: '' })}
                  className="w-full btn-secondary"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="card mt-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
              <h4 className="font-semibold text-emerald-800 mb-2">¿Eres empresa?</h4>
              <p className="text-sm text-emerald-700 mb-3">Monetiza tus subproductos industriales y conecta con compradores verificados.</p>
              <Link to="/register" className="btn-primary block text-center">
                Registra tu empresa
              </Link>
            </div>
          </aside>

          {/* Listings Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              </div>
            ) : listings.length === 0 ? (
              <div className="card text-center py-16">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No se encontraron resultados</h3>
                <p className="text-gray-500">Intenta con otros filtros o términos de búsqueda</p>
              </div>
            ) : (
              <>
                <p className="text-gray-500 mb-4">{pagination.total} subproductos disponibles</p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {listings.map(listing => (
                    <Link key={listing.id} to={`/catalog/${listing.id}`} className="card hover:shadow-xl transition-all hover:-translate-y-1 group">
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 overflow-hidden">
                        {listing.photos?.[0] ? (
                          <img src={listing.photos[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors line-clamp-2">
                          {listing.title}
                        </h3>
                      </div>
                      
                      <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full mb-3">
                        {listing.category?.name}
                      </span>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          <span className="font-semibold text-gray-800">{listing.quantity}</span> {listing.unit}
                        </span>
                        {listing.priceType === 'fixed' && listing.priceAmount ? (
                          <span className="font-bold text-emerald-600">
                            ${listing.priceAmount.toLocaleString('es-CO')}
                          </span>
                        ) : (
                          <span className="text-gray-400">A negociar</span>
                        )}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {listing.organization?.name}
                        <span className="text-gray-300">•</span>
                        {listing.organization?.country}
                      </div>
                    </Link>
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setPagination(prev => ({ ...prev, page }))}
                        className={`w-10 h-10 rounded-lg font-medium transition ${
                          page === pagination.page
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2026 SubPro Exchange - Plataforma de Economía Circular</p>
        </div>
      </footer>
    </div>
  );
}