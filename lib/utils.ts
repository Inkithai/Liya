import { clsx, type ClassValue } from"clsx";
import { twMerge } from"tailwind-merge";

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

export function formatLkr(value?: number | string | null, currency ="LKR") {
 const amount = typeof value ==="string" ? Number(value.replace(/[^0-9.]/g,"")) : value;
 if (!Number.isFinite(amount ?? NaN)) return"Price on request";
 try {
 return new Intl.NumberFormat("en-LK", { style:"currency", currency, maximumFractionDigits: 0 }).format(amount as number);
 } catch {
 return `LKR ${Math.round(amount as number).toLocaleString("en-LK")}`;
 }
}

export function sleep(ms: number) {
 return new Promise((resolve) => setTimeout(resolve, ms));
}

export function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
 return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined && value !== null && value !=="")) as Partial<T>;
}

export function initials(name: string) {
 return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") ||"L";
}
