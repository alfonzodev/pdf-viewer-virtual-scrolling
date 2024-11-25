import { useState } from "react";

const MIN_SCALE = 0.2;
const MAX_SCALE = 2.0;
const SCALE_INCREMENT = 0.2;

const useScale = () => {
  const [scale, setScale] = useState<number>(1);

  const zoomOut = () => {
    setScale((prevScale) => {
      if (prevScale === MIN_SCALE) {
        return prevScale;
      }
      return Number((prevScale - SCALE_INCREMENT).toFixed(2));
    });
  };

  const zoomIn = () => {
    setScale((prevScale) => {
      if (prevScale === MAX_SCALE) {
        return prevScale;
      }
      return Number((prevScale + SCALE_INCREMENT).toFixed(2));
    });
  };

  return { scale, zoomOut, zoomIn };
};

export default useScale;
