import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingApi, categoryApi } from '../services/api';
import { Category } from '../types/listing';
import ProductAttributesForm from '../components/ProductAttributesForm';
import LogisticsForm, { LogisticsData } from '../components/LogisticsForm';
import { uploadsSrc } from '../utils/mediaUrl';
import { useAuthStore } from '../hooks/useAuth';

export default function CreateListing() {
  const navigate = useNavigate();
  const { organization } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
  const [photos, setPhotos] = useState<string[]>([]);
  const [technicalSheetUrl, setTechnicalSheetUrl] = useState('');
  const [logistics, setLogistics] = useState<LogisticsData>({
    originDepartment: organization?.department || '',
    originCity: organization?.city || '',
    logisticsType: 'ambient',
    shelfLifeDays: '',
    deliveryModes: ['pickup'],
    allowedDepartments: [],
  });

  useEffect(() => {
    categoryApi.getAll().then(r => setCategories(r.data)).catch(console.error);
  }, []);

  const handleTechnicalSheetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('technicalSheet', file);
    try {
      const { data } = await listingApi.uploadTechnicalSheet(formData);
      setTechnicalSheetUrl(data.url);
    } catch (err) {
      console.error(err);
    }
  };

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
    } catch (err: any) {
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
      const { data: created } = await listingApi.create(payload);
      await listingApi.publish(created.id);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error creating listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="card border-0 shadow-xl p-6">
          <h1 className="text-2xl font-light text-gray-800 mb-6">Publicar Nuevo Listado</h1>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Título *</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input" required />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Categoría *</label>
              <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="w-full p-2 border rounded" required>
                <option value="">Seleccionar categoría</option>
                {categories.filter(c => c.level === 1).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full p-2 border rounded" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cantidad *</label>
                <input type="number" step="0.01" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unidad *</label>
                <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full p-2 border rounded">
                  <option value="toneladas">Toneladas</option>
                  <option value="kg">Kilogramos</option>
                  <option value="litros">Litros</option>
                  <option value="m3">Metros cúbicos</option>
                  <option value="unidades">Unidades</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de precio</label>
                <select value={form.priceType} onChange={e => setForm({ ...form, priceType: e.target.value as 'fixed' | 'negotiate' })} className="w-full p-2 border rounded">
                  <option value="negotiate">A negociar</option>
                  <option value="fixed">Fijo</option>
                </select>
              </div>
              {form.priceType === 'fixed' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Precio (COP)</label>
                  <input type="number" value={form.priceAmount} onChange={e => setForm({ ...form, priceAmount: e.target.value })} className="w-full p-2 border rounded" />
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Fotos</label>
              <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="w-full p-2 border rounded" />
              {photos.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {photos.map((url, i) => (
                    <img key={i} src={uploadsSrc(url)} alt="" className="w-16 h-16 object-cover rounded" />
                  ))}
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Hoja técnica (PDF)</label>
              <input type="file" accept=".pdf,application/pdf" onChange={handleTechnicalSheetUpload} className="w-full p-2 border rounded" />
              {technicalSheetUrl && <p className="text-sm text-emerald-600 mt-1">✓ Ficha técnica cargada</p>}
            </div>
            <ProductAttributesForm attributes={form.attributes} onChange={attrs => setForm({ ...form, attributes: attrs })} />
            <LogisticsForm
              value={logistics}
              onChange={setLogistics}
              defaultDepartment={organization?.department}
              defaultCity={organization?.city}
            />
            <div className="flex gap-4 mt-4">
              <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 border border-gray-300 text-gray-600 rounded hover:bg-gray-50">← Volver</button>
              <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-rose-500 to-purple-500 text-white p-3 rounded hover:from-rose-600 hover:to-purple-600 disabled:opacity-50 font-medium">
                {loading ? 'Guardando...' : 'Publicar Producto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
