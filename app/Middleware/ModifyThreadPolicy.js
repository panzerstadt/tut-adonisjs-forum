"use strict";
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Thread = use("App/Models/Thread");

class ModifyThreadPolicy {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle({ params, auth, response }, next) {
    const thread = await Thread.findOrFail(params.id);
    if (thread.user_id !== auth.user.id) {
      return response.forbidden();
    }
    // call next to advance the request
    await next();
  }
}

module.exports = ModifyThreadPolicy;
