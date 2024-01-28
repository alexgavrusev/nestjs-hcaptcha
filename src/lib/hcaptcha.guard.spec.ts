import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';

import { HcaptchaGuard } from './hcaptcha.guard';
import { HcaptchaService } from './hcaptcha.service';
import { NormalizedHcaptchaOptions } from './options';
import { defaultGetCaptchaData } from './get-captcha-data';
import { ExecutionContext } from '@nestjs/common';
import { HcaptchaException } from './hcaptcha.exception';

describe('HcaptchaGuard', () => {
  let executionContext: DeepMockProxy<ExecutionContext>;
  let guard: HcaptchaGuard;
  let service: DeepMockProxy<HcaptchaService>;
  let options: NormalizedHcaptchaOptions;

  beforeEach(() => {
    executionContext = mockDeep<ExecutionContext>();

    options = {
      secret: 'secret',
      getCaptchaData: defaultGetCaptchaData,
    };

    service = mockDeep<HcaptchaService>();

    guard = new HcaptchaGuard(options, service);
  });

  it('should return true if service returns a successful response', async () => {
    vi.spyOn(options, 'getCaptchaData').mockReturnValue({ token: 'token' });
    service.verifyCaptcha.mockResolvedValue({ success: true });

    const result = await guard.canActivate(executionContext);

    expect(result).toBe(true);
  });

  it('should call service with token and remoteip', async () => {
    const token = 'token';
    const remoteip = 'remoteip';

    vi.spyOn(options, 'getCaptchaData').mockReturnValue({ token, remoteip });
    service.verifyCaptcha.mockResolvedValue({ success: true });

    await guard.canActivate(executionContext);

    expect(service.verifyCaptcha).toHaveBeenCalledOnce();
    expect(service.verifyCaptcha).toHaveBeenCalledWith(token, remoteip);
  });

  it('should throw error if getCaptchaData throws', async () => {
    const error = new HcaptchaException(new Error('getCaptchaData error'));

    vi.spyOn(options, 'getCaptchaData').mockImplementation(() => {
      throw error;
    });

    await expect(guard.canActivate(executionContext)).rejects.toEqual(error);
  });

  it('should throw error if service throws', async () => {
    const error = new HcaptchaException(new Error('service error'));

    vi.spyOn(options, 'getCaptchaData').mockReturnValue({ token: 'token' });

    service.verifyCaptcha.mockRejectedValue(error);

    await expect(guard.canActivate(executionContext)).rejects.toEqual(error);
  });
});
