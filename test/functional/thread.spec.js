"use strict";

const { test, trait } = use("Test/Suite")("Thread");

const Thread = use("App/Models/Thread");
const Factory = use("Factory");

trait("Auth/Client");
trait("Test/ApiClient");
trait("DatabaseTransactions");

test("unauthenticated user cannot create threads", async ({ client }) => {
  const response = await client
    .post("/threads")
    .send({
      title: "test title",
      body: "body"
    })
    .end();

  response.assertStatus(401);
});

test("unauthenticated user cannot delete threads", async ({ client }) => {
  const thread = await Factory.model("App/Models/Thread").create();
  const response = await client
    .delete(thread.url())
    .send()
    .end();
  response.assertStatus(401);
});

test("authorized user can create threads", async ({ client }) => {
  const payload = {
    title: "test title",
    body: "body"
  };
  const user = await Factory.model("App/Models/User").create();
  const response = await client
    .post("/threads")
    .loginVia(user)
    .send(payload)
    .end();

  console.log(response.error);
  response.assertStatus(200);
  const thread = await Thread.firstOrFail();
  response.assertJSON({ thread: thread.toJSON() });
  response.assertJSONSubset({ thread: { ...payload, user_id: user.id } });
});

test("authorized user can delete threads", async ({ client, assert }) => {
  const user = await Factory.model("App/Models/User").create();
  const thread = await Factory.model("App/Models/Thread").create();

  const response = await client
    .delete(thread.url())
    .loginVia(user)
    .send()
    .end();
  console.log(response.error);
  response.assertStatus(204);
  assert.equal(await Thread.getCount(), 0);
});
