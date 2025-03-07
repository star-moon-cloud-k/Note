# TDD Integration test

express를 기반의 테스트 코드 작성 정리

## 기본 개념

간단하게 생각하면 유닛 테스트를 끝내고, 전체적으로 코드가 정상적으로 통작하는지 검증하는 테스트 코드.<br>
유닛테스트로 만들어진 코드들을 API를 사용해서 보내는것 처럼 생각하고 코드를 검증한다.

## Create Integration Test

### 데이터 생성 검증

`request`를 직접 보내는 것 처럼 만들어줘야 하는데, 기본적으로 설정해줘야 할 것들이 몇가지 존재한다.

1. `express`에서 사용하기 위해 작성된 `supertest`를 활용한 request 생성 ([supertest npm](https://www.npmjs.com/package/supertest))

```js
const request = require("supertest");
```

> The motivation with this module is to provide a high-level abstraction for testing HTTP, while still allowing you to drop down to the lower-level API provided by superagent.

결국 간단하게 보자면 HTTP 테스트를 진행할 수 있는 라이브러리라고 생각하면 된다.

```js
//supertest 예제
const request = require("supertest");
const express = require("express");

const app = express();

app.get("/user", function (req, res) {
  res.status(200).json({ name: "john" });
});

describe("GET /users", function () {
  it("responds with json", async function () {
    const response = await request(app)
      .get("/users")
      .set("Accept", "application/json");
    expect(response.headers["Content-Type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.email).toEqual("foo@bar.com");
  });
});

describe("POST /users", function () {
  it("responds with json", function (done) {
    request(app)
      .post("/users")
      .send({ name: "john" })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        return done();
      });
  });
});
```

위 코드를 보면 await로 받아서 반환된 값을 가지고 `expect-matcher`를 활용한 테스트를 하고있는 것을 알 수 있다.
supertest를 기반으로 작성할 때 검증하는 다른 API도 존재한다.

```js
request(app)
  .get('/')
  .expect(hasPreviousAndNextKeys)
  .end(done);

function hasPreviousAndNextKeys(res) {
  if (!('next' in res.body)) throw new Error("missing next key");
  if (!('prev' in res.body)) throw new Error("missing prev key");
}

.expect(status[, fn])
//Assert response status code.
//반환된 status 코드 검증
.expect(status, body[, fn])
//Assert response status code and body.
//반환된 status 코드와 body 검증
.expect(body[, fn])
//Assert response body text with a string, regular expression, or parsed body object.
//문자열, 정규표현식 또는 구문 분석된 본문 개체를 사용하여 반환된 값 검증
.expect(field, value[, fn])
//Assert header field value with a string or regular expression.
//문자열, 정규표현식 header 값을 검증
.expect(function(res) {})
//Pass a custom assertion function. It'll be given the response object to check. If the check fails, throw an error.
//사용자 정의 검증 함수를 전달. 반환 값을 검증할 수 있게 함수로 전달해준다. 검증에 실패하면 오류를 뱉는다.
```

위와 같이 `hasPreviousAndNextKeys` 같은 검증 함수를 작성해서 반환된 `res` 값을 검증하는 방법도 있다.

```js
//------------------server.js
const server = app.listen(port);
console.log(`Running on port ${port}`);

//error handler middleware
app.use((error, req, res, next) => {
  res.status(500).json({ message: error.message });
});
module.exports = { app, server };
//------------------------------------



//------------------new-product.json
{
  "name": "Gloves",
  "description": "good to wear",
  "price": 15
}
//------------------------------------



//------------------products.int.test.js
const { app, server } = require("../../server");
const newProductData = require("../data/new-product.json");
afterAll((done) => {
  server.close(done);
});
//------------------------------------
```

- 서버의 API를 불러와야하기 때문에, 서버가 실행되는 `express` 객체와 서버를 따로 export해서 통합 테스트 코드로 가져온다.
- `newProductData`는 입력할 때 사용할 임의의 데이터로 json형식으로 저장할 파일을 정리해둔다.
  > `afterAll()`은 모든 테스트가 종료될 때 마다 실행하는 메서드로, server를 종료시켜주는 `server.close()`를 실행시키는데, 이유는 스레드가 종료되지 않으면 jest에서 오류를 반환해서 테스트 코드를 통과시킬 수 없다.

```js
it("POST /api/products", async () => {
  const response = await request(app)
    .post("/api/products")
    .send(newProductData);
  expect(response.statusCode).toBe(201);
  expect(response.body.name).toBe(newProductData.name);
  expect(response.body.description).toBe(newProductData.description);
});
```

`supertest`로 생성한 `request`로 실제 API를 보낸다. 중요한 점은 실제로 보내져서 DB에 저장이 된다는 점이다.<br>
DB에서 반환된 값과, 저장할 때 사용한 `newProductData`의 값과 같은지를 검사하면 `create` 부분이 끝나게 된다.

### 에러 검증

```js
it("should return 500 on POST /api/products", async () => {
  const response = await request(app)
    .post("/api/products")
    .send({ name: "phone" });
  expect(response.statusCode).toBe(500);
  // console.log('response body : ', response.body);
  expect(response.body).toStrictEqual({
    message:
      "Product validation failed: description: Path `description` is required.",
  });
});
```

에러도 간단하게 정리할 수 있다. request를 할 때, required되는 값을 빼고 보내기만 하면 된다.
아무거나 어떤거든 상관없다. 중요한점은 이건데, test코드를 작성하는 부분에서 반환되는 메시지를 우리는 알 수 없기 때문에 한번 실행하면서 `console.log()`로 반환되는 값을 확인한다.

메시지를 가져와서 `toStrictEqual()`메서드를 통해 반환된 값이 일치한는지 검증할 수 있게 만들어준다.
이렇게 되면 앞으로 `/api/products`를 사용하는 API에서 수정하더라도 똑같은 테스트를 했을 때 똑같은 반환값이 나와야 하기때문에 API의 요구사항을 강제할 수 있다.
