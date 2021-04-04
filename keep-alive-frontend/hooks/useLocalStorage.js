import { useState, useEffect } from "react";
function useLocalStorage(defaultValue, key) {
  const [value, setValue] = useState(null);

  useEffect(() => {
    const stickyValue = window.localStorage.getItem(key);
    setValue(stickyValue !== null ? JSON.parse(stickyValue) : defaultValue);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
export { useLocalStorage };
