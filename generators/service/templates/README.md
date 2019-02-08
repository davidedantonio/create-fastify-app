# Documentation for service {{#if routePrefix}}{{routePrefix}}{{/if}}/{{serviceName}}

{{#each methods}}
## {{this}} {{#if routePrefix}}{{routePrefix}}{{/if}}/{{../serviceName}}

{{/each}}