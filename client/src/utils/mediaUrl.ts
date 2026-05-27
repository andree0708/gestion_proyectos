/**
 * Normaliza URLs de archivos en `/uploads` para que carguen en desarrollo (Vite en :5173
 * con proxy) y no dependan del host donde se subió el archivo.
 */
export function uploadsSrc(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/')) return trimmed;
  try {
    const u = new URL(trimmed);
    if (u.pathname.startsWith('/uploads')) return u.pathname + u.search;
    return trimmed;
  } catch {
    return trimmed;
  }
}
