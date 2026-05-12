import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { paymentApi } from '../services/api';

interface Payment {
  id: string;
  amount: number;
  status: string;
  currency: string;
  createdAt: string;
  order: {
    totalAmount: number;
    status: string;
    offer: { listing: { title: string } };
    buyer: { name: string };
    seller: { name: string };
  };
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bankAccount, setBankAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm] = useState({ bankName: '', accountType: 'checking', accountNumber: '', accountHolder: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [paymentsRes, bankRes] = await Promise.all([
        paymentApi.getMy(),
        paymentApi.getBankAccount(),
      ]);
      setPayments(paymentsRes.data);
      setBankAccount(bankRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paymentApi.saveBankAccount(bankForm);
      setShowBankForm(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al guardar cuenta');
    }
  };

  const handleProcessPayment = async (paymentId: string) => {
    try {
      await paymentApi.processPayment(paymentId, 'pm_simulated');
      alert('Pago procesado exitosamente');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al procesar pago');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      paid: 'bg-emerald-100 text-emerald-700',
      failed: 'bg-red-100 text-red-600',
    };
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      paid: 'Pagado',
      failed: 'Fallido',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
  };

  const totalReceived = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-bold">SubPro Exchange</Link>
            <nav className="hidden md:flex gap-4 ml-8">
              <Link to="/dashboard" className="hover:text-white/80">Dashboard</Link>
              <Link to="/payments" className="font-medium">Pagos</Link>
              <Link to="/disputes" className="hover:text-white/80">Disputas</Link>
            </nav>
          </div>
          <Link to="/dashboard" className="text-sm opacity-80">← Volver</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pagos y Facturación</h1>
            <p className="text-gray-500">Gestiona tus transacciones y cuentas bancarias</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
            <p className="text-sm text-emerald-600">Total recibido</p>
            <p className="text-2xl font-bold text-emerald-600">${totalReceived.toLocaleString('es-CO')}</p>
          </div>
          <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <p className="text-sm text-amber-600">Pendiente por cobrar</p>
            <p className="text-2xl font-bold text-amber-600">${totalPending.toLocaleString('es-CO')}</p>
          </div>
          <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <p className="text-sm text-blue-600">Cuentas registradas</p>
            <p className="text-2xl font-bold text-blue-600">{bankAccount?.bankName ? '1' : '0'}</p>
          </div>
        </div>

        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Cuenta Bancaria</h2>
            <button onClick={() => setShowBankForm(!showBankForm)} className="text-emerald-600 hover:underline text-sm">
              {bankAccount?.bankName ? 'Editar' : 'Agregar cuenta'}
            </button>
          </div>
          {bankAccount?.bankName ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{bankAccount.bankName}</p>
              <p className="text-sm text-gray-500">{bankAccount.accountType === 'checking' ? 'Cuenta corriente' : 'Cuenta de ahorro'} • ****{bankAccount.accountNumber.slice(-4)}</p>
              <p className="text-sm text-gray-500">Titular: {bankAccount.accountHolder}</p>
              <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${bankAccount.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {bankAccount.verified ? '✓ Verificada' : 'Pendiente de verificación'}
              </span>
            </div>
          ) : showBankForm ? (
            <form onSubmit={handleSaveBank} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nombre del banco</label>
                  <input value={bankForm.bankName} onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })} className="w-full p-2 border rounded" placeholder="Banco de Bogotá" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tipo de cuenta</label>
                  <select value={bankForm.accountType} onChange={e => setBankForm({ ...bankForm, accountType: e.target.value })} className="w-full p-2 border rounded">
                    <option value="checking">Corriente</option>
                    <option value="savings">Ahorros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Número de cuenta</label>
                  <input value={bankForm.accountNumber} onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })} className="w-full p-2 border rounded" placeholder="1234567890" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Titular</label>
                  <input value={bankForm.accountHolder} onChange={e => setBankForm({ ...bankForm, accountHolder: e.target.value })} className="w-full p-2 border rounded" placeholder="Nombre completo" required />
                </div>
              </div>
              <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">Guardar cuenta</button>
            </form>
          ) : (
            <p className="text-gray-500">No tienes cuenta bancaria registrada</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Historial de Pagos</h2>
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>
          ) : payments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay pagos registrados</p>
          ) : (
            <div className="space-y-4">
              {payments.map(payment => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{payment.order?.offer?.listing?.title}</p>
                    <p className="text-sm text-gray-500">
                      {payment.order?.buyer?.name} → {payment.order?.seller?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${Number(payment.amount).toLocaleString('es-CO')}</p>
                    {getStatusBadge(payment.status)}
                    {payment.status === 'pending' && (
                      <button onClick={() => handleProcessPayment(payment.id)} className="mt-2 text-sm bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700">
                        Simular pago
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}