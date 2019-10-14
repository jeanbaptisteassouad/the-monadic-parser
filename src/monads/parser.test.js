const chai = require('chai')
const expect = chai.expect

const root_path = '..'

const Parser = require(root_path + '/monads/parser')
const ParserError = require(root_path + '/parser-error')

describe('Parser', () => {

  describe('monadic value creators', () => {
    describe('.pure', () => {
      it('parse(str, pure(a)) === a', () => {
        const a = 'dummy_string'
        const str = 'dummy_input_string'
        expect(
          Parser.parse(str, Parser.pure(a))
        ).to.deep.equal(
          a
        )
      })
    })
    
    describe('.fail', () => {
      it('parse(str, fail(msg)) should throw with error message msg', () => {
        const msg = 'dummy_error_string_msg'
        const str = 'dummy_input_string'
        expect(
          () => Parser.parse(str, Parser.fail(msg))
        ).to.throw(
          ParserError.ParserFailedError,
          'unexpected "d", expecting '+msg
        )
      })
    })
  })

  describe('monadic functions', () => {
    describe('.getOneChar', () => {
      it('multiple call of parse("auie", getOneChar()) should return "a"', () => {
        const str = 'auie'
        expect(
          Parser.parse(str, Parser.getOneChar())
        ).to.deep.equal(
          'a'
        )

        expect(
          Parser.parse(str, Parser.getOneChar())
        ).to.deep.equal(
          'a'
        )

        expect(
          Parser.parse(str, Parser.getOneChar())
        ).to.deep.equal(
          'a'
        )
      })
    })
    
    describe('.consumeOne', () => {
      it('parse("auie", pipeX(consumeOne, getOneChar)) should return "u"', () => {
        const str = 'auie'
        expect(
          Parser.parse(str,
            Parser.pipeX(
              Parser.consumeOne,
              Parser.getOneChar,
            )
          )
        ).to.deep.equal(
          'u'
        )
      })
    })
  })

  describe('monadic function creators', () => {
    describe('.capture', () => {
      it('capture(a => b = a) === a => {b = a; return pure()}', () => {
        const str = 'auie'
        const ans = 4
        let first_var
        let second_var

        expect(
          Parser.parse(str,
            Parser.capture(a => first_var = a)(ans)
          )
        ).to.deep.equal(
          Parser.parse(str,
            ((a) => {
              second_var = a
              return Parser.pure()
            })(ans)
          )
        )

        expect(first_var).to.equal(second_var)
        expect(first_var).to.equal(ans)

        expect(
          Parser.parse(str,
            Parser.capture(a => first_var = a)(ans)
          )
        ).to.be.undefined
      })
    })

    describe('.pureDot', () => {
      it('pureDot(a => a*2) === a => pure(a*2)', () => {
        const str = 'auie'
        expect(
          Parser.parse(str,
            Parser.pureDot(a => a * 2)(4)
          )
        ).to.deep.equal(
          Parser.parse(str,
            ((a) => Parser.pure(a * 2))(4)
          )
        )

        expect(
          Parser.parse(str,
            Parser.pureDot(a => a * 2)(4)
          )
        ).to.equal(8)
      })
    })
  })

  describe('monadic function combinators', () => {
    describe('.pipe', () => {
      it('pipe(f, () => fail, g) === pipe(f, () => fail)', () => {
        const str = 'auie'
        let should_always_be_defined
        const f = Parser.capture(() => should_always_be_defined = true)
        let should_always_be_undefined
        const g = Parser.capture(() => should_always_be_undefined = true)

        expect(
          () => Parser.parse(str,
            Parser.pipe(f, () => Parser.fail(), g)()
          )
        ).to.throw(ParserError.ParserFailedError)

        expect(should_always_be_defined).to.equal(true)
        expect(should_always_be_undefined).to.be.undefined
      })

      describe('should respect the monad law', () => {
        const str = 'auie'
        const f = Parser.getOneChar
        const g = Parser.pureDot(a => a + a)
        const h = Parser.pureDot(a => 'my '+a)

        it('pipe(pure, g) === g', () => {
          expect(
            Parser.parse(str,
              Parser.pipe(Parser.pure, g)('s')
            )
          ).to.equal('ss')

          expect(
            Parser.parse(str,
              Parser.pipe(Parser.pure, g)('s')
            )
          ).to.equal(Parser.parse(str, g('s')))
        })

        it('pipe(f, pure) === f', () => {
          expect(
            Parser.parse(str,
              Parser.pipe(f, Parser.pure)('s')
            )
          ).to.equal('a')

          expect(
            Parser.parse(str,
              Parser.pipe(f, Parser.pure)('s')
            )
          ).to.equal(Parser.parse(str, f('s')))
        })

        it('pipe(pipe(f, g), h) === pipe(f, pipe(g, h)) === pipe(f, g, h)', () => {
          expect(
            Parser.parse(str,
              Parser.pipe(Parser.pipe(f, g), h)('s')
            )
          ).to.equal('my aa')

          expect(
            Parser.parse(str,
              Parser.pipe(Parser.pipe(f, g), h)('s')
            )
          ).to.equal(
            Parser.parse(str,
              Parser.pipe(f, Parser.pipe(g, h))('s')
            )
          )
        })
      })
    })

    describe('.pipeX', () => {
      it('pipeX(f, g) === pipe(f, g)()', () => {
        const str = 'auie'
        const f = Parser.consumeOne
        const g = Parser.getOneChar

        expect(
          Parser.parse(str,
            Parser.pipeX(f, g)
          )
        ).to.equal('u')

        expect(
          Parser.parse(str,
            Parser.pipeX(f, g)
          )
        ).to.equal(
          Parser.parse(str,
            Parser.pipe(f, g)()
          )
        )
      })
    })
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