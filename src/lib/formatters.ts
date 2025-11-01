const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
})
export function formatDateTime(date: Date | string) {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return DATE_TIME_FORMATTER.format(dateObj)
}
