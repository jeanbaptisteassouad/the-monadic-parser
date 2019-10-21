const chai = require('chai')
const expect = chai.expect

const root_path = '..'

const Parser = require(root_path + '/monads/parser')
const ParserError = require(root_path + '/parser-error')
const Char = require(root_path + '/char')

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


    describe('.or', () => {
      it('or(f, g) if f succeeds, the value of f is returned', () => {
        const str = 'auie'
        const f = Char.char('a')
        const g = Char.char('b')

        expect(
          Parser.parse(str,
            Parser.or(f, g)()
          )
        ).to.equal('a')
      })

      it('or(f, g) if f fails without consuming any input, parser g is tried', () => {
        const str = 'auie'
        const f = Char.char('b')
        const g = Char.char('a')

        expect(
          Parser.parse(str,
            Parser.or(f, g)()
          )
        ).to.equal('a')
      })

      it('or(f, g) if f fails with consuming some input, it should fail', () => {
        const str = 'auie'
        const f = Char.string('ab')
        const g = Char.char('a')

        expect(
          () => Parser.parse(str,
            Parser.or(f, g)()
          )
        ).to.throw(ParserError.ParserFailedError)
      })
    })

    describe('.ttry', () => {
      it('ttry(f) should pretends that f has not consume any input if f has failed', () => {
        const str = 'auie'
        const f = Parser.ttry(Char.string('ab'))
        const g = Parser.ttry(Char.string('au'))

        expect(
          Parser.parse(str,
            Parser.or(f, g)()
          )
        ).to.equal('au')
      })
    })

    describe('.label', () => {
      it('label(f, msg) if f fails without consuming any input, remplace error the error message with msg', () => {
        const str = 'auie'
        const f = Parser.label(
          () => Parser.fail('prev_error_msg'),
          'dummy_error_msg'
        )

        const g = Parser.label(
          Parser.pipe(Parser.consumeOne, () => Parser.fail('prev_error_msg')),
          'dummy_error_msg'
        )

        expect(() => Parser.parse(str, f())).to.throw(
          ParserError.ParserFailedError,
          'unexpected "a", expecting dummy_error_msg'
        )
        expect(() => Parser.parse(str, g())).to.throw(
          ParserError.ParserFailedError,
          'unexpected "a", expecting prev_error_msg'
        )
      })
    })


    describe('.many', () => {
      it('should return an array of match', () => {
        const str = 'auie'
        const f = Parser.many(Char.oneOf('iua'))

        expect(Parser.parse(str, f())).to.deep.equal(
          ['a', 'u', 'i']
        )
        expect(Parser.parse('a', f())).to.deep.equal(
          ['a']
        )
        expect(Parser.parse('str', f())).to.deep.equal(
          []
        )
      })

      it('should not consume input when trying a parser that fails with consuming input', () => {
        const str = 'auieauig'
        const f = () => {
          let ans = ''
          return Parser.pipeX(
            Parser.many(Char.string('auie')),
            Parser.capture(a=>ans+=a.join('')),
            Char.anyChar,
            Parser.pureDot(a=>ans+a)
          )
        }

        expect(Parser.parse(str, f())).to.deep.equal('auiea')
      })
    })

    describe('.many1', () => {
      it('should return an array of at least one match', () => {
        const str = 'auie'
        const f = Parser.many1(Char.oneOf('iua'))

        expect(Parser.parse(str, f())).to.deep.equal(
          ['a', 'u', 'i']
        )
        expect(Parser.parse('a', f())).to.deep.equal(
          ['a']
        )
        expect(() => Parser.parse('str', f())).to.throw(
          ParserError.ParserFailedError,
        )

      })

      it('should not consume input when trying a parser that fails with consuming input', () => {
        const str = 'auieauig'
        const f = () => {
          let ans = ''
          return Parser.pipeX(
            Parser.many1(Char.string('auie')),
            Parser.capture(a=>ans+=a.join('')),
            Char.anyChar,
            Parser.pureDot(a=>ans+a)
          )
        }

        expect(Parser.parse(str, f())).to.deep.equal('auiea')
      })
    })

    describe('.count', () => {
      it('count(n, p) should return an array of exactly n match', () => {
        const str = 'auie'
        const f = Parser.count(3, Char.oneOf('iua'))

        expect(Parser.parse(str, f())).to.deep.equal(
          ['a', 'u', 'i']
        )
        expect(() => Parser.parse('a', f())).to.throw(
          ParserError.ParserFailedError,
        )
        expect(() => Parser.parse('str', f())).to.throw(
          ParserError.ParserFailedError,
        )
        expect(Parser.parse('auii', f())).to.deep.equal(
          ['a', 'u', 'i']
        )

      })
    })


    describe('.between', () => {
      it('between(start, end, p) === pipe(start, p, (a) => pipeX(end, () => pure(a)) )', () => {
        const str = '[auie]'
        const f = Parser.between(
          Char.char('['),
          Char.char(']'),
          Parser.many(Char.oneOf('iuae'))
        )

        expect(Parser.parse(str, f())).to.deep.equal(
          ['a', 'u', 'i', 'e']
        )
        expect(() => Parser.parse('[a', f())).to.throw(
          ParserError.ParserFailedError,
        )
        expect(() => Parser.parse('aui', f())).to.throw(
          ParserError.ParserFailedError,
        )
        expect(() => Parser.parse('[d]', f())).to.throw(
          ParserError.ParserFailedError,
        )

      })
    })

    describe('.option', () => {
      it('option(a, p) === p if p succeeds', () => {
        const str = 'auie'
        const f = Parser.option(
          'option',
          Char.oneOf('iuae')
        )

        expect(Parser.parse(str, f())).to.deep.equal(
          'a'
        )
      })

       it('option(a, p) === a if p fails', () => {
        const str = 'kauie'
        const f = Parser.option(
          'option',
          Char.oneOf('iuae')
        )

        expect(Parser.parse(str, f())).to.deep.equal(
          'option'
        )
      })
    })

    describe('.optional', () => {
      it('optional(f) always succeeds expect when f has failed with consuming some input', () => {
        const str = 'auie'
        const f = Parser.pipe(
          Parser.optional(Char.char(':')),
          Char.oneOf('auie')
        )

        expect(Parser.parse(str, f())).to.deep.equal(
          'a'
        )
        expect(Parser.parse(':'+str, f())).to.deep.equal(
          'a'
        )

        const g = Parser.pipe(
          Parser.optional(Char.string('::')),
          Char.oneOf('auie')
        )

        expect(() => Parser.parse(':'+str, g())).to.throw(
          ParserError.ParserFailedError,
        )
      })
    })


    describe('.sepBy', () => {
      it('sepBy(f, sep)', () => {
        const str = 'a,u,ie'
        const f = Parser.sepBy(
          Char.oneOf('auie'),
          Char.char(',')
        )

        expect(Parser.parse(str, f())).to.deep.equal(
          ['a', 'u', 'i']
        )
        expect(Parser.parse('a,e', f())).to.deep.equal(
          ['a', 'e']
        )
        expect(Parser.parse('a', f())).to.deep.equal(
          ['a']
        )
        expect(Parser.parse('kk', f())).to.deep.equal(
          []
        )
      })

      it('sepBy1(f, sep)', () => {
        const str = 'a,u,ie'
        const f = Parser.sepBy1(
          Char.oneOf('auie'),
          Char.char(',')
        )

        expect(Parser.parse(str, f())).to.deep.equal(
          ['a', 'u', 'i']
        )
        expect(Parser.parse('a,e', f())).to.deep.equal(
          ['a', 'e']
        )
        expect(Parser.parse('a', f())).to.deep.equal(
          ['a']
        )
        expect(() => Parser.parse('kk', f())).to.throw(
          ParserError.ParserFailedError,
        )
      })
    })


    describe('.endBy', () => {
      it('endBy(f, sep)', () => {
        const str = 'a;u;ie'
        const f = Parser.endBy(
          Char.oneOf('auie'),
          Char.char(';')
        )

        expect(Parser.parse(str, f())).to.deep.equal(
          ['a', 'u']
        )
        expect(Parser.parse('a;e', f())).to.deep.equal(
          ['a']
        )
        expect(Parser.parse('a', f())).to.deep.equal(
          []
        )
        expect(Parser.parse('kk', f())).to.deep.equal(
          []
        )
      })

      it('endBy1(f, sep)', () => {
        const str = 'a;u;ie'
        const f = Parser.endBy1(
          Char.oneOf('auie'),
          Char.char(';')
        )

        expect(Parser.parse(str, f())).to.deep.equal(
          ['a', 'u']
        )
        expect(Parser.parse('a;e', f())).to.deep.equal(
          ['a']
        )
        expect(() => Parser.parse('a', f())).to.throw(
          ParserError.ParserFailedError,
        )
        expect(() => Parser.parse('kk', f())).to.throw(
          ParserError.ParserFailedError,
        )
      })
    })

    describe('.sepEndBy', () => {
      it('sepEndBy(f, sep)', () => {
        const f = () => {
          let content
          return Parser.pipeX(
            Parser.sepEndBy(
              Char.oneOf('auie'),
              Char.char(';')
            ),
            Parser.capture(a=>content=a),
            Char.char('k'),
            () => Parser.pure(content)
          )
        }
        expect(Parser.parse('a;u;i;e;k', f())).to.deep.equal(
          ['a', 'u', 'i', 'e']
        )
        expect(Parser.parse('a;u;i;ek', f())).to.deep.equal(
          ['a', 'u', 'i', 'e']
        )
        expect(Parser.parse('ak', f())).to.deep.equal(
          ['a']
        )
        expect(Parser.parse('k', f())).to.deep.equal(
          []
        )
      })
    })

    describe('.sepEndBy1', () => {
      it('sepEndBy1(f, sep)', () => {
        const f = () => {
          let content
          return Parser.pipeX(
            Parser.sepEndBy1(
              Char.oneOf('auie'),
              Char.char(';')
            ),
            Parser.capture(a=>content=a),
            Char.char('k'),
            () => Parser.pure(content)
          )
        }
        expect(Parser.parse('a;u;i;e;k', f())).to.deep.equal(
          ['a', 'u', 'i', 'e']
        )
        expect(Parser.parse('a;u;i;ek', f())).to.deep.equal(
          ['a', 'u', 'i', 'e']
        )
        expect(Parser.parse('ak', f())).to.deep.equal(
          ['a']
        )
        expect(() => Parser.parse('k', f())).to.throw(
          ParserError.ParserFailedError,
        )
      })
    })

    describe('.notFollowedBy', () => {
      it('notFollowedBy(p)', () => {
        const f = Parser.pipe(
          Char.char('a'),
          (a) => Parser.pipeX(
            Parser.notFollowedBy(Char.char('k')),
            () => Parser.pure(a)
          )
        )
        expect(Parser.parse('ab', f())).to.deep.equal(
          'a'
        )
        expect(() => Parser.parse('ak', f())).to.throw(  
          ParserError.ParserFailedError
        )
      })
    })

    describe('.eof', () => {
      it('eof', () => {
        const f = Parser.pipe(
          Char.string('auie'),
          a => Parser.pipeX(
            Parser.eof,
            () => Parser.pure(a)
          )
        )
        expect(Parser.parse('auie', f())).to.deep.equal(
          'auie'
        )
        expect(() => Parser.parse('auie not finish', f())).to.throw(
          ParserError.ParserFailedError
        )
      })
    })


    describe('.manyTill', () => {
      it('manyTill', () => {
        const f = Parser.manyTill(
          Char.oneOf('auie'),
          Char.char(':')
        )
        expect(Parser.parse('au:ie', f())).to.deep.equal(
          ['a', 'u']
        )
        expect(Parser.parse(':ie', f())).to.deep.equal(
          []
        )
        expect(() => Parser.parse('auie ', f())).to.throw(
          ParserError.ParserFailedError
        )
        expect(() => Parser.parse('auie', f())).to.throw(
          ParserError.ParserFailedError
        )
      })
    })

    describe('.lookAhead', () => {
      it('lookAhead', () => {
        const f = Parser.pipe(
          Parser.lookAhead(
            Char.string('auie')
          ),
          (content) => Parser.pipeX(
            Char.anyChar,
            (a) => Parser.pure(content + a)
          )
        )
        expect(Parser.parse('auie:', f())).to.deep.equal(
          'auiea'
        )
        expect(() => Parser.parse('au:ie ', f())).to.throw(
          ParserError.ParserFailedError
        )
      })
    })



  })

})