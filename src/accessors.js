const generateUniqueKey = (name) => {
  return Symbol(name)
}

const create = (name) => {
  const key = generateUniqueKey(name)

  // object -> a
  const get = (a) => a[key]
  // (a, object) -> Undefined
  const set = (b, a) => {a[key] = b}
  // (a -> a, object) -> Undefined
  const update = (f, a) => set(f(get(a)), a)
  return [get, set, update]
}

module.exports = {
  create,
}