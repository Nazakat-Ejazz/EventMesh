// generates keys for idempotency keys, order ids etc
export function generateId(): string {
  return crypto.randomUUID();
}

// convert dollars to cents for stripe/storage
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

// convert cents to dollars for stripe/storage
export function centsToDollars(cents: number): number {
  return cents / 100;
}

// dynamoDB TTL timestamp (Unix epoch in seconds). DynamoDB auto-deletes items when currentTime > this value.

export function createTtl(secondsFromNow: number = 300): number {
  return Math.floor(Date.now() / 1000) + secondsFromNow;
}

// format date storage for dynamoDB storage
export function nowIso(): string {
  return new Date().toISOString();
}

// sleep utility for retry logic with exponencial backoff
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// retry function with exponential backoff
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 100,
): Promise<T> {
  let lastError: Error;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const delay = baseDelayMs * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
  throw lastError!;
}
