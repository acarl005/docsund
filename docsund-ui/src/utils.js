export const optionalToString = v =>
  ![null, undefined].includes(v) && typeof v.toString === 'function'
    ? v.toString()
    : v

export function deepEquals(x, y) {
  if (x && y && typeof x === 'object' && typeof y === 'object') {
    if (Object.keys(x).length !== Object.keys(y).length) return false
    return Object.keys(x).every(key => deepEquals(x[key], y[key]))
  }
  return x === y
}


export const toKeyString = str => btoa(encodeURIComponent(str))
