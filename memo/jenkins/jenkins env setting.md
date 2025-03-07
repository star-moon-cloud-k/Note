# 1. Git Repository에 Push

- Github에 프로젝트 소스 올리기 위해 Repository 생성
    - Repository 이름 : `egovFramework`  
        ![](https://velog.velcdn.com/images/ynjch97/post/c9ed4afb-42a5-4818-9313-74adea76fa2b/image.png)
- 프로젝트 폴더 우클릭 > `Git Bash Here`  
    ![](https://velog.velcdn.com/images/ynjch97/post/cada02d8-2006-438c-bb90-31dc68fa239a/image.png)
- 아래 명령어 입력하여 소스 Pull 및 Push
    - `git pull origin main` 실행 후, 현재 브랜치가 master로 되어있으면 `git checkout main` 실행

```bash
git config --global user.name "[Github 이름]"
git config --global user.email [Github 이메일]
git init
git remote add origin [Repository 주소]

git pull origin main
git checkout main
git add *
# 삭제한 파일 반영  시, git add –u
git commit -m "[커밋 메세지]"
git push -u origin main
```

![](https://velog.velcdn.com/images/ynjch97/post/395f62ba-2d29-4879-895f-8739c6a3b3f3/image.png)

## 1-1. 브랜치 변경 오류

- `git checkout main` 실행 시 아래 오류 발생하는 경우, 폴더 내 `README.md` 파일 삭제 후 재시도  
    ![](https://velog.velcdn.com/images/ynjch97/post/455bd623-3f87-4813-b562-02e65a69f659/image.png)

# 2. Jenkins 설치

- Jenkins 저장소 Key 다운로드 후, `sources.list.d`에 `jenkins.list` 추가

```bash
egov@egov-server:/$ sudo apt-get update
egov@egov-server:/$ sudo apt-get upgrade
egov@egov-server:/$ wget -q -O - https://pkg.jenkins.io/debian/jenkins-ci.org.key | sudo apt-key add -
egov@egov-server:/$ echo deb http://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list
```

- Key 등록 후, apt-get 다시 업데이트

```bash
egov@egov-server:/$ sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys FCEF32E745F2C3D5
egov@egov-server:/$ sudo apt-get update
egov@egov-server:/$ sudo apt-get upgrade
```

- 정상 반영되었는지 확인

```bash
egov@egov-server:/etc/apt/sources.list.d$ cd /etc/apt/sources.list.d/
egov@egov-server:/etc/apt/sources.list.d$ vi jenkins.list
```

![](https://velog.velcdn.com/images/ynjch97/post/3fb6a6b8-dccc-4989-90f4-194a01f7ab09/image.png)![](https://velog.velcdn.com/images/ynjch97/post/c72c8309-e912-4106-9db6-07a42d067c7a/image.png)

- Jenkins 설치

```bash
egov@egov-server:/$ sudo apt-get install jenkins
```

- Jenkins 서버 포트 번호 변경 (8090)
    - Tomcat 포트 번호가 8080이기 때문에 Jenkins 포트 번호 변경하였음

```bash
egov@egov-server:/$ sudo vi /etc/default/jenkins
egov@egov-server:/$ sudo vi /etc/init.d/jenkins
# /usr/lib/systemd/system/jenkins.service 가 가장 우선되는 설정이므로 변경해주어야 함
egov@egov-server:/$ sudo vi /usr/lib/systemd/system/jenkins.service
# .service 파일 변경 내용을 재등록하기 위함
egov@egov-server:/$ sudo systemctl daemon-reload
```

![](https://velog.velcdn.com/images/ynjch97/post/64f4e769-6dbe-4035-85c8-54e6e06d306b/image.png)![](https://velog.velcdn.com/images/ynjch97/post/19af11a1-c9c4-4ef4-8c59-70686050730c/image.png)![](https://velog.velcdn.com/images/ynjch97/post/c92dbf6d-016c-4b88-8c2e-12b3a139a084/image.png)

- Jenkins 서비스 재기동 및 상태 확인

```bash
egov@egov-server:/$ sudo service jenkins restart
egov@egov-server:/$ sudo systemctl status jenkins
```

![](https://velog.velcdn.com/images/ynjch97/post/3594667a-21ea-407d-9224-a2d0e0daca91/image.png)

- Jenkins 초기 비밀번호 확인
    - VM `egovSample04` Jenkins 비밀번호 : `a8f841001ac449139f02b1fe9f7c194c`

```bash
egov@egov-server:/$ sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

## 2-1. Jenkins 설치 시 오류 해결

- `E: Package 'jenkins' has no installation candidate` : 아래 명령어 입력 후 다시 install

```bash
egov@egov-server:/$ sudo apt-get update
egov@egov-server:/$ sudo apt-get upgrade
```

# 3. Jenkins 실행

- 설정한 포트 번호를 이용하여 [http://192.168.56.109:8090/](http://192.168.56.109:8090/) 접속  
    ![](https://velog.velcdn.com/images/ynjch97/post/c5df2916-2cde-4cea-9702-01f42b0eb1e4/image.png)

## 3-1. Jenkins 실행 시 오류 해결

- 창이 뜨지 않을 시 아래 명령어 실행
- Jenkins 서비스 재기동 및 상태 확인

```bash
egov@egov-server:/$ sudo service jenkins restart
egov@egov-server:/$ sudo systemctl status jenkins
```

- 방화벽 설정 확인 및 포트 번호 추가 (`sudo ufw status` 결과, Status가 `inactive`로 나오거나 8090 포트가 없을 경우)

```bash
egov@egov-server:/$ sudo ufw status
egov@egov-server:/$ sudo ufw enable
egov@egov-server:/$ sudo ufw allow 8090
```

## 3-2. Jenkins 실행 관련 참고

- Jenkins 기본 설정 파일 확인

```bash
egov@egov-server:/$ vi /etc/default/jenkins
```

- Jenkins 로그 파일 확인

```bash
egov@egov-server:/$ tail –f /var/log/jenkins/jenkins.log
```

- Jenkins 시작 및 정지

```bash
egov@egov-server:/$ sudo service jenkins start
egov@egov-server:/$ sudo service jenkins stop
```

# 4. Jenkins 시작하기

- [http://192.168.56.109:8090/](http://192.168.56.109:8090/) 접속 > 2번에서 확인한 비밀번호 입력 > Continue  
    ![](https://velog.velcdn.com/images/ynjch97/post/1e688e19-d8f5-4c62-8454-451405ce0263/image.png)
- `Install suggested plugins` 선택하여 설치  
    ![](https://velog.velcdn.com/images/ynjch97/post/eeb3a3cb-9768-45d2-aeaa-8752ff9edf35/image.png)
- 설치 중인 화면 확인  
    ![](https://velog.velcdn.com/images/ynjch97/post/7fea8f04-9d5e-4299-81a2-6d96266f5d55/image.png)
- 설치 완료 후, Admin 계정 생성을 위한 정보 입력
    - 계정명 : egov
    - 암호 : 1111
    - 이름 : egov
    - 이메일 주소 : egov@gmail.com  
        ![](https://velog.velcdn.com/images/ynjch97/post/5a531caf-b34f-44f3-baae-4fa43679d581/image.png)
- Jenkins URL은 기본값으로 설정 > `Save and Finish` > `Start using Jenkins`
- Jenkins 메인 화면 확인  
    ![](https://velog.velcdn.com/images/ynjch97/post/a716209f-b527-47e6-bc78-42fa9dbec05c/image.png)

# 5. Jenkins 설정

- Maven 빌드를 위한 추가 설정 필요
- Jenkins 관리 > `Global Tool Configuration` > JDK와 Maven 설정
    - JDK > `JAVA_HOME` 값은 `/usr/lib/jvm/java-11-openjdk-amd64`  
        ![](https://velog.velcdn.com/images/ynjch97/post/502a321f-1618-4f1f-a6d9-f67cf559ac42/image.png)
    - Maven > `Add Maven` > `MAVEN_HOME` 값은 `/usr/share/maven`  
        ![](https://velog.velcdn.com/images/ynjch97/post/894f0781-0112-4eb6-96c9-c5cd0452c14c/image.png)

# 6. Github와 Jenkins 연동

- `ssh-keygen`을 통해 rsa 타입, 4096 비트의 key 생성

```bash
egov@egov-server:~$ sudo ssh-keygen –t rsa –b 4096
```

- 만들어진 key 확인 > `id_rsa`, `id_rsa.pub`가 생성됨
    - `Enter file in which to save the key` : 키 생성 위치 지정 (엔터만 입력 시 기본 위치인 ~/.ssh에 생성됨)
    - `Enter passphrase` : 키에 접근할 때마다 암호를 요구하려면 입력 후 엔터 (엔터만 입력 시 암호 요구하지 않도록 함)  
        ![](https://velog.velcdn.com/images/ynjch97/post/5439620d-a251-45e7-9b58-c67869fea36e/image.png)
- `id_rsa`의 key 출력하여 복사

```bash
egov@egov-server:/$ cd /home/egov/.ssh
egov@egov-server:~/.ssh$ cat /home/egov/.ssh/id_rsa
```

![](https://velog.velcdn.com/images/ynjch97/post/9948b0d4-06ca-42d6-95f5-d11e2ee43b9e/image.png)![](https://velog.velcdn.com/images/ynjch97/post/48a56305-8c35-474d-8cbe-090173f51cd7/image.png)

- Jenkins 관리 > `Manage Credentials` > `Jenkins` > `Global credentials (unrestricted)`  
    ![](https://velog.velcdn.com/images/ynjch97/post/74eca3d5-894e-4c08-91a6-59a61d0df49d/image.png)
- Add Credentials  
    ![](https://velog.velcdn.com/images/ynjch97/post/4a3e3524-f129-44cd-b1d3-b5324a1ad04a/image.png)
- 아래와 같이 설정 > Create
    - Kind : `SSH Username with private key`
    - Scope : `Global (Jenkins, nodes, items, all child items, etc)`
    - Private Key : `Enter directly` 선택 후 복사했던 key 값 입력  
        ![](https://velog.velcdn.com/images/ynjch97/post/5ffa507d-4c04-4fc4-b4fe-d3b99a533acc/image.png)![](https://velog.velcdn.com/images/ynjch97/post/6480aa43-e0cd-4557-a1f3-59b80d1e27f0/image.png)

## 6-1. 연동을 위한 Github 설정

- Github > 프로젝트 Repository 선택 > `Settings` > `Deploy keys` > `Add deploy key`  
    ![](https://velog.velcdn.com/images/ynjch97/post/937d1456-caf9-4e98-9a42-1ee05a7b200e/image.png)
- `id_rsa.pub` key 출력하여 복사

```bash
egov@egov-server:/$ cd /home/egov/.ssh
egov@egov-server:~/.ssh$ cat /home/egov/.ssh/id_rsa.pub

# ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDB8wHD5hmDMGHu8wme29upL7RsAO3A7Xzl3SKo4cyZubaeUd50gzt60HYhyoXz399MxUr56DaWU4cc2TzauNtqnqhaO+g6e0yyC5iQSNOg8N8pY238SepyRF7fmPNuiyG01yDSKfm4JZJKhBojGR1xoXGvnOj46plDKHsDebTo5RQg6y+3H0lKc+AnZcIHGfDkpFGJwHWSQIZlLyu+NRoNl1Zp5N/4C0xsI0ljqQxeuPvrFTA6twf2NQPjsqog4hc6enn9k6SDUJJ/RpgebHAyCwFx/xGub4esLFsfIHUpnsel+hkdTVjq4tFRH+lbSoJBCw5YTjjVZ+GhOyVhBzaYId2poBiQKAz/PfedeUjBGAtxF0ahH4tgj04XW2Gnk+8aKJD+Ne0Ey+iJPHZDg0GuL+w5pgidZlD1UUSHVomhJX56PzAmf3xUz4kT8wuJrEZStIvtH78/wwBV3K2hOMeKIv9JBiTsW3EVkjIHDEuI/s3xCU4qgpODOG38E/ho0+chJenhzev+sj0kybFxoRgQ+IIKiqtFwKF0atHXDkeiCt/wxPhUo/5X90mYUE9F3Ys0GyLWkxFPVPw17hSE8asz4LjY6iNcPUhL03q8a3yF7B/OIDL5XzJuLx/8n7S2mwLvSI7Jj/05/RzLdbT3agtwmSSBJKS2Gn6/g16gIw2ygQ== egov@egov-server
```

- Deploy key 아래와 같이 설정 > `Add key`  
    ![](https://velog.velcdn.com/images/ynjch97/post/bf36e236-ec98-4cf0-83b3-9e349e7d8625/image.png)
- Github > 프로젝트 Repository 선택 > `Settings` > `Webhooks` > `Add webhook`
- Webhook 아래와 같이 설정 > `Add webhook`
    - payload URL : `http://[JENKINS URL]:[PORT]/github-webhook/`  
        ![](https://velog.velcdn.com/images/ynjch97/post/dfabddf5-80b7-48ff-bd22-30655409da43/image.png)

# 7. Jenkins에 Item 생성

- Jenkins > 새로운 Item > 이름 입력 및 `Freestyle project` 선택 > OK
    - Enter an item name : `govSample01`
- 소스 코드 관리 > Git 선택 > 아래와 같이 정보 입력
    - Repository URL : `https://github.com/ynjch97/egovFramework.git`
    - Credentials : `Github`  
        ![](https://velog.velcdn.com/images/ynjch97/post/0820c7e0-d0e6-4aeb-90a2-fff1a491785f/image.png)
- 빌드 유발 > `GitHub hook trigger for GITScm polling` 선택 (Github에 push 이벤트가 오면 자동 실행되도록 함)  
    ![](https://velog.velcdn.com/images/ynjch97/post/c4bb35aa-e3d3-4b0f-a779-1bf87375640a/image.png)
- Build > `Add build step` > `Invoke top-level Maven targets`
    - Maven Version : `mvn-3.6.3`
    - Goals : `clean package`
- 저장

## 7-1. Jenkins 빌드 테스트

- Jenkins에 생성한 Item `egovSample01` 빌드 테스트
- 테스트를 위해 `index.jsp` 소스 수정하여 Github에 Commit  
    ![](https://velog.velcdn.com/images/ynjch97/post/39972630-0c82-47e3-a5fc-46e2585c4f80/image.png)
- VM 서버의 파일은 현재 `<p>Jenkins 빌드 테스트</p>` 코드가 없는 상태

```bash
egov@egov-server:/$ cd /home/egov/tomcat/tomcat-9.0/webapps/sample
egov@egov-server:~/tomcat/tomcat-9.0/webapps/sample$ vi index.jsp
```

![](https://velog.velcdn.com/images/ynjch97/post/441c7718-b82a-4df1-a53a-b21d90e18cc7/image.png)

> [TODO] 7-1번까지 내용 수행 후 할 일
> 
> - 현재 프로젝트 소스 저장 경로 : /var/lib/jenkins/workspace/egovSample01
> - 기존 설정했던 sample 폴더 경로로 세팅될 수 있도록 변경
> - Jenkins 빌드 > 프로젝트 소스가 정상 반영되는 것 확인 및 Tomcat 구동하여 index.jsp 내용 수정된 것 확인
> - 참고 : [https://more-learn.tistory.com/19](https://more-learn.tistory.com/19)  
>     [https://velog.io/@suhongkim98/jenkins-%EC%9B%B9%ED%9B%85-%EC%84%A4%EC%A0%95%ED%95%B4%EC%84%9C-CI-%EA%B5%AC%EC%B6%95%ED%95%98%EA%B8%B0](https://velog.io/@suhongkim98/jenkins-%EC%9B%B9%ED%9B%85-%EC%84%A4%EC%A0%95%ED%95%B4%EC%84%9C-CI-%EA%B5%AC%EC%B6%95%ED%95%98%EA%B8%B0)

https://velog.io/@ynjch97/eGovFramework-Ubuntu-%EA%B0%80%EC%83%81%EB%A8%B8%EC%8B%A0%EC%97%90-Github-Jenkins-%EC%97%B0%EB%8F%99%ED%95%98%EA%B8%B0

