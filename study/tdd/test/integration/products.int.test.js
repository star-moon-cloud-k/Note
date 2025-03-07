const request = require("supertest");
const { app, server } = require("../../server");
const newProductData = require("../data/new-product.json");
const fakeId = "66d3be7ca1e159473ed55ec3";
let firstProduct;
afterAll((done) => {
  server.close(done);
});
it("POST /api/products", async () => {
  const response = await request(app)
    .post("/api/products")
    .send(newProductData);
  expect(response.statusCode).toBe(201);
  expect(response.body.name).toBe(newProductData.name);
  expect(response.body.description).toBe(newProductData.description);
});

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

it("GET /api/products", async () => {
  const response = await request(app).get("/api/products");
  expect(response.statusCode).toBe(200);
  expect(Array.isArray(response.body)).toBeTruthy();
  expect(response.body[0].name).toBeDefined();
  expect(response.body[0].description).toBeDefined();
  firstProduct = response.body[0];
});

it("GET /api/product/:productId", async () => {
  const response = await request(app).get("/api/products/" + firstProduct._id);
  expect(response.statusCode).toBe(200);
  expect(response.body.name).toBe(firstProduct.name);
  expect(response.body.description).toBe(firstProduct.description);
});

it("GET id doens't exist /api/products/:productId", async () => {
  const response = await request(app).get(
    "/api/products/66d3be7ca1e159473ed55ec3"
  );
  expect(response.statusCode).toBe(404);
});

it("PUT /api/products", async () => {
  const res = await request(app)
    .put("/api/products/" + firstProduct._id)
    .send({ name: "updatedName", description: "updated description" });

  expect(res.statusCode).toBe(200);
  expect(res.body.name).toBe("updatedName");
  expect(res.body.description).toBe("updated description");
});

it("should return 404 on PUT /api/products", async () => {
  const res = await request(app)
    .put("/api/products/" + fakeId)
    .send({ name: "updatedName", description: "updated description" });

  expect(res.statusCode).toBe(404);
});

it("DELETE /api/products", async () => {
  const res = await request(app)
    .delete("/api/products/" + firstProduct._id)
    .send();
  expect(res.statusCode).toBe(200);
});

it("DELETE id doesn't exist /api/products/:productId", async () => {
  const res = await request(app)
    .delete("/api/products/" + fakeId)
    .send();

  expect(res.statusCode).toBe(404);
});
