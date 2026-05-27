export type LogisticsType = 'perishable' | 'refrigerated' | 'ambient';

export const LOGISTICS_LABELS: Record<LogisticsType, string> = {
  perishable: 'Perecedero',
  refrigerated: 'Refrigerado',
  ambient: 'Ambiente (estable)',
};

export const DELIVERY_MODE_LABELS: Record<string, string> = {
  pickup: 'Retiro en planta',
  buyer_transport: 'Transporte del comprador',
  seller_delivery: 'Entrega del vendedor',
};

export function estimateTransitDays(fromDept?: string | null, toDept?: string | null): number {
  if (!fromDept || !toDept) return 3;
  if (fromDept === toDept) return 1;
  return 3;
}

export function canDeliverTo(
  listing: {
    originDepartment?: string | null;
    logisticsType?: string | null;
    shelfLifeDays?: number | null;
    allowedDepartments?: string[] | null;
  },
  buyerDepartment?: string | null
): { ok: boolean; reason?: string; transitDays?: number } {
  const transit = estimateTransitDays(listing.originDepartment, buyerDepartment);
  const allowed = listing.allowedDepartments?.filter(Boolean) ?? [];

  if (buyerDepartment && allowed.length > 0 && !allowed.includes(buyerDepartment)) {
    return {
      ok: false,
      transitDays: transit,
      reason: `Este producto solo se entrega en: ${allowed.join(', ')}.`,
    };
  }

  const type = listing.logisticsType as LogisticsType | undefined;
  if (type === 'perishable' || type === 'refrigerated') {
    const shelf = listing.shelfLifeDays ?? 5;
    const margin = 2;
    if (transit + margin > shelf) {
      return {
        ok: false,
        transitDays: transit,
        reason: `Perecedero (${shelf} días de vida útil). El envío estimado (${transit} días) no es viable. Considera retiro en planta o mismo departamento.`,
      };
    }
  }

  return { ok: true, transitDays: transit };
}

export function logisticsBadge(type?: string | null): string {
  if (type === 'perishable') return '🧊 Perecedero';
  if (type === 'refrigerated') return '❄️ Refrigerado';
  return '📦 Estable';
}
