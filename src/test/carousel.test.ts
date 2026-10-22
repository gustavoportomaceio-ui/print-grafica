import { beforeEach, describe, expect, it, vi } from "vitest";
import { navigateCarousel } from "@/lib/carousel";

function track(width: number, stride: number, count: number, left = 0) {
  const el = document.createElement("div");
  Object.defineProperties(el, {
    clientWidth: { value: width },
    scrollWidth: { value: stride * count - 12 },
    scrollLeft: { value: left, writable: true },
  });
  el.getBoundingClientRect = () => ({ left: 20 } as DOMRect);
  for (let i = 0; i < count; i++) {
    const child = document.createElement("div");
    child.getBoundingClientRect = () => ({ left: 20 + i * stride - el.scrollLeft } as DOMRect);
    el.append(child);
  }
  el.scrollTo = vi.fn();
  return el;
}

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
});

describe("Native carousel navigation", () => {
  it("advances and returns exactly one mobile snap position including the gap", () => {
    const el = track(361, 373, 5);
    navigateCarousel(el, 1);
    expect(el.scrollTo).toHaveBeenLastCalledWith({ left: 373, behavior: "smooth" });
    el.scrollLeft = 373;
    navigateCarousel(el, -1);
    expect(el.scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: "smooth" });
  });
  it("keeps tablet page navigation aligned with actual card positions", () => {
    const el = track(720, 368, 10);
    navigateCarousel(el, 1, "page");
    expect(el.scrollTo).toHaveBeenLastCalledWith({ left: 736, behavior: "smooth" });
    el.scrollLeft = 736;
    navigateCarousel(el, -1, "page");
    expect(el.scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: "smooth" });
  });
  it("navigates relative to the native drag position", () => {
    const el = track(361, 373, 5, 800);
    navigateCarousel(el, -1);
    expect(el.scrollTo).toHaveBeenLastCalledWith({ left: 746, behavior: "smooth" });
  });
  it("does not navigate a hidden responsive track", () => {
    const el = track(0, 373, 5);
    navigateCarousel(el, 1);
    expect(el.scrollTo).not.toHaveBeenCalled();
  });
});