'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async (fastify, opts) => {
  fastify.addHook('preSerialization', async (request, reply) => {
    // Notice: the next callback is not available when using async/await
    // or returning a Promise. If you do invoke a next callback in this
    // situation unexpected behavior may occur, e.g. duplicate invocation
    // of handlers.
    fastify.log.trace('request.body > ', {reqId: request.raw.id, body: request.body}); //log request body 
    fastify.log.trace('response.body >', {reqId:request.raw.id, payload}); //log response body
  })

  // fastify.addHook('preSerialization', (request, reply, next) => {
  //   next()
  // })
})
