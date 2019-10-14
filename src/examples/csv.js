const root_path = '..'

const Parser = require(root_path + '/monads/parser')
const Char = require(root_path + '/char')

// This parser is based on RFC 4180 (https://tools.ietf.org/html/rfc4180)

const csv = (cell_char) => {
  // () -> Parser Char
  const quotedChar = Parser.or(
    Char.noneOf('"'),
    Parser.ttry(
      Parser.pipe(
        Char.string('""'),
        () => Parser.pure('"')
      )
    )
  )

  // () -> Parser String
  const quotedCell = () => {
    let content
    return Parser.pipeX(
      Char.char('"'),
      Parser.many(quotedChar),
      Parser.capture(a => content = a),
      Char.char('"'),
      () => Parser.pure(content.join(''))
    )
  }

  // () -> Parser String
  const notQuotedCell = Parser.pipe(
    Parser.many(Char.noneOf(cell_char+'\n\r')),
    Parser.pureDot(a => a.join(''))
  )

  // () -> Parser String
  const cell = Parser.or(quotedCell, notQuotedCell)

  // () -> Parser Char
  const cellSeparator = Char.char(cell_char)

  // () -> Parser [String]
  const line = Parser.sepBy(cell, cellSeparator)

  // () -> Parser String
  const lineSeparator = Parser.or(
    Parser.ttry(Char.string('\n\r')),
    Parser.ttry(Char.string('\r\n')),
    Char.string('\n'),
    Char.string('\r'),
  )

  // () -> Parser [[String]]
  const csv = Parser.sepBy(line, lineSeparator)
  
  return csv
}

const rfc_4180_cell_separator_char = ','
const rfc4180 = csv(rfc_4180_cell_separator_char)

module.exports = {
  withCellSeparator:csv,
  rfc4180,
}

