export function pickFields<T extends Record<string, any>>(obj: T, fields?: string[]): Partial<T> {
    if (!fields || fields.length === 0) return obj;
    const out: Partial<T> = {};
    for (const f of fields) if (f in obj) (out as any)[f] = obj[f];
    return out;
}