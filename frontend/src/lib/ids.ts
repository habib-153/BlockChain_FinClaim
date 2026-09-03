function nextSequential(ids: string[], prefix: string, pad: number): string {
  const year = new Date().getFullYear();
  const usedNumbers = ids
    .filter((id) => id.startsWith(`${prefix}-${year}-`))
    .map((id) => Number(id.split("-").pop()))
    .filter((n) => !Number.isNaN(n));
  const next = (usedNumbers.length ? Math.max(...usedNumbers) : 0) + 1;
  return `${prefix}-${year}-${String(next).padStart(pad, "0")}`;
}

export function nextReceivableId(existingIds: string[]): string {
  return nextSequential(existingIds, "RCV", 5);
}

export function nextClaimId(existingIds: string[]): string {
  return nextSequential(existingIds, "CLM", 5);
}

export function nextFlagId(existingIds: string[]): string {
  return nextSequential(existingIds, "FLAG", 4);
}

export function nextEventId(existingIds: string[]): string {
  const usedNumbers = existingIds
    .map((id) => Number(id.split("-").pop()))
    .filter((n) => !Number.isNaN(n));
  const next = (usedNumbers.length ? Math.max(...usedNumbers) : 0) + 1;
  return `EVT-${String(next).padStart(5, "0")}`;
}
