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
): { ok: boolean; reason?: string } {
  const transit = estimateTransitDays(listing.originDepartment, buyerDepartment);
  let allowed = listing.allowedDepartments?.filter(Boolean) ?? [];

  if (
    (listing.logisticsType === 'perishable' || listing.logisticsType === 'refrigerated') &&
    allowed.length === 0 &&
    listing.originDepartment
  ) {
    allowed = [listing.originDepartment];
  }

  if (buyerDepartment && allowed.length > 0 && !allowed.includes(buyerDepartment)) {
    return {
      ok: false,
      reason: `Entrega solo disponible en: ${allowed.join(', ')}.`,
    };
  }

  if (listing.logisticsType === 'perishable' || listing.logisticsType === 'refrigerated') {
    const shelf = listing.shelfLifeDays ?? 5;
    if (transit + 2 > shelf) {
      return {
        ok: false,
        reason: `Producto perecedero (${shelf} días). Tránsito estimado ${transit} días no es viable.`,
      };
    }
  }

  return { ok: true };
}
