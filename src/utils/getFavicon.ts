export default async function getFavicon(url: string) {
    try {
        const tabs = await browser.tabs.query({
            active: true,
            currentWindow: true,
        });
        if (tabs[0].favIconUrl) {
            return tabs[0].favIconUrl;
        } else {
            return `https://www.google.com/s2/favicons?domain=${url}&sz=128`;
        }
    } catch (err: unknown) {
        console.error('Error getting tab URL:', err);
    }
}
