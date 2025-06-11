export default function formatUrl(url: string) {
    // Check if the URL is empty - occurs on about:blank or local files
    if (url === '') {
        return 'Local Files';
    }

    // Remove protocol (http:// or https://) and www. from the URL
    const cleanUrl = url.replace(/^(?:https?:\/\/)?(?:www\.)?/, '');
    return cleanUrl;
}
