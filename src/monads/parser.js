
const Accessors = require('./accessors')
const State = require('./state')
const Either = require('./either')

// Parser a === Either t (State s a)
// () -> Parser s
const get = () => Either.pure(State.get())
// a -> Parser a
const pure = (a) => Either.pure(State.pure(a))

// EitherT t (State s) a
// runEitherT :: State s (Either t a)

// Parser a -> (a -> Parser b) -> Parser b
// Either t (State s a) -> (a -> Either t (State s b)) -> Either t (State s b)
const none_key = Symbol()
const then = (either_state_a, a_to_either_state_b) => {
  const state_a_to_either_state_b = (state_a) => {
    State.then(state_a, (a) => {
      const either_state_b = a_to_either_state_b(a)
      const state_b = Either.fromRight(none_key, either_state_b)
      if (state_b !== none_key) {
        return state_b
      } else {
        
      }
    })
    const a = Either.fromRight(null, either_t_a)
    if (a !== null) {
      return a_to_parser_b(a)
    } else {
      return either_state_a
    }
  }
  return Either.then(either_state_a, state_a_to_either_state_b)
}

// (a -> Parser b) -> (b -> Parser c) -> (a -> Parser c)
const _pipe = (a_to_parser_b, b_to_parser_c) => {
  return (a) => {
    const parser_b = a_to_parser_b(a)
    return then(parser_b, b_to_parser_c)
  }
}
const pipe = (...args) => args.reduce((acc, val) => _pipe(acc, val))
const pipeX = (...args) => pipe(...args)()


const [_getReadingHead, _setReadingHead, _updateReadingHead] = Accessors.create()
// () -> Parser Int
const getReadingHead = pipe(
  get,
  (s) => pure(_getReadingHead(s))
)
// (Int -> Int) -> () -> Parser ()
const updateReadingHead = (f) => pipe(
  get,
  (s) => {
    _updateReadingHead(f, s)
    return pure()
  }
)
// Int -> () -> Parser ()
const consume = (x) => updateReadingHead(a=>a+x)
// () -> Parser ()
const consumeOne = consume(1)


const [_getString, _setString] = Accessors.create()
// () -> Parser String
const getString = pipe(
  get,
  (s) => pure(_getString(s))
)

const initState = (str) => {
  const a = {}

  _setReadingHead(0, a)
  _setString(str, a)

  return a
}

// String -> Parser a -> a
const parse = (str, parser) => {
  return Either.fromRight(null, State.evalState(parser, initState(str)))
}


// // a -> Parser a
// const pure = State.pure


// Combinator

// // (a -> Parser b) -> (b -> Parser c) -> (a -> Parser c)
// const pipe = State.pipe
// // (a -> Parser b) -> (b -> Parser c) -> Parser c
// const pipeX = State.pipeX


// (() -> Parser a) -> (() -> Parser a) -> (() -> Parser a)
const or = (p, ...ps) => pipe(
  getReadingHead,
  (reading_head) => pipeX(
    p,
    (a) => pipeX(
      getReadingHead,
      (next_reading_head) => {
        if (reading_head !== next_reading_head) {
          return pure(a)
        } else if (ps.length === 0) {
          return pure(null) /////////////////////////
        } else {
          return or(...ps)()
        }
      }
    )
  )
)

// (() -> Parser a) -> (() -> Parser [a])
const many = (p) => pipe(
  getReadingHead,
  (reading_head) => pipeX(
    p,
    (a) => pipeX(
      getReadingHead,
      (next_reading_head) => {
        if (reading_head !== next_reading_head) {
          return pipeX(
            many(p),
            (array) => {
              array.push(a)
              return pure(array)
            }
          )
        } else {
          return pure([])
        }
      }
    )
  )
)



module.exports = {
  getReadingHead,
  consume,
  consumeOne,

  getString,

  parse,


  pipe,
  pipeX,
  pure,

  or,
  many,
}