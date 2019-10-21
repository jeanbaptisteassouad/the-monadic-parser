const root_path = '.'

const Parser = require(root_path + '/monads/parser')

// ((Char) -> Bool) -> () -> Parser<Char>
const satisfy = (f) => Parser.pipe(
  Parser.getOneChar,
  (a) => {
    if (f(a)) {
      return Parser.pipe(
        Parser.consumeOne,
        () => Parser.pure(a)
      )()
    } else {
      return Parser.fail()
    }
  }
)

// Char -> () -> Parser<Char>
const char = (c) => Parser.label(
  satisfy(a => a === c),
  JSON.stringify(c)
)

// () -> Parser<Char>
const anyChar = satisfy(() => true)

// String -> () -> Parser<String>
const _string = (fullstring, str) => () => {
  if (str.length === 0) {
    return Parser.pure('')
  }
  
  const head = str[0]
  const tail = str.slice(1)

  let ans = ''

  let error_msg = JSON.stringify(fullstring)

  return Parser.label(
    Parser.pipe(
      char(head),
      Parser.capture(a => ans = ans + a),
      _string(fullstring, tail),
      Parser.capture(a => ans = ans + a),
      () => Parser.pure(ans),
    ),
    error_msg
  )()
}
const string = (str) => _string(str, str)

const isInCharList = (char, list_char) => {
  for (let i = 0; i < list_char.length; i++) {
    const val = list_char[i]
    if (val === char) {
      return true
    }
  }
  return false
}

const formatListChar = (list_char) =>
  JSON.stringify(list_char.split(''))

// String -> () -> Parser<Char>
const oneOf = (list_char) => Parser.label(
  satisfy(a => isInCharList(a, list_char)),
  'one of '+formatListChar(list_char)
)

// String -> () -> Parser<Char>
const noneOf = (list_char) => Parser.label(
  satisfy(a => isInCharList(a, list_char) === false),
  'none of '+formatListChar(list_char)
)

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


// () -> Parser<Char>
const space = Parser.label(
  satisfy(a => spaces_char.includes(a)),
  'a space'
)

// () -> Parser<[Char]>
const spaces = Parser.label(
  Parser.many(space),
  'spaces'
)

// () -> Parser<Char>
const newline = Parser.label(
  satisfy(a => a === line_feed_char),
  'a newline'
)

const crlf = Parser.label(
  Parser.ttry(string(carriage_return_char + line_feed_char)),
  'a crlf'
)

// () -> Parser<Char>
const endOfLine = Parser.label(
  Parser.or(newline, crlf),
  'an end of line'
)

// () -> Parser<Char>
const tab = Parser.label(
  satisfy(a => a === character_tabulation_char),
  'a tab'
)

// () -> Parser<Char>
const upper = Parser.label(
  satisfy(a => a.toUpperCase() === a),
  'an upper case character'
)

// () -> Parser<Char>
const lower = Parser.label(
  satisfy(a => a.toLowerCase() === a),
  'a lower case character'
)

// const alphaNum
// const letter

// () -> Parser<Char>
const digit_regex = new RegExp(/[0-9]/)
const digit = Parser.label(
  satisfy(a => a.match(digit_regex) !== null),
  'a digit'
)

// () -> Parser<Char>
const hex_digit_regex = new RegExp(/[0-9a-fA-F]/)
const hexDigit = Parser.label(
  satisfy(a => a.match(hex_digit_regex) !== null),
  'a hex digit'
)

// () -> Parser<Char>
const oct_digit_regex = new RegExp(/[0-7]/)
const octDigit = Parser.label(
  satisfy(a => a.match(oct_digit_regex) !== null),
  'an oct digit'
)

module.exports = {
  satisfy,
  string,
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
}

