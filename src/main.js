const root_path = '.'

const Parser = require(root_path + '/index')
const Char = require(root_path + '/char')

const json_str = JSON.stringify([
  false,
  true,
  null,
  124,
  0,
  42.8,
  -89.4,
  0.35e3,
  0.35E3,
  12.5e-2,
  12.5E-2,
  3e3,
  3e-3,
  87e+2,
  87E+2,
  0.352,
  'nauitedpent',
  'sutenau"austeun"',
  '\bsdpt a \n ast/ein \t \/ai\r \fets \uaf7bsdet, n',
  {},
  [],
  '',
  {
    auets:false,
    usetaa:[14, 'tisen'],
    ddd:{
      rr:null,
      satu:'sutenstui\t \n \u0045',
    }
  }
])

console.log(json_str)
console.log(Parser.parse(json_str, Parser.Json.rfc4627()))






// open :: () -> Parser<Char>
const open = Parser.Char.char('(')

// close :: () -> Parser<Char>
const close = Parser.Char.char(')')

// p :: Parser<Char>
const p = Parser.between(open, close, Parser.Char.string('auie'))()

console.log(Parser.parse('(auie)_any_string', p)) // 'auie'
// console.log(Parser.parse('(auie_any_string', p)) // will throw : unexpected "_", expecting ")"
// console.log(Parser.parse('auie)_any_string', p)) // will throw : unexpected "a", expecting "("
// console.log(Parser.parse('(aui)_any_string', p)) // will throw : unexpected ")", expecting "auie"



