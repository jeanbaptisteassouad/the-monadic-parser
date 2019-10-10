const chai = require('chai')
const expect = chai.expect

const root_path = '..'

const Either = require(root_path + '/monads/either')

describe('either', () => {
  it('pure === right', () => {
    expect(
      Either.pure
    ).to.deep.equal(
      Either.right
    )
  })

  it('caseOf(right(a), a=>a+a, a=>a*a) === a*a', () => {
    const a = 3
    expect(
      Either.caseOf(Either.right(a), a=>a+a, a=>a*a)
    ).to.deep.equal(
      9
    )
  })

  it('caseOf(left(a), a=>a+a, a=>a*a) === a+a', () => {
    const a = 3
    expect(
      Either.caseOf(Either.left(a), a=>a+a, a=>a*a)
    ).to.deep.equal(
      6
    )
  })

  it('isRight(right(a)) === true', () => {
    const a = 'dummy_string'
    expect(
      Either.isRight(Either.right(a))
    ).to.deep.equal(
      true
    )
  })

  it('isLeft(right(a)) === false', () => {
    const a = 'dummy_string'
    expect(
      Either.isLeft(Either.right(a))
    ).to.deep.equal(
      false
    )
  })

  it('isRight(left(a)) === false', () => {
    const a = 'dummy_string'
    expect(
      Either.isRight(Either.left(a))
    ).to.deep.equal(
      false
    )
  })

  it('isLeft(left(a)) === true', () => {
    const a = 'dummy_string'
    expect(
      Either.isLeft(Either.left(a))
    ).to.deep.equal(
      true
    )
  })

  it('fromRight(b, right(a)) === a', () => {
    const a = 'dummy_string'
    const b = 'dummy_string_2'
    expect(
      Either.fromRight(b, Either.right(a))
    ).to.deep.equal(
      a
    )
  })

  it('fromRight(b, left(a)) === b', () => {
    const a = 'dummy_string'
    const b = 'dummy_string_2'
    expect(
      Either.fromRight(b, Either.left(a))
    ).to.deep.equal(
      b
    )
  })

  it('fromLeft(b, right(a)) === b', () => {
    const a = 'dummy_string'
    const b = 'dummy_string_2'
    expect(
      Either.fromLeft(b, Either.right(a))
    ).to.deep.equal(
      b
    )
  })

  it('fromLeft(b, left(a)) === a', () => {
    const a = 'dummy_string'
    const b = 'dummy_string_2'
    expect(
      Either.fromLeft(b, Either.left(a))
    ).to.deep.equal(
      a
    )
  })


  describe('monad law', () => {
    it('then(pure(a), f) === f(a)', () => {
      const f = a => a ? Either.left(true) : Either.pure(false)

      expect(
        Either.fromLeft(undefined, Either.then(Either.pure(true), f))
      ).to.deep.equal(
        Either.fromLeft(null, f(true))
      )

      expect(
        Either.fromRight(undefined, Either.then(Either.pure(false), f))
      ).to.deep.equal(
        Either.fromRight(null, f(false))
      )
    })

    it('then(m, pure) === m', () => {
      const f = a => a ? Either.left(true) : Either.pure(false)
      let m = f(true)

      expect(
        Either.fromLeft(undefined, Either.then(m, Either.pure))
      ).to.deep.equal(
        Either.fromLeft(null, m)
      )

      m = f(false)
      expect(
        Either.fromRight(undefined, Either.then(m, Either.pure))
      ).to.deep.equal(
        Either.fromRight(null, m)
      )
    })

    it('then(m, a => then(k(a), h)) === then(then(m, k), h)', () => {
      const f = a => a ? Either.right(a) : Either.left(-1)
      let m = f(0)
      const k = a => Either.pure(a + 1)
      const h = a => Either.pure(a * 2)

      expect(
        Either.fromLeft(undefined, Either.then(m, a => Either.then(k(a), h)))
      ).to.deep.equal(
        Either.fromLeft(null, Either.then(Either.then(m, k), h))
      )

      m = f(1)
      expect(
        Either.fromRight(undefined, Either.then(m, a => Either.then(k(a), h)))
      ).to.deep.equal(
        Either.fromRight(null, Either.then(Either.then(m, k), h))
      )
    })
  })
})