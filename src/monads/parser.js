
const State = require('./state')
const Either = require('./either')

const ParserState = require('./parser-state')

// Parser a === State s (Either e a)
// a -> Parser a
const pure = (a) => State.pure(Either.pure(a))

// e -> Parser a
const fail = (e) => {
  let reading_head
  return pipeX(
    getReadingHead,
    capture(a => reading_head = a),
    get,
    capture(s => ParserState.setFailedHead(reading_head, s)),
    () => _fail(e),
  )
}
const _fail = (e) => State.pure(Either.left(e))

// () -> Parser s
const get = () => State.then(State.get(), pure)

// (a -> ()) -> a -> Parser ()
const capture = (f) => (a) => {
  f(a)
  return pure(undefined)
}

// Parser a -> (e -> Parser b) -> (a -> Parser b) -> Parser b
const caseOf = (parser_a, leftCallback, rightCallback) => 
  State.then(parser_a, (either_a) =>
    Either.caseOf(either_a, leftCallback, rightCallback)
  )

// Parser a -> (a -> Parser b) -> Parser b
// State s (Either e a) -> (a -> State s (Either e b)) -> State s (Either e b)
const then = (state_either_a, a_to_state_either_b) =>
  State.then(state_either_a, (either_a) =>
    Either.caseOf(
      either_a,
      () => State.pure(either_a),
      a_to_state_either_b
    )
  )

// (a -> Parser b) -> (b -> Parser c) -> (a -> Parser c)
const _pipe = (a_to_parser_b, b_to_parser_c) => {
  return (a) => {
    const parser_b = a_to_parser_b(a)
    return then(parser_b, b_to_parser_c)
  }
}
const pipe = (...args) => args.reduce((acc, val) => _pipe(acc, val))
const pipeX = (...args) => pipe(...args)()


// () -> Parser Int
const getReadingHead = pipe(
  get,
  (s) => pure(ParserState.getReadingHead(s))
)

// Int -> () -> Parser ()
const setReadingHead = (a) => pipe(
  get,
  (s) => pure(ParserState.setReadingHead(a, s))
)

// (Int -> Int) -> () -> Parser ()
const updateReadingHead = (f) => pipe(
  get,
  (s) => pure(ParserState.updateReadingHead(f, s))
)

// Int -> () -> Parser ()
const consume = (x) => updateReadingHead(a=>a+x)
// () -> Parser ()
const consumeOne = consume(1)


// () -> Parser String
const getString = pipe(
  get,
  (s) => pure(ParserState.getString(s))
)

// String -> Parser a -> a
const parse = (str, parser) => {
  const [either_ans, final_state] = State.runState(parser, ParserState.create(str))
  return Either.caseOf(either_ans,
    (msg) => {
      console.log(final_state)
      const reading_head = ParserState.getReadingHead(final_state)
      const failed_head = ParserState.getFailedHead(final_state)
      let error_str = `unexpected ${JSON.stringify(str[failed_head])}`
      if (msg) {
        error_str = error_str+', expecting '+msg
      }
      throw new Error(error_str)
    },
    (ans) => {
      console.log(final_state)
      return ans
    }
  )
}




// (() -> Parser a) -> (() -> Parser a) -> (() -> Parser a)
const _or = (es, p, ...ps) => pipe(
  getReadingHead,
  (reading_head) => caseOf(p(),
    (e) => pipeX(
      getReadingHead,
      (next_reading_head) => {
        es.push(e)
        if (reading_head !== next_reading_head) {
          return _fail(e)
        } else if (0 < ps.length) {
          return _or(es, ...ps)()
        } else {
          return _fail(es.join(' or '))
        }
      }
    ),
    pure
  )
)
const or = (p, ...ps) => _or([], p, ...ps)

// (() -> Parser a) -> (() -> Parser a)
const ttry = (p) => pipe(
  getReadingHead,
  (reading_head) => caseOf(p(),
    (e) => pipeX(
      setReadingHead(reading_head),
      () => _fail(e)
    ),
    pure
  )
)

// (() -> Parser a) -> String -> (() -> Parser a)
const label = (p, str) => pipe(
  getReadingHead,
  (reading_head) => caseOf(p(),
    (e) => pipeX(
      getReadingHead,
      (next_reading_head) => {
        if (reading_head !== next_reading_head) {
          return _fail(e)
        } else {
          return _fail(str)
        }
      }
    ),
    pure
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

// const many1
// const count
// const between
// const option
// const optional
// const sepBy
// const sepBy1
// const endBy
// const endBy1
// const sepEndBy
// const sepEndBy1
// const chainl
// const chainl1
// const chainr
// const chainr1
// const eof
// const notFollowedBy
// const manyTill
// const lookAhead
// const anyToken


module.exports = {
  getReadingHead,
  consume,
  consumeOne,

  fail,
  capture,

  getString,

  parse,


  pipe,
  pipeX,
  pure,

  or,
  ttry,
  label,
  many,
}

