# 6장. 악성 SQL문 튜닝으로 초보자 탈출하기
## 강의 목차 및 대상 SQL
- 튜닝을 위한 참고 및 사전 준비

## 기본키를 변형하는 나쁜 SQL
```sql
SELECT *
  FROM emp
 WHERE SUBSTRING(emp_id,1,4) = 1100
   AND LENGTH(emp_id) = 5

   -- 10 row(s) fetched - 0.096s
```
- 조건
  - emp의 PK 1번째 자리부터 4번째 자리까지의 값이 1100인 값.
  - emp PK 길이가 5자리수인 키

> 결국 앞의 자리 수부터 1100이면서 뒤에 값이 뭐가 나오든 5자리인 수<br>
> 그러니까 결국 11000 ~ 11009 까지의 값을 의미함.<br>
> 

#### explain 결과
___
|||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|
|id|select_type|`table`|partitions|`type`|possible_keys|`key`|key_len|`ref`|`rows`|filtered|Extra|
| 1 |	SIMPLE	|emp	|	NULL |  ALL	|	NULL| NULL | NULL| NULL| 299202	|100.0	|Using where |
___
중요한 것은 type이 ALL 이라는 점이다. 전체 rows 299202 약 30만개의 데이터에서 인덱스를 거치지 않고 full scan을 하게되어 결과를 뽑게 된다.


### 변경된 SQL
```sql
SELECT emp.EMP_ID , emp.BIRTH ,emp.FIRST_NAME ,emp.LAST_NAME ,emp.GENDER , emp.HIRE_DATE 
  FROM emp -- 300024
  where EMP_ID BETWEEN 11000 AND 11009
  
  -- 10 row(s) fetched - 0.003s
```
#### explain 결과
|||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|
|id|select_type|`table`|partitions|`type`|possible_keys|`key`|key_len|`ref`|`rows`|filtered|Extra|
|1|	SIMPLE	|e|	|	range|	PRIMARY|	PRIMARY|	4	||	10|	100.0|	Using where

같은 결과를 뽑더라도, type이 범위 탐색으로 변경되며, pk를 사용해서 탐색하게 되었다.
> key 값을 변형하지 않고, between 키워드를 사용해서 범위 지정만 하게 될 경우, PK를 사용하고 탐색할 범위도 확 좁아지게 된다.<br>
> 추가적으로 select 문에 필요한 컬럼을 정확하게 작성해 넣어서 더 최적화 할 수 있다.


## 불필요한 함수를 포함하는 나쁜 SQL
```sql
SELECT IFNULL(gender,'NO DATA') gender, 
       COUNT(1) count
  FROM emp
 GROUP BY IFNULL(gender,'NO DATA')
 -- 2 row(s) fetched - 0.116s (0.001s fetch)
```
- IFNULL을 활용해서 gender가 NULL인 경우 NO DATA로 뽑아낸다.
- group by 로 gender별로 모아서, 젠더 갯수를 세는 SQL 문이다.

#### explain 결과
___
|||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|
|id|select_type|`table`|partitions|`type`|possible_keys|`key`|key_len|`ref`|`rows`|filtered|Extra|
|1	|SIMPLE|	emp|	|	index|	I_GENDER_LAST_NAME|	I_GENDER_LAST_NAME	|51	|	|299202	|100.0	|Using index; Using temporary|
___
- I_GENDER_LAST_NAME index 중 gender만 사용해서 값을 불러온다. 
- Using index; 가 나오는 것으로 보아 covering index의 형태로 값이 출력이 가능하다.

```sql
-- tuning.EMP definition

CREATE TABLE `EMP` (
  `EMP_ID` int NOT NULL,
  `BIRTH` date NOT NULL,
  `FIRST_NAME` varchar(14) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `LAST_NAME` varchar(16) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `GENDER` enum('M','F') CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `HIRE_DATE` date NOT NULL,
  PRIMARY KEY (`EMP_ID`) USING BTREE,
  KEY `I_HIRE_DATE` (`HIRE_DATE`) USING BTREE,
  KEY `I_GENDER_LAST_NAME` (`GENDER`,`LAST_NAME`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
```

문제는 현재 EMP 테이블의 제약 조건을 보면 NOT NULL 이므로, IFNULL 함수를 굳이 고려할 필요가 없다.

```sql
 SELECT gender, 
       COUNT(1) count
  FROM emp
 GROUP BY gender
 
-- 2 row(s) fetched - 0.060s
```
#### explain 결과
___
|||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|
|id|select_type|`table`|partitions|`type`|possible_keys|`key`|key_len|`ref`|`rows`|filtered|Extra|
|1|	SIMPLE|	emp|	|	index|	I_GENDER_LAST_NAME|	I_GENDER_LAST_NAME|	51|	|	299202|	100.0	|Using index|

거의 유사한 결과가 보이지만, extra 부분을 보게되면, Using Temporary가 사라졌다. index로만 탐색을 하고, 임시 테이블을 만들지 않는다.

## 인덱스를 활용하지 못하는 나쁜 SQL
```sql
SELECT COUNT(*) count
  FROM salary
 WHERE is_yn = 1

-- 1 row(s) fetched - 0.239s
```
salary에서 is_yn이 1인 값의 카운트를 하는 SQL 문이다.


```sql
-- tuning.SALARY definition

CREATE TABLE `SALARY` (
  `EMP_ID` int NOT NULL,
  `ANNUAL_SALARY` int NOT NULL,
  `START_DATE` date NOT NULL,
  `END_DATE` date NOT NULL,
  `IS_YN` char(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '',
  PRIMARY KEY (`EMP_ID`,`START_DATE`),
  KEY `I_IS_YN` (`IS_YN`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3; 
```
하지만 데이터를 확인해보면 char 형식의 데이터를 사용하고 있음을 알 수 있다.
where 조건에서 정수값 1로 사용한 값을 , char '1'로 변경한다.

#### explain 결과
___
|||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|
|id|select_type|`table`|partitions|`type`|possible_keys|`key`|key_len|`ref`|`rows`|filtered|Extra|
|1|	SIMPLE|	salary|	|	index|I_IS_YN|	I_IS_YN|	4|	|	2838398|	10.0|	Using where; Using index|

실행 계획은 보면 PK를 사용하려고 하지만, filtered 데이터가 10% 밖에 안나온다. 스토리지 엔진에서 불러와서 90%를 DB 엔진이 다시 걸러내야하는것이다.
형 변환이 묵시적으로 이뤄지기 때문에, 형변환 처리 때문에 mysql 엔진에서 값을 불러와서 filtering을 처리하는 것이다.
그 이후 필터링을 통해 90%를 걸러내고 10%만 반환하게 되는 것 이다.

```sql
SELECT COUNT(*) count
  FROM salary
 WHERE is_yn = '1'

 -- 1 row(s) fetched - 0.015s
```
#### explain 결과
___
|||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|
|id|select_type|`table`|partitions|`type`|possible_keys|`key`|key_len|`ref`|`rows`|filtered|Extra|
|1|	SIMPLE|	salary|	|	ref|	I_IS_YN|	I_IS_YN|	4|	const|	82824	|100.0|	Using index|

이번에는 인덱스의 형을 정확히 맞춰줘서 작성하면, storage 엔진에서 정확하게 인덱스를 사용할 수 있게 되어, mysql 엔진에서 데이터를 filter를 하지 않아도 되는 것이다.
## FTS 방식으로 수행하는 나쁜 SQL
```sql
SELECT first_name, last_name
  FROM emp
 WHERE hire_date LIKE '1994%'
 -- 14835 row(s) fetched - 0.090s (0.002s fetch), on 2025-01-20 at 16:16:46
```
#### explain 결과
___
|||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|
|id|select_type|`table`|partitions|`type`|possible_keys|`key`|key_len|`ref`|`rows`|filtered|Extra|
|1|	SIMPLE|	emp|	|	ALL|	I_HIRE_DATE|	|	|	|	299202|	11.11|	Using where|

탐색 타입이 ALL 로 나오면서 전체 Full Table search 를 진행하게 된다.
굉장히 비효율적인 탐색을 진행한다.
또한 filtered 값이 11.11%로 값이 굉장히 적게 정리된다.

hire_date는 인덱스로 정리가 되어있는데 그를 제대로 활용하지 못하고 있는 사례이다.

`'HIRE_DATE' date NOT NULL,` date 형식으로 구분되고 있다.
데이터 형식이 'YYYY-MM-dd'형식으로 정리되어있다.

이 형식에 맞춰서 Between 구문을 사용해서 range 스캔으로 해결이 가능하다.

```sql
SELECT first_name, last_name
  FROM emp
 WHERE hire_date BETWEEN '1994-01-01' AND '1994-12-31';
 -- 14835 row(s) fetched - 0.044s (0.003s fetch), 
```
#### explain 결과
___
|||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|
|id|select_type|`table`|partitions|`type`|possible_keys|`key`|key_len|`ref`|`rows`|filtered|Extra|
|1|	SIMPLE|	emp|	|	range|	I_HIRE_DATE|	I_HIRE_DATE|	3|	|	28164|	100.0|	Using index condition|

range 탐색을 통해서 DB 탐색 범위가 줄어들고, filtered 값도 100%로 양호하게 처리되었다.

## 컬럼을 결합해서 사용하는 나쁜 SQL
```sql
 SELECT *
   FROM emp
  WHERE CONCAT(gender,' ',last_name) = 'M Radwan'
  -- 102 row(s) fetched - 0.098s
```

`gender`, `last_name` 컬럼의 값을 concat을 하였을 떄 M 이고 Radwan인 값을 찾으려고 한다.
문제는 gender와 last_name 은 인덱스로 사용하는 컬럼들이다.

정상적인 인덱스를 사용하고 싶을 때는 `인덱스에 함수를 사용하지 않는다.`


#### explain 결과
___
|||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|
|id|select_type|`table`|partitions|`type`|possible_keys|`key`|key_len|`ref`|`rows`|filtered|Extra|
|1|	SIMPLE|	emp|	|	ALL|	|		|	|	|299202	|100.0|	Using where|

탐색을 full table search 를 진행해서 굉장히 비효율적으로 동작하는 쿼리다.

gender와 last_name이 둘 다 인덱스를 사용하고 있다고 하니, 그 둘을 분리해서 where문을 적용하면 될 거로 판단된다.

```sql
SELECT *
   FROM emp
  WHERE gender = 'M' AND last_name = 'Radwan'
  -- 102 row(s) fetched - 0.006s,
```

#### explain 결과
___
|||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|
|id|select_type|`table`|partitions|`type`|possible_keys|`key`|key_len|`ref`|`rows`|filtered|Extra|
|1|	SIMPLE|	emp|	|	ref|	I_GENDER_LAST_NAME|	I_GENDER_LAST_NAME|	51|	const,const|	102|	100.0	|

데이터 접근 범위가 2개 이상인 유형인 ref로 변경되며, full table search 를 피하게 되었다.
결국 같은 값으로 검색을 하더라도 인덱스를 태워서 검색할 떄는 인덱스 컬럼에 함수를 합쳐서 사용하거나 하는 방식은 효율을 낮춘다.

## 습관적으로 중복을 제거하는 나쁜 SQL
```sql
SELECT DISTINCT e.EMP_ID, e.FIRST_NAME, e.LAST_NAME, s.ANNUAL_SALARY  
  FROM emp e
  JOIN salary s
    ON (e.emp_id = s.emp_id)
  WHERE s.is_yn = '1'
  -- 42842 row(s) fetched - 0.122s (0.008s fetch),
```
이번 쿼리는 emp 테이블과 salary 테이블을 정상적으로 join을 했고, is_yn값이 '1' 인 경우를 검색한다.

#### explain 결과
___
|||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|
|id|select_type|`table`|partitions|`type`|possible_keys|`key`|key_len|`ref`|`rows`|filtered|Extra|
|1|	SIMPLE|	s|	|	ref|	|PRIMARY,I_IS_YN	I_IS_YN|	4|	const|	82824|	100.0|	Using temporary|
|1|	SIMPLE|	e|	|	eq_ref|	PRIMARY|	PRIMARY|	4|	tuning.s.EMP_ID|	1|	100.0	||

explain 으로만 봐도, 정상적인 join을 통해 검색한다는 것을 알 수 있다.
문제는 첫번째 extra를 보면 Temporary 테이블을 메모리에 만들어서 데이터를 추출하는 것을 알 수 있다.

`Distinct`로 중복을 제거하기 위해 메모리에 적재하는 것으로 판단된다.

```sql
SELECT e.EMP_ID, e.FIRST_NAME, e.LAST_NAME, s.ANNUAL_SALARY  
  FROM emp e
  JOIN salary s
    ON (e.emp_id = s.emp_id)
  WHERE s.is_yn = '1'
  -- 42842 row(s) fetched - 0.087s (0.007s fetch), 
```
#### explain 결과
___
|||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|
|id|select_type|`table`|partitions|`type`|possible_keys|`key`|key_len|`ref`|`rows`|filtered|Extra|
|1|	SIMPLE|	s|	|	ref|	|PRIMARY,I_IS_YN	I_IS_YN|	4|	const|	82824|	100.0||
|1|	SIMPLE|	e|	|	eq_ref|	PRIMARY|	PRIMARY|	4|	tuning.s.EMP_ID|	1|	100.0	||

`Distinct`를 제거하고 나서 결과를 확인해보면, extra에 임시 테이블을 만든다는 문구가 사라진다.

이미 중복 가능한 여부를 `s.is_yn = 1` 구문으로 정리하기 때문에, join되는 테이블의 row를 보면 1로만 출력이 되는것을 알 수 있다.
그렇기 때문에 `Distinct` 키워드는 불필요 함수가 되겠다.

## UNION 문으로 쿼리를 합치는 나쁜 SQL
```sql
SELECT 'M' AS gender, emp_id
  FROM emp
 WHERE gender = 'M'
   AND last_name ='Baba'

 UNION

SELECT 'F', emp_id
  FROM emp
 WHERE gender = 'F'
   AND last_name = 'Baba'
-- 226 row(s) fetched - 0.002s,
```
`union` 키워드를 사용해서 두가지 결과를 얻어서 합쳐내는 방식으로 결과를 뽑아낸다.

#### explain 결과
___
|||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|
|id|select_type|`table`|partitions|`type`|possible_keys|`key`|key_len|`ref`|`rows`|filtered|Extra|
|1|	PRIMARY|	emp|	|	ref|	I_GENDER_LAST_NAME|	I_GENDER_LAST_NAME|	51|	const,const|	135|	100.0	|Using index|
|2|	UNION|	emp|	|	ref|	I_GENDER_LAST_NAME|	I_GENDER_LAST_NAME|	51|	const,const|	91|	100.0|	Using index|
|3|	UNION RESULT|	<union1,2>|	|	ALL|	|	|	|	|	|	|	Using temporary|

실행 계획 결과를 보면, 마지막에 temporary 가 들어간다 'union result' 의 의미는 중복을 제거하기 위해 임시 테이블을 생성하는 것을 의미한다.
메모리를 추가로 사용하고, 또한 메모리에서 생성된 테이블에서 중복 제거와 불필요한 정렬 작업이 발생한다.


```sql
SELECT 'M' AS gender, emp_id
  FROM emp
 WHERE gender = 'M'
   AND last_name ='Baba'

 UNION ALL

SELECT 'F', emp_id
  FROM emp
 WHERE gender = 'F'
   AND last_name = 'Baba'
-- 226 row(s) fetched - 0.002s,
```

`union all` 키워드를 사용하면 중복 제거 없이, 한번에 결과 두개를 합쳐서 결과를 반환한다.
그렇기 때문에, 중복이 발생할 이유가 없다면, `union` 키워드는 자제하는게 좋다.
#### explain 결과
___
|||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|
|id|select_type|`table`|partitions|`type`|possible_keys|`key`|key_len|`ref`|`rows`|filtered|Extra|
|1|	PRIMARY|	emp|	|	ref|	I_GENDER_LAST_NAME|	I_GENDER_LAST_NAME|	51|	const,const|	135|	100.0|	Using index|
|2|	UNION|	emp|	|	index|	|	I_HIRE_DATE|	3|	|	299202|	100.0	|Using index|

실행 계획을 보면 위 계획에 있던 `UNION RESULT` 행이 사라졌다. 메모리를 절약하고, 반환 속도도 더 빨라진 것을 알 수 있다.
## 인덱스를 생각하지 않고 작성한 나쁜 SQL
```sql
SELECT last_name, gender, COUNT(1) as count
  FROM emp
 GROUP BY last_name, gender
-- 3274 row(s) fetched - 0.203s (0.001s fetch)
```
우선 sql을 보면 아무런 문제가 없어보인다.

#### explain 결과
___
|||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|
|id|select_type|`table`|partitions|`type`|possible_keys|`key`|key_len|`ref`|`rows`|filtered|Extra|
|1|	SIMPLE|	emp|	|	index|	I_GENDER_LAST_NAME|	I_GENDER_LAST_NAME|	51|	|	299202|	100.0|	Using index; Using temporary|

하지만 실행 계획을 보면 extra에 temporary 가 나오는 것을 알 수 있다.
`group by` 키워드 쪽을 잘 보면, `last_name` , `gender` 순서로 나온 것을 알 수 있다.
하지만 `key` 항목을 확인해보면 `I_GENDER_LAST_NAME` 으로 순서가 반대로 되어 있는 것을 알 수있다.
인덱스를 거꾸로 사용한 것이 문제가 되는것.

```sql
SELECT last_name, gender, COUNT(1) as count
  FROM emp
 GROUP BY gender,last_name; 
 -- 3274 row(s) fetched - 0.093s (0.001s fetch)
```
#### explain 결과
___
|||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|
|id|select_type|`table`|partitions|`type`|possible_keys|`key`|key_len|`ref`|`rows`|filtered|Extra|
|1|	SIMPLE|	emp|	|	index	|I_GENDER_LAST_NAME|	I_GENDER_LAST_NAME	|51	|	|299202	|100.0	|Using index|

다른 것은 그대로 두고, `gender` , `last_name` 순으로만 변경하게 되면 속도 또한 더 빨라진 것을 알 수 있다. <br>
똑같이 index는 사용하지만, 인덱스가 만들어진 순서대로 SQL를 작성하지 않으면, 인데스를 사용하고 나서도 메모리를 오히려 낭비할 수 있게 된다.

- 엉뚱한 인덱스를 사용하는 나쁜 SQL

```sql
SELECT emp_id
  FROM emp
 WHERE hire_date LIKE '1989%'
   AND emp_id > 100000

   -- 20001 row(s) fetched - 0.084s (0.003s fetch),
```
현재 `hire_date`, `emp_id` 둘 다 인덱스를 사용하고 있다.

#### explain 결과
___
|||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|
|id|select_type|`table`|partitions|`type`|possible_keys|`key`|key_len|`ref`|`rows`|filtered|Extra|
|1|	SIMPLE|	emp|	|	range|	PRIMARY,I_HIRE_DATE	|PRIMARY|	4|		|149601|	11.11|	Using where|

실행 계획에서 인덱스를 PK로 사용중이고, filtered 데이터도 11.11% 밖에 뽑히지 않는다.

데이터의 갯수를 확인하게 되면, 

```sql
SELECT count(1)
  FROM emp
 WHERE hire_date LIKE '1989%'
 -- 28,394 개의 데이터

SELECT count(1)
  FROM emp
 WHERE emp_id > 100000; 
 -- 210024 개의 데이터
```
쿼리가 진행될 때, 두개의 조건문이 있다면 첫번째 실행되는 조건의 갯수가 더 적게 수행되어야 쿼리가 더 빨라진다. <Br>
PK 범위를 검색하는 조건이 더 많게 출력이 된다. 그렇다는 것은 hire_date를 key로 사용하게 만들어야 한다는 것이다.

이 전에도 똑같은 구문이 있는데, index를 like로 구성하게 되면 패턴 매칭을 통해서 검색하기 때문에 더 많은 시간이 소요된다.<br>
`between` 구문을 사용해서 범위를 다시 지정해줘야한다.

#### explain 결과
___
|||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|
|id|select_type|`table`|partitions|`type`|possible_keys|`key`|key_len|`ref`|`rows`|filtered|Extra|
|1|	SIMPLE|	emp|	|	range|	PRIMARY,I_HIRE_DATE|	I_HIRE_DATE|	7|	|	49824|	50.0|	Using where; Using index|

변경된 결과를 보면, key가 바뀐것을 알 수있다. `I_HIRE_DATE`를 사용하고, filtered 값도 11.11% 에서 50%로 올라갔다.

```sql
SELECT emp_id
  FROM emp
 WHERE hire_date BETWEEN '1989-01-01' AND '1989-12-31'
   AND emp_id > 100000
   -- 20001 row(s) fetched - 0.032s (0.002s fetch), 
```



## 잘못된 드라이빙 테이블로 수행되는 나쁜 SQL

```sql
SELECT de.emp_id, d.dept_id
  FROM dept_emp_mapping de, 
       dept d
 WHERE de.dept_id = d.dept_id
   AND de.start_date >= '2002-03-01'

   -- 1341 row(s) fetched - 0.603s,
```
현재 테이블을 보면, index를 보면 
___
## `show index from DEPT`
||||||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|
|`Table`|Non_unique|Key_name|Seq_in_index|Column_name|`Collation`|`Cardinality`|Sub_part|Packed|`Null`|Index_type|Comment|Index_comment|Visible|Expression|
|DEPT|0|	PRIMARY|	1|	`DEPT_ID`|	A|	9|	|	|	|	BTREE|	|	|	YES	|
|DEPT|0|	UI_DEPT_NAME|	1|	DEPT_NAME|	A|	9|	|	|	|BTREE|	|	|	YES	|

## `show index from DEPT_EMP_MAPPING`
||||||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|
|`Table`|Non_unique|Key_name|Seq_in_index|Column_name|`Collation`|`Cardinality`|Sub_part|Packed|`Null`|Index_type|Comment|Index_comment|Visible|Expression|
|DEPT_EMP_MAPPING|	0|	PRIMARY|	1|	EMP_ID|	A|	299673|	|||			BTREE|||			YES	
|DEPT_EMP_MAPPING|	0|	PRIMARY|	2|	`DEPT_ID`|	A|	331143|	|||			BTREE|||		YES	
|DEPT_EMP_MAPPING|	1|	I_DEPT_ID|	1|	`DEPT_ID`|	A|	8|	|||			BTREE|||			YES	
___

`dept` 테이블 , `dept_emp_mapping` 테이블 둘 다 제대로 된 index를 사용하고 있다는 것을 알 수있다.

#### explain 결과
___
|||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|
|id|select_type|`table`|partitions|`type`|possible_keys|`key`|key_len|`ref`|`rows`|filtered|Extra|
|1|	SIMPLE|	d|	|	index|	PRIMARY|	UI_DEPT_NAME|	122|	|	9|	100.0|	Using index|
|1|	SIMPLE|	de|	|	ref|	I_DEPT_ID|	I_DEPT_ID|	12|	tuning.d.DEPT_ID|	41392|	33.33|	Using where|

실행 계획은 보면, 정상적으로 index를 사용해서 검색한다는 것을 알 수 있다.

```sql
    SELECT count(1)
    FROM dept_emp_mapping de;
    -- 331603
```
```sql
    SELECT count(1)
    FROM dept d
  -- 9

```
위의 갯수 결과와 실행 계획은 같으 본다면, dept 테이블은 drive 테이블로 사용하고, dept_emp_mapping 테이블을 derive 테이블로 사용된다.<Br>
그 말은 9개의 row를 사용해서 331603개의 데이터에 접근하게 된다는 것을 의미한다.<br>
9 * 331603 횟수의 접근후 filtered date로 Mysql 엔진에서 결과를 걸러내는 절차로 진행되는것을 알 수 있다.
```sql
    SELECT count(1)
    FROM dept_emp_mapping de
    WHERE de.start_date >= '2002-03-01';
  -- 1341
```
하지만, start_date 로 기간을 줄이게 되면 1341개의 row가 출력된다.
1341 * 9로 접근하게 만들어야한다.

그렇다면, join 의 순서를 강제해야한다.
```sql
  SELECT STRAIGHT_JOIN de.emp_id, d.dept_id
  FROM dept_emp_mapping de, 
       dept d
 WHERE de.dept_id = d.dept_id
   AND de.start_date >= '2002-03-01';
   -- 1341 row(s) fetched - 0.074s,
   ```

`straight_join` 을 사용해서 join 순서를 강제할 수 있다.
처음엔 dept_emp_mapping 테이블이 먼저 나오게 되므로, 1341개의 테이블을 검색한 뒤, 1341 개의 레코드만 남긴다.<br>
그 이후 남은 dept테이블에 9개의 레코드와 join 을 하게 된다.

#### explain 결과
___
|||||||||||||
|-|-|-|-|-|-|-|-|-|-|-|-|
|id|select_type|`table`|partitions|`type`|possible_keys|`key`|key_len|`ref`|`rows`|filtered|Extra|
|1|	SIMPLE|	de|	|	ALL	|I_DEPT_ID||||331143| 33.33|	Using where|
|1|	SIMPLE|	d|	|	eq_ref|	PRIMARY	|PRIMARY|	12|	tuning.de.DEPT_ID|	1|	100.0|	Using index|

실행 계획에 따르면 table full scan을 통해 3311143개의 테이블을 전부 스캔한 뒤, 그 중 date가 맞는 값만 반환한다.
이 후 dept 테이블과 조인하게 된다.

결과적으로 all이 항상 나쁜것이 아니라는것도 알게되었다. 아마 date 컬럼에 인덱스를 적용하면 더 빠르게 검색될 것으로 판단된다.