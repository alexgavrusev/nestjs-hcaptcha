// NOTE: swc config reading inspired by https://github.com/nrwl/nx/blob/06717de5903b3007523be70e38e99a0333239ce1/packages/vite/jest.config.ts
import { defineConfig } from 'vitest/config';
import fs from 'fs';

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import swc from 'unplugin-swc';

// Reading the SWC compilation config and remove the "exclude"
// for the test files to be compiled by SWC
const { exclude: _, ...swcVitestConfig } = JSON.parse(
  fs.readFileSync(`${__dirname}/.swcrc`, 'utf-8')
);

// disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves.
// If we do not disable this, SWC Core will read .swcrc and won't transform our test files due to "exclude"
if (swcVitestConfig.swcrc === undefined) {
  swcVitestConfig.swcrc = false;
}

export default defineConfig({
  root: __dirname,
  cacheDir: './node_modules/.vite/.',

  plugins: [nxViteTsPaths(), swc.vite(swcVitestConfig)],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  test: {
    globals: true,
    cache: { dir: './node_modules/.vitest' },
    environment: 'node',
    reporters: ['default'],
    coverage: {
      reporter: ['html'],
      reportsDirectory: './coverage/nestjs-hcaptcha',
      provider: 'v8',
    },
  },
});
