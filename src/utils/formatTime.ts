// Helper function to format seconds into a readable string (e.g., 1h 23m 45s)

export default function formatTime(totalSeconds: number, includeSeconds: boolean): string {
    if (totalSeconds < 1) return '<1s'; // Handle case where totalSeconds is less than 1 second

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (includeSeconds && (seconds > 0 || (hours === 0 && minutes === 0))) result += `${seconds}s`;

    return result.trim();
}
