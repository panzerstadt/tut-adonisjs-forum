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
    const thread = await Thread.findOrFail(params.id);
    await thread.delete();
  }
}

module.exports = ThreadController;
