export function getOrgStatusLabel(kybStatus?: string): string {
  switch (kybStatus) {
    case 'approved':
      return 'Empresa activa';
    case 'rejected':
      return 'Cuenta suspendida';
    default:
      return 'En verificación';
  }
}

export function getOrgStatusClasses(kybStatus?: string): string {
  switch (kybStatus) {
    case 'approved':
      return 'bg-emerald-100 text-emerald-800';
    case 'rejected':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-amber-100 text-amber-800';
  }
}
