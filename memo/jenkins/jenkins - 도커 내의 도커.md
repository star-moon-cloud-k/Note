https://ksh-coding.tistory.com/132#google_vignette

**목차**

1. [
    
    0. 들어가기 전
    
    ](https://ksh-coding.tistory.com/132#0.%20%EB%93%A4%EC%96%B4%EA%B0%80%EA%B8%B0%20%EC%A0%84-1)
2. [
    
    1. Docker in Docker 필요 상황
    
    ](https://ksh-coding.tistory.com/132#1.%20Docker%20in%20Docker%20%ED%95%84%EC%9A%94%20%EC%83%81%ED%99%A9-1)
3. [
    
    1. Docker in Docker 사용하기
    
    ](https://ksh-coding.tistory.com/132#1.%20Docker%20in%20Docker%20%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0-1)
4. [
    
    1-1. 도커 컨테이너 내부에서 호스트의 도커 데몬을 사용하는 방법
    
    ](https://ksh-coding.tistory.com/132#1-1.%20%EB%8F%84%EC%BB%A4%20%EC%BB%A8%ED%85%8C%EC%9D%B4%EB%84%88%20%EB%82%B4%EB%B6%80%EC%97%90%EC%84%9C%20%ED%98%B8%EC%8A%A4%ED%8A%B8%EC%9D%98%20%EB%8F%84%EC%BB%A4%20%EB%8D%B0%EB%AA%AC%EC%9D%84%20%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94%20%EB%B0%A9%EB%B2%95-1)
5. [
    
    1-2. 도커 컨테이너 내부에서 실제 도커를 사용하는 방법
    
    ](https://ksh-coding.tistory.com/132#1-2.%C2%A0%EB%8F%84%EC%BB%A4%20%EC%BB%A8%ED%85%8C%EC%9D%B4%EB%84%88%20%EB%82%B4%EB%B6%80%EC%97%90%EC%84%9C%20%EC%8B%A4%EC%A0%9C%20%EB%8F%84%EC%BB%A4%EB%A5%BC%20%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94%20%EB%B0%A9%EB%B2%95-1)
6. [
    
    2. Docker in Docker 트러블 슈팅
    
    ](https://ksh-coding.tistory.com/132#2.%20Docker%20in%20Docker%20%ED%8A%B8%EB%9F%AC%EB%B8%94%20%EC%8A%88%ED%8C%85-1)

## [0. 들어가기 전](https://ksh-coding.tistory.com/132#0.%20%EB%93%A4%EC%96%B4%EA%B0%80%EA%B8%B0%20%EC%A0%84-1)

개인 프로젝트의 CI/CD를 구성하는 도중에, 처음 접해보는 상황이 생겼었습니다.

바로, 도커 컨테이너 내부에서 도커를 사용해야 하는 상황이었습니다.

구글링을 진행해보니 이러한 상황은 **Docker in Docker**라는 기술로 불리고 있었습니다.

따라서, 적용한 Docker in Docker와 트러블 슈팅을 진행한 경험을 포스팅해보겠습니다.

---

## [1. Docker in Docker 필요 상황](https://ksh-coding.tistory.com/132#1.%20Docker%20in%20Docker%20%ED%95%84%EC%9A%94%20%EC%83%81%ED%99%A9-1)

도커 컨테이너 내부에서 왜 도커를 실행해야 하는 상황이 발생했는지 먼저 살펴보겠습니다.

저는 CD 툴로 Jenkins를 사용하고 있습니다.

이때, Jenkins도 하나의 도커 컨테이너 내부에서 실행되고 있습니다.

이 상황에서, Jenkins의 CD 파이프라인 일부는 다음과 같았습니다.

```shell
Copy  stage('push jar file to docker hub') {
    steps {
        echo 'docker hub login'
        sh 'echo ${DOCKER_HUB_CREDENTIALS_PSW} | docker login -u ${DOCKER_HUB_CREDENTIALS_USR} --password-stdin'

        echo 'push jar file to docker hub'
        sh 'docker push ${repository}:${BUILD_NUMBER}'
    }
}
```

도커 허브에 로그인하여, 빌드한 파일을 Docker hub에 push하는 step인데요!

Docker hub에 push하는 과정에서 도커 명령어(docker push)가 사용됩니다.

이때, 사용되는 환경은 도커 컨테이너 내부이기 때문에 기본 설정으로 도커 컨테이너를 실행했다면 내부에 도커가 없습니다.

따라서, 젠킨스 파이프라인에서 다음과 같은 에러를 마주쳤습니다.

![](https://blog.kakaocdn.net/dn/4XzQc/btsD4FbLGNW/G1QubBQU0ciT3fiE6NBja1/img.png)

pipeline error

**docker: not found** 라는 도커가 설치되지 않아서 도커 관련 명령어를 수행할 수 없는 에러입니다.

이러한 상황을 해결하기 위해, 도커 컨테이너 내부에 도커를 설치하려고 하던 중 **Docker in Docker**라는 개념을 발견했습니다.

---

## [1. Docker in Docker 사용하기](https://ksh-coding.tistory.com/132#1.%20Docker%20in%20Docker%20%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0-1)

처음에는, 기존에 도커를 설치했던 방법처럼 도커 컨테이너 내부에서 도커를 설치하려고 했었습니다.

하지만 도커 컨테이너 내부는 빈 깡통과도 같았기 때문에 설치하기가 힘들었습니다.

그래서 구글링을 거쳐 Docker in Docker를 사용하여 해결하게 되었습니다.

Docker in Docker를 사용하여 도커 컨테이너 내부에서 도커를 사용하는 방법은 크게 2가지로 나뉩니다.

1. 호스트의 도커 데몬을 사용(마운트)하여 도커 컨테이너 내부에서 호스트의 도커 데몬을 사용하는 방법
2. 도커 컨테이너 내부에서 '실제' 도커를 사용하는 방법

두 가지 방법 중 첫 번째 방법을 중점적으로 설명해보겠습니다.

### [1-1. 도커 컨테이너 내부에서 호스트의 도커 데몬을 사용하는 방법](https://ksh-coding.tistory.com/132#1-1.%20%EB%8F%84%EC%BB%A4%20%EC%BB%A8%ED%85%8C%EC%9D%B4%EB%84%88%20%EB%82%B4%EB%B6%80%EC%97%90%EC%84%9C%20%ED%98%B8%EC%8A%A4%ED%8A%B8%EC%9D%98%20%EB%8F%84%EC%BB%A4%20%EB%8D%B0%EB%AA%AC%EC%9D%84%20%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94%20%EB%B0%A9%EB%B2%95-1)

이 방법은 도커 컨테이너 내부에서 도커를 사용할 때,

도커 컨테이너 내부의 도커가 아닌, 호스트의 도커 데몬을 사용해서 도커를 사용하는 방법입니다.

사용 방법은 도커 컨테이너를 실행할 때,

도커 데몬에게 명령을 내릴 수 있는 인터페이스인 **'docker.sock'** 파일을 마운트해서 실행하면 됩니다.

쉽게 말하면, 도커 컨테이너 내부의 도커 데몬 명령어를 실행할 때

호스트의 docker.sock을 사용하도록 해서 별다른 도커 설치 없이 도커를 사용하는 방법입니다.

다음과 같이 마운트하여 도커 컨테이너를 실행하면 됩니다.

```shell
Copy-v /var/run/docker.sock:/var/run/docker.sock
```

저는 젠킨스 이미지를 실행시키고, 백업용 마운트를 하나 더 설정했기 때문에 다음과 같이 컨테이너를 실행했습니다.

```shell
Copydocker run -d -p 9000:8080 --name jenkins \
  -v /home/ec2-user/jenkins_backup:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins
```

### [1-2. 도커 컨테이너 내부에서 실제 도커를 사용하는 방법](https://ksh-coding.tistory.com/132#1-2.%C2%A0%EB%8F%84%EC%BB%A4%20%EC%BB%A8%ED%85%8C%EC%9D%B4%EB%84%88%20%EB%82%B4%EB%B6%80%EC%97%90%EC%84%9C%20%EC%8B%A4%EC%A0%9C%20%EB%8F%84%EC%BB%A4%EB%A5%BC%20%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94%20%EB%B0%A9%EB%B2%95-1)

도커 컨테이너 내부에서 실제 도커를 사용하는 방법도 존재합니다.

간략하게는 다음과 같이 수행하면 됩니다.

```shell
Copydocker run --privileged -d docker:dind
```

해당 방법은 아래의 링크에 자세히 나와 있습니다.

[https://github.com/jpetazzo/dind](https://github.com/jpetazzo/dind)

 [GitHub - jpetazzo/dind: Docker in Docker

Docker in Docker. Contribute to jpetazzo/dind development by creating an account on GitHub.

github.com](https://github.com/jpetazzo/dind)

이 방법으로 진행하지 않은 이유는, 비효율적이라고 생각했기 때문입니다.

실제 도커를 사용하지 않고 호스트 도커 데몬을 사용하여 도커 명령어를 실행할 수 있음에도 불구하고

도커 컨테이너 내부에 실제 도커를 설치해서 사용하는 것은 **서버 리소스 낭비가 심할 것 같았기 때문에 1번 방법으로 진행하게 되었습니다.**

---

## [2. Docker in Docker 트러블 슈팅](https://ksh-coding.tistory.com/132#2.%20Docker%20in%20Docker%20%ED%8A%B8%EB%9F%AC%EB%B8%94%20%EC%8A%88%ED%8C%85-1)

1번 방법으로 호스트 데몬을 사용하여 상황이 해결될 것을 기대했지만, 다음과 같은 오류가 발생했었습니다.

![](https://blog.kakaocdn.net/dn/scFbH/btsD8AnmF0V/lIgwFikrJk3WCjxiW6hkx0/img.png)

permission denied error

위와 같이 권한 문제로 도커 명령어가 실행되지 않았습니다.

저는 호스트 환경에서 도커 그룹에 유저를 추가하여 권한 없이 도커를 실행하고 있었습니다.

따라서, 도커 컨테이너 내부 환경 사용자도 접근하도록 docker.sock 파일의 접근 권한을 다음과 같이 설정해줬습니다.

```shell
Copysudo chmod 666 /var/run/docker.sock
```

이렇게 도커 컨테이너 내부에서 도커를 사용할 수 있었습니다.