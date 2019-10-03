
const Accessors = require('./accessors')

const [getF, setF] = Accessors.create()

const state = (s_to_a_s) => {
  const a = {}

  setF(s_to_a_s, a)

  return a
}

const runState = (state, s) => {
  return getF(state)(s)
}

const pure = (a) => state((s) => [a, s])
const get = () => state((s) => [s, s])
const set = (a) => state((s) => [undefined, a])

const then = (a_state, a_to_b_state) => {
  return state((s) => {
    const [a, s_prime] = runState(a_state, s)
    const b_state = a_to_b_state(a)
    return runState(b_state, s_prime)
  })
}
const bin = (a_state, b_state) => then(a_state, () => b_state)


const evalState = (a_state, s) => {
  return runState(a_state, s)[0]
}

const execState = (a_state, s) => {
  return runState(a_state, s)[1]
}


const chain = (...statements) => {
  let ans = pure()
  statements.forEach(statement => {
    if (typeof(statement) === 'function') {
      ans = then(ans, statement)
    } else {
      ans = bin(ans, statement)
    }
  })
  return ans
}

const _compose = (b_to_c_state, a_to_b_state) => {
  return (a) => then(a_to_b_state(a), (b) => b_to_c_state(b))
}

const compose = (...a_to_b_state) =>
  a_to_b_state.reduce((acc, val) => _compose(acc, val))


module.exports = {
  pure,
  get,
  set,
  evalState,
  execState,
  chain,
  compose,
}



