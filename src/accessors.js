const generateUniqueKey = (name) => {
  return Symbol(name)
}

const create = (name) => {
  const key = generateUniqueKey(name)
  // key -> a
  const get = (a) => a[key]
  // a -> key -> ()
  const set = (b, a) => {a[key] = b}
  // (a -> a) -> key -> ()
  const update = (f, a) => set(f(get(a)), a)
  return [get, set, update]
}

module.exports = {
  create,
}