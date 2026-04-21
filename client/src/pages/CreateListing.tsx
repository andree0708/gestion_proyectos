import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingApi, categoryApi } from '../services/api';
import { Category } from '../types/listing';

export default function CreateListing() {
  const navigate = useNavigate();
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
    attributes: '{}',
  });
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    categoryApi.getAll().then(r => setCategories(r.data)).catch(console.error);
  }, []);

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
      setError(err.response?.data?.error || 'Error uploading photos');
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
        attributes: JSON.parse(form.attributes),
        photos,
      };
      await listingApi.create(payload);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error creating listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Publicar Nuevo Listado</h1>
          
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Título *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Categoría *</label>
              <select
                value={form.categoryId}
                onChange={e => setForm({ ...form, categoryId: e.target.value })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {'  '.repeat(cat.level - 1)}{cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cantidad *</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unidad *</label>
                <select
                  value={form.unit}
                  onChange={e => setForm({ ...form, unit: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="toneladas">Toneladas</option>
                  <option value="kg">Kilogramos</option>
                  <option value="m3">Metros cúbicos</option>
                  <option value="unidades">Unidades</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de precio</label>
                <select
                  value={form.priceType}
                  onChange={e => setForm({ ...form, priceType: e.target.value as 'fixed' | 'negotiate' })}
                  className="w-full p-2 border rounded"
                >
                  <option value="negotiate">A negociar</option>
                  <option value="fixed">Fijo</option>
                </select>
              </div>
              {form.priceType === 'fixed' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Precio (COP)</label>
                  <input
                    type="number"
                    value={form.priceAmount}
                    onChange={e => setForm({ ...form, priceAmount: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Fotos</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full p-2 border rounded"
              />
              {photos.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {photos.map((url, i) => (
                    <img key={i} src={url} alt={`Preview ${i}`} className="w-16 h-16 object-cover rounded" />
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Atributos JSON</label>
              <textarea
                value={form.attributes}
                onChange={e => setForm({ ...form, attributes: e.target.value })}
                className="w-full p-2 border rounded font-mono text-sm"
                rows={3}
                placeholder='{"humedad": 5, "granulometria": "mediana"}'
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Crear Listado'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}