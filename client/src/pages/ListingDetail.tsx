import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listingApi } from '../services/api';
import { Listing } from '../types/listing';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      listingApi.getById(id)
        .then(r => setListing(r.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="p-8">Cargando...</div>;
  if (!listing) return <div className="p-8">Listado no encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link to="/catalog" className="text-blue-600 hover:underline">← Volver al catálogo</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="grid md:grid-cols-2 gap-8 p-6">
            <div>
              {listing.photos?.length > 0 ? (
                <div className="space-y-2">
                  <img
                    src={listing.photos[0]}
                    alt={listing.title}
                    className="w-full h-80 object-cover rounded-lg"
                  />
                  <div className="flex gap-2">
                    {listing.photos.slice(1).map((photo, i) => (
                      <img key={i} src={photo} alt="" className="w-20 h-20 object-cover rounded" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Sin imágenes</span>
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
              <p className="text-lg text-gray-600 mb-4">{listing.category?.name}</p>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Cantidad:</span>
                    <p className="font-medium">{listing.quantity} {listing.unit}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Precio:</span>
                    <p className="font-medium">
                      {listing.priceType === 'fixed' && listing.priceAmount
                        ? `$${listing.priceAmount.toLocaleString('es-CO')} COP`
                        : 'A negociar'}
                    </p>
                  </div>
                </div>
              </div>

              {listing.description && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Descripción</h3>
                  <p className="text-gray-700">{listing.description}</p>
                </div>
              )}

              {listing.attributes && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Atributos técnicos</h3>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {Object.entries(listing.attributes as Record<string, any>).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-500">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Vendedor</h3>
                <p className="text-sm">{listing.organization?.name}</p>
                <p className="text-sm text-gray-500">{listing.organization?.country}</p>
                <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                  listing.organization?.kybStatus === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {listing.organization?.kybStatus === 'approved' ? 'Verificado' : 'Pendiente de verificación'}
                </span>
              </div>

              <div className="mt-6">
                <Link
                  to="/login"
                  className="block text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                >
                  Iniciar sesión para enviar oferta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}