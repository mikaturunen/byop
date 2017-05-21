module.exports = length => {
  let last = null
  let repeat = 0

  length = !length ? 25 : length

  return () => {
    let now = Math.pow(10, 2) * +new Date()

    if (now == last) {
        repeat++
    } else {
        repeat = 0
        last = now
    }

    const s = (now + repeat).toString()
    return +s.substr(s.length - length)
  }
}
