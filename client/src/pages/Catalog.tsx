import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { catalogApi, categoryApi } from '../services/api';
import { Listing, Category } from '../types/listing';

const categoryIcons: Record<string, string> = {
  'Harinas y Subproductos de Trigo': 'M12 3v10m0 0l-4-4m4 4l4-4m-4 4V7m4 4l-4 4m4-4l4-4M3 21h18M3 10v11M3 3v7',
  'Residuos de Frutas y Verduras': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
  'Subproductos Lácteos': 'M9 3v1h6v14a2 2 0 01-2 2H5a2 2 0 01-2-2V4h6zm0 3h6v2H9V6z',
  'Grasas y Aceites Usados': 'M12 2c1 0 2 .5 2 1.5S13 5 12 5s-2-.5-2-1.5S11 2 12 2zm-1 7v10m-1-10v3m2-3v3m2-3v3m2-3v3',
  'Envases y Embalajes de Alimentos': 'M9 3v1H4v2h1v13a2 2 0 002 2h5v-2H8V5h1V3H9zm4 3v2h2V6h-2zm0 4v2h2v-2h-2zm0 4v2h2v-2h-2z',
  'Carnes y Subproductos Cárnicos': 'M12 3v1h-1v1h2v-2zm0 4h-1v1h-1v1h2v-2zm0 4h-1v1h-1v1h2v-2zm4-8h1v1h-1v-1zm0 4h1v1h-1v-1zm0 4h1v1h-1v-1z',
  default: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z',
};

const categoryColors: Record<string, string> = {
  'Harinas y Subproductos de Trigo': 'from-amber-400 to-orange-500',
  'Residuos de Frutas y Verduras': 'from-green-400 to-emerald-500',
  'Subproductos Lácteos': 'from-blue-400 to-cyan-500',
  'Grasas y Aceites Usados': 'from-yellow-400 to-amber-600',
  'Envases y Embalajes de Alimentos': 'from-slate-400 to-gray-600',
  'Carnes y Subproductos Cárnicos': 'from-red-400 to-rose-600',
  default: 'from-emerald-400 to-teal-500',
};

const getCategoryIcon = (name: string) => categoryIcons[name] || categoryIcons.default;
const getCategoryColor = (name: string) => categoryColors[name] || categoryColors.default;

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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.282m-.282 4.556c-.342.342-.556.77-.556 1.272v4.394c0 .502.214.93.556 1.272l4.414 4.414c.342.342.77.556 1.272.556h4.394c.502 0 .93-.214 1.272-.556l4.414-4.414c.342-.342.556-.77.556-1.272V9.828c0-.502-.214-.93-.556-1.272l-4.414-4.414c-.342-.342-.77-.556-1.272-.556H9.828c-.502 0-.93.214-1.272.556L5.142 9.828c-.342.342-.556.77-.556 1.272v4.394c0 .502.214.93.556 1.272" />
                </svg>
              </div>
              <Link to="/" className="text-2xl font-bold">SubPro Exchange</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Iniciar Sesión
              </Link>
              <Link to="/register" className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 rounded-lg hover:bg-gray-100 transition font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Registrarse
              </Link>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar subproductos industriales, materiales reciclables, residuos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-32 py-4 text-lg rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 text-gray-800"
            />
            <button type="submit" className="absolute right-2 top-2 bottom-2 px-6 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
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
                  {listings.map(listing => {
                    const catName = listing.category?.name || '';
                    const iconPath = getCategoryIcon(catName);
                    const colorClass = getCategoryColor(catName);
                    return (
                    <Link key={listing.id} to={`/catalog/${listing.id}`} className="card hover:shadow-xl transition-all hover:-translate-y-1 group bg-white rounded-xl overflow-hidden">
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                        {listing.photos?.[0] ? (
                          <img src={listing.photos[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${colorClass}`}>
                            <svg className="w-16 h-16 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                              <path d={iconPath} />
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-white/90 backdrop-blur text-xs font-medium text-gray-700 rounded-full shadow-sm">
                            {listing.priceType === 'fixed' ? `$${listing.priceAmount?.toLocaleString('es-CO')}` : 'Negociar'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 text-xs font-medium text-white rounded-full bg-gradient-to-r ${colorClass}`}>
                            {listing.category?.name}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-2">
                          {listing.title}
                        </h3>
                        
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className="text-gray-600">
                            <span className="font-bold text-gray-800">{listing.quantity}</span> {listing.unit}
                          </span>
                        </div>
                        
                        <div className="pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                            <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-700 truncate">{listing.organization?.name}</span>
                          <span className="text-gray-300">•</span>
                          <span>{listing.organization?.country}</span>
                        </div>
                      </div>
                    </Link>
                  )})}
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