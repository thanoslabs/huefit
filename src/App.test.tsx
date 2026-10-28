import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import App from "./App";

describe("HueFit app shell", () => {
  it("renders a privacy-first landing page", () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("Find the shades");
    expect(html).toContain("No accounts");
  });
});
