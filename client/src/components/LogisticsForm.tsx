import { COLOMBIA_DEPARTMENTS } from '../data/colombiaDepartments';
import { DELIVERY_MODE_LABELS, LOGISTICS_LABELS, LogisticsType } from '../utils/logistics';

export interface LogisticsData {
  originDepartment: string;
  originCity: string;
  logisticsType: LogisticsType;
  shelfLifeDays: string;
  deliveryModes: string[];
  allowedDepartments: string[];
}

interface Props {
  value: LogisticsData;
  onChange: (v: LogisticsData) => void;
  defaultDepartment?: string;
  defaultCity?: string;
}

const MODES = ['pickup', 'buyer_transport', 'seller_delivery'];

export default function LogisticsForm({ value, onChange, defaultDepartment, defaultCity }: Props) {
  const set = (patch: Partial<LogisticsData>) => onChange({ ...value, ...patch });

  const toggleMode = (mode: string) => {
    const next = value.deliveryModes.includes(mode)
      ? value.deliveryModes.filter(m => m !== mode)
      : [...value.deliveryModes, mode];
    set({ deliveryModes: next });
  };

  const toggleDept = (dept: string) => {
    const next = value.allowedDepartments.includes(dept)
      ? value.allowedDepartments.filter(d => d !== dept)
      : [...value.allowedDepartments, dept];
    set({ allowedDepartments: next });
  };

  const isPerishable = value.logisticsType === 'perishable' || value.logisticsType === 'refrigerated';

  return (
    <div className="card bg-gradient-to-br from-rose-50/80 to-purple-50/50 border border-rose-100 p-4 space-y-4">
      <h4 className="font-medium text-gray-800">Logística y entrega</h4>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Departamento origen *</label>
          <select
            value={value.originDepartment || defaultDepartment || ''}
            onChange={e => set({ originDepartment: e.target.value })}
            className="input"
            required
          >
            <option value="">Seleccionar</option>
            {COLOMBIA_DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Ciudad / municipio *</label>
          <input
            value={value.originCity || defaultCity || ''}
            onChange={e => set({ originCity: e.target.value })}
            className="input"
            placeholder="Ej: Mosquera, Medellín"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Tipo de producto *</label>
          <select
            value={value.logisticsType}
            onChange={e => set({ logisticsType: e.target.value as LogisticsType })}
            className="input"
          >
            {(Object.keys(LOGISTICS_LABELS) as LogisticsType[]).map(t => (
              <option key={t} value={t}>{LOGISTICS_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Vida útil (días) {isPerishable ? '*' : ''}</label>
          <input
            type="number"
            min={1}
            value={value.shelfLifeDays}
            onChange={e => set({ shelfLifeDays: e.target.value })}
            className="input"
            placeholder={isPerishable ? 'Ej: 5' : 'Opcional'}
            required={isPerishable}
          />
        </div>
      </div>

      <div>
        <label className="label mb-2">Modos de entrega *</label>
        <div className="flex flex-wrap gap-2">
          {MODES.map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => toggleMode(mode)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                value.deliveryModes.includes(mode)
                  ? 'bg-gradient-to-r from-rose-500 to-purple-500 text-white border-transparent'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-rose-200'
              }`}
            >
              {DELIVERY_MODE_LABELS[mode]}
            </button>
          ))}
        </div>
      </div>

      {isPerishable && (
        <div>
          <label className="label mb-1">Departamentos donde puedes entregar</label>
          <p className="text-xs text-gray-500 mb-2">Si no seleccionas ninguno, solo mismo departamento de origen.</p>
          <div className="max-h-32 overflow-y-auto grid grid-cols-2 gap-1 text-sm">
            {COLOMBIA_DEPARTMENTS.map(d => (
              <label key={d} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.allowedDepartments.includes(d)}
                  onChange={() => toggleDept(d)}
                />
                <span className="truncate">{d}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
