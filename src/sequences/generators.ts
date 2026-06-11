// src/sequences/generators.ts

export function fibonacci(count: number): number[] {
  const seq = [0, 1];
  for (let i = 2; i < count; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq.slice(0, count);
}

export function primes(count: number): number[] {
  const result: number[] = [];
  let n = 2;
  while (result.length < count) {
    if (isPrime(n)) result.push(n);
    n++;
  }
  return result;
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

export function recaman(count: number): number[] {
  const seq = [0];
  const seen = new Set([0]);
  for (let i = 1; i < count; i++) {
    const back = seq[i - 1] - i;
    if (back > 0 && !seen.has(back)) {
      seq.push(back);
    } else {
      seq.push(seq[i - 1] + i);
    }
    seen.add(seq[i]);
  }
  return seq;
}

export function collatzLength(n: number): number {
  let steps = 0;
  while (n !== 1) {
    n = n % 2 === 0 ? n / 2 : 3 * n + 1;
    steps++;
  }
  return steps;
}

export function collatzLengths(count: number): number[] {
  return Array.from({ length: count }, (_, i) => collatzLength(i + 1));
}

export function collatzSequence(start: number): number[] {
  const seq = [start];
  while (start !== 1 && seq.length < 500) {
    start = start % 2 === 0 ? start / 2 : 3 * start + 1;
    seq.push(start);
  }
  return seq;
}

export function pascalRow(n: number): number[] {
  const row = [1];
  for (let k = 1; k <= n; k++) {
    row.push(row[k - 1] * (n - k + 1) / k);
  }
  return row;
}

export function pascalTriangleMod(rows: number, mod: number): number[][] {
  const triangle: number[][] = [];
  for (let n = 0; n < rows; n++) {
    triangle.push(pascalRow(n).map((v) => v % mod));
  }
  return triangle;
}

const PI_DIGITS_STR =
  "31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679" +
  "82148086513282306647093844609550582231725359408128481117450284102701938521105559644622948954930381964" +
  "42881097566593344612847564823378678316527120190914564856692346034861045432664821339360726024914127372" +
  "45870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330" +
  "57270365759591953092186117381932611793105118548074462379962749567351885752724891227938183011949129833";

export function piDigits(count: number): number[] {
  return PI_DIGITS_STR.slice(0, count).split("").map(Number);
}

export function triangularNumbers(count: number): number[] {
  return Array.from({ length: count }, (_, i) => (i * (i + 1)) / 2);
}

export function isPrimeCheck(n: number): boolean {
  return isPrime(n);
}

export function ulamSpiralCoords(count: number): { x: number; y: number; n: number; prime: boolean }[] {
  const coords: { x: number; y: number; n: number; prime: boolean }[] = [];
  let x = 0, y = 0;
  let dx = 1, dy = 0;
  let stepsInDir = 1, stepsTaken = 0, turnsInSize = 0;

  for (let n = 1; n <= count; n++) {
    coords.push({ x, y, n, prime: isPrime(n) });
    x += dx;
    y += dy;
    stepsTaken++;
    if (stepsTaken === stepsInDir) {
      stepsTaken = 0;
      [dx, dy] = [-dy, dx];
      turnsInSize++;
      if (turnsInSize === 2) {
        turnsInSize = 0;
        stepsInDir++;
      }
    }
  }
  return coords;
}
