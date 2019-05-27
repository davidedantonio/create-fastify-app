'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/hello', async function (request, reply) {
    return 'hello, world!'
  })
}
