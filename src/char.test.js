const chai = require('chai')
const expect = chai.expect

const root_path = '.'

const Parser = require(root_path + '/monads/parser')
const ParserError = require(root_path + '/parser-error')
const Char = require(root_path + '/char')

describe('Char', () => {
  describe('.satisfy', () => {
    it('parse("auie", satisfy(x => x === "a")()) === a', () => {
      const str = 'auie'
      expect(
        Parser.parse(str, Char.satisfy(x => x === 'a')())
      ).to.deep.equal(
        'a'
      )
    })

    it('parse("auie", satisfy(x => x === "b")()) should throw', () => {
      const str = 'auie'
      expect(
        () => Parser.parse(str, Char.satisfy(x => x === 'b')())
      ).to.throw(ParserError.ParserFailedError)
    })

    it('multiple call of p = string("auie") should give the same result', () => {
      const str = 'auie'
      const p = Char.string('auie')

      expect(
        Parser.parse(str, p())
      ).to.equal('auie')

      expect(
        Parser.parse(str, p())
      ).to.equal('auie')
    })
  })
})