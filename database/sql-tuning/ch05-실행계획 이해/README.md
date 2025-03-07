# 5장. 쿼리의 실행계획 이해하기

## 강의 목차
- 실행계획 수행
  - 실행계획 출력
    - explain
    - describe
    - desc
- 실행계획 항목-1
  - id
    - select 문마다 부여되는 식별자 (작업의 최소단위)
    - 같은 값으로 되어있는경우 join 작업을 의미
  - table
    - alias, 혹은 사용되는 테이블의 이름을 표현
    - subquery나 임시 테이블을 사용하는 경우는 derive와 같은 이름으로 표현
  - select_type
    - 쿼리문이 어떠한 유형으로 작성이 되었는지?
  
  |select_type 항목|설명|
  |----------------|----|
  |simple|서브쿼리, Union 구문 없이 **단순**한 select 문|
  |primary|서브쿼리, Union 구문이 포함된 쿼리문에서 **최초 접근한 테이블**|
  |subquery|**독립적**인 서브쿼리|
  |derived|단위 쿼리를 **메모리나 디스크**에 생성한 **임시 테이블**|
  |union|**Union 또는 Union all 구문에서 첫 번째 이후**의 테이블|
  |union result | Union구문에서 **중복을 제거**하기 위해 **메모리나 디스크에** 생성한 테이블|
  |dependent subquery \|<br/> dependency union| Union 또는 Union all 구문에서 **메인 테이블의 영향을 받는 테이블**|
  |materialized | 조인 등의 가공 작업을 위해서 생성한 **임시 테이블**





- 실행계획 항목-2
  - partitions
    - 파티션이 존재하는 경우에 발생, 접근하게 되는 특정 파티션
  - type
  
  |type 항목|설명|
  |---------|----|
  |const | **단 1건**의 데이터만 접근하는 유형|
  |eq_ref | 조인 시 **드리븐 테이블**에서 매번 **단 1건**의 데이터만 접근하는 유형|
  |ref | **데이터 접근 범위가 2개 이상**인 유형|
  |range|연속되는 **범위를 접근**하게 되는 유형|
  |index_merge | 특정 테이블에 생성된 2개 이상 **인덱스가 병합되어 동시에 적용**되는 유형|
  |index | 인덱스를 처음부터 끝까지 접근하는 유형(Full Index Scan)|
  |all | 테이블을 처음부터 끝까지 접근하는 유형 (Full Table Scan)|
> 일반적으로 type은 무조건 적인 것은 아니지만, 테이블의 아래로 갈 수록 성능이 떨어진다고 생각하면 된다.

- 실행계획 항목-3
  - key
    - table에서 사용하는 키를 의미
  - key_len
    - 사용된 키의 byte 수
    - 하나의 인덱스에서 값을 전부 다 사용하지 않는 경우도 있다.
  - ref
    - 해당 테이블에 접근한 조건을 의미
  - row
    행의 수를 의미
    접근할 예상 수를 의미. 통계정보가 업데이트가 늦어질 수록 예상치는 오차가 발생한다.
  - filtered
    - MySQL 엔진에서 필터 조건에 의해 최종 반환되는 비율(%)
    - 가급적이면 스토리지 엔진에서 100%를 가져오는것이 성능상 유리하다.
  - extra
    - 쿼리문을 어떻게 수행할 것인지에 대한 부가 정보
    
    |extra 항목 | 설명 |
    |-----------|------|
    |Distinct | 중복이 제거되어 유일한 값을 찾을 때 출력되는 정보(distinct, union)|
    |Using where | Where 절의 필터 조건을 사용해서 MySQL 엔진으로 가져온 데이터를 추출 |
    |Using temporary | 데이터의 중간 결과를 저장하고자 임시 테이블을 생성|
    |Using index | 물리적인 데이터 파일을 읽지 않고 인덱스만 읽어 쿼리 수행 (Covering index)|
    |Using filesort | order by 가 인덱스 활용하지 못하고, 메모리에 올려서 추적적인 정렬 작업 수행|
    |Using index for group-by|쿼리문 group by 구문이나 distinct 구문이 포함될 때, 정렬된 인덱스를 순서대로 읽으면서 group by 연산 수행|
    |Using index for skip scan | 인덱스의 모든 값을 비교하는 것이 아닌, 필요한 값만 건너뛰면서 스캔하는 방식|
    |FirstMatch|인덱스 스캔 시에 첫 번째로 일치하는 레코드만 찾으면 검색을 중단하는 방식|

  - [참고] Using where
  - [참고] Covering Index
- 실행계획의 판단 기준
  |성능 좋음 ||성능 나쁨| 항목 |
  |---------|---|----|--|
  |SIMPLE <br> PRIMARY |↔|DEPENDENT * <br> UNCACHEABLE *|select_type 항목|
  |system <br>const <br>eq_ref|↔|index <br>all| type 항목|
  |Using index | ↔ | Using filesort <br> Using temporary | extra 항목

- 실행 계획의 확장 
  - explain format = traditional
    - 일반적인 explain 구문
  - explain format = tree
    - tree 형태로 실행 계획 표기
  - explain format = json
    - json 형태로 실행 계획 표기
  - explain analyze
    - 옵티마이저가 직접 실행하고 측정된 값을 확인하는 방식
  
  
- SQL 프로파일링
  - 이벤트별 소요시간이 포한된 세부적인 실행 정보를 제공하는 성능분석 도구
   
   |Explain | Profiling | 
   |--------|-----------|
   |쿼리 실행계획, 인덱스 사용 여부 | 상세 실행 이벤트 및 시간 측정|
   |실행 계획 검토 및 인덱스 최적화 | 병목 현상 확인 |
   |상대적으로 간략 및 활용 용이 | 상세 |

## 강의 중 설명한 SQL 코드
- 실행계획 실습
```sql
-- 실행계획 출력
explain SELECT COUNT(1) FROM dept;
```
- id
```sql
EXPLAIN
SELECT e.emp_id, e.FIRST_NAME, e.LAST_NAME, s.ANNUAL_SALARY,
      (SELECT g.GRADE_NAME FROM grade g 
        WHERE g.EMP_ID = e.EMP_ID
          AND g.END_DATE = '9999-01-01') grade_name
  FROM emp e, salary s
 WHERE e.EMP_ID = 10001
   AND e.EMP_ID = s.EMP_ID
   AND s.IS_YN = 1;
```
- table
```sql
EXPLAIN
SELECT e.emp_id, e.FIRST_NAME, e.LAST_NAME, s.ANNUAL_SALARY,
      (SELECT g.GRADE_NAME FROM grade g 
        WHERE g.EMP_ID = e.EMP_ID
          AND g.END_DATE = '9999-01-01') grade_name
  FROM emp e, salary s
 WHERE e.EMP_ID = 10001
   AND e.EMP_ID = s.EMP_ID
   AND s.IS_YN = 1;
```
- select_type > simple
```sql
EXPLAIN
 SELECT e.emp_id, e.first_name, e.last_name, s.annual_salary
   FROM emp e, salary s
  WHERE e.emp_id = s.emp_id
    AND e.emp_id BETWEEN 10001 AND 10010
    AND s.annual_salary > 80000;
```
- select_type > primary
```sql
EXPLAIN
 SELECT emp_id, first_name, last_name,
        (SELECT MAX(annual_salary) 
           FROM salary 
          WHERE emp_id = e.emp_id) max_salary
   FROM emp e
  WHERE emp_id = 100001;
```
- select_type > subquery
```sql
EXPLAIN
 SELECT (SELECT COUNT(*) FROM emp ) AS e_count,
        (SELECT MAX(annual_salary) FROM salary) as s_max;
```
- select_type > derieved
```sql
EXPLAIN
  SELECT e.emp_id, s.annual_salary
    FROM emp e,
         (SELECT emp_id, MAX(annual_salary) annual_salary
            FROM salary
           WHERE emp_id = 10001) s
   WHERE e.emp_id = s.emp_id;
```
- select_type > union
```sql
EXPLAIN
 SELECT gender, MAX(hire_date) hire_date
   FROM emp e1
  WHERE gender = 'M'

  UNION ALL

 SELECT gender, MAX(hire_date) hire_date
   FROM emp e2
  WHERE gender = 'F'
```
- select_type > union result
```sql
EXPLAIN
 SELECT gender, MAX(hire_date) hire_date
   FROM emp e1
  WHERE gender = 'M'

  UNION

 SELECT gender, MAX(hire_date) hire_date
   FROM emp e2
  WHERE gender = 'F'
```
- select_type > dependent subquery, dependent union
```sql
EXPLAIN
 SELECT m.dept_id, 
       (SELECT concat(gender,' : ',last_name)
          FROM emp e1
         WHERE gender= ‘F’ AND e1.emp_id = m.emp_id

         UNION ALL

        SELECT concat(gender,' : ',first_name)
          FROM emp e2
         WHERE gender= ‘M’ AND e2.emp_id = m.emp_id
        ) name
  FROM manager m;
```
- select_type > materialized
```sql
EXPLAIN
 SELECT *
   FROM emp
  WHERE emp_id IN (SELECT emp_id FROM salary WHERE START_DATE>'2020-01-01' );
```
- type > const
```sql
EXPLAIN
 SELECT *
   FROM emp
  WHERE emp_id = 10001;
```
- type > eq_ref
```sql
EXPLAIN
 SELECT d.dept_id, d.DEPT_NAME
   FROM dept_emp_mapping de,
        dept d
  WHERE de.dept_id = d.dept_id
    AND de.END_DATE = '9999-01-01'
    AND de.emp_id = 10001
```
- type > ref
```sql
-- 유형 1
EXPLAIN
 SELECT *
   FROM dept_emp_mapping de
  WHERE de.END_DATE = ‘9999-01-01’ AND de.emp_id = 10001;
-- 유형 2
EXPLAIN
 SELECT d.dept_id, d.DEPT_NAME
   FROM dept_emp_mapping de, dept d
  WHERE de.dept_id = d.dept_id AND de.END_DATE = '9999-01-01' AND de.emp_id = 10001;
```
- type > range
```sql
EXPLAIN
 SELECT *
   FROM emp
  WHERE emp_id BETWEEN 10001 AND 100000;
```
- type > index_merge
```sql
EXPLAIN
 SELECT *
   FROM emp
  WHERE emp_id BETWEEN 10001 AND 100000
    AND hire_date = '1985-11-21';
```
- type > index
```sql
EXPLAIN
 SELECT emp_id
   FROM grade
  WHERE grade_name = 'Manager';
```
- type > all
```sql
EXPLAIN 
 SELECT emp_id, first_name 
   FROM emp
```
- key & key_len
```sql
EXPLAIN
SELECT emp_id
  FROM emp
 WHERE emp_id BETWEEN 100000 AND 110000
```
- ref
```sql
EXPLAIN
 SELECT e.emp_id, g.grade_name
   FROM emp e, grade g
  WHERE e.emp_id = g.emp_id
    AND e.emp_id BETWEEN 10001 AND 10100;
```
- rows
```sql
EXPLAIN
 SELECT e.emp_id, g.grade_name
   FROM emp e, grade g
  WHERE e.emp_id = g.emp_id
    AND e.emp_id BETWEEN 10001 AND 10100;
```
- Profiling 실습
```sql
-- 1. 확인
SHOW VARIABLES LIKE 'profiling'

-- 2. 접속 세션에서 변수 변경
SET profiling = 'ON'

-- 3. 쿼리 수행

-- 4. 전체 확인
SHOW PROFILES

-- 5. 결과 확인
SHOW PROFILE FOR query #

-- 6. 상세 확인
SHOW PROFILE ALL FOR query 4
```