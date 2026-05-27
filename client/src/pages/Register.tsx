import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';
import { COLOMBIA_DEPARTMENTS } from '../data/colombiaDepartments';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    taxId: '',
    country: 'Colombia',
    sector: '',
    department: '',
    city: '',
    address: '',
    email: '',
    password: '',
    fullName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  const sectors = [
    'Procesamiento de alimentos',
    'Panadería y repostería',
    'Lácteos y derivados',
    'Carnes y aves',
    'Frutas y verduras',
    'Bebidas',
    'Aceites y grasas comestibles',
    'Harinas y cereales',
    'Distribución / retail alimentario',
    'Otro (sector alimenticio)',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <Link to="/" className="text-4xl font-light text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-500">🌸 SubPro</Link>
          <p className="text-gray-600 mt-2">Registro de empresas del sector alimenticio</p>
        </div>

        <div className="card border-0 shadow-2xl">
          <h2 className="text-2xl font-light text-gray-800 mb-2">Crear Cuenta</h2>
          <p className="text-gray-500 mb-6 text-sm">Datos de empresa y ubicación para calcular entregas por departamento</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nombre de la empresa *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">NIT * (sin puntos)</label>
                <input type="text" value={form.taxId} onChange={e => setForm({ ...form, taxId: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="label">Sector alimenticio *</label>
                <select value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} className="input" required>
                  <option value="">Seleccionar</option>
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Departamento *</label>
                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="input" required>
                  <option value="">Seleccionar</option>
                  {COLOMBIA_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Ciudad / municipio *</label>
                <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="input" placeholder="Ej: Mosquera" required />
              </div>
            </div>

            <div>
              <label className="label">Dirección de planta o bodega</label>
              <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input" placeholder="Calle, vereda, zona industrial..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Tu nombre completo *</label>
                <input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="label">País *</label>
                <input type="text" value={form.country} readOnly className="input bg-gray-50" />
              </div>
            </div>

            <div>
              <label className="label">Email corporativo *</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" required />
            </div>

            <div>
              <label className="label">Contraseña *</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input" minLength={8} required />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-rose-500 to-purple-500 text-white py-3 rounded-full font-medium hover:from-rose-600 hover:to-purple-600 transition shadow-lg">
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 text-sm">
            ¿Ya tienes cuenta? <Link to="/login" className="text-rose-500 font-medium hover:underline">Iniciar Sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
