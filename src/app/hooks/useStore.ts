// src/hooks/useStore.ts
import { useState, useEffect } from 'react'

// هذا "الهوك" هو الوسيط بين السيرفر والمتصفح لمنع الاخطاء
const useStore = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F
) => {
  const result = store(callback) as F
  const [data, setData] = useState<F>()

  useEffect(() => {
    setData(result)
  }, [result])

  return data
}

export default useStore