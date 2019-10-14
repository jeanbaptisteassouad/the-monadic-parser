const chai = require('chai')
const expect = chai.expect

const root_path = '..'

const Json = require(root_path + '/examples/json')
const Parser = require(root_path + '/monads/parser')

describe('Json', () => {
  it('rfc4627 : empty array', () => {
    const ans = []

    const str = JSON.stringify(ans)

    const parser_output = Parser.parse(str, Json.rfc4627())

    expect(JSON.parse(str)).to.deep.equal(ans)
    expect(parser_output).to.deep.equal(ans)
  })

  it('rfc4627 : array', () => {
    const ans = [
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
      's\\utenau"austeun"',
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
    ]

    const str = JSON.stringify(ans)

    const parser_output = Parser.parse(str, Json.rfc4627())

    expect(JSON.parse(str)).to.deep.equal(ans)
    expect(parser_output).to.deep.equal(ans)
  })

  it('rfc4627 : empty object', () => {
    const ans = {}

    const str = JSON.stringify(ans)

    const parser_output = Parser.parse(str, Json.rfc4627())

    expect(JSON.parse(str)).to.deep.equal(ans)
    expect(parser_output).to.deep.equal(ans)
  })

  it('rfc4627 : object', () => {
    const ans = {
      uites:{},
      sutaiset:[],
      satuie:false,
      tuase:{
        sett:null,
        sauietn:'ttsu""" tuestae \u1234 \n',
        tesauitn: [1,53,4e-34,0.43E3, 0],
        tuaisen: [false, true],
      }
    }

    const str = JSON.stringify(ans)

    const parser_output = Parser.parse(str, Json.rfc4627())

    expect(JSON.parse(str)).to.deep.equal(ans)
    expect(parser_output).to.deep.equal(ans)
  })
})