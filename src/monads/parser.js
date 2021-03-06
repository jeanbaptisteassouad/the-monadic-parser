const root_path = '..'

const State = require(root_path + '/monads/state')
const Either = require(root_path + '/monads/either')

const ParserState = require(root_path + '/parser-state')
const ParserError = require(root_path + '/parser-error')

//***************//
// Monadic value //
//***************//

// Parser<a> === State<s, Either<e, a>>
// (a) -> Parser<a>
const pure = (a) => State.pure(Either.pure(a))

// (e) -> Parser<a>
const fail = (e) => State.pure(Either.left(e))


//*******************//
// Monadic Functions //
//*******************//

// () -> Parser<s>
const get = () => State.then(State.get(), pure)

// ((a) -> b) -> ((a) -> Parser<b>)
const pureDot = (f) => (a) => pure(f(a))

// ((a) -> b) -> ((a) -> Parser<Undefined>)
const capture = (f) => (a) => {
  f(a)
  return pure(undefined)
}

// ((a) -> Parser<b>, (e) -> Parser<c>, (b) -> Parser<c>) -> ((a) -> Parser<c>)
const caseOf = (a_to_parser_b, leftCallback, rightCallback) => (a) =>
  State.then(a_to_parser_b(a), (either_b) =>
    Either.caseOf(either_b, leftCallback, rightCallback)
  )
const caseOfX = (a_to_parser_b, leftCallback, rightCallback) =>
  caseOf(a_to_parser_b, leftCallback, rightCallback)()

// (Parser<a>, (a) -> Parser<b>) -> Parser<b>
// (State<s, Either<e, a>>, (a) -> State<s, Either<e, b>>) -> State<s, Either<e, b>
const then = (state_either_a, a_to_state_either_b) =>
  State.then(state_either_a, (either_a) =>
    Either.caseOf(
      either_a,
      () => State.pure(either_a),
      a_to_state_either_b
    )
  )

// ((a) -> Parser<b>, (b) -> Parser<c>) -> (a) -> Parser<c>
const _pipe = (a_to_parser_b, b_to_parser_c) => (a) => {
  const parser_b = a_to_parser_b(a)
  return then(parser_b, b_to_parser_c)
}

const pipe = (...args) => args.reduce((acc, val) => _pipe(acc, val))
const pipeX = (...args) => pipe(...args)()


// () -> Parser<Int>
const getReadingHead = pipe(
  get,
  pureDot(ParserState.getReadingHead)
)

// Int -> () -> Parser<Undefined>
const setReadingHead = (a) => pipe(
  get,
  pureDot(s=>ParserState.setReadingHead(a, s))
)

// ((Int) -> Int) -> () -> Parser<Undefined>
const updateReadingHead = (f) => pipe(
  get,
  pureDot(s=>ParserState.updateReadingHead(f, s))
)

// (Int) -> () -> Parser<Undefined>
const setFailedHead = (a) => pipe(
  get,
  pureDot(s=>ParserState.setFailedHead(a, s))
)

// () -> Parser<Undefined>
const consumeOne = updateReadingHead(a=>a+1)


// () -> Parser<String>
const getString = pipe(
  get,
  pureDot(ParserState.getString)
)

// () -> Parser<Char>
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
      return pipeX(
        setFailedHead(reading_head),
        () => pure(str[reading_head])
      )
    }
  )
}

// (String, Parser<a>) -> a
const parse = (str, parser) => {
  const [either_ans, final_state] = State.runState(parser, ParserState.create(str))
  return Either.caseOf(either_ans,
    (msg) => {
      const failed_head = ParserState.getFailedHead(final_state)
      let error_str = `unexpected ${JSON.stringify(str[failed_head])}`
      if (msg) {
        error_str = error_str+', expecting '+msg
      }
      throw new ParserError.ParserFailedError(error_str)
    },
    (a) => a
  )
}

// (() -> Parser<a>, () -> Parser<a>) -> (() -> Parser<a>)
// Or function must try the next parser only if the current
// one has failed without consuming any input.
// It guarantees that all parsers inside the or function
// will be tried from the same starting position.
const _or = (es, p, ...ps) => pipe(
  getReadingHead,
  (reading_head) => caseOfX(
    p,
    (e) => pipeX(
      getReadingHead,
      (next_reading_head) => {
        es.push(e)
        if (reading_head !== next_reading_head) {
          return fail(e)
        } else if (0 < ps.length) {
          return _or(es, ...ps)()
        } else {
          return fail(es.join(' or '))
        }
      }
    ),
    pure
  )
)
const or = (p, ...ps) => _or([], p, ...ps)

// (() -> Parser<a>) -> (() -> Parser<a>)
const ttry = (p) => pipe(
  getReadingHead,
  (reading_head) => caseOfX(
    p,
    (e) => pipeX(
      setReadingHead(reading_head),
      () => fail(e)
    ),
    pure
  )
)

// (() -> Parser<a>, String) -> (() -> Parser<a>)
// Label function must change the error message only if
// the parser p has failed without consuming any input.
// It guarantees that the correct error message will be raised.
const label = (p, str) => pipe(
  getReadingHead,
  (reading_head) => caseOfX(
    p,
    (e) => pipeX(
      getReadingHead,
      (next_reading_head) => {
        if (reading_head !== next_reading_head) {
          return fail(e)
        } else {
          return fail(str)
        }
      }
    ),
    pure
  )
)


// (() -> Parser<a>) -> (() -> Parser<[a]>)
const _many = (array, p) => {
  return caseOf(
    ttry(p),
    (e) => pure(array),
    (a) => {
      array.push(a)
      return _many(array, p)()
    }
  )
}
const many = (p) => {
  return caseOf(
    ttry(p),
    (e) => pure([]),
    (a) => _many([a], p)()
  )
}
const many1 = (p) => {
  return caseOf(
    ttry(p),
    fail,
    (a) => _many([a], p)()
  )
}

// (Int, () -> Parser<a>) -> (() -> Parser<[a]>)
const count = (n, p) => () => {
  if (n <= 0) {
    return pure([])
  } else {
    return caseOfX(
      p,
      fail,
      (a) => pipeX(
        count(n - 1, p),
        pureDot(array => [a].concat(array))
      )
    )
  }
}

// (() -> Parser<open>, () -> Parser<close>, () -> Parser<a>) -> (() -> Parser<a>)
const between = (open, close, p) => () => {
  let ans
  return pipeX(
    open,
    p,
    capture(a=>ans = a),
    close,
    () => pure(ans)
  )
}

// (a, () -> Parser<a>) -> (() -> Parser<a>)
// Option function should fail when parser p fails
// with consuming some input. It guarantees that option(p)
// will not move the reading head forward when it will fail.
const option = (a, p) => pipe(
  getReadingHead,
  (reading_head) => caseOfX(
    p,
    (e) => pipeX(
      getReadingHead,
      (next_reading_head) => {
        if (reading_head !== next_reading_head) {
          return fail(e)
        } else {
          return pure(a)
        }
      }
    ),
    pure
  )
)

// (() -> Parser<a>) -> (() -> Parser<Undefined>)
// Optional function should fail when parser p fails
// with consuming some input. It guarantees that option(p)
// will not move the reading head forward when it will fail.
const optional = (p) => pipe(
  option(null, p),
  () => pure()
)

// (() -> Parser<a>, () -> Parser<sep>) -> (() -> Parser<[a]>)
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
const sepBy1 = (p, sep) => {
  return caseOf(
    ttry(p),
    fail,
    (a) => _sepBy([a], p, sep)()
  )
}

// (() -> Parser<a>, () -> Parser<sep>) -> (() -> Parser<[a]>)
const _endBy = (p, sep) => () => {
  let ans
  return pipeX(
    p,
    capture(a => ans = a),
    sep,
    () => pure(ans)
  )
}
const endBy = (p, sep) => many(_endBy(p, sep))
const endBy1 = (p, sep) => many1(_endBy(p, sep))

// (() -> Parser<a>, () -> Parser<sep>) -> (() -> Parser<[a]>)
const sepEndBy = (p, sep) => () => {
  let ans
  return pipeX(
    sepBy(p, sep),
    capture(a=>ans=a),
    optional(sep),
    () => pure(ans)
  )
}
const sepEndBy1 = (p, sep) => () => {
  let ans
  return pipeX(
    sepBy1(p, sep),
    capture(a=>ans=a),
    optional(sep),
    () => pure(ans)
  )
}

// (() -> Parser<a>) -> (() -> Parser<Undefined>)
// notFollowedBy function should not consume any input
// when parser p has failed.
const notFollowedBy = (p) => pipe(
  getReadingHead,
  (reading_head) => caseOfX(
    p,
    (e) => pipeX(
      setReadingHead(reading_head),
      pure
    ),
    fail
  )
)

// () -> Parser<Undefined>
const eof = notFollowedBy(
  ttry(
    pipe(
      getOneChar,
      consumeOne,
    )
  )
)

// (() -> Parser<a>, () -> Parser<end>) -> (() -> Parser<[a]>)
const manyTill = (p, end) => caseOf(
  end,
  (e) => pipeX(
    p,
    (a) => pipeX(
      manyTill(p, end),
      pureDot((array) => [a].concat(array))
    )
  ),
  () => pure([])
)

// (() -> Parser<a>) -> (() -> Parser<a>)
// lookAhead function should not consume any input
// when parser p is successfully applied.
const lookAhead = (p) => pipe(
  getReadingHead,
  (reading_head) => caseOfX(
    p,
    fail,
    (a) => pipeX(
      setReadingHead(reading_head),
      () => pure(a)
    )
  )
)

module.exports = {
  // monadic value creators
  fail,
  pure,

  // monadic functions
  getOneChar,
  consumeOne,

  // monadic function creators
  capture,
  pureDot,


  // monadic function combinators
  pipe,
  pipeX,

  or,
  ttry,
  label,

  many,
  many1,
  count,
  between,
  option,
  optional,
  sepBy,
  sepBy1,
  endBy,
  endBy1,

  sepEndBy,
  sepEndBy1,

  notFollowedBy,
  eof,
  manyTill,
  lookAhead,

  // let you run your parser
  parse,
}

