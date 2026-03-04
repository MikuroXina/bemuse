import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { playwright } from "@vitest/browser-playwright";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills({
      include: ["buffer", "crypto", "os", "path", "stream", "util"],
      protocolImports: true,
    }),
    {
      name: "vite-plugin-node-polyfills:shims-resolver",
      resolveId(source) {
        const res =
          /^vite-plugin-node-polyfills\/shims\/(?<shim>buffer|global|process)/.exec(
            source,
          );
        if (res && res.groups) {
          const { shim } = res.groups;
          const id = require
            .resolve(`vite-plugin-node-polyfills/shims/${shim}`)
            .replace("file://", "");
          return {
            id,
            external: false,
          };
        }
        return null;
      },
    },
    svelte(),
  ],
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
    dynamicImportVarsOptions: {
      errorWhenNoFilesFound: true,
    },
  },
  optimizeDeps: {
    include: [
      "lodash",
      "vite-plugin-node-polyfills/shims/buffer",
      "vite-plugin-node-polyfills/shims/global",
      "vite-plugin-node-polyfills/shims/process",
      "@ui5/webcomponents/dist/Button",
      "@ui5/webcomponents/dist/BusyIndicator",
      "@ui5/webcomponents/dist/Card",
      "@ui5/webcomponents/dist/CardHeader",
      "@ui5/webcomponents/dist/DatePicker",
      "@ui5/webcomponents/dist/Dialog",
      "@ui5/webcomponents/dist/Input",
      "@ui5/webcomponents/dist/MessageStrip",
      "@ui5/webcomponents/dist/Option",
      "@ui5/webcomponents/dist/Select",
      "@ui5/webcomponents/dist/TabContainer",
      "@ui5/webcomponents/dist/Tab",
      "@ui5/webcomponents/dist/Table",
      "@ui5/webcomponents/dist/TableColumn",
      "@ui5/webcomponents/dist/TableRow",
      "@ui5/webcomponents/dist/TableCell",
      "@ui5/webcomponents/dist/TextArea",
      "@ui5/webcomponents/dist/Tree",
      "@ui5/webcomponents/dist/TreeItem",
      "@ui5/webcomponents-fiori/dist/Bar",
      "@ui5/webcomponents-fiori/dist/ProductSwitch",
      "@ui5/webcomponents-fiori/dist/ProductSwitchItem",
      "@ui5/webcomponents-fiori/dist/ShellBar",
      "@ui5/webcomponents-fiori/dist/illustrations/NoData",
      "@ui5/webcomponents-fiori/dist/IllustratedMessage",
      "@ui5/webcomponents-icons/dist/AllIcons",
      "axios",
      "memoize-one",
      "idb-keyval",
      "markdown-it",
      "minimatch",
      "chroma-js",
    ],
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
