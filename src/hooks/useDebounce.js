import { useState, useEffect } from 'react';

/**
 * 입력값 변경 후 delay ms가 지나야 반영 — API 과호출 방지용
 * @param {*} value - 디바운싱할 값
 * @param {number} delay - 지연 시간 (ms)
 * @returns {*} 디바운싱된 값
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
