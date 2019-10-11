/**
  This module implement the State monad.
  @module State
*/

/**
  State value constructor.
  @name pure
  @function
  @static
  @param {a} a
  @returns {State_s_a}
*/

/**
  This is the bind operator, it let you chain the monadic value
  state_s_a with the monadic function aToState_s_b.
  @name then
  @function
  @static
  @param {State_s_a} state_s_a
  @param {aToState_s_b} aToState_s_b
  @returns {State_s_b}
*/

/**
  Let you get the current state.
  @name get
  @function
  @static
  @returns {State_s_s}
*/

/**
  Let you change the state.
  @name set
  @function
  @static
  @param {s} s
  @returns {State_s_undefined}
*/

/**
  @typedef Axs
  @type {array}
  @property {a} 0 - The value.
  @property {s} 1 - The state.
*/

/**
  Let you run state_s_a with the initial state init_s.
  @name runState
  @function
  @static
  @param {State_s_a} state_s_a
  @param {s} init_s
  @returns {Axs}
*/

/**
  Let you run state_s_a with the initial state init_s
  and discard the final state.
  @name evalState
  @function
  @static
  @param {State_s_a} state_s_a
  @param {s} init_s
  @returns {a}
*/

/**
  Let you run state_s_a with the initial state init_s
  and discard the final value.
  @name execState
  @function
  @static
  @param {State_s_a} state_s_a
  @param {s} init_s
  @returns {s}
*/