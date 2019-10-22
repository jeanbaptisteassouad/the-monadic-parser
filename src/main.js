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






// sep :: () -> Parser<Char>
const sep = Parser.Char.char(';')

// p :: Parser<Array<Array<Char>>>
const p = Parser.sepBy1(Parser.many1(Parser.Char.noneOf(';')), sep)()

console.log(Parser.parse('any;_str;ing', p)) // [['a','n','y'], ['_','s','t','r'], ['i','n','g']]
console.log(Parser.parse('any', p)) // [['a','n','y']]
console.log(Parser.parse(';', p)) // will throw : unexpected ";", expecting none of [";"]


