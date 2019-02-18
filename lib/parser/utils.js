const firstUpper = str => {
  return str.substr(0, 1).toUpperCase() + str.substr(1)
}

const by = (matched, p1) => {
  return 'By' + firstUpper(p1)
}

const defineOperationId = (operation, path) => {
  const parts = path.split('/').slice(1)
  const opId = parts
    .map((item, i) => (i > 0 ? firstUpper(item) : item))
    .join('')
    .replace(/{(\w+)}/g, by)
    .replace(/[^a-z]/gi, '')
  return opId
}

const defineUrl = path => {
  const prefix = defineRoutePrefix(path)
  const route = path.replace(/{(\w+)}/g, ':$1').replace(`/${prefix}`, '')

  return route === '' ? '/' : route
}

const defineRoutePrefix = path => {
  return path === '/' ? 'root' : path.split('/')[1]
}

const copyProps = (source, dest, properties) => {
  properties.forEach(item => {
    if (source[item]) {
      dest[item] = source[item]
    }
  })
}

module.exports = { defineOperationId, defineUrl, copyProps, defineRoutePrefix }
