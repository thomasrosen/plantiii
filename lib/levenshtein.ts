/**
 * Berechnet die Levenshtein-Distanz zwischen zwei Strings
 * @param a Erster String
 * @param b Zweiter String
 * @returns Die Levenshtein-Distanz (niedrigere Werte = ähnlicher)
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const matrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null))

  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = i
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[j][0] = j
  }

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator, // substitution
      )
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Berechnet einen Ähnlichkeitsscore basierend auf der Levenshtein-Distanz
 * @param query Suchbegriff
 * @param target Zielstring
 * @returns Score zwischen 0 und 1 (1 = perfekte Übereinstimmung)
 */
export function calculateSimilarity(query: string, target: string): number {
  if (!query.trim()) return 1 // Wenn keine Suche, alle gleich relevant

  const normalizedQuery = query.toLowerCase().trim()
  const normalizedTarget = target.toLowerCase().trim()

  // Exakte Übereinstimmung
  if (normalizedTarget.includes(normalizedQuery)) {
    return 1
  }

  const distance = levenshteinDistance(normalizedQuery, normalizedTarget)
  const maxLength = Math.max(normalizedQuery.length, normalizedTarget.length)

  // Score zwischen 0 und 1, wobei 1 die beste Übereinstimmung ist
  return Math.max(0, 1 - distance / maxLength)
}
