import { ConfigurableModuleBuilder, Module } from '@nestjs/common';

import { defaultGetCaptchaData } from '../get-captcha-data';
import {
  HcaptchaOptions,
  NormalizedHcaptchaOptions,
} from './hcaptcha-options.types';

const PROVIDED_HCAPTCHA_OPTIONS = Symbol('PROVIDED_HCAPTCHA_OPTIONS');

const NORMALIZED_HCAPTCHA_OPTIONS = Symbol('NORMALIZED_HCAPTCHA_OPTIONS');

const normalizeOptions = (
  options: HcaptchaOptions
): NormalizedHcaptchaOptions => ({
  getCaptchaData: defaultGetCaptchaData,
  ...options,
});

const {
  ASYNC_OPTIONS_TYPE: ASYNC_HCAPTCHA_OPTIONS_TYPE,
  ConfigurableModuleClass,
} = new ConfigurableModuleBuilder<HcaptchaOptions>({
  optionsInjectionToken: PROVIDED_HCAPTCHA_OPTIONS,
})
  .setClassMethodName('forRoot')
  .setExtras({}, (def) => ({
    ...def,
    global: true,
    providers: [
      ...def.providers,
      {
        provide: NORMALIZED_HCAPTCHA_OPTIONS,
        useFactory: normalizeOptions,
        inject: [PROVIDED_HCAPTCHA_OPTIONS],
      },
    ],
    exports: [NORMALIZED_HCAPTCHA_OPTIONS],
  }))
  .build();

@Module({})
export class HcaptchaOptionsModule extends ConfigurableModuleClass {}

export type AsyncHcaptchaOptions = typeof ASYNC_HCAPTCHA_OPTIONS_TYPE;

export { NORMALIZED_HCAPTCHA_OPTIONS };
