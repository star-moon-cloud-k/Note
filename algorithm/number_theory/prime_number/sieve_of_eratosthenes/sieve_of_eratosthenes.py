#!/usr/bin/python3

def sieve_of_eratosthenes(n):
  #n까지의 모든 숫자를 소수라고 가정하고 True로 설정
  is_prime = [True] * (n+1)
  is_prime[0] = is_prime[1] = False # 0 과 1은 소수가 아님

  for i in range(2 , int(n**0.5) +1): #2부터 루트 N 까지 검사
    if is_prime[i]:   #i가 소수라면
      for j in range(i*i, n +1, i):   #i의 배수들을 False 처리
        is_prime[j] = False

  #소수 리스트 생성
  primes = [i for i in range(n+1) if is_prime[i]]
  return primes

n = 50
print(sieve_of_eratosthenes(n))