import * as React from "react"

// Reads a value from localStorage on the client. Returns undefined during SSR
// and on the first client render, then syncs after mount — this avoids
// hydration mismatches when the stored value differs from the default.
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = React.useState<T>(initialValue)

  React.useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item !== null) {
        setValue(JSON.parse(item) as T)
      }
    } catch {
      // Ignore parse / access errors (private mode, quota, etc.)
    }
  }, [key])

  const set = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          // Ignore write errors
        }
        return resolved
      })
    },
    [key],
  )

  return [value, set]
}
