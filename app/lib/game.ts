export interface GuessResult {
  guess: number[];
  strikes: number;
  balls: number;
}

export function generateRandomNumber(): number[] {
  const digits: number[] = [];
  while (digits.length < 4) {
    const d = Math.floor(Math.random() * 10);
    if (!digits.includes(d)) digits.push(d);
  }
  return digits;
}

export function checkGuess(
  secret: number[],
  guess: number[],
): { strikes: number; balls: number } {
  let strikes = 0;
  let balls = 0;

  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      strikes++;
    } else if (secret.includes(guess[i])) {
      balls++;
    }
  }

  return { strikes, balls };
}

export function isValidGuess(digits: number[]): boolean {
  if (digits.length !== 4) return false;
  const unique = new Set(digits);
  return unique.size === 4 && digits.every((d) => d >= 0 && d <= 9);
}

export function formatResult(strikes: number, balls: number): string {
  if (strikes === 0 && balls === 0) return "아웃!";
  const parts: string[] = [];
  if (strikes > 0) parts.push(`${strikes}S`);
  if (balls > 0) parts.push(`${balls}B`);
  return parts.join(" ");
}
