# 최대공배수

## 개념
**최소공배수(LCM)** 는 두 수의 공통된 배수 중에서 가장 작은 값

>예를 들어, 12와 18의 배수를 나열해보면:<br>
> 12의 배수: {12, 24, 36, 48, 60, ...}<br>
> 18의 배수: {18, 36, 54, 72, 90, ...}<br>
> 공통된 배수: {36, 72, 108, ...}<br>
> 최소공배수(LCM) = 36<br>
> 공식:<br>
> 두 수 a, b의 LCM은 다음과 같이 정의됨.<br>

> LCM(a,b) = min(공통된 배수)

## 최소공배수 구하는 방법
### ✅ 배수를 나열해서 찾기 O(N)
단순하게 두 수의 배수를 나열하고 공통된 값 중 가장 작은 값을 찾는 방법.

📌 코드 (파이썬)

```python
def lcm_naive(a, b):
    max_num = max(a, b)
    while True:
        if max_num % a == 0 and max_num % b == 0:  # 공통 배수 찾기
            return max_num
        max_num += 1  # 배수를 하나씩 증가

print(lcm_naive(12, 18))  # 36
```
✔️ 시간복잡도: O(N), 매우 비효율적<br>
✔️ 비효율적: a, b가 크면 너무 오래 걸림<br>
✔️ 언제 사용? → 작은 수에 대해서만 사용 가능<br>

### ✅ 최대공약수(GCD) 활용 (O(log N))
최소공배수 LCM과 최대공약수 GCD의 관계

> LCM(a,b) = a*b / GCD(a,b)

즉 `최대공약수를 구한 후, 최소공배수를 계산하면 훨씬 빠르게 구할 수 있다.`

```python
def gcd(a, b):
    while b:
        a, b = b, a % b  # 유클리드 호제법
    return a

def lcm(a, b):
    return (a * b) // gcd(a, b)  # GCD를 이용하여 LCM 계산

print(lcm(12, 18))  # 36
```
✔️ 시간복잡도: O(log N), 매우 빠름
✔️ 가장 효율적인 방법 → 코딩테스트에서 필수!
✔️ 언제 사용? → a, b가 매우 클 때도 사용 가능

### ✅ 3. 최소공배수 응용
📌 여러 개의 수에 대한 최소공배수
만약 LCM(12, 18, 24)처럼 여러 개의 수의 LCM을 구해야 한다면?

LCM(12, 18)을 구한 후
그 값과 24의 LCM을 구하면 됨!
📌 코드 (파이썬)

```python
from functools import reduce

def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

def lcm(a, b):
    return (a * b) // gcd(a, b)

def lcm_multiple(numbers):
    return reduce(lcm, numbers)

print(lcm_multiple([12, 18, 24]))  # 72
```

✔️ 여러 개의 숫자의 LCM을 **reduce()** 를 이용해서 계산할 수 있음<br>
✔️ 시간복잡도: O(N log N)<br>

```python
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

def lcm(a, b):
    return (a * b) // gcd(a, b)

def lcm_multiple(numbers):
    result = numbers[0]  # 첫 번째 값으로 초기화
    for num in numbers[1:]:  # 두 번째 값부터 하나씩 LCM 계산
        result = lcm(result, num)
    return result

numbers = [12, 18, 24]
print(lcm_multiple(numbers))  # 72
```
