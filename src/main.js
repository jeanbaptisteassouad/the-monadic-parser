
const Parser = require('./monads/parser')
const Char = require('./char')
const Csv = require('./examples/csv')

const p = Parser.or(Char.oneOf('a'), Char.oneOf('u'), Char.oneOf('i'))

const aaa = () => {
  return Parser.pipeX(
    Parser.sepBy(p, Char.char('.')),
    a => Parser.pure(a),
  )
}

const csv = Csv.rfc4180

const csv_str = `auie,eiua,aai,eeiu
"sstt","asa""tuier","ss,rt","stsn"
tse,rr,s,"auietsn

ett"
rrrr,122,13,34`

console.log(JSON.stringify(csv_str))

console.log(Parser.parse(csv_str, csv()))


