import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useThemeMode } from "./useThemeMode";

describe("useThemeMode", () => {
  const storageKey = "calculator-theme-test";

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses stored theme when available", () => {
    window.localStorage.setItem(storageKey, "light");
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true })),
    );

    const { result } = renderHook(() => useThemeMode(storageKey));

    expect(result.current.themeMode).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("falls back to system preference when no stored value exists", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true })),
    );

    const { result } = renderHook(() => useThemeMode(storageKey));

    expect(result.current.themeMode).toBe("dark");
    expect(window.localStorage.getItem(storageKey)).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("updates theme, html attribute, and localStorage on toggle", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false })),
    );
    const { result } = renderHook(() => useThemeMode(storageKey));

    act(() => {
      result.current.setThemeMode("dark");
    });

    expect(result.current.themeMode).toBe("dark");
    expect(window.localStorage.getItem(storageKey)).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
