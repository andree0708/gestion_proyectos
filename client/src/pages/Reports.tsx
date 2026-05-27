import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../services/api';

export default function Reports() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getStats().then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const download = async (type: 'csv' | 'pdf') => {
    const api = type === 'csv' ? analyticsApi.exportCsv : analyticsApi.exportPdf;
    const { data } = await api();
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'csv' ? 'ordenes-subpro.csv' : 'reporte-subpro.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <header className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
          <Link to="/dashboard" className="text-2xl font-light">🌸 SubPro</Link>
          <Link to="/dashboard" className="text-sm opacity-80">← Dashboard</Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Reportes y Analytics</h1>
        <p className="text-gray-500 mb-1">Órdenes, ingresos cobrados, pendientes de pago, listados y disputas de tu organización.</p>
        <p className="text-gray-400 text-sm mb-8">Incluye exportación de órdenes (CSV / HTML) para análisis o contabilidad.</p>
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin h-12 w-12 border-b-2 border-emerald-600 rounded-full" /></div>
        ) : stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Órdenes totales', value: stats.totalOrders, color: 'emerald' },
              { label: 'Ingresos', value: `$${Number(stats.totalRevenue).toLocaleString('es-CO')}`, color: 'blue' },
              { label: 'Pendiente cobro', value: `$${Number(stats.pendingPayments).toLocaleString('es-CO')}`, color: 'amber' },
              { label: 'Calificación', value: `${stats.averageRating} ★ (${stats.reviewCount})`, color: 'purple' },
              { label: 'Listados', value: stats.totalListings, color: 'cyan' },
              { label: 'Activas', value: stats.activeOrders, color: 'indigo' },
              { label: 'Entregadas', value: stats.deliveredOrders, color: 'teal' },
              { label: 'Disputas', value: stats.openDisputes, color: 'red' },
            ].map(s => (
              <div key={s.label} className="card p-4 text-center">
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}
        <div className="card p-6 flex gap-4">
          <button onClick={() => download('csv')} className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700">
            Exportar Excel (CSV)
          </button>
          <button onClick={() => download('pdf')} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Exportar PDF (HTML)
          </button>
        </div>
      </main>
    </div>
  );
}
