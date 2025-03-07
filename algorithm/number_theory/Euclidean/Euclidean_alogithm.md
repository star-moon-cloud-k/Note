# 유클리드 호제법

유클리드 호제법은 두 수의 최대공약수(GCD)를 빠르게 구하는 알고리즘.<br>
반복적으로 나머지 연산을 이용하여 최대공약수를 구하는 방식으로, O(log N) 의 시간복잡도를 가짐.

## ✅ 1. 개념 정리
유클리드 호제법의 핵심 공식:

`GCD(a,b)=GCD(b, a mod b)`

즉, 큰 수에서 작은 수를 나눈 나머지를 계속해서 구하면, 결국 최대공약수가 됨.


> 🔹 예제: GCD(48, 18) 구하기
> GCD(48, 18)<br>
> → 48 % 18 = 12<br>
> → GCD(18, 12)<br>
> GCD(18, 12)<br>
> → 18 % 12 = 6<br>
> → GCD(12, 6)<br>
> GCD(12, 6)<br>
> → 12 % 6 = 0<br>
> → GCD(6, 0)<br>
> 정답: 6 (b가 0이 되면 남은 a가 GCD)


### ✅ 2. 유클리드 호제법 구현 (반복문, 재귀)
📌 반복문 방식 (O(log N))

```python
def gcd_iterative(a, b):
    while b != 0:
        a, b = b, a % b  # 나머지를 계속 계산
    return a

print(gcd_iterative(48, 18))  # 6
```
✔️ while문을 사용해 계속 a % b를 갱신<br>
✔️ b == 0이 되면 a가 최대공약수(GCD)<br>

📌 재귀 방식 (O(log N))

```python
def gcd_recursive(a, b):
    if b == 0:
        return a
    return gcd_recursive(b, a % b)

print(gcd_recursive(48, 18))  # 6
```
✔️ b == 0이면 a가 GCD<br>
✔️ 아니면 GCD(b, a % b)를 계속 호출<br>

### ✅ 3. 최소공배수(LCM)와의 관계
최소공배수(LCM, Least Common Multiple)는 최대공약수(GCD)와 다음 관계를 가짐:

`LCM(a,b) = a*b / GCD(a,b)`

즉, GCD를 구한 뒤 두 수의 곱을 GCD로 나누면 LCM을 구할 수 있음.


📌 코드 (파이썬)
```python
def lcm(a, b):
    return (a * b) // gcd_iterative(a, b)

print(lcm(12, 18))  # 36
```
✔️ 최대공약수를 먼저 구한 뒤 최소공배수를 계산

### ✅ 4. 확장 유클리드 알고리즘 (Extended Euclidean Algorithm)
확장 유클리드 알고리즘은 ax + by = GCD(a, b)의 해 (x, y)를 찾는 알고리즘
이 방법은 "정수론에서 모듈러 역원(Modular Inverse) 구하기" 등에 사용됨.

> 예를 들어, 30x + 20y = 10의 해 (x, y)를 구해보자. <br>
> 🔹 유클리드 호제법을 거꾸로 추적<br>
> GCD(30, 20) = GCD(20, 10) = 10<br>
> 10 = 30 - 1 × 20<br>
> 20 = 30 - 1 × 20 → 10 = (30 - 1 × 20)<br>
> 따라서 (x, y) = (1, -1)이 하나의 해가 됨.<br>

📌 확장 유클리드 알고리즘 코드

```python
def extended_gcd(a, b):
    if b == 0:
        return a, 1, 0
    gcd, x1, y1 = extended_gcd(b, a % b)
    x = y1
    y = x1 - (a // b) * y1
    return gcd, x, y

gcd, x, y = extended_gcd(30, 20)
print(f"GCD: {gcd}, x: {x}, y: {y}")  # GCD: 10, x: 1, y: -1
```


✔️ (x, y)는 방정식 30x + 20y = 10을 만족하는 정수 해
✔️ RSA 암호 알고리즘, 중국 나머지 정리(CRT) 등에서 사용

