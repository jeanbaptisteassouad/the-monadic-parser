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

Let's look at this example that create a parser that parse
exactly one char satisfying a condition f.

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

// my_parser :: Parser<Char>
const my_parser = myParser()

// char_parsed :: Char
const char_parsed = Parser.parse('c', my_parser)

// This calls would throw.
// Parser.parse('cd', my_parser)
// Parser.parse('', my_parser)
// Parser.parse('d', my_parser)
```

Let's analyse mySatisfy function.

The pipe function is one of the most important of
the library, it lets you chain monadic functions.

```js
const Parser = require('theMonadicParser')

// aToParser_d :: (a) -> Parser<d>
const aToParser_d = Parser.pipe(
  aToParser_b, // :: (a) -> Parser<b>
  bToParser_c, // :: (b) -> Parser<c>
  cToParser_d, // :: (c) -> Parser<d>
)

const pipeX = (...args) => Parser.pipe(...args)()
```

The pure function is a monadic value creator.

```js
const Parser = require('theMonadicParser')

// Parser.pure :: (a) -> Parser<a>

// p :: Parser<Bool>
const p = Parser.pure(true)

console.log(Parser.parse('any_string', p)) // true
```

The getOneChar function read the current char.

```js
const Parser = require('theMonadicParser')

// Parser.getOneChar :: () -> Parser<Char>

console.log(Parser.parse('ap', Parser.getOneChar())) // 'a'

// p :: Parser<String>
const p = Parser.pipeX(
  getOneChar,
  (a) => Parser.pipeX(
    getOneChar,
    (b) => Parser.pure(a + b)
  )
)
// multiple getOneChar calls always return the same result.
console.log(Parser.parse('ap', p)) // 'aa'
```

The consumeOne function consume one character.

```js
const Parser = require('theMonadicParser')

// Parser.consumeOne :: () -> Parser<Undefined>

// p :: Parser<String>
const p = Parser.pipeX(
  consumeOne,
  getOneChar
)
console.log(Parser.parse('ap', p)) // 'p'
```

The fail function lets you indicate that the parser has failed.

```js
const Parser = require('theMonadicParser')

// Parser.fail :: (String) -> Parser<a>

// p :: Parser<String>
const p = fail('optional error message')
Parser.parse('ap', p) // throw
```

Now that we have all the elements, we can explain mySatisfy function.

```js
const Parser = require('theMonadicParser')

// mySatisfy :: ((Char) -> Bool) -> () -> Parser<Char>
const mySatisfy = (f) => Parser.pipe(
  // we first get the character ...
  // () -> Parser<Char>
  Parser.getOneChar,
  
  // (Char) -> Parser<Char>
  (char) => {
    // ... then if f(char) ...
    if (f(char)) {
      // is true, we ...
      // Parser<Char>
      return Parser.pipe(
        // ... consume the character and ...
        // () -> Parser<Undefined>
        Parser.consumeOne,
        
        // ... return the parsed character.
        // () -> Parser<Char>
        () => Parser.pure(char)
      )()
    } else {
      // is false, the parser has failed.
      // :: Parser<a> where a == Char
      return Parser.fail()
    }
  }
)
```

The mySatisfy function is already defined in the library (Parser.Char.satisfy).
We can rewrite the example :
```js
const Parser = require('theMonadicParser')

// myParser :: () -> Parser<Char>
const myParser = () => {
  let ans
  return Parser.pipeX(
    // We are now using the library function.
    // () -> Parser<Char>
    Parser.Char.satisfy(a => a === 'c'),
    
    // Parser.capture(f) === (a) => {f(a); return Parser.pure();}
    // (Char) -> Parser<Undefined>
    Parser.capture(a => ans = a),
    
    // Parser.eof succeed only when there is no more characters to parse.
    // () -> Parser<Undefined>
    Parser.eof,
    // () -> Parser<Char>
    () => Parser.pure(ans)
  )
}

// my_parser :: Parser<Char>
const my_parser = myParser()

// char_parsed :: Char
const char_parsed = Parser.parse('c', my_parser)
```

To create your parser you can use other combinators like 'or', 'sepBy', 'endBy' ...

For more examples you can take a look at the [RFC 4180 csv](src/examples/csv.js) and [RFC 4627 json](scr/examples/json.js) parsers.

## Api

TO DO !!!!!!

## Contribute

For running tests :

```
yarn test
```
