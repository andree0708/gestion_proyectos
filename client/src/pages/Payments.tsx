import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { paymentApi } from '../services/api';
import AppNav from '../components/AppNav';

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
  const [showCardModal, setShowCardModal] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState({ number: '', holder: '', expiry: '', cvv: '' });
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success' | 'error'>('form');
  const [paymentResult, setPaymentResult] = useState('');

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

  const openCardModal = (paymentId: string) => {
    setPayingId(paymentId);
    setCardForm({ number: '', holder: '', expiry: '', cvv: '' });
    setCardErrors({});
    setPaymentStep('form');
    setPaymentResult('');
    setShowCardModal(true);
  };

  const validateCardForm = () => {
    const errors: Record<string, string> = {};
    const digits = cardForm.number.replace(/\s/g, '');
    if (digits.length < 13 || digits.length > 19) errors.number = 'Número de tarjeta inválido';
    if (!cardForm.holder.trim()) errors.holder = 'Nombre del titular requerido';
    const expParts = cardForm.expiry.split('/');
    if (expParts.length !== 2 || !expParts[0] || !expParts[1]) errors.expiry = 'Formato MM/AA requerido';
    if (cardForm.cvv.length < 3) errors.cvv = 'CVV inválido (3-4 dígitos)';
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingId || !validateCardForm()) return;
    setPaymentStep('processing');

    const steps = [
      { msg: 'Validando tarjeta...', delay: 400 },
      { msg: 'Autorizando pago...', delay: 600 },
    ];

    for (const s of steps) {
      setPaymentResult(s.msg);
      await new Promise(r => setTimeout(r, s.delay));
    }

    try {
      await paymentApi.processPayment(payingId, 'pm_credit_card');
      setPaymentStep('success');
      setPaymentResult('¡Pago exitoso!');
      setTimeout(() => {
        setShowCardModal(false);
        loadData();
      }, 1500);
    } catch (err: any) {
      setPaymentStep('error');
      setPaymentResult(err.response?.data?.error || 'Error al procesar pago');
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <header className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-light">🌸 SubPro</Link>
            <AppNav active="payments" />
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
                      <button onClick={() => openCardModal(payment.id)} className="mt-2 text-sm bg-gradient-to-r from-rose-500 to-purple-500 text-white px-4 py-2 rounded-full hover:from-rose-600 hover:to-purple-600 shadow-md">
                        💳 Pagar ahora
                      </button>
                    )}
                    {payment.status === 'paid' && (payment as any).invoice && (
                      <a href={paymentApi.getInvoicePdf(payment.id)} target="_blank" rel="noreferrer" className="mt-2 block text-sm text-blue-600 hover:underline">
                        📄 Factura {(payment as any).invoice.invoiceNumber}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
            {paymentStep === 'form' && (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Pagar con tarjeta</h2>
                <p className="text-sm text-gray-500 mb-4">Ingresa los datos de tu tarjeta de crédito</p>
                <form onSubmit={handleCardPayment} className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Número de tarjeta</label>
                    <input
                      value={cardForm.number}
                      onChange={e => setCardForm({ ...cardForm, number: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19) })}
                      className={`w-full p-3 border rounded-xl text-lg tracking-wider ${cardErrors.number ? 'border-red-400 bg-red-50' : ''}`}
                      placeholder="4242 4242 4242 4242"
                      required
                      maxLength={19}
                    />
                    {cardErrors.number && <p className="text-xs text-red-500 mt-1">{cardErrors.number}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Titular de la tarjeta</label>
                    <input
                      value={cardForm.holder}
                      onChange={e => setCardForm({ ...cardForm, holder: e.target.value.toUpperCase() })}
                      className={`w-full p-3 border rounded-xl ${cardErrors.holder ? 'border-red-400 bg-red-50' : ''}`}
                      placeholder="NOMBRE COMPLETO"
                      required
                    />
                    {cardErrors.holder && <p className="text-xs text-red-500 mt-1">{cardErrors.holder}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Fecha exp.</label>
                      <input
                        value={cardForm.expiry}
                        onChange={e => {
                          let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                          if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
                          setCardForm({ ...cardForm, expiry: v });
                        }}
                        className={`w-full p-3 border rounded-xl ${cardErrors.expiry ? 'border-red-400 bg-red-50' : ''}`}
                        placeholder="MM/AA"
                        required
                        maxLength={5}
                      />
                      {cardErrors.expiry && <p className="text-xs text-red-500 mt-1">{cardErrors.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">CVV</label>
                      <input
                        value={cardForm.cvv}
                        onChange={e => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        className={`w-full p-3 border rounded-xl ${cardErrors.cvv ? 'border-red-400 bg-red-50' : ''}`}
                        placeholder="123"
                        required
                        maxLength={4}
                        type="password"
                      />
                      {cardErrors.cvv && <p className="text-xs text-red-500 mt-1">{cardErrors.cvv}</p>}
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                    💡 Pago simulado — no se realizará un cobro real
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowCardModal(false)} className="flex-1 py-3 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50">
                      Cancelar
                    </button>
                    <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-purple-500 text-white rounded-full font-medium hover:from-rose-600 hover:to-purple-600">
                      Pagar ${payments.find(p => p.id === payingId)?.amount?.toLocaleString('es-CO') || ''}
                    </button>
                  </div>
                </form>
              </>
            )}
            {paymentStep === 'processing' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-800">{paymentResult}</p>
                <p className="text-sm text-gray-500 mt-2">No cierres esta ventana</p>
              </div>
            )}
            {paymentStep === 'success' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-bold text-emerald-700">{paymentResult}</p>
              </div>
            )}
            {paymentStep === 'error' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-red-700 mb-2">Error</p>
                <p className="text-sm text-gray-600 mb-4">{paymentResult}</p>
                <button onClick={openCardModal.bind(null, payingId!)} className="px-6 py-2 bg-gradient-to-r from-rose-500 to-purple-500 text-white rounded-full">
                  Intentar de nuevo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}