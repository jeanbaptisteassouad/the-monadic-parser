// This is the State monad
const root_path = '..'

const Accessors = require(root_path + '/accessors')

const [getF, setF] = Accessors.create()

const state = (s_to_a_s) => {
  const a = {}

  setF(s_to_a_s, a)

  return a
}

// (State<s, a>, s) -> [a, s]
const runState = (state, s) => {
  return getF(state)(s)
}

// a -> State<s, a>
const pure = (a) => state((s) => [a, s])
// () -> State<s, s>
const get = () => state((s) => [s, s])
// s -> State<s, Undefined>
const set = (a) => state((s) => [undefined, a])

// State<s, a> -> (a -> State<s, b>) -> State<s, b>
const then = (state_a, a_to_state_b) => {
  return state((s) => {
    const [a, s_prime] = runState(state_a, s)
    const b_state = a_to_state_b(a)
    return runState(b_state, s_prime)
  })
}

// (a -> b) -> (State<s, a> -> State<s, b>)
const map = (a_to_b, state_a) => {
  return state((s) => {
    const [a, s_prime] = runState(state_a, s)
    return [a_to_b(a), s_prime]
  })
}

// State<s, a> -> a
const evalState = (state_a, s) => {
  return runState(state_a, s)[0]
}

// State<s, a> -> s
const execState = (state_a, s) => {
  return runState(state_a, s)[1]
}

module.exports = {
  pure,
  then,
  get,
  set,
  runState,
  evalState,
  execState
}



