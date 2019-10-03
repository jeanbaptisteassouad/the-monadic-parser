const chai = require('chai')
const expect = chai.expect

const State = require('./state')

describe('accessors', () => {
  it('runState (pure a) s === [a, s]', () => {
    const a = 'dummy_string'
    const s = 'dummy_state'
    expect(
      State.runState(State.pure(a), s)
    ).to.deep.equal(
      [a, s]
    )
  })

  it('evalState (pure a) s === a', () => {
    const a = 'dummy_string'
    const s = 'dummy_state'
    expect(
      State.evalState(State.pure(a), s)
    ).to.equal(
      a
    )
  })

  it('execState (pure a) s === s', () => {
    const a = 'dummy_string'
    const s = 'dummy_state'
    expect(
      State.execState(State.pure(a), s)
    ).to.equal(
      s
    )
  })

  it('runState (get) s === [s, s]', () => {
    const a = 'dummy_string'
    const s = 'dummy_state'

    expect(
      State.runState(State.get(), s)
    ).to.deep.equal(
      [s, s]
    )
  })

  it('runState (set b) s === [undefined, b]', () => {
    const a = 'dummy_string'
    const s = 'dummy_state'
    const next_s = 'next_state'

    expect(
      State.runState(State.set(next_s), s)
    ).to.deep.equal(
      [undefined, next_s]
    )
  })

  it('compose a_to_state_bs === pipe a_to_state_bs.reverse()', () => {
    const fs = [
      State.pure,
      State.get,
      State.set,
      a => State.pure(a ? 1 : 0),
      State.get,
    ]

    const test = (state) => {
      expect(
        State.evalState(state(), true)
      ).to.deep.equal(
        1
      )
      expect(
        State.evalState(state(), false)
      ).to.deep.equal(
        0
      )      
    }

    test(State.compose(...fs))
    fs.reverse()
    test(State.pipe(...fs))
  })

  // Test Monad Law
  // f :: a -> State s b
  // g :: b -> State s c
  // h :: c -> State s d
  it('compose pure f === f', () => {
    const f = a => a ? State.get() : State.pure(false)

    expect(
      State.evalState(State.compose(State.pure, f)(true), true)
    ).to.deep.equal(
      State.evalState(f(true), true)
    )

    expect(
      State.evalState(State.compose(State.pure, f)(false), true)
    ).to.deep.equal(
      State.evalState(f(false), true)
    )
  })

  it('compose f pure === f', () => {
    const f = a => a ? State.get() : State.pure(false)

    expect(
      State.evalState(State.compose(f, State.pure)(true), true)
    ).to.deep.equal(
      State.evalState(f(true), true)
    )

    expect(
      State.evalState(State.compose(f, State.pure)(false), true)
    ).to.deep.equal(
      State.evalState(f(false), true)
    )
  })

  it('compose h (compose g f) === compose (compose h g) f', () => {
    const f = a => a ? State.set(a) : State.set(-1)
    const g = a => State.pure(a + 1)
    const h = a => State.get()

    expect(
      State.runState(State.compose(h, State.compose(g, f))(0), undefined)
    ).to.deep.equal(
      State.runState(State.compose(State.compose(h, g), f)(0), undefined)
    )

    expect(
      State.runState(State.compose(h, State.compose(g, f))(1), undefined)
    ).to.deep.equal(
      State.runState(State.compose(State.compose(h, g), f)(1), undefined)
    )
  })
})