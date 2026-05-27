import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminLogin } from '@/api';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token } = await adminLogin(email, password);
      sessionStorage.setItem('adminToken', token);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md mb-4">
        <Link to="/" className="flex items-center gap-2 text-on-surface-variant hover:text-primary-fixed transition-colors w-max text-sm font-semibold">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Volver al inicio
        </Link>
      </div>
      <div className="w-full max-w-md bg-surface-container-high p-8 rounded-2xl border border-outline-variant/20 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-headline-md font-black text-primary-container mb-2">BOFT ADMIN</h1>
          <p className="text-on-surface-variant text-sm">Ingresa tus credenciales para acceder</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-label-bold text-on-surface mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed transition-all"
              placeholder="admin@boftcolombia.com"
              required
            />
          </div>
          <div>
            <label className="block text-label-bold text-on-surface mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-error text-sm font-semibold">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-fixed text-on-primary-fixed py-3 rounded-xl font-bold hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
