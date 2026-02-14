import crypto from "crypto";

jest.mock("../../src/services/payment.service", () => ({}));
jest.mock("../../src/dal/auth.dal", () => ({}));

import { isValidPaystackSignature } from "../../src/controllers/payment.controller";

describe("Paystack webhook signature", () => {
  it("validates a correct signature", () => {
    const secret = "test_secret";
    const rawBody = JSON.stringify({
      event: "charge.success",
      data: { reference: "REF-123" },
    });
    const signature = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    expect(isValidPaystackSignature(rawBody, signature, secret)).toBe(true);
  });

  it("rejects an invalid signature", () => {
    const secret = "test_secret";
    const rawBody = JSON.stringify({
      event: "charge.success",
      data: { reference: "REF-123" },
    });

    expect(isValidPaystackSignature(rawBody, "invalid-signature", secret)).toBe(
      false,
    );
  });
});
