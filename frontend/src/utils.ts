function extractErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) {
    return err.message
  }
  if (typeof err === "string" && err) {
    return err
  }
  return "Something went wrong."
}

export const handleError = function (
  this: (msg: string) => void,
  err: unknown,
) {
  const errorMessage = extractErrorMessage(err)
  this(errorMessage)
}

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}
