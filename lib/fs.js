'use strict'

const { promisify } = require('util')
const fs = require('fs')
const access = promisify(fs.access)
const write = promisify(fs.writeFile)
const read = promisify(fs.readFile)
const mkdir = promisify(fs.mkdir)
const append = promisify(fs.appendFile)

const fileExists = async file => {
  try {
    await access(file, fs.F_OK)
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw new Error(e)
    }
    return false
  }
  return true
}

const writeFile = async (file, data, opts) => {
  try {
    await write(file, data, opts)
  } catch (e) {
    throw new Error(e)
  }
  return true
}

const readFile = async (file, opts) => {
  let fileContent
  try {
    fileContent = await read(file, opts)
  } catch (e) {
    throw new Error(e)
  }
  return fileContent
}

const createDir = async (file, opts) => {
  try {
    await mkdir(file, opts)
  } catch (e) {
    throw new Error(e)
  }
}

const appendFile = async (path, data, opts) => {
  try {
    await append(path, data, opts)
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  fileExists,
  writeFile,
  readFile,
  createDir,
  appendFile
}
