export function findArrayByKey(obj: any, targetKey: string): any[] {
    if (obj && typeof obj === "object") {
        for (const key in obj) {
            const value = obj[key];

            if (key === targetKey && Array.isArray(value)) {
                return value;
            }

            if (typeof value === "object") {
                const found = findArrayByKey(value, targetKey);
                if (found) return found;
            }
        }
    }

    return [];
}
