import { describe, expect, it } from "vitest";

import { slugify } from "./slugify";

describe("slugify", () => {
  it.each([
    ["Alicante/Alacant", "alicante-alacant"],
    ["L'Hospitalet de Llobregat", "l-hospitalet-de-llobregat"],
    ["  Coruña, A  ", "coruna-a"],
    ["Piso en Málaga — 15% anual", "piso-en-malaga-15-anual"],
  ])("%s → %s", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });
});
