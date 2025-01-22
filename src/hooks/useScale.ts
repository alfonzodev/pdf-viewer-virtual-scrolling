import { PDFDocumentProxy } from "pdfjs-dist";
import { useState } from "react";

const MIN_SCALE = 0.2;
const MAX_SCALE = 2.0;
const SCALE_INCREMENT = 0.2;

const useScale = () => {
  const [scale, setScale] = useState<number>(1);
  // distance between two points (zoom in mobile devices)
  const [lastDistance, setLastDistance] = useState<number | null>(null);

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

  // Mobile Zoom
  const handleTouchMove = (
    e: React.TouchEvent<HTMLDivElement>,
    pdfDoc: PDFDocumentProxy | null
  ) => {
    if (!pdfDoc) return;
    if (e.touches.length === 2) {
      const [touch1, touch2] = Array.from(e.touches);
      const distance = Math.hypot(
        touch2.pageX - touch1.pageX,
        touch2.pageY - touch1.pageY
      );

      if (lastDistance) {
        const scaleChange = distance / lastDistance;
        // handle zoom in or out depending on scale change
        if (scaleChange > 1) {
          zoomIn();
        } else if (scaleChange < 1) {
          zoomOut();
        }
      }
      setLastDistance(distance);
    }
  };

  return { scale, setScale, zoomOut, zoomIn, handleTouchMove };
};

export default useScale;
