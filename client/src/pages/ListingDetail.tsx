import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listingApi, offerApi } from '../services/api';
import { Listing } from '../types/listing';
import { useAuthStore } from '../hooks/useAuth';
import { uploadsSrc } from '../utils/mediaUrl';
import { canDeliverTo, logisticsBadge, DELIVERY_MODE_LABELS } from '../utils/logistics';
import { getOrgStatusLabel, getOrgStatusClasses } from '../utils/orgStatus';

const ATTR_LABELS: Record<string, string> = {
  humedad: 'Humedad (%)',
  granulometria: 'Granulometría',
  fechaElaboracion: 'Fecha elaboración',
  caducidad: 'Caducidad',
  origen: 'Origen',
  certSanidad: 'Cert. sanidad',
  certAmbiental: 'Cert. ambiental',
  proteinas: 'Proteínas (%)',
  grasas: 'Grasas (%)',
  carbohidratos: 'Carbohidratos (%)',
  fibra: 'Fibra (%)',
  calorias: 'Calorías / 100g',
  notas: 'Notas',
};

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'general' | 'tecnico' | 'cert' | 'nutricion'>('general');
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerData, setOfferData] = useState({ quantity: '', unitPrice: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated, organization } = useAuthStore();

  useEffect(() => {
    if (id) {
      listingApi.getById(id).then(r => setListing(r.data)).catch(console.error).finally(() => setLoading(false));
    }
  }, [id]);

  const attrs = (listing?.attributes || {}) as Record<string, string>;
  const certKeys = ['certSanidad', 'certAmbiental'];
  const nutritionKeys = ['proteinas', 'grasas', 'carbohidratos', 'fibra', 'calorias'];
  const techKeys = ['humedad', 'granulometria', 'fechaElaboracion', 'caducidad', 'origen', 'notas'];

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !listing) return;
    setError('');
    const check = canDeliverTo(listing, organization?.department);
    if (!check.ok) {
      setError(check.reason || 'Entrega no viable a tu departamento');
      return;
    }
    setSubmitting(true);
    try {
      await offerApi.create({
        listingId: id,
        quantity: parseFloat(offerData.quantity),
        unitPrice: parseFloat(offerData.unitPrice),
        message: offerData.message || undefined,
      });
      alert('¡Oferta enviada! El vendedor la verá en Ofertas → Recibidas.');
      setShowOfferForm(false);
      setOfferData({ quantity: '', unitPrice: '', message: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al enviar oferta');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;
  if (!listing) return <div className="p-8">Listado no encontrado</div>;

  const renderAttrs = (keys: string[]) => (
    <div className="space-y-2 text-sm">
      {keys.filter(k => attrs[k]).map(k => (
        <div key={k} className="flex justify-between border-b border-gray-100 py-2">
          <span className="text-gray-500">{ATTR_LABELS[k] || k}</span>
          <span className="font-medium">{attrs[k]}</span>
        </div>
      ))}
      {keys.filter(k => attrs[k]).length === 0 && <p className="text-gray-400">Sin información registrada</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <header className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link to="/catalog" className="text-white/90 hover:text-white">← Volver al catálogo</Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="card border-0 shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6">
            <div>
              {listing.photos?.length > 0 ? (
                <img src={uploadsSrc(listing.photos[0])} alt={listing.title} className="w-full h-80 object-cover rounded-lg" />
              ) : (
                <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">Sin imágenes</div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{listing.title}</h1>
                {listing.quantity <= 0 && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Agotado</span>
                )}
              </div>
              <p className="text-lg text-gray-600 mb-4">{listing.category?.name}</p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4 grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Cantidad:</span><p className="font-medium">{listing.quantity} {listing.unit}</p></div>
                <div><span className="text-gray-500">Precio:</span><p className="font-medium">{listing.priceType === 'fixed' && listing.priceAmount ? `$${Number(listing.priceAmount).toLocaleString('es-CO')} COP` : 'A negociar'}</p></div>
                <div><span className="text-gray-500">Stock disponible:</span><p className={`font-medium ${listing.quantity <= 0 ? 'text-red-600' : 'text-emerald-600'}`}>{listing.quantity <= 0 ? 'Agotado' : `${listing.quantity} ${listing.unit}`}</p></div>
              </div>
              {(listing.originDepartment || listing.logisticsType) && (
                <div className="bg-rose-50/60 border border-rose-100 p-4 rounded-lg mb-4 text-sm space-y-1">
                  <p className="font-medium text-gray-800">Logística</p>
                  {listing.logisticsType && <p>{logisticsBadge(listing.logisticsType)}{listing.shelfLifeDays ? ` · ${listing.shelfLifeDays} días de vida útil` : ''}</p>}
                  {listing.originCity && listing.originDepartment && <p>Origen: {listing.originCity}, {listing.originDepartment}</p>}
                  {listing.deliveryModes?.length ? (
                    <p>Entrega: {listing.deliveryModes.map(m => DELIVERY_MODE_LABELS[m] || m).join(' · ')}</p>
                  ) : null}
                </div>
              )}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Vendedor</h3>
                <p className="text-sm">{listing.organization?.name}</p>
                <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${getOrgStatusClasses(listing.organization?.kybStatus)}`}>
                  {getOrgStatusLabel(listing.organization?.kybStatus)}
                </span>
              </div>
              <div className="mt-6">
                {!isAuthenticated ? (
                  <Link to="/login" className="block text-center bg-gradient-to-r from-rose-500 to-purple-500 text-white py-3 rounded-full font-medium">Iniciar sesión para ofertar</Link>
                ) : listing.organization?.id === organization?.id ? (
                  <div className="text-center bg-gray-100 text-gray-600 py-3 rounded-lg">Este es tu producto</div>
                ) : organization?.department && !canDeliverTo(listing, organization.department).ok ? (
                  <div className="text-center bg-amber-50 text-amber-800 py-3 px-4 rounded-lg text-sm border border-amber-200">
                    {canDeliverTo(listing, organization.department).reason}
                  </div>
                ) : showOfferForm ? (
                  <form onSubmit={handleSubmitOffer} className="bg-rose-50/50 p-4 rounded-xl border border-rose-200">
                    {error && <div className="mb-3 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input type="number" step="0.01" value={offerData.quantity} onChange={e => setOfferData({ ...offerData, quantity: e.target.value })} className="input text-sm" placeholder="Cantidad" required />
                      <input type="number" value={offerData.unitPrice} onChange={e => setOfferData({ ...offerData, unitPrice: e.target.value })} className="input text-sm" placeholder="Precio unitario COP" required />
                    </div>
                    <textarea value={offerData.message} onChange={e => setOfferData({ ...offerData, message: e.target.value })} className="input text-sm mb-3" rows={2} placeholder="Mensaje para el vendedor..." />
                    <div className="flex gap-2">
                      <button type="submit" disabled={submitting} className="flex-1 bg-gradient-to-r from-rose-500 to-purple-500 text-white py-2 rounded-full text-sm font-medium">{submitting ? 'Enviando...' : 'Enviar oferta'}</button>
                      <button type="button" onClick={() => setShowOfferForm(false)} className="px-4 py-2 border border-gray-300 rounded-full text-sm">Cancelar</button>
                    </div>
                  </form>
                ) : listing.quantity <= 0 ? (
                  <div className="text-center bg-red-50 text-red-700 py-3 px-4 rounded-lg text-sm border border-red-200 font-medium">
                    Producto agotado — no es posible ofertar
                  </div>
                ) : (
                  <button onClick={() => setShowOfferForm(true)} className="w-full bg-gradient-to-r from-rose-500 to-purple-500 text-white py-3 rounded-full font-medium">Hacer una oferta</button>
                )}
              </div>
            </div>
          </div>
          <div className="border-t px-6 pb-6">
            <div className="flex gap-2 mt-4 border-b">
              {(['general', 'tecnico', 'cert', 'nutricion'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-500'}`}>
                  {t === 'general' ? 'General' : t === 'tecnico' ? 'Técnico' : t === 'cert' ? 'Certificaciones' : 'Nutrición'}
                </button>
              ))}
            </div>
            <div className="mt-4">
              {tab === 'general' && (
                <div>
                  {listing.description && <p className="text-gray-700 mb-4">{listing.description}</p>}
                  {(listing as any).technicalSheetUrl && (
                    <a href={uploadsSrc((listing as any).technicalSheetUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-rose-600 hover:underline">
                      📄 Descargar hoja técnica (PDF)
                    </a>
                  )}
                </div>
              )}
              {tab === 'tecnico' && renderAttrs(techKeys)}
              {tab === 'cert' && renderAttrs(certKeys)}
              {tab === 'nutricion' && renderAttrs(nutritionKeys)}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
