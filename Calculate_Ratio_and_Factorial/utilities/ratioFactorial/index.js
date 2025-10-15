const ratioOfTwoNumbers = require('../ratio/index.js')
const factorialOfNumber = require('../factorial/index.js')

function ratioAndFactorial(a, b, c) {
  let ratio = ratioOfTwoNumbers(a, b)
  let factorial = factorialOfNumber(c)
  return {ratio, factorial}
}

module.exports = ratioAndFactorial
