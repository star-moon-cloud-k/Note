import java.util.*;

public class SieveOfEratosthenes {
  public static List<Integer> sieve(int n ){
    boolean[] isPrime = new boolean[n+1];
    Arrays.fill(isPrime, true);
    isPrime[0] = isPrime[1] = false;

    for(int i=2; i*i<=n ; i++){
      if(isPrime[i]){
        for(int j = i*i; j <=n; j+=i){
          isPrime[j] = false;
        }
      }
    }

    List<Integer> primes = new ArrayList<>();
    for(int i = 2;  i <= n ; i++){
      if(isPrime[i]){
        primes.add(i);
      }
    }
    return primes;
  }

  public static void main(String[] args){
    int n = 50;
    System.out.println(sieve(n));
  }
}