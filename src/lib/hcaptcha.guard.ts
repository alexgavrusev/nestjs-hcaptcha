import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
} from "@nestjs/common";

import { NORMALIZED_HCAPTCHA_OPTIONS } from "./options";
import type { NormalizedHcaptchaOptions } from "./options";
import { HcaptchaService } from "./hcaptcha.service";

@Injectable()
export class HcaptchaGuard implements CanActivate {
  constructor(
    @Inject(NORMALIZED_HCAPTCHA_OPTIONS)
    private readonly options: NormalizedHcaptchaOptions,
    private readonly hcaptchaService: HcaptchaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { token, remoteip } = this.options.getCaptchaData(context);

    await this.hcaptchaService.verifyCaptcha(token, remoteip);

    return true;
  }
}
