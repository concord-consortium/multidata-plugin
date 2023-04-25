import { useState, useEffect } from "react";

export const useWindowResized = (): number|undefined => {

  const [resizedAt, setResizedAt] = useState<number|undefined>(undefined);

  useEffect(() => {
    const handleResize = () => setResizedAt(Date.now);

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return resizedAt;
};
