---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** 悬停开合的延时统一叫 `openDelay / closeDelay`，接替窗口叫 `skipDelay`。此前 Tooltip、HoverCard、Citation、Pagination 用 `openDelay / closeDelay`，Menu 用 `hoverOpenDelay / hoverCloseDelay`，NavigationMenu 用 `delayDuration`，接替窗口带着 `…Duration` 后缀。

| 组件 | 旧名 | 新名 |
| --- | --- | --- |
| Menu | `hoverOpenDelay` / `hoverCloseDelay`（WC `hover-open-delay` / `hover-close-delay`） | `openDelay` / `closeDelay`（WC `open-delay` / `close-delay`） |
| NavigationMenu | `delayDuration`（WC `delay-duration`） | `openDelay`（WC `open-delay`） |
| Tooltip、TooltipProvider、Citation、NavigationMenu | `skipDelayDuration`（WC `skip-delay-duration`） | `skipDelay`（WC `skip-delay`） |
