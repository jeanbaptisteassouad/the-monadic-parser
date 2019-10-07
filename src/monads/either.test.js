const chai = require('chai')
const expect = chai.expect

const Either = require('./either')

describe('either', () => {
  it('fromRight(b, pure(a)) === a', () => {
    const a = 'dummy_string'
    const b = 'dummy_string_2'
    expect(
      Either.fromRight(b, Either.pure(a))
    ).to.deep.equal(
      a
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

  it('fromLeft(b, pure(a)) === b', () => {
    const a = 'dummy_string'
    const b = 'dummy_string_2'
    expect(
      Either.fromLeft(b, Either.pure(a))
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