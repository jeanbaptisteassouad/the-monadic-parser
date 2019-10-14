

function ParserFailedError(message) {
    this.name = 'ParserFailedError'
    this.message = (message || '')
}

ParserFailedError.prototype = Object.create(Error.prototype)
ParserFailedError.prototype.constructor = ParserFailedError

module.exports = {
  ParserFailedError,
}