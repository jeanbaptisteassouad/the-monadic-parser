
const Parser = require('./monads/parser')
const Char = require('./char')




const p = Parser.or(Char.oneOf('a'), Char.oneOf('u'), Char.oneOf('i'))

const aaa = () => {
  return Parser.pipeX(
    Parser.sepBy(p, Char.char('.')),
    a => Parser.pure(a),
  )
}

console.log(Parser.parse('a.u.i.a', aaa()))
// console.log(Parser.parse('ua  \nuk\nie', aaa()))


