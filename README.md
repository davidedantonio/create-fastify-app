# create-fastify-app

Create Fastify App is an utility that help you to generate or add plugin to your Fastify project. This mean that you can easily:

- Generate a Fastify Project, also from a given swagger file.
- Generate a service skeleton in existing Fastify Project.
- Add Cors plugin in existing Fastify Project.
- Add MongoDB plugin in existing Fastify Project.
- Add Redis plugin in existing Fastify Project.

## Install

If you want to use `create-fastify-app` you must first install globally on your machine

```
npm install -g create-fastify-app
```

## Usage

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

Except for `generate:project` command the others work on an existent project created with `create-fastify-app`.

### `generate:project`

Generate a new Fastify project run following command

```
create-fastify-app generate:project -d <project-folder>
```

If `-d`, or `--directory`, option is omitted the new project will be created in curret folder. At this point further information will be asked:

- **Application Name**: the application name.
- **Description**: a short description non how the application do.
- **Author**: the application author.
- **Email**: the application email author.
- **Version**: semver version.
- **Keywords**: a list of comma separated keywords.
- **License**: the application license.
- **Swagger File**: a swagger file to start from (YAML or JSON).

After providing these information the entire application skeleton will be created for you.

### `generate:service`

This command allow you to generate a new service skeleton for your api. You simply run

```
create-fastify-app generate:service -d <project-folder>
```

And give some information such as:

- **Service Name**: The name of the service you want to generate
- **Methods to implement**: GET, POST, PUT, DELETE etc.
- **Api Prefix**: The prefix url (for example `/api`)

Moreover the command generate for you a small set of test foreach methods.

### `add:mongo`

If you want to easily add the [`fastify-mongodb`](https://github.com/fastify/fastify-mongodb) plugin to your application this command is all you need. Just simply run

```
create-fastify-app add:mongo -d <project-folder>
```

And give some information such as:

- **MongoDB Host**: your MongoDB host.
- **MongoDB Port**: your MongoDB port.
- **MongoDB Collection**: your default collection.
- **MongoDB User**: your MongoDB user.
- **MongoDB Password**: your MongoDB password.

At this point the command add the `fastify-mongodb` to you application and create or update an `.env` file with the given information for your [MongoDB](https://www.mongodb.com) connection.

### `add:redis`

If you want to easily add the [`fastify-redis`](https://github.com/fastify/fastify-redis) plugin just simply run

```
create-fastify-app add:redis -d <project-folder>
```

And give some information such as:

- **Redis Host**: your redis host
- **Redis Port**: your redis port
- **Redis Password**: your redis password, if you have one.
- **Redis Index**: your redis index

exactly as the `fastify-mongodb` command `fastify-redis` add the plugin into your application and create or update an `.env` file with the given information for your [Redis](https://redis.io) connection.

### `add:cors`

If you want to easily add the [`fastify-cors`](https://github.com/fastify/fastify-cors) plugin just simply run

```
create-fastify-app add:cors -d <project-folder>
```

And give some information such as:

- **Method**: at least one of DELETE, PATCH, POST, PUT, HEAD, OPTIONS

exactly as the `fastify-mongodb` command `fastify-redis` add the plugin into your application and create or update an `.env` file with the given information for your [Redis](https://redis.io) connection.