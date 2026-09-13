// Shared placeholder-identity helpers (gradient + initials) — used anywhere
// a character/form needs a visual without licensed artwork (Design System
// §20/§58). Centralized so the Battle Page and the Tier List Builder render
// the same character the same way.

const GRADIENTS: [string, string][] = [
  ["#22D07A", "#0f6b3d"],
  ["#7C5CFF", "#3d2b8f"],
  ["#F5B942", "#8a611f"],
  ["#5C9DFF", "#264a8f"],
];

export function gradientFor(id: string): [string, string] {
  const idx = id.charCodeAt(0) % GRADIENTS.length;
  return GRADIENTS[idx];
}

export function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}
