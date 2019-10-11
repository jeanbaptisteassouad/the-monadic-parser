/**
  This module implement the Either monad.
  @module Either
*/

/**
  Alias for right.
  @name pure
  @function
  @static
  @param {a} a
  @returns {Either_e_a}
*/

/**
  Right value creator.
  @name right
  @function
  @static
  @param {a} a
  @returns {Either_e_a}
*/

/**
  Left value creator.
  @name left
  @function
  @static
  @param {e} e
  @returns {Either_e_a}
*/

/**
  If either_e_a is right, it unwrap either_e_a and call aToB,
  otherwise it unwrap either_e and call eToB.
  @name caseOf
  @function
  @static
  @param {Either_e_a} either_e_a
  @param {eToB} eToB
  @param {aToB} aToB
  @returns {b}
*/

/**
  This is the bind operator, it let you chain
  the monadic value either_e_a with the monadic function aToEither_e_b.
  If either_e_a is right, it unwrap either_e_a and call aToEither_e_b,
  otherwise it return either_e_a.
  @name then
  @function
  @static
  @param {Either_e_a} either_e_a
  @param {aToEither_e_b} aToEither_e_b
  @returns {Either_e_b}
*/

/**
  Return true if either_e_a is a right value, false otherwise.
  @name isRight
  @function
  @static
  @param {Either_e_a} either_e_a
  @returns {Boolean}
*/

/**
  Return true if either_e_a is a left value, false otherwise.
  @name isLeft
  @function
  @static
  @param {Either_e_a} either_e_a
  @returns {Boolean}
*/

/**
  Return the unwraped value if either_e_a is a right value,
  or return default_a
  @name fromRight
  @function
  @static
  @param {a} default_a
  @param {Either_e_a} either_e_a
  @returns {a}
*/

/**
  Return the unwraped value if either_e_a is a left value,
  or return default_e
  @name fromLeft
  @function
  @static
  @param {e} default_e
  @param {Either_e_a} either_e_a
  @returns {e}
*/
