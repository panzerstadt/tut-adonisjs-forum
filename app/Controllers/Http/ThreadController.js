"use strict";

const Thread = use("App/Models/Thread");

class ThreadController {
  async store({ response, request, auth }) {
    const thread = await auth.user
      .threads()
      .create(request.only(["title", "body"]));

    return response.json({ thread });
  }

  async destroy({ params }) {
    await Thread.query()
      .where("id", params.id)
      .delete();
  }

  async update({ params, request, response }) {
    const thread = await Thread.findOrFail(params.id);
    // this is one way
    // const payload = request.body;
    // thread.title = payload.title;
    // thread.body = payload.body;

    // this is another way
    thread.merge(request.only(["title", "body"]));

    await thread.save();
    return response.json({ thread });
  }
}

module.exports = ThreadController;
