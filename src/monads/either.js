// This is the Either monad

const Accessors = require('../accessors')

const none_key = Symbol()

const [getRight, setRight] = Accessors.create()
const [getLeft, setLeft] = Accessors.create()

// b -> Either b a
const left = (val) => {
  const a = {}

  setLeft(val, a)
  setRight(none_key, a)

  return a
}
// a -> Either b a
const right = (val) => {
  const a = {}

  setLeft(none_key, a)
  setRight(val, a)

  return a
}

// Either c a -> Bool
const isLeft = a => getRight(a) === none_key
// Either c a -> Bool
const isRight = a => getLeft(a) === none_key

// a -> Either c a
const pure = right

// Either c a -> (a -> Either c b) -> Either c b
const then = (a_either, a_to_b_either) => {
  if (isLeft(a_either)) {
    return a_either
  } else {
    return a_to_b_either(getRight(a_either))
  }
}

// c -> Either c a -> c
const fromLeft = (c, a_either) => {
  if (isLeft(a_either)) {
    return getLeft(a_either)
  } else {
    return c
  }
}

// a -> Either c a -> a
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
  then,
  fromRight,
  fromLeft,
}
