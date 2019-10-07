const chai = require('chai')
const expect = chai.expect

const State = require('./state')

describe('state', () => {
  it('runState(pure(a), s) === [a, s]', () => {
    const a = 'dummy_string'
    const s = 'dummy_state'
    expect(
      State.runState(State.pure(a), s)
    ).to.deep.equal(
      [a, s]
    )
  })

  it('evalState(pure(a), s) === a', () => {
    const a = 'dummy_string'
    const s = 'dummy_state'
    expect(
      State.evalState(State.pure(a), s)
    ).to.equal(
      a
    )
  })

  it('execState(pure(a), s) === s', () => {
    const a = 'dummy_string'
    const s = 'dummy_state'
    expect(
      State.execState(State.pure(a), s)
    ).to.equal(
      s
    )
  })

  it('runState(get(), s) === [s, s]', () => {
    const a = 'dummy_string'
    const s = 'dummy_state'

    expect(
      State.runState(State.get(), s)
    ).to.deep.equal(
      [s, s]
    )
  })

  it('runState(set(b), s) === [undefined, b]', () => {
    const a = 'dummy_string'
    const s = 'dummy_state'
    const next_s = 'next_state'

    expect(
      State.runState(State.set(next_s), s)
    ).to.deep.equal(
      [undefined, next_s]
    )
  })

  describe('monad law', () => {
    it('then(pure(a), f) === f(a)', () => {
      const f = a => a ? State.get() : State.pure(false)

      expect(
        State.evalState(State.then(State.pure(true), f), true)
      ).to.deep.equal(
        State.evalState(f(true), true)
      )

      expect(
        State.evalState(State.then(State.pure(false), f), true)
      ).to.deep.equal(
        State.evalState(f(false), true)
      )
    })

    it('then(m, pure) === m', () => {
      const f = a => a ? State.get() : State.pure(false)
      let m = f(true)

      expect(
        State.evalState(State.then(m, State.pure), true)
      ).to.deep.equal(
        State.evalState(m, true)
      )

      m = f(false)
      expect(
        State.evalState(State.then(m, State.pure), true)
      ).to.deep.equal(
        State.evalState(m, true)
      )
    })

    it('then(m, a => then(k(a), h)) === then(then(m, k), h)', () => {
      const f = a => State.get()
      let m = f(0)
      const k = a => State.pure(a + 1)
      const h = a => a ? State.set(a) : State.set(-1)

      expect(
        State.runState(State.then(m, a => State.then(k(a), h)), undefined)
      ).to.deep.equal(
        State.runState(State.then(State.then(m, k), h), undefined)
      )

      m = f(1)
      expect(
        State.runState(State.then(m, a => State.then(k(a), h)), undefined)
      ).to.deep.equal(
        State.runState(State.then(State.then(m, k), h), undefined)
      )
    })
  })
})