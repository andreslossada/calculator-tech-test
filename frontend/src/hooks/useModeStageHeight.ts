import { useLayoutEffect, useState } from "react";
import type { RefObject } from "react";

type UseModeStageHeightParams = {
  stageRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  dependency: unknown;
};

export const useModeStageHeight = ({
  stageRef,
  contentRef,
  dependency,
}: UseModeStageHeightParams) => {
  const [modeStageHeight, setModeStageHeight] = useState<number>();

  useLayoutEffect(() => {
    const stageElement = stageRef.current;
    const contentElement = contentRef.current;

    if (!stageElement || !contentElement) {
      return;
    }

    const measureHeight = () => {
      setModeStageHeight(contentElement.getBoundingClientRect().height);
    };

    measureHeight();

    if (typeof ResizeObserver !== "function") {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      measureHeight();
    });

    resizeObserver.observe(contentElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [dependency, contentRef, stageRef]);

  return modeStageHeight;
};
