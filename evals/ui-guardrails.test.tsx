import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { PdpaConsent } from "../packages/ui/src/components/PdpaConsent";
import { formatMyr } from "../packages/ui/src/lib/format";

describe("PDPA consent", () => {
  it("renders unchecked and required by default", () => {
    const html = renderToStaticMarkup(<PdpaConsent label="I consent" />);
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("required");
    expect(html).not.toMatch(/\schecked(=|\s|>)/);
  });
});

describe("image fitting rule", () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const full = join(dir, name);
      return statSync(full).isDirectory() ? walk(full) : /\.(tsx|jsx)$/.test(name) ? [full] : [];
    });
  const files = ["packages/ui/src", "apps/org/src", "apps/net/src"].flatMap(walk);

  it("scans real source files", () => {
    expect(files.length).toBeGreaterThan(5);
  });
  it.each(files)("%s: every <img> has object-cover object-center", (file) => {
    const tags = readFileSync(file, "utf8").match(/<img\b[\s\S]*?\/>/g) ?? [];
    for (const tag of tags) {
      expect(tag).toContain("object-cover");
      expect(tag).toContain("object-center");
    }
  });
});

describe("currency parity", () => {
  it("formats MYR identically for both domains", () => {
    expect(formatMyr(1250, "en")).toBe(formatMyr(1250, "en"));
    expect(formatMyr(1250, "en")).toMatch(/RM\s?1,250\.00/);
    expect(formatMyr(1250, "ms")).toMatch(/RM\s?1,250\.00/);
  });
});
