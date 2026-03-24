import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useModeStageHeight } from "./useModeStageHeight";

type ResizeObserverCtor = new (
  callback: ResizeObserverCallback,
) => ResizeObserver;

describe("useModeStageHeight", () => {
  let observeMock: ReturnType<typeof vi.fn>;
  let disconnectMock: ReturnType<typeof vi.fn>;
  let lastCallback: ResizeObserverCallback | null;

  beforeEach(() => {
    observeMock = vi.fn();
    disconnectMock = vi.fn();
    lastCallback = null;

    class ResizeObserverMock {
      constructor(callback: ResizeObserverCallback) {
        lastCallback = callback;
      }

      observe = observeMock;
      disconnect = disconnectMock;
    }

    vi.stubGlobal(
      "ResizeObserver",
      ResizeObserverMock as unknown as ResizeObserverCtor,
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns undefined when refs are not ready", () => {
    const { result } = renderHook(() =>
      useModeStageHeight({
        stageRef: { current: null },
        contentRef: { current: null },
        dependency: "input",
      }),
    );

    expect(result.current).toBeUndefined();
    expect(observeMock).not.toHaveBeenCalled();
  });

  it("measures content height and observes content element", () => {
    const stage = document.createElement("div");
    const content = document.createElement("div");

    Object.defineProperty(content, "getBoundingClientRect", {
      value: () => ({ height: 180 }),
    });

    const { result } = renderHook(() =>
      useModeStageHeight({
        stageRef: { current: stage },
        contentRef: { current: content },
        dependency: "input",
      }),
    );

    expect(result.current).toBe(180);
    expect(observeMock).toHaveBeenCalledWith(content);
  });

  it("re-measures when resize callback runs and disconnects on unmount", () => {
    const stage = document.createElement("div");
    const content = document.createElement("div");
    let height = 120;

    Object.defineProperty(content, "getBoundingClientRect", {
      value: () => ({ height }),
    });

    const { result, unmount } = renderHook(() =>
      useModeStageHeight({
        stageRef: { current: stage },
        contentRef: { current: content },
        dependency: "input",
      }),
    );

    expect(result.current).toBe(120);

    height = 240;
    act(() => {
      lastCallback?.([], {} as ResizeObserver);
    });

    expect(result.current).toBe(240);

    unmount();
    expect(disconnectMock).toHaveBeenCalled();
  });
});
