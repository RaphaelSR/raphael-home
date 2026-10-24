import { createHash } from "node:crypto";
import { config } from "../src/admin/config.js";

export const ownerEmail = "owner@example.com";

export async function mockOwnerAccount(page) {
  const fingerprint = createHash("sha256").update(ownerEmail).digest("hex");
  await page.route("**/assets/*.js", async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replaceAll(
      config.ownerEmailHash,
      fingerprint,
    );
    await route.fulfill({ response, body });
  });
}
