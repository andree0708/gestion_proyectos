import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log('Login: Starting with', email);
    
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Tiempo de espera agotado. Intenta de nuevo.');
      console.log('Login: Timeout');
    }, 10000);
    
    try {
      console.log('Login: Calling auth store...');
      await login(email, password);
      console.log('Login: Got response');
      clearTimeout(timeoutId);
      setLoading(false);
      console.log('Login: Navigating to dashboard');
      navigate('/dashboard');
    } catch (err: any) {
      console.log('Login: Error caught', err);
      clearTimeout(timeoutId);
      setLoading(false);
      let msg = 'Credenciales inválidas';
      if (err) {
        msg = err.response?.data?.error || err.data?.error || err.message || err.toString() || msg;
      }
      console.log('Login: Error message:', msg);
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl font-light text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-500">
            🌸 SubPro
          </Link>
          <p className="text-gray-500 mt-2">Subproductos Alimenticios</p>
        </div>
        
        <div className="card border-0 shadow-2xl">
          <h2 className="text-2xl font-light text-gray-800 mb-6">Bienvenida</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="tu@empresa.com"
                required
              />
            </div>
            
            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="********"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-500 to-purple-500 text-white py-3 rounded-full font-medium hover:from-rose-600 hover:to-purple-600 transition shadow-lg"
            >
              {loading ? 'Entrando...' : 'Iniciar Sesión'}
            </button>
          </form>
          
          <p className="mt-6 text-center text-gray-500">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-rose-500 font-medium hover:underline">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
