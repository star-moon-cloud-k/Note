# 약수
약수(Divisor)는 어떤 수를 나누어떨어지게 하는 수를 의미

## ✅ 1. 개념 정리
> n의 약수는 n을 나누어 떨어지게 하는 정수<br>
> 예를 들어, 12의 약수를 구하면:<br>
> 12 ÷ 1 = 12 (O)<br>
> 12 ÷ 2 = 6 (O)<br>
> 12 ÷ 3 = 4 (O)<br>
> 12 ÷ 4 = 3 (O)<br>
> 12 ÷ 6 = 2 (O)<br>
> 12 ÷ 12 = 1 (O)<br>
> 약수: {1, 2, 3, 4, 6, 12}<br>


## ✅ 2. 약수 찾는 방법
###  📌 1) 1부터 N까지 나누기 (O(N))<br>
1부터 N까지 나누어보면서 나머지가 0이면 약수로 저장하는 방식

**비효율적 (O(N))** 이지만, 직관적으로 이해하기 쉬움

📌 코드 (파이썬)
```python
def find_divisors(n):
    divisors = []
    for i in range(1, n + 1):  # 1부터 N까지 나눠보기
        if n % i == 0:
            divisors.append(i)
             if i != n // i:  # 중복 방지
                result.append(n // i)  # 짝이 되는 약수 추가
    return divisors

print(find_divisors(12))  # [1, 2, 3, 4, 6, 12]
```
✔️ 단점: N이 크면 시간 초과 가능 <br>
✔️ 장점: 단순한 구현, 이해하기 쉬움 <br>

## 📌 2) 제곱근(√N) 이용한 최적화 (O(√N))
💡 약수는 쌍(pair)으로 존재한다
> 예를 들어 N=12라면:<br>
> (1, 12), (2, 6), (3, 4) 처럼 쌍을 이룸<br>
> 즉, √N까지만 검사하면 모든 약수를 찾을 수 있음<br>

📌 코드 (파이썬)
```python
import math

def find_divisors_optimized(n):
    divisors = set()
    for i in range(1, int(math.sqrt(n)) + 1):  # 1부터 √N까지만 검사
        if n % i == 0:
            divisors.add(i)        # 작은 약수 추가
            divisors.add(n // i)    # 큰 약수 추가
    return sorted(divisors)  # 정렬하여 반환

print(find_divisors_optimized(12))  # [1, 2, 3, 4, 6, 12]
```
✔️ 시간복잡도: O(√N)으로 훨씬 빠름<br>
✔️ 효율적: N이 커도 빠르게 약수를 찾을 수 있음

