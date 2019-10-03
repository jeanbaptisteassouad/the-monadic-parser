
const Accessors = require('./accessors')
const State = require('./state')

const [getReadingHead, setReadingHead, updateReadingHead] = Accessors.create()
const [getString, setString] = Accessors.create()


const empty = (str) => {
  const a = {}

  setReadingHead(0, a)
  setString(str, a)

  return a
}

const parse = (str, parser) => {
  return State.evalState(parser, empty(str))
}

const getChar = () => State.chain(
  State.get,
  (s) => {
    const reading_head = getReadingHead(s)
    const str = getString(s)
    return State.pure(str[reading_head])
  }
)

const consumeOne = () => State.chain(
  State.get,
  (s) => {
    updateReadingHead(a=>a+1, s)
    return State.pure()
  }
)

const consume = (x) => State.chain(
  State.get,
  (s) => {
    updateReadingHead(a=>a+x, s)
    return State.pure()
  }
)


const log = (a) => {
  console.log(a)
  return State.pure()
}

const getAndLog = State.compose(log, getChar)


const _or = (a, b) => State.chain(
  State.get,
  (s) => State.pure(getReadingHead(s)),
  (reading_head) => State.chain(
    a,
    State.get,
    (s) => {
      if (reading_head !== getReadingHead(s)) {
        return State.pure()
      } else {
        return b
      }
    }
  )
)

const or = (...parsers) =>
  parsers.reduce((acc,val) => _or(acc, val))




const isInCharList = (char, list_char) => {
  for (let i = 0; i < list_char.length; i++) {
    const val = list_char[i]
    if (val === char) {
      return true
    }
  }
  return false
}

const shouldConsumeAChar = (a) => {
  if (a === null) {
    return State.pure()
  } else {
    return consumeOne()
  }
}

const oneOf = (list_char) => State.chain(
  getChar,
  (char) => {
    if (isInCharList(char, list_char)) {
      return State.pure(char)
    } else {
      return State.pure(null)
    }
  },
  shouldConsumeAChar,
)

const noneOf = (list_char) => State.chain(
  getChar,
  (char) => {
    if (isInCharList(char, list_char)) {
      return State.pure(null)
    } else {
      return State.pure(char)
    }
  },
  shouldConsumeAChar,
)

const aaa = State.chain(
  or(oneOf('a'), oneOf('u'), oneOf('i')),
  getAndLog,
)


parse('auie', aaa)



// const create = (f) => {
//   const a = empty()

//   setF(f, a)

//   return a
// }

// const parse = (str, p) => {
//   let reading_head = 0
//   const nextChar = () => {
//     const ans = str[reading_head]
//     reading_head++
//     return ans
//   }
//   return getF(p)(nextChar)
// }

module.exports = {
  // create,
  // parse,
}