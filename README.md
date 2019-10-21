# theMonadicParser

## Acknowledgement

This library is inspired by the Haskell parser package [Parsec](http://hackage.haskell.org/package/parsec).

## Install

TO DO !!!!!!

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

For more examples you can have a look at the [RFC 4180 csv](src/examples/csv.js) and [RFC 4627 json](scr/examples/json.js) parsers.














## Api

### parse :: (String, Parser\<a\>) -> a

Parse lets you run a parser with a given string.

```js
const Parser = require('theMonadicParser')

// any_parser :: Parser<Array<String>>
Parser.parse('any_string', any_parser) // :: Array<String>
```

### pure :: (a) -> Parser\<a\>

__Pure(a)__ lets you create a parser that contains __a__ and do nothing.

```js
const Parser = require('theMonadicParser')

// p :: Parser<String>
const p = Parser.pure('return_val')

console.log(Parser.parse('any_string', p)) // 'return_val'
```

### fail :: String -> Parser\<a\>


__Fail(error_string)__ lets you create a parser that will always fail with the error message __error_string__. The fail function return a value of type __Parser\<a\>__ but you will never be able to extract a __a__ from it because the parser will fail.

```js
const Parser = require('theMonadicParser')

// p :: Parser<a>
const p = Parser.fail('my error message')

console.log(Parser.parse('any_string', p)) // will throw an error with message : unexpected "a", expecting my error message
```

### getOneChar :: () -> Parser\<Char\>

__getOneChar()__ lets you create a parser that will read one char at the current reading head position, this parser will not consume any input.

```js
const Parser = require('theMonadicParser')

// p :: Parser<Char>
const p = Parser.getOneChar()

console.log(Parser.parse('any_string', p)) // 'a'
```

### consumeOne :: () -> Parser\<Undefined\>

__consumeOne()__ lets you create a parser that consumes one character of the input, moving the reading head forward.


### pipe :: ((a) -> Parser\<b\>, (b) -> Parser\<c\>, ..., (y) -> Parser\<z\>) -> (a) -> Parser\<z\>

Pipe lets you chain monadic functions together. If a parser failed in the chain, the remaining parsers are not executed.

```js
const Parser = require('theMonadicParser')

// pCreator :: () -> Parser<Char>
const pCreator = Parser.pipe(
  Parser.consumeOne, // :: () -> Parser<Undefined>
  Parser.getOneChar, // :: () -> Parser<Char>
)

// p :: Parser<Char>
const p = pCreator()

console.log(Parser.parse('any_string', p)) // 'n'

// pipeX = (...args) => pipe(...args)()
// q :: Parser<Char>
const q = Parser.pipeX(Parser.consumeOne, Parser.getOneChar)

console.log(Parser.parse('any_string', q)) // 'n'
```

### capture :: ((a) -> b) -> ((a) -> Parser\<Undefined\>)

Capture lets you capture the value returned by a parser inside a monadic function chain.

```js
const Parser = require('theMonadicParser')

// parseTheTwoFirstChar :: () -> Parser<String>
const parseTheTwoFirstChar = () => {
  let first_char
  return Parser.pipeX(
    Parser.getOneChar, // :: () -> Parser<Char>
    Parser.capture(a=>first_char=a), // :: Char -> Parser<Undefined>
    Parser.consumeOne, // :: () -> Parser<Undefined>
    Parser.getOneChar, // :: () -> Parser<Char>
    (a) => Parser.pure(first_char + a) // :: Char -> Parser<String>
  )
}

// p :: Parser<String>
const p = parseTheTwoFirstChar()

console.log(Parser.parse('any_string', p)) // 'an'
```

### pureDot :: ((a) -> b) -> ((a) -> Parser\<b\>)

pureDot lets you transform a regular function __a -> b__ to a monadic function __a -> Parser\<b\>__.

```js
// Let's rewrite the previous example.
const Parser = require('theMonadicParser')

// parseTheTwoFirstChar :: () -> Parser<String>
const parseTheTwoFirstChar = () => {
  let first_char
  return Parser.pipeX(
    Parser.getOneChar, // :: () -> Parser<Char>
    Parser.capture(a=>first_char=a), // :: Char -> Parser<Undefined>
    Parser.consumeOne, // :: () -> Parser<Undefined>
    Parser.getOneChar, // :: () -> Parser<Char>
    Parser.pureDot(a=>first_char+a) // :: Char -> Parser<String>
  )
}

// p :: Parser<String>
const p = parseTheTwoFirstChar()

console.log(Parser.parse('any_string', p)) // 'an'
```

### or :: (() -> Parser\<a\>, () -> Parser\<a\>, ..., () -> Parser\<a\>) -> (() -> Parser\<a\>)

Or lets you try multiple parsers until one succeed. If one parser fails __without consuming any input__ the following parsers are tried. If one parser fails __with consuming some input__, the or function stop trying parsers and fails as well. This behaviour ensures that all parsers inside the or function will be tried at the same starting position and that the order in which parsers are tried does not matter.

```js
// Let's rewrite the previous example.
const Parser = require('theMonadicParser')

// parseAorB :: () -> Parser<Char>
const parseAorB = Parser.or(
  Parser.Char.char('a'), // :: () -> Parser<Char>
  Parser.Char.char('b') // :: () -> Parser<Char>
)

// p :: Parser<Char>
const p = parseAorB()

console.log(Parser.parse('any_string', p)) // 'a'
console.log(Parser.parse('b_any_string', p)) // 'b'
console.log(Parser.parse('x_any_string', p)) // will throw : unexpected "x", expecting "a" or "b"

// parseAorB is equivalent to parseBorA
const parseBorA = Parser.or(
  Parser.Char.char('b'),
  Parser.Char.char('a')
)
```

### ttry :: (() -> Parser/<a/>) -> (() -> Parser/<a/>)

__Ttry(p)__ behaves like __p__ except that if __p__ fails with consuming some input, __ttry(p)__ will fail without consuming any input. Ttry function lets you try a parser and if it fails pretends that it didn’t consume any input.

```js
const Parser = require('theMonadicParser')

// badParseAAAorA :: () -> Parser<String>
const badParseAAAorA = Parser.or(
  Parser.Char.string('aaa'), // :: () -> Parser<String>
  Parser.Char.char('a') // :: () -> Parser<String>
)

// p :: Parser<String>
const p = badParseAAAorA()

console.log(Parser.parse('aaa_any_string', p)) // 'aaa'
console.log(Parser.parse('a_any_string', p)) // will throw : unexpected "_", expecting "aaa"

// Parser.Char.string can fail with consuming some input.
// To have the correct behaviour, we need to not consume any input when Parser.Char.string fails.
// We are going to use Parser.ttry function.
// goodParseAAAorA :: () -> Parser<String>
const goodParseAAAorA = Parser.or(
  Parser.ttry(Parser.Char.string('aaa')), // :: () -> Parser<String>
  Parser.Char.char('a') // :: () -> Parser<String>
)

// q :: Parser<String>
const q = goodParseAAAorA()

console.log(Parser.parse('aaa_any_string', p)) // 'aaa'
console.log(Parser.parse('a_any_string', p)) // 'a'
console.log(Parser.parse('b_any_string', p)) // will throw : unexpected "b", expecting "aaa" or "a"
```

### label :: (() -> Parser\<a\>, String) -> (() -> Parser\<a\>)

__label(p, error_str)__ lets you change the error message by __error_str__ if __p__ fails without consuming any input.



### many :: (() -> Parser\<a\>) -> (() -> Parser\<Array\<a\>\>)



many1,
manyTill,
count,

option,
optional,

between,

sepBy,
sepBy1,
endBy,
endBy1,
sepEndBy,
sepEndBy1,

notFollowedBy,
eof,
lookAhead,














### Char.satisfy :: ((Char) -> Bool) -> (() -> Parser\<Char\>)

Satisfy parse a character that satisfies its condition or fail without consuming any input.

### Char.string :: (String) -> (() -> Parser\<String\>)

String parse the given string, it can fail with consuming some input. If you do not want this behaviour compose string with the ttry function.

### Char.oneOf :: (String) -> (() -> Parser\<Char\>)

oneOf succeed if the parsed character is included in its string argument.


### Char.noneOf :: (String) -> (() -> Parser\<Char\>)

noneOf succeed if the parsed character is not included in its string argument.


### Char.space :: () -> Parser\<Char\>

This parser succeed if the parsed character is one of the following character :
- a character tabulation (\\t)
- a line feed (\\n)
- a line tabulation (\\u000b)
- a form feed (\\f)
- a carriage return (\\r)
- a space (\\u0020)
- a next line (\\u0085)
- a no break space (\\u00a0)

### Char.spaces :: () -> Parser\<Array\<Char\>\>

```js
const Parser = require('theMonadicParser')

Parser.Char.spaces === Parser.many(Parser.Char.space)
```

### Char.newline :: () -> Parser\<Char\>

newline succeed if the parsed character is a line feed (\\n).


### Char.crlf :: () -> Parser\<Char\>

crlf succeed if the parsed character is a carriage return immediately followed by a line feed character. This parser always failed without consuming any input.


### Char.endOfLine :: () -> Parser\<Char\>

```js
const Parser = require('theMonadicParser')

Parser.Char.endOfLine === Parser.or(Parser.Char.newline, Parser.Char.crlf)
```

### Char.tab :: () -> Parser\<Char\>

tab succedd if teh parsed character is a tabulation character (\\t)

### Char.upper :: () -> Parser\<Char\>

This parser will parse any upper characters (i.e. any character a that satisfy a.toUpperCase() === a).

### Char.lower :: () -> Parser\<Char\>

This parser will parse any lower characters (i.e. any character a that satisfy a.toLowerCase() === a).

### Char.digit :: () -> Parser\<Char\>

This parser will parse any digit characters (same as regex /[0-9]/).

### Char.hexDigit :: () -> Parser\<Char\>

This parser will parse any hexadecimal digit characters (same as regex /[0-9a-fA-F]/).

### Char.octDigit :: () -> Parser\<Char\>

This parser will parse any octal digit characters (same as regex /[0-7]/).

### Char.char :: (Char) -> (() -> Parser\<Char\>)

This parser will only parse character equal to its argument.

### Char.anyChar :: () -> Parser\<Char\>

This parser will successfully parse any character.







## Contribute

For running tests :

```
yarn test
```

You can use main.js for playground and run it with :

```
yarn start
```

You can fork the library and make pull requests.

