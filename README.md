# create-fastify-app

Create Fastify App is an utility that help you to start and add plugin to your Fastify projects. This mean that you can easily:
- Generate a Fastify Project
- Generate a Fastify Project from a given swagger file
- Generate a service skeleton in existing Fastify Project
- Add Cors plugin in existing Fastify Project
- Add MongoDB plugin in existing Fastify Project
- Add Redis plugin in existing Fastify Project

## Install

If you want to use `create-fastify-app` you must first install globally on your machine

```
npm install -g create-fastify-app
```

# Usage

```
Generate Fastify projects and utilities:

  create-fastify-app [command] <options>

Command
  generate:project      Generate a ready to use Fastify project
  generate:service      Generate service skeleton source in given project
  add:mongo             Add MongoDB plugin in given project folder
  add:cors              Add CORS plugin in given project folder
  add:redis             Add Redis plugin in given project folder

Options

  -d, --directory
      Fastify project folder

  -h, --help
      Show this help message
```