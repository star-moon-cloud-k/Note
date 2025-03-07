https://choco-one.tistory.com/6

docker_set.sh (자동으로 설치 밑 생성)
```bash
sudo apt-get update -y

# 의존성 패키지 설치
sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common -y

# Docker 패키지 인증 키 추가
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

#Docker 저장소 추가
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

#저장소 업데이트
sudo apt-get update -y

#Docker 설치
sudo apt-get install docker-ce docker-ce-cli containerd.io -y

#사용자를 docker 그룹에 포함
sudo usermod -aG docker $USER

#도커 컴포즈 설치
sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
#도커 컴포즈 파일을 실행 가능하도록 다운로드한 경로에 권한을 부여
sudo chmod +x /usr/local/bin/docker-compose
#심볼릭 링크 설정
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

```
2. Docker 설치
```zsh
$ sudo apt-get update

// 의존성 패키지 설치
$ sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common

// Docker 패키지 인증 키 추가
$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

// Docker 저장소 추가
$ sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

// 저장소 업데이트
$ sudo apt-get update
```

 위 과정 이 완료 되었다면 **sudo apt-cache search docker-ce** 명령어로 Docker 패키지가 잡히는지 확인

```zsh
// Docker 설치
$ sudo apt-get install docker-ce docker-ce-cli containerd.io

// 사용자를 docker 그룹에 포함
$ sudo usermod -aG docker $USER
```

2. Jenkins 설치
```zsh
// jenkins 이미지 확보
$ docker image pull jenkins/jenkins:jdk17
```

3. 도커 파일 / 컴포즈 사용
```yml
# /gg56/jenkins-dockerfile/Dockerfile
FROM jenkins/jenkins:jdk17

USER root
	RUN apt-get update &&\
	apt-get upgrade -y &&\
	apt-get install -y openssh-client
```

```yml
# /gg56/docker-compose.yml

version: "3.1"
services:
	jenkins:
		container_name: jenkins
		build:
			dockerfile: Dockerfile
		restart: unless-stopped
		user: root
		ports:
			- 8888:8080
			- 50000:50000
volumes:
	- ./jenkins_home:/var/jenkins_home
	- /home/gg56/.ssh:/root/.ssh
	- /var/run/docker.sock:/var/run/docker.sock
```

- 위의 volumes 옵션이 필요한 이유는 독립된 Jenkins 컨테이너 외부에 저장소를 둠으로써 데이터를 지속적으로 저장할 수 있기 때문이다.
    - "_서버의 저장 경로  : 도커 컨테이너의 저장 경로_"와 같은 식으로 저장소를 공유 가능
- restart: unless-stopped는 서버가 재시작할 때 해당 컨테이너도 자동으로 재실행됨을 의미

docker-compose 파일을 up 해준다

```bash
docker-compose [-f docker-compose.yml][→ 생략가능] up --build -d
```
이후 Jenkins 가 정상적으로 실행되고 8888포트로 접속 가능

4. ssh 사용 설정
	1. 도커에 접속
```zsh
$ docker exec -it {도커 컨테이너 ID} /bin/bash
$ su jenkins
$ cd ~/
```

	2.SSH 접속 키 생성

```zsh
$ mkdir .ssh 
$ cd .ssh # ssh 인증서 생성 
$ ssh-keygen -t rsa -b 4086 
Generating public/private rsa key pair. Enter file in which to save the key (/var/jenkins_home/.ssh/id_rsa):
/var/jenkins_home/.ssh/jenkins_rsa Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /var/jenkins_home/.ssh/jenkins_rsa Your public key has been saved in /var/jenkins_home/.ssh/jenkins_rsa.pub The key fingerprint is:
```
- 키를 만들면 authorized_keys, id_rsa, id_rsa.pub 생성됨
	- authorized_keys : ssh로 접근할 때, 연결 허용할 공개키
	- id_rsa : ssh 접근할 때 사용하는 비밀키
	- id_rsa.pub : ssh접근할 때 비밀키와 검증하는 키
		- id_rsa - id_rsa.pub 은 한쌍의 키
		- id_ras.pub을 접근 하기 위한 서버에 authorized_key에 저장하여 공개키를 사용해서 접근한다


- 공개키를 원격 호스트에 복사 (접속 대상)
```zsh
$ ssh-copy-id -i /var/jenkins_home/jenkins/.ssh/jenkins_rsa.pub x@192.168.0.7
```

- ssh 접속이 되는지 확인

```
$ ssh -i jenkins_rsa test@192.168.0.7
```

### 3. jenkins에 ssh 인증 정보 등록

[https://www.jenkins.io/doc/book/using/using-credentials/](https://www.jenkins.io/doc/book/using/using-credentials/)

1. jenkins 관리 > Manage Credentials
2. Stores scoped to Jenkins > global > Add Credntials 선택
3. ssh 정보 입력

```
Kind : SSH Username with private key
ID : 중복되지 않는 인증 ID - 해당 ID 값으로 pipline에서 인증 정보를 사용
username : 생략
private key : ssh-keygen 으로 생성한 private key 내용 (ex: jenkins_rsa)  
              cat jenkins_rsa 명령어로 출력되는 내용
passphrase : ssh-keygen으로 인증키 생성시 입력한 password
```

![](https://blog.kakaocdn.net/dn/YZJY8/btrr7pUhhs4/cstFwYsFcSfhCkHUZevbdK/img.png)