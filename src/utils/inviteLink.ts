export function buildInviteLink(code: string): string {
  const base = import.meta.env.VITE_PUBLIC_URL ?? window.location.origin;
  return `${base}/join?code=${encodeURIComponent(code)}`;
}
