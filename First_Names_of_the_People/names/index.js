const list = require('../country/state/city/index.js')
const firstNameFunc = require('../utilities/utils/index.js')

function getPeopleInCity(list) {
  return firstNameFunc(list)
}

module.exports = getPeopleInCity
