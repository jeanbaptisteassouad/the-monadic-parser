const root_path = '.'

const Accessors = require(root_path + '/accessors')

const [getReadingHead, setReadingHead, updateReadingHead] = Accessors.create()
const [getString, setString] = Accessors.create()
const [getFailedHead, setFailedHead] = Accessors.create()

const create = (str) => {
  const a = {}

  setReadingHead(0, a)
  setString(str, a)
  setFailedHead(-1, a)

  return a
}


module.exports = {
  create,
  getString,
  getReadingHead,
  setReadingHead,
  updateReadingHead,
  setFailedHead,
  getFailedHead,
}

