'use strict'

const fs = require('fs')

const fileExists = file => new Promise((resolve, reject) => {
  fs.access(file, fs.F_OK, err => {
    if (err) {
      if (err.code !== 'ENOENT') {
        return reject(err)
      }
      return resolve(false)
    }
    resolve(true)
  })
})

const writeFile = (file, data, opts) => new Promise((resolve, reject) => {
  fs.writeFile(file, data, opts, err => {
    if (err) {
      reject(err)
    }
    resolve(true)
  })
})

const readFile = (file, opts) => new Promise((resolve, reject) => {
  fs.readFile(file, opts, (err, data) => {
    if (err) {
      reject(err)
    }
    resolve(data)
  })
})

const createDir = (file, opts) => new Promise((resolve, reject) => {
  fs.mkdir(file, opts, err => {
    if (err) {
      reject(err)
    }
    resolve(true)
  })
})

const appendFile = (path, data, opts) => new Promise((resolve, reject) => {
  fs.appendFile(path, data, opts, err => {
    if (err) {
      reject(err)
    }
    resolve(true)
  })
})

module.exports = {
  fileExists,
  writeFile,
  readFile,
  createDir,
  appendFile
}
