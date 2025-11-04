export function logInfo(msg: string, data?: Record<string, unknown>) {
  console.log(JSON.stringify({ level: 'info', msg, ...(data || {}) }));
}

export function logError(msg: string, data?: Record<string, unknown>) {
  console.error(JSON.stringify({ level: 'error', msg, ...(data || {}) }));
}
