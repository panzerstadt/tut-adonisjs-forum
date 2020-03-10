"use strict";

const { test, trait } = use("Test/Suite")("Thread");

const Thread = use("App/Models/Thread");

trait("Test/ApiClient");
trait("DatabaseTransactions");

test("can create threads", async ({ client }) => {
  const response = await client
    .post("/threads")
    .send({
      title: "test title",
      body: "body"
    })
    .end();

  console.log(response.error);
  response.assertStatus(200);
  const thread = await Thread.firstOrFail();
  response.assertJSON({ thread: thread.toJSON() });
});

test("can delete threads", async ({ client, assert }) => {
  const thread = await Thread.create({
    title: "test title",
    body: "test body"
  });

  const response = await client
    .delete(`threads/${thread.id}`)
    .send()
    .end();
  console.log(response.error);
  response.assertStatus(204);
  assert.equal(await Thread.getCount(), 0);
});
