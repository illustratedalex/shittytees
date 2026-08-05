type LogMeta = Record<string, string | number | boolean | null | undefined>;

function redactEmail(email?: string): string | undefined {
  if (!email) return undefined;
  const [name, domain] = email.split('@');
  if (!domain || name.length < 2) return '[redacted-email]';
  return `${name[0]}***@${domain}`;
}

export function redactOrderMeta(meta: LogMeta & { customerEmail?: string }) {
  const { customerEmail, ...rest } = meta;
  return {
    ...rest,
    customerEmail: redactEmail(customerEmail),
  };
}

export function logOrderEvent(event: string, meta: LogMeta & { customerEmail?: string }) {
  console.log(JSON.stringify({ event, ...redactOrderMeta(meta) }));
}

export function logOrderError(event: string, meta: LogMeta & { customerEmail?: string; errorCode?: string }) {
  console.error(JSON.stringify({ event, ...redactOrderMeta(meta) }));
}
