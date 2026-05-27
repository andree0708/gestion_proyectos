import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingApi, categoryApi } from '../services/api';
import { Category } from '../types/listing';
import ProductAttributesForm from '../components/ProductAttributesForm';
import LogisticsForm, { LogisticsData } from '../components/LogisticsForm';
import { uploadsSrc } from '../utils/mediaUrl';
import { useAuthStore } from '../hooks/useAuth';

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [technicalSheetUrl, setTechnicalSheetUrl] = useState('');
  const { organization } = useAuthStore();
  const [photos, setPhotos] = useState<string[]>([]);
  const [logistics, setLogistics] = useState<LogisticsData>({
    originDepartment: organization?.department || '',
    originCity: organization?.city || '',
    logisticsType: 'ambient',
    shelfLifeDays: '',
    deliveryModes: ['pickup'],
    allowedDepartments: [],
  });
  const [form, setForm] = useState({
    title: '',
    categoryId: '',
    description: '',
    quantity: '',
    unit: 'toneladas',
    priceType: 'negotiate' as 'fixed' | 'negotiate',
    priceAmount: '',
    attributes: {} as Record<string, string>,
  });

  useEffect(() => {
    categoryApi.getAll().then(r => setCategories(r.data)).catch(console.error);
    if (id) {
      listingApi.getById(id).then(r => {
        const listing = r.data;
        setForm({
          title: listing.title || '',
          categoryId: listing.categoryId || '',
          description: listing.description || '',
          quantity: String(listing.quantity || ''),
          unit: listing.unit || 'toneladas',
          priceType: listing.priceType || 'negotiate',
          priceAmount: listing.priceAmount ? String(listing.priceAmount) : '',
          attributes: (listing.attributes as Record<string, string>) || {},
        });
        setPhotos(listing.photos || []);
        setTechnicalSheetUrl(listing.technicalSheetUrl || '');
        setLogistics({
          originDepartment: listing.originDepartment || organization?.department || '',
          originCity: listing.originCity || organization?.city || '',
          logisticsType: (listing.logisticsType as LogisticsData['logisticsType']) || 'ambient',
          shelfLifeDays: listing.shelfLifeDays ? String(listing.shelfLifeDays) : '',
          deliveryModes: listing.deliveryModes?.length ? listing.deliveryModes : ['pickup'],
          allowedDepartments: listing.allowedDepartments || [],
        });
      }).catch(console.error);
    }
  }, [id]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }
    try {
      const { data } = await listingApi.uploadPhotos(formData);
      setPhotos(prev => [...prev, ...data.urls]);
    } catch (err) {
      console.error('Error uploading photos:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const payload = {
        ...form,
        quantity: parseFloat(form.quantity),
        priceAmount: form.priceType === 'fixed' ? parseFloat(form.priceAmount) : undefined,
        attributes: Object.keys(form.attributes).length > 0 ? form.attributes : undefined,
        photos: photos.length > 0 ? photos : undefined,
        technicalSheetUrl: technicalSheetUrl || undefined,
        originDepartment: logistics.originDepartment,
        originCity: logistics.originCity,
        logisticsType: logistics.logisticsType,
        shelfLifeDays: logistics.shelfLifeDays ? parseInt(logistics.shelfLifeDays, 10) : undefined,
        deliveryModes: logistics.deliveryModes,
        allowedDepartments: logistics.allowedDepartments,
      };
      await listingApi.update(id!, payload);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard" className="p-2 bg-white rounded-full shadow">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-light text-gray-800">Editar Listado</h1>
        </div>

        <div className="card p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Título del producto</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Categoría</label>
              <select
                value={form.categoryId}
                onChange={e => setForm({ ...form, categoryId: e.target.value })}
                className="input"
                required
              >
                <option value="">Seleccionar categoría</option>
                {categories.filter(c => c.level === 1).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Descripción</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="input"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Cantidad</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Unidad</label>
                <select
                  value={form.unit}
                  onChange={e => setForm({ ...form, unit: e.target.value })}
                  className="input"
                >
                  <option value="toneladas">Toneladas</option>
                  <option value="kg">Kilogramos</option>
                  <option value="litros">Litros</option>
                  <option value="unidades">Unidades</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Tipo de precio</label>
                <select
                  value={form.priceType}
                  onChange={e => setForm({ ...form, priceType: e.target.value as 'fixed' | 'negotiate' })}
                  className="input"
                >
                  <option value="negotiate">A negociar</option>
                  <option value="fixed">Fijo</option>
                </select>
              </div>
              {form.priceType === 'fixed' && (
                <div>
                  <label className="label">Precio (COP)</label>
                  <input
                    type="number"
                    value={form.priceAmount}
                    onChange={e => setForm({ ...form, priceAmount: e.target.value })}
                    className="input"
                  />
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="label">Fotos del producto</label>
              <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="input" />
              {photos.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {photos.map((url, i) => (
                    <img key={i} src={uploadsSrc(url)} alt="" className="w-16 h-16 object-cover rounded" />
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="label">Hoja técnica (PDF)</label>
              <input type="file" accept=".pdf" onChange={async e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fd = new FormData();
                fd.append('technicalSheet', file);
                const { data } = await listingApi.uploadTechnicalSheet(fd);
                setTechnicalSheetUrl(data.url);
              }} className="input" />
              {technicalSheetUrl && <a href={uploadsSrc(technicalSheetUrl)} target="_blank" rel="noreferrer" className="text-sm text-emerald-600">Ver ficha actual</a>}
            </div>

            <ProductAttributesForm attributes={form.attributes} onChange={attrs => setForm({ ...form, attributes: attrs })} />
            <LogisticsForm value={logistics} onChange={setLogistics} defaultDepartment={organization?.department} defaultCity={organization?.city} />

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-rose-500 to-purple-500 text-white py-3 rounded-full font-medium hover:from-rose-600 hover:to-purple-600 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <Link
                to="/dashboard"
                className="px-6 py-3 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}