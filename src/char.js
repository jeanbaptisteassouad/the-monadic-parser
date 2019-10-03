
const Parser = require('./parser')

// () -> Parser Char
const getOneChar = Parser.pipe(
  Parser.getString,
  (str) => Parser.pipe(
    Parser.getReadingHead,
    (reading_head) => Parser.pure(str[reading_head])
  )()
)

// (Char -> Bool) -> () -> Parser Char
const satisfy = (f) => Parser.pipe(
  getOneChar,
  (a) => {
    if (f(a)) {
      return Parser.pipe(
        Parser.consumeOne,
        () => Parser.pure(a)
      )()
    } else {
      return Parser.pure(null) /////////////////////////
    }
  }
)

const isInCharList = (char, list_char) => {
  for (let i = 0; i < list_char.length; i++) {
    const val = list_char[i]
    if (val === char) {
      return true
    }
  }
  return false
}

// String -> () -> Parser Char
const oneOf = (list_char) => satisfy(a => isInCharList(a, list_char))

// String -> () -> Parser Char
const noneOf = (list_char) => satisfy(a => isInCharList(a, list_char) === false)

// ref : https://en.wikipedia.org/wiki/Whitespace_character
const spaces_char = []

// \t
const character_tabulation_char = '\u0009'
spaces_char.push(character_tabulation_char)

// \n
const line_feed_char = '\u000a'
spaces_char.push(line_feed_char)

const line_tabulation_char = '\u000b'
spaces_char.push(line_tabulation_char)

// \f
const form_feed_char = '\u000c'
spaces_char.push(form_feed_char)

// \r
const carriage_return_char = '\u000d'
spaces_char.push(carriage_return_char)

const space_char = '\u0020'
spaces_char.push(space_char)

const next_line_char = '\u0085'
spaces_char.push(next_line_char)

const no_break_space_char = '\u00a0'
spaces_char.push(no_break_space_char)


// () -> Parser Char
const space = satisfy(a => spaces_char.includes(a))

// () -> Parser [Char]
const spaces = Parser.many(space)


// () -> Parser Char
const newline = satisfy(a => a === line_feed_char)

// () -> Parser Char
const crlf = Parser.pipe(
  Parser.getString,
  (str) => Parser.pipe(
    Parser.getReadingHead,
    (reading_head) => {
      if (
        str[reading_head] === carriage_return_char &&
        str[reading_head + 1] === line_feed_char
      ) {
        return Parser.pipe(
          Parser.consume(2),
          Parser.pure(line_feed_char)
        )()
      } else {
        return Parser.pure(null) /////////////////////////
      }
    }
  )()
)

// () -> Parser Char
const endOfLine = Parser.or(newline, crlf)

// () -> Parser Char
const tab = satisfy(a => a === character_tabulation_char)

// () -> Parser Char
const upper = satisfy(a => a.toUpperCase() === a)

// () -> Parser Char
const lower = satisfy(a => a.toLowerCase() === a)

// const alphaNum
// const letter

// () -> Parser Char
const digit_regex = new RegExp(/[0-9]/)
const digit = satisfy(a => a.match(digit_regex) !== null)

// () -> Parser Char
const hex_digit_regex = new RegExp(/[0-9a-fA-F]/)
const hexDigit = satisfy(a => a.match(hex_digit_regex) !== null)

// () -> Parser Char
const oct_digit_regex = new RegExp(/[0-7]/)
const octDigit = satisfy(a => a.match(oct_digit_regex) !== null)

// Char -> () -> Parser Char
const char = (c) => satisfy(a => a === c)

// () -> Parser Char
const anyChar = satisfy(() => true)

// String -> () -> Parser String
// 
const string = (str) => {
  if (str.length === 0) {
    return () => Parser.pure('')
  }
  
  const head = str[0]
  const tail = str.slice(1)

  let ans = ''
  const append = a => {
    ans = ans + a
    return Parser.pure()
  }

  return Parser.pipe(
    char(head),
    append,
    string(tail),
    append,
    () => Parser.pure(ans)
  )
}






const p = Parser.or(oneOf('a'), oneOf('u'), oneOf('i'))

const aaa = () => {
  let ans = ''
  const append = a => {
    ans = ans + a
    return Parser.pure()
  }
  return Parser.pipeX(
    Parser.or(string('ud'), oneOf('u')),
    append,
    spaces,
    p,
    append,
    p,
    append,
    () => Parser.pure(ans)
  )
}


console.log(Parser.parse('ua  \nuk\nie', aaa()))




module.exports = {
  oneOf,
  noneOf,
  spaces,
  space,
  newline,
  crlf,
  endOfLine,
  tab,
  upper,
  lower,
  // alphaNum,
  // letter,
  digit,
  hexDigit,
  octDigit,
  char,
  anyChar,
  satisfy,
  string,
}

