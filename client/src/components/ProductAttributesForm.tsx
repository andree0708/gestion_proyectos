interface Props {
  attributes: Record<string, string>;
  onChange: (attrs: Record<string, string>) => void;
}

export default function ProductAttributesForm({ attributes, onChange }: Props) {
  const set = (key: string, value: string) => onChange({ ...attributes, [key]: value });

  return (
    <div className="card bg-slate-50 p-4 mb-4 space-y-4">
      <h4 className="font-medium text-gray-800">Atributos técnicos</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Humedad (%)</label>
          <input type="number" step="0.1" value={attributes.humedad || ''} onChange={e => set('humedad', e.target.value)} className="w-full p-2 border rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Granulometría (mm)</label>
          <input value={attributes.granulometria || ''} onChange={e => set('granulometria', e.target.value)} className="w-full p-2 border rounded text-sm" placeholder="Ej: 0-5" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fecha elaboración</label>
          <input type="date" value={attributes.fechaElaboracion || ''} onChange={e => set('fechaElaboracion', e.target.value)} className="w-full p-2 border rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Caducidad</label>
          <input type="date" value={attributes.caducidad || ''} onChange={e => set('caducidad', e.target.value)} className="w-full p-2 border rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Origen</label>
          <select value={attributes.origen || ''} onChange={e => set('origen', e.target.value)} className="w-full p-2 border rounded text-sm">
            <option value="">Seleccionar</option>
            <option value="industrial">Industrial</option>
            <option value="comercial">Comercial</option>
            <option value="agricola">Agrícola</option>
          </select>
        </div>
      </div>

      <div>
        <h5 className="text-sm font-medium text-gray-700 mb-2">Certificaciones</h5>
        <div className="grid grid-cols-2 gap-3">
          <input value={attributes.certSanidad || ''} onChange={e => set('certSanidad', e.target.value)} placeholder="Sanidad (INVICA, ICA...)" className="p-2 border rounded text-sm" />
          <input value={attributes.certAmbiental || ''} onChange={e => set('certAmbiental', e.target.value)} placeholder="Ambiental (ISO 14001...)" className="p-2 border rounded text-sm" />
        </div>
      </div>

      <div>
        <h5 className="text-sm font-medium text-gray-700 mb-2">Información nutricional</h5>
        <div className="grid grid-cols-3 gap-3">
          <input value={attributes.proteinas || ''} onChange={e => set('proteinas', e.target.value)} placeholder="Proteínas %" className="p-2 border rounded text-sm" />
          <input value={attributes.grasas || ''} onChange={e => set('grasas', e.target.value)} placeholder="Grasas %" className="p-2 border rounded text-sm" />
          <input value={attributes.carbohidratos || ''} onChange={e => set('carbohidratos', e.target.value)} placeholder="Carbohidratos %" className="p-2 border rounded text-sm" />
          <input value={attributes.fibra || ''} onChange={e => set('fibra', e.target.value)} placeholder="Fibra %" className="p-2 border rounded text-sm" />
          <input value={attributes.calorias || ''} onChange={e => set('calorias', e.target.value)} placeholder="Calorías / 100g" className="p-2 border rounded text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Notas adicionales</label>
        <textarea value={attributes.notas || ''} onChange={e => set('notas', e.target.value)} className="w-full p-2 border rounded text-sm" rows={2} />
      </div>
    </div>
  );
}
