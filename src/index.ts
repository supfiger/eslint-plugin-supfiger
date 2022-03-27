import requireIndex from 'requireindex'

const obj = requireIndex(__dirname + '/rules')
const rules = {}
Object.keys(obj).forEach((ruleName) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  rules[ruleName] = obj[ruleName].default
})

module.exports = { rules }
