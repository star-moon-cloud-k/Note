# jest.fn()

## jest.fn()란?
Mock 함수를 생성하는 함수 <br>
단위 테스트를 작성할 때, 해당 코드가 의존하는 부분을 가짜로 대체하는 일을 해준다.

의존적인 부분을 구현하기 까다로운 경우가있고, 의존성에 의해 테스트 결과가 영향을 받을 수 있기 떄문<br>

> database에 전송하는 부분에 트랜젝션, Network, I/O, 쿼리 전송 등의 과정이 사이에 많이 들어갈 수 있다.

가짜 함수를 생성해서 의존적인 부분에 영향받는 부분을 해결할 수 있다.<br>
- 다른 코드들에 의해 어떻게 호출되는지 기억하기 때문에 함수가 내부적으로 어떻게 사용되는지 검증할 수 있다<br>

### 기본 사용법
```js
const mockFunction = jest.fn()  //Mock 함수 생성

mockFunction()
mockFunction('hello')   //함수 호출 인자를 넘겨서도 호출 가능

mockFunction.mockReturnValue('가짜 함수')   //Mock 함수가 어떤 결과값을 반환할지 결정
console.log(mockFunction) //가짜함수 출력됨

mockFunction('hello')
mockFunction()

//Mock 함수가 몇번 호출되었고, 어떤 인자가 넘어왔는지 검증할 수 있다.
expect(mockFunction).toBeCalledWith('hello')    // hello 라는 인자가 호출되었어야했음
expect(mockFunction).toBeCalledTimes(2)         // 2번 불렸어야 했음
```