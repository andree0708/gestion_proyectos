import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { messageApi } from '../services/api';
import { useAuthStore } from '../hooks/useAuth';
import AppNav from '../components/AppNav';

export default function Messages() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messageApi.getMy().then(r => setConversations(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const openConversation = async (conv: any) => {
    setSelected(conv);
    const { data } = await messageApi.getByOrder(conv.orderId);
    setMessages(data.messages || []);
    setSelected({ ...conv, id: data.id });
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected?.id || !text.trim()) return;
    await messageApi.send(selected.id, text);
    setText('');
    const { data } = await messageApi.getByOrder(selected.orderId);
    setMessages(data.messages || []);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <header className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-light">🌸 SubPro</Link>
            <AppNav active="messages" />
          </div>
          <Link to="/dashboard" className="text-sm opacity-80">← Dashboard</Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="card grid md:grid-cols-3 min-h-[500px] overflow-hidden">
          <div className="border-r overflow-y-auto max-h-[500px]">
            {loading ? <p className="p-4 text-gray-500">Cargando...</p> : conversations.length === 0 ? (
              <p className="p-4 text-gray-500">Sin conversaciones. Aparecen al aceptar una oferta.</p>
            ) : conversations.map(c => (
              <button key={c.id} onClick={() => openConversation(c)} className={`w-full text-left p-4 border-b hover:bg-gray-50 ${selected?.id === c.id ? 'bg-emerald-50' : ''}`}>
                <p className="font-medium text-sm">{c.order?.offer?.listing?.title}</p>
                <p className="text-xs text-gray-500">{c.order?.buyer?.name} ↔ {c.order?.seller?.name}</p>
              </button>
            ))}
          </div>
          <div className="md:col-span-2 flex flex-col">
            {selected ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[400px]">
                  {messages.map(m => (
                    <div key={m.id} className={`p-2 rounded-lg text-sm max-w-[80%] ${m.senderId === user?.id ? 'bg-emerald-100 ml-auto' : 'bg-gray-100'}`}>
                      {m.content}
                      <p className="text-xs text-gray-400 mt-1">{new Date(m.createdAt).toLocaleString('es-CO')}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={send} className="p-4 border-t flex gap-2">
                  <input value={text} onChange={e => setText(e.target.value)} className="flex-1 border rounded-lg p-2 text-sm" placeholder="Escribe un mensaje..." />
                  <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm">Enviar</button>
                </form>
              </>
            ) : (
              <p className="p-8 text-gray-400 text-center">Selecciona una conversación</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
