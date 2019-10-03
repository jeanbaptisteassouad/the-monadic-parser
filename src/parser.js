
const Accessors = require('./accessors')
const State = require('./state')

const [_getReadingHead, _setReadingHead, _updateReadingHead] = Accessors.create()
// () -> Parser Int
const getReadingHead = State.pipe(
  State.get,
  (s) => State.pure(_getReadingHead(s))
)
// (Int -> Int) -> () -> Parser ()
const updateReadingHead = (f) => State.pipe(
  State.get,
  (s) => State.pure(_updateReadingHead(f, s))
)
// Int -> () -> Parser ()
const consume = (x) => updateReadingHead(a=>a+x)
// () -> Parser ()
const consumeOne = consume(1)


const [_getString, _setString] = Accessors.create()
// () -> Parser String
const getString = State.pipe(
  State.get,
  (s) => State.pure(_getString(s))
)

const empty = (str) => {
  const a = {}

  _setReadingHead(0, a)
  _setString(str, a)

  return a
}

// String -> Parser a -> a
// Need to Handle error
const parse = (str, parser) => {
  return State.evalState(parser, empty(str))
}

// a -> Parser a
const pure = State.pure


// Combinator

// (a -> Parser b) -> (b -> Parser c) -> (a -> Parser c)
const pipe = State.pipe
// (a -> Parser b) -> (b -> Parser c) -> Parser c
const pipeX = State.pipeX


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