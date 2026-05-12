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
    attributes: {} as Record<string, string>,
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

            {/* Atributos Técnicos */}
            <div className="card bg-slate-50 p-4 mb-4">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Atributos Técnicos (opcional)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Humedad (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.attributes.humedad || ''}
                    onChange={e => setForm({ ...form, attributes: { ...form.attributes, humedad: e.target.value } })}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="Ej: 5.5"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fecha de elaboración</label>
                  <input
                    type="date"
                    value={form.attributes.fechaElaboracion || ''}
                    onChange={e => setForm({ ...form, attributes: { ...form.attributes, fechaElaboracion: e.target.value } })}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Caducidad</label>
                  <input
                    type="date"
                    value={form.attributes.caducidad || ''}
                    onChange={e => setForm({ ...form, attributes: { ...form.attributes, caducidad: e.target.value } })}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Origen</label>
                  <select
                    value={form.attributes.origen || ''}
                    onChange={e => setForm({ ...form, attributes: { ...form.attributes, origen: e.target.value } })}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="">Seleccionar</option>
                    <option value="industrial">Industrial</option>
                    <option value="comercial">Comercial</option>
                    <option value="agricola">Agrícola</option>
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs text-gray-500 mb-1">Notas adicionales</label>
                <textarea
                  value={form.attributes.notas || ''}
                  onChange={e => setForm({ ...form, attributes: { ...form.attributes, notas: e.target.value } })}
                  className="w-full p-2 border rounded text-sm"
                  rows={2}
                  placeholder="Información adicional relevante..."
                />
              </div>
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