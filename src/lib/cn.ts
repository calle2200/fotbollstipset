/** Liten hjälpare för att slå ihop klassnamn (filtrerar bort falsy). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
