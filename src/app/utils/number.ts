export function parseNumber(value: unknown, defaultValue: number = null) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? defaultValue : parsed;
}
