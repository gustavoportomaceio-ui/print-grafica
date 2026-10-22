/** Native scroll-snap navigation shared by touch/click controls and scrollable tracks. */
export function navigateCarousel(track: HTMLElement | null, direction: -1 | 1, mode: "item" | "page" = "item") {
  if (!track || track.clientWidth === 0) return;
  const max = Math.max(0, track.scrollWidth - track.clientWidth);
  const origin = track.getBoundingClientRect().left;
  const positions = Array.from(track.children, (child) =>
    Math.min(max, Math.max(0, child.getBoundingClientRect().left - origin + track.scrollLeft)),
  );
  const stops = [...new Set([0, ...positions, max])].sort((a, b) => a - b);
  const current = track.scrollLeft;
  const ahead = stops.filter((stop) => direction > 0 ? stop > current + 1 : stop < current - 1);
  const desired = current + track.clientWidth * direction;
  const target = mode === "page"
    ? ahead.reduce((best, stop) => Math.abs(stop - desired) < Math.abs(best - desired) ? stop : best, direction > 0 ? max : 0)
    : direction > 0 ? ahead[0] ?? max : ahead.at(-1) ?? 0;
  track.scrollTo({ left: target, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
}