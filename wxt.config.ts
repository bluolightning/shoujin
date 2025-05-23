import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    browser: 'chrome',
    modules: ['@wxt-dev/module-react'],
    srcDir: 'src',

    manifest: {
        permissions: ['tabs', 'storage', 'idle'],
        host_permissions: ['https://developer.chrome.com/*'],
    },
});
