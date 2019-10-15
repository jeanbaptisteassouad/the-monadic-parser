// This is the Either monad
const root_path = '..'

const Accessors = require(root_path + '/accessors')

const none_key = Symbol()

const [getRight, setRight] = Accessors.create()
const [getLeft, setLeft] = Accessors.create()

// (e) -> Either<e, a>
const left = (val) => {
  const a = {}

  setLeft(val, a)
  setRight(none_key, a)

  return a
}
// (a) -> Either<e, a>
const right = (val) => {
  const a = {}

  setLeft(none_key, a)
  setRight(val, a)

  return a
}

// (Either<e, a>) -> Bool
const isLeft = a => getRight(a) === none_key
// (Either<e, a>) -> Bool
const isRight = a => getLeft(a) === none_key

// (Either<e, a>, (e) -> b, (a) -> b) -> b
const caseOf = (a, leftCallback, rightCallback) => {
  if (isRight(a)) {
    return rightCallback(getRight(a))
  } else {
    return leftCallback(getLeft(a))
  }
}

// (a) -> Either<e, a>
const pure = right

// (Either<e, a>, (a -> Either<e, b>)) -> Either<e, b>
const then = (a_either, a_to_b_either) => {
  if (isLeft(a_either)) {
    return a_either
  } else {
    return a_to_b_either(getRight(a_either))
  }
}

// (e, Either<e, a>) -> e
const fromLeft = (c, a_either) => {
  if (isLeft(a_either)) {
    return getLeft(a_either)
  } else {
    return c
  }
}

// (a, Either<e, a>) -> a
const fromRight = (a, a_either) => {
  if (isRight(a_either)) {
    return getRight(a_either)
  } else {
    return a
  }
}

module.exports = {
  right,
  left,
  pure,
  caseOf,
  then,
  isRight,
  isLeft,
  fromRight,
  fromLeft,
}
