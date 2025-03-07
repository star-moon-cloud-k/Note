## Ubuntu(18.04)에 Jenkins 설치하기

**Ubuntu**는 사용자의 편의성에 초점을 맞춘 **Linux 배포판**입니다. 고로 우리는 Ubuntu를 사용할 때 Linux와 비슷하게 여겨도 큰 상관이 없습니다.(특정 기능 사용시 다른 배포판(CentOS 등)과 사용하는 명령어가 다르긴 하다.)

Ubuntu 18.04는 Ubuntu에서 2년마다 발표하는 LTS(Long Term Support)중의 하나이며, 이 OS 환경에서 Jenkins를 설치하는 방법을 소개할 것입니다.

**우리는 Jenkins 버전 중 현재 가장 최신의 Long Term Support(LTS) Release를 설치할 예정이며 과정은 아래와 같습니다.**

### 1. Jenkins 설치를 위해 Repository key 추가

```
wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
```

키가 잘 추가 되었다면 **OK**라는 문구를 보실 수 있습니다.

### 2. 서버의 sources.list에 Jenkins 패키지 저장소를 추가

```
sudo sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > \
    /etc/apt/sources.list.d/jenkins.list'
```

### 3. 패키지 인덱스 정보 업데이트

```
sudo apt-get update
```

### 4. Jenkins 패키지 설치

```
sudo apt-get install jenkins
```

**여기까지 잘 따라 오셨다면 Jenkins는 잘 설치 되었습니다.**

### 5. Java JDK 8 설치

하지만 Jenkins를 실행하기 위해서는 특정 버젼의 **Java JDK**가 필요함으로 설치해주도록 하겠습니다.

```
sudo apt-get install openjdk-8-jdk
```

Java JDK 8 버전이 잘 설치 되었을 경우 `java -version`이라고 bash에 입력해주면 아래와 같은 로그를 볼 수 있습니다.

![](https://imbf.github.io/assets/devops/install-jenkins-in-ubuntu-2.png)

### 6. Jenkins 실행하기

이제 Jenkins와 Java도 잘 설치 되었음으로 **Jenkins를 실행**해 보도록 하겠습니다.

```
sudo systemctl start jenkins
```

Jenkins가 정상적으로 잘 실행 되었다면 아래와 같은 명령어를 bash에 입력할 시 **jenkins service의 상태를 체크**할 수 있습니다.

```
sudo systemctl status jenkins
```

저와 같은 로그가 보인다면, Jenkins가 잘 실행 된 것입니다.

![](https://imbf.github.io/assets/devops/install-jenkins-in-ubuntu-3.png)

### 7. Jenkins 포트 변경하기

Jenkins를 실행시켰을 때 기본적으로 8080 포트에서 동작합니다. 하지만 Spring Project의 경우 기본 포트가 8080이기 때문에 중복되어 불편할 수 있음으로 **Jenkins 포트를 9090포트로 바꾸어** 주도록 하겠습니다.

```
sudo vi /etc/default/jenkins
```

이 작업은 아주 간단합니다. 아래와 같이 vi 에디터를 사용해서 /etc/default/Jenkins 파일의 **HTTP_PORT를 9090포트로 변경**해주면 됩니다.

![](https://imbf.github.io/assets/devops/install-jenkins-in-ubuntu-4.png)

Jenkins 포트를 9090으로 변경했다면 **Jenkins를 재실행** 해주도록 합시다.

```
sudo systemctl restart jenkins
```

### 8. 방화벽 설정

기본적으로 OS는 보안을 위해 방화벽으로 주요 포트 이외의 대부분의 포트에 다른 호스트들의 접근을 막아놓기 마련입니다.

그래서, **ufw를 사용하여 다른 호스트가 나의 9090포트에 접근할 수 있도록 열어 놓아야 합니다.**

```
sudo ufw allow 9090
```

특정 호스트만 나의 9090포트에 접근할 수 있도록 할 수 있지만 이 부분은 생략하도록 하겠습니다.

잘 설정이 되었으면 아래와 같은 명령어를 입력합니다.

```
sudo ufw status
```

명령어 입력시 아래와 같이 9090 포트의 Rule이 생성되었다면 성공입니다.

![](https://imbf.github.io/assets/devops/install-jenkins-in-ubuntu-5.png)

### 9. Jenkins 설정하기

이제 Jenkins를 실행하기 위한 모든 작업이 끝이 났습니다.

**추가적으로 Jenkins의 초기 설정인 Plugin 설치, 계정 설정, secret key 입력을 진행하도록 하겠습니다.**

브라우저를 통해서 `http://(hostIp or hostName):9090` 에 접속시 아래와 같은 화면을 보실 수 있으며

![](https://imbf.github.io/assets/devops/install-jenkins-in-ubuntu-6.png)

/var/lib/jenkins/secrets/initialAdminPassword 에 가서 password를 복사해서 Administrator password 폼에 입력합니다.

![](https://imbf.github.io/assets/devops/install-jenkins-in-ubuntu-7.png)

폼에 Password를 입력하고 Continue를 클릭하면 다음과 같은 **플러그인 설치 화면**이 나오게 되는데 **본인이 사용하는 플러그인을 잘 모른다면 Install Suggested Plugins를 클릭**하시면 됩니다.

![](https://imbf.github.io/assets/devops/install-jenkins-in-ubuntu-8.png)

Install Suggested Plugins 버튼을 클릭하면 **권장 Plugin 설치가 진행되니, Getting Started 게이지가 다 찰 때까지 기다리면 됩니다.**

![](https://imbf.github.io/assets/devops/install-jenkins-in-ubuntu-9.png)

플러그인 설치가 완료되면 **계정 설정 페이지**가 나오게 되는데 폼을 다 채우고 save and Continue 버튼을 클릭합니다.

**이 계정 정보는 브라우저를 통해 Jenkins 접속시 항상 입력해야 함으로 꼭 잊어버리지 않아야 합니다.**

![](https://imbf.github.io/assets/devops/install-jenkins-in-ubuntu-10.png)

계정 설정 완료 후 추가적으로 1~2가지 설정을 마치면 아래와 같은 Jenkins 화면을 볼 수 있습니다.

![](https://imbf.github.io/assets/devops/install-jenkins-in-ubuntu-11.png)

이를 기반으로 독자 여러분이 본인의 입맛에 맞게끔 Jenkins를 요리해서 사용하면 됩니다.