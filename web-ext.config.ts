import { defineWebExtConfig } from 'wxt';

export default defineWebExtConfig({
    binaries: {
        chrome: 'C:/Users/Public/chrome-win64/chrome.exe', // Use the path to Chrome for Testing (download at https://googlechromelabs.github.io/chrome-for-testing/)
    },
});
