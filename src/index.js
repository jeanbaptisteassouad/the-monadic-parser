const root_path = '.'

const Parser = require(root_path + '/monads/parser')
const Char = require(root_path + '/char')
const Csv = require(root_path + '/examples/csv')
const Json = require(root_path + '/examples/json')


module.exports = {
  ...Parser,
  Char,
  Csv,
  Json,
}