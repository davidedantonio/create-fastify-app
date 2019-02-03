'use strict'

const Generator = require('yeoman-generator')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')

module.exports = class extends Generator {
  prompting () {
    this.log(`Welcome to the ${chalk.red('Fastify')} generator!`)

    const prompts = [
      { type: String, name: 'projectName', message: 'Your project name?', default: 'fastify-app' },
      { type: String, name: 'projectDestination', message: 'Your project path?', default: './' },
      { type: String, name: 'author', message: 'Author?', default: this.user.git.name() },
      { type: String, name: 'email', message: 'Email?', default: this.user.git.email() },
      { type: String, name: 'version', message: 'Version?', default: '1.0.0' },
      { type: String, name: 'keywords', message: 'Keywords (comma separated)' }
    ]

    return this.prompt(prompts).then( props => {
      this.props = props
    })
  }

  writing () {
    if (!fs.existsSync(this.props.projectDestination)) {
      this.log(`The directory ${chalk.red(this.props.projectDestination)} does not exist!`)
      process.exit(1)
    }

    const destination = path.join(this.props.projectDestination, this.props.projectName)
    this.fs.copy(
      this.templatePath('fastify-template-app'),
      this.destinationPath(destination)
    )

    this.destinationRoot(destination)
  }

  beforeInstall () {
    let packageJson = JSON.parse(fs.readFileSync(path.join(this.templatePath('fastify-template-app'), 'package.json'), 'utf8'))

    packageJson = Object.assign(packageJson, {
      name: this.props.projectName,
      version: this.props.version,
      author: `${this.props.author} <${this.props.email}>`,
      keywords: this.props.keywords ? this.props.keywords.split(',') : []
    })

    fs.writeFileSync(
      path.join(this.templatePath('fastify-template-app'), 'package.json'),
      JSON.stringify(packageJson, null, 2),
      'utf8'
    )
    this.log(`${chalk.green('package.json updated')}`)
  }

  install () {
    this.beforeInstall()
    this.npmInstall()
  }

  end () {
    this.log(`${chalk.green('Installation complete 🎉')}`)
  }
}
