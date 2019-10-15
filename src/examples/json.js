const root_path = '..'

const Parser = require(root_path + '/monads/parser')
const Char = require(root_path + '/char')

// This parser is based on RFC 4627 (https://www.ietf.org/rfc/rfc4627.txt)

// (Char) -> () -> Parser<Char>
const insignificantWhitespace = (a) => Parser.pipe(
  Char.spaces,
  Char.char(a),
  Char.spaces,
  () => Parser.pure(a)
)

const beginArray = insignificantWhitespace('[')
const endArray = insignificantWhitespace(']')
const beginObject = insignificantWhitespace('{')
const endObject = insignificantWhitespace('}')
const nameSeparator = insignificantWhitespace(':')
const valueSeparator = insignificantWhitespace(',')

//********//
// string //
//********//

const unescaped = Parser.label(
  Char.satisfy((a) => {
    if (
      ('\u0020' <= a && a <= '\u0021') ||
      ('\u0023' <= a && a <= '\u005b') ||
      ('\u005d' <= a && a <= '\uffff')
    ) {
      return true
    } else {
      return false
    }
  }),
  'an unescaped char'
)

const escapedChar = (p, r) => Parser.ttry(
  Parser.pipe(
    Char.char('\\'),
    p,
    Parser.pureDot(r)
  )
)

const escapedQuotationMark = escapedChar(Char.char('"'), () => '"')
const escapedReverseSolidus = escapedChar(Char.char('\\'), () => '\\')
const escapedSolidus = escapedChar(Char.char('/'), () => '\/')
const escapedBackspace = escapedChar(Char.char('b'), () => '\b')
const escapedFormFeed = escapedChar(Char.char('f'), () => '\f')
const escapedLineFeed = escapedChar(Char.char('n'), () => '\n')
const escapedCarriageReturn = escapedChar(Char.char('r'), () => '\r')
const escapedTab = escapedChar(Char.char('t'), () => '\t')
const escapedUnicode = escapedChar(
  Parser.pipe(
    Char.char('u'),
    Parser.count(4, Char.hexDigit),
    Parser.pureDot(a => a.join(''))
  ),
  (a) => String.fromCodePoint(Number('0x'+a))
)

const char = Parser.or(
  unescaped,
  escapedQuotationMark,
  escapedReverseSolidus,
  escapedSolidus,
  escapedBackspace,
  escapedFormFeed,
  escapedLineFeed,
  escapedCarriageReturn,
  escapedTab,
  escapedUnicode,
)

const quotationMark = Char.char('"')

// () -> Parser<String>
const string = Parser.pipe(
  Parser.between(
    quotationMark,
    quotationMark,
    Parser.many(char)
  ),
  Parser.pureDot(a=>a.join(''))
)

//********//
// number //
//********//

// () -> Parser<Number>
const number = () => {
  let ans
  return Parser.pipeX(
    Parser.option('', minus),
    Parser.capture(a=>ans = a),
    int,
    Parser.capture(a=>ans += a),
    Parser.option('', frac),
    Parser.capture(a=>ans += a),
    Parser.option('', exp),
    Parser.pureDot(a=>Number(ans + a))
  )
}

const decimalPoint = Char.char('.')
const digit1_9 = Char.oneOf('123456789')
const e = Char.oneOf('eE')

const exp = () => {
  let ans
  return Parser.pipeX(
    e,
    Parser.capture(a=>ans = a),
    Parser.option('', Parser.or(minus, plus)),
    Parser.capture(a=>ans += a),
    Parser.many1(Char.digit),
    Parser.pureDot(a=>ans + a.join(''))
  )
}
const frac = () => {
  let ans
  return Parser.pipeX(
    decimalPoint,
    Parser.capture(a=>ans = a),
    Parser.many1(Char.digit),
    Parser.pureDot(a=>ans + a.join(''))
  )
}

const zero = Char.char('0')

// () -> Parser<String>
const int = Parser.or(
  zero,
  () => {
    let first
    return Parser.pipeX(
      digit1_9,
      Parser.capture(a=>first = a),
      Parser.many(Char.digit),
      Parser.pureDot((ans) => [first].concat(ans).join(''))
    )
  }
)
const minus = Char.char('-')
const plus = Char.char('+')


//*******//
// array //
//*******//

// () -> Parser<Array<Value>>
const array = () => Parser.between(
  beginArray,
  endArray,
  Parser.sepBy(value, valueSeparator)
)()

//********//
// object //
//********//

// () -> Parser<Object<String, Value>>
const member = () => {
  let ans = []
  return Parser.pipeX(
    string,
    Parser.capture(a=>ans.push(a)),
    nameSeparator,
    value,
    Parser.capture(a=>ans.push(a)),
    () => {
      return Parser.pure(ans)
    }
  )
}
const object = Parser.pipe(
  Parser.between(
    beginObject,
    endObject,
    Parser.sepBy(member, valueSeparator)
  ),
  Parser.pureDot((members) => {
    let ans = {}
    members.forEach(([string, value]) => ans[string] = value)
    return ans
  })
)

//*******//
// false //
//*******//

// () -> Parser<Bool>
const falseVal = Parser.ttry(
  Parser.pipe(
    Char.string('false'),
    () => Parser.pure(false)
  )
)

//******//
// true //
//******//

// () -> Parser<Bool>
const trueVal = Parser.ttry(
  Parser.pipe(
    Char.string('true'),
    () => Parser.pure(true)
  )
)

//******//
// null //
//******//

// () -> Parser<Null>
const nullVal = Parser.ttry(
  Parser.pipe(
    Char.string('null'),
    () => Parser.pure(null)
  )
)

//*******//
// value //
//*******//

// () -> Parser<Value>
const value = Parser.or(
  falseVal,
  nullVal,
  trueVal,
  object,
  array,
  number,
  string,
)

//******//
// json //
//******//

// () -> Parser<Js>
const json = Parser.or(object, array)


module.exports = {
  rfc4627:json,
}
