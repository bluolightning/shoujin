export default function getBaseUrl(fullUrl: string): string {
    try {
        const url = new URL(fullUrl);
        return `${url.protocol}//${url.hostname}`;
    } catch {
        return fullUrl; // fallback if invalid URL
    }
}
