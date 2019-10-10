const root_path = '..'

const State = require(root_path + '/monads/state')
const Either = require(root_path + '/monads/either')

const ParserState = require(root_path + '/parser-state')

//***************//
// Monadic value //
//***************//

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


//*******************//
// Monadic Functions //
//*******************//

// () -> Parser s
const get = () => State.then(State.get(), pure)

// (a -> b) -> (a -> Parser b)
const pureDot = (f) => (a) => pure(f(a))

// (a -> ()) -> a -> Parser ()
const capture = (f) => (a) => {
  f(a)
  return pure(undefined)
}

// (a -> Parser b) -> (e -> Parser c) -> (b -> Parser c) -> (a -> Parser c)
const caseOf = (a_to_parser_b, leftCallback, rightCallback) => (a) =>
  State.then(a_to_parser_b(a), (either_b) =>
    Either.caseOf(either_b, leftCallback, rightCallback)
  )
const caseOfX = (a_to_parser_b, leftCallback, rightCallback) =>
  caseOf(a_to_parser_b, leftCallback, rightCallback)()

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
const _pipe = (a_to_parser_b, b_to_parser_c) => (a) => {
  const parser_b = a_to_parser_b(a)
  return then(parser_b, b_to_parser_c)
}

const pipe = (...args) => args.reduce((acc, val) => _pipe(acc, val))
const pipeX = (...args) => pipe(...args)()


// () -> Parser Int
const getReadingHead = pipe(
  get,
  pureDot(ParserState.getReadingHead)
)

// Int -> () -> Parser ()
const setReadingHead = (a) => pipe(
  get,
  pureDot(s=>ParserState.setReadingHead(a, s))
)

// (Int -> Int) -> () -> Parser ()
const updateReadingHead = (f) => pipe(
  get,
  pureDot(s=>ParserState.updateReadingHead(f, s))
)

// Int -> () -> Parser ()
const consume = (x) => updateReadingHead(a=>a+x)
// () -> Parser ()
const consumeOne = consume(1)


// () -> Parser String
const getString = pipe(
  get,
  pureDot(ParserState.getString)
)

// () -> Parser Char
const getOneChar = () => {
  let str
  return pipeX(
    getString,
    capture(a => str = a),
    getReadingHead,
    (reading_head) => {
      if (str[reading_head] === undefined) {
        return fail('end of file')
      }
      return pure(str[reading_head])
    }
  )
}

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
      // console.log(final_state)
      return ans
    }
  )
}




// (() -> Parser a) -> (() -> Parser a) -> (() -> Parser a)
const _or = (es, p, ...ps) => pipe(
  getReadingHead,
  (reading_head) => caseOfX(
    p,
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
  (reading_head) => caseOfX(
    p,
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
  (reading_head) => caseOfX(
    p,
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
const _many = (array, p) => {
  return caseOf(
    p,
    (e) => pure(array),
    (a) => {
      array.push(a)
      return _many(array, p)()
    }
  )
}
const many = (p) => pipe(
  () => pure([]),
  (a) => _many(a, p)(),
)

// const many1
// const count
// const between
// const option
// const optional

// (() -> Parser a) -> (() -> Parser sep) -> (() -> Parser [a])
const _sepBy = (array, p, sep) => {
  return caseOf(
    ttry(sep),
    (e) => pure(array),
    (_) => caseOfX(
      ttry(p),
      (e) => pure(array),
      (a) => {
        array.push(a)
        return _sepBy(array, p, sep)()
      }
    )
  )
}
const sepBy = (p, sep) => {
  return caseOf(
    ttry(p),
    (e) => pure([]),
    (a) => _sepBy([a], p, sep)()
  )
}


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
  // consume,
  getOneChar,
  consumeOne,

  fail,
  capture,
  pureDot,


  parse,


  pipe,
  pipeX,
  pure,

  or,
  ttry,
  label,
  many,

  sepBy,
}

