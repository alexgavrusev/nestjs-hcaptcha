import { mergeConfig } from "vitest/config";
import swc from "unplugin-swc";

import vitestConfig from "./vitest.config";

export default mergeConfig(vitestConfig, {
  test: {
    include: ["e2e/**/*.e2e-spec.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    coverage: {
      reportsDirectory: "./coverage/nestjs-hcaptcha-e2e",
    },
  },
  // https://github.com/vitest-dev/vitest/discussions/3320#discussioncomment-5841661
  plugins: [swc.vite()],
});
