/**
  This module contains one helper function to create a object private property.
  @module Accessors
*/


/**
  @typedef AccessorsArray
  @type {array}
  @property {Get} 0 - Let you get the value of the private property.
  @property {Set} 1 - Let you mutate the value of the private property.
  @property {Update} 2 - Let you mutate the value of the private property
    according to its previous value.
*/

/**
  @typedef Get
  @type {function}
  @param {object} object
  @returns {a}
*/

/**
  @typedef Set
  @type {function}
  @param {a} a
  @param {object} object
  @returns {undefined}
*/

/**
  @typedef Update
  @type {function}
  @param {Updater} updater
  @param {object} object
  @returns {undefined}
*/

/**
  @typedef Updater
  @type {function}
  @param {a} a
  @returns {a}
*/

/**
  Create three functions that can
  read, write and update an object private property.
  When writing and updating the property, the object is mutate.
  It is used to create private property throughout the code.
  The private property is always unique, even if you call this
  function twice with the same name.
  The name is only for description purposes.
  @name create
  @function
  @static
  @param {string} name - The name of the key.
  @returns {AccessorsArray}
*/
