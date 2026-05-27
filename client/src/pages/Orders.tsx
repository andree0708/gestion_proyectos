import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi, shipmentApi, contractApi, reviewApi } from '../services/api';
import { useAuthStore } from '../hooks/useAuth';
import AppNav from '../components/AppNav';

export default function Orders() {
  const { organization } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [shipForm, setShipForm] = useState({ weightKg: '', volumeM3: '', pickupAddress: '', deliveryAddress: '', deliveryTerms: '' });
  const [shippingCalc, setShippingCalc] = useState<any>(null);
  const [rating, setRating] = useState({ orderId: '', value: 5, comment: '' });

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const { data } = await orderApi.getMyOrders();
      setOrders(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleTransit = async (order: any) => {
    if (!order.shipment) return;
    await shipmentApi.updateStatus(order.shipment.id, 'in_transit', 'En ruta');
    loadOrders();
  };

  const handleDelivery = async (orderId: string) => {
    await contractApi.confirmDelivery(orderId);
    loadOrders();
  };

  const updateShipment = async (order: any) => {
    if (!order.shipment) return;
    const cost = shippingCalc?.total;
    await shipmentApi.update(order.shipment.id, {
      weightKg: parseFloat(shipForm.weightKg) || undefined,
      volumeM3: parseFloat(shipForm.volumeM3) || undefined,
      pickupAddress: shipForm.pickupAddress,
      deliveryAddress: shipForm.deliveryAddress,
      deliveryTerms: shipForm.deliveryTerms,
      shippingCost: cost,
    });
    loadOrders();
    alert('Datos de envío actualizados');
  };

  const calcShipping = async () => {
    const { data } = await shipmentApi.calculate({
      weightKg: parseFloat(shipForm.weightKg) || 0,
      volumeM3: parseFloat(shipForm.volumeM3) || 0,
    });
    setShippingCalc(data);
  };

  const submitReview = async (orderId: string) => {
    await reviewApi.create(orderId, { rating: rating.value, comment: rating.comment });
    alert('Calificación enviada');
    loadOrders();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-blue-100 text-blue-700',
      in_transit: 'bg-purple-100 text-purple-700', delivered: 'bg-emerald-100 text-emerald-700',
    };
    const labels: Record<string, string> = {
      pending: 'Pendiente', confirmed: 'Confirmado', in_transit: 'En tránsito', delivered: 'Entregado',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
  };

  const isSeller = (order: any) => order.sellerOrgId === organization?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <header className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-light">🌸 SubPro</Link>
            <AppNav active="orders" />
          </div>
          <Link to="/dashboard" className="text-sm opacity-80">← Dashboard</Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Pedidos y logística</h1>
        {loading ? <div className="flex justify-center py-20"><div className="animate-spin h-12 w-12 border-b-2 border-emerald-600 rounded-full" /></div> :
        orders.length === 0 ? <div className="card text-center py-16 text-gray-500">No hay pedidos</div> :
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{order.offer?.listing?.title} {getStatusBadge(order.status)}</h3>
                  <p className="text-sm text-gray-500">Total: ${Number(order.totalAmount).toLocaleString('es-CO')}</p>
                  {order.shipment?.trackingCode && <p className="text-xs text-emerald-600 mt-1">Tracking: {order.shipment.trackingCode}</p>}
                </div>
                <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="text-sm text-emerald-600">
                  {expanded === order.id ? 'Ocultar' : 'Detalle / Envío'}
                </button>
              </div>
              {expanded === order.id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {order.shipment?.deliveryTerms && (
                    <div className="bg-rose-50 p-3 rounded text-sm border border-rose-100">
                      <p><strong>Acuerdo de entrega:</strong> {order.shipment.deliveryTerms}</p>
                    </div>
                  )}
                  {order.shipment?.events?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Rastreo</p>
                      <ul className="text-xs space-y-1">
                        {order.shipment.events.map((ev: any) => (
                          <li key={ev.id} className="flex gap-2"><span className="text-emerald-600">●</span>{ev.status} {ev.location && `• ${ev.location}`} — {new Date(ev.timestamp).toLocaleString('es-CO')}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {isSeller(order) && order.status === 'confirmed' && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <input placeholder="Peso (kg)" value={shipForm.weightKg} onChange={e => setShipForm({ ...shipForm, weightKg: e.target.value })} className="border rounded p-2" />
                      <input placeholder="Volumen (m³)" value={shipForm.volumeM3} onChange={e => setShipForm({ ...shipForm, volumeM3: e.target.value })} className="border rounded p-2" />
                      <input placeholder="Dirección recogida" value={shipForm.pickupAddress} onChange={e => setShipForm({ ...shipForm, pickupAddress: e.target.value })} className="border rounded p-2 col-span-2" />
                      <input placeholder="Dirección entrega" value={shipForm.deliveryAddress} onChange={e => setShipForm({ ...shipForm, deliveryAddress: e.target.value })} className="border rounded p-2 col-span-2" />
                      <input placeholder="Términos de entrega" value={shipForm.deliveryTerms} onChange={e => setShipForm({ ...shipForm, deliveryTerms: e.target.value })} className="border rounded p-2 col-span-2" />
                      <button type="button" onClick={calcShipping} className="bg-gray-200 py-2 rounded">Calcular envío</button>
                      <button type="button" onClick={() => updateShipment(order)} className="bg-blue-600 text-white py-2 rounded">Guardar logística</button>
                      {shippingCalc && <p className="col-span-2 text-emerald-700">Costo estimado: ${shippingCalc.total?.toLocaleString('es-CO')} — {shippingCalc.estimatedDays} días</p>}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {isSeller(order) && order.status === 'confirmed' && (
                      <button onClick={() => handleTransit(order)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Marcar en tránsito</button>
                    )}
                    {!isSeller(order) && order.status === 'in_transit' && (
                      <button onClick={() => handleDelivery(order.id)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">Confirmar entrega</button>
                    )}
                    {order.status === 'delivered' && (
                      <div className="flex gap-2 items-center">
                        <select value={rating.value} onChange={e => setRating({ ...rating, value: +e.target.value, orderId: order.id })} className="border rounded p-1 text-sm">
                          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}
                        </select>
                        <button onClick={() => submitReview(order.id)} className="text-sm bg-amber-500 text-white px-3 py-1 rounded">Calificar</button>
                      </div>
                    )}
                    <Link to={`/messages?order=${order.id}`} className="text-sm text-emerald-600 self-center">Mensajes</Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>}
      </main>
    </div>
  );
}
