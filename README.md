# theMonadicParser

## Acknowledgement

This library is inspired by the Haskell parser package [Parsec](http://hackage.haskell.org/package/parsec).

## Type annotations

We are going to use a type annotation inspired by flow.js and typescript.

```js
// Here is some function type example.
// The '::' can be read 'has type'.

// getOne :: () -> Number
const getOne = () => 1

// Here 'a' is a type variable and 'Array<a>' is a polymorphic type.
// It's mean that 'a' can be anythings.
// getLength :: (Array<a>) -> Number
const getLength = (a) => a.length

// strToArray :: (String, String) -> Array<String>
const strToArray = (spliter, a) => a.split(spliter)
```

All the types will start with a capital letter (ex : String, Array\<Number\>, ...)
except for the type variables (ex : a, b, ...).

## Getting Started

You will create your parser by combining **monadic function :: () -> Parser\<a\>**.

A monadic function is a function that return **a monadic value :: Parser\<a\>**.

Let's look at this code that parse a char and check if it satisfy a condition f.

```js
const Parser = require('theMonadicParser')

// mySatisfy :: ((Char) -> Bool) -> () -> Parser<Char>
const mySatisfy = (f) => Parser.pipe(
  Parser.getOneChar,
  (char) => {
    if (f(char)) {
      return Parser.pipe(
        Parser.consumeOne,
        () => Parser.pure(char)
      )()
    } else {
      return Parser.fail()
    }
  }
)

// myParser :: () -> Parser<Char>
const myParser = () => {
  let ans
  return Parser.pipeX(
    mySatisfy(a => a === 'c'),
    Parser.capture(a => ans = a),
    Parser.eof,
    () => Parser.pure(ans)
  )
}

const my_parser = myParser()

const char_parsed = Parser.parse('c', my_parser)

// // would throw
// Parser.parse('cd', my_parser)
// Parser.parse('', my_parser)
```


The pure function is a monadic value creator.
```js
const Parser = require('theMonadicParser')

// Parser.pure :: (a) -> Parser<a>

// p :: Parser<Bool>
const p = Parser.pure(true)
```
