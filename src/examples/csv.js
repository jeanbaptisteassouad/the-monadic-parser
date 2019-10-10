
const Parser = require('../monads/parser')
const Char = require('../char')

// Can parse all CSV conform to RFC 4180 (https://tools.ietf.org/html/rfc4180)

const csv = (cell_char) => {
  const quotedChar = Parser.or(
    Char.noneOf('"'),
    Parser.ttry(
      Parser.pipe(
        Char.string('""'),
        () => Parser.pure('"')
      )
    )
  )

  const quotedCell = () => {
    let content
    return Parser.pipeX(
      Char.char('"'),
      Parser.many(quotedChar),
      Parser.capture(a => content = a),
      Char.char('"'),
      () => Parser.pure(content)
    )
  }

  const cell = Parser.pipe(
    Parser.or(
      quotedCell,
      Parser.many(Char.noneOf(cell_char+'\n\r'))
    ),
    Parser.map(a => a.join(''))
  )

  const cellSeparator = Char.char(cell_char)

  const line = Parser.sepBy(cell, cellSeparator)

  const lineSeparator = Parser.or(
    Parser.ttry(Char.string('\n\r')),
    Parser.ttry(Char.string('\r\n')),
    Char.string('\n'),
    Char.string('\r'),
  )

  const csv = Parser.sepBy(line, lineSeparator)
  
  return csv
}

const rfc_4180_cell_separator_char = ','
const rfc4180 = csv(rfc_4180_cell_separator_char)

module.exports = {
  withCellSeparator:csv,
  rfc4180,
}

