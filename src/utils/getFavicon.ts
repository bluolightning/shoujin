export default async function getFavicon() {
    try {
        const tabs = await browser.tabs.query({
            active: true,
            currentWindow: true,
        });
        if (tabs[0].favIconUrl) {
            return tabs[0].favIconUrl;
        } else {
            return 'undefined';
        }
    } catch (err: unknown) {
        console.error('Error getting tab URL:', err);
    }
}
