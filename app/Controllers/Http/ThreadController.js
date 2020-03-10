"use strict";

const Thread = use("App/Models/Thread");

class ThreadController {
  async store({ response, request }) {
    const thread = await Thread.create(request.only(["title", "body"]));

    return response.json({ thread });
  }

  async destroy({ params }) {
    const thread = await Thread.findOrFail(params.id);
    await thread.delete();
  }
}

module.exports = ThreadController;
