import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TextLink } from "./text-link";

describe("TextLink", () => {
  it("renders a native anchor for an in-page link and keeps its attributes", () => {
    const html = renderToStaticMarkup(
      <TextLink
        href="#rights"
        aria-label="Jump to your rights"
        prefetch={false}
      >
        Your rights
      </TextLink>,
    );
    expect(html).toMatch(/^<a /);
    expect(html).toContain('href="#rights"');
    expect(html).toContain('aria-label="Jump to your rights"');
    expect(html).not.toContain("prefetch");
  });
});
