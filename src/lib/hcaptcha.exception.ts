import { ForbiddenException } from '@nestjs/common';

export class HcaptchaException extends ForbiddenException {
  constructor(cause: unknown, message = 'Forbidden') {
    super(message, { cause });
  }
}
