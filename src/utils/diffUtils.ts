import * as Diff from 'diff';
import { Change, DiffStats, DiffMode } from '../types';

export function getDiff(
  textA: string,
  textB: string,
  mode: DiffMode,
  ignoreCase: boolean = false
): Change[] {
  // Safe defaults if empty
  const a = textA || '';
  const b = textB || '';

  const options: any = { ignoreCase };

  switch (mode) {
    case 'chars':
      return Diff.diffChars(a, b, options) as Change[];
    case 'lines':
      return Diff.diffLines(a, b, options) as Change[];
    case 'words':
    default:
      // diffWordsWithSpace is generally much better for preserving paragraph layouts and indentations
      return Diff.diffWordsWithSpace(a, b, options) as Change[];
  }
}

export function calculateStats(changes: Change[], textA: string, textB: string): DiffStats {
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;

  changes.forEach((change) => {
    // Count exact character changes for precise similarity
    const length = change.value.length;
    if (change.added) {
      additions += length;
    } else if (change.removed) {
      deletions += length;
    } else {
      unchanged += length;
    }
  });

  const totalLength = unchanged + additions + deletions;
  const similarityPercentage = totalLength > 0 
    ? Math.round((unchanged / (unchanged + (additions + deletions) / 2)) * 100) 
    : 100;

  // Simple word counters
  const countWords = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  };

  return {
    additions,
    deletions,
    unchanged,
    similarityPercentage: Math.min(100, Math.max(0, similarityPercentage)),
    totalWordsA: countWords(textA),
    totalWordsB: countWords(textB),
  };
}
