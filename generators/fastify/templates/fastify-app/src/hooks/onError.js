'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async (fastify, opts) => {
  fastify.addHook('onError', async (request, reply) => {
    // Notice: the next callback is not available when using async/await
    // or returning a Promise. If you do invoke a next callback in this
    // situation unexpected behavior may occur, e.g. duplicate invocation
    // of handlers.

    // Notice: in the onRequest and preValidation hooks, request.body will
    // always be null, because the body parsing happens before the preHandler
    // hook.
  })

  // fastify.addHook('onError', (request, reply, next) => {
  //   next()
  // })
})
