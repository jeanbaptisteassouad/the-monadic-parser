const generateUniqueKey = (name) => {
  return Symbol(name)
}

const create = (name) => {
  const key = generateUniqueKey(name)
  const get = (a) => a[key]
  const set = (b, a) => a[key] = b
  const update = (f, a) => set(f(get(a)), a)
  return [get, set, update]
}

module.exports = {
  create,
}