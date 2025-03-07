#!/usr/bin/python3

N, K = map(int, input().split())
arr = []  # 약수를 저장할 리스트

for i in range(1, N + 1):  # 1부터 N까지 순회
    if N % i == 0:  # i가 N의 약수라면
        arr.append(i)  # 리스트에 추가

if K <= len(arr):  # K번째 약수가 존재하는지 확인
    print(arr[K - 1])  # 1-based index이므로 K-1 사용
else:
    print(0)  # K번째 약수가 없으면 0 출력
