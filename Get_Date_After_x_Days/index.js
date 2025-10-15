const {addDays} = require('date-fns')
function adding(here) {
  let final = addDays(new Date(2020, 7, 22), here)
  return `${final.getDate()}-${final.getMonth() + 1}-${final.getFullYear()}`
}
module.exports = adding
