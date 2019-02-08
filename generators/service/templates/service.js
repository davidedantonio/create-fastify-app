'use strict'

module.exports = async function(fastify, opts) {
  {{#each methods}}
  fastify.{{toLowerCase this}}('/{{../serviceName}}', async function (request, reply) {

    // Implement your business logic here...

    return reply
      .code(200)
      .send({data: '{{this}} ok!'})
  })

  {{/each}}
}

{{#if routePrefix}}
module.exports.routePrefix = '{{routePrefix}}'
{{/if}}