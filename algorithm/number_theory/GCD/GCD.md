# 최대공약수

## 개념
**최대공약수(GCD, Greatest Common Divisor)** 는 두 개 이상의 정수에서 공통된 약수 중 가장 큰 값

예를 들어, 12와 18의 약수를 찾아보면:

> 12의 약수: {1, 2, 3, 4, 6, 12} <br>
> 18의 약수: {1, 2, 3, 6, 9, 18} <br>
> 공통된 약수: {1, 2, 3, 6}<br>
> 최대공약수(GCD) = 6<br>
> 공식:<br>
> 두 수 a, b의 GCD는 다음과 같이 정의됨.<br>
> GCD(a,b) = max(공통된 약수)<br>

## 최대공약수 찾는 법
### 약수 나열해서 찾기 O(N)
비효율적, 

단순하게 두 수의 약수를 나열하고 공통된 값 중 가장 큰 값을 찾는 방법
```python
def gcd_naive(a, b):
    gcd = 1
    for i in range(1, min(a, b) + 1):  # 1부터 작은 값까지 반복
        if a % i == 0 and b % i == 0:  # 공통된 약수 찾기
            gcd = i
    return gcd

print(gcd_naive(12, 18))  # 6
```
✔️ 단점: O(N)으로 비효율적 → a, b가 크면 시간 초과 위험

### 유클리드 호제법 (O(logN))
빠르게 최대공약수를 구하는 알고리즘
유클리드 호제법
- GCD(a,b) == GCD(b, a%b)
  - 나머지를 계속 구하면서 b가 0이 될 때 까지 반복
  - `b == 0`이 되면 a가 최대 공약수

> 예제: GCD(48, 18) 구하기 <br>
> GCD(48, 18) → 48 % 18 = 12<br>
> GCD(18, 12) → 18 % 12 = 6<br>
> GCD(12, 6) → 12 % 6 = 0<br>
> GCD(6, 0) → 답은 **6**

```python
def gcd(a, b):
    while b != 0:
        a, b = b, a % b  # a를 b로 바꾸고, b를 a % b로 변경
    return a

print(gcd(48, 18))  # 6
```
✔️ 시간복잡도: O(log N) <br>
✔️ 장점: 매우 빠르고 간단한 알고리즘


## 최대공약수와 최소공배수의 관계

a × b = GCD(a, b) × LCM(a, b)

즉, 최소공배수(LCM)를 구하려면 최대공약수(GCD)를 먼저 구해야 함!

```python
def lcm(a, b):
    return (a * b) // gcd(a, b)

print(lcm(12, 18))  # 36
```
