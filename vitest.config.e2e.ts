import { mergeConfig } from 'vitest/config';

import vitestConfigShared from './vitest.config.shared';

export default mergeConfig(vitestConfigShared, {
  test: {
    include: ['e2e/**/*.e2e-spec.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      reportsDirectory: './coverage/nestjs-hcaptcha-e2e',
    },
  },
});
