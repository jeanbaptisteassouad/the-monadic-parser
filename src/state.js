
const Accessors = require('./accessors')

const [getF, setF] = Accessors.create()

const state = (s_to_a_s) => {
  const a = {}

  setF(s_to_a_s, a)

  return a
}

// State s a -> [a, s]
const runState = (state, s) => {
  return getF(state)(s)
}

// a -> State s a
const pure = (a) => state((s) => [a, s])
// () -> State s s
const get = () => state((s) => [s, s])
// s -> State s ()
const set = (a) => state((s) => [undefined, a])

// State s a -> (a -> State s b) -> State s b
const then = (a_state, a_to_b_state) => {
  return state((s) => {
    const [a, s_prime] = runState(a_state, s)
    const b_state = a_to_b_state(a)
    return runState(b_state, s_prime)
  })
}
// State s a -> State s b -> State s b
const the = (a_state, b_state) => then(a_state, () => b_state)

// State s a -> a
const evalState = (a_state, s) => {
  return runState(a_state, s)[0]
}

// State s a -> s
const execState = (a_state, s) => {
  return runState(a_state, s)[1]
}

// (b -> State s c) -> (a -> State s b) -> (a -> State s c)
const _compose = (b_to_c_state, a_to_b_state) => {
  return (a) => then(a_to_b_state(a), (b) => b_to_c_state(b))
}
const compose = (...a_to_b_states) =>
  a_to_b_states.reduce((acc, val) => _compose(acc, val))

// (a -> State s b) -> (b -> State s c) -> (a -> State s c)
const pipe = (...a_to_b_states) =>
  compose(...a_to_b_states.reverse())

const pipeX = (...args) => pipe(...args)()

module.exports = {
  runState,
  pure,
  get,
  set,
  evalState,
  execState,
  pipe,
  pipeX,
  then,
  the,
  compose,
}



