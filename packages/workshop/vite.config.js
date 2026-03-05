import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import { playwright } from "@vitest/browser-playwright";
import tsconfigPaths from "vite-tsconfig-paths";

// @ts-check
export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  build: {
    dynamicImportVarsOptions: {
      errorWhenNoFilesFound: true,
    },
  },
  optimizeDeps: {
    include: [
      "lodash",
      "@ui5/webcomponents-react/Bar",
      "@ui5/webcomponents-react/Button",
      "@ui5/webcomponents-react/BusyIndicator",
      "@ui5/webcomponents-react/Card",
      "@ui5/webcomponents-react/CardHeader",
      "@ui5/webcomponents-react/DatePicker",
      "@ui5/webcomponents-react/Dialog",
      "@ui5/webcomponents-react/IllustratedMessage",
      "@ui5/webcomponents-react/Input",
      "@ui5/webcomponents-react/Label",
      "@ui5/webcomponents-react/List",
      "@ui5/webcomponents-react/ListItemStandard",
      "@ui5/webcomponents-react/MessageStrip",
      "@ui5/webcomponents-react/Option",
      "@ui5/webcomponents-react/ProductSwitch",
      "@ui5/webcomponents-react/ProductSwitchItem",
      "@ui5/webcomponents-react/Select",
      "@ui5/webcomponents-react/ShellBar",
      "@ui5/webcomponents-react/TabContainer",
      "@ui5/webcomponents-react/Tab",
      "@ui5/webcomponents-react/Table",
      "@ui5/webcomponents-react/TableHeaderRow",
      "@ui5/webcomponents-react/TableHeaderCell",
      "@ui5/webcomponents-react/TableRow",
      "@ui5/webcomponents-react/TableCell",
      "@ui5/webcomponents-react/TextArea",
      "@ui5/webcomponents-react/ThemeProvider",
      "@ui5/webcomponents-react/Tree",
      "@ui5/webcomponents-react/TreeItem",
      "@ui5/webcomponents-fiori/dist/ProductSwitch",
      "@ui5/webcomponents-fiori/dist/ProductSwitchItem",
      "@ui5/webcomponents-fiori/dist/ShellBar",
      "@ui5/webcomponents-fiori/dist/illustrations/NoData",
      "@ui5/webcomponents-fiori/dist/IllustratedMessage",
      "@ui5/webcomponents-icons/dist/AllIcons",
      "@ui5/webcomponents-icons/dist/save.js",
      "axios",
      "memoize-one",
      "markdown-it",
      "minimatch",
      "chroma-js",
      "valibot",
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
