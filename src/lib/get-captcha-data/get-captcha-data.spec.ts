import { vi, describe, it, expect } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import type { ExecutionContext } from "@nestjs/common";

import { HcaptchaException } from "../hcaptcha.exception";
import { defaultGetCaptchaData } from "./get-captcha-data";

describe("defaultGetCaptchaData", () => {
  const createContext = (body: Record<string, unknown>) =>
    mockDeep<ExecutionContext>({
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: () => ({
          body,
        }),
      }),
    });

  it("should get token from `h-captcha-response` request.body field", () => {
    const token = "10000000-aaaa-bbbb-cccc-000000000001";

    const executionContext = createContext({
      "h-captcha-response": token,
    });

    expect(defaultGetCaptchaData(executionContext)).toEqual({
      token,
    });
  });

  it("should throw error when there is no `h-captcha-response` request.body field", () => {
    const executionContext = createContext({});

    expect(() => defaultGetCaptchaData(executionContext)).toThrowError(
      HcaptchaException,
    );
  });
});
