import { DynamicModule, Module } from '@nestjs/common';

import {
  HcaptchaOptionsModule,
  HcaptchaOptions,
  AsyncHcaptchaOptions,
} from './options';
import { HcaptchaService } from './hcaptcha.service';

@Module({
  providers: [HcaptchaService],
  exports: [HcaptchaService],
})
export class HcaptchaModule {
  static forRoot(options: HcaptchaOptions): DynamicModule {
    return {
      module: this,
      imports: [HcaptchaOptionsModule.forRoot(options)],
    };
  }

  static forRootAsync(options: AsyncHcaptchaOptions): DynamicModule {
    return {
      module: this,
      imports: [HcaptchaOptionsModule.forRootAsync(options)],
    };
  }
}
