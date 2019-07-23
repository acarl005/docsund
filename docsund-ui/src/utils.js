import moment from "moment"

export const optionalToString = v => (
  ![null, undefined].includes(v) && typeof v.toString === "function"
    ? v.toString()
    : v
)

export function deepEquals(x, y) {
  if (x && y && typeof x === "object" && typeof y === "object") {
    if (Object.keys(x).length !== Object.keys(y).length) return false
    return Object.keys(x).every(key => deepEquals(x[key], y[key]))
  }
  return x === y
}


export const toKeyString = str => btoa(encodeURIComponent(str))

function currentYear(date) {
  return moment().diff(date, "years") === 0
}

export const formatDate = date => {
  const momentDate = moment(date)
  const diff = moment().diff(date, "hours")

  const format = currentYear(date) ? "MM/DD" : "MM/DD/YY"
  return diff <= 24 ? momentDate.fromNow() : momentDate.format(format)
}

export async function fetchJSON(...args) {
  const response = await fetch(...args)
  if (!response.ok) {
    throw Error(`Status ${response.status}:\n${await response.text()}`)
  }
  const contentType = response.headers.get("content-type")
  if (!contentType || contentType.indexOf("application/json") === -1) {
    throw Error(`Content type is not "application/json", but "${contentType}"`)
  }
  return response.json()
}
