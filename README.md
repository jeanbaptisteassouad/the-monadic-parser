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

// getOne :: () -> Number
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
    
    // Parser.capture(f) is equivalent to (a) => {f(a); return Parser.pure();}
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

Or lets you try multiple parsers until one succeed. If one parser fails __without consuming any input__ the following parsers are tried. If one parser fails __with consuming some input__, the or function stop trying parsers and fails as well.

This behaviour ensures that all parsers inside the or function will be tried at the same starting position and that the order in which parsers are tried does not matter.

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

### ttry :: (() -> Parser/<a/>) -> (() -> Parser/<a/>)

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

```js
const Parser = require('theMonadicParser')

// p :: Parser<Char>
const p = Parser.Char.char('a')()
// q :: Parser<Char>
const q = Parser.label(Parser.Char.char('a'), 'the first letter of alphabet')()

console.log(Parser.parse('any_string', p)) // 'a'
console.log(Parser.parse('b_any_string', p)) // will throw : unexpected "b", expecting "a"
console.log(Parser.parse('any_string', q)) // 'a'
console.log(Parser.parse('b_any_string', q)) // will throw : unexpected "b", expecting the first letter of alphabet
```

### many :: (() -> Parser\<a\>) -> (() -> Parser\<Array\<a\>\>)

__many(p)__ lets you apply __p__ many times until it fails, __many(p)__ will never fail.

```js
const Parser = require('theMonadicParser')

// p :: Parser<Array<Char>>
const p = Parser.many(Parser.Char.char('a'))()

console.log(Parser.parse('aaa_any_string', p)) // ['a', 'a', 'a']
console.log(Parser.parse('a_any_string', p)) // ['a']
console.log(Parser.parse('b_any_string', p)) // []
```

### many1 :: (() -> Parser\<a\>) -> (() -> Parser\<Array\<a\>\>)

__many1(p)__ lets you apply __p__ many times until it fails, __many1(p)__ must at least apply successfully __p__ once.

```js
const Parser = require('theMonadicParser')

// p :: Parser<Array<Char>>
const p = Parser.many(Parser.Char.char('a'))()

console.log(Parser.parse('aaa_any_string', p)) // ['a', 'a', 'a']
console.log(Parser.parse('a_any_string', p)) // ['a']
console.log(Parser.parse('b_any_string', p)) // will throw : unexpected "b", expecting "a"
```

### manyTill :: (() -> Parser\<a\>, () -> Parser\<end\>) -> (() -> Parser\<Array\<a\>\>)

__manyTill(p, end)__ lets you apply __p__ many times until __end__ succeed, __manyTill(p, end)__ will fail if __p__ fails before __end__ succeed.

```js
const Parser = require('theMonadicParser')

// end :: () -> Parser<Char>
const end = Parser.Char.char('_')
// p :: Parser<Array<Char>>
const p = Parser.manyTill(Parser.Char.char('a'), end)()

console.log(Parser.parse('aaa_any_string', p)) // ['a', 'a', 'a']
console.log(Parser.parse('a_any_string', p)) // ['a']
console.log(Parser.parse('_any_string', p)) // []
console.log(Parser.parse('ab_any_string', p)) // will throw : unexpected "b",  expecting "a"
```


### count :: (Int, () -> Parser\<a\>) -> (() -> Parser\<Array\<a\>\>)

__count(n, p)__ lets you apply __p__ exactly __n__ times. If __p__ cannot be applied __n__ times, __count(n, p)__ will fail. If __n__ is negative or equal to zero, __count(n, p)__ will return an empty list.

```js
const Parser = require('theMonadicParser')

// p :: Parser<Array<Char>>
const p = Parser.count(3, Parser.Char.char('a'))()

console.log(Parser.parse('aaa_any_string', p)) // ['a', 'a', 'a']
console.log(Parser.parse('a_any_string', p)) // will throw : unexpected "_", expecting "a"
console.log(Parser.parse('aaaaa_any_string', p)) // ['a', 'a', 'a']

// q :: Parser<Array<Char>>
const q = Parser.count(0, Parser.Char.char('a'))()

console.log(Parser.parse('aaa_any_string', q)) // []

// r :: Parser<Array<Char>>
const r = Parser.count(-1, Parser.Char.char('a'))()

console.log(Parser.parse('aaa_any_string', r)) // []
```


### option :: (a, () -> Parser\<a\>) -> (() -> Parser\<a\>)

__option(a, p)__ lets you try to apply __p__, if __p__ fails without consuming any input, __option(a, p)__ returns __a__ instead, if __p__ fails with consuming some input, __option(a, p)__ will fail.

This behaviour is here to assure that __option(a, p)__ is equivalent to either __p__ or __() => pure(a)__ when __p__ fails without consuming any input.

```js
const Parser = require('theMonadicParser')

// p :: Parser<Char>
const p = Parser.option('a', Parser.Char.oneOf('auie'))()

console.log(Parser.parse('u_any_string', p)) // 'u'
console.log(Parser.parse('e_any_string', p)) // 'e'
console.log(Parser.parse('k_any_string', p)) // 'a'

// q :: Parser<String>
const q = Parser.option('a', Parser.Char.string('auie'))()

console.log(Parser.parse('auie_any_string', q)) // 'auie'
// Parser.Char.string will fail with consuming some input
console.log(Parser.parse('aui_any_string', q)) // will throw : unexpected "_", expecting "auie"

// r :: Parser<String>
const r = Parser.option('a', Parser.ttry(Parser.Char.string('auie')))()
console.log(Parser.parse('aui_any_string', r)) // 'a'
```


### optional :: (() -> Parser\<a\>) -> (() -> Parser\<Undefined\>)

__optional(p)__ lets you try to apply __p__, if __p__ succeeds the result is discarded, if __p__ fails without consuming any input, __optional(p)__ is equivalent to __pure__, and if __p__ fails with consuming some input, __optional(p)__ will fail.

```js
const Parser = require('theMonadicParser')

// p :: Parser<Char>
const p = Parser.optional(Parser.Char.oneOf('auie'))()

console.log(Parser.parse('u_any_string', p)) // undefined
console.log(Parser.parse('e_any_string', p)) // undefined
console.log(Parser.parse('k_any_string', p)) // undefined

// q :: Parser<String>
const q = Parser.optional(Parser.Char.string('auie'))()

console.log(Parser.parse('auie_any_string', q)) // undefined
// Parser.Char.string will fail with consuming some input
console.log(Parser.parse('aui_any_string', q)) // will throw : unexpected "_", expecting "auie"

// r :: Parser<String>
const r = Parser.optional(Parser.ttry(Parser.Char.string('auie')))()
console.log(Parser.parse('aui_any_string', r)) // undefined
```


### between :: (() -> Parser\<open\>, () -> Parser\<close\>, () -> Parser\<a\>) -> (() -> Parser\<a\>)

__between(open, close, p)__ behaves like __p__ except that it will first apply __open__ then apply __p__ and finally apply __close__, discarding the result of __open__ and __close__.

```js
const Parser = require('theMonadicParser')

// open :: () -> Parser<Char>
const open = Parser.Char.char('(')

// close :: () -> Parser<Char>
const close = Parser.Char.char(')')

// p :: Parser<Char>
const p = Parser.between(open, close, Parser.Char.string('auie'))()

console.log(Parser.parse('(auie)_any_string', p)) // 'auie'
console.log(Parser.parse('(auie_any_string', p)) // will throw : unexpected "_", expecting ")"
console.log(Parser.parse('auie)_any_string', p)) // will throw : unexpected "a", expecting "("
console.log(Parser.parse('(aui)_any_string', p)) // will throw : unexpected ")", expecting "auie"
```

### sepBy :: (() -> Parser\<a\>, () -> Parser\<sep\>) -> (() -> Parser\<Array\<a\>\>)

__sepBy(p, sep)__ lets you parse many __p__ separated by __sep__.

```js
const Parser = require('theMonadicParser')

// sep :: () -> Parser<Char>
const sep = Parser.Char.char(';')

// p :: Parser<Array<Array<Char>>>
const p = Parser.sepBy(Parser.many1(Parser.Char.noneOf(';')), sep)()

console.log(Parser.parse('any;_str;ing', p)) // [['a','n','y'], ['_','s','t','r'], ['i','n','g']]
console.log(Parser.parse('any', p)) // [['a','n','y']]
console.log(Parser.parse(';', p)) // []
```


### sepBy1 :: (() -> Parser\<a\>, () -> Parser\<sep\>) -> (() -> Parser\<Array\<a\>\>)

__sepBy1(p, sep)__ is like __sepBy(p, sep)__ but it must at least successfully apply __p__ once.

```js
const Parser = require('theMonadicParser')

// sep :: () -> Parser<Char>
const sep = Parser.Char.char(';')

// p :: Parser<Array<Array<Char>>>
const p = Parser.sepBy1(Parser.many1(Parser.Char.noneOf(';')), sep)()

console.log(Parser.parse('any;_str;ing', p)) // [['a','n','y'], ['_','s','t','r'], ['i','n','g']]
console.log(Parser.parse('any', p)) // [['a','n','y']]
console.log(Parser.parse(';', p)) // will throw : unexpected ";", expecting none of [";"]
```



### endBy :: (() -> Parser\<a\>, () -> Parser\<sep\>) -> (() -> Parser\<Array\<a\>\>)

__endBy(p, sep)__ lets you parse many __p__ ended by __sep__.

```js
const Parser = require('theMonadicParser')

// sep :: () -> Parser<Char>
const sep = Parser.Char.char(';')

// p :: Parser<Array<Array<Char>>>
const p = Parser.endBy1(Parser.many1(Parser.Char.noneOf(';')), sep)()

console.log(Parser.parse('any;_str;ing;', p)) // [['a','n','y'], ['_','s','t','r'], ['i','n','g']]
console.log(Parser.parse('any;', p)) // [['a','n','y']]
console.log(Parser.parse('any', p)) // []
```


### endBy1 :: (() -> Parser\<a\>, () -> Parser\<sep\>) -> (() -> Parser\<Array\<a\>\>)

__endBy1(p, sep)__ is like __endBy(p, sep)__ but it must at least successfully apply __p__ and __sep__ once.


```js
const Parser = require('theMonadicParser')

// sep :: () -> Parser<Char>
const sep = Parser.Char.char(';')

// p :: Parser<Array<Array<Char>>>
const p = Parser.endBy(Parser.many1(Parser.Char.noneOf(';')), sep)()

console.log(Parser.parse('any;_str;ing;', p)) // [['a','n','y'], ['_','s','t','r'], ['i','n','g']]
console.log(Parser.parse('any;', p)) // [['a','n','y']]
console.log(Parser.parse('any', p)) // will throw : unexpected "y", expecting ";"
```

### sepEndBy :: (() -> Parser\<a\>, () -> Parser\<sep\>) -> (() -> Parser\<Array\<a\>\>)

__sepEndBy(p, sep)__ is like __sepBy(p, sep)__ but it can optionally parse a __sep__ at the end.

### sepEndBy1 :: (() -> Parser\<a\>, () -> Parser\<sep\>) -> (() -> Parser\<Array\<a\>\>)

__sepEndBy1(p, sep)__ is like __sepBy1(p, sep)__ but it can optionally parse a __sep__ at the end.

### notFollowedBy :: (() -> Parser\<a\>) -> (() -> Parser\<Undefined\>)

__notFollowedBy(p)__ will succeed when __p__ fails and will fail when __p__ succeeds.
When __notFollowedBy__ succeed it will not consume any input, but when it fails, it can consume some input.


### eof :: () -> Parser\<Undefined\>

__Eof__ lets you parse the end of file, i.e. the end of the current parsed string. __Eof__ will never consume any input.


### lookAhead :: (() -> Parser\<a\>) -> (() -> Parser\<a\>)

__lookAhead__ lets you do arbitrary look ahead. __lookAhead(p)__ will not consume any input if __p__ succeeds, if __p__ fails, __lookAhead(p)__ will fail as well and can consume some input.














### Char.satisfy :: ((Char) -> Bool) -> (() -> Parser\<Char\>)

Satisfy parse a character that satisfies its condition or fail without consuming any input.

### Char.string :: (String) -> (() -> Parser\<String\>)

String parse the given string, it can fail with consuming some input. If you do not want this behaviour compose string with the ttry function.

### Char.oneOf :: (String) -> (() -> Parser\<Char\>)

oneOf succeed if the parsed character is included in its string argument.


### Char.noneOf :: (String) -> (() -> Parser\<Char\>)

noneOf succeed if the parsed character is not included in its string argument.


### Char.space :: () -> Parser\<Char\>

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


### Char.crlf :: () -> Parser\<Char\>

crlf succeed if the parsed character is a carriage return immediately followed by a line feed character. This parser always failed without consuming any input.


### Char.endOfLine :: () -> Parser\<Char\>

```js
const Parser = require('theMonadicParser')

Parser.Char.endOfLine === Parser.or(Parser.Char.newline, Parser.Char.crlf)
```

### Char.tab :: () -> Parser\<Char\>

tab succeed if teh parsed character is a tabulation character (\\t)

### Char.upper :: () -> Parser\<Char\>

This parser will parse any upper characters (i.e. any character a that satisfy a.toUpperCase() === a).

### Char.lower :: () -> Parser\<Char\>

This parser will parse any lower characters (i.e. any character a that satisfy a.toLowerCase() === a).

### Char.digit :: () -> Parser\<Char\>

This parser will parse any digit characters (same as regex /[0-9]/).

### Char.hexDigit :: () -> Parser\<Char\>

This parser will parse any hexadecimal digit characters (same as regex /[0-9a-fA-F]/).

### Char.octDigit :: () -> Parser\<Char\>

This parser will parse any octal digit characters (same as regex /[0-7]/).

### Char.char :: (Char) -> (() -> Parser\<Char\>)

This parser will only parse character equal to its argument.

### Char.anyChar :: () -> Parser\<Char\>

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

