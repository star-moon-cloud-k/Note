

AWS 에 올라가있던 database가 원격으로 접속 할 수 없었던 문제가 발생했다.
## [PPAS(PostgreSQL)] Error — FATAL: no pg_hba.conf entry for host …

문제는 pg_hba.conf 라는 이름.
postgresql의 설정 파일은 /etc/postgresql/15/main/ 아래에 위치하고 있음.
https://berasix.tistory.com/entry/PostgreSQL-설치와-운영-3-pghbaconf-설정하기
설정값의 설명들이 잘 나와있다.

```shell
# Database administrative login by Unix domain socket
local   all             postgres                                peer

# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             all                                     peer
# IPv4 local connections:
host    all             all             127.0.0.1/32            scram-sha-256
# IPv6 local connections:
host    all             all             ::1/128                 scram-sha-256
# Allow replication connections from localhost, by a user with the
# replication privilege.
local   replication     all                                     peer
host    replication     all             127.0.0.1/32            scram-sha-256
host    replication     all             ::1/128                 scram-sha-256
host    all             all             54.180.189.219/32       md5
host    all             all             58.65.160.225/32        md5
host    all             all             101.50.88.229/32        md5
host    all             all             52.78.177.161/32        md5
host    all             all             43.201.89.120/32        md5
host    all             all             35.169.88.205/32        md5
host    all             all             211.106.102.122/32      md5
```

설정 파일을 변경하고 바로 접근이 가능하지 않음.
md5로 설정해야, 외부에서 프로그램을 사용해서 원격 접속이 가능하다.

DB에서 설정값을 다시 불러와야한다.

`psql -U fingerate -d fingerate -p 5437 -h localhost`

```sql
fingerate=# SELECT PG_RELOAD_CONF();
 pg_reload_conf 
----------------
 t
(1 row)

```