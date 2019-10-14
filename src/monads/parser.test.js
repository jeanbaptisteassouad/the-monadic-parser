const chai = require('chai')
const expect = chai.expect

const root_path = '..'

const Parser = require(root_path + '/monads/parser')

describe('parser', () => {
  it('parse(str, pure(a)) === a', () => {
    const a = 'dummy_string'
    const str = 'dummy_input_string'
    expect(
      Parser.parse(str, Parser.pure(a))
    ).to.deep.equal(
      a
    )
  })


  // describe('monad law', () => {
  //   it('then(pure(a), f) === f(a)', () => {
  //     const f = a => a ? State.get() : State.pure(false)

  //     expect(
  //       State.evalState(State.then(State.pure(true), f), true)
  //     ).to.deep.equal(
  //       State.evalState(f(true), true)
  //     )

  //     expect(
  //       State.evalState(State.then(State.pure(false), f), true)
  //     ).to.deep.equal(
  //       State.evalState(f(false), true)
  //     )
  //   })

  //   it('then(m, pure) === m', () => {
  //     const f = a => a ? State.get() : State.pure(false)
  //     let m = f(true)

  //     expect(
  //       State.evalState(State.then(m, State.pure), true)
  //     ).to.deep.equal(
  //       State.evalState(m, true)
  //     )

  //     m = f(false)
  //     expect(
  //       State.evalState(State.then(m, State.pure), true)
  //     ).to.deep.equal(
  //       State.evalState(m, true)
  //     )
  //   })

  //   it('then(m, a => then(k(a), h)) === then(then(m, k), h)', () => {
  //     const f = a => State.get()
  //     let m = f(0)
  //     const k = a => State.pure(a + 1)
  //     const h = a => a ? State.set(a) : State.set(-1)

  //     expect(
  //       State.runState(State.then(m, a => State.then(k(a), h)), undefined)
  //     ).to.deep.equal(
  //       State.runState(State.then(State.then(m, k), h), undefined)
  //     )

  //     m = f(1)
  //     expect(
  //       State.runState(State.then(m, a => State.then(k(a), h)), undefined)
  //     ).to.deep.equal(
  //       State.runState(State.then(State.then(m, k), h), undefined)
  //     )
  //   })
  // })
})