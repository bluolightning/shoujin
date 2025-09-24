import {defineConfig} from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    browser: 'chrome',
    modules: ['@wxt-dev/module-react', '@wxt-dev/auto-icons'],
    srcDir: 'src',

    manifest: {
        permissions: ['tabs', 'storage', 'idle', 'activeTab', 'notifications'],
    },
});
