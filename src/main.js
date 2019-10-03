
const Parser = require('./parser')
const State = require('./state')
const Char = require('./char')

// const oneOf = (list_char) => {
//   return Parser.create((nextChar) => {
//     const char = nextChar()
//     for (let i = 0; i < list_char.length; i++) {
//       const val = list_char[i]
//       if (val === char) {
//         return val
//       }
//     }
//     return null
//   })
// }

// const noneOf = (list_char) => {
//   return Parser.create((nextChar) => {
//     const char = nextChar()
//     for (let i = 0; i < list_char.length; i++) {
//       const val = list_char[i]
//       if (val === char) {
//         return null
//       }
//     }
//     return char
//   })
// }

// const many = (parser) => {
//   return Parser.create((nextChar) => {
//     const ans = []

//   })
// }

// console.log(Parser.parse('auaite', oneOf('ab')))
// console.log(Parser.parse('nuaite', noneOf('ab')))