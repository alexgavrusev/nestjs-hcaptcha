import { mergeConfig } from 'vitest/config';

import vitestConfigShared from './vitest.config.shared';

export default mergeConfig(vitestConfigShared, {
  test: {
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
