import getBaseUrl from './getBaseUrl';

export default function getFavicon(
    url: string,
    tabFavIconUrl: string | undefined,
    useFaviconService: boolean
): string | undefined {
    if (tabFavIconUrl) {
        return tabFavIconUrl;
    } else if (useFaviconService) {
        console.log('No favicon found, using Google favicon service.');
        return `https://www.google.com/s2/favicons?domain=${getBaseUrl(url)}&sz=128`;
    } else {
        return undefined;
    }
}
