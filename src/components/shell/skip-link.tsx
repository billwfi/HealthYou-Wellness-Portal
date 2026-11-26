/** First focusable element on every page: jumps keyboard users past the navigation. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:font-semibold focus:text-ink focus:shadow-pop"
    >
      Skip to content
    </a>
  );
}
