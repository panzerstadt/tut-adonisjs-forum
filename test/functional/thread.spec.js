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

  response.error && console.log(response.error);

  response.assertStatus(200);
  const thread = await Thread.firstOrFail();
  response.assertJSON({ thread: thread.toJSON() });
  response.assertJSONSubset({ thread: { ...payload, user_id: user.id } });
});

test("authorized user can delete threads", async ({ client, assert }) => {
  const thread = await Factory.model("App/Models/Thread").create();
  const owner = await thread.user().first();

  const response = await client
    .delete(thread.url())
    .loginVia(owner)
    .send()
    .end();

  response.error && console.log(response.error);

  response.assertStatus(204);
  assert.equal(await Thread.getCount(), 0);
});

test("thread cannot be deleted by a user who did not create it", async ({
  client
}) => {
  const thread = await Factory.model("App/Models/Thread").create();
  const notOwner = await Factory.model("App/Models/User").create();
  const response = await client
    .delete(thread.url())
    .send()
    .loginVia(notOwner)
    .end();
  response.assertStatus(403);
});

test("authorized user can update title and body of threads", async ({
  assert,
  client
}) => {
  const thread = await Factory.model("App/Models/Thread").create();
  const attributes = { title: "new title", body: "new body" };
  const updatedThreadAttributes = { ...thread.toJSON(), ...attributes };

  const owner = await thread.user().first();

  const response = await client
    .put(thread.url())
    .loginVia(owner)
    .send(attributes)
    .end();

  response.error && console.log(response.error);

  await thread.reload();

  response.assertStatus(200);
  response.assertJSON({ thread: thread.toJSON() });
  assert.deepEqual(thread.toJSON(), updatedThreadAttributes);
});

test("unauthenticated user cannot update threads", async ({ client }) => {
  const thread = await Factory.model("App/Models/Thread").create();
  const response = await client
    .put(thread.url())
    .send()
    .end();

  response.assertStatus(401);
});

test("thread cannot be updated by a user who did not create it", async ({
  client
}) => {
  const thread = await Factory.model("App/Models/Thread").create();
  const notOwner = await Factory.model("App/Models/User").create();
  const response = await client
    .put(thread.url())
    .loginVia(notOwner)
    .send()
    .end();
  response.assertStatus(403);
});
