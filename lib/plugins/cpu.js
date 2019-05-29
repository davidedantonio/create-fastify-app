'use strict'

const os = require('os')

function getCpuUsage (sampleTime = 100) {
  return new Promise((resolve, reject) => {
    try {
      const first = os.cpus().map(cpu => cpu.times)
      setTimeout(() => {
        try {
          const second = os.cpus().map(cpu => cpu.times)
          setTimeout(() => {
            try {
              const third = os.cpus().map(cpu => cpu.times)
              const infos = []
              const usages = []
              for (let i = 0; i < first.length; i++) {
                const firstIdle = first[i].idle
                const firstTotal = first[i].idle + first[i].user + first[i].nice + first[i].sys + first[i].irq
                const secondIdle = second[i].idle
                const secondTotal = second[i].idle + second[i].user + second[i].nice + second[i].sys + second[i].irq
                const thirdIdle = third[i].idle
                const thirdTotal = third[i].idle + third[i].user + third[i].nice + third[i].sys + third[i].irq
                const firstUsage = 1 - (secondIdle - firstIdle) / (secondTotal - firstTotal)
                const secondUsage = 1 - (thirdIdle - secondIdle) / (thirdTotal - secondTotal)
                const perUsage = (firstUsage + secondUsage) / 2 * 100
                usages.push(perUsage)
                infos.push({
                  model: os.cpus()[i].model,
                  usage: perUsage
                })
              }

              resolve({
                avg: usages.reduce((a, b) => a + b, 0) / usages.length,
                infos: infos
              })
            } catch (err) {
              reject(err)
            }
          }, sampleTime)
        } catch (err) {
          reject(err)
        }
      }, sampleTime)
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = getCpuUsage
