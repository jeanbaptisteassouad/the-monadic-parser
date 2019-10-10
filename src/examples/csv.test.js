const chai = require('chai')
const expect = chai.expect

const root_path = '..'

const Csv = require(root_path + '/examples/csv')
const Parser = require(root_path + '/monads/parser')

describe('csv', () => {
  it('rfc4180', () => {
    const ans = [
      ['auie', 'eiua', 'aai', 'eeiu'],
      ['sstt', 'asa"tuier', 'ss,rt', 'stsn'],
      ['tse', 'rr', 's', 'auietsn\n\nett'],
      ['rrrr', '122', '13', '34']
    ]

    let str = ''
    str += 'auie,eiua,aai,eeiu\n'
    str += '"sstt","asa""tuier","ss,rt","stsn"\n'
    str += 'tse,rr,s,"auietsn\n'
    str += '\n'
    str += 'ett"\n'
    str += 'rrrr,122,13,34'

    expect(
      Parser.parse(str, Csv.rfc4180())
    ).to.deep.equal(
      ans
    )
  })

  it('withCellSeparator(\';\')', () => {
    const ans = [
      ['auie', 'eiua', 'aai', 'eeiu'],
      ['sstt', 'asa"tuier', 'ss;rt', 'stsn'],
      ['tse', 'rr', 's', 'auietsn\n\nett'],
      ['rrrr', '122', '13', '34']
    ]

    let str = ''
    str += 'auie;eiua;aai;eeiu\n'
    str += '"sstt";"asa""tuier";"ss;rt";"stsn"\n'
    str += 'tse;rr;s;"auietsn\n'
    str += '\n'
    str += 'ett"\n'
    str += 'rrrr;122;13;34'

    expect(
      Parser.parse(str, Csv.withCellSeparator(';')())
    ).to.deep.equal(
      ans
    )
  })  
})