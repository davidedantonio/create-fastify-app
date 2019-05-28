'use strict'

const fp = require('fastify-plugin')
const symbolRequestTime = Symbol("RequestTimer")
const symbolServerTiming = Symbol("ServerTiming")

function fastifyRoutesInfo (fastify, opts, next) {
  fastify.decorate('routesInfo', new Map())

  fastify.addHook('onRoute', routeOptions => {
    const { method, schema, url, bodyLimit, logLevel, prefix } = routeOptions
    const methods = Array.isArray(method) ? method : [method]

    for (let method of methods) {
      const route = { method, schema, url, logLevel, prefix, bodyLimit }

      Object.assign(route, {
        requests: 0,
        requestsTotalTime: 0,
        requestsAverage: 0
      })

      fastify.routesInfo.set(`${method} ${url}`, route)
    }
  })

  fastify.addHook('onRequest', async (request, reply) => {
    request.req[symbolRequestTime] = process.hrtime()
    reply.res[symbolServerTiming] = {}
  })

  fastify.addHook('onResponse', async (request, reply) => {
    // Calculate the duration, in nanoseconds …
    const hrDuration = process.hrtime(request.req[symbolRequestTime])
    // … convert it to milliseconds …
    const duration = (hrDuration[0] * 1e3 + hrDuration[1] / 1e6)


    if (fastify.routesInfo.has(`${request.raw.method} ${request.raw.url}`)) {
      let infos = fastify.routesInfo.get(`${request.raw.method} ${request.raw.url}`)
      infos.requests++
      infos.requestsTotalTime += duration
      infos.requestsAverage = infos.requestsTotalTime / infos.requests
    }

    fastify.routesInfo.set(`${request.raw.method} ${request.raw.url}`, infos)
  })

  next()
}

module.exports = fp(fastifyRoutesInfo, {
  fastify: '>= 2.0.0',
  name: 'fastify-routesInfo'
})