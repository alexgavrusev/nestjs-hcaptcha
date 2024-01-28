import { Injectable, Inject } from '@nestjs/common';
import { verify } from 'hcaptcha';

import { NORMALIZED_HCAPTCHA_OPTIONS } from './options';
import type { NormalizedHcaptchaOptions } from './options';
import { HcaptchaException } from './hcaptcha.exception';
import { VerifyResponse } from './typings';

@Injectable()
export class HcaptchaService {
  constructor(
    @Inject(NORMALIZED_HCAPTCHA_OPTIONS)
    private readonly options: NormalizedHcaptchaOptions
  ) {}

  async verifyCaptcha(token: string, remoteip?: string) {
    let verifyResponse: VerifyResponse;

    try {
      verifyResponse = await verify(
        this.options.secret,
        token,
        remoteip,
        this.options.sitekey
      );
    } catch (e) {
      throw new HcaptchaException(e);
    }

    const { success } = verifyResponse;

    if (!success) {
      throw new HcaptchaException(verifyResponse);
    }

    return verifyResponse;
  }
}
