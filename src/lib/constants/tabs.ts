// Shared styling for Radix Tabs.List across the app. Horizontal scroll instead of
// wrapping to a second row — keeps the tab bar height fixed, which matters once it's
// also used as a sticky header above a table.
export const TAB_LIST_CLASS =
      'flex w-full sm:w-fit max-w-full gap-1 rounded-lg border border-bg-border bg-bg-panel p-1 overflow-x-auto flex-nowrap [scrollbar-width:thin]';

export const TAB_TRIGGER_CLASS =
      'shrink-0 rounded-md px-4 py-1.5 text-xs text-ink-muted whitespace-nowrap data-[state=active]:bg-accent-gold/15 data-[state=active]:text-accent-gold';

// Wrap a Tabs.List (or a Fluent TabList) in this when it sits above a table that can
// run long, so the tabs stay reachable while scrolling through rows. `top-14` matches
// TopBar's fixed height.
export const STICKY_TAB_WRAPPER_CLASS =
      'sticky top-14 z-20 bg-bg-base/95 backdrop-blur-sm pt-3 pb-2 -mt-3';
