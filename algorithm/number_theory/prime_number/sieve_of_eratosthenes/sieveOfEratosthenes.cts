function sieveOfEratosthenes(n: number) {
  let isPrime: boolean[] = Array(n + 1).fill(true);
  isPrime[0] = isPrime[1] = false;

  for (let i = 2; i * i <= n; i++) {
    if (isPrime[i]) {
      for (let j = i * i; j <= n + 1; j += i) {
        isPrime[j] = false;
      }
    }
  }
  return isPrime
    .map((prime, index) => (prime ? index : -1))
    .filter((num) => num !== -1);
}

console.log(sieveOfEratosthenes(50));
