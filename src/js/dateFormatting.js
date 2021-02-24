const addZeroIfNeeded = (number) => {
  if (number < 9) {
    return `0${number}`
  }
  return `${number}`
}

export const parseDate = (date) => {
  const split = date.split('-')
  return new Date(parseInt(split[0]), parseInt(split[1]), parseInt(split[2]))
}

export const encodeDate = (date) => {
  const yearStr = addZeroIfNeeded(date.getFullYear())
  const monthStr = addZeroIfNeeded(date.getMonth())
  const dateStr = addZeroIfNeeded(date.getDate())

  return `${dateStr}/${monthStr}/${yearStr}`
}

export const formatDate = (date) => {
  return date.toDateString()
}
