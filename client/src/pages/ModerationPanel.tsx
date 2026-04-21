import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { moderationApi, kybApi } from '../services/api';

interface PendingListing {
  id: string;
  title: string;
  quantity: number;
  unit: string;
  organization: { id: string; name: string; taxId: string };
  category: { name: string };
  createdAt: string;
}

interface PendingKyb {
  id: string;
  name: string;
  taxId: string;
  country: string;
  sector: string;
  createdAt: string;
}

export default function ModerationPanel() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<PendingListing[]>([]);
  const [kybRequests, setKybRequests] = useState<PendingKyb[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'kyb'>('listings');
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [listingsRes, kybRes] = await Promise.all([
        moderationApi.getPendingListings(),
        kybApi.getPending(),
      ]);
      setListings(listingsRes.data);
      setKybRequests(kybRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveListing = async (id: string) => {
    setLoading(true);
    try {
      await moderationApi.approveListing(id);
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectListing = async (id: string) => {
    if (!rejectReason.trim()) {
      alert('Por favor ingresa una razón de rechazo');
      return;
    }
    setLoading(true);
    try {
      await moderationApi.rejectListing(id, rejectReason);
      setListings(prev => prev.filter(l => l.id !== id));
      setRejectReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveKyb = async (orgId: string) => {
    setLoading(true);
    try {
      await kybApi.approve(orgId);
      setKybRequests(prev => prev.filter(k => k.id !== orgId));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectKyb = async (orgId: string) => {
    if (!rejectReason.trim()) {
      alert('Por favor ingresa una razón de rechazo');
      return;
    }
    setLoading(true);
    try {
      await kybApi.reject(orgId, rejectReason);
      setKybRequests(prev => prev.filter(k => k.id !== orgId));
      setRejectReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Panel de Moderación</h1>
          <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:underline">
            ← Volver al Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="flex border-b">
            <button
              className={`px-6 py-3 ${activeTab === 'listings' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}
              onClick={() => setActiveTab('listings')}
            >
              Listados Pendientes ({listings.length})
            </button>
            <button
              className={`px-6 py-3 ${activeTab === 'kyb' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}
              onClick={() => setActiveTab('kyb')}
            >
              KYB Pendientes ({kybRequests.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'listings' && (
              <div>
                {listings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay listados pendientes</p>
                ) : (
                  <div className="space-y-4">
                    {listings.map(listing => (
                      <div key={listing.id} className="border rounded p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{listing.title}</h3>
                            <p className="text-sm text-gray-600">
                              {listing.quantity} {listing.unit} • {listing.category.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Empresa: {listing.organization.name} ({listing.organization.taxId})
                            </p>
                            <p className="text-xs text-gray-400">
                              Creado: {new Date(listing.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveListing(listing.id)}
                              disabled={loading}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleRejectListing(listing.id)}
                              disabled={loading}
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              Rechazar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'kyb' && (
              <div>
                {kybRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay solicitudes KYB pendientes</p>
                ) : (
                  <div className="space-y-4">
                    {kybRequests.map(kyb => (
                      <div key={kyb.id} className="border rounded p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{kyb.name}</h3>
                            <p className="text-sm text-gray-600">NIT: {kyb.taxId}</p>
                            <p className="text-sm text-gray-600">País: {kyb.country} • Sector: {kyb.sector}</p>
                            <p className="text-xs text-gray-400">
                              Solicitud: {new Date(kyb.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveKyb(kyb.id)}
                              disabled={loading}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleRejectKyb(kyb.id)}
                              disabled={loading}
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              Rechazar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}