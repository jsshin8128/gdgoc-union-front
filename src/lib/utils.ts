import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPerformingSchedule(dates: string[]): string {
  if (dates.length === 0) return "";
  if (dates.length === 1) {
    return format(new Date(dates[0]), "MM.dd (E)");
  }
  const firstDate = format(new Date(dates[0]), "MM.dd");
  const lastDate = format(new Date(dates[dates.length - 1]), "MM.dd (E)");
  return `${firstDate} - ${lastDate}`;
}

export function formatDateTime(dateString: string): string {
  try {
    return format(new Date(dateString), "MM.dd (E) HH:mm");
  } catch {
    return dateString;
  }
}

export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}

export const getTicketVendor = (url: string): string | null => {
  if (!url) return null;
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes("ticket.yes24.com")) return "YES24 티켓";
    if (hostname.includes("interpark.com")) return "NOL 티켓";
    if (hostname.includes("ticket.melon.com")) return "멜론 티켓";
    return null; // 모르는 URL의 경우 null 반환
  } catch { 
    return null; // 에러 발생 시 null 반환
  }
};
