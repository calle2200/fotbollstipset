/** Färgkodning per grupp så grupperna får varsin neonton (från bildens palett). */
const palette = [
  { text: "text-cyan", bg: "bg-cyan/15", dot: "bg-cyan" },
  { text: "text-violet", bg: "bg-violet/15", dot: "bg-violet" },
  { text: "text-orange", bg: "bg-orange/15", dot: "bg-orange" },
  { text: "text-pink", bg: "bg-pink/15", dot: "bg-pink" },
  { text: "text-blue", bg: "bg-blue/15", dot: "bg-blue" },
  { text: "text-mint", bg: "bg-mint/15", dot: "bg-mint" },
  { text: "text-brand", bg: "bg-brand/15", dot: "bg-brand" },
  { text: "text-gold", bg: "bg-gold/15", dot: "bg-gold" },
];

export function groupColor(group: string) {
  const idx = (group.toUpperCase().charCodeAt(0) - 65) % palette.length;
  return palette[(idx + palette.length) % palette.length];
}
