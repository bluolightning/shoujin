import getBaseUrl from './getBaseUrl';

export default async function getFavicon(
    url: string,
    useFaviconService: boolean
): Promise<string | undefined> {
    try {
        const tabs = await browser.tabs.query({
            active: true,
            currentWindow: true,
        });
        if (tabs[0].favIconUrl) {
            return tabs[0].favIconUrl;
        } else if (useFaviconService) {
            console.log('No favicon found, using Google favicon service.');
            return `https://www.google.com/s2/favicons?domain=${getBaseUrl(url)}&sz=128`;
        } else {
            return undefined;
        }
    } catch (err: unknown) {
        console.error('Error getting tab URL:', err, '\n errored site info:', url);
        return undefined;
    }
}
