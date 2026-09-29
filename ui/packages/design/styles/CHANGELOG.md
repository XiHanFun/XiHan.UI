# @xihan-ui/styles

## 3.0.0

### Major Changes

- 508a0b5: Cascader 的浮层按面板型浮层定宽：每一列（含一级列）按条目的自然宽度、以 `--xh-overlay-menu-min-w` 托底（不再是字面量 7rem），不随字段盒拉伸，长选项撑到条目上限为止、余下的在条目里截断；搜索框不参与定宽，铺满列撑出的宽度；面板随列数伸展，宽过可用区时收成可用宽度。浮层改锚在字段盒（control）上，面板起始缘与盒对齐；焦点归还仍回触发按钮，`CascaderRefs` 新增 `getTriggerEl`。`--xh-cascader-content-max-w` 缺省改为不封顶，新增 `--xh-cascader-content-min-w` 定面板的下界（缺省 `--xh-overlay-menu-min-w`）。

  面板含多列，材质由 frosted 改为 floating（实体底 + `--xh-border-default` 描边 + `--xh-elevation-floating` 投影，不透景），与时间选择同档：content 不再投影 `data-xh-material`，列间分隔改取 `--xh-material-solid-separator`，条目、分组标题与占位文字改取 `--xh-fg-default` / `--xh-fg-muted`。破坏性：移除 `--xh-cascader-content-backdrop`、`--xh-cascader-content-highlight` 与 `--xh-cascader-loading-min-w`（占位铺满面板宽度，下界改由 `--xh-cascader-content-min-w` 统一给）。

- 31ce42a: Cascader 的占位态按设计真源的占位态一节补齐：首次加载时 `loading` 部件在文案前转一枚加载环（连接层投影 `data-xh-loading-ring` 与 `data-loading`，环走加载环家族配方），此前只是一行静态文字；已有候选时后台刷新保留上一帧，列与搜索候选列表按 `micro` 淡到 `--xh-state-disabled-opacity`，淡的是列不是浮起面。占位不再设最小高，内容多高就多高。破坏性：移除 `--xh-cascader-empty-min-h` 与 `--xh-cascader-loading-min-h`（缺省是字面量 5rem）。
- e927168: DownloadTrigger 的取数在途改接加载环家族配方：连接层投影 `data-xh-loading-ring="overlay"`，环压在钮正中、直径取钮的图标档，画法与 Spinner 环档一致（此前是 1em、1px、无轨道的小环）。进入在途等一个 `micro` 才起淡，钮里的文字与兜底下载字形随前景同刻淡出留位；退出在途不再硬切，按 `micro` 交叉淡回。`--xh-download-trigger-loading-duration` 照旧控制转速。破坏性：移除关键帧 `xh-download-trigger-content-hide`（文字的隐去改由过渡承担）。
- 1672c7e: IconWrapper 并入 Icon：图标新增 `frame` 底框，删除 IconWrapper 组件。

  - `IconProps` 新增 `frame?: ActionVariant`（`solid` / `subtle` / `outline` / `ghost`），不写即无框；root 上落 `data-frame`。框画在 `<svg>` 自己的盒上，圆形；sm / md / lg 三档直径取 `--xh-control-h-sm/md/lg`，与同档 Avatar 一样大，图元按 `size` 取字形直径居中。其余五档（text、xl、2xl、3xl、4xl）的框沿用 md 档的内衬厚度。
  - `tone` 同时决定框的配色：实心取语气主色与反白前景，淡底取语气淡底与语气文字色，描边取语气描边；不写 `tone` 时实心为品牌色、其余为中性。框只认图标自己身上的 `data-tone`，放在语气容器里的无语气框保持中性。
  - 框里的图元不读外层下发的 `--xh-icon-size`，落在按钮、提示条这类统一图元直径的容器里也按自己的档位。
  - 新增覆盖槽：`--xh-icon-frame-size`、`--xh-icon-frame-glyph-size`、`--xh-icon-frame-radius`、`--xh-icon-frame-bg`、`--xh-icon-frame-border`、`--xh-icon-frame-shadow`；框的前景沿用 `--xh-icon-fg`。
  - 可及名与装饰态不因加框改变。
  - 删除：Vue / React 的 `XhIconWrapper`、`XhIconWrapperProps`，Web Components 的 `<xh-icon-wrapper>` 与 `XhIconWrapperElement`，Headless 的 `connectIconWrapper`、`iconWrapperAnatomy`、`iconWrapperKeyboard`、`iconWrapperMeta` 与 `IconWrapperApi`、`IconWrapperProps`、`IconWrapperTranslations`，皮肤子路径 `@xihan-ui/styles/icon-wrapper.css`，覆盖槽 `--xh-icon-wrapper-*`，以及 `data-scope="icon-wrapper"`。

  迁移：把底座的三个轴搬到图标自己身上，`variant` 改名 `frame`。

  ```vue
  <!-- 之前 -->
  <XhIconWrapper variant="subtle" tone="brand" size="lg">
    <XhIcon :icon="FolderIcon" />
  </XhIconWrapper>

  <!-- 之后 -->
  <XhIcon :icon="FolderIcon" frame="subtle" tone="brand" size="lg" />
  ```

  Web Components 把 `<xh-icon-wrapper variant="subtle"><span data-xh-part="root"><xh-icon>…</xh-icon></span></xh-icon-wrapper>` 换成 `<xh-icon frame="subtle">…</xh-icon>`。原先不写 `variant` 的 IconWrapper 是中性淡底，对应 `frame="subtle"`。覆盖槽对应：`--xh-icon-wrapper-size` → `--xh-icon-frame-size`、`--xh-icon-wrapper-glyph-size` → `--xh-icon-frame-glyph-size`、`--xh-icon-wrapper-radius` → `--xh-icon-frame-radius`、`--xh-icon-wrapper-bg` → `--xh-icon-frame-bg`、`--xh-icon-wrapper-shadow` → `--xh-icon-frame-shadow`、`--xh-icon-wrapper-fg` → `--xh-icon-fg`。

- ccb58dd: ImageViewer 的占位态与禁用按设计真源补齐：
  - 取图时画面正中改转一枚加载环（`viewport` 投影 `data-xh-loading-ring`，环走加载环家族配方，随 `data-loading` 淡入淡出），不再垫一块抬起占位面；环与警示字形的尺由新增的 `--xh-image-viewer-status-size` 给，缺省 `--xh-glyph-size-lg`。
  - 取图失败此前没有画面：机器已置 `imageStatus: 'error'`，连接层却只投影 `data-loading`。`viewport` 与 `image` 新增 `data-error`，皮肤在画面正中画一枚取 `--xh-fg-danger` 的警示字形，破图整张让位（替代文字仍在可及树里）；新增 `--xh-image-viewer-error-fg`。
  - 禁用的翻页、缩放钮此前只压低不透明度：改为前景换 `--xh-fg-disabled`（看片层的白墨域里取深色档的禁用色），不再改不透明度。
    破坏性：移除 `--xh-image-viewer-loading-size`、`--xh-image-viewer-loading-radius` 与 `--xh-image-viewer-loading-bg`（占位面已撤，环径改由 `--xh-image-viewer-status-size` 给）。
- cd23ebb: Command、Cascader、Transfer 面板里内嵌的搜索框统一成一种写法：通栏一行，块尺寸取所在尺寸档的 `--xh-control-h-*`、字号取 `--xh-control-font-*`（Command 此前固定正文字号、Transfer 固定 sm 高度、Cascader 由内衬撑高）；只画一道面内分隔的下划线，取所在面材质的分隔令牌（Cascader、Transfer 取 `--xh-material-solid-separator`，Command 与它的底栏上沿取 sheet 面的 `--xh-material-elevated-separator`），Transfer 不再用字段边 `--xh-border-control`。三处搜索框的连接层投影 `data-xh-field-input`，重置与占位前景走字段家族：Cascader、Transfer 的占位文字此前是浏览器默认色，现在与其它字段同取 `--xh-fg-subtle`，新增 `--xh-transfer-placeholder-fg`，Cascader 与值文本的占位共用 `--xh-cascader-placeholder-fg`。破坏性：移除 `--xh-cascader-input-py`，改由新增的 `--xh-cascader-input-h` 定高。
- 89b3c2a: 组件私有的关键帧并入 `family/motion.css` 的共享关键帧，旧名退役。在 `xihan.overrides` 层重定义过下列旧名的，改为重定义新名。新名跨组件共享，重定义会同时作用于所有引用它的组件；只想换一个组件的动画，改写该组件部件上的 `animation-name`。

  | 旧名                                 | 新名           |
  | ------------------------------------ | -------------- |
  | `xh-spinner-rotate`                  | `xh-spin`      |
  | `xh-popconfirm-rotate`               | `xh-spin`      |
  | `xh-switch-rotate`                   | `xh-spin`      |
  | `xh-toast-spin`                      | `xh-spin`      |
  | `xh-approval-rotate`                 | `xh-spin`      |
  | `xh-clipboard-rotate`                | `xh-spin`      |
  | `xh-download-trigger-rotate`         | `xh-spin`      |
  | `xh-notification-spin`               | `xh-spin`      |
  | `xh-reasoning-shimmer`               | `xh-shimmer`   |
  | `xh-tool-call-shimmer`               | `xh-shimmer`   |
  | `xh-skeleton-shimmer`                | `xh-shimmer`   |
  | `xh-approval-in`                     | `xh-item-in`   |
  | `xh-message-feed-item-in`            | `xh-item-in`   |
  | `xh-question-flow-in`                | `xh-item-in`   |
  | `xh-tool-call-enter`                 | `xh-item-in`   |
  | `xh-approval-result-in`              | `xh-pop-in`    |
  | `xh-message-feed-button-in`          | `xh-pop-in`    |
  | `xh-question-flow-result-in`         | `xh-pop-in`    |
  | `xh-log-button-in`                   | `xh-pop-in`    |
  | `xh-reasoning-fade-in`               | `xh-fade-in`   |
  | `xh-clipboard-loading-reveal`        | `xh-fade-in`   |
  | `xh-download-trigger-loading-reveal` | `xh-fade-in`   |
  | `xh-clipboard-loading-hide`          | `xh-fade-out`  |
  | `xh-diff-view-reveal`                | `xh-drop-in`   |
  | `xh-form-summary-enter`              | `xh-drop-in`   |
  | `xh-dialog-in`                       | `xh-sheet-in`  |
  | `xh-dialog-out`                      | `xh-sheet-out` |
  | `xh-notification-in`                 | `xh-sheet-in`  |
  | `xh-notification-out`                | `xh-sheet-out` |
  | `xh-drawer-in-right`                 | `xh-slide-in`  |
  | `xh-drawer-in-left`                  | `xh-slide-in`  |
  | `xh-drawer-in-top`                   | `xh-slide-in`  |
  | `xh-drawer-in-bottom`                | `xh-slide-in`  |
  | `xh-drawer-out-right`                | `xh-slide-out` |
  | `xh-drawer-out-left`                 | `xh-slide-out` |
  | `xh-drawer-out-top`                  | `xh-slide-out` |
  | `xh-drawer-out-bottom`               | `xh-slide-out` |

- bf1fb1f: 循环动画的周期令牌并入 `--xh-motion-loop-*` 一族，与 `--xh-motion-loop-breathe` 并列；旧名不再输出，也不留别名。改写过或在自己样式里引用过下列旧名的，改为新名。`tokens.json`、`tokens` 对象与 `TokenName` 类型同样只有新名。

  | 旧名                    | 新名                       | 取值   |
  | ----------------------- | -------------------------- | ------ |
  | `--xh-spin-duration`    | `--xh-motion-loop-spin`    | 640ms  |
  | `--xh-caret-duration`   | `--xh-motion-loop-caret`   | 1000ms |
  | `--xh-shimmer-duration` | `--xh-motion-loop-shimmer` | 1600ms |

- dc4e305: 轻提示并入通知：Toast 整个组件删除，同一种「到期自行消失的消息」只剩一个 Notification，用 `preset` 区分两种形态。`card`（缺省）是主动推送的两层卡片，`toast` 是刚才那个操作的一句结果。两种预设的缺省值由 Headless 的 `NOTIFICATION_PRESETS` 统一给出，三端读同一份：

  | 缺省值            | `card`                       | `toast`                                              |
  | ----------------- | ---------------------------- | ---------------------------------------------------- |
  | `placement`       | `bottom-end`                 | `bottom`                                             |
  | `max`（每个落位） | 5                            | 3                                                    |
  | `gap`             | 16                           | 12                                                   |
  | `duration`        | 5000                         | 4000                                                 |
  | `stacked`         | 不叠                         | 叠成一摞，指针或焦点进入即展开，整摞计时一并按住     |
  | `pauseOnPageIdle` | 关闭                         | 开启                                                 |
  | 卡片排版          | 两列网格，叉钉在右上角（sm） | 一行，叉排在行尾（xs），有悬停能力时悬停或聚焦才显现 |

  原 Toast 的能力都在轻提示预设里：加载环与语气字形交叉淡变、`loading` / `promise`、行内动作、倒计时条、叠放与展开、页面闲置暂停、`max` 与 `dedupe`。叠放从轻提示专有变成通知的开关，卡片也可以 `stacked`。旧名一律不保留，没有转发别名。

  ## 服务

  ```ts
  // 之前
  import { createToastService } from "@xihan-ui/vue";
  const toast = createToastService({ placement: "top" });

  // 之后
  import { createNotificationService } from "@xihan-ui/vue";
  const toast = createNotificationService({
    preset: "toast",
    placement: "top",
  });
  ```

  React 与 Web Components（`@xihan-ui/web-components/services`）同样改法。句柄的方法（`create` / `update` / `dismiss` / `info` / `success` / `warning` / `danger` / `loading` / `promise` / `pauseAll` / `resumeAll` / `setConfig` / `dispose`）不变；语气快捷方法的第一个参数仍是标题。

  | 旧                                                                   | 新                                                                                        |
  | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
  | `createToastService(options)`                                        | `createNotificationService({ preset: 'toast', ...options })`                              |
  | `ToastService` / `ToastServiceOptions`                               | `NotificationService` / `NotificationServiceOptions`                                      |
  | `ToastCreateOptions` / `ToastMessageOptions` / `ToastPromiseOptions` | `NotificationCreateOptions` / `NotificationMessageOptions` / `NotificationPromiseOptions` |
  | `ToastTranslationsSource`（React）                                   | `NotificationTranslationsSource`                                                          |
  | 服务选项 `toastTranslations`                                         | `translations`                                                                            |
  | 服务选项里没有的 `stacked` / `duration` / `pauseOnPageIdle` 缺省     | 现在都可以在创建时改写，缺省随预设                                                        |

  ## 组件

  | 旧                                                                                                                                    | 新                                                                                                                                     |
  | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
  | `XhToastRoot`                                                                                                                         | `XhNotificationItem`，写 `preset="toast"`                                                                                              |
  | `XhToastIndicator` / `XhToastContent` / `XhToastTitle` / `XhToastDescription`                                                         | `XhNotificationItemIndicator` / `XhNotificationItemContent` / `XhNotificationItemTitle` / `XhNotificationItemDescription`              |
  | `XhToastActionTrigger` / `XhToastProgress` / `XhToastCloseTrigger`                                                                    | `XhNotificationItemActionTrigger` / `XhNotificationItemProgress` / `XhNotificationItemCloseTrigger`                                    |
  | `XhToast*Props`（React）                                                                                                              | `XhNotificationItem*Props`                                                                                                             |
  | `ToastRootSlotProps`                                                                                                                  | `NotificationItemSlotProps`                                                                                                            |
  | `useToast` / `ToastContext`                                                                                                           | `useNotificationItem` / `NotificationItemContext`                                                                                      |
  | `useToastContext`（React）                                                                                                            | `useNotificationItemContext`                                                                                                           |
  | `<xh-toast>`                                                                                                                          | `<xh-notification-item preset="toast">`                                                                                                |
  | Light DOM 作者节点 `data-xh-part="indicator"` / `content` / `title` / `description` / `action-trigger` / `progress` / `close-trigger` | `item-indicator` / `item-content` / `item-title` / `item-description` / `item-action-trigger` / `item-progress` / `item-close-trigger` |
  | 事件 `status-change` / `action`                                                                                                       | 同名；Vue 的 `action` 现在与 React / Web Components 一样带 `{ id }`                                                                    |

  `XhNotificationRoot` / `<xh-notification>` 新增 `preset` 与 `stacked`；`XhNotificationItem` / `<xh-notification-item>` 新增 `preset`，队列交下来的条目自带 `preset`，自己铺卡片时要带上。单独使用的轻提示条目现在缺省在页面转入后台时暂停计时（原 `<xh-toast>` 单用时缺省关闭），写 `pauseOnPageIdle={false}` / `pause-on-page-idle="false"` 回到旧行为。单独摆放、不在叠放的一摞里的轻提示改走面板的进出场（淡入并轻微缩放），叠放档仍从视口边缘推入。

  新增 `XhNotificationItemContent`：标题与说明的文本列，两种预设都用它包住 `item-title` 与 `item-description`。

  ## Headless

  | 旧                                                                                                 | 新                                                                                                                                              |
  | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
  | `toastMachine` / `ToastSchema` / `ToastApi`                                                        | `notificationItemMachine` / `NotificationItemSchema` / `NotificationItemApi`                                                                    |
  | `connectToast`                                                                                     | `connectNotificationItem`                                                                                                                       |
  | `toastAnatomy` / `toastKeyboard` / `toastMeta`                                                     | `notificationAnatomy` / `notificationKeyboard` / `notificationMeta`                                                                             |
  | `resolveToastDuration(loading, duration)`                                                          | `resolveNotificationDuration(loading, duration, preset)`                                                                                        |
  | `resolveToastId`                                                                                   | `resolveNotificationItemId`                                                                                                                     |
  | `TOAST_DURATION` / `TOAST_GAP` / `TOAST_MAX` / `TOAST_PLACEMENT`                                   | `NOTIFICATION_PRESETS.toast.duration` / `.gap` / `.max` / `.placement`                                                                          |
  | `NOTIFICATION_GAP` / `NOTIFICATION_MAX` / `NOTIFICATION_PLACEMENT`                                 | `NOTIFICATION_PRESETS.card.gap` / `.max` / `.placement`，或 `notificationPresetOf(preset)`                                                      |
  | `createToastStackController` / `ToastStackController` / `ToastStackControllerOptions`              | 删除：叠放由 `notificationMachine` 的 `stacked` 接管，展开状态进了机器（`STACK.EXPAND` / `STACK.COLLAPSE`，Esc 收起）                           |
  | `resolveToastServiceItem` / `ResolvedToastServiceItem` / `ToastServiceDefaults`                    | 删除：服务条目按 `ResolvedNotification` 解析，缺省值取 `notificationPresetOf`                                                                   |
  | `ToastTone` / `ToastStatus` / `ToastPlacement` / `ToastPauseSource` / `ToastPressedPart`           | `NotificationTone` / `NotificationStatus` / `NotificationPlacement` / `NotificationPauseSource`（多一个 `'stack'`） / `NotificationPressedPart` |
  | `ToastRecord` / `ToastOptions` / `ToastTranslations`                                               | `NotificationRecord` / `NotificationOptions` / `NotificationTranslations`                                                                       |
  | `ToastStatusChangeDetails` / `ToastActionDetails`                                                  | `NotificationStatusChangeDetails` / `NotificationActionDetails`                                                                                 |
  | 事件 `TOAST.DISMISS` / `TOAST.ACTION` / `TOAST.PAUSE` / `TOAST.RESUME` / `TOAST.RESET`             | `ITEM.DISMISS` / `ITEM.ACTION` / `ITEM.PAUSE` / `ITEM.RESUME` / `ITEM.RESET`                                                                    |
  | `getRootProps` / `getIndicatorProps` / `getContentProps` / `getTitleProps` / `getDescriptionProps` | `getItemProps` / `getItemIndicatorProps` / `getItemContentProps` / `getItemTitleProps` / `getItemDescriptionProps`                              |
  | `getActionTriggerProps` / `getProgressProps` / `getCloseTriggerProps`                              | `getItemActionTriggerProps` / `getItemProgressProps` / `getItemCloseTriggerProps`                                                               |
  | `createFeedbackServiceController` 的 `idPrefix` 选项                                               | 删除：条目 id 统一由队列生成                                                                                                                    |
  | 全局配置文案桶 `translations.toast`                                                                | `translations.notification`（`region` 与 `close`）                                                                                              |

  ## 样式

  `@xihan-ui/styles/css/toast.css` 子路径删除，轻提示的皮肤在 `css/notification.css` 里按 `[data-preset='toast']` 分支。

  | 旧                                                                                                          | 新                                                                                                                           |
  | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
  | `[data-scope='toast'][data-part='root']`                                                                    | `[data-scope='notification'][data-part='item'][data-preset='toast']`                                                         |
  | `[data-scope='toast'][data-part='group']`                                                                   | `[data-scope='notification'][data-part='group'][data-preset='toast']`（叠放时另带 `data-stacked`，展开时带 `data-expanded`） |
  | `[data-scope='toast'][data-part='<部件>']`                                                                  | `[data-scope='notification'][data-part='item-<部件>']`                                                                       |
  | `--xh-toast-bg` / `-border` / `-shadow` / `-radius` / `-fg`                                                 | `--xh-notification-item-bg` / `-border` / `-shadow` / `-radius` / `-fg`                                                      |
  | `--xh-toast-px` / `-py` / `-gap` / `-font-size` / `-leading`                                                | `--xh-notification-item-px` / `-py` / `-gap` / `-font-size` / `-leading`                                                     |
  | `--xh-toast-inline-size`                                                                                    | `--xh-notification-item-w`                                                                                                   |
  | `--xh-toast-inset` / `--xh-toast-layer`                                                                     | `--xh-notification-inset` / `--xh-notification-layer`                                                                        |
  | `--xh-toast-title-*` / `--xh-toast-description-*`                                                           | `--xh-notification-title-*` / `--xh-notification-description-*`（后缀不变）                                                  |
  | `--xh-toast-icon-fg` / `--xh-toast-icon-size` / `--xh-toast-indicator-p`                                    | `--xh-notification-indicator-fg` / `--xh-notification-icon-size` / `--xh-notification-indicator-p`                           |
  | `--xh-toast-action-*` / `--xh-toast-close-*` / `--xh-toast-progress-*`                                      | `--xh-notification-action-*` / `--xh-notification-close-*` / `--xh-notification-progress-*`（后缀不变）                      |
  | `--xh-toast-scale-collapsed`                                                                                | `--xh-notification-stack-scale`                                                                                              |
  | `--xh-toast-offset-collapsed` / `-offset-expanded` / `-front-height` / `-height` / `-y` / `-scale` / `-dir` | 删除：叠放测量改写私有槽，不再是可覆盖的公开面                                                                               |
  | 关键帧 `xh-toast-in` / `xh-toast-out`                                                                       | `xh-notification-stack-in` / `xh-notification-stack-out`                                                                     |

  通知新增 `--xh-notification-close-border`，两种预设的叉都认它（原来只有 Toast 有）。z 层级令牌 `--xh-layer-toast` / `--xh-z-toast` 保留原名，它说的是这一层，不是组件。

- d74d171: Segmented 并入 RadioGroup：删除 Segmented 组件，改用 `RadioGroup` 的 `variant="segmented"`。两者都是 `radiogroup` / `radio` + `aria-checked`、都随表单提交，Segmented 的 props 只比 RadioGroup 多 `loop` 与 `block`，这两个随之并入 RadioGroup。不留兼容别名。

  **删除（破坏性）**

  - Headless：`connectSegmented`、`segmentedMachine`、`segmentedAnatomy`、`segmentedItemQuery`、`segmentedKeyboard`、`segmentedMeta` 与 `Segmented*` 全部类型；`translations` 里的 `segmented` 键。
  - Vue / React：`XhSegmentedRoot`、`XhSegmentedItem`、`XhSegmentedItemIcon`、`XhSegmentedItemText`、`XhSegmentedIndicator`、`XhSegmentedHiddenInput`、`useSegmented`、`useSegmentedContext`、`useSegmentedItemContext` 及对应 props / 上下文类型。
  - Web Components：`<xh-segmented>` 与 `XhSegmentedElement`。
  - 样式：`@xihan-ui/styles/segmented.css` 与全部 `--xh-segmented-*` 组件槽。

  **迁移**

  - `<XhSegmentedRoot …>` → `<XhRadioGroupRoot variant="segmented" …>`，`collection`、`value` / `defaultValue`、`disabled`、`readOnly`、`invalid`、`required`、`name`、`orientation`、`dir`、`loop`、`block`、`tone`、`size` 原样沿用；`XhSegmentedIndicator` → `XhRadioGroupThumb`（部件名 `thumb`，避开行首单选圆圈 `indicator`），`XhSegmentedItemIcon` / `XhSegmentedItemText` → `XhRadioGroupItemIcon` / `XhRadioGroupItemText`。
  - 隐藏输入改为每个条目一份原生 radio（与 RadioGroup 其余形态相同），不再写整组那一份 `hidden-input`；只传 `collection` 时由组件铺出。
  - Web Components：`<xh-segmented>` → `<xh-radio-group variant="segmented">`，滑块写 `data-xh-part="thumb"`，条目用 `<div data-xh-part="item">` 而不是原生 `<button>`（按钮会把 Enter 翻成点击）。
  - 组件槽：轨道 `--xh-segmented-bg / -border / -radius / -track-padding` → `--xh-radio-group-track-*`，段 `--xh-segmented-item-*` → `--xh-radio-group-segment-*`，滑块 `--xh-segmented-indicator-*` → `--xh-radio-group-thumb-*`，段内图标 `--xh-segmented-icon-size` → `--xh-radio-group-icon-size`。

  **键盘统一到 APG 的单选组（破坏性）**

  - segmented 形态按 Enter 不再选中、不再进按压面，Home / End 不再跳到首末段：单选组只有方向键在组内移动、Space 选中当前项。RadioGroup 原有形态的键盘不变。
  - 未传 `dir` 时左右方向键按祖先链上的书写方向翻转（原 RadioGroup 缺省按 ltr），整页 rtl 而组件没传 `dir` 时方向键跟着视觉顺序走。

  **RadioGroup 新增**

  - `variant="segmented"`：一条淡底轨道（surface 圆角）里首尾相接的段，选中段由新部件 `thumb`（`XhRadioGroupThumb`）标出——白色抬起面，写了 `tone` 时换实心语气面；只有换段时才滑，首次落位、窗口缩放、换上正式字体的重量直接到位（`data-instant`），liquid 档由前后沿两支弹簧推着走。段坐在淡底承载面上悬停 200 → 按下 300、只换面不缩放，不投影 Action Control 配方；这一形态不画行首圆圈、缺省横排，`label` 部件视觉隐藏只作可及名，一行排不下时折行。RTL 下滑块位移乘 `--xh-direction-sign`。
  - 新 props：`loop`（方向键尽头是否回绕，缺省 true）、`block`（segmented 形态撑满行宽、各段等分）。`orientation` 没传时随形态取缺省：list / card 竖排，segmented 横排。
  - 新部件 `item-icon`（`XhRadioGroupItemIcon`）：条目文字前的图标位，对读屏隐藏，直径随尺寸档、颜色随条目；节点新增 `icon` 字段，只传 `collection` 时自动铺出。三种形态都可用，卡片与带说明的列表行里图标自成一列。
  - connect API 新增 `variant`、`measure()`、`getThumbProps()`、`getItemIconProps()`；Headless 导出 `radioGroupItemQuery` 与类型 `RadioGroupRefs`、`RadioGroupThumbRect`。
  - 新增组件槽 `--xh-radio-group-icon-size`、`--xh-radio-group-track-*`、`--xh-radio-group-segment-*`、`--xh-radio-group-thumb-*`。

- acd1065: Table 的加载态改按占位态的两种相位画：

  - 表体为空、正在取数：`loading` 占位投影 `data-xh-loading-ring` 与 `data-loading`，一枚加载环（加载环家族配方，与 Spinner 环档同一副画法）排在文案之前，直径取表格尺寸档的图标档；不再让整块占位呼吸。**删除关键帧 `xh-table-loading-pulse`**（关键帧名是公开面）；`--xh-table-loading-duration` 保留，改为环转一圈的时长，缺省 `--xh-motion-loop-spin`。
  - 已有行时重新取数（排序、翻页、筛选）：此前只写 `aria-busy` / `data-loading`，皮肤没有任何可见反馈；现在表体与表尾保留上一帧、按 `micro` 淡到 `--xh-state-disabled-opacity`，取完再淡回，表头不动。
  - 空态与加载态占位的排版按占位态统一：块向内距 `--xh-space-3`、行内与单元格文字对齐（`--xh-control-px-sm`）、环与文案之间取控件间距、不设最小高（`--xh-table-state-min-h` 缺省由 `8rem` 改为 `0`），字号随表格的尺寸档。

- 1c6f692: GradientText 并入 Typography：渐变字是行内文字的一档形态 `variant="gradient"`，删除 GradientText 组件。

  - `TypographyVariant` 新增 `gradient`。文字前景透明、品牌渐变裁进字形；写了 `tone` 时两端取该语气的主色与压深一档；`data-contrast="more"` 作用域、系统高对比、强制色与打印下退回实色文字。
  - 两端颜色与走向改由 text 部件上的覆盖槽表达：`--xh-typography-gradient-from`、`--xh-typography-gradient-to`、`--xh-typography-gradient-direction`（任意 `<angle>` 或 `to <边或角>`，缺省 `to right`）。
  - 删除：Vue / React 的 `XhGradientText`、`XhGradientTextProps`，Web Components 的 `<xh-gradient-text>` 与 `XhGradientTextElement`，Headless 的 `connectGradientText`、`gradientTextAnatomy`、`gradientTextKeyboard`、`gradientTextMeta` 与 `GradientTextApi`、`GradientTextDirection`、`GradientTextProps`、`GradientTextTranslations`，皮肤子路径 `@xihan-ui/styles/gradient-text.css`，覆盖槽 `--xh-gradient-text-from` / `--xh-gradient-text-to`，以及 `data-scope="gradient-text"`。

  迁移：渐变字写成 Typography 的行内文字，放在 `XhTypographyRoot`（`<xh-typography>`）里。

  ```vue
  <!-- 之前 -->
  <XhGradientText
    from="#f97316"
    to="#ec4899"
    direction="to-bottom-right"
    tone="brand"
  >组件库</XhGradientText>

  <!-- 之后 -->
  <XhTypographyRoot>
    <XhTypographyText
      variant="gradient"
      tone="brand"
      style="--xh-typography-gradient-from: #f97316; --xh-typography-gradient-to: #ec4899; --xh-typography-gradient-direction: to bottom right"
    >
      组件库
    </XhTypographyText>
  </XhTypographyRoot>
  ```

  React 写法相同，`style` 传 `{ '--xh-typography-gradient-from': '#f97316', … } as CSSProperties`。Web Components 把 `<xh-gradient-text><span data-xh-part="root">…</span></xh-gradient-text>` 换成 `<xh-typography><div data-xh-part="root"><span data-xh-part="text" variant="gradient">…</span></div></xh-typography>`，两端颜色与走向同样写在 text 节点的 `style` 上。`direction` 的八个档位对应 `to right`、`to left`、`to bottom`、`to top`、`to bottom right`、`to bottom left`、`to top right`、`to top left`。

### Minor Changes

- 513fb62: Accordion 首帧不播开合：挂载时已经展开或收起的条目，内容与箭头投影 `data-instant`，直接呈现，不再在页面载入时播一遍展开 / 收起动画（收起项此前会闪过一段内容收起）；某一项第一次开合（用户操作或受控值改写）起撤掉标记，按动效走。
- b1f83d9: ToolCall、Approval、QuestionFlow 落在首帧就在的列表条目里（例如 MessageFeed 的历史消息）时，卡片滑入、结果弹出与选项错开开幕直接呈现，不再在打开一段会话时整屏一起入场；新到的消息里的卡片照常进场。
- 292ce8c: AI 披露面与同族对齐：

  - Reasoning 缺省形态由 `subtle` 改为 `outline`（描边 + surface 底，与 ToolCall、Approval、QuestionFlow 一致），缺省尺寸由 `sm` 改为 `md`；要回到淡底卡片写 `variant="subtle"`，要紧凑写 `size="sm"`。
  - Reasoning 与 ToolCall 的内距改用与 Accordion / Collapsible 同一把尺：sm 12 / 12、md 16 / 16、lg 20 / 20（此前 8 / 4、12 / 8、16 / 12），四个披露面的触发条在同一档位下等高。

- 0ca6153: Alert 新增 `banner`：把提示改成页面顶部的横幅，贴着页面或容器的边铺满整行，不取圆角，只在朝向页面内容的块尾画一道 `--xh-border-default` 描边；面、语气、实时区语义与关闭都与页内提示相同。根投影 `data-banner`。它是放置而不是面的形态，所以不走 `variant`，也不是打包缺省值的 `preset`。
- 61fb20f: Alert 关闭补上退场：先淡出，再把占位从整块高度收到 0（内缩与描边一起收掉），下方内容随之平移上来，播完连接层才给根写 `hidden`（此前关闭即 `hidden`，下面的内容整块跳上来）。退场途中根带 `inert`，关闭钮与作者操作不再响应；减弱动效下收占位瞬时完成，淡出照常。

  - 根部件新增 `id`：机器在收起前按它量下整块高度，写进内联私有槽，并等根上的退场动画播完再藏起。
  - 机器新增 context `rendered` / `exitBlockSize` 与事件 `ROOT.RENDERED`。
  - 新增皮肤关键帧 `xh-alert-collapse`（收占位，登记为布局动画例外）；皮肤体积基线随之上调。
  - Web Components 的根显隐改照连接层给的 `hidden`。

- ba1275b: Approval 判定在途的环改接加载环家族配方：`footer` 投影 `data-xh-loading-ring` 与 `data-loading`，环画法与 Spinner 环档一致（此前是 1em、1px、无轨道的小环），直径取所在尺寸档的图标档；在途开始与落定时环按 `micro` 淡入淡出，不再一出现就转、一落定就消失。`--xh-approval-loading-duration` 照旧控制转速。
- 354bc2f: Approval 新增 `requireReason`（Web Components 属性 `require-reason`）：用户拒绝时必须写明理由。备注空着（或只有空白）就按拒绝钮或 Escape，不发判定，焦点移到备注框，备注框带 `aria-invalid` 与 `data-invalid`、描边换成无效色；写上理由再按即拒绝，理由随载荷的 `note` 发出。只拦人手按的这两条路：超时、卸载兜底与宿主的 `deny()` 照常落地，没渲染备注框时也照常拒绝。开启后备注框的名字取 `translations.reason`（新增，默认 `Reason for denial`）并带 `aria-required`。API 新增 `reasonMissing`；外观槽新增 `--xh-approval-note-border-invalid` 与 `--xh-approval-note-ring-invalid`（聚焦时焦点环也换成无效色）。
- cca626f: Approval 新增部件 `pending-indicator`（Vue / React `XhApprovalPendingIndicator`，Web Components `data-xh-part="pending-indicator"`）：待决时在右上角显示一颗呼吸的圆点，颜色随语气、缺省取警示色，判定落定即收起；不占作者排的版面，对读屏隐藏，减弱动效下静止，打印时隐藏。根节点随之成为定位基准（`position: relative`）。
- a7e9fbe: Avatar 载入改为交叉淡变：图片载好时回退内容浮在图片之上原地淡出、与图片的淡入同时进行，播完才藏起，中间不再露一拍底色。新增 `fallbackDelay`（毫秒，默认 `AVATAR_FALLBACK_DELAY` = 300）：载入中回退内容等过这段才露面，图片在这段里载好就直接出图，缓存命中与虚拟列表回收行时不再闪首字母；没有 src 或载入失败时回退内容立即露面。回退节点带上 scope 派生的 id；Web Components 的显隐改照连接层的 `hidden`。
- 17b8e12: BackTop 补上进出场：滚过线时按钮弹出（`xh-pop-in`），退回线内时先播完 `xh-pop-out`、根上才写 `hidden` 收起（此前出现与消失都是硬切），退场途中不接指针。按钮新增 `id`，机器按它等退场动画、接液态面；Vue / React 两端改用由 useId 派生的 scope，服务端与水合两侧同号。
- 5183110: Badge 的 md、lg 两档收小：计数盒最小尺寸由 28 / 32px 改为 20 / 24px，字号与圆点直径不变；三档现为 14 / 20 / 24px，字号 12 / 13 / 14px。
- 3e2b06b: Badge 新增两个组件槽 `--xh-badge-offset-inline` 与 `--xh-badge-offset-block`，微调角标离角多远（不设 prop）：正值朝行内末端、块末端挪，RTL 下行内末端在左；四个角各按贴哪条边换正负号，同一个值在哪个角都朝同一个方向挪。不写时落点不变。badge.css 的体积基线随四个落点的偏移写法上调。
- 86c520d: Badge 出现与消失补上进退场：计数从无到有时原地弹出（`xh-pop-in`），清零时缩小淡出（`xh-pop-out`），播完才给 indicator 写 `hidden`，退场途中仍显示清零前的数字（此前出现与消失都是硬切）。首帧就在的角标投影 `data-instant` 直接呈现；呼吸的圆点不叠进场；减弱动效下只剩淡变。

  - 破坏性：`connectBadge(props, normalize)` 改为 `connectBadge(service, normalize)`，显隐与计数仍由 props 算出，新增的 `badgeMachine` 只管进退场。新增导出 `badgeMachine`、`badgeVisible`、`badgeText`、`BADGE_DEFAULT_MAX` 与类型 `BadgeSchema`。直接调用 `connectBadge` 的作者改为先用 `badgeMachine` 建服务。
  - indicator 新增 `id`、`data-state`（`visible` / `hidden`）与 `data-instant`。
  - 三端改为经状态机渲染，公开 props、部件与默认值不变。

- d7e3c59: Breadcrumb 的折叠位改为可操作：新增 `ellipsis-trigger` 部件（Vue / React `XhBreadcrumbEllipsisTrigger`），是一枚键盘可达、读屏可读的按钮（可及名 `translations.ellipsis`，缺省 Show full path），按下即就地展开完整路径，省略位收起，焦点落到第一条展开出来的链接上。`ellipsis` 不再 `aria-hidden`，展开后带 `hidden`；触发器不写内容时皮肤画一枚省略号字形。connect 新增 `expanded`、`expand()` 与 `collapsedRange(count)`，headless 新增纯函数 `breadcrumbCollapsedRange`。

  Web Components 的 `max-items` 开始生效：作者把完整路径逐层写成部件、在首层之后放一个装着触发器的省略位，元素收起中间层并在展开后放出来；紧跟在被收起层或已展开省略位后面的分隔符由皮肤一并收起。

  皮肤 breadcrumb.css 涨在折叠位触发器的家族映射、兜底字形与分隔符的收起规则上，体积基线随之重落。

- c48171d: 新增呼吸动效：共享关键帧 `xh-breathe`（明暗与缩放起伏，峰值在 42%）与 `xh-breathe-halo`（外扩光环），令牌 `--xh-motion-loop-breathe`（3600ms）、`--xh-motion-ease-breathe`（正弦式缓入缓出，原语 `--xh-ease-sine-in-out`）、`--xh-motion-scale-breathe` 与 `--xh-motion-scale-halo`（减弱档归 1）；`@xihan-ui/motion` 的 `easing.sineInOut` 与 `motionEasings.breathe` 同源。

  Badge 新增 `pulse`（Web Components 为 `pulse` attribute）：圆点档呼吸，表达正在进行、给不出进度的状态（直播、录制、通话中）；光环播 3 轮后停，圆点持续到状态结束；数字角标不呼吸；减弱动效下两者都停，圆点停在满不透明度。badge.css 因此引入共享关键帧，体积基线随之上调。

- df3d2ac: liquid 档的交互光：`data-material="liquid"` 下实心按钮在细指针悬停的一刻，一道光沿 1px 描边环扫过一次，光取面上前景色、不进面，文字对比不受影响；粗指针、强制色下不播，减弱动效下时长归 1ms。新增令牌 `--xh-motion-duration-glint`（640ms）与 motion 的 `motionDurations.glint`，共享关键帧 `xh-glint`，按钮新增覆盖槽 `--xh-button-glint-duration`。
- d56688e: Button 在途改为与 Clipboard、DownloadTrigger 同一种做法：`indicator` 不再常驻占位（静止时标签左侧不再空一格），而是居中压在钮上、钮宽不变；部件空着时由加载环家族配方画一枚环（连接层投影 `data-xh-loading-ring="overlay"` 与 `data-loading`）。进入在途要等一个 `micro` 才起淡，标签、前后缀同刻淡出留位，不到一个 `micro` 就结束的短请求什么都不闪；退出在途不等，环与内容按 `micro` 交叉淡回。作者往 `indicator` 里放了自己的图形时环让位，作者图形按同一节拍淡入淡出并转。示例改用空的 `indicator`。
- 3af3de7: Card 新增整卡可交互形态：

  - `interactive` 加新部件 `trigger`（放在 title 里的原生链接或按钮；Vue / React 的 `XhCardTrigger` 给了 `href` 渲染 `<a>`、不给渲染 `<button type="button">`，路由链接用 `asChild`；WC 作者直接写 `<a data-xh-part="trigger">`）。trigger 的点击区由伪元素铺满整张卡片，可及名与 Tab 位只归它，根上投影 `data-interactive`、不拿焦点也不写 role。
  - 反馈：outline 悬停抬高一档海拔（raised → lifted），按下换到白底阶梯 200；subtle 悬停 200、按下 300；ghost 悬停 100、按下 200。键盘聚焦时焦点环画在整张卡片外沿。脚部叠在点击区之上，里面的按钮照常可点、按下时整卡不换面。新增槽 `--xh-card-shadow-hover`、`--xh-card-bg-hover`、`--xh-card-bg-pressed`、`--xh-card-glint-duration`。
  - `data-material="liquid"` 下，可交互卡片在细指针悬停时描边扫过一道交互光，与 Button 实心钮同一配方。
  - subtle 卡片作为淡底容器向内下发承载面阶梯：放在里面的 ghost / outline 控件悬停与按下改按 200 → 300 换面。

  皮肤涨在可交互形态的三档反馈、点击区与焦点环、交互光与淡底容器的承载面槽上。

- 5dea71a: Carousel 新增 `effect` 换页方式：缺省 `slide` 轨道平移；`fade` 时各张叠放在同一格，新一张淡入、旧一张同时淡出，时长与平移同一档，减弱动效下直接换。`loop` 回绕在 fade 下只是一次淡变；拖拽仍按方向与速度翻页、画面不跟手。fade 一页只放一张，`slidesPerPage` 大于 1 时报错。Web Components 用 `effect` 属性。
- 56ce57b: `carousel` 在 `data-material="liquid"` 下：翻页与播放钮换成液态面（纵向轮播的钮整颗旋转，不挂按住形变），分页点托在一条液态胶囊上，压在任何媒体上都看得清；新增覆盖槽 `--xh-carousel-indicator-group-p`、`--xh-carousel-indicator-group-radius`。三颗控制钮与分页条带上部件 id。standard 档不变。
- fc40cbe: Carousel 拖拽松手改由弹簧接住松手速度：落点按速度投影 0.2s，轻甩也能翻页，往回甩到起点另一侧则收回原页；翻页后轨道从松手位置带着速度落到目标页，期间投影 `data-animating`、样式层让开过渡。不循环时首末页往外拖越拉越沉（60px 橡皮筋），松手硬弹簧弹回；落定途中再按下从此刻的位置接着拖。

  修正纵向轮播拖拽按 clientX 取坐标；指针被系统收走时不再翻页，弹回原页。状态机新增上下文 `dragBase`、`settleOffset`、`settling` 与 refs `settle`，`DRAG.END` 带 `velocity` 与 `canceled`。

- f660e16: `cartesian-chart` 新增注释 `annotations`：画在数据之外、帮读者读数的参照。

  - `line` 参考线、`band` 参考带：`axis` 取 `x`（自变量轴）或 `y`（数值轴），与屏幕方向无关；值计入所在轴的定义域，数据之外的目标值也看得到。参考带垫在数据之下，参考线是结构色的虚线。
  - `point` 标出某个系列的最大、最小、最后一个或指定 x 上的数据（一圈环加值）；`average` 是系列均值处的平均线；`trend` 是最小二乘直线（虚线）或尾随窗口的移动平均（点线，`window` 缺省 3）。它们取所属系列的颜色，随系列淡出与隐藏。
  - 标签缺省写值，与数据标签一起按重要性落位且注释优先；贴着绘图区边缘时翻到线或点的另一侧。
  - 新部件 `annotation`、`annotation-label`，带 `data-kind`（趋势线另带 `data-method`），都 `aria-hidden`；摘要末尾写出参考线、参考带与平均线，新增文案 `referenceLabel`、`averageLabel` 与模板 `annotationSummary`（缺省导出 `defaultCartesianAnnotationSummary`）。
  - 诊断码新增 `chart.annotation-target`：注释指向不存在的系列、不在轴上的类目时按提醒报出，只少画这一条。

- 25ccc68: `cartesian-chart` 新增箱线系列 `mark: 'boxplot'`，另有小提琴画法。

  - `y` 写字段名时同一个 x 上的全部行是一组原始值，按 R-7 求四分位，须线到 1.5 倍四分距以内最远的点，其外为离群点（`outliers: false` 时须线直达两端）；`y` 写成 `{ min, q1, median, q3, max }` 时直接用算好的五数，五个数须依次不减，否则报 `chart.invalid-range`。
  - 新部件 `box`（箱，可聚焦）、`whisker`、`median`、`outlier`：箱铺系列色的淡洗并描出轮廓，中位线加粗，离群点是空心小圆；`box` 上写 `data-style="box|violin"`。
  - `style: 'violin'` 用核密度画出每组分布的对称轮廓，宽度按整个系列里最大的密度归一；要原始值，否则报新诊断码 `chart.violin-raw`。
  - 可及名与提示框按新文案 `boxLabel` 写出五数，数据表五数与离群点各一列（列名 `boxColumns`），锚点落在中位数。

- 52f16f1: `cartesian-chart` 新增刷选。

  - `brush` 取 `x` / `y` / `xy`，缺省 `none`。开启后在绘图区里拖动即刷选（指针是十字，放大后的平移改用缩放条或键盘），拖着时画出框、类目轴取整到首尾类目的整条带，松手派发一次 `onBrushSelectionChange`（Vue `brush-selection-change` 与 `update:brushSelection`，Web Components `brush-selection-change`），载荷是范围 `selection` 与框里的数据 `data`。
  - 范围 `brushSelection` / `defaultBrushSelection` 写法同缩放窗口（定义域里的值，没刷的方向为 `null`），受控时由作者写回。`api.brush` 给出方向、范围与框在绘图区里的矩形，`api.setBrushSelection` 从外部设置。
  - 新部件 `brush`：选中语义的淡底加一圈聚焦色的细边，垫在数据之下；框外的柱、点、K 线与箱线淡出。组件槽 `--xh-cartesian-chart-brush-bg`、`--xh-cartesian-chart-brush-border`。
  - 键盘：Shift + 方向键从锚点起沿自变量刷，每按一次派发一次；Escape 与点一下清掉。
  - 开了刷选时绘图区写 `data-selectable`；绘图区的 `data-touch-axis` 写出缩放与刷选合起来拦下的触屏方向。

- 6dec15e: `cartesian-chart` 新增 K 线系列 `mark: 'candlestick'`。

  - `open` / `high` / `low` / `close` 四个字段，系列 `id` 缺省取收盘字段；自变量轴缺省是类目轴，数值轴盖住最低与最高价、不强制含 0。
  - `style` 缺省 `candle`：新部件 `wick`（影线，最低到最高）与 `candle`（实体，开盘到收盘，十字星至少一像素高）；`ohlc` 是美国线，整根线就是 `candle`。标记上写 `data-trend="rise|fall"` 与 `data-style="candle|ohlc"`，取涨跌色；强制色下涨空心、跌实心。
  - 实体是可聚焦的数据标记：可及名与提示框按新文案 `ohlcLabel` 写出四个价，数据表开高低收各一列（列名 `ohlcColumns`），锚点落在收盘价。
  - 诊断码新增 `chart.ohlc-range`：最低价高于开盘或收盘、最高价低于开盘或收盘。

- 1a821e9: 直角坐标图的数据层可选画在画布上：`renderer: 'svg' | 'canvas' | 'auto'`，缺省 `auto`。

  - `auto`：数据层逐个成节点的标记（柱、点、K 线、箱线……，折线与面积各算一条路径）超过 3000 个时改用画布，以内与 `svg` 完全一样。
  - 画布只画数据层：坐标轴、网格、参考带与十字准线移到画布下面的垫层（新部件 `underlay`），画布是新部件 `canvas`；系列分组、注释、数据标签、激活的点、焦点代理与焦点环、摘要与数据表仍是 SVG / DOM。
  - 颜色从 CSS 来：系列分组里放同部件、同状态、空几何的样式探针，画布逐帧读它们的计算样式——主题与暗色、强制色（画布上画系统色）、打印、纹理、作者对 `--xh-cartesian-chart-series-color` 的覆盖都照样生效；悬停图例时其余系列随分组的 CSS 过渡淡出，画布逐帧跟读。
  - 后备尺寸按设备像素比，浏览器缩放与换屏后重画，打印时按至少 2 倍重画；重绘在宿主提交之后按微任务合并，与 SVG 层同帧。
  - 键盘与读屏不变：绘图区占一个 Tab 位，进来后焦点落在锚点数据的焦点代理上（那根柱、那个点或那根 K 线的 SVG 版本，放回所属系列的分组、叠在画布上）。
  - 画布上不播几何过渡：数据更新、图例切换与缩放直接画终态，画布整体随有无数据淡入淡出。
  - Web Components 侧新增 `renderer` 属性与 `currentRenderer` 只读属性；垫层与画布由元素生成，作者照旧只写空的 `<svg>` plot。

- cecd047: **新增** `cartesian-chart` 组件（直角坐标图），Vue、React 与 Web Components 三端可用：柱与折线共用一根自变量轴与一根数值轴，柱状图、条形图、分组与堆叠柱、折线、面积与百分比堆叠面积都是它的配置。

  - 系列用 `mark` 区分画法，字段名把数据列映射到 `x` / `y`；比例尺按数据推断（类目、时间、数值、对数），有柱时数值轴强制包含 0。
  - 颜色按系列次序取分类色 1–8，`slot` 固定色槽，`tone` 改用语气色；图例切换显隐后幸存系列颜色不变。
  - 提示框缺省按键汇报同一个键上的全部系列（`trigger="axis"`），frosted 材质，画在根内；`activeKey` 受控即可让多张图在同一个键上联动。
  - 绘图区是 `graphics-document`，只占一个 Tab 位，方向键在数据之间移动，折线由焦点代理点承接真实焦点；图例是工具条，按钮 `aria-pressed` 表示显隐。
  - 组件在根内生成视觉隐藏的摘要与数据表；几何量（柱厚上限、线宽、点径、轴标签字体）以 CSS 组件槽为真源，挂载后读取。
  - React 适配器的 SVG 文本属性 `text-anchor` 与 `dominant-baseline` 按 React 写法转换。

- 73703b7: `cartesian-chart` 新增区间、棒棒糖与流图。

  - 柱与折线的 `y` 可写成二元组 `[下, 上]`：柱从下端画到上端浮着（数值轴不再强制含 0），折线只铺一条区间带、不画线，锚点落在带的正中。提示框、可及名与数据表写成「下 – 上」，系列 `id` 缺省取上端字段；区间不参与堆叠，下端高于上端时报 `chart.invalid-range`。
  - 柱的 `shape: 'lollipop'`：新部件 `stem`（细杆）顶一个可聚焦的 `point`；区间时两头各一个点（哑铃），只有上端的点可聚焦。图例与提示框的色标画成圆。
  - 折线堆叠的 `stackOffset` 新增 `silhouette`（以 0 为中线上下对称）与 `wiggle`（流图，层按峰值出现的先后由内向外排）。

- dcde778: 直角坐标图加入数据标签、堆叠合计与线尾标签。

  - 柱系列 `labels: 'inside' | 'end'`：inside 写在柱内居中、字取与色槽配对的前景色；end 写在柱的远端外侧，负值翻到另一侧，堆叠中的段写在段内的远端。放不下、与更要紧的标签重叠时不写。
  - 折线系列 `labels: 'end'` 把数值写在每个点的上方；`endLabel` 在线尾写系列名与末值，末端挤在一起时上下推开，推开的标签用引导线连回线尾。
  - 图级 `totals`：每个堆叠组在整叠外侧写合计，含负值时正负两端各写一个；百分比堆叠不写。
  - 柱端外侧的标签写在绘图区里，数值轴两端各收进一截；线尾标签在右边留出位置。标签只给眼睛看，首次出现等柱长完、笔尖扫到再淡入，所属系列被淡出时一起淡出。
  - 新增部件 `data-label`、`total-label`、`end-label`、`leader-line`；三端都画出场景的前景层。直角坐标图皮肤因标签规则涨约 20%。

- 21e5e7e: `cartesian-chart` 新增散点与气泡系列 `mark: 'scatter'`：看两个量之间的关系与分布。

  - 每行一个点，同一个 `x` 上可以有任意多个点。只有散点时自变量按数据推断为连续轴，两端缺省取整到刻度上，两个方向都画网格；提示框缺省按 `item` 汇报，命中取离指针最近的点。
  - 点的形状缺省随色槽依次取圆、方、菱形、三角……，`symbol` 可指定；图例与提示框的色标画成同一个形状（带 `data-mark="point"` 与 `data-symbol`）。
  - `size` 把一个字段映射到点的面积（半径取平方根），全部散点系列共用一把尺，最大半径等于柱厚上限；大的先画、小的压在上面。连续轴两端收进一截，贴着定义域端点的点也整个落在绘图区里。
  - `jitter` 在类目轴上把点左右散开，偏移以点的身份为种子，重渲染不跳；`datumId` 指定身份字段，数据换序时同一个点落在同一处，过渡里也按它配对。
  - 点本身可聚焦、roving 取 Tab 位，左右键按 x 的次序走，上下键换到另一个系列里 x 最近的点；焦点环按点的大小外扩。
  - 含散点时数据表改为每个数据一行（系列、x、y，有气泡时再加大小），新增文案 `seriesLabel`、`valueLabel`、`sizeLabel`；气泡的缺省可及名与提示框在数值后面补上大小。
  - 修正 `trigger="item"` 时折线命中不到数据点的问题。

- 0b1816a: `cartesian-chart` 的散点新增按值着色 `color` 与根上的色板 `palette`。

  - `color` 把一个字段映射到顺序色阶，全部按值着色的系列共用一把尺；这样的系列不再取分类色（形状照旧随色槽），字段缺失的点取色阶中点。点只用色阶上从 30% 起的一段，最浅的一段压在承载面上看不清。
  - 图例末尾生成色阶：新部件 `legend-scale`、`legend-scale-name`、`legend-scale-bar`、`legend-scale-value`（`data-edge="min|max"`），渐变按点用的同一段画；没有按值着色时整块收起。只有一个系列而有色阶时图例不再收起。
  - `palette`（与热力图同名的十三个色板）把顺序色阶换到基础色板里同名的色相上，起点贴近承载面、终点贴近正文色，亮暗主题下都是值越大越显眼。Web Components 写 `palette` 属性。
  - 连接层在点与提示框的色标上写 `data-seg="low|high"` 与内联 `--xh-_chart-p`，皮肤用一层 `color-mix` 插值；系列分组、图例项与提示框的行带 `data-xh-chart-scale="sequential"`。
  - 新增文案 `colorLabel`；数据表多一列，缺省可及名与提示框在数值后补上颜色对应的值。
  - Chart 家族配方新增顺序色阶的三个锚点私有槽与十三个色板规则，提示框的色标按段插值。

- c86cc04: `cartesian-chart` 的柱系列新增瀑布 `waterfall`。

  - 每一步接在上一步的累计值上浮着，柱上写 `data-trend="rise|fall"`，涨取 `--xh-chart-rise`、跌取 `--xh-chart-fall`；`waterfall.total` 指定小计字段，为真的行从 0 画到当前累计值、保持系列色，它的 `y` 被忽略。
  - 新部件 `connector`：相邻两步之间的细线，与上一步的终点同高，只给眼睛看；缺失的一步不画、不改累计，连接线跨过它。
  - 数据标签与可及名写这一步的增减，小计写累计值；瀑布不参与堆叠。纹理模式、强制色下由纹理与柱的走向区分涨跌。

- 9efa072: `cartesian-chart` 新增缩放与降采样。

  - `zoom` 打开缩放：`x` / `y` / `xy`，缺省 `none`。窗口 `window` / `defaultWindow` 用定义域里的值写两根轴各露出的一段（类目轴写首尾两个类目，连续轴写两端的值，数值轴写 `[下, 上]`，`null` 是整条轴），多张图接到同一份窗口上即联动；变化时派发 `onWindowChange`（Vue `window-change` 与 `update:window`，Web Components `window-change`）。类目轴按窗口露出连续的一段类目；连续轴与数值轴换成窗口对着的定义域，系列与注释按绘图区裁剪（新部件 `clip-path` / `clip-rect`）。
  - 手势：Ctrl（⌘）滚轮以指针为中心缩放，放大后拖动平移，触屏双指捏合、单指平移，只拦能缩放的方向；键盘在绘图区按 + / − 以焦点为中心缩放，焦点走出窗口时窗口跟过去。
  - 竖向图缩放自变量轴时，绘图区下方出一条缩放条：新部件 `zoom-slider`（`role="group"`）、`zoom-track`、`zoom-window`、两个 `zoom-handle`（`role="slider"`，读出窗口那一端对着的类目或值）与轨道里整条轴的缩略线 `zoom-preview` / `zoom-preview-line`。Web Components 侧作者在外壳里放一个空的 `zoom-slider`。新增文案 `zoomLabel`、`zoomStartLabel`、`zoomEndLabel`，组件槽 `--xh-cartesian-chart-zoom-*`。
  - 折线的点比绘图区的像素多一倍以上时按 Largest-Triangle-Three-Buckets 降采样，缩放后只采窗口里的一段；焦点、提示框、摘要与数据表仍是全部数据。

- ea8043f: Cascader 新增懒加载，与 TreeSelect 同一套契约：节点写 `hasChildren: true` 不给 `children` 即是懒分支，照样算分支、右边开一列；展开路径走到它时由 `loadChildren({ node, path, signal })` 取回直接子项，结果留在组件里并进 `api.collection` 与 `levels`（还没取回时补一个空层）。那一列在途时报 `aria-busy` 并露出新部件 `branch-loading`，失败露出 `branch-error` 与 `branch-retry-trigger`（Action Control text ghost 档，不占 Tab 位；父条目上按 Enter / Space 同样重试），取回空数组即成了叶子。三块由三端在列末自动铺出，文案走新文案 `translations.branchError` / `retry` 与原有的 `loading`。展开路径离开、浮层收起、重试、节点换代与卸载都会中止在途请求，迟到的结果不写回也不发事件。新增 `onBranchLoadStart` / `onBranchLoad` / `onBranchLoadError`（三端事件 `branch-load-start` / `branch-load` / `branch-load-error`）、`api.branchLoadState` / `columnLoadState` / `retryBranch`、`getBranchLoadingProps` / `getBranchErrorProps` / `getBranchRetryTriggerProps`，导出 `isCascaderLazyBranch` / `resolveCascaderCollection` / `findCascaderNode` 与相关类型；`cascaderSearchCandidates` 不再把没取回的懒分支当叶子候选。`api.collection` 改为有效树（作者的 collection 并上已取回的子项）。样式槽 `--xh-cascader-branch-status-*`。
- ab84e80: Cascader 多选的已选路径在触发器里排成标签，与 Select、TreeSelect 同一套呈现：新增 `tag-list` 部件与 `maxTagCount`（默认 3，其余合成 `+N`），标签与 +N 套库里的 tag、走标签行家族配方与列表动效，文字是整条路径按 `separator` 连缀；触发器外可放带删除钮的标签。标签身份写路径的比较键（`api.tags` 里的 `key`）。新增 `api.tags` / `overflowCount` / `overflowText` / `deselect(path)`、`getTagListProps` / `getTagProps({ value })` / `getTagLabelProps` / `getOverflowTagProps` / `getItemDeleteTriggerProps({ value })`、类型 `CascaderTagMeta` / `CascaderTagProps` 与文案 `translations.deleteItem` / `overflowTag`。Vue / React 新增 `XhCascaderTagList`、`XhCascaderTag`、`XhCascaderTagLabel`、`XhCascaderOverflowTag`、`XhCascaderItemDeleteTrigger`；Web Components 用 `tag-list` / `tag` / `overflow-tag` / `item-delete-trigger` 角色并按元素的 `tags` 渲染，另补 `tags` / `overflowCount` / `overflowText` 读口与 `deselect` 方法。行距槽 `--xh-cascader-tag-list-gap`。
- b07b3f0: 新增 Chart 图表家族配方 `@xihan-ui/styles/chart.css`：标题、视口与绘图区、在途、图例、提示框、色标、焦点环、引导线、空态与加载态，以及它们的强制色与打印分支，由 `recipes/chart.recipe.json` 生成这一份真源，直角坐标图与饼图共用。

  - 两个图表在这些部件上投影 `data-xh-chart-part`（取值与部件名相同），皮肤只留各自的色槽、数据标记与标注。
  - 组件覆盖槽不变：`--xh-cartesian-chart-*` 与 `--xh-pie-chart-*` 写在对应部件上接进配方的私有槽，作者在部件或它的祖先上覆盖都照常生效；三端的计算样式与改动前逐项一致。
  - 两份图表皮肤各自 `@import '../family/chart.css'`，单独引入仍成立；全量入口把配方与其它家族一起在组件皮肤之前内联一次。

- 1581fda: 图表首次取数的空态：`pending` 而手里还没有可画的数据时，空态写 `translations.loadingText`（缺省 Loading…）并在文字前转一个圈，空态部件带 `data-state="loading"`；取完仍没有数据才写 `emptyText`。减弱动效与打印下圈停下换成点线。新增组件槽 `--xh-cartesian-chart-empty-gap`、`--xh-pie-chart-empty-gap`。饼图皮肤因此涨约 13%。
- 62a45d3: 图表取数中、还没有可画数据时空态部件里那枚环改接加载环家族配方，不再由 Chart 家族配方另画一份：CartesianChart、PieChart、FunnelChart、RadarChart、GraphChart、HierarchyChart、SankeyChart 的 `empty` 部件在取数时投影 `data-xh-loading-ring` 与 `data-loading`，环的画法、减弱动效与打印下的静止点线环、强制色都由配方给；Chart 家族配方只留环占的那一格（配方源 `loading` 段只剩 `ringSize`）。FunnelChart、RadarChart、GraphChart、HierarchyChart、SankeyChart 的皮肤补上 `family/motion.css` 的引入：此前单独引入这几份皮肤时，空态的转圈与入场淡入没有关键帧可用。
- ddb0797: 图表在颜色不可用或不可靠时改用纹理区分系列：强制色与打印下总是开启，作者在任意祖先上写 `data-xh-chart-patterns` 也会开启。

  - 直角坐标图的柱与面积改用本系列的斜线纹理填充并描出轮廓，折线换成各自的线型（实线、长虚线、点线、点划线……）；饼图的扇区改用本色槽的纹理，「其他」不带纹理。图例与提示框的色标画成同一副纹理与线型，压在色块上的标签改用标签色并描一圈承载面色。
  - 8 种纹理（45° 与 135° 各三档疏密，外加斜向与正向两种交叉）与色槽一一对应，语义系列按声明次序取。纹理定义在绘图区开头的 `<defs>` 里，id 由绘图区的 id 派生，服务端渲染与客户端一致；三端都画出它。
  - 新增 API `patterns`、`getDefsProps`、`getPatternProps`、`getPatternLineProps`，新增部件 `defs`、`pattern`、`pattern-line`；系列分组、扇区、图例项与提示框的行带 `data-xh-chart-pattern`。纹理的方向、线距与线型由 Chart 家族配方给出，门禁核对配方与 headless 的纹理形状逐项相同。

- 659c0e0: 图表入场的细节：折线上的数据点等描线的笔尖扫到才出现；饼图的标签与引导线等扫开的边缘到了才出现，环形中心等整圈扫完再淡入；环形中心的合计首次出现从 0 数上去，数据变化或图例切换时从旧值滚到新值。延迟以入场时长的比例写在私有槽 `--xh-_chart-reveal-at` 上，由样式乘上 `--xh-motion-duration-reveal`，作者改时长、系统开减弱动效时一起缩放；减弱动效下数值直接到终值。数据层的标记多于 1000 个时不做几何插值，只淡入淡出。
- b308aed: 图表播放过渡动画：直角坐标图首次出现时柱沿数值轴从基线长出、折线从头描到尾、面积与点淡入，多个系列按图例次序错开；饼图整圈从起始角顺着扫开，标签与引导线随之淡入。之后的数据变化与图例切换从当前位置插值到新位置：留下的柱原地伸缩、扇区角度随之变化，新增的从基线长出，隐藏的收回基线并淡出后才移除；坐标轴刻度按值对齐，两边都有的刻度滑到新位置，其余淡入淡出。

  新增 `animated` 属性（缺省 true），false 时直接画终态，Web Components 写 `animated="false"`。入场取 `--xh-motion-duration-reveal`（640ms），更新取 `--xh-motion-duration-morph`（400ms），在图或它的容器上改写即可调快慢；系统减弱动效或容器写 `data-motion="reduce"` 时几何直接到位，只保留淡入淡出。视口尺寸变化与字体加载后的重排不播过渡。收场中的标记不进可访问树、不可聚焦。

  共享关键帧新增 `xh-draw`（数据关系组），描线期间折线带 `data-drawing` 与 `pathLength="1"`。

- f06dcb3: 新增勾选标记家族配方 `family/check-mark.css`：勾选格里的勾与半选杠常驻，不再按勾选态生成或撤掉内容；按状态以 opacity 淡变（`--xh-motion-duration-micro`）并从 `--xh-motion-scale-enter` 回到原尺寸（`--xh-motion-duration-nudge`），减弱动效下只剩淡变；勾与半选杠叠成两层遮罩，半选淡出途中保持横杠。

  连接层在画标记的节点上投影 `data-xh-check-mark`（`checked` / `indeterminate` / `unchecked`）与 `data-xh-check-mark-profile`（`box`：节点就是方框；`row`：方框画在整行的 `::before`，标记叠在方框正中）：

  - Checkbox `indicator`、CheckboxGroup `indicator`、Transfer `item-checkbox`、Table `select-all-trigger` / `row-select-trigger` / `column-visibility-trigger`、QuestionFlow 多选题的 `item-indicator` 投影 `box`；
  - CheckboxGroup 与 Transfer 的 `select-all-trigger` 投影 `row`。

  随之对齐的取值：CheckboxGroup 勾中方框的填色与独立 Checkbox 同取保证 3:1 的语气 control 色；CheckboxGroup 全选格禁用时标记取 `--xh-fg-disabled`；Table 三颗勾选框不再把前景换成透明来藏勾，禁用且勾中时显示置灰的勾，与 Checkbox 同一档。GridList 行勾选框的描边、底色补上过渡，勾常驻并按同一副取值淡变。

- 0ac39c5: CheckboxGroup 新增结构形态 `variant`（`list` 缺省 | `card`）与说明行部件 `item-description`。

  - `variant="card"` 把每个条目画成一张可点的描边卡，与 RadioGroup 的 card 形态共用选择卡片家族配方：条目换成 Action Control row 档的 `outline` 形态并投影 `data-xh-choice-card`，根投影 `data-variant`；勾中的卡换品牌淡底（有 `tone` 换语气淡底），描边不换，行首方框照常。全选触发器在两种形态里都是一行。
  - 条目新增投影 `data-readonly`，卡面据此在只读时收回悬停与按下面。
  - 新增部件 `item-description`（`XhCheckboxGroupItemDescription`）：文案下方的说明行，13 / `--xh-fg-muted`；`collection` 的节点新增 `description`，数据驱动时自动铺出这一行。
  - 新增组件槽 `--xh-checkbox-group-card-title-font-weight`、`--xh-checkbox-group-item-description-fg`、`--xh-checkbox-group-item-description-font-size`、`--xh-checkbox-group-item-description-fg-disabled`、`--xh-checkbox-group-item-row-gap`。

- 4f4b97b: Citation 新增悬停预览与一处多源轮换：

  - 新增 `previewMode`（`inline` 缺省 / `hover`）。hover 档把预览放进新部件 `positioner`（Vue / React `XhCitationPositioner`，Web Components `data-xh-part="positioner"`），锚定在引用编号旁的悬停卡片接定位引擎、搬到 portal 落点、不推动正文；指针停留 `openDelay`（缺省 700ms）出现，离开编号与卡片 `closeDelay`（缺省 300ms）后收起，卡片开着或刚收起不到 `skipDelayDuration`（缺省 300ms）时指向另一处引用直接接替；焦点落到引用上当场打开，Escape 与卡片外按下收起；触屏交给点按。卡片是 frosted 锚定面板，出现与退场走 `xh-overlay-pop-in` / `xh-pop-out`。另新增 `placement`、`offset`。
  - 行内引用新增 `sourceIds`（Web Components 在 `value` 里写空白分隔的几个 id），与 `sourceId` 只写一个；预览新增部件 `prev-trigger`、`next-trigger`、`preview-index`，在一处多源的几个来源之间轮换，只有一个来源时收起。新增文案 `citations`、`previousSource`、`nextSource`。
  - 新增导出 `CITATION_DEFAULT_PLACEMENT` 与类型 `CitationPreviewMode`、`CitationRefs`、`CitationTriggerTarget`；API 新增 `activeGroup`、`previewMode`、`getPositionerProps`、`getPrevTriggerProps`、`getNextTriggerProps`、`getPreviewIndexProps`、`getPreviewPosition`。
  - 行内引用的 `aria-expanded` 只落在打开预览的那一处（从来源列表打开时同来源的引用都算）。
  - 修正 Vue `XhCitationRoot` 只在首帧读取 props：受控写回与改档此前传不进机器。

- dce47c5: Citation 预览按 surface 级披露展开收起：内容区高度从 0 长到整块（`--xh-motion-duration-expand` + `enter-strong`）、收起时收回 0（`collapse` + `exit`），内缩、描边与它前面那道间距一起动，后面的段落随之平移（此前瞬开瞬关、直接推开后面的段落）。首帧就开着的预览投影 `data-instant` 直接呈现；减弱动效下瞬时完成。

  - 收起的那一份先播完收回才写 `hidden`，途中带 `inert`；换来源时旧的收起、新的展开同时进行。
  - 机器新增 context `shownSourceId` / `leavingSourceId` / `moved` / `previewBlockSizes` 与事件 `PREVIEW.MEASURED` / `PREVIEW.LEFT`；预览露面与收起前量下内容区高度，连接层写进内联私有槽。
  - 皮肤新增关键帧 `xh-citation-preview-expand` / `xh-citation-preview-collapse`（登记为布局动画例外）；根改为纵向 flex 排列，预览的盒模型改为 content-box 并裁掉溢出。皮肤体积基线随之上调。

- 0ed99b4: **新增** `Citation` 组件（引用来源）：Vue、React 与 Web Components 同时支持行内引用、来源预览、来源列表、方向键导航及完整可访问关系。

  `sources` 与 `@xihan-ui/chat-stream` 的 `SourcePart[]` 结构兼容；URL 来源也可携带 `anchors`。新增皮肤约 8 KB，包含预览 surface、引用编号和来源列表样式。

- a594e30: Clipboard 复制钮的写入在途改接加载环家族配方：连接层投影 `data-xh-loading-ring="overlay"`，环压在钮正中、直径取钮的图标档，画法与 Spinner 环档一致（一整圈轨道 + 粗环，此前是 1em、1px、无轨道的小环）。进入在途等一个 `micro` 才起淡，钮里的文字与字形随前景同刻淡出留位；退出在途不再硬切，按 `micro` 交叉淡回。`--xh-clipboard-loading-duration` 照旧控制转速。加载环配方新增私有槽 `--xh-_loading-ring-duration`，供承载者把自己的时长槽接进来。
- ac0d04e: CodeView 新增按语法块折叠：

  - 新增 `blockFolding`：按缩进找出语法块（一行之下缩进更深的连续行，夹在中间的空行算在内），块头那一行的行首出现折叠钮，新部件 `line-fold-trigger` 由组件铺在正文最前面；收起的行带 `hidden`、不占高度，块头的行与正文带 `data-folded`，皮肤在正文后面画一枚省略号；root 带 `data-block-folding`。
  - 折叠集合写块头的行号（随 `startLine`）：`folded` 受控（Vue `v-model:folded`）、`defaultFolded` 非受控（Web Components 属性 `folded` / `default-folded`，逗号分隔），变化经 `folded-change` 报出 `{ folded }`。
  - 行首折叠钮合起来只占一个 Tab 位，上下方向键在看得见的钮之间走，Home / End 到首末；可访问名取 `translations.foldBlock(first, last)`，开合由 `aria-expanded` 表达。
  - 新增导出 `findCodeViewFoldRegions` 与类型 `CodeViewFoldRegion`、`CodeViewFoldedChangeDetails`；API 新增 `foldRegions`、`folded`、`isFoldStart`、`toggleFold`、`getLineFoldTriggerProps`。
  - 外观槽：`--xh-code-view-fold-col`、`--xh-code-view-line-fold-trigger-{radius,fg}`、`--xh-code-view-icon-size`、`--xh-code-view-folded-{gap,fg}`。

- 7e5a87a: Collapsible 首帧不播开合：挂载时已经展开或收起的内容与箭头投影 `data-instant`，直接呈现；第一次开合（用户操作或受控值改写）起撤掉，按动效走。
- fac80f7: 为 Tree、Listbox、Select、Combobox 与 Transfer 增加 CollectionVirtualizer 正式接线协议；完整集合继续负责键盘、检索、选择与 ARIA 位置，Virtualizer 只裁剪窗口 DOM，并在目标条目挂载后完成焦点交接。
- b85e63d: ColorPicker 的盒接入字段外壳家族：静息无影、悬停取家族的淡底、聚焦边一律 `--xh-border-control-focus`（不随语气），与同族的下拉选择同一套面；新增 `variant`（outline / subtle / ghost，默认 outline）。字段标签字号不再随档；通道输入框的聚焦边不随语气；吸管钮按浮层白底承载阶梯换面（hover 100 → pressed 200）。
- d990cfd: ColorPicker 新增常驻形态 `inline` 与最近使用色。

  - `inline`（Web Components 属性 `inline`）：取色面直接铺在页面里，与浮层形态同一台机器、同一组部件，只是不写 `control` / `trigger` / `positioner`。恒为展开态，`open` / `defaultOpen` / `onOpenChange` 不起作用；不入层栈、不抢焦点，点外与 Escape 都不收起。content 换成由标题命名的 `role="group"`（不带 `aria-modal` 与 `tabindex`），root 与 content 投影 `data-inline`；皮肤把取色面画成静态内容面：surface 圆角、`--xh-border-default` 描边、实体底、不落影、不播进退场，根不再取字段缺省宽。运行期关掉 `inline` 时收起回到浮层形态（`open` 受控为真则留着）。
  - 最近使用色：一轮取色结束且颜色变了就记一笔，最新的在最前、同色（写法不同也算）只留一份。浮层形态以收起为一轮，常驻形态以焦点离开取色面为一轮；只经 `setValue` 改的不记。`recentColors`（属性 `recent-colors`，逗号分隔）可受控，`defaultRecentColors`（`default-recent-colors`）为非受控初值，`maxRecentColors`（`max-recent-colors`，缺省 8，写 0 即不记）限定个数；变化经 `onRecentColorsChange` / `recent-colors-change` 发出 `{ recentColors }`。
  - 新部件 `recent-swatch-picker`：最近使用色的挂载点，与 `swatch-picker` 同一台色块选择器（`role="radiogroup"`，名字取新文案 `translations.recentSwatchGroup`，缺省 `Recent colors`），挑一格即改值；还没有最近使用色时收起。Vue / React 新增 `XhColorPickerRecentSwatchPicker`，不写子节点时按列表自动铺格；Web Components 由作者按 `recent-colors-change` 铺格。
  - `colorPickerMeta.requiredParts` 去掉 `trigger`：它只在浮层形态才写，常驻形态不写。
  - 插槽作用域 / 函数式 children 新增 `recentColors` 与 `clearRecentColors`；元素新增只读属性 `currentRecentColors` 与方法 `clearRecentColors()`。
  - headless（破坏性）：`ColorPickerServices` 新增必填的 `recentSwatchPicker`，自行组装服务表接 `connectColorPicker` 的调用方要用 `colorPickerRecentSwatchPickerProps` 再建一台色块选择器补上；导出 `colorPickerRecentSwatchPickerProps`、`colorPickerPushRecent`、`colorPickerMaxRecent`、`COLOR_PICKER_MAX_RECENT_COLORS` 与类型 `ColorPickerRecentColorsChangeDetails`；机器 context 新增 `recentColors` / `sessionValue`，事件新增 `SESSION.END` / `RECENT.CLEAR` / `INLINE.SYNC` / `INLINE.CLOSE`。

- fcfe307: Combobox 多选时已选项在输入框前排成标签，与 Select 同一套呈现：新增 `tag-list` 部件与 `maxTagCount`（默认 3，其余合成 `+N`），标签与 +N 套库里的 tag，标签里的删除钮不占 Tab 位、按下不夺焦，删完焦点仍在输入框；新增 `api.tags` / `overflowCount` / `overflowText` / `deselect`，文案 `translations.deleteItem` / `overflowTag`。已选项被宿主筛出候选后，标签仍显示选中那一刻的文字。Vue / React 的自动结构在 `multiple` 时直接铺出标签行；手写时用 `XhComboboxTagList`、`XhComboboxTag`、`XhComboboxTagLabel`、`XhComboboxOverflowTag`、`XhComboboxItemDeleteTrigger`，Web Components 用 `tag-list` / `tag` / `tag-label` / `overflow-tag` / `item-delete-trigger` 角色并按元素的 `tags` 渲染。输入框缺省最小宽取 `--xh-control-input-min-w`（`--xh-combobox-input-min-w` 可覆盖），行距槽 `--xh-combobox-tag-list-gap`。
- cba8ed7: Combobox 的占位态按设计真源的占位态一节补齐：首次加载时 `loading` 部件在文案前转一枚加载环（连接层投影 `data-xh-loading-ring` 与 `data-loading`，环走加载环家族配方），此前只是一行静态文字；已有候选时后台刷新保留上一帧，条目与分组标题按 `micro` 淡到 `--xh-state-disabled-opacity`，淡的是内容不是磨砂面。分组标题、空态与加载占位的行内内衬改随尺寸档（此前固定 md），与条目文字对齐。
- d8d731a: Command 打开时已有的结果不再逐条冒出来：每次打开，列表接上条目到达的追踪之前投影 `data-instant`，接上时已在的结果直接呈现；之后因检索串换掉而新露面的一批结果按到达顺序错开进场（`--xh-_stagger-index`，封顶 4 个步长），不再按它在可见结果里排第几。
- b8e4f3b: Command 的占位态按设计真源的占位态一节补齐：
  - 首次加载时 `loading` 部件在文案前转一枚加载环（连接层投影 `data-xh-loading-ring` 与 `data-loading`，环走加载环家族配方）。
  - 在途占位只接管首次加载：清单里已有看得见的命令时列表原样留着、按 `micro` 淡到 `--xh-state-disabled-opacity`（此前是硬切），在途占位让位（此前与列表同屏）；没给清单时库判不出有没有候选，在途即露面，与此前一致。
  - 空态与在途占位的上下内距由 `--xh-space-6` 收到与其它集合同档的 `--xh-space-3`，文字与分组标题由 `--xh-fg-subtle` 改为次要文字 `--xh-fg-muted`。
- 46c59c5: DatePicker 的 showTime 接上与时间选择器同一份时间约束。

  - 新增 `hourCycle`（`12 | 24`，缺省 24，不随 locale 推断）：12 时时间列末位多出上下午列、输入行的时刻段后面多出上下午段，值仍是 24 小时制的 ISO 串；上下午列的名字走新文案键 `translations.dayPeriod`（缺省 `AM/PM`），格上的字按 locale 现译。Web Components 的 attribute 是 `hour-cycle`。
  - 新增 `timeStep: { hour?, minute?, second? }`：时间列按单位取样。Web Components 的 attribute 是 `time-step`（JSON 对象）。
  - 新增 `isTimeUnavailable(value, unit, context)`：时列按 24 小时制给值，`context` 带已选的时、分与这份时间所属的日期（还没有值时是聚焦日）。
  - `min` / `max` 可以带时间段（`'2026-09-28T09:30'`）：日历按日期段收，与它同一天时界外的时刻留在列里、标为不可选（`aria-disabled` + `data-disabled`，家族禁用面），按下不写值、方向键跳过；列长不随所选的日子变。
  - api 新增 `hourCycle`、`timeStep`、`getTimeItemText`、`isTimeItemDisabled`；`DatePickerTimeUnit` 放宽到含 `dayPeriod`；新增 `datePickerTimeModel`、`datePickerNormalizeTime`、`datePickerCalendarBound`。Vue / React 的 `TimePanel` 按 `getTimeItemText` 填字，Web Components 新增只读属性 `timeColumns`，时间格内容为空时由元素填字。
  - 皮肤：不可选的时间格选中标记跟着降级，强制色下换 GrayText。

- 4cb8645: DateRangePicker 新增一体化时间 `showTime`（只在 `granularity=day` 下生效）。

  - 两端都升格为不带时区的 `YYYY-MM-DDTHH:mm[:ss]`：两组段位带上时刻段，浮层里起止各多出一组时间列，选完日期不收起，由新部件 `confirm-trigger` 收口。`timeZone` 仍只决定「今天」。
  - 新增部件 `column-group`、`column-group-label`、`time-column`、`time-item`、`confirm-trigger`，列与格与 DatePicker 的时间部件同名，一端的外壳与小标题与 TimeRangePicker 同名，按 `index`（0 起点、1 终点）归属。Vue / React 新增 `XhDateRangePickerTimePanel`（起止两组整组自动铺）与 `XhDateRangePickerConfirmTrigger`；Web Components 由作者写两组 `data-xh-part="column-group"`（`index` 属性区分），新增只读属性 `timeColumnGroups`，时间格内容为空时由元素填字。
  - 新增 `timeGranularity`（`'minute' | 'second'`，缺省 minute；不扩展 `CalendarGranularity`）、`hourCycle`（`12 | 24`，缺省 24）、`timeStep`、`isTimeUnavailable`（`context.index` 是哪一端、`context.date` 是这一端的日期），与时间选择器共用一份约束；`min` / `max` 可以带时间段，同一天界外的时刻标为不可选。起止落在同一天时终点列早于起点时刻的格自动不可选；两端按日期时间比先后，终点早于起点即整份标为不合法。
  - 新增 `defaultTime: [string, string]`：只点日期时给还没有时刻的那一端补上对应时刻；快捷选项同样是「日期拼上这一端此刻的时刻」。
  - 新增 `activeIndex`（`0 | 1`，可受控，配 `onActiveIndexChange` / Vue `update:activeIndex` / Web Components `active-index-change`）：从终点那组段位展开（点它或在它上面按 Alt+ArrowDown）为 1，其余为 0；为 1 且已有起点时日历只改终点。Web Components 的 attribute 是 `show-time`、`time-granularity`、`hour-cycle`、`time-step`、`active-index`，`defaultTime` 与 `isTimeUnavailable` 只能走 property。
  - 文案新增 `startTime`、`endTime`、`hour`、`minute`、`second`、`dayPeriod`；`DateRangePickerValueSource` 放宽到含 `'time'`。
  - 导出 `compareDateRangeEnds`、`dateRangePickerShowTime`、`dateRangePickerTimeGranularity`、`dateRangePickerDefaultTime`、`dateRangePickerJoinTimes` 与相应类型。
  - 皮肤：`date-range-picker.css` 新增两组时间列（外壳、小标题、列、格与选中对号、禁用面）与确认钮的样式，连同强制色与手机档的补丁，去注释压空白后由 18033 字节涨到 29203 字节。

- 84d0111: Descriptions 新增列表之前的头部：`header`（一行）、`title`（左侧标题）、`extra`（右侧操作或状态）三个部件。头部排在根之外——根常写成 `dl`，里面只能放成对的 `dt` / `dd`：Vue 写进 `XhDescriptionsRoot` 的 `header` 插槽，React 经 `header` 传入，Web Components 写成 `root` 的前一个兄弟。标题缺省渲染为 `div`，按页面层级用 `as` 换成 `h2` / `h3`；样式为 Surface 内标题（正文字号、半粗），头部与列表的间距随尺寸档。新增公开槽 `--xh-descriptions-header-gap`、`--xh-descriptions-header-mb`、`--xh-descriptions-extra-gap`、`--xh-descriptions-title-fg`、`--xh-descriptions-title-font-size`、`--xh-descriptions-title-font-weight`。皮肤涨在头部三条规则上。Vue 的 `XhDescriptionsRoot` 写了头部时渲染为片段，作者写在根上的 class 与属性仍落在 `dl` 上。
- 88e41b9: Dialog 新增 `draggable`（Web Components 为 `panel-draggable`，避开 HTML 全局的 `draggable`）：指针按住标题栏（header，没写 header 时是 title）即跟手挪走面板，标题栏里的按钮与表单控件照常点，面板四边始终夹在视口内，每次打开从居中落点起。新增 `drag-trigger` 部件（`XhDialogDragTrigger`）：放在 header 里铺满标题栏的透明把手，方向键挪一步、Shift 大步、Enter / Space 回到居中，初始焦点越过它。拖动走 `@xihan-ui/pointer` 的指针会话，位移写成 content 上的私有槽、按 transform 平移，与进出场关键帧叠加，拖过的面板从拖到的位置退场。`DialogTranslations` 新增 `dragTrigger`，`DialogApi` 新增 `offset` 与 `dragging`。
- 41e5a5a: DiffView 新增行评论钩子：

  - 新增 `commentable`：每行正文前出现一颗评论钮（新部件 `comment-trigger`，由组件铺），点它报出 `comment-request`，detail 为 `{ side, line, change, text }`；一组钮只占一个 Tab 位，上下方向键在组内走，Home / End 到首末。指针设备上钮平时透明，悬停到这一行或焦点进了视口时显出来。root 带 `data-commentable`。
  - 新增 `commentLines`（写 `{ side, line }`）：这些行在代码下方、同一个格里铺出评论容器（新部件 `comment-thread`），内容由作者写——Vue 用 `XhDiffViewBody` 的 `comment` 插槽，React 用 `XhDiffViewBody` 的 `renderComment`，Web Components 监听 `comment-mount`（detail 带 `element`）。单栏里删除行落旧侧、其余落新侧，并排按所在的那一侧。
  - 新增类型 `DiffViewLineRef`、`DiffViewCommentRequestDetails`；API 新增 `commentable`、`commentRefAt`、`hasComment`、`getCommentTriggerProps`、`getCommentThreadProps`；文案新增 `commentOn(line, side)`。
  - 外观槽：`--xh-diff-view-comment-col`、`--xh-diff-view-comment-trigger-{radius,fg}`、`--xh-diff-view-comment-trigger-icon-size`、`--xh-diff-view-comment-thread-{max-w,my,p,border,radius,bg,fg}`。

- 6ec16fd: Drawer 新增 `resizable`：新增 `resize-trigger` 部件（`XhDrawerResizeTrigger`，role=separator），落在朝向页面的那条边上，拖动它或聚焦后用方向键推面板厚度（Shift 大步、Home / End 推到上下限），推向页面那一侧变厚，从右往左排版时把手与方向一起翻。厚度夹在 `minPanelSize`（缺省 160）与 `maxPanelSize` 之间且不超出视口或所在容器；`panelSize` / `defaultPanelSize` / `onPanelSizeChange`（Vue 另有 `v-model:panel-size`，Web Components 派发 `panel-size-change`）走受控与非受控，没调过时按 `size` 档绘制。拖动复用对话框机器里的指针会话，步长与 Resizable 同一档；调过的厚度写进 content 的私有槽，压过 size 档。`DrawerTranslations` 新增 `resizeTrigger`，`DrawerApi` 新增 `panelSize` 与 `resizing`。
- 2315792: EmptyState 的开幕只在出现时播放。

  - 随页面首屏就在的空状态直接呈现：页面加载完成之前挂上的、服务端渲染后水合的，图标、标题、说明、操作五个部件投影 `data-instant`，不播开幕。筛选、删除或新数据带来的出现（页面加载完成之后挂上），以及 root 从 `hidden` 恢复显示，照常依次开幕；首屏那一份第一次收起之后，此后每次显出都开幕。
  - 新增 `emptyStateMachine`、`EmptyStateSchema`、`EmptyStateRefs`；`connectEmptyState(props, normalize)` 改为 `connectEmptyState(service, normalize)`，与其余带状态机的组件一致。
  - React 的 `EmptyStateContext` 新增 `rootRef`，自行渲染根节点时要把它接到根元素上。
  - 皮肤的开幕关键帧改写在 `:not([data-instant])` 下。

- 3b806b0: FieldArray 的行增删与移动有进退场：首次渲染时已有的行直接呈现，新增的行以 `xh-item-in` 进场，删掉的行由替身在原处以 `xh-fade-out` 淡出（替身里的控件摘掉 id 与表单名，不进表单提交），上移、下移与增删带来的换位沿 `translate` 过渡滑到新位置。行照常按 `items` 渲染、删掉即卸载，写法不变。root 部件在列表动效接上之前投影 `data-instant`，并改为定位元素。
- 6c896a5: FileUpload 的三颗钮改接 Action Control 家族，不再各自手绘：
  - 「选择文件」`trigger` 投影 text 档 `outline`、md：静息描边、悬停白底承载 100、按下 200 与 0.97 按压、焦点环与禁用面由家族给，不再悬停抬 raised 影（`--xh-file-upload-trigger-shadow-hover` 仍可自行加影）；字号改随家族 md 档，新增 `--xh-file-upload-trigger-font-weight`。
  - 逐条删除 `item-delete-trigger` 投影 icon 档 `ghost`、xs：悬停 100 / 按下 200，悬停与按下时字换危险色；钮里的兜底叉按 xs 钮的字形尺画（`--xh-glyph-size-sm`），此前随文字号。
  - 清空 `clear-trigger` 投影 text 档 `ghost`、sm：字号改随家族 sm 档（此前是说明字号），空列表时三态前景一起压淡。
    此前三颗钮悬停落 200、按下落 300，白底承载面上高了一档。
- d611556: Flex 的 `orientation`、`align`、`justify`、`gap` 接受断点对象 `{ base, sm, md, lg, xl }`，与 Grid 同一套档位按视口逐档接管，逐档落 `data-orientation-<档>` / `data-align-<档>` / `data-justify-<档>` / `data-gap-<档>`；Web Components 在特性上写 JSON 对象，写坏了当没写。换档时交叉轴的缺省对齐跟着当档的方向走（竖排拉伸、横排居中），作者显式写的对齐不被换掉：皮肤改由两个私有槽承载对齐，计算结果与此前一致。Headless 新增 `FlexBreakpoint`、`FlexByBreakpoint`、`FlexResponsive`、`FlexTierName`、`FLEX_TIER_NAMES` 与 `normalizeFlexTier`。flex.css 的体积基线随逐档规则上调。
- 4915299: FloatButton 在 liquid 档下把触发器与展开组里的动作结成液态组：展开时动作从触发器里分离，收起时融回，融回落定后展开组才带 `hidden`，其间 `inert`；状态机新增上下文 `merging` 与 refs `liquidGroup`。展开组投影 `data-xh-liquid`，缺省 outline 的触发器与原生动作项在组里只留前景与磨砂，底色、细线、亮边与投影由色块层沿整组外形画；`--xh-float-button-shadow` 接到整组的投影上。
- 162dbd7: FloatButton 展开列表补上收起退场：标准档下条目逆着冒出的次序逐条缩回（`xh-pop-out`，离触发器最远的先走，错开封顶 4 步），列表等它们播完才藏起（此前一收起就硬消失）；退场途中不接指针。液态档照旧由液态组融回；减弱动效下两档都只剩一段淡出，播完藏起。
- 5b2d09a: Form 错误摘要补上退场：改完最后一处错误或重置时，摘要先淡出（途中仍占位、不可交互，条目与条数停在撤下之前那一版），播完才藏起，下方字段不再在打字时瞬间上跳。摘要的 `data-state` 改为跟摘要自身的显隐走（露面 `invalid`，撤下与退场途中 `idle`）。

  `FormApi` 新增 `summaryErrors` / `summaryErrorNames` / `summaryErrorCount` / `getSummaryError`：摘要此刻画的那版错误表；Vue / React 的摘要与摘要条目插槽参数改读它。Web Components 的摘要与条目显隐改照连接层给的 `hidden`。

- 1d51e7f: 新增 `funnel-chart` 漏斗图：看一个流程里各阶段的保留量与逐级转化率。

  - 每行数据一个阶段（`nameField` / `valueField`），按先后排好；宽度与数值成正比。`shape` 取 `trapezoid`（上下两边接着相邻阶段）或 `bar`，`align` 取 `center` / `start`，`direction="up"` 画成金字塔。
  - 颜色取有序色阶，第一阶段最深、逐级变浅，没有图例，阶段名直接标在阶段上；`palette` 换色相。标签缺省 `outside` 跟在各阶段右边，`inside` 写在阶段里（描一圈承载面色，放不下时写到外侧）。
  - `conversion` 取 `previous` / `first` / `none`：转化率写在左侧、落在相邻阶段的交界处；递增的阶段写成大于 100%。隐藏的阶段不画，转化率跳过它重算。
  - 每个阶段是带可及名的 `graphics-symbol`；摘要写首尾、总转化率与流失最多的一步，数据表四列。上下键跟着画面走，金字塔里对调。负值报 `chart.negative-share`。

- c221a15: GraphChart 新增三项：

  - `layout="preset"` 按节点上写的 `x` / `y` 摆放，整体等比缩放进绘图区；有节点缺有限数的坐标时报 `chart.graph-shape`。
  - 连线可写 `label`：画在两端圆心连线的中点（新部件 `link-label`，描一圈承载面色），和节点或名字压住、越出绘图区时不写；数据表多一列关系（新文案 `translations.linkLabel`）。
  - 画布视图可受控：`view` / `defaultView` / `onViewChange`（Vue `v-model:view`，事件 `view-change`），几张图接同一份视图即同步平移缩放；`zoom` 关着时视图不生效。新增类型 `GraphViewChangeDetails`。

  Web Components 侧原先读此刻视图的 `view` getter 改名为 `currentView`，`view` 成为受控的 JS property。

- c292b0f: 新增 `graph-chart` 关系图：看实体之间的连接关系、聚类与层级结构。

  - 数据是节点（`id` / `name` / `group` / `value`）与连线（`source` / `target` / `value`）。节点重复、端点不存在、自环，或树布局下数据不是一棵树，报新的诊断码 `chart.graph-shape`；多于 500 个节点按提醒报新的 `chart.graph-size`，多于 2000 个报错不画。
  - `layout` 取 `force`（缺省，同步跑到收敛，同样的数据得到同样的布局）、`circular`（按分组等角排在圆上）、`tree`（根在最左）、`radial-tree`（根在圆心）；`root` 指定树的根。
  - 节点按分组分配分类色，`value` 经平方根比例尺定面积，连线的 `value` 定粗细，`directed` 画箭头。名字先量再放，互相压住时连线多的节点先放。
  - 悬停节点时它、邻居与连着它的线留着、线换成它的颜色；方向键朝那个方向 45° 锥形里找最近的节点，Home / End 到阅读序的头尾。
  - 力导布局下可以拖动节点（`draggableNodes`，缺省开；不叫 `draggable`，那是 HTML 的原生属性），松手后模拟冷却到收敛；`zoom` 打开平移缩放（Ctrl / ⌘ 加滚轮、拖动空白处、+ / − / 0 键），`api.zoomBy` / `api.resetView` 供外部调用。

- 953239b: GridList 的加载态按占位态的两种相位画：

  - 还没有行、正在取：`loading` 占位投影 `data-xh-loading-ring` 与 `data-loading`，一枚加载环（加载环家族配方）排在文案之前，直径取尺寸档的图标档。
  - 已有行时重新取数：行保留上一帧、按 `micro` 淡到 `--xh-grid-list-row-loading-opacity`（缺省 `--xh-state-disabled-opacity`），取完淡回；此前是一刀切到禁用透明度。
  - 空态与加载态占位排版统一：字号与行内内衬随尺寸档与条目同档、文字取 `--xh-fg-muted`（此前 `--xh-fg-subtle`，那一档留给占位字与禁用标签）、块向内距 `--xh-space-3`；新增 `--xh-grid-list-state-gap` 管环与文案的间距。

- 4f83a46: GridList 的选中标记与 Table、Transfer 统一：同为「页内持久集合 + 行首勾选框」，选中行铺品牌淡底行面（`--xh-bg-brand-subtle` + `--xh-fg-on-brand-subtle`，悬停 20%、按下 28%），方框留作非颜色通道。此前选中行保持透明面、只靠方框表达，与另外两者是两套标记。

  - 新增组件槽 `--xh-grid-list-row-bg-selected`、`--xh-grid-list-row-fg-selected`，与 `--xh-table-row-bg-selected` / `--xh-transfer-item-bg-selected` 同位。
  - `row-selection-indicator` 投影 `data-xh-check-mark` 与 `data-xh-check-mark-profile="box"`，方框里的勾改由勾选标记配方画（与 Checkbox、Transfer、Table 同一副淡变与缩放），皮肤里复刻的那一份删掉。
  - 指针点过之后留下的高亮行（`data-highlighted` 而非 `:focus-visible`）面退回静息：未选中行透明、选中行回到选中面，指针移入仍按悬停那一档。

- 288b106: **新增** GridList 网格列表组件：提供可选择行、行主操作和独立行内按钮的 grid/row/gridcell 语义，支持单选、多选、方向键与连打检索；与 Sortable 组合后支持指针和键盘拖动。Vue、React 与 Web Components 三端同时可用。新增皮肤约 6 kB，包含容器、选择标记、行内动作与状态样式。
- 78fa54b: Grid 的每一格新增 `rowSpan`（Web Components 写在 item 节点的 `row-span` 属性上）：1 至 12 的整数，越界与非整数按没写算；与跨列一样接受断点对象 `{ base, sm, md, lg, xl }` 逐档书写，落 `data-row-span` 及逐档的 `data-row-span-<档>`。皮肤经私有槽 `--xh-_grid-row-span` 写 `grid-row-end: span N`，跨几行就占几条行轨道（连同中间的行间距）。Headless 新增 `GridRowSpan`、`GridRowSpanByBreakpoint`。grid.css 的体积基线随逐档规则上调。
- 65e4e09: **变更** Heatmap 并入图表家族，公开部件与键盘表不变：

  - 分档交给图表引擎的分档比例尺：档数给定时有数据的几档等宽分开（结果与原先相同），给了 `thresholds` 时按分界落档；`thresholds` 里有重复或不是有限数的值时剔除并报 `chart.invalid-range`（原先重复的分界会多出一档永远用不上的空档）。新导出 `normalizeHeatmapThresholds`。
  - `palette` 扩到基础色板的十二个色相加 `gray`：red / orange / amber / yellow / lime / green / teal / cyan / blue / indigo / purple / pink。满档取同名色相的 600 档，不再借用语气色——**视觉变化**：`green` / `blue` / `orange` / `red` 原先取 success / info / warning / danger 的 600 档，现在取 green / blue / orange / red 的 600 档；要回到语气色写 `tone`。
  - 详情条与对照条走 Chart 家族配方：详情条由反白改为与其余图表提示框同一副 frosted 材质、overlay 圆角与正文字号（**视觉变化**）；`--xh-heatmap-tooltip-bg` / `-fg` / `-border` 仍可覆盖颜色，`-py` / `-px` / `-radius` / `-shadow` 的缺省值随配方换成 frosted 那一套。
  - 文档分类从「数据展示」迁到「图表」，页面地址不变。

- cd094b8: Heatmap 新增发散色阶、连续色阶与按下事件：

  - 负数不再落进第 0 档：不写 `scale` 时数据里出现负数即按发散色阶，以 `midpoint`（缺省 0）为界，低于中点兑向负向色、高于中点兑向正向色，中点那一格取中性中点色。显式写 `scale="sequential"` 保留原来的口径。发散色阶取数据色的发散三色，组件槽 `--xh-heatmap-diverging-negative` / `-center` / `-positive` 可单独改写，`tone` 与 `palette` 在这一档不生效；打印时负向一侧的环改用点线。
  - 格子、详情与统计新增 `polarity`（`negative` / `positive` / null）与 `percent`，三张网格新增 `scale`；root 投影 `data-scale="diverging"`，格子与对照条投影 `data-polarity`。对照条从负向满档经中点排到正向满档：api 与插槽作用域新增 `legendItems`、`scaleMode`，WC 元素新增同名只读属性，legend-item 部件读取作者写的 `polarity` 属性；两端文字缺省改为两侧最远的数。新增导出 `heatmapLegendEntries`、`heatmapPlaceOf`。
  - `continuous`：着色按数值的确切比例，不按档位取整；档位、打印纹理与可访问名称照旧按档。
  - `onCellPress`（事件名 `cell-press`）：点击一格或焦点在格上按 Enter 时报告那一格，载荷与详情同源，与图表家族的 `onDatumPress` 同一口径；Space 不接，照常滚动页面。Vue 的 `useHeatmap` 追加第三个回调参数。

- ebccae5: Heatmap 悬停补上两处回执：详情条收起不再 `display: none`，与其余图表的提示框一样按家族配方淡入；详情条正在说的那一格投影 `data-highlighted`，描一圈正文色的粗线（新增覆盖槽 `--xh-heatmap-cell-border-highlighted`），扫过一片格子时看得出条说的是哪一格。
- 6ec7ac2: 热力图加上与其余图表同一套数据动效，新增 `animated` 属性（缺省开，Web Components 写 `animated="false"` 关闭）。

  - 首次出现：网格、星期名、月份名与对照条原样在场，有颜色的格子从空格底色填到自己的档位色，按日期先后（矩阵按列先后）一路扫过去。扫描取 `--xh-motion-duration-reveal`，每格的填色取 `--xh-motion-duration-enter`。数据晚于挂载到达（异步取数，或 Web Components 连上之后才赋 `value`）同样播这段填色，三个适配器一致。
  - 数据变化：各格从旧档的颜色过渡到新档，取 `--xh-motion-duration-morph` 与 `continuous` 曲线；只在这一段过渡，根上写 `data-animating`。格子原先常驻的 `background-color` 状态过渡随之撤掉，主题、语气与色板的换色改为一步到位，与其余图表一致。
  - 减弱动效或容器写了 `data-motion="reduce"`：不再逐格扫过去，各格一起淡变填色；数据变化直接换色。
  - 新关键帧 `xh-heatmap-fill` 随热力图皮肤自带；格子在填色途中带 `data-drawing` 与私有槽 `--xh-_chart-reveal-at`。

- 736adcf: 新增 `hierarchy-chart` 层级图：看层级数据中各部分的占比，并逐层下钻。

  - 数据是嵌套的树（`childrenField`），或扁平的行（`idField` / `parentField`）；只取叶子的值，上层是子孙之和，兄弟按值从大到小排。多根、父节点缺失、成环报 `chart.hierarchy-shape`，负值报 `chart.negative-share`。
  - `layout` 取 `treemap`（缺省，`tile` 取 `squarify` / `binary` / `slice-dice`）、`sunburst`、`icicle`（`orientation` 换方向）、`pack`；`depth`（缺省 2）是同时看得见的层数。
  - `colorBy` 取 `branch`（缺省：第一层分支按数据次序取分类色，后代向承载面混色变浅；多于 8 个分支报 `chart.too-many-series`）、`value`（顺序色阶，`palette` 换色相）或 `uniform`。标签先量再放，放不下的交给提示框与数据表。
  - 点有子节点的节点或按 Enter 下钻，Backspace 与旭日图中间的空洞上钻；下钻路径是一组 nav 语境的按钮。`rootKey` / `defaultRootKey` / `onRootKeyChange` 受控或记住下钻的位置，`api.drillTo` / `api.drillUp` 供外部调用。
  - 绘图区是 `role="tree"`，节点是带 `aria-level` / `aria-setsize` / `aria-posinset` / `aria-expanded` 的 treeitem；左右键在兄弟之间、上下键在父子之间走。数据表列出整棵树的路径、数值与占上一层的比例。

- fd0e9da: HierarchyChart 新增色阶图例：`colorBy="value"` 时每个看得见的层一条色阶（名字、低端的值、渐变条、高端的值），颜色在同一层里各自归一所以一层一条；下钻后跟着换，其余着色方式收起。新部件 `legend`、`legend-scale`、`legend-scale-name`、`legend-scale-bar`、`legend-scale-value`，`api.legendScales` 与类型 `HierarchyLegendScale`，新文案 `translations.levelLabel`；Vue / React 新增 `XhHierarchyChartLegend` 并铺进缺省结构，Web Components 作者可写 `<div data-xh-part="legend">`。新增槽 `--xh-hierarchy-chart-legend-gap`、`--xh-hierarchy-chart-legend-scale-gap`、`--xh-hierarchy-chart-legend-scale-width`、`--xh-hierarchy-chart-legend-scale-bar-radius`。

  新增语义令牌 `--xh-chart-legend-scale-width`（色阶渐变条的长度），CartesianChart 与 HierarchyChart 的同名组件槽都缺省指向它，数值不变。

- c699e05: ImageCropper 出图按所见生效，新增水平 / 垂直翻转。

  - 修复：出图原先直接 `drawImage` 裁切矩形，旋转不进导出图、`shape="round"` 也不裁成圆形。新增 `toCanvas(options?)`（Vue / React 插槽载荷、Web Components 元素方法）：裁切矩形、旋转、翻转与圆形外形一并生效，像素取自 image 部件；圆形裁成内切于裁切矩形的椭圆，椭圆外透明；旋转 90° 的倍数时画布宽高互换，其余角度为旋转后的外接矩形。纯函数 `cropToCanvas` 新增 `rotation` / `flip` / `shape` 三个选项，`width` / `height` 量的是旋转之前的那块内容。
  - 新增翻转：`flip` / `defaultFlip` / `onFlipChange`（`{ horizontal, vertical }`，Vue 走 `v-model:flip`，Web Components 属性写空格分隔的轴名 `flip="horizontal vertical"`，事件 `flip-change`），API `flip` / `setFlip()` / `toggleFlip(axis)`。翻转与缩放、旋转一样同时作用在图片与裁切框上，只改呈现，裁切矩形不变；拖动的位移换算同样拆掉翻转。
  - 新增部件 `flip-trigger`（`XhImageCropperFlipTrigger`，Web Components 作者节点写 `axis="horizontal|vertical"`）：原生按钮报 `aria-pressed`，接 Action Control text 档 sm、缺省 outline，翻着时为品牌淡底选中面，带按压通道。文案新增 `translations.flipHorizontal` / `translations.flipVertical`。
  - 方向键改为跟随屏幕方向：图片转了、翻了，框在屏幕上往哪边挪就按哪个键，旋转取最近的直角（此前按图片像素方向走，旋转 90° 后按右键框会往下走）。headless 新增 `screenStepToImage`、`sameCropFlip`、`IMAGE_CROPPER_NO_FLIP`，`CropProjection` 新增可选 `flip`。
  - Web Components 元素新增只读的 `currentFlip` 与 `setFlip()` / `toggleFlip()` / `toCanvas()` 方法。

- 23d878c: Image 载入改为交叉淡变：占位层（模糊小图、骨架）在图片载好或失败时原地淡出，图片在它底下直接落位，模糊小图的揭开不再被打断、中间不露一拍底色；没有占位层时图片照旧自己淡入。回退内容在图片载好时浮到图片之上淡出，播完才藏起。占位层与回退节点带上 scope 派生的 id；Web Components 的显隐改照连接层的 `hidden`。
- 5cc7978: `image-viewer` 在 `data-material="liquid"` 下：工具条、计数、翻页与关闭钮换成液态面，工具条与计数取胶囊形、叉取圆形；前景随墨色域在黑白之间切换，工具条里的钮悬停 / 按下取墨色淡底阶梯。定位层在非透明遮罩下声明 `data-xh-backdrop="dark"`，替被模态设成 inert 的遮罩告诉液态面身后是什么。工具条、计数与各钮带上部件 id。standard 档仍是那层深色纱。
- a99fab9: ImageViewer 的平移限定在范围内：按放大、旋转后的外接框超出视口的部分算，图比视口小时只能居中；拖出范围越拉越沉（80px 橡皮筋），松手硬弹簧回弹。单指快甩松手后图片顺着速度惯性滑行、逐渐停下，期间投影 `data-animating`；缩放钮、滚轮与旋转后平移收进新范围。状态机新增上下文 `settling` 与 refs `inertia`，`POINTERS.END` 带 `velocity` 与 `canceled`。
- 93beb41: 滑动指示器改量排布位、位置交给 transform。Segmented 的滑块沿 offsetParent 链量选中段相对根的位置，祖先带缩放（对话框进场）时不再跟着缩小偏位；段或根变尺寸、段增减、字体加载完成都会重量。皮肤以 `transform: translate()` 摆放滑块、只走合成，RTL 下由 `:dir(rtl)` 翻转位移。随之删除导出 `resolveSegmentedIndicator` 与类型 `SegmentedBox`，量测改用内部的共用几何。

  Tabs 的指示条同样改量排布位、位置交给 transform，与标签带平移的 translate 叠加而不互相覆盖；方向缺省从标签带现读，整页 RTL 而没传 `dir` 时不再落错。

  Anchor 的指示条同样改量排布位、位置交给 transform；连接层不再写内联的 `inset-*` 与尺寸，改写私有槽 `--xh-_anchor-indicator-x / -y / -w / -h`，皮肤按排布取主轴那两支；目录或链接变尺寸、链接增减、字体加载完成都会重量。

  NavigationMenu 的指示条同样改量排布位、位置交给 transform；连接层改写私有槽 `--xh-_navigation-menu-indicator-x / -y / -w / -h`，列表或入口变尺寸、入口增减、字体加载完成都会重量。

- 17f3523: InputGroup 不传尺寸时整组与单个字段同宽（新增覆盖槽 `--xh-input-group-w`，回退 `--xh-control-w`），组里带字段外壳的控件占满前后缀与动作之外的剩余宽度；此前整组宽 = 字段缺省宽再加前后缀，比同一列的字段宽一截。
- 0adceaa: JsonViewer 新增搜索：`search` 标出键名与值里含有搜索词的行（不区分大小写，收起的分支里也找得到），命中行投影 `data-match`，它们的祖先分支自动展开（写进展开集合，之后照常能收起），键名与值里命中的那一段铺成新部件 `mark`（品牌淡底 + 品牌深字，与 Highlight 的命中片段同一身份）。在命中之间逐个走：headless API `searchMatches` / `activeMatch` / `nextMatch()` / `prevMatch()` / `setActiveMatch()`，停住的那一行投影 `data-current`、命中片段换成品牌实心，并被滚进视野；强制色下命中片段画一圈正文色的框，停住的取系统高亮。Vue 新增 `toolbar` 插槽、React 新增 `toolbar`，渲染在根之前、载荷是这四样；Web Components 元素新增 `searchMatches` / `activeMatch` 只读属性与 `nextMatch()` / `prevMatch()` 方法。树容器新增 `id`（机器据此把停住的那一条滚进视野）。headless 另导出 `jsonSearch` / `jsonSearchQuery`。新增公开槽 `--xh-json-viewer-mark-bg` / `-fg` / `-radius` 与停住时的 `--xh-json-viewer-mark-bg-current` / `-fg-current`。Vue 的 `XhJsonViewerRoot` 写了工具条时渲染为片段，作者写在根上的 class 与属性仍落在根上。 皮肤涨在命中片段、停住的那一条与强制色下的三组规则上。
- d74d3d4: `layout` 的顶栏在 `headerFixed` 且 `data-material="liquid"` 时换成液态面：内容从它下面滚过时按下层换色调；贴边铺满、不取圆角，边界由下沿墨色细线承担。不吸顶的顶栏保持原样。顶栏带上部件 id。
- dcc6364: Layout 覆盖档侧栏收起改走退场档：位移、淡出与藏起同取 `--xh-motion-duration-exit` + `--xh-motion-ease-exit`，与 Drawer 的整幅滑出一致；推出仍走 `slide` 档。减弱动效下位移归零，只剩淡出。
- 1b0701c: `@xihan-ui/core/visual-environment` 新增液态组 `trackLiquidGoo(host, { source, members, domains })`：宿主的材质轴为 `liquid` 时，在宿主最前面插入装粘连滤镜的 `<svg>` 与一层装饰色块层（`aria-hidden`、不接指针），同组的块边缘相距约 15px 以内就连成一片；投影、底色、墨色细线与 1px 亮边都沿整组外形画，色调、通透档与光源方向跟源块走。`split(items, open)` 让块从源块中分离或融回，离源块近的先走、相邻两块错开交错步长，减弱动效下不播放。

  弹簧新增预设 `merge` 与令牌 `--xh-motion-spring-merge-stiffness / -damping`（320 / 24，超调 5.8%），供融合分离使用。液态层皮肤新增色块层与滤镜各段的填色规则，投影经私有槽 `--xh-_liquid-goo-shadow`，组件可在自己的宿主上接入使用者的投影槽。

- 7878927: liquid 档的双沿指示器：`data-material="liquid"` 下，Segmented、Tabs、Anchor、NavigationMenu 的指示器起始沿与结束沿各由一支弹簧驱动，去向那一侧用 `spring-lead`、另一侧用 `spring-trail`，移动中被拉长、停下时收回；拉伸比例写成私有槽 `--xh-_<组件>-indicator-stretch`，皮肤据此把块向压到不低于新令牌 `--xh-motion-scale-squash`（0.86，减弱档为 1）。新的点击从当前位置与速度改向；standard 档与减弱动效下直接落位。

  `@xihan-ui/core/visual-environment` 导出 `isLiquidMaterial(el)`：最近一层 `data-material` 声明为 `liquid` 时为真。

- ad0b9da: 液态面的按下形变：按住液态面时面朝手指鼓出、沿指向拉长、另一个方向压扁（不低于 `--xh-motion-scale-squash`），拖离时越拉越长、按越界衰减趋近上限；松手由 `spring-toggle` 带回原形。形变由 core 写成私有槽 `--xh-_liquid-deform`，FloatButton 触发器与 BackTop 的液态面拿它当 transform；减弱动效下不形变。
- f75c139: Listbox 的占位态按设计真源的占位态一节补齐：首次加载时 `loading` 部件在文案前转一枚加载环（连接层投影 `data-xh-loading-ring` 与 `data-loading`，环走加载环家族配方），此前只是一行静态文字；已有选项时后台刷新保留上一帧，条目与分组标题按 `micro` 淡到 `--xh-state-disabled-opacity`。空态、加载与分组标题的文字由 `--xh-fg-subtle` 改为次要文字 `--xh-fg-muted`，与浮层里的同类占位同档。皮肤补上 `family/motion.css` 的引入，单独引入时加载环照样转。
- 1ba659c: 加载环家族配方新增「压在动作钮上」一档：承载者投影 `data-xh-loading-ring="overlay"` 时，环居中压在钮上、不进排布，直径取钮的图标档；进入在途要等一个 `micro` 才起淡，不到一个 `micro` 就结束的短请求什么都不闪，退出在途不等、按 `micro` 淡出。
- efd6410: Log 新增 ANSI 着色、级别过滤与虚拟滚动接线：

  - ANSI 着色：行新增 `ansi`（Vue / React 传原文；Web Components 在行上写 `ansi` 属性、文字就是原文），按 SGR 拆成新部件 `segment`（Vue / React `XhLogSegment`）。八种前景色映射到语义色、可经 `--xh-log-ansi-<颜色>` 覆盖，粗体、暗淡、斜体、下划线各自生效；背景色、256 色的高位与真彩色不着色，其余转义去掉。新增导出 `parseAnsi`、`stripAnsi` 与类型 `LogAnsiColor`、`LogAnsiSegment`；API 新增 `getSegmentProps`。
  - 级别过滤：新增 `levels`，只显示所选级别的行，没写级别的行不受影响；API 新增 `isLevelVisible`。
  - 虚拟滚动：新增 `virtualizer`，接 Virtualizer 的 `collectionVirtualizer`；粘底改跟 Virtualizer 的视口与内容层，日志视口只定高、带 `data-virtualized`、不占 Tab 位。`content` 不再是必需部件（接虚拟滚动时行在 Virtualizer 的条目里）。
  - Virtualizer 的 `CollectionVirtualizer` 新增可选的 `getContentElement`，Virtualizer 交出的桥总带着它。

- 2f98025: `log` 的回到底部在 `data-material="liquid"` 下换成液态面：按下层换色调，按住时液面随手指形变；使用者的底、描边、前景与投影槽照常优先。standard 档不变。
- e842984: Marquee 新增暂停开关与暂停状态，悬停与聚焦暂停缺省开启。

  - 新增部件 `autoplay-trigger`（Vue / React `XhMarqueeAutoplayTrigger`，Web Components `data-xh-part="autoplay-trigger"`，须写为 `<button>`）：窗口行尾的单图标按钮，指针、键盘与触屏都能停住滚动（WCAG 2.2.2）。可及名随状态切换为下一步的动作（`Pause scrolling` / `Resume scrolling`），`data-state` 投影 `running` / `paused`；不给内容时皮肤画暂停 / 播放图标。减弱动效与打印下随轨道一起收起。
  - 暂停状态改由状态机持有：新增 `defaultPaused`、`translations`、`onPausedChange`（Vue `paused-change` 与 `update:paused`，Web Components `paused-change` 事件与 `setPaused()` 方法）；`paused` 变为受控属性，给了它，暂停开关只通知、由作者写回。新增导出 `marqueeMachine`、`MarqueeSchema`、`MarqueePausedChangeDetails`。
  - `connectMarquee(props, normalize)` 改为 `connectMarquee(service, normalize)`，与其余带状态机的组件一致；`MarqueeApi` 新增 `paused`、`setPaused` 与 `getAutoplayTriggerProps`。
  - `pauseOnHover` 缺省由关改为开，要关掉须显式写 `false`（Web Components 写 `pause-on-hover="false"`）。指针或焦点停在暂停开关上不计入悬停 / 聚焦暂停，按下「继续」即刻恢复滚动。
  - 皮肤新增覆盖槽 `--xh-marquee-trigger-inset`、`--xh-marquee-trigger-bg`、`--xh-marquee-trigger-bg-hover`、`--xh-marquee-trigger-bg-active`、`--xh-marquee-icon-size`；开关压在走动的内容上，底取不透明的面，悬停 / 按下走同一承载面的不透明阶梯。`marquee.css` 因开关的定位、面、图标与减弱动效 / 打印规则增至 6362 字节，并引入动作控件配方。

- 2ed6e2d: Marquee 新增 `fade`：窗口两端沿滚动方向渐隐，内容从一端淡入、从另一端淡出，根上投影 `data-fade`，渐隐段长由新公开槽 `--xh-marquee-fade-size`（缺省 `--xh-space-6`）调整。有暂停开关时行尾那一端淡到开关之前，开关所在那一块整块露出、不被淡掉；rtl 与竖排随方向翻转。减弱动效与打印时轨道停住、窗口改成可滚，两端不再淡。 皮肤涨在渐隐的遮罩层、开关留位与减弱动效 / 打印的撤销三组规则上；暂停开关的边长改由根上的同一支私有槽给出，与遮罩留出的位置同源，外观不变。
- dbec25e: BackTop、FloatButton（缺省 outline 档）、Carousel 控制钮、Log 与 MessageFeed 的回到底部改走材质家族配方：交互阶梯统一为悬停 / 按下换不透明淡底一档、二档、键盘聚焦铺 focus surface、带 1px 顶光——Log 与 MessageFeed 的回到底部此前悬停取半透明淡底、键盘聚焦时面变透明、没有顶光，现与其余浮动钮一致。`data-material="liquid"` 下的液态面由配方在同一组私有槽上换值，外观不变。
- 3869da2: 新增材质家族配方 `@xihan-ui/styles/material.css`：投影了 `data-xh-material="frosted"` 的部件从同一份配方取 frosted 面——描边、底、1px 顶光、前景、投影与背景滤镜，覆盖槽 `--xh-frosted-bg/-border/-fg/-shadow/-backdrop/-highlight`。Cascader、Combobox、ContextMenu、FloatingPanel、HoverCard、Mention、Menu、Menubar、Popconfirm、Popover、Select、TreeSelect 的内容面改由它画，组件原有的覆盖槽照常生效。Menu、Select 等 8 个列表浮层的 1px 顶光由伪元素改画在背景最上一层：列表滚动时不再跟着内容滚走。
- 146b646: Mention 支持多行正文：`input` 部件写 `as="textarea"`（Web Components 直接摆 `<textarea data-xh-part="input">`）即多行形态，撤掉单行才有的 `type`、`combobox` 角色与 `aria-expanded`，换 Field Chrome 的多行布局，上下内衬取 `--xh-mention-textarea-py`，只许纵向拉伸；候选收起时 Enter 照常换行。插入后的引用是一个整体：光标紧贴它时 Backspace（在其后）或 Delete（在其前）整条删掉、光标落回它的起点，在它内部改字即退回普通文字，光标停在插完的引用里不再弹候选。新增 `api.mentions`（三端插槽 / children 载荷同名，Web Components 为元素的 `mentions` 只读属性），列出正文里仍然完整的引用：值、文本、前缀与起止下标。
- 69e77be: Mention 的占位态按设计真源的占位态一节补齐：首次加载时 `loading` 部件在文案前转一枚加载环（连接层投影 `data-xh-loading-ring` 与 `data-loading`，环走加载环家族配方），此前只是一行静态文字；已有候选时后台刷新保留上一帧，候选按 `micro` 淡到 `--xh-state-disabled-opacity`，淡的是候选不是磨砂面。
- 3cc9c66: Menu、ContextMenu 与 Menubar 新增 CheckboxItem、RadioGroup、RadioItem 选择型条目，支持受控值、`aria-checked` 与逐条关闭策略。
- 8bf43a2: MessageFeed 首屏的历史消息不再逐条入场：条目到达的追踪接上之前 list 投影 `data-instant`（服务端渲染的首屏同样生效），接上时已在的消息各自带上 `data-instant` 直接呈现；之后新到的一批消息播进场，同一批按到达顺序错开（`--xh-_stagger-index`），不按它排在第几条。
- c9abec4: `message-feed` 的回到底部在 `data-material="liquid"` 下换成液态面：按下层换色调，按住时液面随手指形变；使用者的底、描边、前景与投影槽照常优先。standard 档不变。
- ab3c842: MessageFeed 新增部件 `pending-indicator`（Vue / React `XhMessageFeedPendingIndicator`，Web Components `data-xh-part="pending-indicator"`）：放在列表之后，已发送、等首个片段（`status` 为 `submitted`）时显示为一颗呼吸的圆点，首个片段到来即收起；对读屏隐藏，减弱动效下静止，打印时隐藏。
- b480c22: MessageFeed 新增按日期分隔与回到底部的未读数：

  - 新部件 `separator`（Vue / React `XhMessageFeedSeparator`）：与条目平级写在内容层里，显示「今天」「9 月 27 日」这类标注，两侧各一道内部分隔线，对读屏隐藏。API 新增 `getSeparatorProps`。
  - 新部件 `unread-count`（Vue / React `XhMessageFeedUnreadCount`）：放进回到底部按钮里；离开底部期间 `count` 的增量累加成未读条数，回到底部清零。插槽留空时显示条数（Web Components 由元素写入），没有未读时收起；只放入它时按钮上的向下字形照旧。条数写进按钮的可访问名，文案 `scrollToBottomUnread(count)` 可覆盖。API 新增 `unreadCount` 与 `getUnreadCountProps`。
  - 角标与分隔的外观槽：`--xh-message-feed-unread-count-{size,px,radius,bg,fg,font-size}`、`--xh-message-feed-separator-{gap,fg,font-size,line}`。

- d0b6dea: `family/motion.css` 新增七个共享关键帧，覆盖跨组件重复出现的动作：列表条目进场 `xh-item-in`、自上而下的显现 `xh-drop-in`、面板进退场 `xh-sheet-in` / `xh-sheet-out`、整幅滑入滑出 `xh-slide-in` / `xh-slide-out`（方向经 `--xh-_slide-from-x` / `--xh-_slide-from-y` 传入）、流光 `xh-shimmer`。`xh-spin` 与 `xh-countdown` 也收进同一文件，名字不变；`xh-spin` 改写独立的 `rotate` 属性，与元素自身的 `transform` 叠加。
- caa257c: 新增动效令牌 `--xh-motion-travel-opacity`：整幅位移起止两端的不透明度，缺省 1，减弱动效下 0。配套共享关键帧 `xh-slide-fade-in` / `xh-slide-fade-out` 与整幅滑入并列播放、时长取淡变档：缺省档两端都是不透明、看不出来，减弱动效下整幅位移归零，进出场改由这段淡变表达。

  Drawer 的进出场在整幅滑入旁并列 `xh-slide-fade-in` / `xh-slide-fade-out`：减弱动效下不再位移，改为 120ms 淡入淡出。

  Layout 覆盖档侧栏的整幅位移改取 `--xh-motion-travel`，减弱动效下不再位移：展开淡入、收起淡出，淡完才藏起；遮罩收起时的淡出改走退场档。

- f800e3f: NavigationMenu 面板里的条目可以再带一层子级。新增三个部件：`branch-trigger`（子级开关，原生按钮，`aria-expanded` / `aria-controls` 指向子级）、`branch-indicator`（开关行尾的展开箭头，展开时转向下方）与 `branch-content`（紧跟开关之后的子级容器，`role="group"`，收着时带 `hidden`、被 Tab 整段跳过）；Vue / React 对应导出 `XhNavigationMenuBranchTrigger`、`XhNavigationMenuBranchIndicator`、`XhNavigationMenuBranchContent`，Web Components 由作者用 `data-xh-part` 声明同名节点。

  - 同一张面板只展开一枝，点击或 Enter / Space 开合，焦点留在开关上；焦点在子级里按 Escape 只收起这一枝、焦点回到它的开关，再按一次才收起面板。
  - 每次展开面板都按当前页重新落定子级：`aria-current="page"` 的链接所在的那一枝展开，其余收起。
  - `NavigationMenuNode` 新增 `children`：只给 `collection` 不写结构时，入口的 `children` 铺成面板（`panel` 插槽 / `renderPanel` 仍优先），面板条目的 `children` 铺成一枝子级；子级里只放带 `href` 的链接。`value` 重复、`href` 与 `children` 并存、面板条目两者都没有、子级再往下嵌套都当场报错。`NavigationMenuNodeMeta` 相应多出 `children`。
  - 连接层新增 `getBranchTriggerProps` / `getBranchIndicatorProps` / `getBranchContentProps`、`branchValue` 与 `isBranchOpen`；按压通道的部件多了 `branch-trigger`。
  - 皮肤：开关与面板里的链接同一种行、读链接那一组槽（等高、行首对齐），展开不换面；子级缩进新增槽 `--xh-navigation-menu-branch-content-indent`（缺省 `--xh-space-4`），箭头盒 `--xh-navigation-menu-branch-indicator-size`（缺省指示符档），开关内间距 `--xh-navigation-menu-branch-trigger-gap`。子级不动高度、不播展开动画，只有箭头按 `nudge` 转向；rtl 下收着的箭头随书写方向指向行尾；强制色下箭头取开关按钮的系统前景（禁用取 GrayText），不随底色被换成 Canvas 而消失。`navigation-menu.css` 因此从 13.4 kB 涨到 16.6 kB（去注释压空白后）。

- 62caae4: Notification 的错开开幕改按到达顺序：同一批新到的卡片（同一轮同步调用里连发的几条）按到达先后写 `--xh-_stagger-index` 错开，不再按它在那一摞里排第几——一摞里已有 6 条时，新来的那条不必先等 5 个错开步长。页面载入时就在的卡片同样算第一批，照常进场。三端把作用域包装节点交给队列机器，条目到达的追踪挂在它上面。
- 5cd5206: Pagination 新增整组 `disabled`：翻页钮、页码与省略位都是原生 disabled（不可聚焦、不接指针与键盘、不进按压面），跳页输入框与每页条数下拉一并禁用，已摊开的省略位收起；当前页照常带 `aria-current`，皮肤把它退成淡底加禁用色，位置仍标得出。命令式 `setPage` 不受约束，`previousPage` / `nextPage` 照常报出。根上投影 `data-disabled`，connect 新增 `disabled`。

  新增 `first-trigger` / `last-trigger` 部件（Vue / React `XhPaginationFirstTrigger` / `XhPaginationLastTrigger`），按需放在上一页之前、下一页之后，一步跳到首页 / 末页，到头那一侧原生 disabled；可及名取 `translations.firstTrigger` / `translations.lastTrigger`（缺省 First page / Last page），不写内容时皮肤画双箭头，rtl 下对调。

  皮肤 pagination.css 涨在首页 / 末页钮并入格子骨架、双箭头兜底字形与禁用当前页的淡底上，体积基线随之重落。

- 549b39b: Pagination 行里的两个字段对齐字段规则：
  - 每页条数控制器（库内 Select）此前取字段缺省宽 16rem，在分页行里过宽；改为按内容定宽，新增 `--xh-pagination-page-size-select-w`（缺省 `max-content`），地板一并放开。
  - 跳页框此前是手绘字段：静息 surface 底 + `--xh-border-default`，悬停 `--xh-border-strong`，没有聚焦换边与校验失败态。改接字段家族：连接层投影 `data-xh-field-chrome`、`data-xh-field-size`、`data-variant="outline"` 与 `data-disabled`，静息透明底 + `--xh-border-control`、悬停升控件悬停边、聚焦换聚焦边加环、禁用面都由家族给；越界的页码按原生约束判校验失败，换失败边与失败环。新增 `--xh-pagination-jumper-bg-disabled`、`-jumper-border-focus`、`-jumper-border-invalid` 覆盖槽。
- 7e920ec: **新增** `pie-chart` 组件（饼图），Vue、React 与 Web Components 三端可用：一行数据一个扇区，缺省画成环形、中心显示合计。

  - 形态 `variant`（donut / pie）、半环 `sweep="half"`、玫瑰图 `rose`；扇区缺省按数值从大到小、自 12 点顺时针。
  - 超过 `maxSlices`（缺省 6）时最小的几块并成「其他」，取中性色，提示框列出被合并的各项。
  - 外侧标签带两段式引导线，两侧各排一列、推开避免重叠，放不下时去掉最小扇区的标签；也可以写在扇区里或不画。
  - 图例切换显隐后合计与占比重算，颜色不变；受控 `activeKey` 按扇区名与其他图联动。
  - 扇区是 `graphics-symbol`，绘图区只占一个 Tab 位，方向键顺时针走；根内生成视觉隐藏的摘要与数据表。
  - 扇区四角（实心饼含圆心一端）与柱的远端取同一档圆角：图表内核新增圆角度量，缺省 `--xh-shape-inset`，直角坐标图随之新增 `--xh-cartesian-chart-bar-radius` 覆盖槽。

- 65f29c4: Popconfirm 确认钮的异步挂起改接加载环家族配方：连接层投影 `data-xh-loading-ring="overlay"`，环压在确认钮正中、直径取钮的图标档，画法与 Spinner 环档一致（此前是排在文案之前的 1em、1px、无轨道小环，一挂起就占位转圈）。进入挂起等一个 `micro` 才起淡，确认文案随前景同刻淡出留位、钮宽不变；落定时不等，按 `micro` 交叉淡回。`--xh-popconfirm-loading-duration` 照旧控制转速。
- 4edea3b: **新增** Progress 在量（`semantics="meter"`）下的四样刻画，承担仪表盘与子弹图，三端可用：

  - `thresholds` 分段：升序上界 + 语气 + 名字，画成同族淡色的色带；当前值所在的分段决定填充色，`aria-valuetext` 补上分段名（模板 `translations.segmentValueText`）。
  - `target` 目标刻度、`scale` 量程刻度与刻度值（`{ ticks, format }`，按 `locale` 写）、`indicator="needle"` 仪表盘指针。
  - 线形加分段时画成子弹图：轨道加厚一档，填充收窄压在色带正中。
  - 新部件 threshold / target / scale / scale-tick / scale-label / needle；Web Components 侧由元素生成进作者写的外壳。
  - 在进度语义下写这些属性报新诊断码 `chart.meter-only`；分段或目标越界报 `chart.invalid-range`。
  - 新增组件槽 `--xh-progress-threshold-color`、`--xh-progress-target-color`、`--xh-progress-needle-color`。
  - 文档总览的「图表」分类加一张引用卡，指向进度条的仪表盘示例。

  **修复** 环形与仪表盘的填充被线形那套按比例的平移挪出画面、只剩轨道的问题。

  皮肤体积：`progress.css` 从约 4.6 KB 涨到约 10.6 KB（去注释压空白后），涨在色带、目标刻度、量程刻度、指针三套形态的规则与它们的强制色分支。

- 7bf67f9: Progress 线形新增三样外观：`steps` 把轨道切成等宽的格、填充按整格亮起（读屏仍报实际值）；`striped` 在填充上铺斜纹，进行中沿行向流动、完成与减弱动效下静止；`buffer` 在填充之后画第二段浅色填充，新增 `buffer` 部件（Web Components 由元素生成进 track）。三者只对线形生效，`buffer` 只属于进度语义；写错地方或 `steps` 取值不合法时报新诊断码 `progress.option-ignored` 并按没给处理。填充与缓冲都铺满轨道按比例平移，不动宽度。progress.css 随之增大约 2.3 kB（分段遮罩、条纹与缓冲段的规则，以及它们的减弱动效、强制色与打印分支）。
- 1c2108d: QuestionFlow 新增选项说明、题目说明与多选的数量要求：

  - 选项新增 `description`，写进新部件 `item-description`（Vue / React `XhQuestionFlowItemDescription`），排在选项之内另起一行、与文字左缘对齐，跟着选项名一起念。
  - 题目新增 `description`，写进新部件 `description`（Vue / React `XhQuestionFlowDescription`，留空时显示数据里的说明；Web Components 由元素写入），成为选项组的 `aria-describedby`；没有说明时该部件收起。
  - 多选题新增 `minSelections`（默认 1，选够之前继续键不可用，写了自由文本同样算作答）与 `maxSelections`（选满之后其余未选项转为 `aria-disabled`，程序化 `toggleOption` 守同一条上限）；选项组带 `data-at-max`。没写题目说明时，数量要求代填进去，文案取新增的 `translations.selectionRange(min, max)`。
  - 新增导出 `questionSelectionLimits` 与类型 `QuestionFlowSelectionLimits`；API 新增 `selectionLimitsOf`、`descriptionOf`、`getDescriptionProps`、`getItemDescriptionProps`。
  - 外观槽：`--xh-question-flow-description-{fg,font-size}`、`--xh-question-flow-item-description-{fg,font-size}`。

- 606ef8d: 新增 `radar-chart` 雷达图：比较少数几个实体在多个指标上的画像。

  - 每行数据一个实体（`nameField` 取实体名），`indicators` 列出 3–10 个指标，自 12 点方向顺时针排开；量程缺省每个指标自己的（`scale: 'independent'`，下限 0、上限取整），`shared` 全部指标共用，指标上可写 `min` / `max` 固定量程。量程按全部实体算，图例隐藏一个实体时其余形状不变。
  - 网格 `shape` 取 `polygon` / `circle`；轮廓 `curve` 取 `linear` / `catmull-rom`；`area` 控制系列色淡洗。缺失的值落在圆心、不画顶点。
  - 悬停按角度落到最近的指标轴并加粗成准线，提示框列出全部实体在这个指标上的值；键盘左右键沿顺时针走指标、上下键换实体。每个实体是 `graphics-object` 分组，每个顶点是带可及名的 `graphics-symbol`；摘要写每个实体最高与最低的指标，数据表每个实体一行、每个指标一列。
  - 入场从圆心张开，数据变化与图例切换在形状之间插值；强制色、打印与纹理模式下淡洗换纹理、轮廓换线型。
  - 新诊断码 `chart.indicator-count`（给了指标但个数不在 3–10 之间；还没给指标时按空态处理，自定义元素在脚本赋值之前连上也不误报）与 `chart.radar-overlap`（多于 3 个实体时按提醒报）。

- 893d36d: RadarChart 新增 `rings`（网格圈数 2–10，缺省 4，上限按圈数取整）与 `ringLabels`：在 12 点方向那根轴的右侧写出每一圈的数值，新部件 `ring-label`，只在各指标量程相同时写。新增槽 `--xh-radar-chart-ring-label-fg`、`--xh-radar-chart-ring-label-opacity`。
- c6c0717: RadioGroup 新增结构形态 `variant`（`list` 缺省 | `card`）与说明行部件 `item-description`；新增选择卡片家族配方。

  - `variant="card"` 把每个条目画成一张可点的描边卡（对应 Mantine Radio.Card、Carbon selectable tile），不新建组件：条目换成 Action Control row 档的 `outline` 形态并投影 `data-xh-choice-card`，根投影 `data-variant`。卡面由新配方 `family/choice-card.css`（子路径 `@xihan-ui/styles/choice-card.css`）给出：surface 圆角、内衬 space-3 / space-4、透明底 + `--xh-border-control`，白底承载阶梯悬停 100 → 按下 200 且不随语气染色；选中卡换「页内持久集合的选中」面（品牌淡底 12 → 20 → 28、前景 `--xh-fg-on-brand-subtle`，写了 `tone` 换语气淡底），描边不换，行首圆圈照常；只读不给悬停与按下面，强制色下选中卡描边换 Highlight，打印时选中卡描边加粗。竖排时卡片撑满一列，横排时各卡等分一行、放不下折行。
  - 新增部件 `item-description`（`XhRadioGroupItemDescription`）：文案下方的说明行，13 / `--xh-fg-muted`，与文案一起构成条目的可及名；`collection` 的节点新增 `description`，数据驱动时自动铺出这一行。列表形态的条目带了说明同样排成两行。
  - 新增组件槽 `--xh-radio-group-card-title-font-weight`、`--xh-radio-group-item-description-fg`、`--xh-radio-group-item-description-font-size`、`--xh-radio-group-item-description-fg-disabled`。
  - 设计真源登记 RadioGroup / CheckboxGroup 的 `list | card` 结构形态、选择卡片的部件归族、surface 形状与选中标记。

- 2f6e6b3: 新增 `sankey-chart` 桑基图：看流量从哪里来、到哪里去、在哪里流失。

  - 数据是流带（`links`：`source` / `target` / `value`），节点（`nodes`：`id` / `name` / `group`）缺省从流带推断。成环、自环、端点不存在或节点重复报新的诊断码 `chart.sankey-shape`，负值报 `chart.negative-share`。
  - `orientation` 取 `horizontal` / `vertical`；`nodeAlign` 取 `justify` / `start` / `end` / `center`；`nodeSort` 取 `auto` / `input`。节点厚度取 `--xh-sankey-chart-node-width`，同一列相邻节点至少隔一行字。
  - 节点按分组分配分类色（多于 8 组报 `chart.too-many-series`），有两组及以上时显示图例、按组显隐；流带缺省是半透明的中性色，`linkColor` 取 `source` / `target` / `gradient`。
  - 悬停节点时相连的流带换成它的颜色、其余淡出，提示框列出流入与流出的明细；悬停流带时写流量与它占两端的比例。名字写在列间的空当里，挤的时候只留放得下的。
  - 节点是带可及名的 `graphics-symbol`，流带不占焦点；上下键在同一列里走，左右键沿流向跨到相邻的列、取流量最大的相连节点（竖排时对调），Home / End 到头尾两列。数据表每条流带一行。

- f4f9912: MessageFeed 与 Log 的回到底部按钮补上退场：回到底部时 `data-state` 立即转 `hidden`、播完 `xh-pop-out` 才写 `hidden` 属性藏起（此前一回底就硬消失），退场途中不接指针。按钮新增 `id`，机器按它找节点、等浏览器实际起播的退场动画播完；没有可等的动画（例如没装皮肤）时即刻藏起。
- 8d29891: Select 的占位态按设计真源的占位态一节补齐：首次加载时 `loading` 部件在文案前转一枚加载环（连接层投影 `data-xh-loading-ring` 与 `data-loading`，环走加载环家族配方，直径取所在尺寸档的图标档），此前只是一行静态文字；已有选项时后台刷新保留上一帧，`list` 按 `micro` 淡到 `--xh-state-disabled-opacity`，数据到了再淡回。
- bf2d7f5: Select 多选标签行接上列表动效：取消选中的标签替身在行里淡出（标签行成为定位容器，替身裁在行内），其余标签从旧位置滑到新位置，新选中的标签播进场，首帧就在的直接呈现；此前增删都是瞬切、旁边的标签硬跳。
- 6ebc099: SideNav 折叠成图标栏后，只剩图标的入口（顶层叶子；`collapsedPopout` 关掉时也含顶层分支）悬停或聚焦时在行尾一侧显示名称提示。提示就是库内的 Tooltip：一台内嵌的 Tooltip 状态机按受控跑，悬停开延时、收起延时、接替窗口、提示组（含 `XhTooltipProvider` / `xh-tooltip-provider`）、定位、Escape 收起与反白外观都随 Tooltip，指针在两片叶子间挪动或焦点逐行移动时原地换锚、不重播进场；弹出分支不叠提示，平铺与折叠进行中不显示，折叠开关一翻即收。提示对读屏隐藏、行上不挂 `aria-describedby`，可及名仍由行文字承担。Headless 新增 `sideNavTooltipProps(service)`（喂给内嵌提示机的 props）、`findSideNavRowEl(service, value)`（提示锚点），`connectSideNav` 新增可选的第三个参数接内嵌提示机，api 新增 `tooltipText`、`getTooltipPositionerProps()` 与 `getTooltipContentProps()`（投影 tooltip 的 positioner 与 content）。Vue / React 新增 `XhSideNavTooltip`（放一个即可，自带定位层与 Portal）；Web Components 新增 `tooltip-positioner` 与 `tooltip` 两个角色（委派给 tooltip 的 scope）。side-nav.css 引入 tooltip.css，单独引入仍成立。
- dcade8f: SideNav 的分组改成合法的列表结构。原先 `group` 渲染成 `<li role="group" aria-labelledby>`，组内的 `item` / `branch` 直接挂在这个 li 里：外层 `<ul>` 的直接子节点多了一个 role=group（axe `list`），组内的 `<li>` 父节点又不是列表（axe `listitem`），读屏既念不出列表项数，也念不对分组。现在 `group` 仍是上一层列表里的一条 `<li>`，不再带 `role` 与 `aria-labelledby`；新增部件 `group-list`（`<ul>`），放在 `group-label` 之后，组内的行挂在它里面，由它以 `aria-labelledby` 指向组标题，读屏念作「标题 + 列表」。不写 `role="group"`：列表项的父节点只能是列表，把 role=group 挪到 ul 上同样会拆散组内的行。搜索时整组收起、折叠态的标题淡出与细分隔、方向键走位与成员收集都不变；新结构下标题与行的落位、宽度、间距与计算样式都与原来一致。

  - Headless：anatomy 新增 `group-list`；新增 `api.getGroupListProps({ value })`；`getGroupProps` 不再输出 `role` / `aria-labelledby`。
  - Vue / React：新增 `XhSideNavGroupList`（React 另有 `XhSideNavGroupListProps`），分组身份取自所在的 `XhSideNavGroup`，不用写 `value`；放在分组外直接报错。
  - Web Components：新增作者角色 `data-xh-part="group-list"`，分组身份认所在的 `group`。
  - 样式：`group-list` 与 `list`、`branch-content` 同一副列表排法（flex 纵排、`--xh-side-nav-gap`、无 UA 缩进与外边距），`--xh-side-nav-gap` 多了一个消费部件。

  迁移：在每个分组里，把 `group-label` 之后的条目包进一层 `group-list`。

  ```vue
  <XhSideNavGroup value="main">
    <XhSideNavGroupLabel value="main">常用</XhSideNavGroupLabel>
    <XhSideNavGroupList>
      <XhSideNavItem>…</XhSideNavItem>
      <XhSideNavBranch value="users">…</XhSideNavBranch>
    </XhSideNavGroupList>
  </XhSideNavGroup>
  ```

  React 写法同上（`<XhSideNavGroupList>` 包住组内的 `XhSideNavItem` / `XhSideNavBranch`）。Web Components：

  ```html
  <li data-xh-part="group" value="main">
    <div data-xh-part="group-label">常用</div>
    <ul data-xh-part="group-list">
      <li data-xh-part="item">…</li>
    </ul>
  </li>
  ```

  直接调 headless 的作者：分组 li 照旧取 `getGroupProps({ value, members })`，新加的 ul 取 `getGroupListProps({ value })`；依赖 `[data-part='group'][role='group']` 的自定义样式或测试改认 `[data-part='group-list']`。

- 04e2efc: SideNav 新增搜索过滤：放一个 `input` 部件（root 里、list 之前）即可输入即按 `filter`（缺省为标签大小写不敏感包含）过滤导航树，命中入口整枝留下、祖先保留并展开，没命中的列表项、分支整行整枝带 `hidden` 收起，分组的成员一个都没命中就整组收起；方向键只走剩下的行。搜索中的展开单独记，不改写 `expandedValue`、不发 `expanded-value-change`，清空检索词即回到原样。搜索框里下方向键或 Enter 进到剩下的第一行，Escape 先清空检索词；一条都没命中时新部件 `empty` 以 `role="status"` 露面，文案取新增的 `translations.noMatch`，搜索框可及名取 `translations.input`。折叠成图标栏时过滤暂停，搜索框留着高度、不可见也不可聚焦。搜索框走面板内嵌搜索的写法（投影 `data-xh-field-input`，只画一道取实体面分隔令牌的下划线），样式槽 `--xh-side-nav-input-*`、`--xh-side-nav-search-divider`、`--xh-side-nav-placeholder-fg` 与 `--xh-side-nav-empty-*`。新增 `api.inputValue` / `setInputValue` / `searching` / `empty` / `translations` 与 `getInputProps()` / `getEmptyProps()`；`getItemProps` 可带所包链接的 `value`、`getGroupProps` 可带成员 `members`，三端适配器自动收集。Vue / React 新增 `XhSideNavInput`、`XhSideNavEmpty` 与根上的 `filter`，插槽载荷多了 `inputValue` / `setInputValue` / `searching`；Web Components 新增 `input`、`empty` 角色、`filter` property、`inputValue` / `searching` 读口与 `setInputValue` 方法。TreeSelect 的树形检索裁剪改由与 SideNav 共用的一份实现承担，行为不变。side-nav.css 因搜索框、自动填充与空态的规则涨约 15%。
- 4c03c34: Sortable 放下后被拖项从松手处带着松手速度落进新位置，不再瞬间跳过去：放下时记下它的屏幕位置，宿主按新顺序重排提交之后量出差值，由弹簧收到零，期间投影 `data-animating`；宿主不接这次排序时照样收回原位。状态机新增上下文 `settle` 与 refs `drop`、`settle`，`POINTER.END` 带 `velocity`。
- 3469140: Sortable 支持跨列表拖放：写了同一个 `group` 的几个列表组成一组（每个列表另写组内不重复的 `listId`），条目能从一个列表拖进另一个列表并落在指定位置。

  - 指针：被拖项的中心进了组里别的列表，那个列表的根投影 `data-drop="inside"`，插入点及其后的项让出一格，末尾垫出同样大的一段让容器长高，落点线画在让出那一格的起始缘上；源列表里被拖项之后的各项合拢。中心落在列表之间的空白里时落点留在上一个列表。
  - 键盘：拿起后本轴方向键在列表内移动，另一条轴上的方向键在相邻列表间移动（竖排列表左右键、横排列表上下键，rtl 下竖排的左右键对调），Escape 取消。键盘表新增 `sortable.kbd.next-list` / `sortable.kbd.prev-list`。
  - 事件：落进别的列表时由源列表发一次 `transfer`（`onTransfer`），载荷 `{ id, fromList, toList, from, to, fromIds, toIds }` 给出两个列表各自的新顺序，写不写回归宿主；不写回时条目收回原位。入组时 `drag-end` 另带 `fromList` / `toList`。宿主接下转移后，落进来的那一项由目标列表从松手处以弹簧收进新位置。
  - 读屏：挪进别的列表时播报列表名、它在组里排第几与新位次，落下时播报落进了哪个列表；`translations` 新增 `movedToList` / `droppedInList`。列表名取列表容器的可及名（`aria-labelledby` 优先）。
  - 非法组合立即报错：写了 `group` 不写 `listId`、换行网格（`orientation="both"`）入组、组内 `listId` 重复。
  - `@xihan-ui/pointer` 新增跨列表插入的几何原语 `projectInsertion`、`insertionOffsets`、`insertionSlot`。
  - 高对比档里落点线改画系统高亮色，不再随底色一起消失。
  - Web Components：连接层写在角色节点上的内联样式改为「写过才撤」对账，下一帧不再给的一条会被撤掉，节点被作者挪进另一台同类宿主时由接管方撤掉前一台留下的位移；此前给 `undefined` 的内联样式会一直钉在节点上。

- 384f1f9: Sparkline 新增 `reference`：一条横贯的细虚线（新部件 `reference-line`），写一个数是目标或阈值，写 `mean` / `median` 按有值的点算出。纵向范围扩到把它包进来，摘要模型新增 `reference` 并在缺省摘要里读出；盈亏形态不画。新增槽 `--xh-sparkline-reference-color`，新增类型 `SparklineReference`。
- 648c368: **新增** `sparkline` 组件（迷你图），Vue、React 与 Web Components 三端可用：在文字、表格单元格或指标卡里一眼看到一组数的趋势形状。

  - 根是 `<svg role="img">`，可及名写在根上的 `aria-label`，`aria-describedby` 指向自动生成的摘要（点数、范围、末值、首末变化率）；不可聚焦，没有坐标轴、图例与提示框。
  - 形态 `variant`：line（缺省）/ area / bar / win-loss；win-loss 只看正负、柱等高，取涨跌色。
  - 标记点 `markers`：last（缺省）/ extremes / none；参考带 `band` 画出正常区间；`curve="monotone"` 平滑。
  - 缺省中性：线取弱化色、末点取品牌色相的分类色 1；写了 `tone` 整条取语气色。
  - 尺寸走组件槽 `--xh-sparkline-width`（缺省 6rem）与 `--xh-sparkline-height`（缺省一行字高）。
  - 首次出现描线、柱从基线长出，数据变化时插值；`animated` 可关，减弱动效下只淡入。
  - 诊断码新增 `chart.invalid-range`：区间两端不是有限数，或下界大于上界。

- deb0560: Spinner 新增 `delay`（毫秒，默认 0）：挂载后等够时长才露面，请求在这之前回来、转圈被卸掉时它从头到尾不出现。等待期间 root 投影 `data-state="hidden"`，皮肤以 `visibility: hidden` 藏起整块并保留位置、读屏读不到；露面后为 `data-state="visible"`，不再回到等待，等待途中把 `delay` 改成 0 即刻露面。

  破坏性（Headless）：Spinner 改由状态机驱动，新增 `spinnerMachine`、`SpinnerSchema`、`SpinnerState`，`connectSpinner(props, normalize)` 改为 `connectSpinner(service, normalize)`；`SpinnerApi` 新增 `visible`。直接调用 `connectSpinner` 的使用者先用 `spinnerMachine` 建 service 再接线。三个适配器的公开 props 只多了 `delay`。

- 8b5cb84: Splitter 面板折叠 / 展开（Enter、命令式）改为沿过渡让出空间，与 Layout 侧栏折叠同一种节奏：折叠途中根投影 `data-animating`，面板上浏览器实际起播的 `flex-basis` 过渡播完即撤下。拖拽、方向键步进与整份赋值跟手、不带过渡，并当场打断正在播的折叠。
- 1b7ad21: Steps 新增 `percent`（0–100，越界夹回）：当前这一步报出自己的完成比例，当前步的序号圆点外离一道缝画一圈进度环，从 12 点顺时针走（不随书写方向镜像），已完成那段取强调色、轨道取连接线的底色；环落在触发器的内衬里，不挤版面。比例变化时弧沿数值角色的时长走到新值，首帧直接落位；强制色下弧与轨道改取系统色，打印照原色印出。读屏：可操作时比例作为当前步触发器的描述读出（圆点对读屏隐藏，经 `aria-describedby` 供给「60% complete」），只读展示下当前步的圆点是一个 `progressbar`（`aria-valuenow` / `aria-valuetext`）。新增 `translations.progressLabel` 与 `progressValueText`、圆点的 `data-progress` 状态与覆盖槽 `--xh-steps-indicator-ring-track`。进度环只画在序号圆点上：点状形态给了 `percent`、或取值不是有限数时报新诊断码 `steps.option-ignored` 并按没给处理。
- 2cc5a3b: Steps 新增标记形态轴 `variant`：`number`（缺省，盛内容的序号圆点）与 `dot`（不盛内容的小圆点，只标位置，适合步数多或横向空间紧的流程）。点状形态的圆点是纯位置标记，直径走空间尺 sm / md / lg = 8 / 10 / 12px，不随密度换档；三态由形状区分：没走到的空心粗圈、走过的实心标记色、当前步实心品牌外加一圈同色环，四周留出环的位置、换步不挪版面，竖排连接线仍落在圆点中轴上。root 与 indicator 投影 `data-variant`，新增类型 `StepsVariant` 与覆盖槽 `--xh-steps-indicator-ring-bg` / `-ring-bg-disabled`；强制色下实心点与环改取系统色，打印时照原色印出。点状形态的 indicator 留空，走过的步不再画兜底对号。
- 3c6df6f: Steps 新增只读展示形态 `readOnly`（Web Components `read-only`）：只呈现进度，步骤不可点、不可聚焦、不发事件，也不置灰；语义从 tablist 换成有序列表（`list` / `listitem`，当前步 `aria-current="step"`），面板去掉 tabpanel 语义。`trigger` 不再投影 Action Control，只负责「序号 + 标题 + 说明」的排版：Vue / React 渲染为 `<div>`，Web Components 由作者写成 `<div>`；内距与可操作形态同一把尺，版面不跳。connect 新增 `readOnly`。
- 7ed31aa: 适配全局墨色（描边与淡底改为半透明墨色）：

  - 要盖住下层内容的面改取不透明档：Table 吸顶表头、冻结列头与各态行底（冻结单元格靠继承取行底）、Tabs 翻页钮的悬停与按下、FloatButton subtle / outline 的面、Carousel 翻页钮悬停与指示点、Avatar 与头像组溢出计数、Image 占位层、ImageCropper 把手与网格线、Heatmap 空格底（色阶两端之一，半透明会让整条色阶偏色）、Clipboard 自动填充遮罩。
  - 共边只画一次：Clipboard 复制钮、ButtonGroup 与 ToggleGroup 关掉分隔线时，后一段不再往回挪 1px 压住前一段的边，改为不画起始边，总尺寸不变。
  - Slider 与 ColorSlider 拇指的描边取 `--xh-border-default-opaque`，仍是一道把拇指与已选区间分开的浅框。
  - Toggle / ToggleGroup 选中且禁用时掺的中性面取不透明档；禁用的实心 Action Control 与 Tag 给面内墨色域的底色取不透明档（相对颜色语法选墨只看分量、不看透明度，半透明的禁用面会选反墨色）。

- 855064a: 实心 Action Control、实心 Tag 与 Tooltip 反白面把当前底色写进 `--xh-ink-surface`（禁用时换成禁用面），面内的快捷键、分隔、小徽标等作者内容取这块面的墨色，不再是一块不透明的灰；面自身外观不变。组件覆盖槽的清单随之记下背景槽同时喂给 `--xh-ink-surface`。
- 81c6f9a: 新增共享液态层 `@xihan-ui/styles/liquid.css`（已含在主入口）：`data-material="liquid"` 下为投影了 `data-xh-liquid` 的部件提供液态面的底、交互阶梯、1px 亮边与投影，亮边按光源方向落在朝光一侧，RTL 下缺省光源在右上。FloatButton 与 BackTop 的缺省 outline 触发器在该轴下换成液态面，覆盖槽照常生效；standard 档下外观不变。

  float-button.css 与 back-top.css 各加一块液态档规则（把 Action Control 的底、字、边、影与高光槽指向液态层，并声明背景滤镜），体积基线随之上调。

- c2ab8e6: Switch 提交中滑块里的环改接加载环家族配方：`thumb` 投影 `data-xh-loading-ring`，环画在滑块的 `::before` 上（此前在 `::after`，是 1px、无轨道的细环），画法与 Spinner 环档一致，起始边取强调色；提交开始与落定时按 `micro` 淡入淡出。`--xh-switch-loading-fg` 与 `--xh-switch-loading-duration` 照旧可用。
- 02f7394: Switch 的滑块可以拖：按住横向移动过 3px 即接管，滑块跟手，拖出两端越拉越沉（24px 橡皮筋）；松手按落点投影 0.06s，过中点即切换，滑块由弹簧带着松手速度落到那一端，期间投影 `data-dragging` / `data-animating`。纵向为主的划动留给页面滚动（轨道 `touch-action: pan-y`），不拖的点按照常切换，拖完浏览器补派的那次点击不会再切一次；RTL 下往左拖是打开。
- e4f4f97: Table 行换位落位与冻结列边界提示：

  - 行换位（拖放与 Alt + 方向键）提交之后，宿主按 `ids` 重排的那一次里，行按旧位置反向补偿、经 `translate` 过渡（`--xh-motion-duration-move` / `--xh-motion-ease-continuous`）滑到新位置，详情行随数据行一起走；此前在宿主重渲那一刻瞬移。减弱动效下即时落位。
  - 冻结列的边界提示：横向滚过之后，紧挨滚动区的冻结列（投影 `data-frozen-edge`）朝向滚动区的一侧出现一道 `--xh-border-default` 描边（新增组件槽 `--xh-table-frozen-edge`），只在确有内容被压住时出现——行首冻结列滚离起始端后、行尾冻结列没滚到末端时，按 `micro` 淡入淡出。`root` 以 `data-at-min-horizontal` / `data-at-max-horizontal` 报横向滚动贴着哪一端（没有冻结列或没量过时两端都算贴着）。新增类型 `TableScrollEdges`。

- 19aa36d: Table 表头下沿与表尾上沿是内部分隔，改取 `--xh-border-subtle`（新增覆盖槽 `--xh-table-header-border` / `--xh-table-footer-border`），与行间横线同档，外边才取 default；subtle 档补上透明占位边，与 outline 档同盒尺寸，换档不跳 1px。
- 93154c8: Table 新增单元格合并、表头分组，冻结列不再要求数字宽度：

  - `cellSpan`（与 antd 的 `spanMethod` 同一种写法）：逐格询问合并区的大小。起点格报 `aria-rowspan` / `aria-colspan`，横向合并的宽度按跨过的列相加；同一行被跨过的格子写 `hidden` 不渲染，下面行里被纵向跨过的在合并区最左那一列留占位（`data-covered`，对读屏隐藏、保住列宽）。纵向合并的起点格投影 `data-row-span`，挂载后按实测行位铺满合并的几行（高度写进私有槽，负外边距让回自己那一行）。合并遇到展开的详情行截断。新增 `cellSpanOf`。
  - 列定义新增 `children`：分组列只在表头占格、横跨它的叶子列（`data-group`），不进列号空间。新增 `headerRows` / `headerRowCount`，表头行按 `level` 逐层渲染（`getHeaderRowProps({ level })`、`getColumnHeaderProps({ value, level })`，Vue / React 的 `XhTableRow` 与 `XhTableColumnHeader` 新增 `level`，WC 在表头行上写 `level` 属性）；较浅的叶子列纵向跨到最后一行，数据行的行号与 `aria-rowcount` 把各层表头都算进去。示例「多级表头与表头分组」改为这种写法，不再手写行号与跨列数。
  - 冻结列的吸附偏移：数字宽度直接累加，其余取挂载后实测的列头宽度，不再从第一列没写数字宽度的列起一律贴边。
  - 机器新增挂载后的版面实测（只在有非数字宽度的冻结列、合并或分组时观察），适配器把 root 节点交给它；新增导出 `tableLeafColumns`、`tableColumnAncestors`、`buildTableHeaderRows`、`tableLayoutNeeds`、`measureTableLayout`、`sameTableLayout`、`TABLE_EMPTY_LAYOUT` 与相应类型。

  皮肤涨在纵向合并格、占位格与分组表头三组规则上。

- 5ce48f4: Table 树形表新增级联勾选，与 Tree 的 `cascade` 同一套算法：

  - `cascade`：行声明了 `parentId` 且 `selectionMode` 为 multiple 时生效。勾父行整枝传导，子行全勾上父行跟着勾中，勾了一部分的父行把手投影 `data-indeterminate` 画半选，禁用行的子树整棵冻结；级联下不接 Shift 范围选。
  - `checkedStrategy`：对外选中值的收敛策略，缺省 `child` 只收叶行，`parent` 收到最高整枝，`all` 收全部勾中的行。
  - 全选在级联下逐棵根整枝传导，基数是够得着的叶行，禁用子树不会被连带勾上。
  - 新增导出 `tableCascadeRoots`、`tableCascadeSelectableLeaves`、`tableCascades`。

- a49618c: Tabs 新增 `close-trigger` 部件（Vue / React `XhTabsCloseTrigger`）：紧跟在所属标签之后、与它平级，皮肤把它收进标签面的行尾，点按发出与 Delete / Backspace 相同的 `tab-close`，鼠标与触屏也能关标签；它接 Action Control icon 档 ghost 面、xs 档，对读屏隐藏、不占 Tab 位，`closable` 关闭时收起，标签禁用时留在原地但按不动。按 `collection` 铺开的缺省结构在 `closable` 下自动带上关闭钮。

  新增 `lazyMount` / `unmountOnExit`（语义对齐 Ark UI）：前者把面板内容推迟到对应标签第一次被选中才渲染，后者在标签被选走时卸掉面板内容；面板节点本身常在，`aria-controls` 始终指得到它。connect 新增 `isContentMounted(value)`。Web Components 的面板内容写在面板里的 `<template>` 中时，元素按挂载时机把模板克隆进面板或撤走克隆出的节点。

- d48dbf7: Tabs 放不下时可以在标签带行尾放一颗「更多」下拉：新增 `overflow-trigger` 部件（Vue / React `XhTabsOverflowTrigger`，Web Components 在 root 里、紧跟 list 之后写一颗空的 `<button data-xh-part="overflow-trigger">`）。标签带放不下时钮露面，点开是一张 Menu，列出此刻没有整个露在可见区里的标签（可见区扣掉两端显示着的翻页钮，半露的也列），选中一项即选中那个标签并把它挪进可见区；宽度够时钮收起。标签不会被收起，始终留在标签带与 tablist 里，下拉只是可见区外标签的索引，随标签带位移换项；钮的有无只取决于全部标签放不放得下，与翻页钮同进同退，不会因为钮自己挤窄了标签带而一直留着。

  - 键盘：钮在 tablist 之外、紧跟标签带自占一个 Tab 位，不是方向键走位的一站（方向键只在标签之间走、尽头回绕）；Enter / Space / ArrowDown 展开并落到首项，ArrowUp 落到末项，Escape 收起、焦点回到钮上，选中一项后菜单收起、焦点同样回到钮上。
  - 钮接 Action Control 的 icon 档、ghost 形态，与两端翻页钮同档、与标签同高；不写内容时皮肤画一枚横排三点，菜单开着时与悬停同档的中性面；竖排时排在标签带那一列的列尾、横贯列宽。可及名缺省 `More tabs`，由新增的 `translations.overflowTrigger` 换成本地文案。
  - headless：`TabsApi` 新增 `overflowItems` 与 `getOverflowTriggerProps()`，新增 `tabsOverflowMenuProps(service)`（喂给菜单的机器 props）与类型 `TabsOverflowItem`；`TabsTranslations` 新增 `overflowTrigger`。
  - core：新增 `overflowOutsideWindow` 与类型 `OverflowSpan`：滚动带里落在可见窗口之外的条目，与 `fitOverflowCount` 同一把舍入余量。
  - Web Components：`<xh-tabs>` 新增 `portalContainer` property；下拉的定位层、列表与条目由元素自己建，与工具条的「更多」菜单共用一套。

  皮肤 tabs.css 涨在「更多」钮一节：放了钮的 root 换成两轨网格（钮排在标签带之后、面板横跨两轨），钮的尺寸、兜底字形、打开态、竖排落位与打印时隐藏；另修竖排限了高时标签被压扁到一行字高的问题——标签保持控件高，放不下的那截靠位移露出。

- 21d79f9: Tag 关闭补上退场：点关闭钮后标签原地淡出（途中仍占位、不可交互），播完才写 `hidden`，不再瞬间消失。可关闭的标签根节点带上 scope 派生的稳定 `id`；Web Components 的显隐改照连接层给的 `hidden`。
- 9d0391e: TagGroup 接上列表动效：删掉一枚标签时替身在原处淡出、其余标签从旧位置滑到新位置，新加的标签播进场（同一批按到达顺序错开），首帧就在的标签直接呈现；此前增删都是瞬切、旁边的标签硬跳。退场替身不参与方向键、检索与摘除。tag-group.css 因进场、退场与换位三条规则涨约 0.6 kB。
- b74381e: 新增标签行家族配方 `@xihan-ui/styles/tag-list.css`：多选控件把已选值摆成一行标签时共用同一份排法——行只缩不涨、装不下的标签各自截断、+N 那一枚始终完整，新选中的原地弹出、取消选中的在原处淡出、其余滑到新位置。连接层在标签行上投影 `data-xh-tag-list`，行距经桥接槽 `--xh-tag-list-gap` 交给皮肤。Select 的标签行改接这份配方（`--xh-select-tag-list-gap` 照旧生效），外观与动效不变；Headless 里标签的取数与套 tag 的做法抽成共享模块，供 Combobox、TreeSelect、Cascader 复用。
- e09654b: TagsInput 的标签增删有进退场：首次渲染时已有的标签直接呈现，新落下的标签以 `xh-item-in` 进场、同一批按到达顺序错开，删掉的标签由替身在原处以 `xh-fade-out` 淡出，其余标签沿 `translate` 过渡滑到新位置。标签照常按值渲染、删掉即卸载，写法不变。control 部件在列表动效接上之前投影 `data-instant`，并改为定位元素（退场替身的定位基准）。
- f8fd317: 时间列里的格子按「候选与菜单」语境的集合行定高：TimePicker、TimeRangePicker 与 DatePicker、DateRangePicker 的时间格此前一律 28px（`--xh-overlay-column-item-h`）、不随尺寸档，DatePicker / DateRangePicker 的时间格字号固定说明档 13px；改为块向内距取所在尺寸档的 `--xh-list-option-py-*`、加一行正文行高撑开，字号随档，与 Select 等候选行同高同字号。`--xh-<c>-item-h` / `--xh-<c>-time-item-h` 仍可钉死高度（缺省不再钉），DatePicker 与 DateRangePicker 新增 `--xh-<c>-time-item-font-size`。TimeRangePicker 列的行内内衬保持不变。
- da90903: 新增加载环家族配方 `@xihan-ui/styles/loading-ring.css`：连接层在承载者上投影 `data-xh-loading-ring`，配方把它的 `::before` 画成与 Spinner 环档同一副加载环（一整圈 `--xh-border-default` 轨道、起始边取私有槽 `--xh-_loading-ring-fg`，缺省 `currentColor`），随同一部件上的 `data-loading` 淡入淡出、转与停；减弱动效与打印下停成点线环，强制色下轨道 `CanvasText`、起始边 `Highlight`。伪元素的有无与尺寸仍由皮肤给。

  Toast 接上这份配方：

  - 加载中不再转箭头字形，改画加载环，起始边取语气色（`--xh-toast-icon-fg`）。root 与 indicator 新增 `data-xh-loading-ring`。
  - 行首那一格叠两层：`::before` 是环，`::after` 是语气字形。加载落定时环停在当前角度淡出、语气字形淡入，同一格里交叉淡变（此前瞬换）；减弱动效下淡变照常。
  - indicator 的兜底字形按根上的 `data-tone` 换（此前按 indicator 自身的 `data-tone` 换，连接层不在 indicator 上发语气，四档都画成信息字形）。

- 984d31e: Toast 叠放的收拢比例令牌化：新增 `--xh-motion-scale-stack`（每往后一层保留的比例，缺省 0.95，减弱动效下为 1），后层按层深逐层收拢改由皮肤计算；减弱动效下层与层只靠位移分开，不再缩放。堆叠控制器只把层深写进私有槽，`--xh-toast-scale-collapsed` 回到作者覆盖槽的本分（此前由脚本写成内联样式，作者改不动）。`createToastStackController` 删去 `scaleFactor` 选项，要改收拢比例覆盖 `--xh-motion-scale-stack`。
- acbb2a3: ToolCall 与 Reasoning 首帧不播开合：挂载时已经展开或收起（含在跑时自动展开）的内容与箭头投影 `data-instant`，直接呈现；挂载后第一次开合（用户操作、自动开合、程序化或受控改写）起才按动效走。Reasoning 的标签与时长在「想完」那一下的整句替换淡入，也只在挂载后真的想完时播，首帧就已想完的直接呈现。
- 4920b59: Toolbar 放不下时可以把条目收进行尾的「更多」菜单：新增 `overflow-trigger` 部件（Vue / React `XhToolbarOverflowTrigger`，Web Components 在 root 末尾写一颗空的 `<button data-xh-part="overflow-trigger">`）。放了它的工具条不再折行，宽度不够时放不下的条目按文档序从尾部起收起，钮露面，点开是一张 Menu：菜单里的文字取条目的可及名，写了 `aria-pressed` 的开关条目是勾选项，工具条上的分组与分隔线在菜单里画成分隔线，选中一项即替收起的条目触发它自己的点击；全部放得下时钮收起。容器变宽变窄、条目增减或改写、字体加载后自动重算，焦点所在的条目被收起时焦点交给「更多」钮。没放钮的工具条照旧折行。

  - 键盘：「更多」钮是方向键走位的最后一站（End 落到它上面，收起的条目跳过）；横排时 ArrowDown / ArrowUp / Enter / Space 展开菜单，竖排时上下键仍归工具条走位；Escape 收起菜单、焦点回到钮上。工具条只接没被条目处理过的方向键：菜单触发器用上下键展开菜单时不再同时走位。
  - 钮接 Action Control 的 icon 档、ghost 形态，与条目同档；不写内容时皮肤画一枚横排三点，菜单开着时与悬停同档的中性面。可及名缺省 `More`，由新增的 `translations.overflowTrigger` 换成本地文案（Toolbar 新增 `translations` prop）。
  - headless：`ToolbarApi` 新增 `overflowItems` 与 `getOverflowTriggerProps()`，新增 `toolbarOverflowMenuProps(service)`（喂给菜单的机器 props）、`toolbarOverflowTriggerQuery` 与类型 `ToolbarOverflowItem`、`ToolbarRefs`；机器新增 `getRootEl` ref，适配器在挂载前交出 root 节点。
  - core：新增溢出收纳原语 `fitOverflowCount`、`measureOverflowLayout`、`trackOverflowLayout` 与类型 `OverflowAxis`、`OverflowLayout`、`MeasureOverflowOptions`、`TrackOverflowOptions`。
  - Web Components：`<xh-toolbar>` 新增 `translations` 与 `portalContainer` 两个 property；「更多」菜单的定位层、列表与条目由元素自己建。

  皮肤 toolbar.css 涨在收纳一节：放了钮的根不折行、条目不压缩，收起后多出的分隔线与收空的分组让开，组里留下的最后一段补回末端圆角，以及钮的兜底字形、打开态与收起规则，体积基线随之重落。

- 6accada: Tooltip 新增提示组与跟随鼠标。`XhTooltipProvider`（Vue / React）与 `<xh-tooltip-provider>` 容器元素（Web Components，`display: contents`）把子树里的提示放进同一组：组内共用接替窗口、同一时刻只开一个，不同组互不接替；组上的 `openDelay` / `closeDelay` / `skipDelayDuration` 作为组内提示的缺省，提示自己写的优先。Headless 导出 `createTooltipGroup` 与 `TooltipGroup` / `TooltipGroupOptions`，没放进 Provider 的提示归页面级的那一组。`followCursor` 让由指针打开的提示锚在指针落点上并随移动重新落位，触屏与键盘聚焦时锚回触发器；跟随中的定位层投影 `data-follow-cursor`，浮层本体不接指针。
- cf4e2ea: Tour 的说明文字字号新增使用者槽 `--xh-tour-description-font-size`（缺省仍取说明档 `--xh-text-secondary-size`），与标题、进度文字同一待遇；此前字号写死，作者改不动。
- feed42d: Transfer 的占位态按设计真源的占位态一节补齐：
  - 首次加载时 `loading` 部件在文案前转一枚加载环（连接层投影 `data-xh-loading-ring` 与 `data-loading`，环走加载环家族配方）。
  - 在途占位只接管这一侧的首次加载：这一侧已有看得见的条目时列表原样留着、按 `micro` 淡到 `--xh-state-disabled-opacity`，在途占位让位（此前不看有没有条目，一律与列表同屏）。
  - 空态、加载与分组标题的文字由 `--xh-fg-subtle` 改为次要文字 `--xh-fg-muted`。皮肤补上 `family/motion.css` 的引入，单独引入时加载环照样转。
- 3b3c8a8: Tree 新增节点级加载态与缩进参考线：

  - `loadingValue`：正在取子节点的分支，报告 `aria-busy` 并投影 `data-loading`，展开箭头换成转圈、不再按开合转向；减弱动效与打印下转圈停住，静止字形仍在。取数归作者，文档示例「异步加载子节点」改为这种写法，不再放占位行。
  - `lines`：缩进参考线，`tree` 部件投影 `data-lines`，皮肤在每一层子层的行首画一道竖线，落在父节点展开箭头的中线上、贯穿这一层的全部子孙；颜色取内部分隔线，公开槽 `--xh-tree-line-color`，强制色下取 `GrayText`。只是外观，不改结构与键盘。

  皮肤涨在参考线（含强制色）与转圈（含减弱动效与打印的停转）两组规则上。

- 89df97c: Tree 的整树加载态按占位态的两种相位画（节点级的 `loadingValue` 不变）：

  - 还没有节点、正在取：`loading` 占位投影 `data-xh-loading-ring` 与 `data-loading`，一枚加载环（加载环家族配方）排在文案之前，直径取尺寸档的图标档；此前只有一行静态文字。
  - 已有节点时重新取数：`tree` 部件投影 `data-loading`，行保留上一帧、按 `micro` 淡到 `--xh-tree-row-loading-opacity`（缺省 `--xh-state-disabled-opacity`）并不接指针，取完淡回，树框不淡；此前除 `aria-busy` 外没有任何可见反馈。
  - 空态与在途占位排版统一：字号与行内内衬随尺寸档与条目同档、文字取 `--xh-fg-muted`（此前 `--xh-fg-subtle`）、正文行高；新增 `--xh-tree-loading-gap` 管环与文案的间距。

- f389fbd: TreeSelect 多选的已选项在触发器里排成标签，与 Select 同一套呈现：新增 `tag-list` 部件与 `maxTagCount`（默认 3，其余合成 `+N`），标签与 +N 套库里的 tag、走标签行家族配方与列表动效；触发器外可放带删除钮的标签。新增 `api.tags` / `overflowCount` / `overflowText` / `deselect` 与文案 `translations.deleteItem` / `overflowTag`。Vue / React 的自动结构在 `multiple` 时直接铺出标签行，手写时用 `XhTreeSelectTagList`、`XhTreeSelectTag`、`XhTreeSelectTagLabel`、`XhTreeSelectOverflowTag`、`XhTreeSelectItemDeleteTrigger`；Web Components 用 `tag-list` / `tag` / `overflow-tag` / `item-delete-trigger` 角色并按元素的 `tags` 渲染，另补 `deselect` 方法。行距槽 `--xh-tree-select-tag-list-gap`。
- 252e7b4: TreeSelect 的占位态按设计真源的占位态一节补齐：
  - 整树首次加载时 `loading` 部件在文案前转一枚加载环（连接层投影 `data-xh-loading-ring` 与 `data-loading`，环走加载环家族配方），此前只是一行静态文字；已有节点时后台刷新保留上一帧，`tree` 按 `micro` 淡到 `--xh-state-disabled-opacity`。
  - 分支首次展开取子项的 `branch-loading`、`branch-empty`、`branch-error`、`branch-retry-trigger` 此前没有皮肤，补齐：三种占位落在子层的位置、与子层同一缩进，文字取材质的次要文字、字号随档；在途一枚加载环（`branch-loading` 同样投影 `data-xh-loading-ring` 与 `data-loading`），失败一枚取 `--xh-fg-danger` 的警示字形，重试钮排在说明之下、取品牌色，悬停出下划线。新增 `--xh-tree-select-branch-status-py`、`-branch-status-fg`、`-branch-status-font-size`、`-branch-error-fg`、`-branch-retry-fg` 覆盖槽。
- 3148b54: TreeSelect 新增浮层内搜索：`searchable` 打开 `input` 部件（放在 content 中、tree 之前），展开时焦点先落在搜索框上；输入即按 `filter`（缺省为标签大小写不敏感包含）把树裁到只剩命中节点，命中节点保留整棵子树、祖先自动展开，搜索中的展开单独记、不改写 `expandedValue`。手写的整棵树里没命中的节点由连接层带 `hidden` 收起，键盘导航只走命中的那几枝；无命中时空态改说新文案 `translations.noMatch`，搜索框可及名取 `translations.searchInput`。树里打可打印字符接到检索词末尾并把焦点交回搜索框，下方向键从框进树，Escape 先清空检索词，收起浮层即清空。新增 `api.searching` / `inputValue` / `setInputValue` 与 `getInputProps()`；Vue / React 新增 `XhTreeSelectInput`，自动结构在 `searchable` 时铺出搜索框；Web Components 新增 `searchable` 属性、`filter` property、`input` 角色、`searching` / `inputValue` 读口与 `setInputValue` 方法。样式槽 `--xh-tree-select-input-*` 与 `--xh-tree-select-search-divider`。浮层的滚动面从整块 content 改为 tree（与 Select 的 list 同一做法）：content 只作外壳，搜索框与底部操作区钉在树的上下沿不随行滚走，三端的自绘滚动条改接在树上。
- f4e3150: Tree 新增 `size` 轴（`sm` / `md` / `lg`，缺省 `md`），三端同名：root 投影 `data-size`，叶子行与分支行按同一档投影 `data-xh-collection-size`（此前固定 `md`）。走集合家族的尺寸档：行的块向内衬取 `--xh-list-option-py-*`、行内内衬 / 间距 / 字号取 `--xh-control-px-*` / `-gap-*` / `-font-*`、展开箭头与对号盒及拖拽把手取 `--xh-control-indicator-*`、层级缩进 sm / md / lg 为 `--xh-space-3` / `-4` / `-5`，行外字形随图标档。md 与此前逐项一致；行字号的缺省由 `--xh-text-body-size` 改为同值的 `--xh-control-font-md`。
- 0d07820: Truncate 的展开改由独立的 `trigger` 部件承担，并新增中间省略。

  破坏性：开了 `expandable` 后文字盒子（root）不再是按钮——不再带 `role="button"`、`tabindex`、`aria-expanded`，点文字与在文字上按 Enter / Space 都不再展开。展开交互移到文字盒子之后的一颗原生按钮上（Action Control 文字档，ghost、sm），`aria-controls` 指回文字盒子，真被裁了（或已铺开）才出现，否则 `hidden` 不占位；root 的 `data-state` 仍只在能展开时写。Vue / React 开了 `expandable` 时自动铺出这颗按钮，与文字盒子并排交给外层排版，透传属性落在文字盒子上（Vue 设 `inheritAttrs: false`）；按钮内容可由 Vue 的 `trigger` 插槽、React 的 `trigger` prop 换掉，载荷为 `{ open, triggerLabel }`。Web Components 需要作者写一个 `<button data-xh-part="trigger">` 与 root 并排：留空时元素按展开态写入缺省文案，写了内容原样保留。按钮文案走新增的 `translations`（`expand` / `collapse`，缺省 `Show more` / `Show less`），也接全局配置的 `truncate` 分桶。Headless 新增 `getTriggerProps`、`triggerLabel`，`TruncateTranslations` 新增两键，root 新增 `id`。

  新增：`position`（`end` | `middle`，默认 `end`）。`middle` 只对单行生效：真被裁且收着时 root 投影 `data-position="middle"` 与 `data-middle-text`（压好空白的整段文字），皮肤用两个伪元素各画一半——前一半末尾收省略号、后一半反向排露出结尾，原文照旧排着但不上色，溢出照它量、读屏照它念；强制色下退回末尾省略。新增导出类型 `TruncatePosition`（Vue / React 另导出 `TruncateTriggerSlotProps`）。truncate.css 的体积基线随中间省略与按钮规则上调。

- feb8c8b: Typography 行内文字新增 `strikethrough`、`underline`、`mark` 三个开关（Web Components 写在 `text` 节点上的同名布尔属性），投影 `data-strikethrough` / `data-underline` / `data-marked`，与 `variant`、`tone`、`weight` 叠加；删除线与下划线可并存。标记与文本高亮的命中片段同一副淡底、字色与跨行收边，写了 `tone` 时换成该族；强制色下改用系统高亮反色，打印时保留底色。新增组件槽 `--xh-typography-text-underline-offset`、`--xh-typography-mark-px`、`--xh-typography-mark-radius`、`--xh-typography-mark-bg`、`--xh-typography-mark-fg`。需要删除或标出的原生语义时把标签写成 `del` / `s` / `mark`。typography.css 的体积基线随这几条规则与强制色、打印两块上调。
- 4730ff9: 值类填充不再改变尺寸。Progress 线形的填充铺满轨道，按比例往行首平移、由轨道裁掉，进度变化只走合成，不重排也不重绘；不定进度改为固定宽度的一段平移往复。range 不再由连接层写内联 `inline-size`，改写私有槽 `--xh-_progress-value`（0–1 的比例），自带整套皮肤的使用方改为读这个槽。

  LoadingBar 的进度段同样铺满轨道、按比例平移，末端亮边随之落在露出的前端；range 改写私有槽 `--xh-_loading-bar-value`。减弱动效下作者写进 `--xh-loading-bar-speed` / `--xh-loading-bar-fade` 的时长不作数、退回令牌：平移立刻到位，收尾的淡出保留减弱档的 120ms。

  FileUpload 的传输进度条按同一方式推进，填充不再改宽度。

  Toast 与 Notification 的倒计时条不再缩宽度，改为裁切从行尾往行首收起（共享关键帧 `xh-countdown` 随之改写），RTL 下从左往右收；减弱动效下按秒分段走，段数由连接层写进私有槽 `--xh-_toast-progress-steps` / `--xh-_notification-progress-steps`。

  `loading-bar` 皮肤因补上 RTL 下的反向平移与减弱动效两段时长规则，体积由 1989 涨到 2377 字节（去注释压空白后），单份体积基线随之重落。

- a11a7ed: Virtualizer 新增三种滚动形态：

  - `scrollContainer: 'window'`：列表铺在页面里、随整页滚动。视口不再是滚动框（皮肤撤掉 overflow 与定高）、不占 Tab 位，投影 `data-scroll-container="window"`；列表在页面里的起点由内核现量，不必再算 `scrollMargin`。
  - 条目增删时钉住视口：视口里第一条按 `getItemKey` 给出的身份放回原处，往前插入条目时视口不跳。`anchor: 'end'` 另外从最新一条看起、贴底时内容再长也继续贴底，用户翻离底部就不再拽回；视口投影 `data-anchor="end"`，不足一屏时条目贴着底部排。写回滚动量时若内容层还没长高、被浏览器夹住，等内容层长高再补上。
  - `stickyIndices`：登记要钉在视口起点的条目（分组标题），滚过之后一直钉着、由下一个接替；条目外壳投影 `data-fixed`，按 `position: sticky` 留在文档流里，新增槽 `--xh-virtualizer-sticky-bg`。快照条目新增 `sticky` 字段。
  - 新增导出类型 `VirtualizerScrollContainer`、`VirtualizerAnchor`。

  皮肤涨在随整页滚动的视口、贴底排布、钉住标题的定位与实底，以及它在高对比档里补的系统描边上。

- 0edc0ba: Watermark 新增状态机 `watermarkMachine`，承载两件副作用；`connectWatermark` 随之改为 `connectWatermark(service, normalize)`，与其余组件同一种接法（原先的 `connectWatermark(props, normalize)` 不再保留）。

  - 防篡改：删掉水印的根节点会被原位放回，改写它的 `data-scope` / `data-part` / `data-state` / `data-fullscreen` 或内联的图样变量会被改回当下 props 算出的值；观察器由机器效应挂在根节点与它的父节点上，组件卸载时先撤，正常卸载不受影响。防的是直接动 DOM 的抹除，不是访问控制。
  - `image` 除 `data:image/` 内联图片外，也接受 http(s)、`blob:` 与相对路径的地址：按匿名跨域取回、画进 canvas 转成内联 PNG 再进图样，取回之前只印文字；跨域地址须带 `Access-Control-Allow-Origin`，否则拒载或 canvas 被污染，这张图不印并报一条诊断。`javascript:` 等其余协议一律不收。
  - 新增 `fullscreen`（三端同名）：印子固定铺满整个视口、压在模态与轻提示之上，根节点投影 `data-fullscreen` 且不再建层叠上下文；层号经 `--xh-watermark-layer` 覆盖，缺省取 `--xh-layer-tooltip`。

  皮肤 watermark.css 涨在全屏档的固定铺满与层号规则上，体积基线随之重落。

### Patch Changes

- e98cdd8: Action Control 家族配方三处修正，影响全部按钮形触发器：

  - 换面过渡补上字色：底色、描边与字色同一节奏淡变（micro），缩放单走释放时长。此前字色硬切、底色淡变，Pagination 换页、Toggle 实心切换、Clipboard 成功态等会先闪一拍字色。
  - outline 形态的禁用外边改取 `--xh-border-default`，与 Checkbox、Switch、字段的禁用边一致；此前取只作内部分隔的 `--xh-border-subtle`。
  - xs 视觉盒（含 field-inset sm）改走 `--xh-control-action-size`，field-inset 字形 xs / sm 改走 `--xh-control-indicator-sm` / `--xh-control-indicator-md`，随密度换档：compact 下 xs 视觉盒为 20px、field-inset 字形为 10 / 14px；comfortable 下 field-inset sm 字形由 14px 变为 16px。

- c915266: Anchor 指示条只在换节时滑：首次落位、同一节的重量（窗口缩放、换上正式字体、链接变高）直接到位，指示条投影 `data-instant`，不再拖尾或伸缩一下。
- b896ec3: Approval 判定落定时根的描边换色改走状态档 `--xh-motion-duration-micro` + `--xh-motion-ease-enter`，与别处悬停、选中、校验的换色同一拍（此前取进场档 `enter` + `enter-strong`，比同屏其他状态换色慢一截）。
- 55ab5ca: CalendarRangePicker（以及 DateRangePicker 内嵌的日历）挑到一半的区间预览改铺中性淡底，落定时淡变成品牌淡底；新增覆盖槽 `--xh-calendar-range-picker-range-preview-bg` 与预览中段格的悬停 / 按下槽，强制色下预览在轨道上下沿画虚线。
- e99ecb6: Carousel 粗指针下当前分页点的伸长改走 `move` 时长，与细指针同一档。
- 157af5d: Carousel：

  - `loop` 下从末页往后翻（或首页往前翻）不再把轨道倒着刷过全部页：轨道继续朝同一方向走一张，首屏（或末屏）的条目临时平移过去接住画面，过渡播完再无动画地归位到真实页（列表投影 `data-snapped`，直到下一次翻页）。按钮、键盘、自动播放与手势松手都走这条路径。
  - 自动播放按住（悬停、聚焦）时进度条回到起点，恢复后与计时器一起从头走满一整个间隔；此前进度条从暂停处续走、计时器却重计，两者对不上。
  - 当前分页点的伸长是尺寸变化，改走 `move` 时长。

- 3e8da55: Carousel 轨道的位移由内联 `transform: translateX(…)` 改为独立的 `translate` 属性（横排只写横向一支，竖排写 `0px <位移>`），过渡与拖拽、落定期间的 `will-change` 随之改到 `translate`。画面不变；在样式里给轨道写 `transform` 的作者，现在它会与位移叠加而不是被内联值盖掉。
- 6f483bc: Cascader 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，带进场的部件投影 `data-instant`、不再在页面载入时播一遍进场；第一次收起照常播退场，之后每一次打开照常进场。
- a97c866: Cascader 悬停展开不再闪：`expandTrigger: 'hover'` 下指针每扫过一个父项，子列换一批条目时都重播一遍淡入加 5 级错开。列的进场改为只在列头一次出现时播（浮层展开、此前收着的子列铺出来）；展开路径换到同列另一个父项时，连接层给露面的条目投影 `data-instant`，皮肤的进场写在 `:not([data-instant])` 下，换内容不重播。收起即归零，下次展开照常播。
- d56327b: Citation 引用编号展开预览时改用与悬停同档的中性面，不再铺品牌淡底（品牌淡底只表达选中 / 当前）；禁用时正文前景降到禁用色，不再整体降透明度。
- 1cb1f88: 关闭钮按身份统一：

  - ImageViewer 的叉是悬浮在媒体上的单图标动作，改走 Action Control floating 档 sm（40px、圆形），与翻页钮同一身份；此前 standard 档是 4px 方角、liquid 档才是圆形。
  - Citation 预览面里的收起钮改用控件圆角，与其它面板内的关闭钮一致。

- 2002322: 代码类面的缺省档与强调色对齐：

  - CodeView、DiffView 不写 `size` 时字号改为 md 档，与面内按钮同档（此前正文 sm、按钮 md）。
  - CodeView 行号槽的分隔线改用 `--xh-border-subtle`（内部分隔），与 DiffView 一致。
  - CodeView 高亮行改为中性淡底 + 行首强调条（`--xh-bg-subtle` + `--xh-border-strong`），不再用只表达选中的品牌淡底。
  - Log 行高缺省改走 `--xh-text-code-leading`（1.5rem），与 CodeView 同一把尺；按 `rows` 定高的视口随之变高，要维持原密度可写 `--xh-log-line-height: 1.25rem`。

- 0f3df11: 集合行尾的已选对号（Select、Listbox、Combobox、Cascader、TreeSelect、Tree）改为常驻在 indicator 列、按选中态以 opacity 淡变（`--xh-motion-duration-micro`），不再用 `visibility` 瞬切，与时间 / 日期面板里预设与时间格的对号同一种做法。Cascader、TreeSelect、Tree 的勾与半选杠叠成两层遮罩按状态换尺寸：离开半选淡出的那一段里横杠留着，淡出播完才换回勾。Cascader 搜索候选行尾的对号同样淡变。
- 4426f6e: 集合行家族配方的过渡补上不透明度，与换面同一节拍（`micro`）：集合在后台刷新时保留上一帧、条目淡下再淡回，不再硬切。
- f882b05: ColorPicker 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，带进场的部件投影 `data-instant`、不再在页面载入时播一遍进场；第一次收起照常播退场，之后每一次打开照常进场。
- 4333415: ColorSlider 的值气泡与 Slider 同一套：拖动时不再跟着拇指放大（按同一比例反向缩回、与拇指同一段过渡）；横排气泡改为起点 50% 加乘 `--xh-direction-sign` 的平移回中——此前两侧 inset 都钉在 50% 再靠自动外边距回中，可用宽度是 0，气泡从拇指中线起排、偏出半个自身宽。
- 52f89e3: Combobox 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，带进场的部件投影 `data-instant`、不再在页面载入时播一遍进场；第一次收起照常播退场，之后每一次打开照常进场。
- 452672e: Command 面板进场改为从上方落下：起点在终点之上一小段，与锚在面板顶缘的缩放同向（此前方向槽写反，面板从下方往上浮，位移与缩放方向相反）。
- 31a95f4: Command 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，带进场的部件投影 `data-instant`、不再在页面载入时播一遍进场；第一次收起照常播退场，之后每一次打开照常进场。
- cb2bddc: ContextMenu 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，带进场的部件投影 `data-instant`、不再在页面载入时播一遍进场；第一次收起照常播退场，之后每一次打开照常进场。
- 52b697a: 新增语义令牌 `--xh-control-input-min-w`（4rem）：字段盒里与已选标签并排的输入框的最小宽度，标签再多也给打字留出这一截。TagsInput 的输入框缺省最小宽改接它（`--xh-tags-input-input-min-w` 照旧可覆盖），取值不变。
- fa52b14: DateField（以及 DatePicker 的输入段）当前段的反白改为 `micro` 淡变换色，与 TimeField 一致。
- 67dbe4e: DatePicker 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，带进场的部件投影 `data-instant`、不再在页面载入时播一遍进场；第一次收起照常播退场，之后每一次打开照常进场。
- e7f4e2f: `date-picker` 手机档规则在 Safari 16.2 / 16.3 上恢复生效。

  皮肤里的手机档规则（浮层内衬收窄、时 / 分列的最小宽与内衬、时间项改用小号勾选指示符并贴边）此前写成媒体查询区间写法 `@media (width < 768px)`。区间写法要求 Safari 16.4，而浏览器硬底线是 Safari 16.2：16.2 与 16.3 把整条查询判作不成立，这些规则被静默丢弃，手机视口下面板仍取平板档的取值。

  现在改写成等价的 `@media not all and (min-width: 768px)`，断点仍是 `--xh-breakpoint-md`（768px），各档取值不变。覆盖槽的条件列随之显示为新写法。

- e6cf5a1: DateRangePicker 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，带进场的部件投影 `data-instant`、不再在页面载入时播一遍进场；第一次收起照常播退场，之后每一次打开照常进场。
- 97bd596: Dialog 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，content 与遮罩投影 `data-instant`、不再在页面载入时播一遍面板升起与遮罩淡入；第一次收起照常播退场，之后每一次打开照常进场。
- 7f0c61b: 新增 `--xh-direction-start` / `--xh-direction-end`：行内起始缘与末尾缘在水平方向上的位置（ltr 为 0% / 100%，rtl 反过来），与 `--xh-direction-sign` 同一个就近的 `dir`。Popover、HoverCard、Popconfirm 的缩放原点按它换算起止两端，不再用 `:dir()`（Chrome 120 / Safari 16.4 起才认，高于浏览器底线）；Spinner 三点档的 RTL 扫向改为按书写方向符号水平翻转；Truncate 的中间省略后一半改用末端对齐露出结尾，不再分书写方向各写一版。
- bd6a1da: Accordion、Collapsible、Reasoning、ToolCall 的展开内容不再挂 `will-change: grid-template-rows`：行高不可合成，提前声明换不来任何收益。
- 87af61e: Drawer 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，面板与遮罩投影 `data-instant`、不再在页面载入时整幅推入；第一次收起照常播退场，之后每一次打开照常推入。
- 093d9bf: 反馈三件套与卡片的排版对齐：Alert、Toast、Notification 的指示符字形到正文一律 12px（此前 20 / 10 / 12px）；Toast 标题行高改为 tight，与 Alert、Notification 一致；Card 标题行高由 relaxed 改为 tight，与其它面内标题同档。
- 76effa4: Field / Fieldset 的校验换色与错误文案补上动效：Field 标签与说明换色走 `--xh-motion-duration-micro`，与 Fieldset 组标题同一档；错误文案出现时淡入（`--xh-motion-duration-enter`），首帧就报错的直接呈现。收起的错误文案不再交给浏览器的 `display: none`，改成不可见、不进可及树、不占位的盒；Field 没有说明占着那一行时，收起的错误文案自己留在流里占住预留的一行（取代根上的 `::after` 占位），退场在这一行里淡出（`--xh-motion-duration-exit`），播完才藏起，外框高度前后不变。带说明的 Field 与 Fieldset 收起时那一行当场交还说明或收起，错误文案随即让位。
- e9cab76: FileUpload 的传输收尾与文件列表补上动效。传完那一刻进度条不再当场收起：填充先走满（move），随后整条淡出（exit，延后一个 move），淡出播完机器才让连接层给进度条写 `hidden`；行首对号在同一时刻淡入，与淡出的条子交叉。进度条的显隐改由连接层的 `hidden` 表达（没在传也没刚传完的一律 `hidden`），皮肤只按 `data-state='uploading'` 给不透明。填充的平移乘 `--xh-direction-sign`，撤掉 `:dir(rtl)` 分支。

  文件列表接上 core 的 `trackListMotion`：首帧就在的文件直接呈现（列表在动效接上之前带 `data-instant`），之后收下的一批按到达顺序错开进场，删掉的那一行由替身在原处淡出，其余行滑到新位置；列表晚于根挂上时，后来出现的条目照常进场。替身的 `data-state` 换成 `closed` 后，传完 / 失败的行首标记与失败配色从进度条的 `data-state` 读回，退场途中文件名不再往行首跳。

- 947d249: FloatButton 挂载时已展开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，展开组投影 `data-instant`、里面的动作不再在页面载入时逐条冒出；第一次收起照常逐条缩回，之后每一次展开照常冒出。
- 84d8e04: FloatButton 展开后触发器兜底的「+」转 45° 成「×」，收起转回（`--xh-motion-duration-nudge` + `enter-strong`，减弱动效下即刻到位），读得出再按一下就收起；此前展开后触发器仍是「+」。作者往触发器里塞了自己的图形时不转。展开列表的错开改为第五条起钉在第四级，与收起、与列表动效（`trackArrivals`）同一个封顶（此前展开最多错开 5 步、收起 4 步）。
- 32c2ee9: FloatingPanel 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，带进场的部件投影 `data-instant`、不再在页面载入时播一遍进场；第一次收起照常播退场，之后每一次打开照常进场。
- 9382c8f: FloatingPanel 进出最大化补上几何过渡：位置与尺寸按指示档（`--xh-motion-duration-move` + `continuous`）补过去，圆角同步收放，描边与投影淡去（此前位置尺寸瞬切，只有投影淡变，圆角与描边硬切）。只在这一段挂过渡：定位层投影 `data-animating`，过渡播完即撤，拖动与改尺寸照旧跟手；减弱动效下即刻到位；最小化与常规之间不补间。

  - 机器新增 context `windowAnimating` / `settledWindowState` 与事件 `WINDOW_STATE.SETTLED`。
  - 最大化时描边改为只撤颜色（`border-color: transparent`）、不撤宽度，进出时盒子不跳一像素。
  - 定位层的 `left` / `top` / `width` / `height` 过渡登记为布局动画例外。

- 2476e3a: 高对比档（`forced-colors: active`）里皮肤画的兜底字形不再消失。关闭钮的叉、翻页与展开箭头、选中对号、单选圆点、下载与播放暂停等字形都是伪元素上的一块底色（用 mask 挖出形状，或者就是一块 `currentColor` 实心点），这一档里底色被系统换成 Canvas，与所在的面同色，只剩空按钮。现在这些伪元素退出强制换色、直接写系统色，按身下那块面在这一档里的实际底色取值：

  - 按钮面上取 `ButtonText`，悬停与按下时按钮被涂成 `Highlight`，字形跟着换 `HighlightText`；禁用取 `GrayText`。
  - 集合条目上取 `CanvasText`，按下与没被键盘或指针高亮时的悬停条目被涂成 `Highlight`，字形换 `HighlightText`；禁用取 `GrayText`。
  - 字段里的下拉箭头、页面上的趋势与提示字形取 `CanvasText`；落在勾选盒实心面上的对号与圆点取 `CanvasText`。
  - Watermark 的印子改取 `GrayText`：印子是防泄露的标记，开了高对比也照印，深浅仍由图样自带的透明度压着。

  涉及 Accordion、Alert、Approval、BackTop、Breadcrumb、CalendarPicker、CalendarRangePicker、Carousel、Cascader、Checkbox、Citation、CodeView、Collapsible、ColorField、ColorSwatchPicker、Combobox、ContextMenu、DateField、DatePicker、DateRangePicker、Dialog、DiffView、DownloadTrigger、Drawer、Editable、FieldArray、FileUpload、FloatButton、FloatingPanel、ImageViewer、JsonViewer、Listbox、Log、Marquee、Menu、Menubar、MessageFeed、NavigationMenu、Notification、NumberField、Pagination、PasswordInput、Popover、PromptInput、QuestionFlow、Rating、Reasoning、Select、SideNav、Statistic、Steps、Table、Tabs、Tag、TagGroup、TagsInput、TextField、TimeField、TimePicker、TimeRangePicker、ToolCall、Toolbar、Tour、Transfer、Tree、TreeSelect、Watermark，以及勾选标记与菜单选择标记两份家族配方。只改高对比档，常态渲染不变；这几份皮肤的体积基线随补救块上调。

- 1d905ac: GridList 的多选标记与 Checkbox 对齐：未选中方框改为透明静息面，选中描边与填色使用同一语气色，勾形固定为方框边长的 75%。选中行不再额外铺品牌淡底或提前显示预置高亮；只有真实悬停、按下或键盘 `focus-visible` 才显示行级反馈。皮肤增加约 1.4 KB，来自 GridList 对选中、悬停、按下与真实键盘高亮的独立状态映射。
- 49fa706: HoverCard 卡片的缩放原点在交叉轴上按 placement 的对齐取：`*-start` / `*-end` 从与锚点齐平的那一端涨开（上下两侧 RTL 下起始缘在右），居中对齐仍从中线（此前交叉轴恒为 50%）。皮肤体积基线随之上调。
- e316d5f: HoverCard 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，带进场的部件投影 `data-instant`、不再在页面载入时播一遍进场；第一次收起照常播退场，之后每一次打开照常进场。
- cfca3d1: ImageViewer 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，带进场的部件投影 `data-instant`、不再在页面载入时播一遍进场；第一次收起照常播退场，之后每一次打开照常进场。
- c05abe3: ImageViewer 换图不再当着用户把旧图转回、缩回：取图期间（打开与换下标）图不挂变换过渡、不透明度为 0，换下标那一刻变换直接归位，旧图随即让位给视口里的占位面；新图取到之后按进场档（`--xh-motion-duration-enter` + `--xh-motion-ease-enter`）淡入（此前换图时平移、旋转、缩放补间回初值，然后新图直接露面）。
- 6ecdd56: ImageViewer 图片的平移、旋转与翻转缩放由一条内联 `transform` 拆成独立的 `translate`、`rotate`、`scale` 属性（作用顺序与原来一致，画面不变）；过渡与拖拽、惯性期间的 `will-change` 随之改写。
- 73a5d2f: 面板内嵌的搜索框（Command、Cascader、TreeSelect、Transfer、SideNav）聚焦不再画焦点环：插入符就是焦点指示，下划线也不换色。此前 `focus.css` 的键盘焦点环落在没有外壳的通栏一行上，框出一圈品牌色描边。
- e0e52a7: Layout 侧栏的首帧与跨过断点的开合直接落位：侧栏与遮罩投影 `data-instant`，挂载时就窄于断点的覆盖档侧栏不再先闪出展开面板、再播一段收起退场；视口跨过断点这类环境引起的宽度档与开合变化同样不走过渡。落位之后标记撤下，用户按把手、点遮罩、Escape 与 API 的开合照常过渡。
- fac9264: `layout` 的侧栏里放了 `side-nav` 时，侧栏内衬缺省为 0。

  `side-nav` 自带一圈内衬，展开与折叠宽度又与 `layout` 的侧栏同取侧栏令牌；此前侧栏再叠一圈 `space-3` 内衬，导航就比侧栏的内容盒宽出 24px，右缘被裁掉。现在侧栏检测到其中有 `side-nav` 根（三端都认，包括 Web Components 隔着 `<xh-side-nav>` 宿主的写法）时把内衬缺省归零，展开与折叠两档导航都正好铺满侧栏；覆盖档（`siderPresentation: 'sheet'`）同样归零，刘海与底部横条的安全区照旧保留。

  侧栏里 `side-nav` 以外的内容（如折叠把手）也随之贴边；需要留白时写 `--xh-layout-sider-padding`，槽优先于这条缺省。不认 `:has()` 的引擎（Firefox 121 以前）保持原来的内衬。

- 9dbe4fd: 液态档的色调翻转改为淡变：Layout 吸顶顶栏、Carousel 分页胶囊、ImageViewer 工具条与计数在下层深浅变化时，底色、字色、细线与投影一起走 micro 淡变，不再在同一帧翻转。
- b1e367a: Select、Combobox、TreeSelect 的候选面板与字段盒等宽：长选项在条目里截断，面板不再随最长的一条变宽到 `--xh-overlay-max-w`；字段盒比 `--xh-overlay-menu-min-w` 还窄时取这个下界，比可用区还宽时收成可用宽度。三者的下界与限高统一取列表档（`--xh-overlay-menu-min-w` / `--xh-overlay-menu-max-h`）。Select 与 TreeSelect 的浮层改锚在字段盒（control）上，面板左缘与盒子对齐，不再缩进一截内距；作者没写 control 时退回触发器。`--xh-<c>-content-max-w` 缺省改为不封顶，要封顶时显式写。
- 3fb3649: 按身份取令牌的两处订正（缺省主题下取值不变）：
  - 候选与菜单的集合行（Menu、ContextMenu、Menubar 的条目，Select、Combobox、Cascader、TreeSelect、Tree、Listbox、Command、Transfer、Mention 的行，日期与时间面板的预设项与时间格）圆角缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`：二者同为 4px，但行是嵌在面里的小块，主题单改 inset 时行跟着变、按钮与字段不动。
  - TimePicker、TimeRangePicker、DatePicker、DateRangePicker 是 floating 面板，面内的列间与分区分隔缺省由 `--xh-material-frosted-separator` 改为实体面的 `--xh-material-solid-separator`。
- 1204d90: LoadingBar 收尾先走满再淡出：`loading` 翻假后进入新相位 `complete`，进度段冲向 100 的平移真正播完才进 `finishing`；`finishing` 里满格先停一个 `--xh-motion-duration-micro` 再按淡出时长淡出，淡出播完才归零收起（此前冲满与淡出同一拍开始，填充 200ms、淡出 120ms，条子大约在八成处就看不见了）。

  - `LoadingBarPhase` 新增 `complete`，`data-state` 相应多出这一值；`finishing` 仍是淡出那一段。
  - 机器新增事件 `FILL.DONE`；进度段部件新增 `id`，机器按它等平移播完。已在满格、没渲染进度段或没装皮肤时直接进淡出。

- 17cd500: Clipboard 在减弱动效下复制在途时没有任何表达（圆环一直停在透明）：改为圆环不转、整圈换成虚线，延迟之后照常淡入，图标照常淡出。DownloadTrigger 同一处保留文字隐去与圆环淡入，只停转圈。
- e8319e8: Marquee 的速度按每秒像素数逐字成立：挂载后实测一份内容在滚动轴上的长度（随尺寸变化重量），连接层写成根上的内联私有槽 `--xh-_marquee-measured-span`，皮肤按它换算一圈的时长。此前长度取槽里的缺省值 600，位移却按轨道自身宽度算，同一个 `speed` 在 375px 窄窗约 38px/s、1200px 宽窗约 120px/s。使用者写了 `--xh-marquee-span` 仍以它为准。
- 74e5874: Menu、ContextMenu、Menubar 条目说明的缺省字号改为控件次级字号 `--xh-control-caption-md`，与同一行的快捷键、Select 等列表的说明同档；此前取 caption 令牌，同一行里出现两种次级字号。
- dc69845: Menu 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，带进场的部件投影 `data-instant`、不再在页面载入时播一遍进场；第一次收起照常播退场，之后每一次打开照常进场。
- db92826: Menubar 挂载时已展开某一张（`defaultValue`，或受控 `value` 初值不为空）时直接呈现，那一张 content 投影 `data-instant`、不再在页面载入时播一遍滑入；整条收起照常播退场，之后每一次展开照常进场，换张仍然瞬时。
- c60cbf8: 几何过渡改用专属的时长令牌：换位与尺寸变化取 `--xh-motion-duration-move`，紧跟操作的小幅几何变化取 `--xh-motion-duration-nudge`，内容展开收起取 `--xh-motion-duration-expand` / `--xh-motion-duration-collapse`，抽屉与轻提示的整幅位移取 `--xh-motion-travel`。基础时长与此前相同，以下几处有可见差异：

  - Accordion、Collapsible、Reasoning、ToolCall 的展开箭头随正文开合同档：收起 120ms、展开 200ms。
  - FileUpload 的上传进度条增长 200ms。
  - Progress 环形进度与 Rating 星级填充改走 `--xh-motion-ease-continuous` 曲线。
  - 减弱动效下，抽屉与轻提示的进退场不再整幅位移。

- 79bd762: 字段外壳、集合条目、InputGroup 与 ColorSlider 在减弱动效下不再关掉全部过渡：换色保留 120ms 的淡变，几何变化由令牌降到 1ms，与其余组件一致。
- 122077e: 动效口径复议落地：字段外壳的焦点环即时出现、即时撤下（描边与底色照常淡变），与其余焦点环同一节奏；行内横排的胶囊集合（TagsInput、TagGroup、Select 标签行）加入一枚改为原地弹出 `xh-pop-in`，不再竖向上浮、探出字段外壳底边。
- d60176f: NavigationMenu 挂载时已展开某一项（`defaultValue`，或受控 `value` 初值不为空）时直接呈现，那一项 content 投影 `data-instant`、不再在页面载入时播一遍弹出；展开项第一次变化起照常进退场。
- 0654f52: NavigationMenu 指示条只在换项时滑：首次落位、同一项的重量（窗口缩放、换上正式字体、入口变宽）直接到位，指示条投影 `data-instant`，不再拖尾或伸缩一下。
- e30a3ec: NavigationMenu 的面板与共享面板外壳按内容的自然宽度排开，不再被入口那一项压到最小宽、让一行放得下的链接文字折行；超过浮层最大宽（新增使用者槽 `--xh-navigation-menu-content-max-w`，缺省 `--xh-overlay-max-w-xl`）才折行。
- e950665: NavigationMenu 换张瞬时：在两张之间换时两侧 content 都投影 `data-instant`、不播进退场，与 Menubar 一致；用共享外壳（viewport）时不再新旧两张上下叠放、外壳先变高再塌回。外壳自己承担首开弹出与末收收回（投影 `data-state` / `data-instant`），外壳里的面板只随之淡入淡出。
- de98c70: Notification 的加载指示接上加载环家族配方：加载中不再转箭头字形，改画与 Spinner 环档同一副加载环（起始边取指示符的语气色）。item-indicator 新增 `data-xh-loading-ring` 与 `data-loading`；兜底的环与语气字形叠在同一格（`::before` 环、`::after` 字形），加载落定时环停在当前角度淡出、字形淡入。
- 25db668: Notification 增删卡片时其余卡片从旧位置过渡到新位置，不再整张跳位：

  - `trackListMotion` 新增 `depart` 选项（缺省 true）：传 false 时不放离场替身，只做到达与换位，给条目自己带退场、播完才收起的集合用；选项类型以 `TrackListMotionOptions` 导出。
  - Notification 的卡片改由它追踪（`depart: false`），皮肤给卡片补上 translate 的 move 过渡。

- 531fa5c: 新增语义令牌 `--xh-overlay-calendar-column-h`：与日历并排的时间列高度，与日历网格（周名一行加六周）同高、视口矮时退到中档滚动面高。DatePicker 的 `--xh-date-picker-time-column-h` 缺省改指向它，`--xh-date-picker-time-item-h` 缺省改指向既有的 `--xh-overlay-column-item-h`；两处取值不变。
- 665f0ab: `page-header` 在视口恰好 640px 时改按宽档排布。

  窄屏规则（标题区占满第二列、操作区换到下一行）此前写在 `@media (max-width: 640px)` 下：640px 本身也算窄档，而其余皮肤在 `min-width: 640px`（`--xh-breakpoint-sm`）就已换到宽档，同一宽度下页头与页面其余部分差一档。现在改写成 `@media not all and (min-width: 640px)`，639px 及以下仍是窄档，640px 起与其余组件同时换成宽档。

- 8618391: Pagination 摊开的页码面板归锚定列表：进退场改为 `xh-overlay-slide-in / out`，从省略位一侧短移淡入、不再缩放弹出。
- 23a1355: PasswordInput 强度条改为数值角色的动效：填充不再按 25 / 50 / 75 / 100% 改 `inline-size`、换档硬切，而是铺满轨道、按档位比例平移，由轨道圆角裁掉未完成的那一截（`--xh-motion-duration-move` / `--xh-motion-ease-continuous`，只走合成）；危险 → 警示 → 成功三段底色换档走 `--xh-motion-duration-micro` 淡变；平移乘 `--xh-direction-sign`，RTL 下从行首（右侧）长出。
- c49f9a9: Popconfirm 面板的缩放原点在交叉轴上按 placement 的对齐取：`*-start` / `*-end` 从与锚点齐平的那一端涨开（上下两侧 RTL 下起始缘在右），居中对齐仍从中线（此前交叉轴恒为 50%）。
- 16d130f: Popconfirm 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，content 投影 `data-instant`、不再在页面载入时播一遍弹出；第一次收起照常播退场，之后每一次打开照常进场。
- 4862ae6: Popover 面板的缩放原点在交叉轴上按 placement 的对齐取：`*-start` / `*-end` 从与锚点齐平的那一端涨开（上下两侧 RTL 下起始缘在右），居中对齐仍从中线（此前交叉轴恒为 50%，`bottom-start` 贴着小触发器时面板从自己的中线缩放，而不是从触发器）。皮肤体积基线随之上调。
- d61751b: Popover 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，content 投影 `data-instant`、不再在页面载入时播一遍弹出；第一次收起照常播退场，之后每一次打开照常进场。
- f2e9fb0: 浮层退场中途重新打开时，从当前透明度接着淡入，不再先跳回全透明再进场（快速连点触发器时的一次闪断）。

  - `PresenceHandle` 新增 `onReenter(fn)`：退场中途被重新打开时同步回调，先于租约结清。
  - `attachCssExit` 在退场开始时记下起始透明度、时长与缓动，重开时按已播时间算出此刻的透明度，写进节点的私有槽 `--xh-_enter-from-opacity`；共享进场关键帧（`xh-overlay-slide-in`、`xh-overlay-pop-in`、`xh-pop-in`、`xh-fade-in`、`xh-rise-in`、`xh-item-in`、`xh-drop-in`、`xh-sheet-in`、`xh-slide-fade-in`）与 Toast、Tour 聚光框的进场以它为起点，未写时仍从 0 起。完整关闭后的下一次打开照常从全透明淡入。

- b0acd86: Progress 仪表盘指针的转动改走数值档 `--xh-motion-duration-move` + `--xh-motion-ease-continuous`，与圆弧填充同一档时长与曲线（此前指针取 `enter-strong`，同一次值变化指针领先于弧先到位）。
- ec655d8: PromptInput 发送钮在发送与停止两种身份间切换时，兜底字形不再瞬换：换上来的那一枚淡入（停止的方块从略小处浮出 `xh-pop-in`，发送的箭头 `xh-fade-in`），与按钮换面同一拍；首帧就在的字形直接呈现，减弱动效下只剩淡入。按钮新增 `data-instant`（身份换过之前投影），机器新增 context `modeChanged`。粗指针下按钮的 `::after` 是家族命中区，字形只有 `::before` 一层，旧字形随身份切换当即换下。
- 5d30b5f: RadioGroup 与 QuestionFlow 单选的圆点对齐为同一套动效：选中时从 0 缩放到 1、落位走 `--xh-motion-ease-settle` 略涨过 1 再收回；收起改走 `--xh-motion-ease-enter-strong`，不再冲成负缩放、闪出一个极小的镜像点；圆点换色走 `--xh-motion-duration-micro`，RadioGroup 按住条目时选中圆点换到语气 active 档走按压时间线。QuestionFlow 单选的圆点此前只做颜色淡入，现在同样按缩放收放。
- ece88cd: Rating 在 RTL 下的星形修正：未点亮那层原先只写了从右侧裁（`inset(0 100% 0 0)`），RTL 下整颗星从行尾往行首擦出；整幅与半档的裁切改为乘 `--xh-direction-sign` 换边，RTL 从行首（右侧）点亮，rtl 里局部写回 `ltr` 的星带按 ltr 裁。两层星形改为铺满格子、四边外边距 auto 回中，不再用物理平移回拉——此前 RTL 下底层那颗中性星偏出一个星宽。作者自带图标的半颗渐变改为角度乘方向符号换向，不再用 `:dir()`（Chrome 120 起，高于浏览器硬底线）。
- e2f1b67: rtl 下行内轴居中的盒不再偏出一个自身宽度。起点 `inset-inline-start` 是逻辑属性、`translate` 是物理通道，rtl 下起点落在右半边、再往左挪半个盒；现在 `:dir(rtl)` 下平移的行内分量掉头。涉及：Toast 在 top / bottom 居中的那一摞（rtl 下曾整摞偏出视口）、走马灯横轨分页条与纵轨翻页钮、粗指针下的分页点与自动播放进度条、图片预览的工具条与计数、评分空项的星形、可调尺寸上下把手的指示条、滑块刻度点与刻度文案（横排与竖排）。

  滑块值气泡改用平移回中：原先两侧 inset 钉在 50% 靠自动外边距回中，可用宽度为 0、气泡比它宽时自动外边距按规范取 0，气泡在 ltr 与 rtl 下都从拇指中线起排、偏出半个自身宽。

  六份皮肤（carousel / image-viewer / rating / resizable / slider / toast）的体积基线随之上调。

- 9692178: ScrollArea `fade` 变体滚到头时，那一侧的遮罩带沿 micro 过渡收起、离开端点时淡回，不再在到端那一帧瞬间消失。四条带宽经 `@property` 登记成长度才能过渡；不认 `@property` 的引擎照旧按端点收放、没有过渡。
- e7f1f93: Select 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，带进场的部件投影 `data-instant`、不再在页面载入时播一遍进场；第一次收起照常播退场，之后每一次打开照常进场。
- faf5e64: SideNav 折叠 / 展开：整栏宽度按 move 过渡，放在 Layout 侧栏里时与侧栏同步；折叠进行中根投影 `data-animating`，行文字、展开箭头与分组标题先淡出、宽度落定才裁成图标栏（展开时落定之后才淡入），分组标题在图标栏里留着高度并画一道细分隔，行不再上下跳。分支箭头按书写方向转向（rtl 下收起指向左侧）。折叠态弹出分支改按锚定列表的 `xh-overlay-slide-in / out` 进退场。皮肤体积随之增长（side-nav.css 约 2 KB）。
- e337148: SideNav 当前项不再加粗：页内持久集合的当前标记只有品牌淡底行面与淡底前景（与 Table、Transfer 选中行一致），字重与静息同为 regular；要加粗可写 `--xh-side-nav-row-font-weight-active`。
- ba6e8b6: `side-nav` 的两档宽度改为缺省读侧栏令牌，与 `layout` 的侧栏同源。

  展开宽 `--xh-side-nav-w` 缺省改取 `--xh-sider-w`（`15rem`，根字号 16px 时仍是 240px），折叠宽 `--xh-side-nav-collapsed-w` 缺省改取 `--xh-sider-collapsed-w`（`4rem`）。**折叠成图标栏时由 56px 变为 64px**，与 `layout` 折叠后的侧栏同宽；行内容居中，图标位置不变、两侧留白各多 4px。

  需要保留 56px 的，在侧栏上写 `--xh-side-nav-collapsed-w: 56px`。改 `--xh-sider-w` / `--xh-sider-collapsed-w` 两支令牌会让 `layout` 的侧栏与 `side-nav` 一起换宽。

- 316d8c2: 新增侧栏宽度语义令牌 `--xh-sider-w`（展开，`15rem`）与 `--xh-sider-collapsed-w`（折叠成图标栏，`4rem`），`layout` 的侧栏改为缺省读这两支令牌。

  此前侧栏宽度只以字面量写在 `layout` 皮肤的兜底里，页面要统一换侧栏宽只能逐个组件改覆盖槽。现在改这两支令牌即可；只想改一处时照旧写 `--xh-layout-sider-w` / `--xh-layout-sider-collapsed-w`，组件槽优先于令牌。`layout` 的默认宽度不变。

- 7687746: SignaturePad 新增签名数据 `value` / `defaultValue` / `onValueChange` 与撤销、重做。

  - 签名数据是逐笔的点加上笔迹坐标系（`SignaturePadValue = { strokes, surface }`），无损：存下 `value-change` 给出的数据，编辑页交回 `defaultValue` 即原样回显，之后照常续写。提供 `value` 即受控，抬笔、清空、撤销、重做只经 `onValueChange` 送出，落笔途中不发。导出的 SVG 读不回逐笔的点，回显要存数据。Vue 走 `v-model:value`；Web Components 的 `value` / `defaultValue` 只走 property，事件名 `value-change`。
  - 新增部件 `undo-trigger` / `redo-trigger`（`XhSignaturePadUndoTrigger` / `XhSignaturePadRedoTrigger`），与清空按钮同为 Action Control text 档 sm、缺省 outline。一笔、一次清空各是一步，误清之后撤销能找回整份签名；再落一笔或清空后重做栈作废，宿主从外面换了一份签名时撤销与重做栈一并作废。没有可做的一步时按钮投影 `aria-disabled` 与置灰面，焦点仍留在钮上。
  - API 新增 `value`、`canUndo`、`canRedo`、`undo()`、`redo()`；Web Components 元素新增 `undo()` / `redo()` 方法与只读的 `canUndo` / `canRedo`；文案新增 `translations.undoTrigger` / `translations.redoTrigger`；headless 导出 `EMPTY_SIGNATURE`。
  - 表单重置回到 `defaultValue`（未提供时清空）并清掉撤销历史；`draw-end` 在撤销与重做时同样发出。
  - 机器 context 由 `strokes` / `surface` 改为 `value` / `draft` / `past` / `future`，按压通道的 `pressed` 改为记录正被按住的是哪一颗按钮。

- e89fbe5: Skeleton 刚加载完时不再当场收起：骨架让出版面、原地盖在真实内容之上淡出，播完才收起；挂载时就已加载完的直接收起。

  **破坏性**：`connectSkeleton` 的签名由 `(props, normalize)` 改为 `(service, normalize)`，新增 `skeletonMachine` 与 `SkeletonSchema`。直接使用 `@xihan-ui/headless` 的调用方需先用 `skeletonMachine` 创建服务再连接：

  ```ts
  const service = createService(skeletonMachine, {
    props: () => props,
    runtime,
  });
  const api = connectSkeleton(service, normalize);
  ```

  Vue、React 与 Web Components 组件的用法不变。

- ce03512: Slider 的值气泡拖动时不再跟着拇指放大：气泡挂在拇指里，拇指按 `--xh-motion-scale-drag` 放大到 1.12 时连文字一起被放大；现在气泡按同一比例反向缩回、与拇指同一段过渡，缩放原点在贴着拇指那一边。刻度点、刻度文案与值气泡的回中平移改为乘 `--xh-direction-sign` 换向，撤掉四处 `:dir(rtl)`（Chrome 120 起，高于浏览器硬底线）。
- 6f1afc3: Slider 新增反向 `inverted`、整段拖动 `draggableRange` 与不填充轨道 `trackFill`。

  - `inverted`（Web Components 属性 `inverted`）：min 落在轨道末端（横排在行尾、竖排在顶端），拇指、已选区间与刻度都从末端量起，指针换算与方向键跟着对调，方向键跟随屏幕方向。插槽里的 `thumbs[i].percent` 与 `range` 仍按值的位置报。
  - `draggableRange`（属性 `draggable-range`）：多拇指时按住两端拇指之间的轨道拖动，整段一起平移、宽度不变，挪到头就停；按在拇指上仍只推那一个，按在区间外照旧抓最近的拇指；只认刻度落点时不生效。range 部件投影 `data-draggable`，皮肤给出抓取光标；整段拖动时两端拇指都投影 `data-dragging`。
  - `trackFill`（默认 `true`，属性 `track-fill`，写 `"false"` 关掉）：关掉后 range 部件收起（`hidden`），刻度不再按区间上色。
  - headless 导出 `displayPercent`、`shiftThumbValues` 与类型 `SliderDragMode`、`SliderRangeDragOrigin`；`AxisOptions` 新增可选 `inverted`；机器 context 新增 `dragMode` / `rangeOrigin`，`DRAG.START` 事件新增可选 `onThumb`。

- c4e95ea: Sortable 键盘重排时被拖那一项与让位的邻项同一段一起逐格滑（根投影 `data-drag-mode`）；放下或取消之后各项从原处滑回自己的排布位，取消时不再瞬间回位；指针放下的那一项仍由弹簧收进。
- a714f3f: Sortable 条目的让位、跟手与归位位移，以及落点线的位置，由内联 `transform: translate3d(…)` 改为独立的 `translate` 属性；皮肤的让位过渡与归位期间的 `will-change` 随之改到 `translate`。画面不变。
- b2b4be3: Spinner 三点档改为错相的波：明暗不再靠整组不透明度同步起落（读起来像整体在闪），改由一层三倍宽的遮罩沿行扫过，三枚点依次亮起再暗回禁用档；RTL 下扫向掉头。减弱动效与打印下撤掉遮罩、三点满不透明度静止；强制色下退回描边圆环并转圈。关键帧 `xh-spinner-dots` 的帧体随之改为动 `mask-position`，皮肤体积基线随之上调。
- 3cab30e: Spinner 三档直径改为与控件内图标同档：sm `--xh-glyph-size-sm`（16px）、md `--xh-glyph-size-md`（20px）、lg `--xh-glyph-size-lg`（24px）。此前 md 取 `--xh-glyph-size-lg`、lg 取 `--xh-glyph-size-xl`，缺省档比同一行文字里的图标大一圈。环档的画法（环粗、轨道、起始边、圆角与转圈节拍）与加载环家族配方逐项同值，由浏览器用例钉住。
- a7d62ed: ToolCall 状态、Approval 结果、QuestionFlow 结果三种状态 chip 统一：

  - 连接层在这三个部件上投影 `data-tone`（ToolCall：等审批 warning、有结果 success、出错 danger；Approval：批准 success，拒绝与超时 danger；QuestionFlow：交卷 success），皮肤改读共享语气槽 `--xh-_tone-subtle` / `--xh-_tone-fg`，不再各自拼一份颜色公式；各阶段的覆盖槽保留。
  - 几何与 Tag 的 sm 档同一把尺：内衬 2 / 6px、1px 透明边、字号 12、字重 medium、行框 16px，三者等高。

- f9a8307: Steps 推进时三个通道一起走：连接线沿行向从这一步填到下一步（rtl 翻转、回退时反向收回），标题换色淡变，走过那一步的对号淡入；首帧就走过的步（序号圆点投影 `data-instant`）直接呈现。
- 93790bd: Steps 的尺寸档与同类对象同一把尺：
  - 序号圆点直径改取 `--xh-control-h-sm/md/lg`，与 Avatar、带框 Icon 相同并随密度换档。comfortable 下 sm 由 28px 变为 32px、md 由 32px 变为 36px，lg 仍是 40px；compact 下三档依旧是 28 / 32 / 36px。此前 sm / md 走 space 档不随密度，lg 却走 control-h 随密度，三档不在同一把尺上。
  - 作者放进标题 / 说明里的图标是控件内图标，改为随尺寸档取 `--xh-glyph-size-sm/md/lg`（16 / 20 / 24px），此前三档都固定 16px。`--xh-steps-icon-size` 照旧可覆盖；圆点里的兜底对号与作者图标仍走指示符档，不受影响。
- f477d75: transition 列表统一写长名：28 份皮肤里的 `background` 简写换成 `background-color`；Anchor、NavigationMenu、Segmented 的滑动指示器位置由 `transform: translate()` 改为独立的 `translate` 属性（RTL 翻转同改），液态档的挤压 `scale` 不再与位置写在同一个变换里。画面不变，计算样式里的 `transition-property` 随之改名；在 `xihan.overrides` 层覆盖这三个指示器 `transform` 的作者，改写 `translate`。
- 489a347: 换面节奏统一：集合行（菜单项、列表项、树节点、表格行、侧栏链接等）、树行与表单错误汇总条目的底色过渡由 200ms 改为 micro（120ms），与字色、离散按钮的换面同一时长。悬停进入与按压释放共用同一条过渡，换面只取一个时长；200ms 的释放只作用于按钮缩放。
- 3940609: Switch 的滑块换向改为乘 `--xh-direction-sign`：此前按祖先 `[dir='rtl']` 换向，rtl 页面里局部写回 `ltr` 的开关照样命中，打开态与按住拉长时滑块被推出轨道；现在按就近的 `dir` 走，嵌套方向下滑块始终停在轨道的行尾。
- 4763e90: Tabs 指示条只在换项时滑：首次落位、同一项的重量（窗口缩放、换上正式字体、标签变宽）直接到位，指示条投影 `data-instant`，不再拖尾或伸缩一下。
- ad9d7c3: TagsInput 的计数是次级标注，字号缺省改取 12px 说明档 `--xh-text-caption-size`，不再随控件尺寸档（此前 md 14px、sm 13px、lg 更大）。`--xh-tags-input-count-font-size` 照旧可覆盖。
- 8815c58: TimePicker、TimeRangePicker、DatePicker、DateRangePicker 的时间列与预设项对号改取指示符档 `--xh-control-indicator-size`，与 Select、Combobox、Listbox、Cascader、TreeSelect、Menu 的对号同一把尺，紧凑密度下随之收到 14px（此前固定 16px，同屏对不齐）。
- eae4884: TimePicker 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，带进场的部件投影 `data-instant`、不再在页面载入时播一遍进场；第一次收起照常播退场，之后每一次打开照常进场。
- 9921870: TimeRangePicker 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，带进场的部件投影 `data-instant`、不再在页面载入时播一遍进场；第一次收起照常播退场，之后每一次打开照常进场。
- 84d8bb9: Toast 叠放的位移与收拢比例由 `transform: translateY() scale()` 拆成独立的 `translate` 与 `scale` 属性，进出场关键帧 `xh-toast-in / xh-toast-out` 同改。两者的作用顺序与原来一致，画面不变；计算样式里的 `transition-property` 由 `transform` 变为 `translate, scale`。
- 9f215ab: ToolCall 触发条文字取标签字重：与 Accordion、Collapsible、Reasoning 的面级披露触发条同一档（`--xh-text-label-weight`），此前落在正文字重，在一串披露面里显得比别家轻一档。新增覆盖槽 `--xh-tool-call-label-font-weight`。
- 320cc89: Toolbar 分组里相接的分段按下只换面、不再缩放：分段零间距直角相接，0.97 缩放会撕开两侧接缝（与 ButtonGroup、ToggleGroup 一致）；散落的独立条目照常缩放。
- ef7e2c1: Tooltip 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，content 投影 `data-instant`、不再在页面载入时播一遍滑入；第一次收起照常播退场，之后每一次打开照常进场。接替窗口内打开直接呈现的行为不变。
- 3e6adbb: Tooltip 新增跳过等待的接替窗口 `skipDelayDuration`（默认 300ms，Web Components 属性 `skip-delay-duration`）：同页的提示共用这个窗口，另一个提示还开着、或刚收起一个不到这么久时，指向下一个不再等 `openDelay`、也不播进场，直接接替，上一个随之收起（此前每一个都要等 700ms、都要滑入，横扫工具栏时提示一个个等、一个个滑入）。0、负数或非有限数表示不参与接替。

  - 接替打开的提示在 content 上投影 `data-instant`，皮肤的进场写在 `:not([data-instant])` 下；退场照常。
  - 机器新增 context `instant`，窗口时长的缺省值 300ms 登记为停留时长。

- 3033774: Tour 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，带进场的部件投影 `data-instant`、不再在页面载入时播一遍进场；第一次收起照常播退场，之后每一次打开照常进场。
- 4cb4c5d: Tour 换步时气泡与聚光框同一段时长、同一条曲线一起滑到下一个目标（定位层与聚光框在这一段投影 `data-animating`），不再卡片先瞬移、光圈后到；减弱动效下同时到位。页面滚动与视口缩放时两者跟手，聚光框不再拖尾。
- fd991c6: 修正 Transfer 与 Virtualizer 组合时的列表布局：虚拟化 viewport 与自绘竖向滚动条现在铺满面板的列表内容区，不再在底部留下空白。
- 5a9e98a: Tree 分支箭头的朝向改为乘 `--xh-direction-sign`，与 TreeSelect 同一写法：rtl 页面里局部写回 `ltr` 的树按 ltr 朝向，收起时指向行尾、展开时朝下。
- c8582ae: Tree 拖放落下不再瞬移：拖放与 Alt + 方向键提交搬家时，连接层先记下每一行的排布位，宿主写回 `collection` 的那一次重排里，行按旧位置反向补偿、经皮肤的 `translate` 过渡（`--xh-motion-duration-move` / `--xh-motion-ease-continuous`）滑到新位置；换了父、被宿主重建的节点按节点值认回。减弱动效下 move 为 1ms，即时落位。落点线与换父描边的缺省色由 `--xh-border-control-focus` 改为 `--xh-bg-brand`，与 Table、Sortable 同一种（暗色下二者此前不同色）。
- 727768b: TreeSelect 分支箭头的朝向改为乘 `--xh-direction-sign`：此前按祖先 `[dir='rtl']` 翻转，rtl 页面里局部写回 `ltr` 的树选择器收起的箭头照样朝左；现在按就近的 `dir` 走，收起时指向行尾、展开时朝下。
- 975db1c: TreeSelect 挂载时已打开（`defaultOpen`，或受控 `open` 初值为 `true`）时直接呈现，带进场的部件投影 `data-instant`、不再在页面载入时播一遍进场；第一次收起照常播退场，之后每一次打开照常进场。
- Updated dependencies [c48171d]
- Updated dependencies [df3d2ac]
- Updated dependencies [52b697a]
- Updated dependencies [7f0c61b]
- Updated dependencies [f283144]
- Updated dependencies [fd0e9da]
- Updated dependencies [1b0701c]
- Updated dependencies [7878927]
- Updated dependencies [9c6d582]
- Updated dependencies [4ddf556]
- Updated dependencies [245995e]
- Updated dependencies [1b537d9]
- Updated dependencies [bf1fb1f]
- Updated dependencies [5c79ac0]
- Updated dependencies [560242d]
- Updated dependencies [caa257c]
- Updated dependencies [531fa5c]
- Updated dependencies [316d8c2]
- Updated dependencies [984d31e]
- Updated dependencies [cd01d4b]
- Updated dependencies [7ed31aa]
- Updated dependencies [43b344e]
- Updated dependencies [47549df]
- Updated dependencies [c5e6c16]
- Updated dependencies [6d95e8c]
  - @xihan-ui/tokens@3.0.0

## 2.1.0

### Minor Changes

- 7c813b5: Collection Item 家族 page 语境的选中对号从行首移到行尾，与 overlay 语境同列：Listbox 的选中项现在是品牌淡底 + 行尾对号。

  对号一律落在行尾（`prefix | text | shortcut | suffix | indicator`），行首一格留给前导图标、展开箭头、拖拽把手与勾选框。配方 `markers.page.glyph` 由 `leading` 改为 `trailing`，生成器按它决定 page 语境是否另排一套行首网格；改回 `leading` 仍能生成旧的排法，但当前没有语境使用。

  行面、字色与悬停 / 按下阶梯不变，只动对号的位置。

- 589d76b: Collection Item 家族的 `shortcut` 槽终于被真正画出来：与说明同档同色的次级文字，不换行。

  这一列从家族建立起就在网格里（`prefix | text | shortcut | suffix | indicator`），但只声明了 `grid-column`——没有字号也没有颜色，落进去的文字会按主文字的 14px 与全强度前景显示，与命令本身抢层级。全库至今没有任何组件消费它，Menu 的示例只能在条目末尾塞一个没有槽位的裸 `<span>`，既不落列也不对齐。

  现在补齐三条声明：

  - 字号走 `--xh-control-caption-md`（控件内次级文字档，比同档主文字低一级），与 `description` 同档；可用 `--xh-collection-shortcut-font-size` 逐组件改写。
  - 颜色跟着 `--xh-collection-description-fg` 那支 muted 走，因此逐态跟随（rest / hover / selected / disabled），也**不跟随语气**——一行里出现两种彩字，语气就失去指向。
  - `white-space: nowrap`：它是一串按键记号，折行会被读成两个组合。

  设计真源补「集合行的次级文字」一节，把说明与快捷键两处的落位、字号、颜色与语气边界写在一起。

- 8ada4b9: Collection Item 家族新增语气档：条目写 `data-tone` 即按该族颜色表达，不写保持中性。

  此前语气只画在集合的容器上（菜单整张、列表整份），单条命令表达不了自身动作的性质——"移到回收站"与"复制"在皮肤上是同一条。作者要把删除项标红，只能绕过家族在条目上写散值，于是每个产品各自一套红。

  新增的这一档只动面与字，节奏与中性行完全一致：

  - 静息不换面，只把字换成 `--xh-tone-fg`。整行彩底会把菜单读成色块表，语气由字色承担即可。
  - hover 与键盘高亮换 `--xh-tone-subtle`（12%），按下换 `--xh-tone-subtle-hover`（20%）——与中性行的透明 → 100 → 200 同节奏同层级，只是换了族色。
  - 字一律取 `--xh-tone-fg` 而非 `--xh-tone-solid`：前者是按 WCAG 兑到 60% 的可读文字色，对本家族会遇到的透明面、语气淡底三态与抬起面共五种底、六个语气全部 ≥4.5。

  三条边界写死在家族里，组件不必各自判断：

  - **选中与当前压过语气。** 同一条既被选中又带 `danger` 时面归选中、语气退出——选中是集合的结构事实，语气只是该条动作的性质；`disabled` 压过一切。
  - **`nav` 语境不接语气。** Tabs line trigger、Anchor / Breadcrumb link、Menubar / NavigationMenu trigger 表达的是位置而不是动作，写了也不产出语气面。
  - **forced-colors 下语气整档退出**，逐态盖回系统色，只保留图标与文案通道。

  说明行保持 muted、不跟随语气：一条里出现两种彩字，语气就失去指向。语气也不改字重、缩进与指示器颜色，非颜色通道仍由图标承担。

- e00c965: Listbox 的选中改成与 TreeSelect 同一种读法：行不换面、不换字色，只在行尾亮对号。

  - 条目的 `data-xh-collection-context` 由 `page` 改为 `overlay`，选中叠悬停 / 按下沿用未选行的 100 → 200 阶梯。
  - forced-colors 下选中行保持 Canvas，只由对号表达；打印时对号按原样印出。

  **破坏性变更**：删除组件槽 `--xh-listbox-item-bg-selected`。`--xh-listbox-item-fg-selected` 保留，缺省改回条目自己的字色。

- d727908: TagGroup 的选中改成与 TreeSelect 同一种读法：选中的标签面、字与描边都不换，只在文字后亮一枚对号。

  - 对号取品牌前景，标了语气的组取语气字色；实心标签取面配对的那支前景色，置灰标签跟着字一起置灰。
  - 悬停、键盘锚点与按下沿用未选中的那条阶梯；forced-colors 下对号用系统高亮色画出，打印时按原样印出。

  **破坏性变更**：删除组件槽 `--xh-tag-group-item-bg-selected`、`--xh-tag-group-item-bg-selected-hover`、`--xh-tag-group-item-bg-selected-pressed`、`--xh-tag-group-item-fg-selected` 与 `--xh-tag-group-item-border-selected`；实心标签选中时不再描出那一圈字色描边。

- c456e52: TagGroup 选中标签的对号从文字前移到文字后，与集合行「对号一律在行尾」统一。

  - 皮肤按顺序排：对号排在文字与作者内容之后、摘除钮之前，作者在格里把 `item-indicator` 写在哪儿都一样。
  - Vue / React 不传结构时的默认渲染同步改成「文字 → 对号 → 摘除钮」。
  - 选中的淡底、配对前景与按压反馈不变。

- 9fd2157: Tree 的选中改成与 TreeSelect 同一种读法：行不换面，单选、多选与级联都只在行尾画对号，勾选框部件删除。

  此前页内树有两套标记：单选铺品牌淡底 + 行首对号，勾选档再摆一枚行首方框——方框已经表明了勾选态，淡底又把同一件事说了一遍；而下拉里的树（TreeSelect）一直是透明底 + 行尾对号。现在两者统一：

  - 行投影 Collection Item 的 `overlay` 语境：选中不换面、不换字色，悬停 / 高亮 / 按下沿用未选行的 100 → 200 阶梯。
  - 对号（`item-indicator`）一律排到行尾，作者写在行首也会被排到最后；行尾那一格（`item-suffix`）在它之前。
  - 分支行也放 `item-indicator`：勾选态与级联半选态落在标记自身的 `data-selected` / `data-indeterminate` 上，半选画横杠。
  - forced-colors 下选中行保持 Canvas，只由对号表达；打印时对号按原样印出。

  **破坏性变更**

  - 删除部件 `item-checkbox` / `branch-checkbox`，以及三端对应的 `XhTreeItemCheckbox` / `XhTreeBranchCheckbox`（React 另有 `XhTreeItemCheckboxProps` / `XhTreeBranchCheckboxProps`）和 connect 上的 `getItemCheckboxProps` / `getBranchCheckboxProps`。
  - 删除组件槽 `--xh-tree-checkbox-*`（8 个）与 `--xh-tree-row-bg-selected`。
  - 行的 `data-xh-collection-context` 由 `page` 改为 `overlay`。

  迁移：把勾选框换成对号，分支行同样摆一枚。

  ```vue
  <XhTreeBranchControl>
    <XhTreeBranchTrigger />
    <XhTreeBranchText>华东</XhTreeBranchText>
    <XhTreeItemIndicator />
  </XhTreeBranchControl>
  <XhTreeItem value="sh">
    <XhTreeItemText>上海</XhTreeItemText>
    <XhTreeItemIndicator />
  </XhTreeItem>
  ```

  Web Components 把 `data-xh-part="item-checkbox"` / `"branch-checkbox"` 换成 `data-xh-part="item-indicator"`。

### Patch Changes

- c79e9ac: 浮层打开后不再常驻 `will-change`，静止画面不再发虚。

  此前 26 份浮层皮肤（Menu、Select、Popover、Dialog、Drawer、Tooltip、ContextMenu、Menubar、日期与时间选择器等）在 `[data-state='open']` 上一直挂着 `will-change: opacity, translate` 一类合成属性。Chromium 对这样的层沿用第一次栅格化时的位移与缩放：第一次栅格若落在入场动画中途，小数位移就被保留下来，动画播完后文字与 1px 分隔线仍是重采样出来的，看上去发虚；落在哪一帧取决于时序，所以时好时坏。

  现在打开态只留入场动画：动画播放期间浏览器照样把这一层提到合成层，播完按整数像素重画。附带的变化是浮层里的文字与页面其他文字一样走亚像素抗锯齿，不再被合成层压成灰阶。退场态与拖拽中的 `will-change` 不变。

  - @xihan-ui/tokens@2.1.0

## 2.0.0

### Major Changes

- 974cd5d: Accordion 与 Collapsible 的默认标题栏改为更舒展的内容高度与内边距，正文从标题边缘续接并使用次级前景；Accordion 的 `surface` 变体改为单一连续表面，以内收分隔线组织条目，不再逐项抬起。

  连续表面的分隔、状态与尺寸规则使 `accordion.css` 的压缩体积由 6832 字节增至 7981 字节。

  同族标题栏与正文的尺寸、状态规则使 `collapsible.css` 的压缩体积由 4742 字节增至 5722 字节。

- 8f810d8: Alert 将 `content` 收为必需文本列，标题与说明必须放在其中；图标、操作和关闭入口仍按需渲染。

  默认外观改为中性抬升表面，语气只强调标题与图标，说明保持次级前景；操作与关闭入口统一排在尾端。

- c5d69ee: Badge 将 `indicator` 收为必需部件，默认语气明确为 `neutral`。

  角标相对宿主的探出比例由二分之一收为四分之一；计数盒三档最小尺寸调整为 16 / 28 / 32px，并移除额外顶光。

- 08850a2: **按钮与悬浮按钮撤掉 `shape`：圆角是形态身份的一部分，不再另开一根轴。**

  `button` 的 `shape`（rounded / pill / square）与 `float-button` 的 `shape`（circle / square）都是在 variant · tone · size 三轴之外另开的一根视觉轴，与「形状身份不随主题、密度改变」的约定相悖，也让同一枚按钮在页面里出现三种圆角。现在按钮与开关、按钮组同为胶囊，悬浮按钮的触发器与展开的每一条动作固定圆形；确实要换档的在任意子树上重声明 `--xh-button-radius` / `--xh-float-button-radius`。三端同步：Vue / React 的 `shape` prop、自定义元素的 `shape` attribute、`data-shape` 状态属性、`ButtonShape` / `FloatButtonShape` / `FLOAT_BUTTON_DEFAULT_SHAPE` 导出一并撤掉；悬浮按钮的「外形」示例移除。

- 1fb94ea: 日历拆成两个组件：`calendar` 改名为 `calendar-picker`（日历选择器，单选 / 多选），区间选择拆到新组件 `calendar-range-picker`（日历范围选择器）。

  - **破坏**：`calendar` 不再存在。单选与多选改用 `calendar-picker`：Headless 的 `calendarMachine` / `connectCalendar` / `calendarAnatomy` / `calendarKeyboard` / `calendarMeta` 改名为 `calendarPickerMachine` / `connectCalendarPicker` / `calendarPickerAnatomy` / `calendarPickerKeyboard` / `calendarPickerMeta`，类型 `CalendarSchema` / `CalendarApi` / `CalendarTranslations` / `CalendarSelectionMode` / `CalendarValueChangeDetails` / `CalendarRefs` 改名为 `CalendarPicker*`；Vue 与 React 的 `XhCalendar*` 改名为 `XhCalendarPicker*`，`useCalendar` 改名为 `useCalendarPicker`；自定义元素 `<xh-calendar>` 改名为 `<xh-calendar-picker>`；皮肤 `calendar.css` 改名为 `calendar-picker.css`，覆盖槽前缀 `--xh-calendar-*` 改为 `--xh-calendar-picker-*`；`data-scope="calendar"` 改为 `data-scope="calendar-picker"`。文案表的键 `calendar` 改为 `calendar-picker`。
  - **破坏**：`calendar-picker` 的 `selectionMode` 只剩 `'single' | 'multiple'`；`isDateUnavailable` 只收一个参数；删除 `allowsNonContiguousRanges`、`rangeAnchor`、`setRangeAnchor`、`data-in-range` / `data-range-start` / `data-range-end` / `data-range-preview` / `data-dragging` 与键盘表里的 `cancel-range` / `commit-range` 两行。
  - **新增** `calendar-range-picker`：值恒为区间两端（升序、长度 2），承接原来 `selectionMode="range"` 的全部行为——先落起点再落终点、按住拖选、拖动已选区间的一端、`Escape` 撤起点、`Tab` 收口、`allowsNonContiguousRanges`、`isDateUnavailable(value, anchor)`、`invalid` 自判、`rangeAnchor` / `dragging` / `setRangeAnchor`。三端部件名与日历选择器逐一相同（`XhCalendarRangePicker*`、`<xh-calendar-range-picker>`），皮肤 `calendar-range-picker.css`，覆盖槽 `--xh-calendar-range-picker-*`。
  - 网格纯数学（`buildMonthGrid` / `calendarPeriodOf` / `calendarPeriodValue` / `parseCalendarDate` 等）与 `CalendarGranularity` / `CalendarView` / `CalendarPeriod` / `CalendarPanel` / `CalendarCellProps` 等领域类型保持原名，两个日历共用；新增 `visibleCountOf` 与 `CalendarPart` 公开导出。
  - **破坏**：`date-picker` 只剩单选与多选，内嵌 `calendar-picker`：删除 `selectionMode="range"`、`endName`、`allowsNonContiguousRanges`、`fieldEnd`、`range-separator` 部件、`getRangeSeparatorProps`、`getSegmentGroupProps({ index })` 的 `index`、`DatePickerSegmentGroupProps`、`datePickerFieldEndProps`、`datePickerFieldAt`、`resolveDatePickerFieldIndex`、`DatePickerFieldIndex`、`datePickerPresetRange` / `datePickerPresetMonth` / `datePickerPresetYear`；`DATE_PICKER_RANGE_SEPARATOR` 改名为 `DATE_PICKER_PRESET_SEPARATOR`；Vue / React 删除 `XhDatePickerRangeSeparator`，`XhDatePickerSegmentGroup` / `XhDatePickerHiddenInput` 不再收 `index`；自定义元素删除 `end-name` 属性、`fieldEndSegments` 只读属性；`DatePickerTranslations` 删除 `startDate` / `endDate`；`isDateUnavailable` 只收一个参数。区间日期由随后的 `date-range-picker` 承接。
  - 文档：两个日历在组件总览里归入「数据录入」，各有独立预览；示例拆成 `calendar-picker`（基础、多选、不可选的日子、格子里放内容）与 `calendar-range-picker`（基础、并排两个月、不可用的日子、按周挑）。

- edaa3dc: Card 收敛为 `default`、`secondary`、`tertiary`、`transparent` 四种语义表面，并将结构统一为 `root / header / title / description / content / footer`。

  移除 `size`、`hoverable`、`split` 属性以及 `media`、`body` 部件；媒体改为普通子节点，卡片统一使用 16px 内边距、12px 段间距与高层圆角。

- bd3974f: Carousel 改为内容内覆盖式导航：前后按钮贴在视口两侧，短线分页贴在内容下沿，当前页沿轨道方向伸长；控件保持低海拔柔和表面，富文本或长内容不再影响导航布局。

  覆盖式导航、横纵分页和命中区规则使 `carousel.css` 的压缩体积由 7954 字节增至 10397 字节。

- dc64383: **三处收起态从 `hidden` 属性改到 `data-state`。** `hidden` 是瞬时的：属性一加，节点当帧消失，中间没有可播放的时间段。这三处都是能展能收的内容，改成状态属性之后收起态才有一个可被过渡与动画读到的档位。

  | 组件      | 部件             | 从前                                          | 现在                                 |
  | --------- | ---------------- | --------------------------------------------- | ------------------------------------ |
  | `table`   | `expanded-row`   | `hidden`（`data-state` 同时也在发，两位重复） | 只发 `data-state="open" \| "closed"` |
  | `tree`    | `branch-content` | `hidden`（`data-state` 同时也在发，两位重复） | 只发 `data-state="open" \| "closed"` |
  | `heatmap` | `tooltip`        | `hidden`                                      | `data-state="visible" \| "hidden"`   |

  前两处取开合族、末一处取派生显隐族，取值都在既有的状态词汇表里，没有新造。

  **破坏性：这三个部件上不再出现 `hidden` 属性。** 选它的规则（`[data-part='expanded-row'][hidden]` 一类）与断言它的用例（`el.hasAttribute('hidden')`）都会静默失配——前两处换成 `[data-state='closed']`，热力图的详情条换成 `[data-state='hidden']`。作者自己写在这些节点上的 `hidden` 仍然有效：皮肤那条收起规则两位一起收。

  **收起靠的是皮肤那一条规则，不再有 UA 兜底。** `hidden` 属性由浏览器自带 `display: none`，`data-state` 没有；这三个部件的收起态现在只由 `@xihan-ui/styles` 里的规则画出来。不接皮肤、只用无头层自绘的使用者，须自己写这一条。

  **量测口径跟着改。** 表格的行拖拽与树的节点拖拽在量可见行时要跳过收起的那一枝，判据从「祖先带 `hidden`」改成「祖先是收起态的 `expanded-row` / `branch-content`」，作者自己加的 `hidden` 照旧跳过。

- 6c20a6d: **取色器改为组合颜色家族的新组件：色相与透明度两条滑块是内嵌的 `color-slider`，预设色板是内嵌的 `color-swatch-picker`，触发钮里的色块走 Swatch 色块面家族。**

  此前取色器自己手写了两条通道滑杆（`channel-slider` / `channel-slider-track` / `channel-slider-thumb`）与一组色板按钮（`swatch-group` / `swatch-item`），键盘、拖动、渐变、读屏文案各是一份；家族里有了同样的独立组件之后，这些就是重复建设。现在取色器只留三个挂载点，里面跑的是那三件组件自己的机器与连接层，DOM 带各自的 `data-scope`，皮肤也各归各。

  破坏面逐条：

  - **五个部件撤掉，三个挂载点接上。** `channel-slider` / `channel-slider-track` / `channel-slider-thumb` / `swatch-group` / `swatch-item` 不再存在；新增 `hue-slider` / `alpha-slider` / `swatch-picker`，它们同时充当内嵌组件的根节点（内嵌组件自己的 `root` 部件不出现），挂载点之下写的是 `color-slider` 的 `control` / `track` / `thumb` / `label` / `value-text` / `hidden-input` 与 `color-swatch-picker` 的 `item` / `swatch` / `indicator` / `hidden-input`。Vue 的 `XhColorPickerChannelSlider*` / `XhColorPickerSwatchGroup` / `XhColorPickerSwatchItem` 换成 `XhColorPickerHueSlider` / `XhColorPickerAlphaSlider` / `XhColorPickerSwatchPicker`（不写子节点即自动铺开；要自己排就往里放 `XhColorSlider*` / `XhColorSwatchPickerItem`），React 同名；自定义元素照挂载点名写 `data-xh-part`。
  - **`ColorPickerServices` 变形。** `hueSlider` / `alphaSlider` 从一台 `slider` 服务换成 `ColorSliderServices`（`{ root, slider }`），新增 `swatchPicker`；props 由 `colorPickerHueSliderProps` / `colorPickerAlphaSliderProps` / `colorPickerSwatchPickerProps(rootService)` 现算，`colorPickerChannelSliderProps` 撤掉。
  - **API 与事件收窄。** `api.channelState` / `isSwatchSelected` / `getChannelSlider*Props` / `getSwatchGroupProps` / `getSwatchItemProps` 撤掉，换成 `api.hueSlider` / `alphaSlider` / `swatchPicker`（各是内嵌组件的完整 api）与 `getHueSliderProps` / `getAlphaSliderProps` / `getSwatchPickerProps`；机器事件 `CHANNEL.SET` / `CHANNEL.STEP` / `CHANNEL.TO_EDGE` 换成滑块送回的 `HSVA.SET`；键盘表撤掉四行 `color-picker.kbd.channel-*`（归 `color-slider` 那张表）。
  - **色板从一排按钮变成单选组。** 挂载点是 `role="radiogroup"`，每格 `role="radio"` 且 `aria-checked`（此前是 `aria-pressed` 的按钮）；整组只占一个 Tab 位，方向键在格子间走并选中，禁用用 `aria-disabled` 表达；当前颜色的那一格按颜色比选中。
  - **皮肤槽位变化。** `--xh-color-picker-thumb-size` 只剩取色面那一颗拇指用；`--xh-color-picker-track-thickness` / `--xh-color-picker-track-radius` / `--xh-color-picker-checker` / `--xh-color-picker-swatch-item-size` / `--xh-color-picker-swatch-ring` / `--xh-color-picker-swatch-border-hover` 撤掉，两条滑块与色板各读自己那份皮的槽（`--xh-color-slider-*` / `--xh-color-swatch-picker-*`）；挂载点同时充当内嵌根节点，根上那几把尺由取色器自己的槽给：两条滑块是 `--xh-color-picker-slider-thumb-size` / `--xh-color-picker-slider-track-thickness` / `--xh-color-picker-hue-slider-gap` / `--xh-color-picker-alpha-slider-gap`，色板是 `--xh-color-picker-swatch-cell` / `--xh-color-picker-swatch-gap` / `--xh-color-picker-swatch-picker-gap` / `--xh-color-picker-swatch-icon-size`（浮层里的色板缺省用小号格）。触发钮里的色块改由 Swatch 家族画：半透明色铺在棋盘格上，`--xh-color-picker-swatch-size` 缺省跟着色块面的尺寸档走。

  顺带补上的：`color-slider` 新增受控 `hsva` prop（几条并排的滑块共用同一份工作色，推色相时灰度处的色相与透明度都不丢），`onValueChange` / `onValueChangeEnd` 的载荷带上 `hsva`；串没变但工作色变了（灰度处推色相）也会通知一次。

- 66c4abd: Combobox 的无候选与加载相位改为共用 `content` 的唯一浮层表面，不再在空 listbox 下方各画一张独立卡片。
  `empty` 与 `loading` 仍是 listbox 的同级 `role=status`，以同格文字层覆盖 content；候选、状态和 Presence
  因此共享同一套尺寸、边界、圆角、背景、阴影与退场动画。

  content 新增 `--xh-combobox-content-min-h` 覆盖槽，空列表关闭时也保留完整退场高度。只有零候选时才显示
  loading 状态层；已有候选时列表保持可见、可操作，仅由 `aria-busy` 报后台刷新，避免输入框指向或提交不可见旧项。
  自由文本的 Enter 提交逻辑不变。

  自动结构未收到状态文案时不绘制无文字空框；组件不虚构通用空态文案。提供文案后仍使用同一个 content 表面。

  移除已经不再拥有表面的 `--xh-combobox-empty-bg`、`--xh-combobox-empty-border`、
  `--xh-combobox-empty-radius`、`--xh-combobox-empty-shadow`、`--xh-combobox-loading-bg`、
  `--xh-combobox-loading-border`、`--xh-combobox-loading-radius` 与 `--xh-combobox-loading-shadow`。
  不保留可重新画出双层空态卡片的兼容分支。

  皮肤体积（去注释、压空白）：前一提交源码 19073 字节，当前 19182 字节；登记基线 19073 → 19182，只更新本组件，10% 容差保持不变。

- bdbf03c: **三个组件改名、四个组件退役。** 不留别名、不留 `var(新名, 旧名)` 双写、不留转发文件：下面列出的名字在无头层、两个适配器与皮肤里都不再存在，写下它们会得到「组件不存在」而不是降级渲染。

  ## 一、改名三条

  ### `ellipsis` → `truncate`

  `ellipsis` 同时是 breadcrumb 与 pagination 的部件名，一个字面量指两个东西；而 `ellipsis` 命名的是「三个点」这个字形，组件做的是「截断 + 展开」。行为、部件与入口一个都没改，只是换了名字。

  | 已删                                                                                                                                                                    | 换成                                                                        |
  | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
  | Vue `<XhEllipsis>`                                                                                                                                                      | `<XhTruncate>`                                                              |
  | 自定义元素 `<xh-ellipsis>`                                                                                                                                              | `<xh-truncate>`                                                             |
  | `useEllipsis` / 类型 `EllipsisContext` / `EllipsisSlotProps`                                                                                                            | `useTruncate` / `TruncateContext` / `TruncateSlotProps`                     |
  | `connectEllipsis` / `ellipsisAnatomy` / `ellipsisKeyboard` / `ellipsisMachine` / `ellipsisMeta`                                                                         | 同名的 `truncate*` / `connectTruncate`                                      |
  | `ELLIPSIS_DEFAULT_LINES` / `isEllipsisOverflowing` / `resolveEllipsisLines`                                                                                             | `TRUNCATE_DEFAULT_LINES` / `isTruncateOverflowing` / `resolveTruncateLines` |
  | 类型 `EllipsisApi` / `EllipsisSchema` / `EllipsisRefs` / `EllipsisMetrics` / `EllipsisTranslations` / `EllipsisExpandedChangeDetails` / `EllipsisOverflowChangeDetails` | 同名的 `Truncate*`                                                          |
  | 类型 `XhEllipsisElement`                                                                                                                                                | `XhTruncateElement`                                                         |
  | `[data-scope='ellipsis']`                                                                                                                                               | `[data-scope='truncate']`                                                   |
  | 覆盖槽 `--xh-ellipsis-*`、内联私有槽 `--xh-_ellipsis-lines`                                                                                                             | `--xh-truncate-*`、`--xh-_truncate-lines`                                   |
  | 子入口 `@xihan-ui/styles/ellipsis.css`                                                                                                                                  | `@xihan-ui/styles/truncate.css`                                             |
  | 文案覆盖表的 `'ellipsis'` 键                                                                                                                                            | `'truncate'`                                                                |

  breadcrumb 的 `data-part="ellipsis"` **不受影响**，它仍叫这个名字；pagination 那个另见部件改名一批（改为 `ellipsis-trigger`）。

  ### `dynamic-input` → `field-array`

  解剖八个部件（`root` / `item` / `item-content` / `item-action` / `add-trigger` / `item-delete-trigger` / `move-up-trigger` / `move-down-trigger`）里没有 `input`——名字在说一件它不做的事。它做的是「可增删的一组字段行」。

  | 已删                                                                                                                                                                                                                                                          | 换成                                       |
  | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
  | Vue `<XhDynamicInputRoot>` / `<XhDynamicInputItem>` / `<XhDynamicInputItemContent>` / `<XhDynamicInputItemAction>` / `<XhDynamicInputAddTrigger>` / `<XhDynamicInputItemDeleteTrigger>` / `<XhDynamicInputMoveUpTrigger>` / `<XhDynamicInputMoveDownTrigger>` | 同名的 `XhFieldArray*`                     |
  | 自定义元素 `<xh-dynamic-input>`                                                                                                                                                                                                                               | `<xh-field-array>`                         |
  | `useDynamicInput` / `useDynamicInputContext` / `useDynamicInputItemContext` / `provideDynamicInput` / `provideDynamicInputItem`                                                                                                                               | 同名的 `*FieldArray*`                      |
  | `connectDynamicInput` / `dynamicInputAnatomy` / `dynamicInputKeyboard` / `dynamicInputMachine` / `dynamicInputMeta` / `dynamicInputTriggerId`                                                                                                                 | 同名的 `fieldArray*` / `connectFieldArray` |
  | 类型 `DynamicInputApi` / `DynamicInputSchema` / `DynamicInputItem` / `DynamicInputItemProps` / `DynamicInputTranslations` / `DynamicInputValueChangeDetails` / `DynamicInputContext` / `DynamicInputItemContext` / `DynamicInputRootSlotProps`                | 同名的 `FieldArray*`                       |
  | 类型 `XhDynamicInputElement`                                                                                                                                                                                                                                  | `XhFieldArrayElement`                      |
  | `[data-scope='dynamic-input']`                                                                                                                                                                                                                                | `[data-scope='field-array']`               |
  | 覆盖槽 `--xh-dynamic-input-*`（24 个）                                                                                                                                                                                                                        | `--xh-field-array-*`                       |
  | 子入口 `@xihan-ui/styles/dynamic-input.css`                                                                                                                                                                                                                   | `@xihan-ui/styles/field-array.css`         |
  | 文案覆盖表的 `'dynamic-input'` 键                                                                                                                                                                                                                             | `'field-array'`                            |

  部件名、`data-*` 属性与入口语义一个字没动。

  ### `time` → `timestamp`

  库内 `time` 前缀已经有四件（`time` / `time-field` / `time-picker` / `timeline`，`timer` 亦近似），光看 `time` 判不出它渲染的是一个时间戳。

  | 已删                                                                                       | 换成                                                                                                      |
  | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
  | Vue `<XhTime>`                                                                             | `<XhTimestamp>`                                                                                           |
  | 自定义元素 `<xh-time>`                                                                     | `<xh-timestamp>`                                                                                          |
  | `connectTime` / `timeAnatomy` / `timeKeyboard` / `timeMeta` / `timeMachineStamp`           | `connectTimestamp` / `timestampAnatomy` / `timestampKeyboard` / `timestampMeta` / `timestampMachineStamp` |
  | `TIME_RELATIVE_LIMIT`                                                                      | `TIMESTAMP_RELATIVE_LIMIT`                                                                                |
  | 类型 `TimeApi` / `TimeProps` / `TimeState` / `TimeType` / `TimeValue` / `TimeTranslations` | 同名的 `Timestamp*`                                                                                       |
  | 类型 `XhTimeElement`                                                                       | `XhTimestampElement`                                                                                      |
  | `[data-scope='time']`                                                                      | `[data-scope='timestamp']`                                                                                |
  | 覆盖槽 `--xh-time-fg` / `--xh-time-placeholder-fg`                                         | `--xh-timestamp-fg` / `--xh-timestamp-placeholder-fg`                                                     |
  | 子入口 `@xihan-ui/styles/time.css`                                                         | `@xihan-ui/styles/timestamp.css`                                                                          |
  | 文案覆盖表的 `'time'` 键                                                                   | `'timestamp'`                                                                                             |

  三个纯函数 `formatRelativeTime` / `formatTimePattern` / `toTimeDate` **名字不动**：它们说的是「时间」这件事，不是组件的名字。渲染出来的仍然是 `<time datetime>`，标签名没变。

  ## 二、退役四件

  ### `result` → 并入 `empty-state`

  两份解剖逐字相同（`root` / `icon` / `title` / `description` / `action`），而组件名 `result` 又与 approval / question-flow 的 `result` 部件撞名。`empty-state` 吸收 `status`，一次纯加法，`live` 原样保留——两者正交，谁都不丢。

  | 已删                                                                                                       | 换成                                                                                |
  | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
  | Vue `<XhResultRoot>` / `<XhResultIcon>` / `<XhResultTitle>` / `<XhResultDescription>` / `<XhResultAction>` | 同名的 `XhEmptyState*`                                                              |
  | 自定义元素 `<xh-result>`                                                                                   | `<xh-empty-state>`                                                                  |
  | `provideResult` / `useResultContext` / 类型 `ResultContext`                                                | `provideEmptyState` / `useEmptyStateContext` / `EmptyStateContext`                  |
  | `connectResult` / `resultAnatomy` / `resultKeyboard` / `resultMeta`                                        | `connectEmptyState` / `emptyStateAnatomy` / `emptyStateKeyboard` / `emptyStateMeta` |
  | 类型 `ResultApi` / `ResultProps` / `ResultTranslations`                                                    | `EmptyStateApi` / `EmptyStateProps` / `EmptyStateTranslations`                      |
  | 类型 `ResultStatus`（七值 `404` / `403` / `500` / `success` / `warning` / `error` / `info`）               | **`EmptyStateStatus`**，取值一字未变                                                |
  | prop `status`                                                                                              | 同名同值，仍只落成 root 的 `data-status`                                            |
  | `[data-scope='result']`                                                                                    | `[data-scope='empty-state']`                                                        |
  | 覆盖槽 `--xh-result-*`（16 个）                                                                            | `--xh-empty-state-*`                                                                |
  | 子入口 `@xihan-ui/styles/result.css`                                                                       | `@xihan-ui/styles/empty-state.css`                                                  |
  | 文案覆盖表的 `'result'` 键                                                                                 | `'empty-state'`                                                                     |

  **两处静默的视觉变化，迁过来要自己看一眼**：

  - **`live` 缺省是 `polite`**，root 因此带上 `role="status"`。整页结果是随页面首屏一起出现的静态内容，没有「更新」可播报，请显式写 `live="off"`。
  - **尺寸档比 `result` 小一号**：`empty-state` 的 md 档图标框是 `--xh-glyph-size-2xl`、标题是 `--xh-control-font-lg`，`result` 原来是 `3xl` 与 `--xh-text-heading-3-size`。要原来的分量写 `size="lg"`，或者给 `--xh-empty-state-icon-size` / `--xh-empty-state-title-font-size` 写值。

  approval 与 question-flow 的 `data-part="result"` **不受影响**。

  ### `space` → 并入 `flex`

  `flex.types.ts` 与 `space.types.ts` 六个 prop 同名同型（`orientation` / `align` / `justify` / `gap` / `wrap` / `inline`），使用者没有任何依据选其一。`space` 独有的 `split` 部件与两处缺省差全部并进 `flex`。

  | 已删                                                                                              | 换成                                                         |
  | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
  | Vue `<XhSpace>` / `<XhSpaceSplit>`                                                                | `<XhFlex>` / `<XhFlexSplit>`（`split` 具名插槽写法一模一样） |
  | 自定义元素 `<xh-space>`                                                                           | `<xh-flex>`                                                  |
  | `useSpaceContext` / 类型 `SpaceContext`                                                           | `useFlexContext` / `FlexContext`（另新增 `provideFlex`）     |
  | `connectSpace` / `spaceAnatomy` / `spaceKeyboard` / `spaceMeta`                                   | `connectFlex` / `flexAnatomy` / `flexKeyboard` / `flexMeta`  |
  | 类型 `SpaceApi` / `SpaceProps` / `SpaceAlign` / `SpaceJustify` / `SpaceGap` / `SpaceTranslations` | 同名的 `Flex*`                                               |
  | 类型 `XhSpaceElement`                                                                             | `XhFlexElement`                                              |
  | 部件 `data-part="split"`                                                                          | 同名，现在挂在 `[data-scope='flex']` 下                      |
  | 覆盖槽 `--xh-space-root-gap`                                                                      | `--xh-flex-gap`                                              |
  | 子入口 `@xihan-ui/styles/space.css`                                                               | `@xihan-ui/styles/flex.css`                                  |
  | 文案覆盖表的 `'space'` 键                                                                         | `'flex'`                                                     |

  **一处静默的视觉变化，迁过来必须自己补**：`XhSpace` 不写 `gap` 时有 md 间距，`XhFlex` 不写 `gap` 就是 0。**`<XhSpace>` → `<XhFlex gap="md">`**，漏了这一条一整排会挤成一团，且不报任何错。

  反过来，`space` 的「缺省交叉轴对齐随方向走」并进了 `flex`：**横排按中线对齐、竖排拉伸占满**，写了 `align` 仍以它为准。原来靠 `flex` 的浏览器缺省（`stretch`）排横排的地方观感会变，写 `align="stretch"` 即回到原样。

  副作用：`--xh-space-*` 前缀底下从此只有全局间距原语，与组件槽的撞名彻底解除。

  ### `popselect` → 退役，无 1:1 替代件

  它的九个部件全部是 `select` 十七个部件的子集，无一独有；且它没有自己的机器（跑的是 popover + listbox 两台）。名字是别家方言，使用者判不出与 `select` 的差别。

  **两条替代路，按「值随不随表单提交」选**：

  - **随表单提交** → 用 `select`：它有 `hidden-select` 承担表单参与、有标签关联，`popselect` 两样都没有。
  - **不随表单提交、只是就地切一个视图参数**（排序方式、显示密度）→ **把 `listbox` 装进 `popover`**：触发器显示当前选中项，`value-change` 里落值即收起浮层，浮层底部还能放操作按钮。这套组合是官方写法，`listbox` 与 `select` 两页文档都写明了分界，示例见 `listbox` 页的「弹出式选择」。

  ```vue
  <XhPopoverRoot v-model:open="open" placement="bottom-start">
    <XhPopoverTrigger>{{ label }}</XhPopoverTrigger>
    <XhPopoverPositioner>
      <XhPopoverContent>
        <XhListboxRoot v-model:value="value" :collection="options" @value-change="close" />
      </XhPopoverContent>
    </XhPopoverPositioner>
  </XhPopoverRoot>
  ```

  删掉的名字：Vue 的 `XhPopselectRoot` / `Control` / `Trigger` / `ClearTrigger` / `Positioner` / `Content` / `Item` / `ItemText` / `ItemIndicator` 与 `usePopselect` / `usePopselectContext` / `usePopselectItemContext` / `providePopselect` / `providePopselectItem`；自定义元素 `<xh-popselect>`；无头层的 `connectPopselect` / `popselectAnatomy` / `popselectKeyboard` / `popselectMeta` / `popselectItemQuery` / `popselectItemText` / `popselectInitialFocus` / `POPSELECT_DEFAULT_PLACEMENT` 与全部 `Popselect*` 类型；`[data-scope='popselect']` 与 `--xh-popselect-*`（44 个）；子入口 `@xihan-ui/styles/popselect.css`；文案覆盖表的 `'popselect'` 键。

  ### `countdown` → 并入 `timer`

  `timer` 在 prop 面上完全覆盖 `countdown`，两件之间再无差别可写进选型表。「走完了」原来在库内有两个名字（`countdown` 的 `data-finished` 与 `timer` 的 `data-state='completed'`），现在只剩后一个。

  | 已删                                                                                                                                                 | 换成                                                                                                                                  |
  | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
  | Vue `<XhCountdown>` / 类型 `CountdownSlotProps`                                                                                                      | `<XhTimerRoot>` + `<XhTimerDisplay>`（默认插槽给出 `text`）                                                                           |
  | 自定义元素 `<xh-countdown>`                                                                                                                          | `<xh-timer>`                                                                                                                          |
  | `connectCountdown` / `countdownAnatomy` / `countdownKeyboard` / `countdownMachine` / `countdownMeta`                                                 | 同名的 `timer*` / `connectTimer`                                                                                                      |
  | `COUNTDOWN_FORMAT` / `COUNTDOWN_PRECISION` / `COUNTDOWN_PRECISION_MAX`                                                                               | `TIMER_FORMAT` / 无（缺省改了，见下）/ `TIMER_PRECISION_MAX`                                                                          |
  | `formatCountdown` / `quantizeCountdown` / `resolveCountdownPrecision` / `resolveCountdownValue` / `splitCountdown`                                   | `formatTimerText` / `quantizeTimer` / `resolveTimerPrecision` / 无 / `splitTimer`（多一段 `days`）                                    |
  | 类型 `CountdownApi` / `CountdownSchema` / `CountdownParts` / `CountdownPhase` / `CountdownLive` / `CountdownTranslations` / `CountdownFinishDetails` | `TimerApi` / `TimerSchema` / `TimerSegments` / `TimerPhase`（四相位）/ **`TimerLive`** / `TimerTranslations` / `TimerCompleteDetails` |
  | 类型 `XhCountdownElement`                                                                                                                            | `XhTimerElement`                                                                                                                      |
  | prop `value` / `active` / `format` / `precision` / `live`                                                                                            | **五个都在 `timer` 上了**，语义一字未变                                                                                               |
  | `api.text` / `api.parts`                                                                                                                             | `api.text` / `api.segments`（`segmentText(unit)` 取单段）                                                                             |
  | 事件 `onFinish`                                                                                                                                      | `onComplete`（Vue 侧 `@finish` → `@complete`）                                                                                        |
  | root 上的 `data-finished`                                                                                                                            | `data-state="completed"`                                                                                                              |
  | root 上的 `data-state="idle" \| "running"`                                                                                                           | 同名，另有 `paused` / `completed` 两档                                                                                                |
  | `[data-scope='countdown']`                                                                                                                           | `[data-scope='timer']`                                                                                                                |
  | 覆盖槽 `--xh-countdown-fg` / `--xh-countdown-finished-fg`                                                                                            | `--xh-timer-area-fg` / `--xh-timer-completed-fg`                                                                                      |
  | 子入口 `@xihan-ui/styles/countdown.css`                                                                                                              | `@xihan-ui/styles/timer.css`                                                                                                          |
  | 文案覆盖表的 `'countdown'` 键                                                                                                                        | `'timer'`                                                                                                                             |

  `timer` 这一批新增的入口（迁过来的人直接用得上）：

  - **受控通道**：给了 `value`（剩余毫秒）或 `active` 即进受控分支——`value` 就是起点、方向锁成倒着走、终点锁成 0，改写它即从新值重新计时；`active` 翻假停在当前值、翻真接着走；缺省即开跑（与 `countdown` 一致，不必写 `autoStart`）。受控时起停按钮不再改状态，root 上落 `data-controlled`。
  - **`format` / `precision`**：`api.text` 按模板铺字；模板多认一个 `D`（天），没写 `D` 时 `H` 收下全部小时数，与 `countdown` 的 `HH` 语义一致。
  - **`live`**：时间区的读屏播报档位，落成 `aria-live`，缺省仍是 `off`。

  **两处缺省不一样，迁过来要自己补**：

  - **`precision` 缺省是 3（毫秒，不量化）**，`countdown` 原来是 0（整秒）。要原来的行为写 `precision="0"`。
  - **数字自带展示档字号**（`timer` 是一台摆在页面上的计时器），`countdown` 原来不自带字号、跟着上下文走。嵌在一句话里或摆进别人的数值槽时把 `--xh-timer-digit-font-size` 写成 `inherit` 即回到原样。

  ## 皮肤选择器要自己搜一遍

  `[data-scope='ellipsis']`、`[data-scope='dynamic-input']`、`[data-scope='time']`、`[data-scope='result']`、`[data-scope='space']`、`[data-scope='popselect']`、`[data-scope='countdown']` 七个作用域不再有任何节点带上。选择器失配既不报错也不降级，请在自己的代码库里全文搜索这七个串，连同上面各表里的 `--xh-` 覆盖槽名一起换掉。

  ## 文档站的示例去了哪

  改名三件的示例目录跟着改名，内容一字未动。退役四件里：

  | 已删的示例                                                     | 去向                                                                                        |
  | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
  | `result/01-basic` / `04-size` / `05-icon`                      | `empty-state/01-basic` / `02-size` 已覆盖                                                   |
  | `result/02-status`                                             | 迁成 `empty-state/06-status`，四档通用结果各摆一台                                          |
  | `result/03-http`                                               | `empty-state/04-result` 已覆盖，那台现在带上了 `status`                                     |
  | `space/01-basic` / `02-direction` / `04-gap` / `05-align-wrap` | `flex/01-basic` / `02-direction` / `04-gap` / `03-align-justify` / `05-wrap-inline` 已覆盖  |
  | `space/03-split`                                               | 迁成 `flex/06-split`                                                                        |
  | `popselect/01-basic` … `06-clear`                              | 不迁：`select` 那一族与 `listbox/05-popover` 两处已覆盖全部场景，替代写法见上面那段组合示例 |
  | `countdown/01-basic` / `02-format` / `03-slot`                 | `timer/02-countdown` / `04-days` 与 `format` / `precision` 两个新入口已覆盖                 |
  | `countdown/04-control`                                         | 迁成 `timer/07-controlled`，受控通道两版都在                                                |

- 219cb90: ContextMenu 迁入与 Menu 同源的 M2 磨砂表面和菜单行布局。content 的背景、前景、描边、
  阴影、backdrop 与顶边高光均落到独立的 `--xh-context-menu-*` 覆盖槽；arrow 复用同一背景与描边，
  不重复模糊。separator、group label、正文和说明文字采用同一套磨砂语义值。

  条目保留 flex 主行和作者的真实节点顺序：任意图标、`item-text`、快捷键节点与子菜单箭头可以同排，
  `item-text` 占剩余空间并截断，只有 `item-description` 独占第二行。没有统一预留的 leading 列，
  也不会因为别的条目带 indicator 而移动当前条目。hover/highlight 与 open path 均使用中性淡底，
  pressed 加深一档；展开二级菜单没有始端色条、品牌蓝底或字重变化，disabled 使用不可用游标。

  浮层改用 `xh-overlay-slide-in` / `xh-overlay-slide-out`：首帧落位后按物理 placement 从锚点一侧淡入
  短移，退出沿原方向收回，不再缩放整张菜单。每层 positioner 会先清零四个方向变量，再激活本层
  唯一方向，避免 Web Components 的嵌套子菜单继承父方向后斜移。右键、长按、键盘与坐标定位逻辑未改。

  新增的稳定覆盖槽包括 `--xh-context-menu-backdrop`、`--xh-context-menu-highlight`、
  `--xh-context-menu-item-bg-pressed`、`--xh-context-menu-submenu-indicator-fg` 与
  `--xh-context-menu-separator-radius`。

  打开路径不再改变字重，既有 `--xh-context-menu-item-active-font-weight` 覆盖槽随之删除。请改用
  `--xh-context-menu-item-bg-active` 控制中性路径底色；这是公开 CSS 槽删除，因此 Styles 按 major 记录。

  皮肤体积（去注释、压空白）从 9775 增至 11873 字节；增量来自 M2 材质、四向短移动效与状态反馈。

- cbb844f: 所有带边框的控件盒改成同一条边线、不填底。`--xh-border-control` 在缺省档改为与装饰边界 `--xh-border-default` 同色（浅色 neutral 200、深色 700），输入框壳、Checkbox / CheckboxGroup / Transfer / Tree / Table 的方框、RadioGroup / QuestionFlow 的圆圈、Switch 轨道、InputGroup 组壳、ColorPicker 控件、FileUpload 拖放区、SignaturePad 画布，以及 Action Control `outline` 形态的按钮描边从此与旁边的浮层面板、卡片描边同一重量；`--xh-border-control-hover` 改为 neutral 400 / 550，悬停仍看得出一道台阶。

  字段家族 outline 档与上述控件盒的静息、聚焦、无效、加载态底色由 `--xh-bg-canvas` 改为 `transparent`，露出宿主的面；悬停在透明上罩 `color-mix(--xh-bg-subtle 45%, transparent)`，readOnly / disabled 仍填 `--xh-bg-subtle`。`--xh-bg-canvas` 保留给自动填充遮罩、色块选中环等必须不透明的地方。

  破坏性变化：缺省档的控件边界不再满足 WCAG 1.4.11 的 3:1（浅色 1.26:1），该门槛只在 `data-contrast="more"` / `prefers-contrast: more` 下保持（neutral 600 / 400）；令牌测试相应改为「缺省档与装饰边同色、高对比档 3:1、悬停棘轮」。铺在非白底上的字段不再自带白底，需要白底的宿主请写对应组件的底色槽，如 `--xh-text-field-control-bg: var(--xh-bg-canvas)`、`--xh-checkbox-bg: var(--xh-bg-canvas)`。

- d51d182: **两个输入框的槽收窄作用面：常态那一档的名字从此只管常态，一体式盒与独立输入框两档各调各的。** 两处都是「设一个槽，另一档跟着被改掉，而且再也调不开」，名字本身没删，改的是它管到哪儿——所以旧写法不会报错，只会静默变成另一种渲染，请按下表逐条核对。

  **text-field 的常态描边槽牵着聚焦描边。** `--xh-text-field-input-border` 按名字与用法都是 input 部件的常态描边，却同时排在聚焦描边的取值链最外层：只想把常态描边调淡一点，聚焦时的描边跟着一起变；而且一旦设了它，语气（`data-tone`）对聚焦描边彻底失效——语气被挤到链的第二层，永远轮不到。缺省档与 `outline` 档带这条链，`subtle` 与 `ghost` 两档本来就没有。现在两档的聚焦描边一律走 `var(--xh-_tone, var(--xh-border-control-focus))`，语气重新生效。

  | 从前这么写                                                 | 现在改成                               |
  | ---------------------------------------------------------- | -------------------------------------- |
  | `--xh-text-field-input-border`（想改一体式盒的聚焦描边）   | `--xh-text-field-control-border-focus` |
  | `--xh-text-field-input-border`（想改独立输入框的聚焦描边） | `--xh-text-field-input-border-focus`   |

  `--xh-text-field-input-border` 本身照旧，只管独立输入框的常态描边。

  **password-input 的控件盒没有自己的圆角槽。** `control` 是这个组件唯一的视觉盒，它的高度、内衬、间距、描边、底色与落影六项都走 `--xh-password-input-control-*`，唯独圆角走的是按 input 部件取名的 `--xh-password-input-input-radius`：控件盒的圆角没有按本部件取名的入口，改独立输入框的圆角会连盒一起改。新增 `--xh-password-input-control-radius`，中转的私有槽已删，两档各调各的——输入族另外六家都是这个形态。

  | 从前这么写                                               | 现在改成                             |
  | -------------------------------------------------------- | ------------------------------------ |
  | `--xh-password-input-input-radius`（想改一体式盒的圆角） | `--xh-password-input-control-radius` |

  `--xh-password-input-input-radius` 本身照旧，只管不写 `control` 那一档里输入框自己的圆角。

  **新增 `--xh-form-summary-item-underline-offset`。** 错误摘要里每一条都是一个真链接，下划线的偏移从前写死 2px，而同一件事在 typography 的链接上早就是 `--xh-typography-link-underline-offset`：使用者调全站链接的下划线偏移，表单摘要里的链接不跟着动。缺省仍是 `var(--xh-space-0_5)`，渲染与从前一致。

- d51d182: **「当前项」的前景色与字重收成一套槽名。** `anchor` / `breadcrumb` / `navigation-menu` 三家画的都是 `[data-current]` 那一行，槽名却是三套：使用者写一条规则改「当前项」的颜色，只能命中三分之一。

  统一到 `--xh-<组件>-link-fg-current` / `--xh-<组件>-link-font-weight-current`，也就是本库槽名的常规构词 `--xh-<组件>-<部件段>-<属性>-<状态>`：部件段是规则真正作用的那个 `link` 部件，状态段是 `current`。`navigation-menu` 已经是这个写法，不动。

  `anchor` 的 `-active` 尤其要换掉：`active` 在本库已经被 `:active` 按压态占着（`--xh-download-trigger-bg-active`、`--xh-back-top-bg-active` 这一族），列表族的强档 `-bg-active` 又表达展开路径，同一个词已经一名二义，用它再表示「当前项」是第三义，而且与相邻的按压态槽读起来完全一样。

  **默认渲染逐像素未变。** 四个旧名本来只占兜底位的槽名，取值来源没动。

  **破坏性：下列 4 个公开槽已删，设它们不再有任何效果。**

  | 已删的旧名                            | 换成                                       |
  | ------------------------------------- | ------------------------------------------ |
  | `--xh-anchor-link-fg-active`          | `--xh-anchor-link-fg-current`              |
  | `--xh-anchor-link-font-weight-active` | `--xh-anchor-link-font-weight-current`     |
  | `--xh-breadcrumb-current-fg`          | `--xh-breadcrumb-link-fg-current`          |
  | `--xh-breadcrumb-current-font-weight` | `--xh-breadcrumb-link-font-weight-current` |

- 363022a: DatePicker 的快捷项与内嵌时间项改用末端对号表示持久选值。选中正文恢复普通颜色和字重，静止态不再铺品牌底；悬停与键盘焦点使用中性底，Calendar 日期格、范围连片和预览视觉保持原样。

  时间数字使用双侧等宽标记轨，确保对号出现前后及 RTL 下都保持数学居中。禁用正文与对号统一进入失效态，forced-colors 下使用系统 `CanvasText` / `GrayText` 并保留公共选中轮廓。

  手机复合面板把时间项的默认对号改用 `--xh-control-indicator-sm`（comfortable 12px、compact 10px），使日历与时 / 分两列在 375px 内继续同排；平板、桌面与快捷项保持 16px。公开 `*-check-size` 覆盖始终优先。

  删除 `--xh-date-picker-preset-bg-selected` 与 `--xh-date-picker-time-item-bg-selected`。迁移自定义主题时，选中标记分别改用新增的 `--xh-date-picker-preset-check-size` / `--xh-date-picker-preset-check-fg` 和 `--xh-date-picker-time-item-check-size` / `--xh-date-picker-time-item-check-fg`；既有两项 `*-fg-selected` 仍只控制正文。

  日期值、时间写回、快捷项选择、范围与 Calendar 机器逻辑均未改变。

  归一化后的 `date-picker.css` 从 19929 B 增至 23665 B，新增内容集中在两类末端标记轨、状态反馈与高对比补救。

  皮肤体积（去注释、压空白）：前一提交源码 23179 字节，当前 23662 字节；登记基线 23179 → 23662，只更新本组件，10% 容差保持不变。

- 390fa7a: **退役 glass 材质；M4 elevated 改为不透明的 sheet 实体面。**

  删除 `material.glass` 配方及全部 `--xh-material-glass-*` 令牌（bg、backdrop、border、highlight、shadow、separator、fg、fg-muted、focus-surface），不提供别名，也不把非法值映射为 frosted。材质只保留 solid（M0）、soft（M1）、frosted（M2）、elevated（M4）四档。

  `--xh-material-elevated-*` 改为完全不透明、无背景模糊、无顶部高光，只保留三层高层投影；Dialog 主阅读面与头部 lens 都使用它。BackTop、FloatButton、FloatingPanel 的默认面迁到 `--xh-material-frosted-*`；PromptInput 的默认外壳迁到 `--xh-material-soft-*`。

  破坏性：消费 `--xh-material-glass-*` 的自定义样式必须显式改为 frosted 或实体材质；Dialog 内容不再采样背景。

- ca8156d: **统一点击触感：按下 120ms 进入 active 面并缩到 0.97，释放 200ms 回到 hover / rest；禁用同时降级前景与表面，不再只降低 opacity。**

  令牌新增 `--xh-motion-duration-press`（120ms）、`--xh-motion-duration-release`（200ms）、`--xh-motion-ease-press`（standard）与 `--xh-motion-ease-release`（out-strong），减弱动效档两段时长归 1ms。

  Action Control 家族配方的 rest 规则改为 `scale` 走 release 段，`:active` 规则追加 press 段的时长与曲线；Collection Item 家族配方的换面同节奏，`:active` 只改时长与曲线，不缩放整条。所有手写按压反馈的皮肤（83 处 rest 过渡、91 处 `:active` 规则）统一接入同一时间线；`segmented` 删除私有的 `--xh-segmented-item-press-scale` 槽，按压缩放一律走 `--xh-motion-scale-press`。

  Action Control 家族的 disabled 状态改为 `--xh-bg-subtle` + `--xh-fg-disabled` 且 opacity 为 1；Button 不再为 solid / 默认变体保留品牌底的禁用面，outline / ghost 变体禁用时保持透明底；Toggle 新增 `--xh-toggle-bg-disabled` / `--xh-toggle-fg-disabled` / `--xh-toggle-border-disabled` / `--xh-toggle-bg-on-disabled` / `--xh-toggle-fg-on-disabled` 槽，选中且禁用时底色掺一半中性面；Accordion 与 Collapsible 的禁用触发器改为 `--xh-accordion-trigger-fg-disabled` / `--xh-collapsible-trigger-fg-disabled`。

  破坏性：`--xh-segmented-item-press-scale` 被删除；按钮与切换按钮的禁用外观由淡化品牌面改为中性面。

- c981f41: **形状令牌按设计真源回正为 4 / 8 / 12px 小圆角阶梯，新增 `--xh-shape-circle`，全部组件按家族身份重新归位圆角。**

  `--xh-shape-control` 由 8px 改为 4px，`--xh-shape-surface` 由 12px 改为 8px，`--xh-shape-overlay` 由 24px 改为 12px；新增 `--xh-shape-circle: 50%` 表示正圆身份。`--xh-shape-inset`（4px）与 `--xh-shape-pill` 不变。

  皮肤按家族身份消费形状令牌：Button、ButtonGroup、Toggle、ToggleGroup、Toolbar 条目、Clipboard 复制钮、DownloadTrigger 从胶囊改为 control 4px；Tabs 分段变体的标签带与 Segmented 轨道改为 surface 8px、标签本体 control 4px；字段外壳（TextField、DateField、DatePicker、DateRangePicker、TimeField、TimePicker、TimeRangePicker、Select、ColorField、NumberField、Field、InputGroup）改为 control 4px；Popover、Menu、ContextMenu、Menubar、HoverCard、Popconfirm、Tour、Dialog、Drawer、Notification、FloatingPanel、Select / Combobox / Cascader / TreeSelect / Mention / DatePicker / DateRangePicker / TimePicker / TimeRangePicker / ColorPicker 的浮层内容、NavigationMenu 内容、Pagination 面板、SideNav 弹出面改为 overlay 12px；Card 改为 surface 8px；日历格子改为 inset 4px；Avatar、AvatarGroup 溢出项、BackTop、FloatButton、Carousel 翻页钮与指示点、Spinner、Steps 指示器、Timeline 指示器、Switch 滑块、Skeleton 圆形、QuestionFlow 圆点、IconWrapper、ImageCropper 把手、Slider / ColorSlider / ColorPicker 拇指、RadioGroup 指示器、Log / MessageFeed 回到底部钮、Dialog 指示器改为 circle。Action Control 家族的 floating profile 同样改为 circle。

  破坏性：依赖旧默认圆角的自定义样式与视觉基线需要更新；`--xh-shape-*` 的值改变会影响所有未显式覆盖组件圆角槽的消费者。定位引擎的箭头端距改为对齐 `--xh-shape-overlay`。

- f0a2e34: **摘掉全部旧名兼容层。** 前几批改槽名时写成 `var(--新名, var(--旧名, 令牌))` 三层，让旧名继续生效。本库不留兼容层：中间那一层旧名全部删除，链路收回 `var(--新名, 令牌)` 两层。槽后面跟着的默认值不动——那是覆盖槽机制本身，不是兼容位。

  **默认渲染逐像素未变。** 旧名本来就只占兜底位，摘掉之后每一处仍落在原来那个令牌上；八件像素基线（button / text-field / select / menu / popover / dialog / drawer / toast）无差异。

  **破坏性：下列 40 个公开槽已删，设它们不再有任何效果。** 这四种介质没有 IDE 提示，改名之后你那条声明只会静默失配——请在自己的代码库里逐个全文搜索，换成右边那个名字。

  | 已删的旧名                           | 换成                                                                                                |
  | ------------------------------------ | --------------------------------------------------------------------------------------------------- |
  | `--xh-back-top-trigger-size`         | `--xh-back-top-size`                                                                                |
  | `--xh-date-picker-confirm-bg`        | `--xh-date-picker-confirm-trigger-bg`                                                               |
  | `--xh-date-picker-confirm-bg-hover`  | `--xh-date-picker-confirm-trigger-bg-hover`                                                         |
  | `--xh-date-picker-confirm-bg-active` | `--xh-date-picker-confirm-trigger-bg-active`                                                        |
  | `--xh-date-picker-confirm-fg`        | `--xh-date-picker-confirm-trigger-fg`                                                               |
  | `--xh-date-picker-confirm-shadow`    | `--xh-date-picker-confirm-trigger-shadow`                                                           |
  | `--xh-highlight-radius`              | `--xh-highlight-mark-radius`                                                                        |
  | `--xh-highlight-bg`                  | `--xh-highlight-mark-bg`                                                                            |
  | `--xh-highlight-fg`                  | `--xh-highlight-mark-fg`                                                                            |
  | `--xh-layout-sider-width`            | `--xh-layout-sider-w`                                                                               |
  | `--xh-layout-sider-collapsed-width`  | `--xh-layout-sider-collapsed-w`                                                                     |
  | `--xh-notification-gap`              | `--xh-notification-item-gap`                                                                        |
  | `--xh-notification-row-gap`          | `--xh-notification-item-row-gap`                                                                    |
  | `--xh-notification-w`                | `--xh-notification-item-w`                                                                          |
  | `--xh-notification-py`               | `--xh-notification-item-py`                                                                         |
  | `--xh-notification-px`               | `--xh-notification-item-px`                                                                         |
  | `--xh-notification-border`           | `--xh-notification-item-border`                                                                     |
  | `--xh-notification-radius`           | `--xh-notification-item-radius`                                                                     |
  | `--xh-notification-bg`               | `--xh-notification-item-bg`                                                                         |
  | `--xh-notification-fg`               | `--xh-notification-item-fg`                                                                         |
  | `--xh-notification-shadow`           | `--xh-notification-item-shadow`                                                                     |
  | `--xh-notification-font-size`        | `--xh-notification-item-font-size`                                                                  |
  | `--xh-notification-leading`          | `--xh-notification-item-leading`                                                                    |
  | `--xh-password-input-hint-gap`       | `--xh-password-input-caps-lock-gap`                                                                 |
  | `--xh-password-input-hint-px`        | `--xh-password-input-caps-lock-px`                                                                  |
  | `--xh-password-input-hint-fg`        | `--xh-password-input-caps-lock-fg`                                                                  |
  | `--xh-password-input-hint-font-size` | `--xh-password-input-caps-lock-font-size`                                                           |
  | `--xh-popconfirm-cancel-trigger-px`  | `--xh-popconfirm-action-px`                                                                         |
  | `--xh-toggle-group-radius`           | `--xh-toggle-group-item-radius`                                                                     |
  | `--xh-transfer-header-gap`           | `--xh-transfer-panel-header-gap`                                                                    |
  | `--xh-transfer-header-py`            | `--xh-transfer-panel-header-py`                                                                     |
  | `--xh-transfer-header-px`            | `--xh-transfer-panel-header-px`                                                                     |
  | `--xh-transfer-title-fg`             | `--xh-transfer-panel-title-fg`                                                                      |
  | `--xh-transfer-title-font-size`      | `--xh-transfer-panel-title-font-size`                                                               |
  | `--xh-transfer-title-font-weight`    | `--xh-transfer-panel-title-font-weight`                                                             |
  | `--xh-transfer-count-fg`             | `--xh-transfer-panel-count-fg`                                                                      |
  | `--xh-transfer-count-font-size`      | `--xh-transfer-panel-count-font-size`                                                               |
  | `--xh-tree-indicator-fg`             | `--xh-tree-item-indicator-fg`                                                                       |
  | `--xh-tree-select-indicator-size`    | `--xh-tree-select-item-indicator-size` / `--xh-tree-select-branch-indicator-size`（两个部件各一个） |
  | `--xh-typography-text-fg`            | `--xh-typography-text-fg-muted` / `--xh-typography-text-fg-tone`（次要档与语气档各一个）            |

  **另有一组名字没删，但管辖范围收窄了。** `--xh-navigation-menu-content-p` 此前同时改逐项面板与共享外壳，现在只管 `content`。要改外壳写 `--xh-navigation-menu-viewport-p`。

- 0f2072f: Editable 改为与 NumberField 一致的一体式字段结构：标签在上，`control` 是唯一的边框、背景、圆角、落影与焦点环载体，预览文字或输入框与动作组都位于框内。预览态只显示编辑图标，编辑态只显示确认与取消图标；空按钮由共享皮肤使用 Pencil、Check、Close 字形绘制，作者仍需提供可访问名称。

  Breaking：字段表面覆盖槽从 `--xh-editable-input-*` 迁移为 `--xh-editable-control-*`；独立按钮边框、圆角和实心提交按钮相关槽已移除，动作尺寸与分隔线改用 `--xh-editable-trigger-size`、`--xh-editable-trigger-divider` 和 `--xh-editable-trigger-divider-h`。

  新增一体式字段排布、三颗图标动作、粗指针命中区与状态样式后，`editable.css` 的去注释压空白体积由 10,386 字节增至 13,335 字节。

- 8e35021: **空状态的 `status` 只收 `'404' | '403' | '500'` 三个状态码；成功 / 警示 / 出错 / 提示改走 `tone`。**

  `status` 原来把结果页的状态码与通用结果的语气混在一根轴上：`'error'` 与 `tone="danger"` 说的是同一件事、写法却有两套，也与全库的语气轴对不上。现在 `status` 只表达结果页的状态码，皮肤仍把它们并进最接近的一族语气色；`'success' | 'warning' | 'error' | 'info'` 四档撤掉，改写 `tone="success" | "warning" | "danger" | "info"`，两者都写时以 `tone` 为准。三端同步：`EmptyStateStatus` 收窄，自定义元素的 `status` attribute 取值同步；皮肤撤掉四条按通用结果换色的规则；「结果类型」示例改成语气示例。

- 3480651: Field Chrome 家族的静息形态回到描边式：`--xh-bg-canvas` 底、`--xh-border-control` 描边、control 圆角、无阴影，
  不再消费 `--xh-elevation-raised`；配方新增 `outline` / `subtle` / `ghost` 三档 × 七态矩阵，由
  `[data-xh-field-chrome][data-variant]` 命中，disabled 一律 `--xh-border-default` + `--xh-bg-subtle`，readOnly 只换底色，
  聚焦描边一律 `--xh-border-control-focus`。Text Field 与 Color Field 的默认外观随之变化（默认即 `outline`），
  `--xh-text-field-control-*` / `--xh-color-field-control-*` 的默认来源改为家族形态槽。

  Text Field 与 Color Field 的 control 部件新增 `data-variant` 投影。

- 622a825: 单行字段不传尺寸时一族同宽：新增语义令牌 `--xh-control-w`（16rem），下拉、日期、时间、文本、数字、密码、颜色、标签、提及、就地编辑、剪贴板等 18 份字段皮肤的根缺省 `inline-size: var(--xh-<组件>-control-w, var(--xh-control-w))`，宽度不再随内容走（此前只有 12rem 地板，实际宽由原生输入的字宽、选中项文字或示例内联样式决定，同一页里 192 到 480 不等）。地板改写成 `min(缺省宽, --xh-<组件>-control-min-w, 100%)`：把缺省宽钉到底线以下时不必再放开底线。

  日期范围选择器是登记过的例外：起止两组按日的段位、分隔符与日历钮放不进 16rem，缺省按内容撑开（`--xh-date-range-picker-control-w` 仍可钉宽），地板取 `--xh-control-w`，按年、按月时不比别的字段窄。Clipboard 只放复制钮的用法仍是一颗独立按钮。

  破坏性变化：字段根不再随内容变宽，要撑满表单列请在根上写 `inline-size: 100%`；Clipboard 的 `--xh-clipboard-input-min-w` 移除，改为根上的 `--xh-clipboard-control-w` 与 `--xh-clipboard-control-min-w`，输入框改为撑满复制钮之外的剩余宽度。

- 6b4c5d0: **聚焦环从「画在元素外面」改成「画在元素自己那一圈」。** `--xh-ring-offset` 由 `2px` 改为 `calc(-1 * {ring.width})`，环的外沿与元素边框外沿重合。此前键盘落焦时控件的绘制外沿每边外扩 4px（偏移 2 + 环宽 2）——按钮 54×32 画到 62×40、勾选框 16×16 画到 24×24、sm 档图标钮 28×28 画到 36×36；现在逐档外扩 0px，聚焦前后一样大。

  **库里从此只有一种偏移。** 此前并存五种写法：`var(--xh-ring-offset)`（外扩 2px，30 处）、`calc(-1 * var(--xh-ring-width))`（内收 2px，9 处）、`--xh-_ring-offset: var(--xh-_ring-inset)`（内收 2px，46 处）、`calc(-1 * var(--xh-stroke-thin))`（内收 1px，color-picker 的通道输入框）、`var(--xh-stroke-thin)`（外扩 1px，tags-input 三处）。全部收敛到 `var(--xh-ring-offset)`：46 处槽赋值连同 `--xh-_ring-inset` 一起删除（令牌默认已是内收），其余四种改写成令牌。高对比档与打印档里那些画状态与形状的 outline 不在此列，逐条未动。

  **实心面上的环换成面自己的前景色。** 环画进元素之后压着的是元素自己的面。面是实心品牌底时环色（brand-500）与面（brand-600）只有 1.37:1，贴上去看不出来；这类档在各自皮肤的 `:focus-visible` 规则里把新的私有槽 `--xh-_ring-color` 灌成 `currentColor`，环随之取面自己的前景色——那一族色本来就要在这块面上把字读清楚。34 条规则铺在 31 份皮肤上：`button`/`download-trigger`/`tag`/`tag-group` 的 solid 形态、`checkbox`/`switch`/`toggle`/`toggle-group`/`transfer`/`tree` 的勾选与开档、`calendar`/`carousel`/`pagination`/`time-picker`/`table` 的当前与选中档、以及 approval / editable / form / popconfirm / prompt-input / question-flow / tour / date-picker 的提交类按钮等。公共层只留槽的默认值，名单不收在 `focus.css` 里——谁的面是实心的由那份皮肤自己知道。

  **`heatmap` 的格距不再从环几何推。** 它此前把格距与上下内衬写成 `calc(var(--xh-ring-offset) + var(--xh-ring-width))`，为的是让外扩的环整圈落进格子之间的空当。环不再外扩，这个推导会把格距算成 0，改为直接取 `--xh-space-1`：**取值仍是 4px，渲染逐像素不变**。

  浏览器态判据 `focus-ring-inset-grpring.spec.ts` 逐档量聚焦前后的布局盒与绘制外沿（差 0）、扫随库发出去的样式表确认只有一种偏移、并对 44 个实心面档逐条核对环色与面的对比度不低于 3:1。高对比档（`forced-colors: active`）下环照旧由系统色画出，未受影响。

- 49a335c: Action Control 家族默认改为平面中性底，去掉顶光、描边与接触影；需要品牌实心、显式描边或海拔的组件继续通过状态槽明确映射。
- d32d99f: ButtonGroup 首尾圆角改为胶囊形，并将可选分隔线收窄到控件中部。分隔线不再引入额外间距，禁用状态降低对比度。

  移除不再适用的 `--xh-button-group-separator-inset` 与 `--xh-button-group-separator-gap`，新增 `--xh-button-group-separator-size`、`--xh-button-group-separator-opacity` 与禁用透明度覆盖槽。

- 4eb7b13: Card 默认外观改为纯净实体面、透明边界与轻接触影，并统一标题、正文、相邻内容段和四种形态的视觉层级；保留既有可选部件、分段和悬停契约。
- 35a3576: 按钮在没有显式 `variant` 时改为品牌实心胶囊外观，并让焦点、禁用与载入态保留当前形态。
  需要原先灰色柔和按钮的界面应显式设置 `variant="subtle"`。
- e1fd6c1: Text Field 默认外观改为无边框实体面、轻阴影与 12px 表面圆角；显式边框、柔和填充和透明底
  分别由 `outline`、`subtle` 与 `ghost` 提供。
- b71c784: Select 默认控件改为无边框实体面、轻阴影与 12px 圆角；`outline`、`subtle` 与 `ghost` 保留独立形态。选项按压改用可过渡的背景色，并将选中标记覆盖槽更名为 `--xh-select-item-check-fg`。

  同步校准复用 Select 字段与弹层结构的 TreeSelect 计算样式基线。

  Web Components 在首次键盘展开后，待 `inert` 移除且 Portal 同步完成再补焦点到高亮项。

- 8d395ab: Toggle 接入共享 Action Control 视觉配方，统一尺寸、按压、焦点、禁用与粗指针命中区。默认外观改为浅色胶囊面，按下状态使用品牌淡底；`solid`、`subtle`、`outline` 与 `ghost` 保留各自语义。

  品牌 `solid` 在深色主题中使用深品牌面与浅色文字，与主按钮保持一致。

  Headless 新增 `data-xh-action-control`、profile、display 与 size 视觉角色属性。样式新增 off/on 的 active、border 与 on-hover/on-active 公开覆盖槽。

- ab984e8: ToggleGroup 默认外观改为浅色胶囊分段控件，选中项使用品牌淡底；`solid` 继续提供强品牌选中态。组内按压不再缩放，分隔线改为覆盖接缝的半高细线。

  ButtonGroup 与 ToggleGroup 的 `outline` 改由组根绘制一条连续外框，子项不再各自绘制贯穿全高的边框；组内仍使用半高分隔线。

  移除 `--xh-toggle-group-separator-inset` 与 `--xh-toggle-group-separator-gap`，新增 separator size、opacity 与 disabled opacity 覆盖槽。

  ButtonGroup 与 ToggleGroup 默认自动生成相邻项分隔线，并新增 `separators` 属性控制显示。移除 `XhButtonGroupSeparator`、`XhToggleGroupSeparator` 及对应 Headless separator 部件与 connect API；分隔线改为适配器内部结构，不再要求作者手工维护。

  Button、ButtonGroup、Toggle 与 ToggleGroup 皮肤增加浅色/深色交互状态、连续外框和自动分隔线规则；同步更新 CSS 体积基线。

  视觉环境控制器迁入 Core，适配器不再硬依赖 Tokens；`@xihan-ui/tokens/runtime` 保持原导出入口。

- 5f18462: KbdGroup 改为多枚键名共享同一枚 24px 键帽表面，并新增 `default` 与 `light` 两种外观。

  移除分隔符部件与可见加号，同时删除 `size`、`pressed`、`disabled` 属性；整组可访问名称继续保留完整的组合键读法。

- 78ccfcb: 将快捷键展示与行为直接拆成唯一职责边界，不保留旧展示分支。

  新增无状态 `Kbd` / `KbdGroup` family：Vue 与 React 分别公开 `XhKbd`、`XhKbdGroup`，
  Web Components 新增 `<xh-kbd>`、`<xh-kbd-group>`。单枚键帽使用原生 `<kbd>`；组合由
  Headless 统一完成平台格式化、连接符、修饰键身份与整组可读名称，视觉键帽和连接符从无障碍树隐藏，
  整组只朗读一次。`value` / `keys` 必填，空声明和空读屏翻译直接报错。

  `Hotkeys`、`XhHotkeys`、`<xh-hotkeys>` 与 `useHotkeys` 现在只负责注册和匹配，不再生成 DOM。
  删除 `HotkeysApi.segments`、`separator`、`segmentOf`、三个视觉 getter、`HotkeysKeyProps`、
  `HotkeysTranslations` 以及 Hotkeys 的 `size` / `translations` props。`keys` 改为必填；空组合或
  包含多枚主键的组合直接报错。删除 `target='parent'`，局部范围改为返回真实 EventTarget 的显式 resolver；
  SSR 不读取 ambient document，卸载仍精确解绑监听。

  删除 `@xihan-ui/styles/hotkeys.css` 与全部 `--xh-hotkeys-*` 槽，新增 `kbd.css` / `kbd-group.css`。
  键帽使用 20 / 24 / 28px 三档中性实体面、等宽字与内嵌底缘压感；只有显式 `pressed`
  事实或真实可交互 owner 的 `:active` 才轻压。禁用、compact、RTL、forced-colors 与 200% 缩放
  均由新 family 独立承担。

  Command、Menu、ContextMenu 与快捷键文档示例已迁移为显式组合 Hotkeys + KbdGroup，
  没有 `XhHotkeys` 视觉别名或双轨兼容层。

- 66d7ad5: Kbd 收敛为固定 24px 的纯展示键帽，新增 `default` 与 `light` 两种外观。

  移除 `size`、`pressed`、`disabled` 属性以及按钮式压感、单独禁用状态和密度分支；组合与禁用语义继续由 KbdGroup 负责。

- 16f8296: **Kbd 统一为“键盘按键”。** 单键和组合键改用同一个 `keys` 数组输入；默认只展示，显式开启 `register` 后才安装快捷键监听，并继续支持 `target`、`enabled`、`preventDefault` 与 `hot-key`。

  移除重叠的 Hotkeys、KbdGroup、`useHotkeys`、`<xh-hotkeys>`、`<xh-kbd-group>` 和 `kbd-group.css`。对应展示与监听能力均并入 Kbd，不提供旧名称兼容层。

  组合键在同一表面内以 4px 间隙分隔，新增逐键部件、注册状态与禁用色，使 `kbd.css` 的压缩体积由 1185 字节增至 1654 字节；退役的 `kbd-group.css` 同步从体积基线移除。

- cd74476: **新增** `log` 的 `scroll-button` 与 `live-region` 两个部件：内置的「回到底部」和一块视觉隐藏的播报区，两个适配器同时可用。

  `log` 此前只有 `root` / `viewport` / `content` / `line` 四层：粘底状态透出来了，但离底之后没有归位的入口——每个用它的人都得自己画一颗按钮、自己判断什么时候露出来；而它整块内容会不会被读屏念、什么时候念，作者一点都插不上手。补上这两个部件之后，「任意内容的粘底滚动 + 视口自己是 Tab 停靠点 + 内置回到底部 + 播报区」这一组能力在 `log` 上齐了。

  - `scroll-button`：只按「在不在底」判定露面，不看粘附意图；收起走 `hidden` 不卸载节点，冒出来时带一段淡入缩放。留空则由皮肤画一枚向下的字形，往按钮里塞节点即换成自己的图形。可访问名走 `translations.scrollToBottom`。
  - `live-region`：`role=status` + `aria-live=polite` + `aria-atomic`，宿主往里写整句要念的话。

  **行为变更**：视口现在显式发 `aria-live="off"`。`role=log` 隐含 polite 活区，一行来一句地念会把连成串的输出变成读屏里的噪声；播报改由 `live-region` 承担，宿主决定念哪一句、什么时候念。要保留播报的，渲上 `live-region` 部件并在一段输出收尾时写进整句结论；把每一行原样写进去等于把逐行播报又打开一遍。

  `rows` / `loading` / `threshold` / `onStickChange`、四个原有部件的属性形状，以及 `atBottom` / `sticking` 的语义都不动。

- db52f9b: **`matrix-code` 新增 `data-matrix` 码制与 `gs1` 模式；根上的 `data-modules` 与 api 的 `count` 改为列、行两个数。**

  `format="data-matrix"` 画 Data Matrix ECC 200（ISO/IEC 16022，含 2024 版并入的矩形扩展 DMRE 共 48 档尺寸）：编码器自写，ASCII 模式（数字两两压缩、Latin-1 以外的字符按 UTF-8 并声明 ECI 26），多块交错的 52×52 以上与 144×144 的 8+2 分块都按规范处理；`rectangular` 从矩形尺寸里挑，窄条标签放得下。Data Matrix 没有码眼，只铺模块那一条 `<path>`，L 形定位图形随 `moduleShape` 一起换——点刻打标出来的 Data Matrix 就是一排点。缺省静区按码制的规范值（qr 4、data-matrix 1）。里德-所罗门抽成共享的 `createReedSolomon(primitive, firstRoot)`，QR 与 Data Matrix 各自建域。

  `gs1` 三端同名（自定义元素 attribute `gs1`）：QR 在字节模式段前放 FNC1 首位指示符、Data Matrix 最前面放 FNC1 码字，即 GS1 QR / GS1 DataMatrix；变长 AI 之间用内容里的 GS（U+001D）分隔。`qrEncode` 与 `qrCapacityBytes` 各多一个可选参数。

  破坏性：一张码不再恒是正方形，`MatrixCodeApi.count` 拆成 `columns` 与 `rows`，根上的 `data-modules` 改为 `data-columns` 与 `data-rows`；`pixelSize` 现在是宽度，高按含静区的模块比例算出（正方形码不变）。`data-level` 与 `data-version` 只在 qr 下写。对当前码制没有意义的选项（`level` / `eyeShape` / `logo` 给了 data-matrix、`rectangular` 给了 qr）往诊断通道报一条新的 `matrix-code.option-ignored` 警告，按没给处理，码照画。

- 0daae33: **`mention` 的输入框从可变多行改成单行输入框，与其它输入控件一致。**

  原先 `getInputProps` 走 `normalize.textarea`，三家适配器各自渲一个 `<textarea>`，皮肤给它 `min-block-size` 与 `resize: vertical`——框高按行数撑、还能拖着往下拉。现在它是一个 `<input type="text">`：框高定在控件档（`--xh-mention-input-h` 回退 `--xh-control-h-*`），纵向内距归零，与 `text-field` 的单行档并排时等高。

  破坏面逐条：

  - **渲出来的元素换了。** Vue 的 `XhMentionInput`、React 的 `XhMentionInput` 都渲 `<input>`；Web Components 侧作者自己摆的那个 `input` 角色节点必须从 `<textarea>` 改成 `<input>`。按 `HTMLTextAreaElement` 取件、或用 `rows` / `resize` 之类只有多行才有的属性去接的代码要改。
  - **`as` 入口整个撤掉。** `getInputProps` 不再收参数；`MentionInputHost` 与 `MentionInputProps` 两个类型不再导出；Vue 与 React 的 `XhMentionInput` 不再有 `as` prop；`MentionInputEl` 从 `HTMLTextAreaElement | HTMLInputElement` 收窄成 `HTMLInputElement`。
  - **无障碍属性从「多行那一档」翻到「单行那一档」。** 之前多行宿主上 `role` / `aria-expanded` / `type` 三条一并缺席（`textarea` 的允许角色只有 textbox，而 `aria-expanded` 不在 textbox 的支持属性里）；现在恒发 `role="combobox"`、`type="text"` 与 `aria-expanded="true" | "false"`。断言过这三条为空的用例要改。
  - **回车那一行的说法变了。** 有高亮可提交时照旧吞掉按键；一条候选都提交不了时仍然不吞——只是单行输入框里这一发不再是换行，而是留给表单做隐式提交。键盘表里 `mention.kbd.newline` 随之更名为 `mention.kbd.enter-pass`。
  - **使用者覆盖槽 `--xh-mention-input-py` 撤销**（连同它背后的私有槽 `--xh-_mention-py`）。这两个槽只喂输入框那条 `padding-block`，纵向内距归零之后没有使用者，改它已经不起作用。框高仍走 `--xh-mention-input-h`，尺寸档照旧由 `data-size` 换。

  **需要在多行正文里 @ 人的，本库现在没有替代品。** `prompt-input` 是 AI 场景的提示输入框，形态、键位与提交语义都不是一回事，不能当多行提及用；`text-field` 的多行档没有提及能力。这条能力就是被去掉了，不是搬去了别处。

  浮层落位不受影响：定位引擎的锚点一直是输入框本身（`refs.getInputEl`），从来不按插入符算——换掉宿主标签之后，候选面板照旧贴着整个框的下缘、左缘与框对齐。输入法组合期的行为也没动：组合中的按键一律不接，那一发归输入法候选框。

- 0781fa5: Mention 的候选、空结果与加载相位改为共用 `content` 的唯一浮层表面。`empty`、`loading` 继续作为
  listbox 的同级 `role=status`，只叠加状态文字，不再各画一张边框、背景和阴影卡片；没有状态文案的手写结构
  不会留下空白浮层，自动结构既有的 `No results` 保持不变。

  候选计数与导航现在排除带 `hidden` 的 item。全部候选隐藏或移除后同步清空高亮与
  `aria-activedescendant`，方向键、Enter、程序化点击与指针事件都不会操作不可见旧候选。loading 只在零可见候选时显示；
  已有候选时列表保持可见可操作，仅通过 `aria-busy` 报后台刷新。Mention 的前缀识别、光标位置、
  Enter 插入与无候选时放行回车的语义不变。

  新增 `--xh-mention-content-min-h`。移除不再拥有表面的 `--xh-mention-empty-bg`、
  `--xh-mention-empty-border`、`--xh-mention-empty-radius`、`--xh-mention-empty-shadow`、
  `--xh-mention-loading-bg`、`--xh-mention-loading-border`、`--xh-mention-loading-radius` 与
  `--xh-mention-loading-shadow`，不保留可重新画出双层状态卡片的兼容分支。

  异步示例三端统一显式使用现有 Empty/Loading 部件与 loading/collection 状态，没有新增 API。

  皮肤体积（去注释、压空白）：前一提交源码 12163 字节，当前 12266 字节；登记基线 12163 → 12266，只更新本组件，10% 容差保持不变。

- 326a79d: 修正 Menu、ContextMenu、Menubar 的作者内容排版：图标、正文和快捷键恢复 flex 同排，正式 item-text 负责长文省略，只有说明部件另起一行，子菜单箭头仍在主行末端。

  移除展开项左侧色条及其 2px 预留边，展开背景改为中性灰。删除没有用途的 item-path-indicator、item-leading-size 及对应 group-label-leading 覆盖槽；不保留隐藏开关。M2 表面与无缩放位移动效继续生效。

  三种菜单按真实文档示例补齐 LTR/RTL、图标文字快捷键同排、长文、无侧条及中性展开背景回归。

- 31ad51e: Menu 内容面与箭头使用同源 M2 磨砂、实体前景、边界与浮层投影。进退场沿实际 placement 短移淡变；各层先清零四向变量，避免嵌套继承斜移。

  条目保留 flex 主行与作者的真实节点顺序，图标、正文及快捷键同排；正式 item-text 占剩余宽度并截断，item-description 独占第二行。子菜单箭头位于主行末端。展开项采用中性淡底，无侧条、默认品牌蓝底或字重变化。

  删除 --xh-menu-item-active-font-weight；需要定制展开项底色时使用 --xh-menu-item-bg-active。路径条与虚拟 leading 列不作为公开能力保留。独立的 checkbox/radio 菜单项仍待行为与可访问语义一起实现；作者可以自行显示快捷键提示。

- 06b700f: Menubar 顶层控制条继续承担导航职责并保持原表面，弹出的菜单面迁入 Menu / ContextMenu 同源的 M2
  Frosted Surface：边界、背景、前景、投影、backdrop、顶光与箭头逐值一致，新增 `--xh-menubar-backdrop`
  和 `--xh-menubar-highlight` 覆写槽；箭头只延续面板底色与边界，不重复采样模糊。

  弹出菜单条目保留 flex 主行和作者的真实节点顺序：任意图标、`item-text`、快捷键节点与子菜单箭头
  可以同排，`item-text` 占剩余空间并截断，只有 `item-description` 独占第二行。没有统一预留列。
  悬停/键盘锚点与 open path 均使用中性淡底，pressed 加深一档；展开二级菜单没有始端色条、品牌蓝底
  或字重变化。分隔线使用磨砂实体令牌和 pill 圆角，禁用条目使用不可用指针。

  新增的稳定覆盖槽包括 `--xh-menubar-backdrop`、`--xh-menubar-highlight`、
  `--xh-menubar-item-bg-pressed`、`--xh-menubar-submenu-indicator-fg` 与 `--xh-menubar-separator-radius`。

  删除 `--xh-menubar-item-active-font-weight`：打开路径不再改变字重，这支槽已没有可控制的声明。
  需要定制打开路径时改写 `--xh-menubar-item-bg-active`；不保留同时加粗的兼容分支，因此 Styles 按 major 记录。

  菜单面的 zoom 动效替换为 `xh-overlay-slide-in` / `xh-overlay-slide-out` 四方向短移淡变，方向取实际
  placement；positioner 每层先清零四个方向变量，避免嵌套结构继承成斜移。顶层菜单之间的瞬时交接语义保留。
  当前 anatomy 没有 shortcut / trailing 等部件，本次没有用临时节点或伪元素伪造公开 API。

  皮肤体积（去注释、压空白）从 11226 增至 13127 字节；增量来自每份皮肤自带的四向关键帧、
  M2 材质面与状态反馈。

- a945391: **共享关键帧集中到 `family/motion.css`，四组 disclosure 关键帧并成一对。** 此前 8 个跨皮肤共用的关键帧（`xh-overlay-slide-in / out`、`xh-overlay-pop-in`、`xh-pop-in`、`xh-pop-out`、`xh-fade-in / out`、`xh-rise-in`）被 31 份皮肤逐份复制，共 67 处帧体逐字相同的定义（另有 context-menu 与 select 里 4 处无人引用的死定义一并删除）；现在只定义一次，皮肤改为 `@import '../family/motion.css'`，单独引入任一皮肤时关键帧仍随之到场。新增子入口 `@xihan-ui/styles/motion.css`。本次只搬定义、不改任何组件的时长与曲线，零视觉变化。

  破坏性变更：Accordion、Collapsible、Reasoning、ToolCall 各自一对 `xh-<组件>-expand / collapse` 关键帧退役（`xh-accordion-expand`、`xh-accordion-collapse`、`xh-collapsible-expand`、`xh-collapsible-collapse`、`xh-reasoning-expand`、`xh-reasoning-collapse`、`xh-tool-call-expand`、`xh-tool-call-collapse`），统一由 `xh-disclosure-expand` / `xh-disclosure-collapse` 承担；两端内缩由各皮肤在 `content` 部件上写进 `--xh-_disclosure-pt` / `--xh-_disclosure-pb`，没写的那一端按 0 动，与原先逐组件关键帧的效果一致。在 `xihan.overrides` 层重定义旧名字的覆盖会失效，改为重定义 `xh-disclosure-expand` / `xh-disclosure-collapse`。

  门禁同步收紧：`check-keyframe-refs` 允许引用本皮肤 `@import` 的家族文件里的名字，并新增两条判据——皮肤内重定义 `family/motion.css` 已有的名字判红、`@import` 了 motion.css 却不引用任何共享名字（或反之）判红；`check-keyframe-registry` 给共享关键帧登记锚定关系 `relation`（`anchored-list` / `anchored-panel` / `detached` / `fade` / `disclosure`），带 `relation` 的名字只能定义在 `family/motion.css`；`check-motion-role` 按规范 §9.5 的三行登记浮层的锚定关系，`animation` 引用的共享进出场关键帧必须与关系相符，并把 `drawer:translate` 登进大尺度位移名单（入场改走 `--xh-motion-ease-slide` 留待 drawer 提交，现以待办放行、只减不增）。

  35 份皮肤去注释压空白后合计缩小 14784 字节（family/motion.css 自身 1993 字节），`.size-limit.css.json` 只重落这 35 条；其中 `select.css` 与 `time-range-picker.css` 的登记值反而上调（21065 → 21369、27901 → 27993），是此前基线已在 10% 松量内过期，本次实测各减 1098 与 601 字节。

- db84441: 数字字段统一使用 `control` 作为必需的唯一输入壳，不再支持输入与加减按钮脱离 `control` 的三件并排结构。迁移时将 `input` 与可选的两颗动作按钮放进 `control`。

  随旧结构删除的输入框盒与独立动作样式槽不再生效：`--xh-number-field-input-bg*`、`--xh-number-field-input-border*`、`--xh-number-field-input-h`、`--xh-number-field-input-radius`、`--xh-number-field-input-shadow`、`--xh-number-field-trigger-bg*`、`--xh-number-field-trigger-border*` 与 `--xh-number-field-trigger-radius`。

  `subtle` 变体改用无投影的扁平填充面；加减动作与输入之间的分割线缩短为半高并垂直居中。

- 4c287eb: **一名多义收口：`data-type` 拆成五个名字，`data-phase` 并进 `data-state`。** 一个属性名只答一个问题。`data-type` 此前同时答五个：这个值是什么形态、这条消息有多严重、这道题单选还是多选、滚动条什么时候露面、时间按什么格式渲染——使用者看见 `[data-type]` 猜不出选中的是什么，写 `[data-type='error']` 也说不清命中的是哪一类组件。`data-phase` 是同一件事的反面：相位在词汇表里早就属于 `data-state` 的 `phase` 族，`tool-call` 另开了第二个名字，于是想给「出错的那一档」写一条统一规则的人必须写两条。两处都按同一条规矩改完：**不留别名、不留过渡期。**

  **破坏性：下表左列的属性名在 DOM 上不再出现，选它的规则一条也不会再命中。** 这一介质没有 IDE 提示，改名之后选择器只会静默失配，不报错也不降级——请在自己的代码库里全文搜索左列，逐条换成右列。

  | 删掉的名字   | 改成               | 组件 / 部件                                                                                           | 取值                                                                                              |
  | ------------ | ------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
  | `data-type`  | `data-value-type`  | `json-viewer` 的 `item` / `item-value` / `branch`                                                     | `array` / `boolean` / `null` / `number` / `object` / `string`                                     |
  | `data-type`  | `data-severity`    | `toast` 的 `root`，`notification` 的 `item`                                                           | `info` / `success` / `warning` / `error` / `loading`                                              |
  | `data-type`  | `data-select-mode` | `question-flow` 的 `option-group` / `option` / `option-indicator`                                     | `single` / `multiple`                                                                             |
  | `data-type`  | `data-reveal-mode` | `scroll-area` 的 `root` / `scrollbar`，`scrollbar` 的 `root`                                          | `auto` / `always` / `scroll` / `hover` / `scroll-hover`                                           |
  | `data-type`  | `data-format`      | `time` 的 `root`                                                                                      | `date` / `datetime` / `relative`                                                                  |
  | `data-phase` | `data-state`       | `tool-call` 的 `name` / `summary` / `status` / `duration` / `approval` / `input` / `output` / `error` | `input-streaming` / `input-available` / `awaiting-approval` / `output-available` / `output-error` |

  各组件的 `type` / `phase` prop 一个都没动，默认渲染逐像素不变。

  **`tool-call` 的 `root` 与 `trigger` 不再报阶段。** 阶段与开合是两条正交的轴，一个属性只装得下一条：这两个部件的 `data-state` 是开合（`open` / `closed`，与其余折叠件一致），阶段落在上表那八个部件上。自带皮肤里「出错换描边色」那条改成从后代读阶段（`[data-part='root']:has([data-scope='tool-call'][data-state='output-error'])`），八个部件渲出任何一个都命中。要按阶段给整张卡片写规则的，照这个写法接。

  **五个新取值进了 `data-state` 的 `phase` 族**（`input-streaming` / `input-available` / `awaiting-approval` / `output-available` / `output-error`），族内互斥的规矩照旧；`phase` 族的其余 25 个取值不变。

  **门禁补了「一名多义」的另一半。** 原先只认得出「同一个名字既当布尔又当枚举」，认不出「两个组件都当枚举、取值域却完全不相干」——`data-type` 正是后者，一路攒到六种含义都没有一条判据会响。判据 ⑨ 两头收取值域（连接层的字面量 + 皮肤选择器选中的值），发现互不相交的一对就要求在 `state-vocabulary.json` 的 `enum` 段写明这个名字问的是什么；一句话说不清的即须拆名。形态、摆位这类「同一个问题、各家自己的取值」的名字逐条登记在案，登记了却不再互不相交的算名单过期，同样判红。`retired` 段补进 `data-open` / `data-phase` / `data-type` 三条，发了或选了都判红。

- bdbf03c: **32 个部件改名，1 个部件并进另一个。** 不留别名、不留 `var(新名, 旧名)` 双写：下面列出的名字在解剖、连接层、两个适配器与皮肤里都不再存在。写旧名的节点拿不到任何属性，写旧槽名的覆盖不再生效。

  改名分三类：一个字面量在库内指着不同的东西（一名多义）、同一件事全库两个名字（同义两名）、以及重造了一整套集合词汇。

  ## 一、一名多义

  | 组件                          | 旧部件                            | 新部件                               |
  | ----------------------------- | --------------------------------- | ------------------------------------ |
  | `slider`                      | `marks` / `mark` / `mark-label`   | `tick-group` / `tick` / `tick-label` |
  | `date-picker` · `time-picker` | `presets`                         | `preset-group`                       |
  | `signature-pad`               | `segment`                         | `path`                               |
  | `diff-view`                   | `segment` · `stat`                | `inline-change` · `summary`          |
  | `color-picker`                | `area`                            | `saturation-area`                    |
  | `editable`                    | `area`                            | **并进 `control`**                   |
  | `timer`                       | `area`                            | `display`                            |
  | `combobox` · `listbox`        | `item-group` / `item-group-label` | `group` / `group-label`              |
  | `carousel` · `file-upload`    | `item-group`                      | `list`                               |
  | `pagination`                  | `ellipsis`                        | `ellipsis-trigger`                   |

  `editable` 的 `area` 与 `control` 本是两个只作排版落点的盒，职责重叠：预览区与输入框在一个盒里、三颗按钮在另一个盒里。两者并成一个 `control`，DOM 少一层——`preview` / `input` 与三颗按钮现在是它的直接子节点。`XhEditableArea` 与 `getAreaProps` 一并删除。

  ## 二、同义两名

  | 组件                    | 旧部件           | 新部件                  |
  | ----------------------- | ---------------- | ----------------------- |
  | `time-picker`           | `input`          | `segment`               |
  | `page-header`           | `subtitle`       | `description`           |
  | `heatmap`               | `week-day-label` | `week-day`              |
  | `card`                  | `cover`          | `media`                 |
  | `log` · `message-feed`  | `scroll-button`  | `scroll-to-end-trigger` |
  | `clipboard`             | `trigger`        | `copy-trigger`          |
  | `prompt-input`          | `input-row`      | `control`               |
  | `skeleton`              | `bone`           | `item`                  |
  | `avatar-group`          | `overflow`       | `overflow-item`         |
  | `alert` · `empty-state` | `icon`           | `indicator`             |

  ## 三、重造的集合词汇并回共享词汇

  | 组件            | 旧部件                                                           | 新部件                                            |
  | --------------- | ---------------------------------------------------------------- | ------------------------------------------------- |
  | `question-flow` | `option-group` / `option` / `option-indicator` / `option-label`  | `group` / `item` / `item-indicator` / `item-text` |
  | `approval`      | `scope-group` / `scope-item` / `scope-indicator` / `scope-label` | `group` / `item` / `item-indicator` / `item-text` |

  `approval` 的授权项与 `question-flow` 的选项本来就是同一种「方框加文字的一行」，现在两家用同一套名字，皮肤那一层的行盒规则也就对得上了。`approval` 的授权项同批补上按下缩放，与 `question-flow` 的选项一致。

  ## 连带改动

  **连接层的取属性函数**按部件名派生，逐条跟着改：`getMarksProps` / `getMarkProps` / `getMarkLabelProps` → `getTickGroupProps` / `getTickProps` / `getTickLabelProps`，`getPresetsProps` → `getPresetGroupProps`，`getSegmentProps`（signature-pad）→ `getPathProps`，`getStatProps` → `getSummaryProps`，`getSegmentProps`（diff-view）→ `getInlineChangeProps`，`getAreaProps` → `getSaturationAreaProps`（color-picker）/ `getDisplayProps`（timer），`getItemGroupProps` / `getItemGroupLabelProps` → `getGroupProps` / `getGroupLabelProps`（combobox / listbox）与 `getListProps`（carousel / file-upload），`getEllipsisProps` → `getEllipsisTriggerProps`，`getInputProps`（time-picker）→ `getSegmentProps`，`getSubtitleProps` → `getDescriptionProps`，`getWeekDayLabelProps` → `getWeekDayProps`，`getCoverProps` → `getMediaProps`，`getScrollButtonProps` → `getScrollToEndTriggerProps`，`getTriggerProps`（clipboard）→ `getCopyTriggerProps`，`getInputRowProps` → `getControlProps`，`getBoneProps` → `getItemProps`，`getOverflowProps` → `getOverflowItemProps`，`getIconProps`（alert / empty-state）→ `getIndicatorProps`，`getOption*Props` / `getScope*Props` → `getGroupProps` / `getItemProps` / `getItemIndicatorProps` / `getItemTextProps`。

  **读口**：`showScrollButton` → `showScrollToEndTrigger`（log / message-feed）。

  **类型与集合查询**：`SliderMarkProps` → `SliderTickProps`、`SliderMarksMarkSlotProps` → `SliderTickGroupTickSlotProps`、`TimePickerInputProps` → `TimePickerSegmentProps`、`timePickerInputQuery` → `timePickerSegmentQuery`、`DiffViewSegmentProps` → `DiffViewInlineChangeProps`、`ComboboxItemGroupProps` / `ListboxItemGroupProps` → `ComboboxGroupProps` / `ListboxGroupProps`、`PaginationEllipsisProps` → `PaginationEllipsisTriggerProps`、`HeatmapWeekDayLabelProps` → `HeatmapWeekDayProps`、`SkeletonBoneProps` → `SkeletonItemProps`、`QuestionFlowOptionProps` → `QuestionFlowItemProps`、`questionFlowOptionQuery` → `questionFlowItemQuery`。

  **Vue 部件组件**逐个跟着部件名走：`XhSliderMarks` → `XhSliderTickGroup`、`XhDatePickerPresets` / `XhTimePickerPresets` → `Xh*PresetGroup`、`XhTimePickerInput` → `XhTimePickerSegment`、`XhSignaturePadSegment` → `XhSignaturePadPath`、`XhDiffViewStat` → `XhDiffViewSummary`、`XhColorPickerArea` → `XhColorPickerSaturationArea`、`XhTimerArea` → `XhTimerDisplay`、`XhComboboxItemGroup(Label)` / `XhListboxItemGroup(Label)` → `Xh*Group(Label)`、`XhCarouselItemGroup` / `XhFileUploadItemGroup` → `Xh*List`、`XhPaginationEllipsis` → `XhPaginationEllipsisTrigger`、`XhPageHeaderSubtitle` → `XhPageHeaderDescription`、`XhHeatmapWeekDayLabel` → `XhHeatmapWeekDay`、`XhCardCover` → `XhCardMedia`、`XhLogScrollButton` / `XhMessageFeedScrollButton` → `Xh*ScrollToEndTrigger`、`XhClipboardTrigger` → `XhClipboardCopyTrigger`、`XhPromptInputInputRow` → `XhPromptInputControl`、`XhSkeletonBone` → `XhSkeletonItem`、`XhAvatarGroupOverflow` → `XhAvatarGroupOverflowItem`、`XhAlertIcon` / `XhEmptyStateIcon` → `Xh*Indicator`、`XhQuestionFlowOption*` / `XhApprovalScope*` → `Xh*Group` / `Xh*Item` / `Xh*ItemIndicator` / `Xh*ItemText`。`XhSliderTickGroup` 的插槽 `mark` 改名 `tick`，载荷字段同名。

  **自定义元素的 `::part`** 与角色节点的 `data-xh-part` 取值同步改名。

  **覆盖槽**跟着部件段走：`--xh-slider-mark*-*` → `--xh-slider-tick*-*`、`--xh-date-picker-presets-*` / `--xh-time-picker-presets-*` → `-preset-group-*`、`--xh-diff-view-segment-*` → `-inline-change-*`、`--xh-color-picker-area-*` → `-saturation-area-*`、`--xh-editable-area-min-{h,w}` → `--xh-editable-control-min-{h,w}`、`--xh-timer-area-fg` → `--xh-timer-display-fg`、`--xh-combobox-item-group-gap` / `--xh-listbox-item-group-gap` → `--xh-*-group-gap`、`--xh-pagination-ellipsis-fg` → `--xh-pagination-ellipsis-trigger-fg`、`--xh-page-header-subtitle-*` → `-description-*`、`--xh-card-cover-*` → `-media-*`、`--xh-log-scroll-button-*` → `--xh-log-scroll-to-end-trigger-*`、`--xh-message-feed-button-*` → `--xh-message-feed-scroll-to-end-trigger-*`、`--xh-clipboard-trigger-*` → `-copy-trigger-*`、`--xh-skeleton-bone-*` → `-item-*`、`--xh-avatar-group-overflow-*` → `-overflow-item-*`、`--xh-alert-icon-{box,fg}` / `--xh-empty-state-icon-{fg,font-size}` → `-indicator-*`、`--xh-question-flow-option*-*` → `--xh-question-flow-{group,item,item-indicator,item-text}-*`、`--xh-approval-scope*-*` → `--xh-approval-{group,item,item-text}-*`。

  `--xh-<组件>-icon-size` 是全库通用的图标尺度槽、不是部件槽，`alert` 与 `empty-state` 的这一支**不改名**。

  **`--xh-combobox-group-gap` / `--xh-listbox-group-gap` 换了含义**：它们现在管一组内部条目之间的间距（与 `--xh-menu-group-gap` 同义），原先管的「相邻两组之间留白」移到新槽 `--xh-combobox-group-spacing` / `--xh-listbox-group-spacing`。两处都设过值的，两个名字都要改一遍。

- 19570ad: **同一类角色在不同组件里取了对立的部件名，十处逐处定一个赢家。** 部件名是对外契约：它同时是 `data-part` 的取值、CSS 选择器的落点、Vue 部件组件的名字与自定义元素的 `csspart`。名字不统一，读者每换一个组件就得重学一遍，写共用样式时也没法一条选择器覆盖同一类角色。

  七处按「多数家的名字」定案改名，三处判定为不同的东西、把区别写进解剖注释。

  ## 一、改名（破坏性）

  | 组件                         | 已删的部件名    | 换成                 | 为什么是它赢                                                                                                                                                                         |
  | ---------------------------- | --------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | `approval` / `question-flow` | `announcement`  | `live-region`        | 另外七家（log / markdown-stream / message-feed / sortable / table / tabs / tree）都叫 `live-region`；`announcement` 在这七家里指的是「念的那句文本」（`api.announcement`），一名两义 |
  | `approval`                   | `actions`       | `footer`             | 六家（card / layout / page-header / question-flow / select / table）都叫 `footer`；approval 的这一位与 question-flow 的 `footer` 连注释都一样：「只排布按钮，不承载语义」            |
  | `checkbox-group`             | `trigger`       | `select-all-trigger` | table 的同物就叫 `select-all-trigger`；库里另外 30 家的 `trigger` 一律指「开合这个组件的那一位」，全选不是开合                                                                       |
  | `fieldset`                   | `helper-text`   | `description`        | 十三家都叫 `description`，兄弟件 `field` 也是；`helper-text` 全库仅此一处                                                                                                            |
  | `sortable`                   | `item-handle`   | `item-drag-trigger`  | 另三处都叫「拖谁 + `-drag-trigger`」（tabs 的 `tab-drag-trigger`、table 的 `column-drag-trigger` 与 `row-drag-trigger`）                                                             |
  | `table`                      | `loading-state` | `loading`            | 与同一位置的占位部件 `empty` 成对；`empty` 有四家在用（cascader / combobox / diff-view / table），`loading-state` 全库仅此一处                                                       |
  | `tool-call`                  | `name`          | `label`              | 三十四家都叫 `label`，同一台折叠机器的兄弟件 `reasoning` 也是；`name` 全库仅此一处                                                                                                   |

  跟着改名一起变的名字：

  | 已删                                                        | 换成                                                                               |
  | ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
  | Vue `XhApprovalActions`                                     | `XhApprovalFooter`                                                                 |
  | Vue `XhApprovalAnnouncement`                                | `XhApprovalLiveRegion`                                                             |
  | Vue `XhQuestionFlowAnnouncement`                            | `XhQuestionFlowLiveRegion`                                                         |
  | Vue `XhCheckboxGroupTrigger`                                | `XhCheckboxGroupSelectAllTrigger`                                                  |
  | Vue `XhFieldsetHelperText`                                  | `XhFieldsetDescription`                                                            |
  | Vue `XhSortableItemHandle`                                  | `XhSortableItemDragTrigger`                                                        |
  | Vue `XhTableLoadingState`                                   | `XhTableLoading`                                                                   |
  | Vue `XhToolCallName`                                        | `XhToolCallLabel`                                                                  |
  | `ApprovalApi.getActionsProps`                               | `getFooterProps`                                                                   |
  | `ApprovalApi` / `QuestionFlowApi` 的 `getAnnouncementProps` | `getLiveRegionProps`                                                               |
  | `CheckboxGroupApi.getTriggerProps`                          | `getSelectAllTriggerProps`                                                         |
  | `FieldsetApi.getHelperTextProps`                            | `getDescriptionProps`                                                              |
  | `SortableApi.getItemHandleProps`                            | `getItemDragTriggerProps`                                                          |
  | `TableApi.getLoadingStateProps`                             | `getLoadingProps`                                                                  |
  | `ToolCallApi.getNameProps`                                  | `getLabelProps`                                                                    |
  | `SortableTranslations` 的 `itemHandle`                      | `itemDragTrigger`                                                                  |
  | 组件覆盖槽 `--xh-sortable-handle-bg-hover`                  | `--xh-sortable-drag-bg-hover`（这一段与 tabs、table 的 `--xh-<组件>-drag-*` 同名） |
  | 组件覆盖槽 `--xh-sortable-handle-fg`                        | `--xh-sortable-drag-fg`                                                            |
  | 组件覆盖槽 `--xh-sortable-handle-fg-disabled`               | `--xh-sortable-drag-fg-disabled`                                                   |
  | 组件覆盖槽 `--xh-sortable-handle-fg-hover`                  | `--xh-sortable-drag-fg-hover`                                                      |
  | 组件覆盖槽 `--xh-sortable-handle-radius`                    | `--xh-sortable-drag-radius`                                                        |
  | 组件覆盖槽 `--xh-sortable-handle-size`                      | `--xh-sortable-drag-size`                                                          |
  | 组件覆盖槽 `--xh-sortable-handle-grip-w`                    | `--xh-sortable-drag-grip-w`                                                        |
  | 组件覆盖槽 `--xh-sortable-handle-grip-h`                    | `--xh-sortable-drag-grip-h`                                                        |
  | 组件覆盖槽 `--xh-tool-call-name-font`                       | `--xh-tool-call-label-font`                                                        |
  | 组件覆盖槽 `--xh-checkbox-group-trigger-fg`                 | `--xh-checkbox-group-select-all-trigger-fg`                                        |
  | 组件覆盖槽 `--xh-checkbox-group-trigger-fg-disabled`        | `--xh-checkbox-group-select-all-trigger-fg-disabled`                               |
  | 组件覆盖槽 `--xh-checkbox-group-trigger-font-size`          | `--xh-checkbox-group-select-all-trigger-font-size`                                 |
  | 组件覆盖槽 `--xh-checkbox-group-trigger-font-weight`        | `--xh-checkbox-group-select-all-trigger-font-weight`                               |
  | 组件覆盖槽 `--xh-checkbox-group-trigger-gap`                | `--xh-checkbox-group-select-all-trigger-gap`                                       |
  | 组件覆盖槽 `--xh-checkbox-group-trigger-radius`             | `--xh-checkbox-group-select-all-trigger-radius`                                    |
  | 组件覆盖槽 `--xh-approval-actions-gap`                      | `--xh-approval-footer-gap`                                                         |

  `data-part`、`csspart` 与覆盖槽都没有 IDE 提示，改错了不会报错：请在自己的代码库里全文搜索上表左列的每一个名字。

  `api.announcement`（那句播报文本）没有变，`popselect` / `select` 等的 `footer` 没有变，`field` 的 `description` 与 `error-text` 没有变。

  ## 二、判定为不同的东西（无改动，区别写进解剖注释）

  - **`code-view` 的 `line` 与 `diff-view` 的 `row`。** 带 `role="row"` 与 `aria-rowindex`、住在 `role="table"` 里的那一类叫 `row`（diff-view / table / heatmap）；不带任何表格语义的纯文本行叫 `line`（code-view / log）。判据是 ARIA 结构，不是外观。
  - **`select` 的 `tag` 与 `tag` 组件。** scope 名（`data-scope`）标识的是组件，部件名（`data-part`）标识的是组件里的位置，两把尺子不交叉；`select` 的 `tag` 是它自己画的已选值小片，不是 `tag` 组件的落点。
  - **`approval` 的 `scope-group` / `scope-item` / `scope-indicator` / `scope-label`。** 这里的 scope 指授权范围，与标识组件身份的 `data-scope` 不是一回事；它取的是组件自己的领域词（props 就叫 `scopes` / `grantedScopes`），改名会把入参与部件的同名对应关系拆散。

  ## 默认渲染逐像素未变

  改名逐处同改了皮肤选择器与生成的样式表，没有一条规则的命中面发生变化；三处「判定为不同」的地方一个字符都没动。

- dc64383: **14 组 prop 改名、2 组事件改名。** 不留别名、不留旧名并存：下面左列的名字在无头层与两个适配器里都不再存在，写下它们等于没写。

  ## 一、几何值不再占用三轴的 `size`

  `size` 在三轴里是 `'sm' | 'md' | 'lg'`，`resizable` 与 `floating-panel` 的却是一对像素数——同一个名字两个类型域，写 `size="md"` 得到的是静默的错。两家一并改名 `dimensions`。

  | 组件             | 已删                                                        | 换成                                                                                |
  | ---------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
  | `resizable`      | `size` / `defaultSize` / `onSizeChange` / `onSizeChangeEnd` | `dimensions` / `defaultDimensions` / `onDimensionsChange` / `onDimensionsChangeEnd` |
  | `floating-panel` | `size` / `defaultSize` / `onSizeChange`                     | `dimensions` / `defaultDimensions` / `onDimensionsChange`                           |

  连带：载荷字段 `{ size }` → `{ dimensions }`；机器事件 `SIZE.SET` → `DIMENSIONS.SET`（floating-panel 另有 `SIZE.NUDGE` → `DIMENSIONS.NUDGE`）；api 的 `size` → `dimensions`、`setSize` → `setDimensions`；Vue 的 `v-model:size` → `v-model:dimensions`、事件 `size-change` → `dimensions-change`、`size-change-end` → `dimensions-change-end`；WC 属性 `size` → `dimensions`、`default-size` → `default-dimensions`。

  删掉的导出，逐个换名：

  | 已删                             | 换成                                                                         |
  | -------------------------------- | ---------------------------------------------------------------------------- |
  | `ResizableSize`                  | `ResizableDimensions`                                                        |
  | `ResizableSizeChangeDetails`     | `ResizableDimensionsChangeDetails`                                           |
  | `ResizableSizeChangeEndDetails`  | `ResizableDimensionsChangeEndDetails`                                        |
  | `FloatingPanelSizeChangeDetails` | `FloatingPanelDimensionsChangeDetails`                                       |
  | `RESIZABLE_DEFAULT_SIZE`         | `RESIZABLE_DEFAULT_DIMENSIONS`（值不变，仍是 `{ width: 240, height: 160 }`） |

  标量的不动：`floating-panel` 的 `minSize` / `maxSize` 与类型 `FloatingPanelSize` 保持原样。

  ## 二、`floating-panel` 的形态轴不再叫 `stage`

  `stage` 在库内另有「阶段」义（`data-state` 的 phase 族）。

  | 已删                                                                                             | 换成                                                                                                          |
  | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
  | prop `stage` / `defaultStage` / `onStageChange`                                                  | `windowState` / `defaultWindowState` / `onWindowStateChange`                                                  |
  | 类型 `FloatingPanelStage` / `FloatingPanelStageChangeDetails` / `FloatingPanelStageTriggerProps` | `FloatingPanelWindowState` / `FloatingPanelWindowStateChangeDetails` / `FloatingPanelWindowStateTriggerProps` |
  | 部件 `stage-trigger`                                                                             | `window-state-trigger`                                                                                        |
  | `data-stage` / `data-target-stage`                                                               | `data-window-state` / `data-target-window-state`                                                              |
  | Vue `<XhFloatingPanelStageTrigger>`                                                              | `<XhFloatingPanelWindowStateTrigger>`                                                                         |
  | WC 属性 `stage` / `default-stage`，形态钮上的 `stage="…"`                                        | `window-state` / `default-window-state`，钮上写 `window-state="…"`                                            |
  | 事件 `stage-change`（Vue emit 与 WC CustomEvent 同名）                                           | `window-state-change`                                                                                         |
  | api `stage` / `setStage` / `getStageTriggerProps`                                                | `windowState` / `setWindowState` / `getWindowStateTriggerProps`                                               |

  ## 三、当前步序并进 `value` 家族

  `step` 一名三义：增量（number-field / slider / time-picker）、键盘步进（已叫 `keyboardStep`）、当前步序。第三义并进受控三件套。

  | 组件             | 已删                                    | 换成                                       |
  | ---------------- | --------------------------------------- | ------------------------------------------ |
  | `steps` / `tour` | `step` / `defaultStep` / `onStepChange` | `value` / `defaultValue` / `onValueChange` |

  连带：载荷字段 `{ step }` → `{ value }`；事件 `step-change` → `value-change`；`v-model:step` → `v-model:value`；WC 属性 `step` → `value`、`default-step` → `default-value`；api `step` → `value`、`setStep` → `setValue`；类型 `StepsStepChangeDetails` / `TourStepChangeDetails` → `StepsValueChangeDetails` / `TourValueChangeDetails`。

  `data-step`、`goToNextStep` / `goToPrevStep`、`TourCompleteDetails.step` / `TourSkipDetails.step` 不动——它们说的是「第几步」，不是那个受控值。

  ## 四、展开态收成两种形态

  集合型的展开一律 `expandedValue` 三件套，布尔型的展开一律 `open` 三件套。

  | 组件                                                                        | 已删                                                | 换成                                                  |
  | --------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------- |
  | `diff-view` / `table`                                                       | `expanded` / `defaultExpanded`                      | `expandedValue` / `defaultExpandedValue`              |
  | `json-viewer`                                                               | `flattenJson` 选项 `expanded`                       | `expandedValue`                                       |
  | `diff-view` / `json-viewer` / `side-nav` / `table` / `tree` / `tree-select` | `onExpandedChange`、事件 `expanded-change`          | `onExpandedValueChange`、事件 `expanded-value-change` |
  | `truncate`                                                                  | `expanded` / `defaultExpanded` / `onExpandedChange` | `open` / `defaultOpen` / `onOpenChange`               |

  `truncate` 的 connect 本来发的就是 `aria-expanded` 加 `data-state='open' | 'closed'`，与 `collapsible` 逐字同构，prop 名却与状态编码分叉。连带：事件 `expanded-change` → `open-change`；`v-model:expanded` → `v-model:open`；WC 属性 `expanded` → `open`、`default-expanded` → `default-open`；api `expanded` / `setExpanded` → `open` / `setOpen`；机器状态 `collapsed` / `expanded` → `closed` / `open`；类型 `TruncateExpandedChangeDetails` → `TruncateOpenChangeDetails`。

  `diff-view` 的载荷字段 `{ expanded }` 改成与另外五家一致的 `{ value }`；`diff-view` 的 api `expanded` / `setExpanded` 改成 `expandedValue` / `setExpandedValue`。六个载荷类型一并改名：

  | 已删                              | 换成                                   |
  | --------------------------------- | -------------------------------------- |
  | `DiffViewExpandedChangeDetails`   | `DiffViewExpandedValueChangeDetails`   |
  | `JsonViewerExpandedChangeDetails` | `JsonViewerExpandedValueChangeDetails` |
  | `SideNavExpandedChangeDetails`    | `SideNavExpandedValueChangeDetails`    |
  | `TableExpandedChangeDetails`      | `TableExpandedValueChangeDetails`      |
  | `TreeExpandedChangeDetails`       | `TreeExpandedValueChangeDetails`       |
  | `TreeSelectExpandedChangeDetails` | `TreeSelectExpandedValueChangeDetails` |

  ## 五、只读数据源一律 `collection`

  | 组件           | 已删      | 换成         |
  | -------------- | --------- | ------------ |
  | `image-viewer` | `items`   | `collection` |
  | `anchor`       | `targets` | `collection` |

  ## 六、其余五条

  | 组件                        | 已删                                                            | 换成                                                     | 为什么                                                                                                                      |
  | --------------------------- | --------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
  | `approval` / `prompt-input` | `busy`                                                          | `loading`                                                | 同一件事全库两个名字，`loading` 是多数派，且它配的就是 `data-loading` 与 `aria-busy`                                        |
  | `skeleton`                  | `variant`（`text` / `circle` / `rect`）、类型 `SkeletonVariant` | `shape`、`SkeletonShape`                                 | 三个取值是形状不是形态，与三轴的 `variant` 撞名。骨架条自报形状的属性也从 `variant` 改成 `shape`                            |
  | `grid`                      | `justify`、`data-justify`、类型 `GridJustify`                   | `justifyItems`、`data-justify-items`、`GridJustifyItems` | `grid` 落的是 `justify-items`、`flex` 落的是 `justify-content`，同名不同 CSS 属性。`align` 两边落的都是 `align-items`，不动 |
  | `card`                      | `segmented`                                                     | `split`                                                  | 与 `segmented` 组件撞名；它自己发的状态属性早就叫 `data-split`                                                              |
  | `mention`                   | prop `prefix`、WC 属性 `prefix`                                 | `triggerPrefix`、`trigger-prefix`                        | 与 `prefix` 部件撞名。WC 的 JS 字段本来就叫 `triggerPrefix`，这次属性名跟上                                                 |

  ## 七、两组事件名归一

  | 已删                                 | 换成                                       | 在哪                                                                                       |
  | ------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------ |
  | `onVisibleChange` / `visible-change` | `onVisibilityChange` / `visibility-change` | `back-top`；类型 `BackTopVisibleChangeDetails` → `BackTopVisibilityChangeDetails`          |
  | `onFinish` / `finish`                | `onComplete` / `complete`                  | `number-animation`；类型 `NumberAnimationFinishDetails` → `NumberAnimationCompleteDetails` |

  `onValueChangeEnd`（连续拖动结束）、`onValueComplete`（各段填满）、`onValueCommit`（就地编辑提交）三者答的是三个不同的问题，保持三名分立，已写进规范的事件名词汇表。

- 80e6fdf: **`qr-code` 改名 `matrix-code`，新增 `format` 选码制：二维码不再只有 QR 一种身份。**

  QR Code 之外还有 Data Matrix、PDF417、Aztec 这些同样常用的二维码制，它们与 QR 共用一张码面、一套命名、一块 logo 位与同一份皮肤，只是编码器不同。把组件名钉在 `qr-code` 上就没有地方放它们，于是整个公开面改名：Headless 的 `connectQrCode` / `qrCodeAnatomy` / `qrCodeKeyboard` / `qrCodeMeta` 与 `QrCode*` 类型改为 `connectMatrixCode` / `matrixCodeAnatomy` / `matrixCodeKeyboard` / `matrixCodeMeta` 与 `MatrixCode*`（`QrModuleShape` / `QrEyeShape` 改为 `MatrixCodeModuleShape` / `MatrixCodeEyeShape`）；Vue 与 React 的 `XhQrCode` / `XhQrCodeLogo` 改为 `XhMatrixCode` / `XhMatrixCodeLogo`，上下文与 provide / use 同步；自定义元素 `<xh-qr-code>` 改为 `<xh-matrix-code>`；皮肤子路径 `qr-code.css` 改为 `matrix-code.css`，覆盖槽 `--xh-qr-code-*` 改为 `--xh-matrix-code-*`；`data-scope` 改为 `matrix-code`；诊断码 `qr-code.logo-damage` 改为 `matrix-code.logo-damage`（`DIAGNOSTIC_CODES.qrCodeLogoDamage` → `matrixCodeLogoDamage`）。QR 编码器本身的导出（`qrEncode` / `qrCapacityBytes` / `qrAlignmentPositions` / `QR_MAX_VERSION` / `QrLevel` / `QrMatrix`）不改名，它们描述的就是 QR。

  新增 `format` prop（三端同名，自定义元素 attribute `format`），缺省 `qr`，根上落 `data-format`。给了不认识的值不静默退回 QR：一个模块都不铺，根落到 `error` 态并在 `error` 里说明只认哪些码制——按错码制画出来的码扫得出内容但对不上，作者却看不出哪里错了。当前只有 `qr` 一种取值，其余码制随后各自补上。

- cd74476: **`thread`、`composer`、`code-block` 三个组件已整体删除。** 不留别名、不留转发、不留提示：下面列出的名字在无头层、两个适配器与皮肤里都不再存在，写下它们会得到「组件不存在」而不是降级渲染。三者各有覆盖它的后继，逐个说清怎么换。

  ## 一、`code-block` → `code-view`

  能力上是严格超集：`code` / `lang` / `complete` / `highlighter` / `highlightWhileStreaming` / `wrap` 六个入口的语义一字未变，`root` / `pre` / `code` / `lang-label` / `token` 五个部件仍在，另外多出行号、指定行高亮、超长折叠与文件名。

  **结构上不是改名。** `code-block` 在 Vue 侧是一个包办到底的 `<XhCodeBlock>`，`code-view` 是拆开的部件族，最小写法要三个：

  ```vue
  <XhCodeViewRoot :code="src" lang="ts" complete>
  <XhCodeViewPre>
    <XhCodeViewCode />
  </XhCodeViewPre>;
  </XhCodeViewRoot>
  ```

  | 已删                                                                            | 换成                                                                                                                                                                          |
  | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Vue `<XhCodeBlock>`                                                             | `<XhCodeViewRoot>` + `<XhCodeViewPre>` + `<XhCodeViewCode>`（文件名与语言标注另有 `<XhCodeViewHeader>` / `<XhCodeViewFilename>` / `<XhCodeViewLangLabel>`）                   |
  | 自定义元素 `<xh-code-block>`                                                    | `<xh-code-view>`                                                                                                                                                              |
  | `connectCodeBlock` / `codeBlockAnatomy` / `codeBlockKeyboard` / `codeBlockMeta` | `connectCodeView` / `codeViewAnatomy` / `codeViewKeyboard` / `codeViewMeta`                                                                                                   |
  | 类型 `CodeBlockApi` / `CodeBlockProps` / `CodeBlockTranslations`                | `CodeViewApi` / `CodeViewProps` / `CodeViewTranslations`                                                                                                                      |
  | `CODE_BLOCK_FALLBACK_LANG`                                                      | `CODE_VIEW_FALLBACK_LANG`                                                                                                                                                     |
  | `countCodeLines`                                                                | `countCodeViewLines`                                                                                                                                                          |
  | 类型 `XhCodeBlockElement`                                                       | `XhCodeViewElement`                                                                                                                                                           |
  | 部件 `data-part="root"` / `"lang-label"` / `"pre"` / `"code"` / `"token"`       | 五个都在，名字不变                                                                                                                                                            |
  | 记号在 DOM 里的位置：`data-part="token"` 直接挂在 `data-part="code"` 下         | 中间多了两层——`code` 下是逐行的 `data-part="line"`，行里是 `data-part="line-content"`，记号挂在它下面。写死层级的后代选择器（`[data-part='code'] > [data-part='token']`）要改 |
  | root 上的 `data-lang` / `data-complete` / `data-wrap`、token 上的 `data-kind`   | 同名同值                                                                                                                                                                      |
  | 子入口 `@xihan-ui/styles/code-block.css`                                        | `@xihan-ui/styles/code-view.css`                                                                                                                                              |
  | 覆盖槽 `--xh-code-block-*`（10 个）                                             | 同名的 `--xh-code-view-*`                                                                                                                                                     |
  | 文案覆盖表的 `'code-block'` 键                                                  | `'code-view'`                                                                                                                                                                 |

  ## 二、`composer` → `prompt-input`

  部件同构（`root` / `input` / `submit-trigger`），`prompt-input` 另有可选的 `input-row` 与形态、语气、尺寸三轴。两处入口语义要改写：

  **运行态从两档字符串变成一个布尔。** `composer` 收 `runStatus: 'ready' | 'streaming'`，`prompt-input` 收 `loading: boolean`：`'streaming'` 对应 `loading` 为真，`'ready'` 对应不写 `loading`。组件真正需要的只有这个二值判断——按钮换不换成停止身份、提交路径挡不挡。类型 `ComposerRunStatus` 没有后继。

  连带一处选择器要改：`composer` 把运行态铺成 root 上的 `data-state`（取值就是 `ready` / `streaming`），`prompt-input` 的 root 上**没有 `data-state`**，生成中改由布尔属性 `data-loading` 表达。`[data-scope='composer'][data-part='root'][data-state='streaming']` 换成 `[data-scope='prompt-input'][data-part='root'][data-loading]`。输入框那一层的 `data-state`（`empty` / `editing` / `disabled`）两边同名同值，不动。

  **回车从布尔变成按键档。** `submitOnEnter` 只能表达「回车提交还是换行」，`submitKey` 表达「哪一组按键才算提交」，本次给它补上 `'none'` 一档后两者可以精确对应。

  | 已删                                                                                                                                      | 换成                                                                                                                  |
  | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
  | Vue `<XhComposerRoot>` / `<XhComposerInput>` / `<XhComposerSubmitTrigger>`                                                                | `<XhPromptInputRoot>` / `<XhPromptInputInput>` / `<XhPromptInputSubmitTrigger>`                                       |
  | 自定义元素 `<xh-composer>`                                                                                                                | `<xh-prompt-input>`                                                                                                   |
  | `useComposer()`                                                                                                                           | `usePromptInput()` / `usePromptInputContext()`                                                                        |
  | `connectComposer` / `composerAnatomy` / `composerKeyboard` / `composerMachine` / `composerMeta`                                           | `connectPromptInput` / `promptInputAnatomy` / `promptInputKeyboard` / `promptInputMachine` / `promptInputMeta`        |
  | 类型 `ComposerApi` / `ComposerSchema` / `ComposerState` / `ComposerTranslations` / `ComposerSubmitDetails` / `ComposerValueChangeDetails` | 同名的 `PromptInput*`                                                                                                 |
  | 类型 `ComposerContext` / `ComposerCallbacks` / `ComposerRootSlotProps` / `XhComposerElement`                                              | `PromptInputContext` / `PromptInputCallbacks` / `PromptInputRootSlotProps` / `XhPromptInputElement`                   |
  | 类型 `ComposerRunStatus`                                                                                                                  | 无——改用布尔 `loading`                                                                                                |
  | prop `runStatus="streaming"`                                                                                                              | `loading`（真）                                                                                                       |
  | prop `runStatus="ready"`                                                                                                                  | 不写 `loading`（假）                                                                                                  |
  | prop `submitOnEnter`（默认真）                                                                                                            | `submitKey="enter"`（默认，不写即是）                                                                                 |
  | prop `:submit-on-enter="false"`                                                                                                           | `submitKey="none"`                                                                                                    |
  | 部件 `data-part="root"` / `"input"` / `"submit-trigger"`                                                                                  | 同名，另有可选的 `data-part="input-row"`                                                                              |
  | root 上的 `data-state="ready"` / `"streaming"`                                                                                            | root 上的 `data-loading`（布尔属性，只在生成中出现）                                                                  |
  | input 上的 `data-state`、submit-trigger 上的 `data-mode="send"` / `"stop"`、root 上的 `data-disabled`                                     | 同名同值                                                                                                              |
  | `translations.input`（必填）                                                                                                              | 同名但可选；**不给就整条 `aria-label` 不输出**，免得盖掉作者的 `<label for>`                                          |
  | 子入口 `@xihan-ui/styles/composer.css`                                                                                                    | `@xihan-ui/styles/prompt-input.css`                                                                                   |
  | 覆盖槽 `--xh-composer-*`（27 个）                                                                                                         | `--xh-prompt-input-*`；发送与停止两态的 `--xh-composer-send-*` / `--xh-composer-stop-*` 改由提交钮的 `data-mode` 分档 |
  | 文案覆盖表的 `'composer'` 键                                                                                                              | `'prompt-input'`                                                                                                      |

  `prompt-input` 另有 `composer` 没有的入口：`allowEmptySubmit`（有附件时允许空值提交）、`clearOnSubmit`（提交后清不清空）与 `variant` / `tone` / `size` 三轴，都是新增，不影响照上表改完的代码。

  ## 三、`thread` → `message-feed` 或 `log`

  `thread` 一件同时管两种场景，后继按场景分成两件：**结构化会话**用 `message-feed`（条目集合语义、条目键盘遍历、统一播报区），**任意内容粘底**用 `log`。`log` 本次补上了 `scroll-button` 与 `live-region`，两条路都不缺件。

  粘底那套入口（`threshold` / `onStickChange` / `translations`）两边同名同义。`thread` 的 `status`（`idle` / `submitted` / `streaming` / `error`）只有 `message-feed` 有；`log` 那侧对应的是布尔 `loading`。

  | 已删                                                                                                                                                            | 换成（结构化会话）                                                                                                                                                                                           | 换成（任意内容粘底）                                                                                                             |
  | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
  | Vue `<XhThreadRoot>` / `<XhThreadViewport>` / `<XhThreadContent>` / `<XhThreadScrollButton>` / `<XhThreadLiveRegion>`                                           | `<XhMessageFeedRoot>` / `<XhMessageFeedViewport>` / `<XhMessageFeedList>` / `<XhMessageFeedScrollToEndTrigger>` / `<XhMessageFeedLiveRegion>`（条目另有 `<XhMessageFeedItem>` / `<XhMessageFeedItemLabel>`） | `<XhLogRoot>` / `<XhLogViewport>` / `<XhLogContent>` / `<XhLogScrollToEndTrigger>` / `<XhLogLiveRegion>`（行另有 `<XhLogLine>`） |
  | 自定义元素 `<xh-thread>`                                                                                                                                        | `<xh-message-feed>`                                                                                                                                                                                          | `<xh-log>`                                                                                                                       |
  | `useThread()` / `useThreadContext()` / `provideThread()`                                                                                                        | `useMessageFeed()` / `useMessageFeedContext()` / `provideMessageFeed()`                                                                                                                                      | `useLog()` / `useLogContext()`                                                                                                   |
  | `connectThread` / `threadAnatomy` / `threadKeyboard` / `threadMachine` / `threadMeta`                                                                           | 同名的 `messageFeed*`                                                                                                                                                                                        | 同名的 `log*`                                                                                                                    |
  | 类型 `ThreadApi` / `ThreadSchema` / `ThreadRefs` / `ThreadStatus` / `ThreadStickChangeDetails` / `ThreadTranslations` / `ThreadContext` / `ThreadRootSlotProps` | 同名的 `MessageFeed*`                                                                                                                                                                                        | `LogApi` / `LogSchema` / `LogTranslations` / `LogContext` / `LogRootSlotProps`                                                   |
  | 类型 `XhThreadElement`                                                                                                                                          | `XhMessageFeedElement`                                                                                                                                                                                       | 无导出的元素类，标签 `<xh-log>` 照常注册                                                                                         |
  | prop `status`                                                                                                                                                   | `status`（同名同值）                                                                                                                                                                                         | `loading`（布尔）                                                                                                                |
  | 部件 `data-part="content"`                                                                                                                                      | `data-part="list"`，且条目必须是它的**直接子节点**（`data-part="item"`，带 `item-id` / `item-index` / 可选 `item-role`）                                                                                     | `data-part="content"`（同名），行是 `data-part="line"`                                                                           |
  | 部件 `data-part="root"` / `"viewport"` / `"scroll-button"` / `"live-region"`                                                                                    | 同名                                                                                                                                                                                                         | 同名                                                                                                                             |
  | viewport 上的 `role="log"` + `tabindex="0"` + `aria-live="off"` + `data-state`                                                                                  | 都不在 viewport 上了：Tab 停靠位与键盘宿主挪到 root，集合语义改由 list 上的 `role="feed"` 承担，viewport 只剩几何                                                                                            | 仍在 viewport 上（`role="log"`、`tabindex="0"`、`aria-live="off"`），但 viewport 上没有 `data-state`                             |
  | root 上的 `data-state="<status>"`                                                                                                                               | 同名同值                                                                                                                                                                                                     | 没有；改看 root 上的 `data-loading` / `data-at-bottom` / `data-sticking`                                                         |
  | scroll-button 上的 `data-state="visible"` / `"hidden"`                                                                                                          | 同名同值                                                                                                                                                                                                     | 同名同值                                                                                                                         |
  | 子入口 `@xihan-ui/styles/thread.css`                                                                                                                            | `@xihan-ui/styles/message-feed.css`                                                                                                                                                                          | `@xihan-ui/styles/log.css`                                                                                                       |
  | 覆盖槽 `--xh-thread-*`（16 个）                                                                                                                                 | `--xh-message-feed-*`                                                                                                                                                                                        | `--xh-log-*`                                                                                                                     |
  | 文案覆盖表的 `'thread'` 键                                                                                                                                      | `'message-feed'`                                                                                                                                                                                             | `'log'`                                                                                                                          |

  `@xihan-ui/chat-stream` 的 `createThreadStore` / `ThreadStore` / `ThreadStatus` / `ThreadSnapshot` / `ThreadStoreOptions` 是那个包自己的数据仓，与本组件同名但无关，一个字没动。

  ## CSS 选择器要自己搜一遍

  `[data-scope='thread']`、`[data-scope='composer']`、`[data-scope='code-block']` 三个作用域不再有任何节点带上。选择器失配既不报错也不降级，请在自己的代码库里全文搜索这三个串，连同上面三张表里的 `--xh-` 覆盖槽名一起换掉。

  ## 文档站的示例去了哪

  三个组件的示例目录整个删掉。迁过去的那些改成了后继组件的写法，Vue 与自定义元素两版都在；没迁的逐条写明理由。

  | 已删的示例                                 | 去向                                                                                                                                                                                                                                                                                                                                                                                   |
  | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `thread/01-basic`                          | `message-feed/01-basic` 已覆盖三层骨架                                                                                                                                                                                                                                                                                                                                                 |
  | `thread/02-stick`                          | `message-feed/02-sticky` 已覆盖粘底与回到底部                                                                                                                                                                                                                                                                                                                                          |
  | `thread/03-status`                         | 迁成 `message-feed/04-status`                                                                                                                                                                                                                                                                                                                                                          |
  | `thread/04-load-more`                      | 迁成 `message-feed/05-load-more`                                                                                                                                                                                                                                                                                                                                                       |
  | `thread/05-scroll-control`                 | `log/03-follow` 已覆盖「不用内置那颗按钮，自己拿 `atBottom` 与 `scrollToBottom` 画一条回到最新」                                                                                                                                                                                                                                                                                       |
  | `thread/06-chat`                           | `prompt-input/02-chat` 已覆盖消息流配输入框的整页                                                                                                                                                                                                                                                                                                                                      |
  | `thread/07-load-earlier`                   | 迁成 `message-feed/06-load-earlier`                                                                                                                                                                                                                                                                                                                                                    |
  | `thread/08-scroll-to`                      | 迁成 `message-feed/07-scroll-to`。跳转不再靠自己算 `offsetTop`：`scrollToItem(id)` 与 `focusItem(id)` 收的就是写在条目上的那个 `item-id`。自定义元素那侧只暴露 `scrollToBottom()`，别的位置仍按 `item-id` 取节点自己滚                                                                                                                                                                 |
  | `composer/01-basic`                        | `prompt-input/01-basic`                                                                                                                                                                                                                                                                                                                                                                |
  | `composer/02-streaming`                    | `prompt-input/02-chat` 与 `prompt-input/03-layout` 已覆盖 `loading` 与原位停止                                                                                                                                                                                                                                                                                                         |
  | `composer/03-enter`                        | 迁成 `prompt-input/04-submit-key`，三档按键各摆一台                                                                                                                                                                                                                                                                                                                                    |
  | `composer/04-disabled`                     | 迁成 `prompt-input/05-disabled`，另加 `allowEmptySubmit` 一档                                                                                                                                                                                                                                                                                                                          |
  | `composer/05-clear` 与 `composer/06-count` | 并成 `prompt-input/06-extras`：附加按钮、`setValue` 清空、`maxlength` 与字数在同一台上                                                                                                                                                                                                                                                                                                 |
  | `composer/07-autosize`                     | 迁成 `prompt-input/07-autosize`                                                                                                                                                                                                                                                                                                                                                        |
  | `composer/08-filter`                       | 不另开一份：改写值走的是同一条路（root 插槽的 `setValue`），`prompt-input/06-extras` 里就是这么写的                                                                                                                                                                                                                                                                                    |
  | `composer/09-focus`                        | 迁成 `prompt-input/08-focus`                                                                                                                                                                                                                                                                                                                                                           |
  | `composer/10-status`                       | 迁成 `prompt-input/09-invalid`，覆盖的变量由 `--xh-composer-border` 换成 `--xh-prompt-input-border`                                                                                                                                                                                                                                                                                    |
  | `code-block/01-basic`                      | `code-view/01-basic`                                                                                                                                                                                                                                                                                                                                                                   |
  | `code-block/02-streaming`                  | 「未闭合默认不着色」那半边由 `code-view/04-streaming` 覆盖；`highlightWhileStreaming` 那半边迁成 `code-view/07-streaming-highlight`                                                                                                                                                                                                                                                    |
  | `code-block/03-highlighter`                | 迁成 `code-view/06-highlighter`                                                                                                                                                                                                                                                                                                                                                        |
  | `code-block/04-line-numbers`               | 不迁：那份示例是在 `code-block` 旁边手搭一栏行号，再用 `--xh-code-block-line-height` / `--xh-code-block-p` / `--xh-code-block-label-py` / `--xh-code-block-label-font-size` 把两栏对齐。`code-view` 自带 `lineNumbers`（配 `startLine`、`highlightLines`），行号由皮肤用 `attr()` 画，复制代码不会带上它，读屏也不念——见 `code-view/02-line-numbers`。那四个用于对齐的槽随皮肤一起没了 |

  指向这三件的文档链接同步改了：AI 对话内核那页的组件清单换成消息流 / 日志 / 提示输入框 / 代码视图四件，流式 Markdown 与代码着色两页指向代码视图，首页的组件清单同改。`message-feed` 与 `log` 互相点明了分界：分得出「第几条、谁说的」用前者，一整段往下追加用后者。

- 3ef5a6e: **`select` 标签里的删除钮退役成 `tag` 的 `close-trigger`：`item-delete-trigger` 不再是本组件的部件，渲出来的节点是 `tag` 的关闭钮（`data-scope="tag" data-part="close-trigger"`），样子归 `tag.css`。**

  上一笔把 `select` 的标签与 `+N` 套成了 `tag` 的 `root`，删除钮却还是 `select` 自己画的一颗——`tag` 本来就有关闭钮，第二份就是另起一套。现在：

  - **连接层**：触发器外的每一枚标签在 `connectSelect` 里各是一份 `connectStaticTag`（受控 `open: true`、`closable: true`、`disabled` 与 `readOnly` 随控件、`translations.close` 取 `translations.deleteItem(标签文字)`；形态由 `tag` 导出的 `tagVariantForControl` 按控件的面派）。删除钮就是这份实例的 `getCloseTriggerProps()`：按它时 `tag` 只发 `onOpenChange({ open: false })`，`select` 在那里送 `VALUE.SET` 把这个值摘掉。`api.getTagProps({ value })` 与 `api.getItemDeleteTriggerProps({ value })` 共用同一份实例，`root` 的产出不看 `closable`，触发器里的标签照旧不渲钮。
  - **禁用 / 只读矩阵由 `tag` 给**：禁用时钮留在原地、原生 `disabled` 并带 `data-disabled`，标签本体置灰；只读时钮同样留位、原生 `disabled`，标签本身不置灰——与 `tag-group` / `tags-input` 里的标签同一条规矩。
  - **可及名**：仍走 `select` 的 `translations.deleteItem`（缺省 `Delete <标签文字>`），只是现在经 `tag` 的 `translations.close` 落到那颗钮上。
  - **三家适配器**：Vue / React 的 `XhSelectItemDeleteTrigger` 名字与用法不变，渲出来的 `<button>` 换成 `tag` 的 `close-trigger`；Web Components 侧作者写法不变（`data-xh-part="item-delete-trigger"`，仍放在 `data-xh-part="tag"` 里），这个作者名以 `delegates` 登记为归 `tag` 的 scope 管。
  - **皮肤**：`select.css` 里 `item-delete-trigger` 的全部规则（尺寸、圆角、悬停、按压、聚焦环、禁用色、兜底字形）整段删掉；那颗钮吃 `tag.css` 的 `close-trigger` 规则——命中区 `--xh-tag-close-size`（缺省不分档的 `--xh-control-indicator-size`）、圆角 `--xh-tag-close-radius`（缺省 `--xh-shape-inset`）、悬停与按压底色从当前前景色兑、`solid` 标签里环取 `currentColor`。

  **破坏面：**

  - `select` 的解剖少一个部件（21 → 20）：`item-delete-trigger` 删除。按 `[data-scope='select'][data-part='item-delete-trigger']` 选择过的皮肤、测试与作者样式要改成 `[data-scope='tag'][data-part='close-trigger']`（要限定在 `select` 里就前缀 `[data-scope='select'][data-part='root']`）。
  - `select.css` 的六个覆盖槽随之删除：`--xh-select-item-delete-size` / `-radius` / `-fg` / `-fg-hover` / `-bg-hover` / `-bg-active`，改用 `tag` 的 `--xh-tag-close-size` / `--xh-tag-close-radius` / `--xh-tag-close-fg` / `--xh-tag-close-bg-hover` / `--xh-tag-close-bg-active`。
  - 禁用时那颗钮从「只标 `data-disabled`、仍可聚焦」变成原生 `disabled`（不可聚焦、不占 Tab 位），与 `tag` 的关闭钮同一条规矩；只读时那颗钮从「可按但不动值」变成原生 `disabled`。
  - 悬停 / 按压底色从 `--xh-bg-subtle-hover` / `-active` 换成由当前前景色兑出的 `color-mix`，与 `tag` 的关闭钮同一副长相；缺省字色从 `--xh-fg-subtle` 换成标签自己的文字色（`currentColor`）。
  - 聚焦环不再由 `select.css` 画，走 `focus.css` 的通用环加 `tag.css` 的 `solid` 上下文规则。

- 1f6da9d: **`select` 触发器里的标签与 `+N` 改成套库里的 `tag`：每一枚都是 `tag` 的 `root`（`data-scope="tag"`），样子归 `tag.css`，`select.css` 不再自己画标签。**

  此前 `select` 的多选标签与 `+N` 那一枚是本组件自己的两个部件（`tag` / `overflow-tag`），`select.css` 另画了一副药丸：三档都是 18px 高、12px 字、不随 `size` 变，与库里 `tag` 组件（sm 22 / md 26 / lg 30，字 12 / 13 / 14）是两套长相；`+N` 还另配了一副压一档的配色。现在：

  - **连接层套 `tag` 的连接层**：`connectSelect` 调 `connectStaticTag`（不建机器的那条路）产出标签的 props——触发器里的标签与 `+N` 没有任何能改状态的事件，显隐由 `select` 的选中值决定，一枚一台机器纯属开销。`tone` / `size` 与 `disabled` 从 `select` 传下去，`closable` 恒为假（触发器是按钮，按钮不能套按钮）。标签的 `variant` 不照抄控件的，按控件的面派且恒有值：`outline` / `ghost` 与缺省（控件缺省即 `outline`）的面是画布色或透明，标签摆 `subtle`；`subtle` 控件的面本身就是淡底，标签摆 `outline` 才看得出是一枚标签。形态恒有值，`tone` 才有落点——`tag.css` 的语气规则都挂在形态之下，只给 `tone` 不给 `variant` 的 `select` 标签照样着色，且不写 `variant` 与写 `outline` 的标签一样。
  - **DOM 契约**：`api.getTagProps({ value })` 与 `api.getOverflowTagProps()` 产出的是 `tag` 的 `root`（`data-scope="tag" data-part="root"`），前者另带 `data-value`，后者另带 `data-count`；没有折起的标签时 `+N` 是 `tag` 的收起态（`data-state="closed"` + `hidden`）。新增 `api.getTagLabelProps()`：标签文字所在的块（`tag` 的 `label`），截断落在这一层，标签与 `+N` 共用。
  - **三家适配器**：Vue / React 的 `XhSelectTag` / `XhSelectOverflowTag` 名字不变，渲出来的节点换成 `tag` 的 `root`；插槽 / children 只有文字时替它包一层新增的 `XhSelectTagLabel`（与 `XhTagRoot` 同一条规矩），作者自己写了节点就原样放行。Web Components 侧作者写法不变（`data-xh-part="tag"` / `"overflow-tag"`），两个角色节点接的是 `tag` 的 `root`，元素替只有文字的节点包一层 `label`，`+N` 的文字填进那层 `label`；这两个作者名以 `delegates` 登记为归 `tag` 的 scope 管，不再进 `select` 的解剖。
  - **皮肤**：`select.css` 里画标签与 `+N` 的规则整段删掉，只留标签行（`tag-list`）与行里子项怎么排：行里的 `tag` 允许缩短（`flex: 0 1 auto; min-inline-size: 0`），`+N`（带 `data-count`）不缩。`tag.css` 的覆盖槽（`--xh-tag-bg` / `--xh-tag-fg` / `--xh-tag-radius` 等）写在 `select` 外层即生效。
  - **档位**：标签跟着控件的 `size` 走同一档——sm 控件 28（内 26）里的标签 22、md 32（内 30）里 26、lg 40（内 38）里 30，三档都在盒的内侧，盒高不变。

  **破坏面：**

  - `select` 的解剖少两个部件（23 → 21）：`tag`、`overflow-tag` 删除。按部件数或 `[data-scope='select'][data-part='tag']` / `[data-part='overflow-tag']` 选择过的皮肤、测试与作者样式要改成 `[data-scope='tag'][data-part='root']`（`+N` 加 `[data-count]`）。
  - `select.css` 的十一个覆盖槽随之删除：`--xh-select-tag-bg` / `-fg` / `-font-size` / `-gap` / `-px` / `-radius` 与 `--xh-select-overflow-tag-bg` / `-fg` / `-font-size` / `-px` / `-radius`，改用 `tag` 自己那批槽；`--xh-select-tag-list-gap` 留着（它是标签行自己的间隙）。
  - `+N` 那一枚不再另配压一档的配色，与标签同一副长相；要区分它就按 `[data-scope='tag'][data-part='root'][data-count]` 覆盖 `--xh-tag-bg` / `--xh-tag-fg`。
  - 标签的形态按控件的面派：`subtle` 控件里的标签从淡底变成描边（此前与盒同一块淡底、只剩文字）；写了 `tone` 的 `select` 其标签现在跟着着色。
  - `SelectApi` 多 `getTagLabelProps` 一个成员；自己按 `SelectApi` 造对象的要补上。Vue / React 各多一个 `XhSelectTagLabel`。
  - Web Components 侧 `tag` / `overflow-tag` 节点里只有文字时，元素会把文字挪进一层新建的 `<span data-scope="tag" data-part="label">`；按 `textContent` 读仍是原文，按 `firstChild` 读到的是那层 label。
  - 标签的高度与字号随本次一并变大（三档 18 → 22 / 26 / 30，字 12 → 12 / 13 / 14），圆角从药丸（`--xh-shape-pill`）改为 `tag` 的 `--xh-shape-control`。

- 2967ce9: Select 单选与多选统一使用末端对号表示选中。移除品牌选中底，默认选中文字不变色、不加粗；
  悬停、键盘高亮和聚焦使用同一中性底，按下反馈保持独立。此规则不改变选择值与关闭行为。

  删除本轮引入的 `--xh-select-item-bg-selected`，不保留两套默认选中表达或兼容分支。
  自定义选项应显式组合 `item-indicator`，以便选中状态有可见标记；自动结构已包含此部件。

- dc64383: **浮层面板的三段分区补齐，文本输入的两套控件盒收成一套。** 不留别名、不留 `var(新名, 旧名)` 双写：下面标为已删的槽名在皮肤里不再存在，设它没有任何效果。

  ## 一、`dialog` / `drawer` 补三段：`header` / `body` / `footer`

  `floating-panel` 早有 `header` 与 `body`，`dialog` 与 `drawer` 一个都没有——面板里做不出「头尾定在原处、正文自己滚」，官方示例只好在 `content` 里手写一个内联的滚动盒。三家现在是同一套角色划分：

  | 部件     | 角色   | 排布契约                                                                                            |
  | -------- | ------ | --------------------------------------------------------------------------------------------------- |
  | `header` | 面板头 | `flex: none`，不参与压缩；`dialog` / `drawer` 里纵向堆叠标题与说明，`floating-panel` 里是横排标题栏 |
  | `body`   | 正文   | `flex: 1 1 auto` + `min-block-size: 0` + `overflow: auto`，面板里唯一会滚的一段                     |
  | `footer` | 面板尾 | `flex: none`，动作按钮排一行靠尾                                                                    |

  `dialog` 与 `drawer` 各新增：

  - 无头层 `getHeaderProps` / `getBodyProps` / `getFooterProps`；
  - Vue `<XhDialogHeader>` / `<XhDialogBody>` / `<XhDialogFooter>`、`<XhDrawerHeader>` / `<XhDrawerBody>` / `<XhDrawerFooter>`；
  - 自定义元素的 `header` / `body` / `footer` 三个角色节点（`data-xh-part`），已接进 `@csspart`；
  - 覆盖槽 `--xh-{dialog,drawer}-header-gap` / `-header-pb` / `-footer-gap` / `-footer-pt`。

  面板的内衬与安全区让位仍由 `content` 一层给出，三段只接手段与段之间那道缝：内衬换成三段各留一份，安全区与局部容器两档就要在三处各算一遍。

  写了 `body` 的那一档，`dialog` 的 `content` 同时封顶（`max-block-size: 100%`）并收起自身溢出——不封顶正文永远没有可滚的余量，滚动条出不来。不写 `body` 的写法与从前逐值相同。

  **新增，不是改名**：既有的 `content` + `title` + `description` 写法一个字不用改。

  ## 二、`text-field` 只剩一个控件盒（BREAKING）

  `text-field.css` 此前有两套完整的盒规则：一套画在 `control` 上，一套画在 `input` 上，两组公开槽并存且互不感知——同一个组件里长了两个盒，同族其余控件的盒都只有一个。现在 `control` 是唯一的视觉盒：描边、圆角、底色、落影与聚焦环全画在它身上，`input` 退成框里的一段透明分段。

  **`input` 必须写在 `control` 里面**，否则输入框没有任何框的观感（不再有「不写 control 就由 input 自己画盒」这一档）。

  已删的覆盖槽（14 支），换成 `control` 上的同名槽：

  | 已删                                   | 换成                                     |
  | -------------------------------------- | ---------------------------------------- |
  | `--xh-text-field-input-h`              | `--xh-text-field-control-h`              |
  | `--xh-text-field-input-min-w`          | `--xh-text-field-control-min-w`          |
  | `--xh-text-field-input-px`             | `--xh-text-field-control-px`             |
  | `--xh-text-field-input-radius`         | `--xh-text-field-control-radius`         |
  | `--xh-text-field-input-bg`             | `--xh-text-field-control-bg`             |
  | `--xh-text-field-input-bg-hover`       | `--xh-text-field-control-bg-hover`       |
  | `--xh-text-field-input-bg-readonly`    | `--xh-text-field-control-bg-readonly`    |
  | `--xh-text-field-input-bg-disabled`    | `--xh-text-field-control-bg-disabled`    |
  | `--xh-text-field-input-border`         | `--xh-text-field-control-border`         |
  | `--xh-text-field-input-border-hover`   | `--xh-text-field-control-border-hover`   |
  | `--xh-text-field-input-border-focus`   | `--xh-text-field-control-border-focus`   |
  | `--xh-text-field-input-border-at-max`  | `--xh-text-field-control-border-at-max`  |
  | `--xh-text-field-input-border-invalid` | `--xh-text-field-control-border-invalid` |
  | `--xh-text-field-input-shadow`         | `--xh-text-field-control-shadow`         |

  仍留在 `input` 上的是文字与自动填充那几支：`--xh-text-field-input-fg` / `-font-size` / `-autofill-bg` / `-autofill-fg`，以及多行宿主的 `--xh-text-field-textarea-py`。

  多行宿主（`as="textarea"`）在框里：`control` 的定高换成由行数撑起（`block-size: auto` + `min-block-size` 走控件行高），纵向内衬仍由 `input` 自己留。

  文档站 18 份示例（`text-field` 16 份、`listbox` 与 `pagination` 各 1 份）已改成把 `input` 写进 `control`；`text-field/11-affix` 的前后缀不再靠绝对定位压在输入框上，改为与输入框同在框里排成一行。

  ## 三、`select` / `listbox` 两页登记官方组合写法

  `popselect` 退役后，「浮层壳 + 条目层」的替代写法成为两页文档里的官方组合示例：浮层只管开合与定位，条目、键盘导航、连打检索与选中语义全在 `listbox` 里。`select` 页新增示例「官方组合：浮层 + 列表框」，`listbox` 页的「弹出式选择」是同一例。

- 994c231: Collection Item 配方 `page` 语境的当前项（SideNav 当前页）不再在起始侧画 2px 品牌指示条，只由 `--xh-bg-brand-subtle` 行面与 `--xh-fg-on-brand-subtle` 字色表达；配方新增 `markers.page.current` 开关（`none` / `bar`），生成器按它决定是否产出那条 `::before`。
- b5c2035: Skeleton 的默认文字条高度调整为 12px，组内间距调整为 12px，并禁止骨架条接管指针事件。
- bdbf03c: **九组覆盖槽改名。** 不留别名、不留 `var(新名, 旧名)` 双写：旧槽名在皮肤里不再被读，写旧名的覆盖不再生效。

  ## 部件段对齐

  槽名 `--xh-<组件>[-<部件>]-<后缀>`：部件是 `root` 时省略部件段，不是 `root` 时必须带。

  | 组件                          | 旧槽                                            | 新槽                                                    |
  | ----------------------------- | ----------------------------------------------- | ------------------------------------------------------- |
  | `menubar`（`root`）           | `--xh-menubar-root-{gap,py,px,radius,bg,fg}`    | `--xh-menubar-{gap,py,px,radius,bg,fg}`                 |
  | `menubar`（`content`）        | `--xh-menubar-{py,px,radius,bg,fg,shadow}`      | `--xh-menubar-content-{py,px,radius,bg,fg,shadow}`      |
  | `menu`（`content`）           | `--xh-menu-{py,px,radius,bg,fg,shadow}`         | `--xh-menu-content-{py,px,radius,bg,fg,shadow}`         |
  | `context-menu`（`content`）   | `--xh-context-menu-{py,px,radius,bg,fg,shadow}` | `--xh-context-menu-content-{py,px,radius,bg,fg,shadow}` |
  | `image-cropper`（`viewport`） | `--xh-image-cropper-radius`                     | `--xh-image-cropper-viewport-radius`                    |

  `menubar` 两条方向相反，`--xh-menubar-{py,px,radius,bg,fg}` 这五个名字两条都用到：改前它们管浮层面板，改后管横条本身。设过这五个名字的，要按管的是哪一层重新落位。

  `menu` / `context-menu` 与 `menubar` 的 `content` 是同族同结构的三份面板，槽名必须逐条同形。三家的 `arrow` 底色仍取 `content` 的槽（`--xh-<组件>-content-bg`），箭头与面板同底。三家的 `--xh-<组件>-{border,min-w,max-w,max-h}` 不改。

  ## 槽名跟上部件名

  | 组件          | 旧槽                                              | 新槽                          |
  | ------------- | ------------------------------------------------- | ----------------------------- |
  | `cascader`    | `--xh-cascader-row-*`（13 支）                    | `--xh-cascader-item-*`        |
  | `tree-select` | `--xh-tree-select-row-*`（10 支）                 | `--xh-tree-select-item-*`     |
  | `fieldset`    | `--xh-fieldset-helper-{fg,fg-disabled,font-size}` | `--xh-fieldset-description-*` |

  `cascader` 的 `item` 与 `search-item`、`tree-select` 的 `item` 与树内条目仍共用同一族行度量，改名后共用关系不变。

  ## 取值与状态对齐

  | 组件     | 旧槽                          | 新槽                     |
  | -------- | ----------------------------- | ------------------------ |
  | `toggle` | `--xh-toggle-{bg,fg}-pressed` | `--xh-toggle-{bg,fg}-on` |

  按下档的 `data-state` 取值是 `on` / `off`，槽名跟着取值走。

- 4c287eb: **槽名的部件段与所在部件对齐，跨组件抄写的默认值收成一处。** 三道门禁把扫描面补到位之后，各揪出一处存量违规，逐条修掉，没有加豁免。默认渲染逐像素未变——40 张像素基线（button / text-field / select / menu / popover / dialog / drawer / toast 共 8 件 × 5 档主题密度对比）无差异。

  **破坏性：`--xh-combobox-input-py` 已删，换成 `--xh-combobox-control-py`。** 这条槽管的是「输入行是多行时，控件盒纵向撑开多少」，规则作用在 `control` 上，槽名却写着 `input`——照名字去改 `input` 的内衬，改不动；照名字理解这条槽的人，也不知道它其实动的是外面那个盒。CSS 这一介质没有 IDE 提示，改名之后旧声明只会静默失配，不报错也不降级：请在自己的代码库里全文搜索 `--xh-combobox-input-py`，换成 `--xh-combobox-control-py`。默认值仍是 `var(--xh-field-py)`。

  **新增 `--xh-drawer-description-font-size`。** 抽屉的说明文字此前直接写 `var(--xh-text-body-size)`，全库唯一一处没给使用者留口子的说明段——同族的 dialog 早就有这条槽。默认值不变。

  **新增令牌 `--xh-measure-prose`（`32rem`）：成段正文的读行宽度。** empty-state 与 result 的说明段此前各写一份 `32rem`，是同一条没被命名的决策：整句话不收窄就会拉成一条难读的长行。两处改指这支令牌，随之删掉私有槽 `--xh-_empty-state-measure` / `--xh-_result-measure`（私有槽不在公开面上）。两处的使用者槽 `--xh-empty-state-description-max-w` / `--xh-result-description-max-w` 不变，仍排在令牌之前。

  **实心面顶边的内高光收进语气层。** `inset 0 var(--xh-stroke-thin) 0 0 color-mix(in oklab, …14%, transparent)` 这条式子此前在 16 处实心档里各抄一遍，改一处得挨个找。现在由 `tone.css` 统一声明两支私有槽，各组件指过去：跟着语气走的读 `--xh-_highlight-tone`（badge / button / button-group / icon-wrapper / pagination / tag 带语气那档 / toggle / toggle-group / approval / popconfirm / prompt-input / question-flow），底色恒是品牌色的读 `--xh-_highlight-brand`（editable / form / tag 不带语气那档 / tour）。两支的取值与各处原来那一份逐字相同，各组件自己的 `--xh-<组件>-…-shadow` 覆盖槽与「哪一档才画高光」的规则都不动。

  它落在 `:where([data-scope])` 上而不是 `:root` 的令牌层：自定义属性值里的 `var()` 在声明它的那个元素上就替换掉了，写进 `:root` 会把 `--xh-_tone-on` 与 `--xh-fg-on-brand` 一并按根元素解析，语气与嵌套主题（子树上的 `[data-theme='dark']`）就都冻死在根上那一份。

- e6bb853: Spinner 的默认形态由整圈轨道改为渐隐弧，默认颜色继承当前文字色；显式 `ring` 与 `dots` 继续可用。

  三档直径调整为 16 / 24 / 32px，根节点不再接管指针事件。

- f0a2e34: **同义重名收口：13 个 `data-*` 属性名删除，每组只留一个。** 同一件事在不同组件里取了两三个名字，使用者那条 `[data-xxx]` 规则就只能命中其中一部分——想给「拖动中」写一条统一的光标规则，写 `[data-dragging]` 会漏掉图片查看器，写 `[data-panning]` 又只剩它一个。现在每组定一个赢家，输的那个名字从连接层、皮肤、适配器、用例与文档里整个删除，**不留别名、不留过渡期**。

  **破坏性：下表左列的属性名在 DOM 上不再出现，选它的规则一条也不会再命中。** 这一介质没有 IDE 提示，改名之后选择器只会静默失配，不报错也不降级——请在自己的代码库里全文搜索左列这 13 个名字，逐条换成右列。

  | 删掉的名字             | 改成                                  | 组件 / 部件                                                                         |
  | ---------------------- | ------------------------------------- | ----------------------------------------------------------------------------------- |
  | `data-affixed`         | `data-fixed`                          | `affix` 的 `content`                                                                |
  | `data-at-limit`        | `data-at-max`                         | `text-field` 的 `root` / `control` / `input`                                        |
  | `data-autosize`        | `data-auto-resize`                    | `text-field` 的 `input`                                                             |
  | `data-borderless`      | `data-bordered`（**取值反转**，见下） | `table` 的 `root`                                                                   |
  | `data-busy`            | `data-loading`                        | `approval` 的 `root` / `approve-trigger` / `deny-trigger`，`prompt-input` 的 `root` |
  | `data-overflow`        | `data-overflowing`                    | `tags-input` 的 `root` / `control`                                                  |
  | `data-panning`         | `data-dragging`                       | `image-viewer` 的 `viewport` / `image`                                              |
  | `data-row-draggable`   | `data-draggable`                      | `table` 的 `row`                                                                    |
  | `data-ruled`           | `data-split`                          | `table` 的 `root`                                                                   |
  | `data-running`         | `data-loading`                        | `tool-call` 的 `root` / `duration`                                                  |
  | `data-segmented`       | `data-split`                          | `card` 的 `root`                                                                    |
  | `data-sider-collapsed` | `data-collapsed`                      | `layout` 的 `root`                                                                  |
  | `data-sticky`          | `data-fixed`                          | `table` 的 `root` / `header`                                                        |

  **`table` 的外框这一位换成了正面事实，规则要跟着反过来写。** 从前是 `data-borderless` ——「不画外框」时才出现；现在是 `data-bordered` ——「画外框」时出现，缺省就在，写了 `borderless` 才缺席。原先 `[data-scope='table'][data-part='root']:not([data-borderless])` 的写法改成 `[data-scope='table'][data-part='root'][data-bordered]`，原先 `[data-borderless]` 的写法改成 `:not([data-bordered])`。改的只是这一位报的方向，`borderless` 这个 prop 与默认渲染都没有变。

  **`data-fixed` 从此统管「这块钉住不随滚动走」。** `layout` 的页头与侧栏、`table` 的吸顶表头、`affix` 越过判定线之后的内容，说的是同一件事，从前叫三个名字。`layout` 的根节点仍旧发 `data-header-fixed` 与 `data-sider-fixed` ——同一个元素上并存着两段各自的开关，不带部件名就分不开，它们是 `data-fixed` 带部件名的转述，不是另一个名字。`log` 的 `data-sticking` 不在这一组：那一位说的是滚动跟随底部，不是钉住。

  **`data-loading` 从此统管「异步在途」。** `approval` / `prompt-input` 的「等外部结果落定」与 `tool-call` 的「这次调用还在执行」，与 `button` / `table` 那一批的加载中是同一件事，词汇表里 `aria-busy` 早就配对到 `data-loading`。

  **`data-at-max` 统管「已经到上限」，`data-overflowing` 统管「越过了容纳上限」。** 前者与既有的 `data-at-min` 成对；后者的两处含义各自照旧——`ellipsis` 是文本超出容器正在被省略，`tags-input` 是标签数越过 `max`（刚好装满仍是 `data-at-max`）。

  **`data-split` 统管「在相邻块之间画分隔线」**：`list` 的条目之间、`card` 的段之间、`table` 的列之间。`segmented` 这个名字与同名组件 `segmented` 撞脸，`ruled` 只在表格排版里说得通，两者都让位。

  **两个覆盖槽随属性一起改名**，也请一并搜索替换：

  | 删掉的槽名                                | 改成                                    |
  | ----------------------------------------- | --------------------------------------- |
  | `--xh-text-field-control-border-at-limit` | `--xh-text-field-control-border-at-max` |
  | `--xh-text-field-input-border-at-limit`   | `--xh-text-field-input-border-at-max`   |

  全局语义令牌 `--xh-border-at-limit` 不在这次范围里，名字不变；`tags-input` 一直就是这么接的（组件槽叫 `-at-max`，兜底取 `--xh-border-at-limit`），`text-field` 这一改是与它对齐。本条不动各组件的 prop 名（`borderless` / `ruled` / `stickyHeader` / `autoSize` / `allowOverflow`），默认渲染逐像素不变。`card` 的 `segmented` 另由 prop 改名那一条改成 `split`，与它自己发的 `data-split` 对齐。

- f7495fd: **步骤条的 `StepStatus` 收成 `'completed' | 'current' | 'incomplete'`；出错 / 警示改为逐步语气 `tones`。**

  `'error'` 与 `'warning'` 原来混在状态里：一步被打回时它仍然是「当前那一步」或「走过的那一步」，状态位却被语气占掉，皮肤只好另写两套颜色。现在状态只说步序，语气另走全库同一根轴：根上的 `tone` 给整组配色，新增 `tones?: Record<number, Tone>`（以及 collection 单步的 `tone`）给某一步单独标语气，落成 `item` 的 `data-tone`，那一步的标记、标题与连接线在这一级重新从语气层取色，还没走到的那一步也以空心描边加同色数字被看见。三端同步：Vue / React 新增 `tones` prop，自定义元素新增 `tones` property；皮肤撤掉 `data-state='error' | 'warning'` 的规则与对应的 `--xh-steps-*-error / -warning` 槽，改为 `--xh-steps-indicator-*-toned` 与 `--xh-steps-title-fg-toned`；「错误状态」示例改用 `tones`。

- 5ae85a9: Table 的排序把手改为列头里独立的定尺图标钮，不再撑满整个列头、也不再包着列名：列名装进 `column-header` 里新增的 `column-label` 部件，`sort-trigger` 写在列名之后，被推到列头行尾侧与列宽把手并排（两颗并排时只有排序钮吃 `auto` 外边距，列宽把手紧贴其后）；点列头文字不再排序，点钮才排序。

  Headless 新增 `column-label` 部件（anatomy 登记、`getColumnLabelProps()` 只投部件属性、无状态）：列名装进它而不是裸写在 `column-header` 里。列头是 flex 行，裸文本是匿名 flex item、min-inline-size 为 auto 缩不下去，窄列配长列名时定尺的把手（排序 / 列宽 / 列拖拽）连同 auto 外边距一起被挤出列头盒、被 overflow: hidden 裁掉，排序只剩 Tab 可达；皮肤给不了匿名项 min-inline-size: 0 / text-overflow，只有真实节点接得住。同时新增 `TableTranslations.sort(columnLabel)`（默认 `Sort by <列名>`），写成排序钮的 `aria-label`——钮里只剩一枚箭头，名字得自己说清是给哪一列排序的。`role=button`、Tab 位、Enter / Space、按住 Shift 追加排序链、`aria-disabled`、`data-sort` / `data-sort-index` 都不变；`data-xh-action-profile` 由 `row` 改为 `icon`，与展开箭头同款。

  皮肤侧的破坏性变化：排序钮接进五颗把手共用的 16px 方盒（`--xh-table-trigger-size`，comfortable 16 / compact 14），静息透明、悬停 / 按下按表头淡底阶梯换面（200 → 300）并 0.97 缩放；方向箭头从 `::after` 改画在 `:empty::before` 上（作者塞进钮里的图标整个顶掉兜底），尺寸经钮自己改接的 `--xh-icon-size`（公开槽 `--xh-table-sort-size`，缺省与方盒同边长）量；多列排序的序号角标改画在 `::after`，压在钮的行尾上角（rtl 自动换边）；`--xh-table-sort-gap` 槽随撑满列头那套写法一起退役。**列名应放进 `column-label`**（`[data-scope='table'][data-part='column-label']`：`flex: 1`、`min-inline-size: 0`、省略号，列头里唯一可收窄的一格），排序钮、列宽把手与列拖拽把手写在它旁边作为兄弟；不可排序、不可改宽的列也用它。粗指针下多列排序的序号角标补了 `inset-inline-start: auto`，不再被家族热区的行首起点过约束成方盒的一半（两位数序号此前会被截断）。作者自己给 `sort-trigger::after` 写过覆盖、或依赖把列名塞进 `XhTableSortTrigger` / `<span data-xh-part="sort-trigger">` 的标记要按新写法改：列名装进 `XhTableColumnLabel` / `<span data-xh-part="column-label">`、把手在后。

  三端各新增列名部件：Vue `XhTableColumnLabel`、React `XhTableColumnLabel`、Web Components `data-xh-part="column-label"`（CEM 已登记）；文档站全部表格示例与 03-data-page 的列头改为列名装进部件、把手在旁。

- a99cb41: Tabs 横排的 line 与 card 档标签宽随文字走（`flex: 0 0 auto`），不再把标签带按可用宽度等分铺满一行；segment 档仍是轨道里等分的格子。铺满一行的排布请在标签上写 `flex: 1`。
- 3ef5a6e: **`tag-group` 的条目套成 `tag`：一枚标签就是 `tag` 的 `root`，文字是 `tag` 的 `label`，摘除钮是 `tag` 的 `close-trigger`；`item` / `item-text` / `item-delete-trigger` 不再是本组件的部件，`tag-group.css` 不再自己画标签。**

  此前 `tag-group` 自己画了一整套标签（三档尺寸、三种形态、语气、置灰、截断、摘除钮、兜底字形），与 `tag.css` 是第二份拷贝。现在：

  - **连接层**：每一枚标签在 `connectTagGroup` 里各是一份 `connectStaticTag`（受控 `open: true`、三轴与 `readOnly` 从整组传下去、`disabled` 与 `closable` 逐枚定、`translations.close` 取 `translations.deleteItem(标签文字)`）。`api.getItemProps()` 是这份实例的 `root` 叠上集合里的那几件事——`role="row"`、`data-value`、roving `tabindex`、`aria-selected` / `aria-disabled`、`data-selectable` / `data-deletable` / `data-highlighted` / `data-selected`、点选与聚焦处理器；`api.getItemTextProps()` 是它的 `label`；`api.getItemDeleteTriggerProps()` 是它的 `close-trigger` 再叠 `tabindex="-1"` 与「主键按下不夺焦」。按叉时 `tag` 只发 `onOpenChange({ open: false })`，`tag-group` 在那里把焦点交给相邻的一枚再送 `ITEM.DELETE`，与键盘 `Delete` / `Backspace` 走同一条路。
  - **选中改成布尔 `data-selected`**（词汇表里 `row` + `aria-selected` 配的就是它），`data-state` 只剩 `tag` 的 `open` 族（宿主根上恒为 `open`）；`cell` 同步带 `data-selected` / `data-highlighted` / `data-disabled`。
  - **禁用 / 只读矩阵由 `tag` 给**：整组或这一枚禁用时标签置灰、钮留位并原生 `disabled`；整组只读时钮留位、原生 `disabled`，标签本身不置灰；没开放摘除时钮连位置一起收起。
  - **三家适配器**：Vue / React 的 `XhTagGroupItem` / `XhTagGroupItemText` / `XhTagGroupItemDeleteTrigger` 名字与用法不变，渲出来的节点换成 `tag` 的 `root` / `label` / `close-trigger`；Web Components 侧作者写法不变（`data-xh-part="item" / "item-text" / "item-delete-trigger"`），这三个作者名以 `delegates` 登记为归 `tag` 的 scope 管。
  - **皮肤**：`tag-group.css` 里画标签的全部规则整段删掉（尺寸三档、形态、语气、置灰、截断、打印、摘除钮、兜底字形、聚焦环的 `solid` 上下文），只留集合层的事——`root` / `label` / `list` 怎么排、`cell` 那一格、以及叠在 `tag` 根上的可点（`cursor` 与按压回执）、锚点与悬停的中性灰轻档（实心档不进）、选中的描边与字色（实心档改用面配对的前景色描边，字不换）、只读的光标。聚焦环全归 `focus.css` 的通用环加 `tag.css` 的 `solid` 上下文规则，`tag-group.css` 不再另写。标签的样子归 `tag.css`，`--xh-tag-*` 覆盖槽在组里照样生效。
  - **新导出 `tagGroupItems(list)`**：按文档序取列表里担 `row` 角色的 `tag` 根（作者塞进格子里的独立标签没有这个角色，不算条目；嵌套的标签组互不吞并），代替原来的 `tagGroupItemQuery`。

  **破坏面：**

  - `tag-group` 的解剖少三个部件（7 → 4）：`item` / `item-text` / `item-delete-trigger` 删除。按 `[data-scope='tag-group'][data-part='item']` 选择过的皮肤、测试与作者样式要改成 `[data-scope='tag-group'][data-part='list'] > [data-scope='tag'][data-part='root']`；`item-text` 改成 `[data-scope='tag'][data-part='label']`，`item-delete-trigger` 改成 `[data-scope='tag'][data-part='close-trigger']`。
  - 选中态从 `data-state="checked" | "unchecked"` 改成布尔 `data-selected`：按 `[data-state='checked']` 写过的样式与断言要改成 `[data-selected]`。
  - `@xihan-ui/headless` 不再导出 `tagGroupItemQuery`（`core` 的 `queryItems` 按容器 scope 过滤，对上不了 `tag` 的 scope），改用 `tagGroupItems(list)`。
  - `tag-group.css` 的这些覆盖槽随之删除：`--xh-tag-group-item-icon-size` / `-px` / `-py` / `-px-deletable` / `-radius` / `-bg` / `-fg` / `-font-size` / `-font-weight` / `-border` / `-shadow` / `-border-disabled` / `-bg-disabled`、`--xh-tag-group-cell-gap`、`--xh-tag-group-item-delete-size` / `-radius` / `-fg` / `-bg-hover` / `-bg-active`；改用 `tag` 的 `--xh-tag-icon-size` / `--xh-tag-gap` / `--xh-tag-px` / `--xh-tag-py` / `--xh-tag-radius` / `--xh-tag-bg` / `--xh-tag-fg` / `--xh-tag-font-size` / `--xh-tag-font-weight` / `--xh-tag-border` / `--xh-tag-shadow` / `--xh-tag-border-disabled` / `--xh-tag-bg-disabled` / `--xh-tag-close-size` / `--xh-tag-close-radius` / `--xh-tag-close-fg` / `--xh-tag-close-bg-hover` / `--xh-tag-close-bg-active`。留下的只有集合层的三个：`--xh-tag-group-item-bg-hover` / `--xh-tag-group-item-border-selected` / `--xh-tag-group-item-fg-selected`。`cell` 那一格的间距照抄所在标签的那一档（`gap: inherit`），改 `--xh-tag-gap` 即可。
  - 标签的尺寸走 `tag` 的三档：md 从 12px 字号、2px 竖向内衬变成 `tag` 的 13px 字号、4px 竖向内衬与不低于指示符的行框（同档标签有没有关闭钮一样高）；sm / lg 同理。
  - 悬停与键盘锚点的中性灰轻档现在也落到写了语气的淡底标签上（此前被形态规则的源序盖住而不生效）；实心标签不论有无语气都不进轻档，面不换（此前没写语气的实心标签会换成灰底、字仍是实心底上的浅字，1.26:1）。
  - 选中的实心标签字不换（仍是 `tag.css` 给的面配对前景色，作者的 `--xh-tag-fg` 照旧生效），描边取字色（`currentColor`）在实心底上描出一圈（此前没写语气的那一档把字换成 `--xh-fg-brand-strong` 压在品牌底上读不出来，写了语气的那一档被形态规则盖住、选中看不出来）。`--xh-tag-group-item-border-selected` 在实心档上照样先于字色生效，`--xh-tag-group-item-fg-selected` 只落到非实心档。
  - 摘除钮的样子不变（此前已与 `tag` 的关闭钮同一副长相），只是覆盖槽换成 `--xh-tag-close-*`；标签与摘除钮的聚焦环改走 `focus.css` 的通用环加 `tag.css` 的 `solid` 上下文规则，`tag-group.css` 不再画环。
  - `tag.css` 的实心档环规则（标签根与关闭钮的 `--xh-_ring-color: currentColor`）排掉置灰档：组里置灰的标签仍是 roving 锚点、落得上焦点，它的字已换成置灰色，环退回默认那一支（此前由 `tag-group.css` 自己的规则排掉，现在归 `tag.css`）。

- 3ef5a6e: **`tags-input` 的标签预览退役成 `tag`：`item-preview` / `item-text` / `item-delete-trigger` 不再是本组件的部件，渲出来的是 `tag` 的 `root` / `label` / `close-trigger`（`data-scope="tag"`），样子归 `tag.css`。**

  标签输入里每一枚标签此前是本组件自己画的一颗胶囊（底色、圆角、字号、删除钮、悬停与按压都另写一套）——`tag` 本来就是这枚胶囊，第二份就是另起一套。现在：

  - **连接层**：每一枚标签在 `connectTagsInput` 里各是一份 `connectStaticTag`（`variant` 按控件的面派：`subtle` 控件里是描边标签，其余含缺省是淡底标签；`tone` / `size` / `disabled` / `readOnly` 随控件；`closable: true`；`translations.close` 取 `translations.deleteItem(标签值)`）。预览就是这份实例的 `getRootProps()`，`open` 只看这一枚是不是正被就地编辑：编辑时 `tag` 按 `open=false` 给 `hidden` 与 `data-state="closed"`，与 `item-input` 的 `hidden` 互斥。文字是 `getLabelProps()`，删除钮是 `getCloseTriggerProps()` 再合上 `tabindex="-1"` 与「按下不夺焦」——按它时 `tag` 只发 `onOpenChange({ open: false })`，`tags-input` 在那里送 `TAG.DELETE` 并把焦点交回输入框（仅当焦点当下正落在这一枚里）。
  - **状态标记留在 `item` 上**：`data-value` / `data-highlighted` / `data-editing` / `data-disabled` / `data-readonly` 仍打在本组件的 `item` 包裹层上，`tag` 的 `root` 只带 `tag` 自己的属性（三轴、`data-state`、`data-disabled`、`hidden`）。光标走到标签上的反白由 `[data-scope='tags-input'][data-part='item'][data-highlighted] > [data-scope='tag'][data-part='root']` 这条跨 scope 规则画在 `tag` 的 `root` 上，覆盖槽仍是 `--xh-tags-input-item-bg-highlight` / `-fg-highlight`。
  - **禁用 / 只读矩阵由 `tag` 给**：禁用时钮留在原地、原生 `disabled` 并带 `data-disabled`，整枚标签置灰；只读时钮同样留位、原生 `disabled`，标签本身不置灰。
  - **可及名**：仍走 `translations.deleteItem`（缺省 `Delete <标签值>`），经 `tag` 的 `translations.close` 落到那颗钮上。
  - **三家适配器**：Vue / React 的 `XhTagsInputItemPreview` / `XhTagsInputItemText` / `XhTagsInputItemDeleteTrigger` 名字与用法不变，渲出来的节点换成 `tag` 的三个部件；Web Components 侧作者写法不变（`data-xh-part="item-preview"` / `"item-text"` / `"item-delete-trigger"`），三个作者名以 `delegates` 登记为归 `tag` 的 scope 管。
  - **皮肤**：`tags-input.css` 里画胶囊的规则整段删掉（`item` 的底色 / 圆角 / 字号 / 反白 / 置灰 / 编辑态透底，`item-preview` 的内衬，`item-text` 的截断，`item-delete-trigger` 的尺寸 / 圆角 / 悬停 / 按压 / 聚焦环 / 禁用色 / 兜底字形）；`item` 只剩「在行里怎么占位」（不缩、不超过一行）。标签吃 `tag.css`：三档高 22 / 26 / 30 装进控件的 28 / 32 / 40 里，框仍是一行控件高；就地编辑框的行框、内衬与字号照 `tag` 那一档写，换进换出时与标签一样高、行不跳。

  **破坏面：**

  - `tags-input` 的解剖少三个部件（12 → 9）：`item-preview` / `item-text` / `item-delete-trigger` 删除。按 `[data-scope='tags-input'][data-part='item-preview' | 'item-text' | 'item-delete-trigger']` 选择过的皮肤、测试与作者样式要改成 `[data-scope='tag'][data-part='root' | 'label' | 'close-trigger']`（要限定在 `tags-input` 里就前缀 `[data-scope='tags-input'][data-part='item']`）。
  - `tags-input.css` 的这些覆盖槽随之删除：`--xh-tags-input-item-bg` / `-fg` / `-gap`，`--xh-tags-input-delete-size` / `-radius` / `-bg` / `-fg` / `-font-size` / `-fg-highlight` / `-bg-hover` / `-fg-hover` / `-bg-active`，改用 `tag` 的 `--xh-tag-bg` / `--xh-tag-fg` / `--xh-tag-gap` / `--xh-tag-close-size` / `--xh-tag-close-radius` / `--xh-tag-close-fg` / `--xh-tag-close-bg-hover` / `--xh-tag-close-bg-active`（写在 `tags-input` 的根上即对整框的标签生效）。`--xh-tags-input-item-radius` / `-py` / `-px` / `-font-size` 只剩就地编辑框在用，`-radius` 的缺省从 `--xh-shape-pill` 改成 `--xh-shape-control`（与 `tag` 同）。
  - 标签的高从随字号算的一档变成 `tag` 的三档 22 / 26 / 30，圆角从胶囊圆改成 `--xh-shape-control`，字重取 `tag` 的 `--xh-font-weight-medium`；反白档描边收成透明。
  - 悬停 / 按压底色从 `--xh-bg-subtle-hover` / `-active` 换成由当前前景色兑出的 `color-mix`；缺省字色从 `--xh-fg-muted` 换成标签自己的文字色。
  - 聚焦环不再由 `tags-input.css` 画，走 `focus.css` 的通用环；反白标签里的叉取 `currentColor`。
  - 只读时删除钮从「原生 `disabled`（由整组只读推得）」保持原生 `disabled` 不变，但现在是 `tag` 的 `readOnly` 给的：钮带 `data-disabled`，标签的 `root` 不带。

- bd67823: TimePicker 的快捷选项与时、分、秒列统一使用对号表示当前值。默认选中项不再使用品牌实底、反白正文或加粗；
  悬停、键盘高亮和可见焦点使用中性实体底，选中与临时高亮可以同时辨认。

  对号由组件皮肤在恒定轨中绘制。preset 固定在逻辑末端；数字格两侧保留等宽空间，确保选中状态和 RTL
  不会改变数字的数学中心。forced-colors 使用系统前景，禁用选中项使用 GrayText。

  新增 `--xh-time-picker-preset-fg`、`--xh-time-picker-preset-check-size`、
  `--xh-time-picker-preset-check-fg`、`--xh-time-picker-item-check-size` 与
  `--xh-time-picker-item-check-fg` 覆盖槽。

  移除不再承载选中语义的 `--xh-time-picker-preset-bg-checked`、
  `--xh-time-picker-preset-bg-checked-hover`、`--xh-time-picker-item-bg-checked` 与
  `--xh-time-picker-item-bg-checked-hover`。不保留品牌选中面的兼容分支。

  皮肤体积（去注释、压空白）：前一提交源码 20894 字节，当前 20968 字节；登记基线 20894 → 20968，只更新本组件，10% 容差保持不变。

- fb01380: Toast 新增必需的 `content` 文本列与可选 `description`，并将默认卡片改为中性浮层；语气只落到标题和状态图标。

  全局服务默认落在底部，最多显示 3 条、间距 12px；默认停留与退场窗口分别改为 4000ms 和 300ms，关闭入口默认可用，全局服务在页面转入后台时自动暂停计时。

  移除中部三种落位，只保留顶部与底部的六种边缘落位。

- a16f7f2: **轻提示与通知的 `type` 改名 `tone`，取值收成全库语气轴的 `info | success | warning | danger`；加载中从语气里拆出来，独立成 `loading?: boolean`。**

  原来的 `type` 一位说了两件事：既是配色语气，又用 `'loading'` 表达"事情还没完"，于是 `'error'` 得先翻译成语气层的 `danger`，`'loading'` 又得偷偷派生成中性色。现在语气与加载态各占一位：`tone` 直接落到 `data-tone`，决定配色、行首字形与实时区级别（`danger` 走 alert + assertive）；`loading` 落到 `data-loading`，字形换成转圈且不自动消失，配色照语气走，完事后写 `{ loading: false, tone: 'success' }` 收尾。皮肤不再读 `data-severity`。

  三端与服务同步：Vue / React 的 `type` prop、自定义元素的 `type` attribute 改为 `tone` + `loading`；`ToastType` / `NotificationType` 改名 `ToastTone` / `NotificationTone`；轻提示与通知服务的 `error()` 糖改名 `danger()`，`loading()` 糖改为打开 `loading` 位，`promise()` 落定后以 `{ loading: false, tone }` 改写；`@xihan-ui/sound` 的 `withToastSound` 端口同步改成 `danger`，`sounds` 覆盖表的键从 `error` 改为 `danger`（缺省仍发主题里那把 `error` 声）。

- d51d182: **令牌层补两处缺口，并把 space 的间距槽移出全局原语的命名空间。**

  **新增 `--xh-elevation-lifted`。** 海拔阶梯此前只有三档：`raised` 是贴在页面上的面，`floating` 是 portal 出去的锚定浮层，`sheet` 是遮罩式与通知。被指针拎起来、正跟着手移动的东西（滑杆拇指、拖动中的排序项、取色器拇指）没有自己那一档，只能借 `floating`——那一档为浮层调深时，跟手的拇指会跟着莫名变重。新档逐位落在 `raised` 与 `floating` 中间：偏移 1 → 2 → 4、模糊 2 → 4 → 8、收缩 0 → -1 → -2、主层不透明度浅色 0.05 → 0.08 → 0.1、深色 0.4 → 0.45 → 0.5；打印档与另外三档一样取消。深色档不带 `floating` 与 `sheet` 那条 1px 白色描边——那条描边是给身下没有自己边界的面用的，跟手移动的元素带着自己的描边一起走。眼下还没有皮肤引它。

  **新增 `--xh-gradient-brand-from` / `--xh-gradient-brand-to`，渐变字改引它们。** `gradient-text` 此前直接引 `--xh-color-brand-500` / `--xh-color-brand-700` 两支色阶原语，而原语只在根上声明一次、浅色档与深色档都不重声明——同一份令牌表里 `--xh-bg-brand` 浅色指 600、深色指 500，全库品牌面随主题走，只有渐变字四季不变，700 那一端落在深色画布上尤其暗。新的两支逐主题给值：浅色 `brand-500 → brand-700`（白底上 3.74:1 → 6.48:1，与改前渲染一致），深色 `brand-400 → brand-300`（深底上 7.33:1 → 10.85:1）。改写品牌色的使用者从此只改语义层，渐变字跟着走。`--xh-gradient-text-from` / `--xh-gradient-text-to` 两个组件槽照旧，写了就以它为准。

  **破坏性：`--xh-space-gap` 改名 `--xh-space-root-gap`，旧名已删。** `--xh-space-` 是全局间距原语的命名空间（`--xh-space-0` … `--xh-space-8` 与 `--xh-space-0_5` / `-1_5` / `-2_5`，后缀一律是数字）。在 `:root` 上写 `--xh-space-gap` 的人会以为自己在改全站间距，实际只改了 Space 一个组件；反过来，日后往令牌表里加一支同名的，全站 Space 的缺省间距会被悄悄接管。新名字带部件段，与其余组件槽同构。改法：`--xh-space-gap: 24px` 改写成 `--xh-space-root-gap: 24px`，位置与作用范围都不变。

  **两道新判据。** `check-token-refs` 盯住 `--xh-space-` 命名空间：底下只许有间距原语，以及形如 `--xh-space-<部件>-<属性>`、部件段取自 space 解剖的组件槽（皮肤在场标记单独登记并带过期反查）；皮肤与令牌产物两边都扫。`check-color-literals` 盯住色阶原语下探：皮肤取色只走语义令牌，画的东西本来就不该随主题翻的（语气层、热力图色板、二维码、看图器、取色器等 7 份皮肤共 52 处）逐份登记理由，登记项扫不到即判名单过期。

- 33c6805: **形态轴收敛为一套词。**

  **字段类默认落 `outline`。** text-field 的 `variant` 未提供时由 connect 落成 `data-variant="outline"`
  （root 与 control 两处一致；此前不发属性，由皮肤基础规则按缺省档绘制）。Field Chrome 家族的基础规则已是
  描边式（canvas 底 + `--xh-border-control` 描边 + 无影），显式落值后皮肤不再依赖缺省档，外观不变；
  自定义皮肤若以"无 `data-variant`"判定默认态需改为读取 `outline`。

  **number-field 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，
  皮肤基础规则按缺省档绘制）。默认外观从「透明描边 + raised 落影」改为「`--xh-bg-canvas` 底 +
  `--xh-border-control` 描边」；皮肤未改，outline 档仍保留 raised 落影，与 Field Chrome 家族的无影对齐留给
  后续配方矩阵。自定义皮肤若以「无 `data-variant`」判定默认态需改为读取 `outline`。

  **color-field 默认落 `outline`。** `variant` 未提供时 root 与 control 都落 `data-variant="outline"`（此前
  不发属性，由 Field Chrome 家族基础规则按缺省档绘制）。家族基础规则与 outline 逐值相同，外观不变；
  自定义皮肤若以「无 `data-variant`」判定默认态需改为读取 `outline`。

  **password-input 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，
  由皮肤基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
  `--xh-border-control` 描边，raised 落影两处都保留），外观不变；自定义皮肤若以「无 `data-variant`」
  判定默认态需改为读取 `outline`。

  **pin-input 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
  基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
  `--xh-border-control` 描边，raised 落影保留），外观不变；自定义皮肤若以「无 `data-variant`」判定默认态
  需改为读取 `outline`。

  **date-field 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
  基础规则按缺省档绘制）。基础规则的常态描边是透明、悬停才浮出 `--xh-border-default`；outline 档把常态
  描边换成 `--xh-border-control`、悬停换成 `--xh-border-control-hover`，底色仍是 `--xh-bg-canvas`，raised
  落影保留。默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；自定义皮肤若以「无 `data-variant`」
  判定默认态需改为读取 `outline`。

  **time-field 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
  基础规则按缺省档绘制）。基础规则的常态描边是透明、悬停才浮出 `--xh-border-default`；outline 档把常态
  描边换成 `--xh-border-control`、悬停换成 `--xh-border-control-hover`、悬停底换成 `--xh-bg-subtle`，
  底色仍是 `--xh-bg-canvas`，raised 落影保留。默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；
  自定义皮肤若以「无 `data-variant`」判定默认态需改为读取 `outline`。

  **editable 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
  基础规则按缺省档绘制）。editable 的基础规则本就是 `--xh-bg-canvas` 底 + `--xh-border-control` 描边 +
  raised 落影，与 outline 档逐值相同，默认外观不变；自定义皮肤若以「无 `data-variant`」判定默认态需改为
  读取 `outline`。

  **tags-input 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
  基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 + `--xh-border-control`
  描边，raised 落影保留），外观不变；内嵌标签仍按 `tagVariantForControl(outline)` 落 subtle，与此前一致。
  自定义皮肤若以「无 `data-variant`」判定默认态需改为读取 `outline`。

  **prompt-input 默认落 `outline`。** `variant` 未提供时 root 落 `data-variant="outline"`（此前不发属性，由皮肤
  基础规则按 M1 柔和实体面绘制）。默认外观从「`--xh-material-soft-bg` 底 + `--xh-material-soft-border`
  描边 + 顶光与背景模糊」改为「`--xh-bg-canvas` 底 + `--xh-border-control` 描边，关掉顶光与背景模糊」，
  `--xh-material-soft-shadow` 落影保留；皮肤未改，去掉 soft 材质本身留给后续配方矩阵。自定义皮肤若以
  「无 `data-variant`」判定默认态需改为读取 `outline`。

  **select 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前不发
  属性，由皮肤基础规则按缺省档绘制）。默认外观从「`--xh-bg-canvas` 底 + 透明描边 + raised 落影」改为
  「`--xh-bg-canvas` 底 + `--xh-border-control` 描边 + 无影」；皮肤未改，由既有 outline 规则承担。内嵌标签
  仍按 `tagVariantForControl(outline)` 落 subtle，与此前一致。自定义皮肤若以「无 `data-variant`」判定默认态
  需改为读取 `outline`。

  **combobox 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前不发
  属性，由皮肤基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
  `--xh-border-control` 描边，raised 落影保留），外观不变；自定义皮肤若以「无 `data-variant`」判定默认态需
  改为读取 `outline`。

  **cascader 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前不发
  属性，由皮肤基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
  `--xh-border-control` 描边，raised 落影保留），外观不变；自定义皮肤若以「无 `data-variant`」判定默认态需
  改为读取 `outline`。

  **tree-select 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前不发
  属性，由皮肤基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
  `--xh-border-control` 描边，raised 落影保留），外观不变；自定义皮肤若以「无 `data-variant`」判定默认态需
  改为读取 `outline`。

  **mention 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前不发
  属性，由皮肤基础规则按缺省档绘制）。基础规则与 outline 档逐值相同（`--xh-bg-canvas` 底 +
  `--xh-border-control` 描边，raised 落影保留），外观不变；自定义皮肤若以「无 `data-variant`」判定默认态需
  改为读取 `outline`。

  **date-picker 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前
  不发属性，由皮肤基础规则按缺省档绘制）。基础规则的输入行常态描边是透明；outline 档把常态描边换成
  `--xh-border-control`、悬停换成 `--xh-border-control-hover`，底色仍是 `--xh-bg-canvas`，raised 落影保留。
  默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；自定义皮肤若以「无 `data-variant`」判定默认态需
  改为读取 `outline`。

  **date-range-picker 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前
  不发属性，由皮肤基础规则按缺省档绘制）。基础规则的输入行常态描边是透明；outline 档把常态描边换成
  `--xh-border-control`、悬停换成 `--xh-border-control-hover`、悬停底换成 `--xh-bg-subtle`，底色仍是
  `--xh-bg-canvas`，raised 落影保留。默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；自定义皮肤若以
  「无 `data-variant`」判定默认态需改为读取 `outline`。

  **time-picker 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`（此前
  不发属性，由皮肤基础规则按缺省档绘制）。基础规则的输入行常态描边是透明；outline 档把常态描边换成
  `--xh-border-control`、悬停换成 `--xh-border-control-hover`、悬停底换成 `--xh-bg-subtle`，底色仍是
  `--xh-bg-canvas`，raised 落影保留。默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；自定义皮肤若以
  「无 `data-variant`」判定默认态需改为读取 `outline`。

  **time-range-picker 默认落 `outline`。** `variant` 未提供时 root 与 positioner 都落 `data-variant="outline"`
  （此前不发属性，由皮肤基础规则按缺省档绘制）。基础规则的输入行常态描边是透明；outline 档把常态描边换成
  `--xh-border-control`、悬停换成 `--xh-border-control-hover`、悬停底换成 `--xh-bg-subtle`，底色仍是
  `--xh-bg-canvas`，raised 落影保留。默认外观因此从「透明描边 + 轻影」变为「描边式 + 轻影」；自定义皮肤若以
  「无 `data-variant`」判定默认态需改为读取 `outline`。

  **input-group 改用 `outline` / `subtle` / `ghost`。** `primary` → `outline`、`secondary` → `subtle`，新增
  `ghost`（静息不画底、描边与落影，悬停与聚焦沿用现有规则浮出）；`variant` 未提供时 root 落
  `data-variant="outline"`（此前不发属性，皮肤基础规则按缺省档绘制，与 outline 逐值相同，外观不变）。
  `InputGroupVariant` 类型删除，改用 `ControlVariant`，与组内字段同一套词。皮肤只把 `secondary` 选择器映射到
  `subtle`，outline 基础规则仍是 `--xh-border-subtle` 假边 + raised 落影，回归 `--xh-border-control` 留给后续
  Field Chrome 配方矩阵。

  **card 改用 `outline` / `subtle` / `ghost`。** `default` → `outline`、`secondary` → `subtle`、`tertiary` → `ghost`、
  `transparent` → `ghost`；`variant` 未提供时 root 落 `data-variant="outline"`（此前落 `default`，皮肤基础规则即
  该档，默认外观不变）。`CardVariant` 类型删除，三端改用 `ControlVariant`。皮肤只把 `secondary` / `transparent`
  选择器映射到 `subtle` / `ghost`，规则体不动；`tertiary` 的 `--xh-bg-subtle-hover` 底色档退役，原 tertiary 作者
  迁到 `ghost` 后卡面不再画底与影。本节覆盖未发布 changeset `card-semantic-surfaces.md` 里的四值旧词。

  **tree 改用 `outline` / `subtle` / `ghost`。** `surface` → `outline`、`plain` → `ghost`；`variant` 未提供时 root 落
  `data-variant="outline"`（此前落 `surface`，皮肤基础规则即该档，默认外观不变）。`TreeVariant` 类型删除，三端改用
  `ControlVariant`。皮肤只把 `plain` 选择器映射到 `ghost`，规则体不动；`subtle` 为新增最小规则（描边透明 +
  `--xh-bg-subtle` 底），此前没有对应外观。

  **json-viewer 改用 `outline` / `subtle` / `ghost`。** `surface` → `outline`、`plain` → `ghost`；`variant` 未提供时 root 落
  `data-variant="outline"`（此前落 `surface`，皮肤基础规则即该档，默认外观不变）。`JsonViewerVariant` 类型删除，三端改用
  `ControlVariant`。皮肤只把 `plain` 选择器映射到 `ghost`，规则体不动；`subtle` 为新增最小规则（描边透明 +
  `--xh-bg-subtle` 底），此前没有对应外观。

  **toolbar 改用 `outline` / `subtle` / `ghost`。** `plain` → `ghost`、`surface` → `outline`；`variant` 未提供时 root 落
  `data-variant="ghost"`（此前不发属性，皮肤基础规则即该档，默认外观不变）。`ToolbarVariant` 类型删除，三端改用
  `ControlVariant`。皮肤只把 `plain` / `surface` 选择器映射到 `ghost` / `outline`，规则体不动：outline 本阶段仍是
  `--xh-bg-surface` 底 + raised 落影、无描边，补 `--xh-border-default` 留给后续配方矩阵；`subtle` 为新增最小规则
  （带内距 + `--xh-bg-subtle` 底，无描边无影），此前没有对应外观。

  **accordion 改用 `outline` / `subtle` / `ghost`。** `plain` → `ghost`、`surface` → `outline`、`bordered` → `outline`；
  `variant` 未提供时 root 落 `data-variant="ghost"`（此前不发属性，皮肤基础规则即该档，默认外观不变）。
  `AccordionVariant` 类型删除，三端改用 `ControlVariant`。皮肤把 `surface` 选择器映射到 `outline`，规则体不动；
  `bordered` 的逐条外框形态退役（其 `gap` 与条目 `border` / `border-radius` 规则删除，公开覆盖槽
  `--xh-accordion-item-gap` 随之退役），原 bordered 作者迁到 `outline` 后得到单一连续表面；`subtle` 为新增最小规则
  （同 outline 的连续表面，底换成 `--xh-bg-subtle`），此前没有对应外观。

  **list 的 `bordered` 并入形态轴。** `bordered` → `variant="outline"`；新增 `variant` 轴，取值 `outline` / `subtle` /
  `ghost`，未提供时 root 落 `data-variant="ghost"`（此前不发属性，皮肤基础规则即该档，默认外观不变）。DOM 属性
  `data-bordered` 不再由 list 发出；三端的 `bordered` prop / attribute 删除。皮肤把 `[data-bordered]` 选择器映射到
  `[data-variant='outline']`，规则体不动；`subtle` 为新增最小规则（不画描边，surface 圆角 + `--xh-bg-subtle` 底），
  此前没有对应外观。示例 `list/03-bordered-hoverable` 改名 `list/03-outline-hoverable`。

  **descriptions 的 `bordered` 并入形态轴。** `bordered` → `variant="outline"`；新增 `variant` 轴，取值 `outline` /
  `subtle` / `ghost`，未提供时 root 落 `data-variant="ghost"`（此前不发属性，皮肤基础规则即该档，默认外观不变）。DOM
  属性 `data-bordered` 不再由 descriptions 发出；三端的 `bordered` prop / attribute 删除。皮肤把 `[data-bordered]`
  选择器（含逐档网格线共 17 处）映射到 `[data-variant='outline']`，规则体不动；`subtle` 为新增最小规则（不画描边也不补
  网格线，surface 圆角 + `--xh-bg-subtle` 底），此前没有对应外观。示例 `descriptions/04-bordered` 改名
  `descriptions/04-outline`。

  **table 的 `borderless` 并入形态轴。** `borderless` → `variant="ghost"`；新增 `variant` 轴，取值 `outline` /
  `subtle` / `ghost`，未提供时 root 落 `data-variant="outline"`（此前由 `borderless` 取反发 `data-bordered`，皮肤
  外框规则即该档，默认外观不变）。DOM 属性 `data-bordered` 不再由 table 发出；三端的 `borderless` prop /
  attribute 删除。皮肤把 `[data-bordered]` 选择器映射到 `[data-variant='outline']`，规则体不动；`subtle` 为新增
  最小规则（不画描边，surface 圆角 + `--xh-bg-subtle` 底），此前没有对应外观。

  **page-header 改用 `outline` / `subtle` / `ghost`，`bordered` 改名 `split`。** `plain` → `ghost`、`surface` →
  `outline`、`raised` → `outline`；`variant` 未提供时 root 落 `data-variant="ghost"`（此前不发属性，皮肤基础规则
  即该档，默认外观不变）。`PageHeaderVariant` 类型删除，三端改用 `ControlVariant`。`bordered` 改名 `split`：
  它画的是页头与下方内容之间的分隔线而非有框/无框，DOM 属性 `data-bordered` 改 `data-split`，且只在 `ghost` 上
  画；有面的两档由描边承担边界。皮肤把 `surface` 映射到 `outline` 并合并原 `raised` 的整圈描边，outline 因此恒带
  `--xh-border-subtle` 描边（原 surface 不写 bordered 时无描边）；`raised` 的抬起投影退役，公开覆盖槽
  `--xh-page-header-shadow` 随之删除；`subtle` 为新增最小规则（描边透明 + `--xh-bg-subtle` 底 + 无影），此前没有
  对应外观。示例 `page-header/02-bordered-footer` 改名 `page-header/02-split-footer`。

  **layout 的 `bordered` 改名 `split`。** 它画的是头部、侧栏、脚部与内容之间的分隔线而非有框/无框（layout 根本身
  无壳），与 `data-split` 既有语义一致，因此不加 `variant` 轴；三端的 `bordered` prop / attribute 改名 `split`，DOM
  属性 `data-bordered` 改 `data-split`，皮肤只把 `[data-bordered]` 选择器映射到 `[data-split]`，规则体不动，外观不变。
  至此库内不再有任何组件发出 `data-bordered`，该属性名进入退役清单。

  **tabs 默认变体改为 `line`。** `variant` 未提供时 root 落 `data-variant="line"`（此前不发属性，皮肤基础规则按
  segment 绘制）。默认外观从「浅色标签带 + 浮起选中面」改为「透明标签带 + 底部指示条 + 品牌字色」；原默认外观写
  `variant="segment"` 取得。皮肤基础规则改为 line 取值（Web Components 升级前无 `data-variant` 的一帧与默认一致），
  `segment` 与 `card` 块补齐原来靠基础规则继承的私有槽（触发器描边、选中描边、选中字色），显式写这两档的外观逐值不变。
  指示条不再对「无 `data-variant`」的根隐藏，只对 `segment` / `card` 隐藏。示例 `tabs/03-variant` 改为展示 segment。

  **text-field 清空钮改走 field-inset ghost 档，标签字号不随档。** connect 在 clear-trigger 上补投影
  `data-xh-action-variant="ghost"`；皮肤删除自写的 `--xh-action-bg-rest/-hover/-pressed` 取值（原悬停
  `--xh-bg-subtle-hover`、按下 `--xh-bg-subtle-active` 属淡底承载阶梯），改由家族 ghost 档给：字段底是 canvas，
  清空钮悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）；使用者槽 `--xh-text-field-action-bg`
  /`-bg-hover`/`-bg-active` 保留为覆盖入口，缺省指向家族档值。label 的私有 `--xh-_text-field-label-font-size` 删除，
  `--xh-text-field-label-font-size` 缺省改为 `--xh-text-label-size`：sm 档标签由 13px 升为 14px、lg 档由 16px 降为
  14px，md 不变。control 上补映射 `--xh-field-glyph-size`，`--xh-text-field-icon-size` 使用者槽在视觉盒内重新生效
  （此前被家族 chrome 的 `--xh-icon-size` 覆盖）；清空钮内字形改按 field-inset 档取 `--xh-_action-profile-glyph-size`。

  **color-field 清空钮改走 field-inset ghost 档，标签字号不随档。** connect 在 clear-trigger 上补投影
  `data-xh-action-variant="ghost"`；皮肤不再自写 200/300 的淡底阶梯，清空钮悬停 `--xh-bg-subtle`（100）、按下
  `--xh-bg-subtle-hover`（200），使用者槽 `--xh-color-field-action-bg`/`-bg-hover`/`-bg-active` 保留为覆盖入口。
  label 的私有 `--xh-_color-field-label-font-size` 删除，`--xh-color-field-label-font-size` 缺省改为
  `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。control 补映射 `--xh-field-glyph-size`，
  `--xh-color-field-icon-size` 在视觉盒内重新生效；清空钮内字形按 field-inset 档取 `--xh-_action-profile-glyph-size`。

  **number-field 接入 Field Chrome 与 Action Control，默认去 raised 落影，加减钮改为 field-inset 正方盒。**
  connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省
  `outline`），input 上投影 `data-xh-field-input` / `data-xh-field-layout="single-line"` / `data-readonly`，
  prefix / suffix 投影 `data-xh-field-affix`，increment / decrement 投影 `data-xh-action-control` +
  `field-inset` + `ghost` + `always` + size。皮肤删除 control 自画盒与五态、input / affix 自写重置、三档
  variant 块与 `--xh-_number-field-*` 形态私有槽，改为向家族桥接槽映射。默认外观变化：outline 档不再带
  `--xh-elevation-raised` 落影（字段家族不消费 raised）；focus 与 invalid 时底色保持 canvas（原聚焦换
  `--xh-bg-subtle` 底）；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`；加减钮由「占满控件高度、
  圆角 0、悬停透明、按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 / md 32 / lg 36px，
  compact 依令牌）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，
  粗指针下不再放大真实按钮盒与控件最小高度，改由家族伪元素外扩 44px 命中区，control 不再 `overflow: hidden`；
  输入与动作组之间的半高分隔线改画在减钮的 `background-image` 上（`::after` 让给粗指针热区），RTL 由
  `[dir='rtl']` 换边，forced-colors 用 `ButtonText` 重画。label 的 `--xh-number-field-label-font-size` 缺省改为
  `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。公开覆盖槽退役：`--xh-number-field-touch-target-size`
  （家族热区不读组件槽）、`--xh-number-field-control-bg-focus`、`--xh-number-field-control-bg-invalid`（家族聚焦与
  无效态不换底）；新增 `--xh-number-field-control-fg`、`--xh-number-field-trigger-radius`；
  `--xh-number-field-trigger-bg-active` 改指向家族按压桥接槽，`--xh-number-field-trigger-divider-h` 改按钮高的
  百分比解析（缺省仍 50%）。

  **password-input 接入 Field Chrome 与 Action Control，默认去 raised 落影，无 control 结构不再画盒。**
  connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省
  `outline`），input 上投影 `data-xh-field-input` / `data-xh-field-layout="single-line"` / `data-readonly`，
  visibility-trigger 投影 `data-xh-action-control` + `field-inset` + `ghost` + `always` + size。皮肤删除 control
  自画盒与五态、独立 input 自画盒与五态、四条 autofill、三档 variant 块、tone 语气块与 `--xh-_password-input-*`
  形态私有槽，改为向家族桥接槽映射。默认外观变化：outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律
  `--xh-border-control-focus`，不再随 `tone`（subtle / ghost 的语气淡底改由家族 `--xh-_tone-subtle` 链给）；不写
  `control` 时输入框与按钮是独立元素，不再绘制描边、底与落影的外壳；自动填充由家族用 `--xh-bg-canvas` 实体底
  与 `--xh-fg-default` 前景重绘，不再按形态 / 只读 / 禁用派生；切换钮由「`--xh-control-action-size` 方盒、control
  圆角、悬停 `--xh-bg-subtle-hover`（200）、按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 /
  md 32 / lg 36px，compact 依令牌）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+
  0.97 按压，粗指针命中区由家族伪元素外扩 44px；切换钮占 Tab 位，control 内仍保留自己的焦点环以区分两个停靠点。
  输入与切换钮之间的半高分隔线改画在切换钮的 `background-image` 上（`::after` 让给粗指针热区），贴在靠输入的
  那一侧、长度按钮高的 50% 解析，RTL 由 `[dir='rtl']` 换边，forced-colors 用 `CanvasText` / `GrayText` 重画。
  label 的 `--xh-password-input-label-font-size` 缺省改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。
  公开覆盖槽退役（独立 input 不再画盒）：`--xh-password-input-input-bg`、`-input-bg-disabled`、`-input-bg-hover`、
  `-input-bg-readonly`、`-input-border`、`-input-border-focus`、`-input-border-hover`、`-input-border-invalid`、
  `-input-h`、`-input-min-w`、`-input-px`、`-input-radius`、`-input-shadow`；新增 `--xh-password-input-control-fg`。

  **pin-input 每格接入 Field Chrome，默认去 raised 落影，焦点边不随 tone。** connect 在每一格 input 上投影
  `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；格子自身就是视觉盒，
  不投影 `data-xh-field-input`（否则家族会重置格子的边框）。皮肤删除格子自画的描边、底、圆角、落影、悬停与
  invalid / readonly / disabled 面、三档 variant 块与 `--xh-_pin-input-box-*` 形态私有槽，改为向家族桥接槽映射
  （`--xh-pin-input-box-*` 使用者槽全部保留）；自动填充仍由皮肤自写（家族规则命不中），但不再叠加落影。默认
  外观变化：outline 档格子不再带 `--xh-elevation-raised` 落影；当前格与聚焦格的描边一律
  `--xh-border-control-focus`，不再随 `tone`（subtle / ghost 的语气淡底改由家族 `--xh-_tone-subtle` 链给）；
  填满态品牌描边不变。label 的 `--xh-pin-input-label-font-size` 缺省改为 `--xh-text-label-size`（sm 13px → 14px、
  lg 16px → 14px）。

  **date-field 接入 Field Chrome 与 Action Control，默认去 raised 落影，清空钮改走 field-inset ghost 档，段位前景改
  淡底前景。** connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、
  缺省 `outline`）；段位是 div 而非原生输入，不投影 `data-xh-field-input`；clear-trigger 投影 `data-xh-action-control` +
  `field-inset` + `ghost` + `has-value` + size 与 `data-xh-action-has-value`。皮肤删除 control 自画盒与悬停 / 聚焦 /
  invalid / readonly / disabled 五态、三档 variant 块与 `--xh-_date-field-control-*` 形态私有槽，改为向家族桥接槽映射
  （`--xh-date-field-control-*` 使用者槽全部保留，`--xh-date-field-control-shadow` 缺省改为 `none`）。默认外观变化：
  outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`（subtle / ghost
  的语气淡底改由家族 `--xh-_tone-subtle` 链给）；disabled 描边由家族落 `--xh-border-default`；盒上的指针改为
  `default`（段位靠键盘编辑，不是文本光标）。清空钮由「`--xh-control-action-size` 方盒、control 圆角、悬停
  `--xh-bg-subtle-hover`（200）、按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 / md 32 /
  lg 36px，compact 依令牌）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，
  粗指针命中区由家族伪元素外扩 44px；使用者槽 `--xh-date-field-action-bg`/`-bg-hover`/`-bg-active`/`-action-radius`
  保留为覆盖入口，`--xh-date-field-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。当前段反白的
  前景由 `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`（淡底前景一律 on-brand-subtle）。label 的私有
  `--xh-_date-field-label-font-size` 删除，`--xh-date-field-label-font-size` 缺省改为 `--xh-text-label-size`
  （sm 13px → 14px、lg 16px → 14px）。

  **time-field 接入 Field Chrome 与 Action Control，默认去 raised 落影，清空钮改走 field-inset ghost 档，段位前景改
  淡底前景。** connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、
  缺省 `outline`）；段位是 div 而非原生输入，不投影 `data-xh-field-input`；clear-trigger 投影 `data-xh-action-control` +
  `field-inset` + `ghost` + `has-value` + size 与 `data-xh-action-has-value`。皮肤删除 control 自画盒与悬停 / 聚焦 /
  invalid / readonly / disabled 五态、三档 variant 块与 `--xh-_time-field-control-*` 形态私有槽，改为向家族桥接槽映射
  （`--xh-time-field-control-*` 使用者槽全部保留，`--xh-time-field-control-shadow` 缺省改为 `none`）。默认外观变化：
  outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`（subtle / ghost
  的语气淡底改由家族 `--xh-_tone-subtle` 链给）；disabled 描边由家族落 `--xh-border-default`；盒上的指针改为
  `default`。段位悬停底由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载阶梯）；当前段反白的前景由
  `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`。清空钮由「`--xh-control-action-size` 方盒、control 圆角、悬停
  `--xh-bg-subtle-hover`（200）、按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 / md 32 /
  lg 36px，compact 依令牌）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，
  粗指针命中区由家族伪元素外扩 44px；使用者槽 `--xh-time-field-action-bg`/`-bg-hover`/`-bg-active`/`-action-radius`
  保留为覆盖入口，`--xh-time-field-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。label 的私有
  `--xh-_time-field-label-font-size` 删除，`--xh-time-field-label-font-size` 缺省改为 `--xh-text-label-size`
  （sm 13px → 14px、lg 16px → 14px）。

  **editable 接入 Field Chrome 与 Action Control，默认去 raised 落影，三颗动作钮改为 field-inset 正方盒。** connect
  在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）与
  `data-readonly`，input 上投影 `data-xh-field-input` / `data-xh-field-layout="single-line"` / `data-readonly`，
  edit / submit / cancel 三颗钮投影 `data-xh-action-control` + `field-inset` + `ghost` + `always` + size。皮肤删除
  control 自画盒与悬停 / 聚焦 / invalid / readonly / disabled 五态、input 自写重置 / 五态 / 两条 autofill、三档
  variant 块与 `--xh-_editable-control-*` 形态私有槽，改为向家族桥接槽映射。默认外观变化：outline 档不再带
  `--xh-elevation-raised` 落影；聚焦与 invalid 不再换底（此前聚焦底 `--xh-bg-subtle`）；焦点描边一律
  `--xh-border-control-focus`，不再随 `tone`；disabled 描边由 `--xh-border-subtle` 改为家族的 `--xh-border-default`；
  control 不再 `overflow: hidden`（家族粗指针热区伪元素会被它裁掉）。三颗钮由「占满控件高度、圆角 0、悬停透明、
  按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 / md 32 / lg 36px，compact 依令牌）、inset
  圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，粗指针下不再放大真实按钮盒与
  控件最小高度，改由家族伪元素外扩 44px 命中区；动作组与内容段之间的半高分隔线改画在编辑钮 / 确认钮的
  `background-image` 上（`::after` 让给粗指针热区），RTL 由 `[dir='rtl']` 换边，forced-colors 用 `ButtonText` 重画。
  label 的私有 `--xh-_editable-label-font-size` 删除，`--xh-editable-label-font-size` 缺省改为 `--xh-text-label-size`
  （sm 13px → 14px、lg 16px → 14px）。公开覆盖槽退役：`--xh-editable-touch-target-size`（家族热区不读组件槽）、
  `--xh-editable-control-bg-focus`、`--xh-editable-control-bg-invalid`（家族聚焦与无效态不换底）、`--xh-editable-input-h`
  （盒内 input 由家族撑满控件高度）；新增 `--xh-editable-control-fg`、`--xh-editable-control-px`（缺省 0）、
  `--xh-editable-trigger-radius`；`--xh-editable-trigger-bg` / `-bg-hover` / `-bg-active` / `-bg-disabled` 改指向家族
  ghost 档桥接槽。

  **tags-input 接入 Field Chrome 与 Action Control，默认去 raised 落影，清空钮改走 field-inset ghost 档，键盘走到的
  标签改为当前项淡底。** connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` /
  `data-xh-field-layout="multi-tag"` / `data-variant`（与 root 同源、缺省 `outline`），input 上投影
  `data-xh-field-input`（布局落在 control 上，不重复投影），clear-trigger 投影 `data-xh-action-control` +
  `field-inset` + `ghost` + `has-value` + size 与 `data-xh-action-has-value`。皮肤删除 control 自画盒与悬停 / 聚焦 /
  invalid / readonly / disabled 五态、input 自写重置 / 两条 autofill、三档 variant 块与 `--xh-_tags-input-control-*`
  形态私有槽，改为向家族桥接槽映射（`--xh-tags-input-control-*` 使用者槽保留，`--xh-tags-input-control-shadow`
  缺省改为 `none`）。默认外观变化：outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律
  `--xh-border-control-focus`，不再随 `tone`（subtle / ghost 的语气淡底改由家族 `--xh-_tone-subtle` 链给）；disabled
  描边由家族落 `--xh-border-default`；纵向内衬由 `--xh-space-0_5` 改为家族 multi-tag 布局的 `--xh-space-1`，
  **公开覆盖槽 `--xh-tags-input-control-py` 退役**（纵向内衬由家族布局给，不再读组件槽）；新增
  `--xh-tags-input-input-fg`。键盘走到的标签（`data-highlighted`）由品牌实心 `--xh-bg-brand` + `--xh-fg-on-brand`
  改为当前项淡底 `--xh-bg-brand-subtle` + `--xh-fg-on-brand-subtle`（写了 `tone` 时取 `--xh-_tone-subtle` /
  `--xh-_tone-fg`），删除钮字色随之换成淡底前景；就地编辑框的焦点环改直接取 `--xh-ring-focus`，invalid 时
  `--xh-ring-invalid`。清空钮由「`--xh-control-action-size` 方盒、control 圆角、悬停 `--xh-bg-subtle-hover`（200）、
  按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒（sm 24 / md 32 / lg 36px，compact 依令牌）、inset
  圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，粗指针命中区由家族伪元素外扩
  44px；`--xh-tags-input-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。label 的私有
  `--xh-_tags-input-label-font-size` 删除，`--xh-tags-input-label-font-size` 缺省改为 `--xh-text-label-size`
  （sm 13px → 14px、lg 16px → 14px）。

  **mention 输入框接入 Field Chrome，默认去 raised 落影；候选行接入 Collection Item，补上按下面。** connect 在
  input 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-xh-field-layout="single-line"` / `data-variant`
  （与 root 同源、缺省 `outline`）与 `data-readonly`；输入框自身就是视觉盒，不投影 `data-xh-field-input`。item 投影
  `data-xh-collection-item` / `data-xh-collection-size` / `data-xh-collection-context="overlay"`，item-text 投影
  `data-xh-collection-slot="text"`。皮肤删除 input 自画盒与悬停 / 聚焦 / invalid / readonly / disabled 五态、三档
  variant 块与 `--xh-_mention-input-*` 形态私有槽，改为向家族桥接槽映射（`--xh-mention-input-*` 使用者槽保留，
  `--xh-mention-input-shadow` 缺省改为 `none`）；自动填充仍由皮肤自写（家族按 input 角色给的规则命不中），不再叠
  落影。默认外观变化：outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再
  随 `tone`；disabled 描边由家族落 `--xh-border-default`。候选行删除自写的网格 / 内衬 / 圆角 / 字色 / 高亮底 / 禁用
  色，改为映射家族桥接槽：悬停与高亮 `--xh-bg-subtle`（100）不变，新增按下 `--xh-bg-subtle-hover`（200）与按压时长
  （此前零 `:active` 面）；新增 `--xh-mention-item-bg-pressed` 覆盖槽。候选面加 `overscroll-behavior: contain`；三端
  自绘条改传 `size: 'sm'`，条子厚度由 6px 改为浮层 4px 档。label 的 `--xh-mention-label-font-size` 缺省由随档的
  `--xh-_mention-font-size` 改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **combobox 接入 Field Chrome / Action Control / Collection Item，默认去 raised 落影，`data-multiline` 视觉钩子与
  `--xh-combobox-control-py` 槽退役。** connect 在 control 上投影 `data-xh-field-chrome` / `data-xh-field-size` /
  `data-variant`（与 root 同源、缺省 `outline`）；input 投影 `data-xh-field-input` 与 `data-xh-field-layout`
  （单行 `single-line`、textarea 宿主 `textarea`），旧 `data-multiline` 属性不再产出，自定义皮肤改读布局值，不提供
  双写兼容。trigger（展开钮，`display="always"`）与 clear-trigger（`display="has-value"` + `data-xh-action-has-value`）
  投影 field-inset ghost 档；item 投影 `data-xh-collection-item` / `-size` / `-context="overlay"`，item-text 与
  item-indicator 各投影 `data-xh-collection-slot`。皮肤删除 control 自画盒与悬停 / 聚焦 / invalid / readonly /
  disabled 五态、三档 variant 块与 `--xh-_combobox-control-*` 形态私有槽，改为映射家族桥接槽（`--xh-combobox-control-*`
  使用者槽保留，`--xh-combobox-control-shadow` 缺省改为 `none`）；多行宿主的 `padding-block` 由家族 textarea 布局给
  （写在 textarea 自身），`--xh-combobox-control-py` 槽删除。input 删除自写重置、占位与两条 autofill，改映射
  `--xh-field-input-*` / `--xh-field-placeholder-fg` / `--xh-field-autofill-*`，新增 `--xh-combobox-input-fg` 覆盖槽。
  默认外观变化：outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再随
  `tone`；disabled 描边由家族落 `--xh-border-default`。展开钮与清空钮由「`--xh-control-action-size` 方盒、control
  圆角、悬停 `--xh-bg-subtle-hover`（200）、按下 `--xh-bg-subtle-active`（300）」改为 field-inset 档正方盒
  （sm 24 / md 32 / lg 36px）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97
  按压，粗指针命中区由家族伪元素外扩；`--xh-combobox-action-radius` 缺省由 `--xh-shape-control` 改为
  `--xh-shape-inset`。候选行删除自写的排布 / 内衬 / 圆角 / 字色 / 高亮底 / 禁用色，改为映射家族桥接槽：悬停与高亮
  `--xh-bg-subtle`（100）不变，新增按下 `--xh-bg-subtle-hover`（200）与按压时长（此前零 `:active` 面）；新增
  `--xh-combobox-item-bg-pressed` 与 `--xh-combobox-item-check-fg` 覆盖槽（旧 `--xh-combobox-item-indicator-fg`
  留在兜底位）；对号显隐由家族按 `aria-selected` 给。候选面加 `overscroll-behavior: contain`；三端自绘条改传
  `size: 'sm'`，条子厚度由 6px 改为浮层 4px 档。label 的 `--xh-combobox-label-font-size` 缺省由随档的
  `--xh-_combobox-label-font-size` 改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **select 接入 Field Chrome 与 Action Control，默认去 raised 落影，列表接自绘条。** connect 在 control 上投影
  `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；trigger 是撑满盒的
  按钮，不投影 `data-xh-field-input`；clear-trigger 投影 field-inset ghost 档（`display="has-value"` +
  `data-xh-action-has-value`）。皮肤删除 control 自画盒与悬停 / invalid / 聚焦 / readonly / disabled 五态、三档 variant
  块与 `--xh-_select-control-*` 形态私有槽，改为映射家族桥接槽（`--xh-select-control-*` 使用者槽保留，
  `--xh-select-control-shadow` 缺省改为 `none`，盒上指针 `pointer`）。默认外观变化：不写 variant 时描边由透明改为
  `--xh-border-control`（与 outline 档逐值相同），不再带 `--xh-elevation-raised` 落影；焦点描边一律
  `--xh-border-control-focus`，不再随 `tone`；disabled 描边由家族落 `--xh-border-default`。清空钮由
  「`--xh-control-action-size` 方盒、control 圆角、悬停 `--xh-bg-subtle-hover`（200）、按下 `--xh-bg-subtle-active`
  （300）」改为 field-inset 档正方盒（sm 24 / md 32 / lg 36px）、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下
  `--xh-bg-subtle-hover`（200）+ 0.97 按压，粗指针命中区由家族伪元素外扩；`--xh-select-action-radius` 缺省由
  `--xh-shape-control` 改为 `--xh-shape-inset`。list 三端接入自绘条（壳 positioner、浮层 4px 档）并加
  `overscroll-behavior: contain`；Vue / React 的 select 上下文新增 `controlRef` / `listRef`，层分支由 `[trigger]`
  改为 `[control, positioner]`（点清空钮与按住条子都算层内交互）。label 的 `--xh-select-label-font-size` 缺省由
  随档的 `--xh-_select-label-font-size` 改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **tree-select 接入 Field Chrome / Action Control / Collection Item，默认去 raised 落影，
  `--xh-tree-select-item-selected-font-weight` 改名 `--xh-tree-select-item-font-weight-selected`。** connect 在
  control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；
  clear-trigger 投影 field-inset ghost 档（`display="has-value"` + `data-xh-action-has-value`）；叶子 item 与分支
  branch-control 都投影 `data-xh-collection-item` / `-size` / `-context="overlay"`，item-text / branch-text 投影
  `data-xh-collection-slot="text"`，item-indicator 投影 `"indicator"`，branch-trigger / branch-indicator 投影
  `"prefix"`。皮肤删除 control 自画盒与五态、三档 variant 块与 `--xh-_tree-select-border/-bg/-shadow/-ring` 形态私有
  槽，改为映射家族桥接槽（`--xh-tree-select-control-*` 使用者槽保留，`--xh-tree-select-control-shadow` 缺省改为
  `none`，盒上指针 `pointer`）。默认外观变化：outline 档不再带 `--xh-elevation-raised` 落影；焦点描边一律
  `--xh-border-control-focus`，不再随 `tone`；disabled 描边由家族落 `--xh-border-default`。清空钮由
  「`--xh-control-action-size` 方盒、control 圆角、悬停 200、按下 300」改为 field-inset 档正方盒、inset 圆角、
  悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压；`--xh-tree-select-action-radius`
  缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。树行删除自写的排布 / 高亮底 / 选中字色字重 / 禁用色，改为
  映射家族桥接槽：悬停与高亮 `--xh-bg-subtle`（100）不变，新增按下 `--xh-bg-subtle-hover`（200）与按压时长
  （此前零 `:active` 面）；叶子的层级缩进由 `padding-inline-start` 改为家族网格首列的占位伪元素（文字起点不变）；
  新增 `--xh-tree-select-item-bg-pressed` 与 `--xh-tree-select-item-check-fg` 覆盖槽（旧
  `--xh-tree-select-item-indicator-fg` 留在兜底位）；分支行的选中对号与半选横线仍按 `data-selected` /
  `data-indeterminate` 显形；懒分支取数失败（`data-error`）的行面映射回常态，不引入家族告警面，该行仍可激活
  （Enter / 点行重试），悬停与键盘高亮 100、按下 200 与键盘焦点环由皮肤在家族解算点上接回。content 加
  `overscroll-behavior: contain`；三端自绘条改传 `size: 'sm'`，条子厚度由 6px 改为浮层 4px 档。label 的
  `--xh-tree-select-label-font-size` 缺省由随档的私有槽改为 `--xh-text-label-size`（sm 13px → 14px、
  lg 16px → 14px）。

  **cascader 接入 Field Chrome / Action Control / Collection Item，默认去 raised 落影，
  `--xh-cascader-item-selected-font-weight` 改名 `--xh-cascader-item-font-weight-selected`。** connect 在 control
  上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；
  clear-trigger 投影 field-inset ghost 档（`display="has-value"` + `data-xh-action-has-value`）；列内 item 与搜索
  search-item 都投影 `data-xh-collection-item` / `-size` / `-context="overlay"`，item-text 投影
  `data-xh-collection-slot="text"`，item-indicator 投影 `"indicator"`。皮肤删除 control 自画盒与五态、三档 variant
  块与 `--xh-_cascader-border/-bg/-shadow/-ring` 形态私有槽，改为映射家族桥接槽（`--xh-cascader-control-*`
  使用者槽保留，`--xh-cascader-control-shadow` 缺省改为 `none`，盒上指针 `pointer`）。默认外观变化：outline 档
  不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`；disabled 描边由
  家族落 `--xh-border-default`。清空钮由「`--xh-control-action-size` 方盒、control 圆角、悬停 200、按下 300」改为
  field-inset 档正方盒、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97
  按压；`--xh-cascader-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。列内条目删除自写的
  排布 / 高亮底 / 展开路径底 / 选中字色字重 / 禁用色，改为映射家族桥接槽：悬停与高亮 `--xh-bg-subtle`（100）、
  展开路径 `--xh-cascader-item-bg-active` 缺省 `--xh-bg-subtle`（与悬停同档）不变，新增按下
  `--xh-bg-subtle-hover`（200）与按压时长（此前零 `:active` 面）；分支箭头落在家族网格的 suffix 列；新增
  `--xh-cascader-item-bg-pressed` 与 `--xh-cascader-item-check-fg` 覆盖槽（旧 `--xh-cascader-item-indicator-fg`
  留在兜底位）。搜索候选没有正文部件，行保持块级排版、对号仍在末端预留轨内绝对定位，状态面同走家族。
  content / column / search-list 加 `overscroll-behavior: contain`；content 横向自绘条改传 `size: 'sm'`
  （浮层 4px 档）；每一列与搜索列表各自接一路贴层（`anchor: 'layer'`）的自绘竖条，条子节点紧跟在该列 /
  列表之后、贴其行内末端，列的原生细条随之隐藏，列间分隔线改按 `column ~ column` 取后续列；content 上声明
  `--xh-scrollbar-track-bg: transparent`。label 的 `--xh-cascader-label-font-size` 缺省由随档的私有槽改为
  `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **date-picker 接入 Field Chrome / Action Control / Collection Item，浮层改 floating 材质，去 raised 落影，
  `--xh-date-picker-content-highlight` / `--xh-date-picker-content-backdrop` 槽退役。** connect 在 control 上投影
  `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；trigger（日历钮，
  `display="always"`）与 clear-trigger（`display="has-value"` + `data-xh-action-has-value`）投影 field-inset ghost 档；
  confirm-trigger 投影 Action Control `profile="text"` / `variant="solid"`（面板内唯一主要动作，固定 sm 档）；preset
  与 time-item 投影 `data-xh-collection-item` / `-size` / `-context="overlay"`。皮肤删除 control 自画盒与五态、
  三档 variant 块与 `--xh-_date-picker-control-*` 形态私有槽，改为映射家族桥接槽（`--xh-date-picker-control-*`
  使用者槽保留，`--xh-date-picker-control-shadow` 缺省改为 `none`，盒上指针 `default`）。默认外观变化：outline 档
  描边由透明改为 `--xh-border-control`，不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，
  不再随 `tone`；打开中的 control 不再另画焦点环；disabled 描边由家族落 `--xh-border-default`；段位反白前景由
  `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`。日历钮与清空钮由「`--xh-control-action-size` 方盒、control 圆角、
  悬停 200、按下 300、打开中 300」改为 field-inset 档正方盒、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下
  `--xh-bg-subtle-hover`（200）+ 0.97 按压，打开中与悬停同档；`--xh-date-picker-action-radius` 缺省由
  `--xh-shape-control` 改为 `--xh-shape-inset`。确认钮的品牌实心、悬停 / 按下 / 按压 / 焦点环改由家族 solid 档给，
  `--xh-date-picker-confirm-trigger-shadow` 缺省由内高光改为 `none`。浮层 content 由「`--xh-border-subtle` 描边 +
  frosted 落影 + 透明顶光」改为 floating 三件套：`--xh-border-default` 描边 + `--xh-bg-surface` 底 +
  `--xh-elevation-floating` 落影，顶光伪元素与 backdrop 两行删除，`--xh-date-picker-content-highlight` /
  `--xh-date-picker-content-backdrop` 槽删除。time-item 选中面由「`--xh-bg-brand-subtle` 底 + `--xh-fg-brand` 字 +
  medium 字重」改为透明底 + 末端对号、正文与字重保持 rest（§7.3 浮层瞬态集合）；preset 与 time-item 新增按下
  `--xh-bg-subtle-hover`（200）与按压时长（此前零 `:active` 面），新增 `--xh-date-picker-preset-bg-pressed` /
  `--xh-date-picker-time-item-bg-pressed` 覆盖槽。content / preset-group / time-column 加
  `overscroll-behavior: contain`；三端自绘条改传 `size: 'sm'` 并补横轴（皮肤 `overflow: auto` 两轴都滚）；preset-group
  （竖 + 横）与每一 time-column（竖）各自接一路贴层（`anchor: 'layer'`）的自绘条，条子节点紧跟在该列之后、贴其盒子，
  列的原生细条随之隐藏，content 上声明 `--xh-scrollbar-track-bg: transparent`，选项列与日历之间的空当改按
  `preset-group ~ calendar` 取。time-item 的行字色与字重改按值选择族同一套映射：新增
  `--xh-date-picker-time-item-fg`（rest 字色，缺省家族行字色 `--xh-material-frosted-fg`，各主题与 forced-colors 下
  与 `--xh-fg-default` 同值）与 `--xh-date-picker-time-item-font-weight-selected`（缺省 regular）覆盖槽。label 的
  `--xh-date-picker-label-font-size` 缺省由随档的私有槽改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **date-range-picker 接入 Field Chrome / Action Control / Collection Item，浮层改 floating 材质，去 raised 落影，
  `--xh-date-range-picker-content-highlight` / `--xh-date-range-picker-content-backdrop` 槽退役。** connect 在
  control 上投影 `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；
  trigger（日历钮，`display="always"`）与 clear-trigger（`display="has-value"` + `data-xh-action-has-value`）投影
  field-inset ghost 档；preset 投影 `data-xh-collection-item` / `-size` / `-context="overlay"`。皮肤删除 control
  自画盒与五态、三档 variant 块与 `--xh-_date-range-picker-control-*` 形态私有槽，改为映射家族桥接槽
  （`--xh-date-range-picker-control-*` 使用者槽保留，`--xh-date-range-picker-control-shadow` 缺省改为 `none`，盒上
  指针 `default`）。默认外观变化：outline 档描边由透明改为 `--xh-border-control`，不再带 `--xh-elevation-raised`
  落影；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`；打开中的 control 不再另画焦点环；disabled 描边由
  家族落 `--xh-border-default`；两组段位的反白前景由 `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`。日历钮与清空钮
  由「`--xh-control-action-size` 方盒、control 圆角、悬停 200、按下 300、打开中 300」改为 field-inset 档正方盒、
  inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，打开中与悬停同档；
  `--xh-date-range-picker-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。浮层 content 由
  「`--xh-border-subtle` 描边 + frosted 落影 + 透明顶光」改为 floating 三件套：`--xh-border-default` 描边 +
  `--xh-bg-surface` 底 + `--xh-elevation-floating` 落影，顶光伪元素与 backdrop 两行删除，
  `--xh-date-range-picker-content-highlight` / `--xh-date-range-picker-content-backdrop` 槽删除。preset 新增按下
  `--xh-bg-subtle-hover`（200）与按压时长（此前零 `:active` 面），新增 `--xh-date-range-picker-preset-bg-pressed`
  覆盖槽。content 与 preset-group 加 `overscroll-behavior: contain`；三端 content 自绘条改传 `size: 'sm'` 并补横轴
  （皮肤 `overflow: auto` 两轴都滚）；preset-group 接一路贴层（`anchor: 'layer'`，竖 + 横）的自绘条，条子节点紧跟
  在该列之后、贴其盒子，列的原生细条随之隐藏，content 上声明 `--xh-scrollbar-track-bg: transparent`，选项列与
  日历之间的空当改按 `preset-group ~ calendar` 取；Vue 的 `XhDateRangePickerPresetGroup` 因此以片段作根，直通属性由
  组件自己接住落到列节点。label 的 `--xh-date-range-picker-label-font-size` 缺省由随档的私有槽改为
  `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **time-picker 接入 Field Chrome / Action Control / Collection Item，浮层改 floating 材质，去 raised 落影，
  时间格选中只留对号，`--xh-time-picker-content-highlight` / `-backdrop` 与 `--xh-time-picker-item-bg-checked` /
  `-bg-checked-hover` / `-fg-checked` / `-weight-checked` 槽退役。** connect 在 control 上投影 `data-xh-field-chrome`
  / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；trigger（展开钮，`display="always"`）与
  clear-trigger（`display="has-value"` + `data-xh-action-has-value`）投影 field-inset ghost 档；preset 与 item 投影
  `data-xh-collection-item` / `-size` / `-context="overlay"`。皮肤删除 control 自画盒与五态、三档 variant 块与
  `--xh-_time-picker-control-*` 形态私有槽，改为映射家族桥接槽（`--xh-time-picker-control-*` 使用者槽保留，
  `--xh-time-picker-control-shadow` 缺省改为 `none`，盒上指针 `default`）。默认外观变化：outline 档描边由透明改为
  `--xh-border-control`，不再带 `--xh-elevation-raised` 落影；焦点描边一律 `--xh-border-control-focus`，不再随
  `tone`；打开中的 control 不再另画焦点环；disabled 描边由家族落 `--xh-border-default`；段位反白前景由
  `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`，段位悬停底由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`
  （100，canvas 承载）。展开钮与清空钮由「`--xh-control-action-size` 方盒、control 圆角、悬停 200、按下 300、打开中
  300」改为 field-inset 档正方盒、inset 圆角、悬停 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）+
  0.97 按压，打开中与悬停同档；`--xh-time-picker-action-radius` 缺省由 `--xh-shape-control` 改为 `--xh-shape-inset`。
  浮层 content 由「`--xh-border-subtle` 描边 + frosted 落影 + 透明顶光」改为 floating 三件套：`--xh-border-default`
  描边 + `--xh-bg-surface` 底 + `--xh-elevation-floating` 落影，顶光伪元素与 backdrop 两行删除，
  `--xh-time-picker-content-highlight` / `--xh-time-picker-content-backdrop` 槽删除。item 选中面由
  「`--xh-bg-brand-subtle` 底 + `--xh-fg-brand` 字 + medium 字重」改为透明底 + 末端对号、正文与字重保持 rest
  （§7.3 浮层瞬态集合）：`--xh-time-picker-item-bg-checked` / `-bg-checked-hover` / `-weight-checked` 槽删除，
  `--xh-time-picker-item-fg-checked` 改名为 `--xh-time-picker-item-fg-selected`（与值选择族同名），新增
  `--xh-time-picker-item-font-weight-selected`（缺省 regular）；item 的 rest 字色缺省由 `--xh-fg-default` 改为家族
  行字色 `--xh-material-frosted-fg`（各主题与 forced-colors 下同值）。preset 与 item 新增按下 `--xh-bg-subtle-hover`
  （200）与按压时长（此前零 `:active` 面），新增 `--xh-time-picker-preset-bg-pressed` / `--xh-time-picker-item-bg-pressed`
  覆盖槽。preset-group 与各 column 加 `overscroll-behavior: contain`，各自接一路贴层（`anchor: 'layer'`，竖）的
  自绘条：条子节点紧跟在该列之后、贴其盒子，列的原生细条随之隐藏，content 上声明
  `--xh-scrollbar-track-bg: transparent`，列与列之间的分隔线改按 `column ~ column` 取；Vue 的
  `XhTimePickerPresetGroup` / `XhTimePickerColumn` 因此以片段作根，直通属性由组件自己接住落到列节点。label 的
  `--xh-time-picker-label-font-size` 缺省由随档的私有槽改为 `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **time-range-picker 接入 Field Chrome / Action Control / Collection Item，浮层改 floating 材质，去 raised 落影，
  时间格选中只留对号，`--xh-time-range-picker-content-highlight` / `-backdrop` 与 `--xh-time-range-picker-item-bg-checked`
  / `-bg-checked-hover` / `-fg-checked` / `-weight-checked` 槽退役。** 与 time-picker 同构：connect 在 control 上投影
  `data-xh-field-chrome` / `data-xh-field-size` / `data-variant`（与 root 同源、缺省 `outline`）；trigger（展开钮，
  `display="always"`）与 clear-trigger（`display="has-value"` + `data-xh-action-has-value`）投影 field-inset ghost
  档；preset 与 item 投影 `data-xh-collection-item` / `-size` / `-context="overlay"`。皮肤删除 control 自画盒与
  五态、三档 variant 块与 `--xh-_time-range-picker-control-*` 形态私有槽，改为映射家族桥接槽
  （`--xh-time-range-picker-control-*` 使用者槽保留，`--xh-time-range-picker-control-shadow` 缺省改为 `none`，盒上
  指针 `default`）。默认外观变化：outline 档描边由透明改为 `--xh-border-control`，不再带 `--xh-elevation-raised`
  落影；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`；打开中的 control 不再另画焦点环；disabled 描边由
  家族落 `--xh-border-default`；两组段位的反白前景由 `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`，段位悬停底由
  `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100）。展开钮与清空钮由「`--xh-control-action-size` 方盒、
  control 圆角、悬停 200、按下 300、打开中 300」改为 field-inset 档正方盒、inset 圆角、悬停 `--xh-bg-subtle`（100）、
  按下 `--xh-bg-subtle-hover`（200）+ 0.97 按压，打开中与悬停同档；`--xh-time-range-picker-action-radius` 缺省由
  `--xh-shape-control` 改为 `--xh-shape-inset`。浮层 content 由「`--xh-border-subtle` 描边 + frosted 落影 + 透明
  顶光」改为 floating 三件套：`--xh-border-default` 描边 + `--xh-bg-surface` 底 + `--xh-elevation-floating` 落影，
  顶光伪元素与 backdrop 两行删除，`--xh-time-range-picker-content-highlight` / `--xh-time-range-picker-content-backdrop`
  槽删除。item 选中面由「`--xh-bg-brand-subtle` 底 + `--xh-fg-brand` 字 + medium 字重」改为透明底 + 末端对号、
  正文与字重保持 rest（§7.3 浮层瞬态集合）：`--xh-time-range-picker-item-bg-checked` / `-bg-checked-hover` /
  `-weight-checked` 槽删除，`--xh-time-range-picker-item-fg-checked` 改名为 `--xh-time-range-picker-item-fg-selected`
  （与值选择族同名），新增 `--xh-time-range-picker-item-font-weight-selected`（缺省 regular）；item 的 rest 字色缺省由
  `--xh-fg-default` 改为家族行字色 `--xh-material-frosted-fg`（各主题与 forced-colors 下同值）。preset 与 item 新增
  按下 `--xh-bg-subtle-hover`（200）与按压时长（此前零 `:active` 面），新增 `--xh-time-range-picker-preset-bg-pressed`
  / `--xh-time-range-picker-item-bg-pressed` 覆盖槽。content（横向）、preset-group 与各 column 加
  `overscroll-behavior: contain`；content 的横向自绘条三端接在浮层壳上（`size: 'sm'`，浮层壳记进层分支），
  preset-group 与各 column 各接一路贴层（`anchor: 'layer'`，竖）的自绘条：条子节点紧跟在该列之后、贴其盒子，列的
  原生细条随之隐藏，positioner 与 content 上声明 `--xh-scrollbar-track-bg: transparent`，列与列之间的分隔线改按
  `column ~ column` 取；Vue 的 `XhTimeRangePickerPresetGroup` / `XhTimeRangePickerColumn` 因此以片段作根，直通属性
  由组件自己接住落到列节点。label 的 `--xh-time-range-picker-label-font-size` 缺省由随档的私有槽改为
  `--xh-text-label-size`（sm 13px → 14px、lg 16px → 14px）。

  **input-group 组壳改为字段描边式，去 raised 落影。** 组壳（root 的 `::before` 外轮廓）静息描边由 `--xh-border-subtle`
  改为 `--xh-border-control`、悬停由 `--xh-border-default` 改为 `--xh-border-control-hover`；`--xh-input-group-shadow`
  缺省由 `--xh-elevation-raised` 改为 `none`（槽保留）。`subtle` 档悬停浮出的描边由 `--xh-border-default` 改为
  `--xh-border-control`，`ghost` 档悬停同样浮出 `--xh-border-control`（此前 ghost 悬停边取基础规则的
  `--xh-border-default`）。子字段压平规则以 `[data-xh-field-chrome]` 为键，接入家族的字段在组内自动压平为透明，
  不另画一层。

  **prompt-input 接入 Field Chrome 与 Action Control，去 soft 材质与顶光 / 背景模糊，输入段改透明。** connect 在 root
  上投影 `data-xh-field-chrome` / `data-xh-field-size`（缺省 `md`，`data-variant` 已缺省 `outline`），input 投影
  `data-xh-field-input`（刻意不投影 `data-xh-field-layout`），submit-trigger 投影 Action Control `profile="text"` /
  `display="always"` / `size`，`variant` 按 loading 在 `solid`（发送，与 Button 缺省同为品牌实心）与 `subtle`（停止，
  中性淡底）间切换，并与原生 `disabled` 同步投影 `data-disabled`。皮肤删除 root 的 soft 材质私有槽、渐变顶光、
  backdrop 两行、自写 hover / focus-within / disabled 与三档 variant 块，改为映射家族桥接槽（`--xh-prompt-input-bg`
  / `-bg-hover` / `-bg-disabled` / `-border` / `-border-hover` / `-border-focus` / `-shadow` / `-radius` / `-p` /
  `-gap` / `-icon-size` 使用者槽保留为第一参数，`--xh-prompt-input-shadow` 缺省改为 `none`，`--xh-field-control-height`
  落 `auto` 随内容长高）。默认外观变化：root 由「M1 soft 底 + soft 描边 + 顶光 + 背景模糊 + soft 落影」（outline
  档已是 canvas + border-control）改为家族描边式，全部三档不再有落影与顶光；焦点描边一律 `--xh-border-control-focus`，
  不再随 `tone`；disabled 描边由家族落 `--xh-border-default`；生成中（`data-loading`）外框仍保持默认前景与文本光标。
  textarea 由「`--xh-material-soft-focus-surface` 实体阅读底 + `--xh-material-soft-fg` 字」改为透明底 + `--xh-fg-default`
  字（`--xh-prompt-input-input-fg` / `-input-font-size` / `-placeholder-fg` / `-input-autofill-bg` / `-input-autofill-fg`
  使用者槽保留，自动填充底缺省改为 `--xh-bg-canvas`）。发送钮的品牌实心 / 悬停 / 按下 / 0.97 按压 / 焦点环 / 禁用面
  改由家族 text solid 档给（`--xh-prompt-input-send-bg*` / `-send-fg` / `-send-bg-off` / `-stop-bg*` / `-stop-fg` /
  `-submit-px` / `-submit-radius` / `-submit-shadow` / `-submit-font-size` / `-submit-font-weight` 使用者槽保留），
  停止身份的悬停 / 按下由自写 200 / 300 改为家族 subtle 档 200 / 300。

  **field 的 control 接入 Field Chrome，去 raised 落影、加描边。** connect 在 control（作者自己的原生控件）上投影
  `data-xh-field-chrome` / `data-xh-field-size="md"` / `data-variant="outline"`（Field 没有 size / variant 轴，固定投这
  两档），控件自身即视觉盒。皮肤删除 control 自写的边、底、影、圆角、outline、transition 与 hover / focus-visible /
  invalid / disabled 四条规则，改为映射家族桥接槽：`--xh-field-control-h` / `-px` / `-bg` / `-bg-hover` / `-bg-disabled`
  / `-fg` / `-border` / `-border-hover` / `-border-focus` / `-border-invalid` / `-shadow` / `-radius` / `-font-size`
  使用者槽保留，新增 `--xh-field-control-bg-readonly`（只读底，缺省 `--xh-bg-subtle`）；`--xh-field-control-ring` 槽删除
  （焦点环一律公共 `--xh-ring-focus`）。默认外观变化：静息由「透明边 + `--xh-elevation-raised` 落影」改为
  `--xh-border-control` 描边 + `--xh-bg-canvas` 底 + 无影（`--xh-field-control-shadow` 缺省改为 `none`）；悬停描边由
  `--xh-border-default` 改为 `--xh-border-control-hover`；焦点描边一律 `--xh-border-control-focus`，不再随 `tone`；
  只读换 `--xh-bg-subtle` 底；禁用由家族落 `--xh-border-default` 描边 + `--xh-bg-subtle` 底 + `--xh-fg-disabled`。
  Vue / React 的 `XhFieldControl` 把属性合并到自带解剖的子节点（库内薄封装或写了 `data-scope` 的元素）时，与
  `data-scope` / `data-part` 一并剔除家族标记（`data-xh-*`）与 `data-variant`，封装根上不会再套一层字段外壳、作者在
  封装上写的形态也不被盖掉；`useFieldControl` 同样只交出接线属性。Web Components 的 `<xh-field>` 把 control 属性直接
  打在作者标出的节点上：`control` 应标在真控件（`<input>` / `<textarea>` / `<select>`）上，标在包裹层上会在真控件外
  多出一层外壳。

  **form 的提交 / 重置钮接入 Action Control，错误摘要去 raised 落影。** connect 在 submit-trigger 上投影
  `data-xh-action-control` / `profile="text"` / `variant="solid"`（表单提交是主要动作，与 Button 缺省同为品牌实心）/
  `display="always"` / `size="md"`，reset-trigger 同样投影但 `variant="outline"`（非 Button 的触发器缺省中性描边）。
  皮肤删除两颗钮自写的盒、底、边、字体、transition、hover / active / 缩放 / disabled 与提交钮的品牌底 / 高光规则，
  改为映射家族桥接槽（`--xh-form-trigger-h` / `-px` / `-radius` / `-font-size` / `-bg` / `-bg-hover` / `-bg-active` /
  `-bg-disabled` / `-fg` / `-border` / `-border-hover` / `-border-disabled` 与 `--xh-form-submit-bg` / `-bg-hover` /
  `-bg-active` / `-fg` / `-border` / `-border-hover` / `-border-active` / `-shadow` 使用者槽保留为第一参数）。默认外观
  变化：重置钮由「`--xh-bg-subtle` 淡底 + `--xh-border-control` 描边、悬停 200 / 按下 300」改为透明底 +
  `--xh-border-control` 描边、悬停 `--xh-bg-subtle`（100）/ 按下 `--xh-bg-subtle-hover`（200）；提交钮的品牌实心、
  悬停 / 按下、0.97 按压、currentColor 焦点环与顶边内高光改由家族给，禁用面由家族落 `--xh-bg-subtle` 底 +
  `--xh-fg-disabled`（`--xh-form-trigger-bg-disabled` / `-border-disabled` 仍可覆盖）；error-summary 的
  `--xh-form-summary-shadow` 缺省由 `--xh-elevation-raised` 改为 `none`（静态反馈面只靠描边分层）。

  **fieldset 的组标题归集合标题角色。** legend 的 `--xh-fieldset-legend-fg` 缺省由 `--xh-fg-default` 改为
  `--xh-fg-muted`（§6.4 集合标题：`--xh-fg-muted`，与组 `--xh-space-2`，字号字重同字段标签）；无效 / 禁用 /
  必填星、说明与错误文案不变。

  **field-array 的四颗把手接入 Action Control，阶梯改 100 / 200。** connect 在 item-delete-trigger /
  move-up-trigger / move-down-trigger 上投影 `data-xh-action-control` / `profile="icon"` / `variant="ghost"` /
  `display="always"` / `size="xs"`（24px 正方盒，与此前 `--xh-control-action-size` 同尺寸），add-trigger 投影
  `profile="text"` / `variant="outline"` / `display="always"` / `size="md"`。皮肤删除四颗钮自写的盒、底、边、字体、
  transition、hover / active / 缩放 / `[aria-disabled]` 规则，改为映射家族桥接槽（`--xh-field-array-trigger-size` /
  `-radius` / `-bg` / `-bg-hover` / `-bg-active` / `-fg` / `-fg-hover` / `-font-size`、`--xh-field-array-item-delete-fg-hover`、
  `--xh-field-array-add-height` / `-px` / `-radius` / `-bg` / `-bg-hover` / `-bg-active` / `-fg` / `-border` /
  `-border-hover` / `-border-disabled` / `-font-size`、`--xh-field-array-action-gap` 使用者槽保留为第一参数）；
  add-trigger 保留 `border-style: dashed`。默认外观变化：三颗行内把手与新增钮的悬停由 `--xh-bg-subtle-hover`（200）
  改为 `--xh-bg-subtle`（100）、按下由 `--xh-bg-subtle-active`（300）改为 `--xh-bg-subtle-hover`（200）（白底承载
  阶梯）；`--xh-field-array-icon-size` 由 root 上的 `--xh-glyph-size-text`（随文 1em）改为各钮按档取
  `--xh-_action-profile-glyph-size`（行内把手 16px、新增钮 20px），只在四颗钮上生效；粗指针下四颗钮由家族
  外扩 44px 热区；禁用面由家族按 `data-disabled` 给（透明底 + `--xh-fg-disabled`，新增钮描边 `--xh-border-subtle`）。

  **card 的 outline 卡面补 `--xh-border-default` 描边，subtle 去落影，标题与说明按 Surface 排版档。**
  `--xh-card-border` 缺省由 `transparent` 改为 `--xh-border-default`（Card 是唯一登记 raised 的静态面，raised
  必带描边，边界由描边承担、落影只是抬起的加成）；subtle 档改为 `--xh-bg-subtle` 淡底 + 透明占位边 + 无影
  （`--xh-card-shadow` 在 subtle 与 ghost 两档的缺省都是 `none`），ghost 档补透明占位边，三档几何一致。
  `--xh-card-title-font-weight` 缺省由 `--xh-font-weight-medium` 改为 `--xh-font-weight-semibold`（Surface 标题
  14/600）；`--xh-card-description-font-size` 缺省由 `--xh-text-label-size` 改为 `--xh-text-secondary-size`、
  `--xh-card-description-leading` 由 `--xh-text-body-leading` 改为 `--xh-leading-normal`（说明 13/fg-muted）；
  `--xh-card-p` 缺省由 `--xh-space-4` 改为 `--xh-surface-pad-lg`（同为 16px，Surface 内衬只走 `--xh-surface-*`）。

  **alert 改中性描边面去 raised 落影，关闭钮接入 Action Control，指示符统一 md 档。** 根面的
  `--xh-alert-border` 缺省由 `transparent` 改为 `--xh-border-default`、`--xh-alert-bg` 缺省直接落 `--xh-bg-surface`、
  `--xh-alert-shadow` 缺省由 `--xh-elevation-raised` 改为 `none`（静态反馈面只靠描边分层，私有槽
  `--xh-_alert-surface` / `--xh-_alert-edge` 删除）；`--xh-alert-icon-size` 在 root 上的缺省由 `--xh-glyph-size-sm`
  改为 `--xh-glyph-size-md`（Feedback 指示符统一 md）。connect 在 close-trigger 上投影 `data-xh-action-control` /
  `profile="icon"` / `variant="ghost"` / `display="always"` / `size="sm"`；皮肤删除关闭钮自写的盒、底、字体、
  transition、hover / active / 缩放 / disabled 规则与粗指针外扩伪元素，改为映射家族桥接槽（`--xh-alert-close-size` /
  `-radius` / `-bg-hover` / `-bg-active` / `-fg` / `-fg-hover` 使用者槽保留为第一参数，`--xh-alert-icon-size` 在关闭钮上
  按 sm 档取 16px）。默认外观变化：关闭钮悬停由 `--xh-_tone-subtle-hover`（20%）改为 `--xh-_tone-subtle`（12%）、按下由
  `--xh-_tone-subtle-active`（28%）改为 `--xh-_tone-subtle-hover`（20%）（白底承载阶梯，随语气）；粗指针热区与禁用面
  （透明底 + `--xh-fg-disabled`）改由家族给。

  **toast 改 sheet 三件套，两颗钮接入 Action Control，指示符统一 md 档，标题与说明按 Feedback 排版档。**
  `--xh-toast-border` 缺省由 `transparent` 改为 `--xh-material-elevated-border`、`--xh-toast-bg` 由 `--xh-bg-surface`
  改为 `--xh-material-elevated-bg`、`--xh-toast-fg` 由 `--xh-fg-default` 改为 `--xh-material-elevated-fg`、
  `--xh-toast-shadow` 由 `--xh-elevation-sheet` 改为 `--xh-material-elevated-shadow`（sheet 面必有 1px 描边，亮暗两档
  同源；亮色 `--xh-material-elevated-bg` 为 oklch 0.99 非纯白，与页面白底有极浅色差，属 sheet 三件套既定取值，与 dialog
  同）。`--xh-toast-icon-size` 在 root 上的缺省由 `--xh-glyph-size-sm` 改为 `--xh-glyph-size-md`；
  `--xh-toast-title-font-weight` 缺省 medium → semibold，`--xh-toast-description-font-size` 缺省 `--xh-text-label-size` →
  `--xh-text-secondary-size`、`--xh-toast-description-leading` `--xh-text-body-leading` → `--xh-leading-normal`。
  connect 在 action-trigger 上投影 `data-xh-action-control` / `profile="text"` / `variant="outline"` / `display="always"` /
  `size="sm"`，close-trigger 投影 `profile="icon"` / `variant="ghost"` / `display="always"` / `size="xs"`（24px，与此前
  `--xh-control-action-size` 同尺寸；显隐仍由皮肤按 root 悬停 / 焦点只压 opacity，不走家族的 hover-focus——那一档用
  visibility 收起，占 Tab 位的叉会被键盘漏掉）。皮肤删除两颗钮自写的盒、底、边、字体、transition、hover / active /
  缩放 / disabled 规则与粗指针外扩伪元素，改为映射家族桥接槽（`--xh-toast-action-h` / `-px` / `-radius` / `-bg` /
  `-bg-hover` / `-bg-active` / `-fg` / `-border` / `-font-weight` 与 `--xh-toast-close-size` / `-radius` / `-bg` /
  `-bg-hover` / `-bg-active` / `-border` / `-fg` / `-fg-hover` 使用者槽保留为第一参数）。默认外观变化：操作钮由
  「`--xh-bg-subtle` 淡底 + `--xh-border-default` 描边、悬停 200 / 按下 300、字号随条子 14px」改为透明底 +
  `--xh-border-control` 描边、悬停 `--xh-bg-subtle`（100）+ `--xh-border-control-hover` / 按下 `--xh-bg-subtle-hover`
  （200）、字号取 sm 档 `--xh-control-font-sm`，底 / 边 / 字钉在中性面上不随 `tone`；关闭钮由「`--xh-bg-subtle` 淡底 +
  `--xh-border-default` 描边、悬停 200 / 按下 300」改为静息透明无边、悬停 `--xh-_tone-subtle`（12%，随语气）/ 按下
  `--xh-_tone-subtle-hover`（20%）；粗指针热区与禁用面改由家族给；compact 密度下关闭钮固定 24px（此前 20px）。

  **notification 卡片改 sheet 三件套，两颗钮接入 Action Control，卡片内图标统一 md 档。**
  `--xh-notification-item-border` 缺省由 `--xh-border-default` 改为 `--xh-material-elevated-border`、`--xh-notification-item-bg`
  由 `--xh-bg-surface-raised` 改为 `--xh-material-elevated-bg`、`--xh-notification-item-fg` 由 `--xh-fg-default` 改为
  `--xh-material-elevated-fg`、`--xh-notification-item-shadow` 由 `--xh-elevation-sheet` 改为 `--xh-material-elevated-shadow`
  （与 toast 同一套 sheet 三件套）；`--xh-notification-icon-size` 在 item 上的缺省由 `--xh-control-indicator-size` 改为
  `--xh-glyph-size-md`（Feedback 指示符统一 md；叉与操作钮的字形改按各自按钮档取值）。connect 在 item-action-trigger 上
  投影 `data-xh-action-control` / `profile="text"` / `variant="outline"` / `display="always"` / `size="sm"`，
  item-close-trigger 投影 `profile="icon"` / `variant="ghost"` / `display="always"` / `size="sm"`（32px，钉在卡片角上的
  叉与浮层角落关闭钮同一档）。皮肤删除两颗钮自写的盒、底、边、字体、transition、hover / active / 缩放 / disabled 规则与
  粗指针外扩伪元素，改为映射家族桥接槽（`--xh-notification-action-h` / `-px` / `-radius` / `-bg` / `-bg-hover` /
  `-bg-active` / `-fg` / `-border` / `-font-weight` 与 `--xh-notification-close-size` / `-radius` / `-bg-hover` /
  `-bg-active` / `-fg` / `-fg-hover` 使用者槽保留为第一参数）。默认外观变化：操作钮由「`--xh-bg-subtle` 淡底 +
  `--xh-border-default` 描边、悬停 200 / 按下 300、字号随卡片 14px」改为透明底 + `--xh-border-control` 描边、悬停
  `--xh-bg-subtle`（100）+ `--xh-border-control-hover` / 按下 `--xh-bg-subtle-hover`（200）、字号取 sm 档
  `--xh-control-font-sm`，底 / 边 / 字钉在中性面上不随 `tone`；叉的悬停由 `--xh-bg-subtle-hover`（200）改为
  `--xh-_tone-subtle`（12%，随语气）/ 按下由 `--xh-bg-subtle-active`（300）改为 `--xh-_tone-subtle-hover`（20%）；
  粗指针热区与禁用面改由家族给。

  **empty-state 的标题与说明按 Surface 排版档。** md 档标题由 `--xh-control-font-lg`（16px）改为 `--xh-text-label-size`
  （14/600，Surface / Feedback 标题档；真源 §6.4 只有 14/600 与页面级 heading-3 两档），sm 档不再另给字号（同 14），
  lg 档仍为 `--xh-text-heading-3-size`；`--xh-empty-state-description-font-size` 缺省由 `--xh-text-body-size` 改为
  `--xh-text-secondary-size`、`--xh-empty-state-description-leading` 由 `--xh-text-body-leading` 改为 `--xh-leading-normal`
  （说明 13/fg-muted）。根面无壳，不画边、底与影，未变。

  **code-view 根面去 raised 落影，折叠条接入 Action Control disclosure-trigger 档。** `--xh-code-view-shadow` 缺省由
  `--xh-elevation-raised` 改为 `none`（静态内容面 = `--xh-border-default` 描边 + `--xh-bg-surface` + 无影，边与底未变）。
  connect 在 fold-trigger 上投影 `data-xh-action-control` / `profile="disclosure-trigger"` / `variant="ghost"` /
  `display="always"` / `size`（随 `size`，缺省 md）。皮肤删除折叠条自写的盒、底、字体、transition、hover 与整条缩放规则，
  改为映射家族桥接槽（`--xh-code-view-px` / `--xh-code-view-fold-py` / `--xh-code-view-header-font-size` /
  `--xh-code-view-fold-fg` / `--xh-code-view-fold-bg-hover` / `--xh-code-view-header-border` 使用者槽保留为第一参数，
  圆角归零贴住卡边，顶边分隔线经家族四个状态的边色槽映射保持在场）。默认外观变化：悬停由 `--xh-bg-subtle-hover`（200）
  改为 `--xh-bg-subtle`（100，白底承载），按下由整条缩放 0.97 改为只换面到 `--xh-bg-subtle-hover`（200）；折叠条的
  最小高度取 md 档 `--xh-control-h-md`（36px，此前随内容约 31px），字与内衬不变。

  **diff-view 根面改 border-default 描边去 raised 落影，折叠格按钮接入 Action Control disclosure-trigger 档，图标改 md 档。**
  `--xh-diff-view-border` 缺省由 `--xh-border-subtle` 改为 `--xh-border-default`、`--xh-diff-view-shadow` 缺省由
  `--xh-elevation-raised` 改为 `none`（静态内容面 = 描边 + `--xh-bg-surface` + 无影，`--xh-border-subtle` 不作根面外边）；
  头部下边、行号列右边与并排接缝的内部分隔线从 `--xh-diff-view-border` 拆出新槽 `--xh-diff-view-divider`（缺省
  `--xh-border-subtle`），此前一把 `--xh-diff-view-border` 同时改根边与分隔线的作者需再写 `--xh-diff-view-divider`。
  `--xh-diff-view-icon-size` 缺省由 `--xh-glyph-size-text` 改为 `--xh-glyph-size-md` 并随 `data-size` 换档
  （sm 16 / md 20 / lg 24；截断提示条的警告字形随之）。connect 在 gap-trigger 上投影 `data-xh-action-control` /
  `profile="disclosure-trigger"` / `variant="ghost"` / `display="always"` / `size`（随 `size`，缺省 md）；皮肤删除折叠格按钮
  自写的盒、底、字体、transition、hover 与整条缩放规则，改为映射家族桥接槽（`--xh-diff-view-px` / `--xh-diff-view-font-size` /
  `--xh-diff-view-gap-fg` / `--xh-diff-view-gap-bg-hover` 使用者槽保留为第一参数，高度锚在 `--xh-diff-view-line-height` 上
  与相邻代码行同高），gap 行作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`。默认外观变化：按下由整条缩放 0.97
  改为只换面到 `--xh-bg-subtle-active`（300，淡底承载），悬停仍为 `--xh-bg-subtle-hover`（200）。

  **log 根面改 surface 底，回底钮接入 Action Control floating 档并改 frosted 四件套。** `--xh-log-bg` 缺省由
  `--xh-bg-subtle` 改为 `--xh-bg-surface`（描边与淡底互斥：`--xh-border-default` 描边 + surface 底 + 无影，与
  code-view / diff-view / json-viewer 同走 solid），root 新增 `--xh-log-shadow` 槽（缺省 `none`）。connect 在
  scroll-to-end-trigger 上投影 `data-xh-action-control` / `profile="floating"` / `variant="ghost"` / `display="always"` /
  `size="xs"`（`--xh-control-box-sm` 32px，与此前 `--xh-control-h-sm` 同尺寸）。皮肤删除回底钮自写的盒、边、底、影、
  transition、hover 与缩放规则，改为映射家族桥接槽（`--xh-log-scroll-to-end-trigger-size` / `-radius` / `-bg` / `-bg-hover` /
  `-border` / `-shadow` / `-fg` 使用者槽保留为第一参数）；材质由「`--xh-bg-surface-raised` + `--xh-border-default` +
  `--xh-elevation-raised`」改为角落浮钮族的 frosted 四件套（`--xh-material-frosted-bg / -border / -shadow / -backdrop`，
  字色 `--xh-material-frosted-fg`；raised 只给 Card 与可抬起部件）。`--xh-log-icon-size` 从 root 移到回底钮上，缺省由
  `--xh-glyph-size-text` 改为家族 xs 档字形 `--xh-_action-profile-glyph-size`（16px）。默认外观变化：悬停由
  `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下换面到 `--xh-bg-subtle-hover`（200）并保留
  0.97 缩放；粗指针热区与禁用面改由家族给。

  **json-viewer 三端不再渲染自绘滚动条，分支行补按压换面，图标改 md 档。** 树档 / 原文档容器是页内结构容器
  （与 Tree 同类），真源 §6.6 把自绘条只给浮层与定高小列表：Vue / React / Web Components 删除 `useScrollbars` /
  `ScrollbarsController` 接线，root 下不再挂 `[data-scope="scrollbar"]` 节点、`tree` / `text` 不再带 `data-xh-scrollbar`，
  两档容器走 reset 层的原生细条（依赖 `[data-scope][data-part]` 节点或作者容器的 `data-xh-scroll`）；皮肤删除 root 上的
  `--xh-scrollbar-track-bg: transparent` 死声明与 `position: relative`。以「root 下有条子」为前提的 DOM 查询与样式需改。
  面的写法收敛：`tree` / `text` / `empty` 三块面直接写 `--xh-json-viewer-border` → `--xh-border-default`、
  `--xh-json-viewer-bg` → `--xh-bg-surface`，新增 `--xh-json-viewer-shadow`（缺省 `none`），subtle / ghost 两档改由
  root 的 `data-variant` 向三块面下发透明边与底（此前经私有槽 `--xh-_json-viewer-border` / `-bg` 中转，外观逐值不变）。
  分支行 `branch-control` 新增按下换面 `--xh-json-viewer-row-bg-active`（缺省 `--xh-bg-subtle-hover`，白底承载 hover 100 →
  pressed 200，集合行不允许零反馈）。`--xh-json-viewer-icon-size` 缺省由 `--xh-glyph-size-text` 改为 `--xh-glyph-size-md`
  并随 `data-size` 换档（sm 16 / md 20 / lg 24；展开箭头的兜底字形随之）。

  **tool-call 根面改 border-default 描边去 raised 落影，开关接入 Action Control disclosure-trigger 档，退场改 exit 曲线。**
  `--xh-tool-call-border` 缺省由 `--xh-border-subtle` 改为 `--xh-border-default`、`--xh-tool-call-shadow` 缺省由
  `--xh-elevation-raised` 改为 `none`（静态内容面 = 描边 + `--xh-bg-surface` + 无影；subtle 档随之无影；语气色条叠写时
  以 `0 0 0 transparent` 零影占位）；审批位与详情区的内部分隔线从 `--xh-tool-call-border` 拆出新槽 `--xh-tool-call-divider`
  （缺省 `--xh-border-subtle`），此前一把 `--xh-tool-call-border` 同时改根边与分隔线的作者需再写 `--xh-tool-call-divider`。
  connect 在 trigger 上投影 `data-xh-action-control` / `profile="disclosure-trigger"` / `variant="ghost"` / `display="always"` /
  `size`（随 `size`，缺省 md）；皮肤删除开关自写的盒、底、字体、transition、hover / 缩放 / disabled 规则，改为映射家族桥接槽
  （`--xh-tool-call-px` / `-py` / `-font-size` / `-trigger-gap` / `-trigger-fg` / `-trigger-bg-hover` / `-trigger-radius` 使用者槽
  保留为第一参数，内衬沿用卡片档位），subtle 档根面作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`。
  `--xh-tool-call-icon-size` 在 root 上的缺省由 `--xh-glyph-size-text` 改为 `--xh-glyph-size-md`，开关内的指示符改按家族档字形取值。
  详情区收起动画的曲线由 `--xh-motion-ease-enter-strong` 改为 `--xh-motion-ease-exit`（§9.4 退场 exit 档）。默认外观变化：
  outline 档悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下由整条缩放 0.97 改为只换面到
  `--xh-bg-subtle-hover`（200）；subtle 档悬停 200 / 按下 300；开关最小高度取 md 档 `--xh-control-h-md`（36px，此前随内容约
  33px），行内文字行高改 `--xh-leading-none`；粗指针热区与禁用面改由家族给。

  **reasoning 淡底面去 raised 落影，outline 档改 border-default 描边，开关接入 Action Control disclosure-trigger 档。**
  `--xh-reasoning-shadow` 缺省由 `--xh-elevation-raised` 改为 `none`（缺省 subtle 淡底面无影；语气色条叠写时以
  `0 0 0 transparent` 零影占位），outline 档 `--xh-reasoning-border` 缺省由 `--xh-border-subtle` 改为 `--xh-border-default`
  （静态内容面 = 描边 + `--xh-bg-surface` + 无影）。connect 在 trigger 上投影 `data-xh-action-control` /
  `profile="disclosure-trigger"` / `variant="ghost"` / `display="always"` / `size`（随 `size`；不写时取 sm，与皮肤缺省字号
  `--xh-control-font-sm` 同档）；皮肤删除开关自写的盒、底、字体、transition、hover / 缩放 / disabled 规则，改为映射家族桥接槽
  （`--xh-reasoning-px` / `-py` / `-font-size` / `-trigger-gap` / `-trigger-fg` / `-trigger-bg-hover` / `-trigger-radius`
  使用者槽保留为第一参数，内衬沿用本组件档位），缺省 subtle 根面作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`
  （200 → 300），outline / ghost 档改回白底阶梯（100 → 200）。`--xh-reasoning-icon-size` 在 root 上的缺省由
  `--xh-glyph-size-text` 改为按 `data-size` 换档（缺省与 sm 档 `--xh-glyph-size-sm` 16px、md 20px、lg 24px，此前 1em），
  与开关的家族档位同步。
  默认外观变化：按下由整条缩放 0.97 改为只换面到 `--xh-bg-subtle-active`（300）；开关最小高度取 sm 档 `--xh-control-h-sm`
  （32px），行内文字行高改 `--xh-leading-none`；开关字色三态停在 `--xh-fg-muted`；粗指针热区与禁用面改由家族给。

  **approval 根面改 border-default 描边去 raised 落影，授权行接入 Action Control row 档，两颗钮接入 text 档。**
  `--xh-approval-border` 缺省由 `--xh-border-strong` 改为 `--xh-border-default`（语气色边只在作者打了 `tone` 时染上，
  拆成独立的 `[data-tone]` 规则）、落定后 `--xh-approval-border-settled` 缺省由 `--xh-border-subtle` 改为
  `--xh-border-default`、`--xh-approval-shadow` 缺省由 `--xh-elevation-raised` 改为 `none`（静态内容面 = 描边 +
  `--xh-bg-surface` + 无影；subtle 档随之无影）。connect 在 item 上投影 `data-xh-action-control` / `profile="row"` /
  `variant="ghost"` / `display="always"` / `size`，在 approve-trigger 上投影 `profile="text"` / `variant="solid"`、在
  deny-trigger 上投影 `profile="text"` / `variant="outline"`（档位随 `size`，缺省 md）；两颗钮新增 `data-disabled`
  （落定时两颗都投，必选项没勾满时只投批准；判定在途仍只走 `data-loading` + `aria-disabled`，家族给在途面）。
  皮肤删除授权行与两颗钮自写的盒、底、边、字体、transition、hover / 缩放 / disabled 规则，改为映射家族桥接槽
  （`--xh-approval-item-*`、`--xh-approval-action-*`、`--xh-approval-approve-*`、`--xh-approval-deny-*` 使用者槽保留为
  第一参数）；subtle 档根面作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`。默认外观变化：授权行悬停由
  `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下由整行缩放 0.97 改为只换面到
  `--xh-bg-subtle-hover`（200），行最小高度取 row 档 `--xh-control-h-md`（36px，此前随内容约 29px），行内文字行高由 UA
  `normal` 改为 `--xh-leading-normal`（皮肤在 item 上写正文行高，不吃家族单行档）；批准钮按下同时换底到 `--xh-bg-brand-active`、
  必选项没勾满时的置灰底 `--xh-approval-approve-bg-off`
  缺省由 `--xh-bg-muted` 改为 `--xh-bg-subtle`；拒绝钮悬停由 200 改为 100、按下换面 200 并浮出 `--xh-border-control-hover`
  描边，落定后的描边 `--xh-approval-deny-border-off` 缺省由 `--xh-border-default` 改为 `--xh-border-subtle`（家族 outline
  禁用面）。标题字重 `--xh-approval-title-font-weight` 缺省由 `--xh-text-label-weight`（500）改为
  `--xh-font-weight-semibold`（600），说明行高由 `--xh-text-body-leading` 改为 `--xh-leading-normal`。connect 在
  approve-trigger 上与根同值投影 `data-tone`（与 Button 同构）：家族的深色 solid 规则只看触发器自身的 `data-tone`，此前
  暗色下批准钮的实心面会落回品牌色，现在亮暗两态都随 `tone` 取语气色。
  `--xh-approval-icon-size` 缺省由 `--xh-glyph-size-text` 改为按 `data-size` 换档（sm 16 / md 20 / lg 24），勾选记号里的勾
  改按指示符盒比例量（0.75 盒宽），新增 `--xh-approval-indicator-icon-size` 覆盖它；在途圆环的圆角由 `--xh-shape-pill`
  改为 `--xh-shape-circle`（正方盒取圆）。

  **question-flow 根面改 border-default 描边去 raised 落影，选项行接入 Action Control row 档，四颗钮接入 icon / text 档。**
  `--xh-question-flow-border` 缺省由 `--xh-border-subtle` 改为 `--xh-border-default`、`--xh-question-flow-shadow` 缺省由
  `--xh-elevation-raised` 改为 `none`（静态内容面 = 描边 + `--xh-bg-surface` + 无影；subtle 档随之无影），三档形态改由
  `data-variant` 规则直接写底与边（此前经私有槽中转，outline / subtle / ghost 观感逐值不变）。connect 在 item 上投影
  `data-xh-action-control` / `profile="row"` / `variant="ghost"`，在 prev-trigger / next-trigger 上投影 `profile="icon"` /
  `variant="ghost"` / `size="xs"`（24px 方格），在 skip-trigger 上投影 `profile="text"` / `variant="ghost"`、在 submit-trigger 上
  投影 `profile="text"` / `variant="solid"`（档位随 `size`，缺省 md）；四颗钮新增 `data-disabled`（与原生 `disabled` 同步，
  家族按它给禁用面）。皮肤删除选项行与四颗钮自写的盒、底、边、字体、transition、hover / 缩放 / disabled 规则，改为映射家族
  桥接槽（`--xh-question-flow-item-*`、`-step-*`、`-action-*`、`-skip-*`、`-submit-*` 使用者槽保留为第一参数）；subtle 档
  根面作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`。默认外观变化：选项行、翻页钮与跳过钮悬停由
  `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下换面到 `--xh-bg-subtle-hover`（200）——选项行
  只换面不再缩放，行最小高度取 row 档 `--xh-control-h-md`（36px，此前随内容约 29px），行内文字行高仍是
  `--xh-leading-normal`（皮肤在 item 上写回正文行高，不吃家族单行档）；
  翻页钮字号取 xs 档 `--xh-control-font-sm`（箭头字形仍按根上的 `--xh-question-flow-icon-size` 量）；提交钮答不动时的置灰底
  `--xh-question-flow-submit-bg-off` 缺省由 `--xh-bg-muted` 改为 `--xh-bg-subtle`。题干字重 `--xh-question-flow-prompt-font-weight`
  缺省由 `--xh-text-label-weight`（500）改为 `--xh-font-weight-semibold`（600）。单选记号盒的圆角
  `--xh-question-flow-indicator-radius-single` 缺省由 `--xh-shape-pill` 改为 `--xh-shape-circle`（正方盒取圆）；记号盒里的勾
  `--xh-question-flow-indicator-icon-size` 缺省由 `--xh-glyph-size-text` 改为按盒比例量（0.75 盒宽）。connect 在
  submit-trigger 上与根同值投影 `data-tone`（与 Button 同构）：家族的深色 solid 规则只看触发器自身的 `data-tone`，此前
  暗色下提交钮的实心面会落回品牌色，现在亮暗两态都随 `tone` 取语气色。

  **message-feed 回底钮接入 Action Control floating 档并改 frosted 四件套，粘底视口补稳定滚动槽。** connect 在
  scroll-to-end-trigger 上投影 `data-xh-action-control` / `profile="floating"` / `variant="ghost"` / `display="always"` /
  `size="xs"`（`--xh-control-box-sm` 32px 正方盒，与此前 `--xh-control-h-sm` 同尺寸）；皮肤删除回底钮自写的盒、边、底、影、
  transition、hover / 缩放规则，改为映射家族桥接槽（`--xh-message-feed-scroll-to-end-trigger-*` 使用者槽保留为第一参数），
  材质由 raised 三件（`--xh-border-default` + `--xh-bg-surface-raised` + `--xh-elevation-raised`）改为 frosted 四件套
  （`--xh-material-frosted-bg` / `-border` / `-shadow` / `-backdrop`，字色 `--xh-material-frosted-fg`；角落浮钮族与
  log / back-top 同档）。默认外观变化：悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下
  缩放并换面到 `--xh-bg-subtle-hover`（200）；`--xh-message-feed-icon-size` 从 root 移到回底钮，缺省由 `--xh-glyph-size-text`
  改为家族 xs 档字形 `--xh-_action-profile-glyph-size`（16px）。viewport 新增 `scrollbar-gutter: stable`（带 `data-xh-scrollbar`
  的容器除外）：流式视口的内容高度一直在变，原生条出现与消失时不再推动文字，右侧常留一条条宽的空道。

  **accordion outline 根面补 border-default 描边，标题栏接入 Action Control disclosure-trigger 档；collapsible 触发器同档接入。**
  accordion 的 outline 档新增使用者槽 `--xh-accordion-border`（缺省 `--xh-border-default`，1px 描边；此前只有底无边），
  与条与条之间的分隔线槽 `--xh-accordion-item-border` 各管各的；subtle 档补一圈透明边位（三档几何一致）并作为淡底承载面
  下发 `--xh-action-host-bg-hover / -pressed`（200 → 300）。两家的 connect 在 trigger 上投影 `data-xh-action-control` /
  `profile="disclosure-trigger"` / `variant="ghost"` / `display="always"` / `size`（随 `size`，缺省 md）；皮肤删除触发器自写的
  盒、底、边、字体、transition、hover / 缩放 / disabled 规则与三档私有槽，改为映射家族桥接槽（`--xh-accordion-trigger-*` /
  `--xh-collapsible-trigger-*` 使用者槽保留为第一参数，三档 gap / 高度 / 内衬 / 字号取家族 disclosure-trigger 档，与迁移前逐值
  相同）。默认外观变化：悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100，白底承载），按下由整条缩放 0.97 改为
  只换面到 `--xh-bg-subtle-hover`（200）；展开态的标题栏不再排除悬停换面（open 与家族 hover 同档中性，字色仍走
  `-fg-open`）；粗指针热区与禁用面改由家族给。指示器转向由 `--xh-motion-duration-micro` 改为 `--xh-motion-duration-enter`
  （与正文展开同档）；`--xh-accordion-icon-size` / `--xh-collapsible-icon-size` 在 root 上的缺省由 `--xh-glyph-size-text` 改为
  `--xh-glyph-size-md`，触发器内的指示符改按家族档字形取值（sm 16 / md 20 / lg 24）。

  **toolbar outline 改 border-default 描边去 raised 落影，条目接入 Action Control text 档，选中字色改淡底前景。**
  outline 档由「边宽 0 + `--xh-elevation-raised` 落影」改为 `--xh-border-default` 1px 描边 + `--xh-bg-surface` + 无影
  （`--xh-toolbar-shadow` 缺省由 `--xh-elevation-raised` 改为 `none`，静态内容面 = 描边 + surface 底 + 无影）；subtle 档
  补一圈透明边位（与 outline 同一几何）并作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`（200 → 300）。
  connect 在 item 上投影 `data-xh-action-control` / `profile="text"` / `variant="ghost"` / `display="always"` / `size`（随
  `size`，缺省 md）；皮肤删除条目自写的盒、底、边、字体、transition、hover / 缩放 / disabled 规则与分组内的重复三态规则，
  改为映射家族桥接槽（`--xh-toolbar-item-*` 使用者槽保留为第一参数），分组作为淡底承载面下发 host 槽。`aria-pressed`
  选中态的字色 `--xh-toolbar-item-fg-pressed` 缺省由 `--xh-fg-brand-strong` 改为 `--xh-fg-on-brand-subtle`（无滑块开关 =
  品牌淡底 + 淡底前景，§7.3），新增 `--xh-toolbar-item-bg-pressed-active`（缺省 `--xh-bg-brand-subtle-active`）作为选中
  段的按下面（12% → 20% → 28%）。默认外观变化：ghost 根上散落的条目悬停由 `--xh-bg-subtle-hover`（200）改为
  `--xh-bg-subtle`（100，白底承载），按下换面到 `--xh-bg-subtle-hover`（200）并缩放 0.97；分组内条目悬停 200 / 按下 300
  且按下同样缩放（此前分组内不缩放）；条目改为定高盒（`block-size` 取档位，此前 `min-block-size`），
  边由 0 改为 1px 透明边位（与 Button 同构，border-box 下总高不变）。

  **page-header outline 描边改 border-default，subtle 补透明边位，标题字重走标题档令牌。** `--xh-page-header-border`
  在 outline 根面上的缺省由 `--xh-border-subtle` 改为 `--xh-border-default`（静态内容面 = 描边 + `--xh-bg-surface` + 无影；
  ghost 贴底 `split` 那条分隔线仍缺省 `--xh-border-subtle`）；subtle 档补一圈透明边位，与 outline 同一几何。
  `--xh-page-header-title-font-weight` 缺省由字重原语 `--xh-font-weight-semibold` 改为标题档令牌 `--xh-text-heading-3-weight`
  （同为 600，观感不变）。

  **layout 覆盖档侧栏改 sheet 三件套，折叠把手接入 Action Control text 档。** `data-presentation="sheet"` 的侧栏由只有
  `--xh-elevation-sheet` 落影改为 sheet 三件套：`--xh-layout-sider-bg` 在这一档的缺省由 `--xh-bg-subtle` 改为
  `--xh-material-elevated-bg`、`--xh-layout-sider-shadow` 缺省由 `--xh-elevation-sheet` 改为 `--xh-material-elevated-shadow`，
  并在贴着内容那一侧新描一条 `--xh-layout-border`（这一档缺省 `--xh-material-elevated-border`；`placement="end"` 时描在
  行首侧）；占位档的侧栏不变。connect 在 sider-trigger 上投影 `data-xh-action-control` / `profile="text"` / `variant="ghost"` /
  `display="always"` / `size="sm"`（把手是一枚装着文字的小档按钮，几何与此前的 `--xh-control-h-sm` / `--xh-control-px-sm` 逐值
  相同）；皮肤删除把手自写的盒、底、边、字体、transition、hover / 缩放规则，改为映射家族桥接槽（`--xh-layout-sider-trigger-*`
  使用者槽保留为第一参数）；占位档侧栏作为淡底承载面下发 `--xh-action-host-bg-hover / -pressed`，覆盖档侧栏换成 elevated
  白底后把阶梯写回 100 / 200。默认外观变化：把手摆在顶栏等白底上时悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`
  （100），按下换面到 `--xh-bg-subtle-hover`（200）；摆进占位档侧栏时仍是 200 / 300，摆进覆盖档侧栏时同白底 100 / 200；
  把手字号由 `--xh-text-secondary-size` 改为家族 sm 档 `--xh-control-font-sm`（同为 13px）。

  **descriptions subtle 补透明边位，标签与取值的间距改 space-2。** subtle 档补一圈 `--xh-stroke-thin` 透明边位，与
  outline 同一边宽（淡底面 = `--xh-bg-subtle` + 透明边位 + 无影）；outline 档仍是 `--xh-border-default` 描边 +
  `--xh-bg-surface` + 无影，网格线 `--xh-border-subtle` 只作内部分隔。标签是每一格的集合标题（14 / 500 /
  `--xh-fg-muted`），叠着排时与取值的间距 `--xh-descriptions-pair-gap` 缺省由 `--xh-space-1`（4px）改为
  `--xh-space-2`（8px，§6.4 集合标题与集合的间距）；sm 档此前继承 md 的 4px，现同为 8px，lg 档不变。标签在左时的
  列间距不变。

  **list subtle 补透明边位，淡底档里的 hoverable 条目悬停抬到 200。** subtle 档补一圈 `--xh-stroke-thin` 透明边位，与
  outline 同一几何（淡底面 = `--xh-bg-subtle` + 透明边位 + 无影）；outline 档仍是 `--xh-border-default` 描边 +
  `--xh-bg-surface` + 无影，`split` 分隔线 `--xh-border-subtle` 只作内部分隔。`--xh-list-item-bg-hover` 的缺省改经根上的
  私有槽 `--xh-_list-item-bg-hover` 下发：白底 / ghost / outline 仍是 `--xh-bg-subtle`（100），subtle 档的根把它抬到
  `--xh-bg-subtle-hover`（200，§7.2 坐在淡底上的条目按承载面取阶梯；此前与淡底同色，悬停看不出来）。皮肤体积
  基线 list.css 3517 → 3883 字节：涨在 subtle 档的透明边位、根上的悬停面私有槽与淡底档对它的覆盖。

  **kbd 字号改次级标注档 12px。** `--xh-kbd-font-size` 缺省由 `--xh-text-label-size`（14px）改为
  `--xh-text-caption-size`（12px，§6.4 快捷键属次级标注）；键帽高 `--xh-space-6`（24px）、最小宽 24px、control 4px 圆角、
  subtle 材质（透明边位 + `--xh-bg-subtle` + 无影）与 `light` 档的透明底都不变，单行行高 `--xh-leading-none` 随字号缩到
  12px，键帽内的字在 24px 盒里仍居中。

  **tag 改胶囊。** `--xh-tag-radius` 缺省由 `--xh-shape-control`（4px）改为 `--xh-shape-pill`（§6.3 pill 只给状态 chip 与
  一维对象，Tag 是状态 chip），四种形态与三档尺寸同一身份；关闭钮 `--xh-tag-close-radius` 仍是 `--xh-shape-inset`
  （随文标记档的 16px 正方盒，与 checkbox 系方框同档，内层圆角不越过外层胶囊）。缺省 subtle 档仍是 soft 材质
  （`--xh-material-soft-border / -bg / -shadow`，§8 登记消费者），outline 描边 `--xh-border-default`、solid / ghost 不变。
  波及复用 tag 皮肤的 select 多选标签、tags-input 条目与 tag-group 成员：它们的默认圆角一并由 4px 变为胶囊；以
  `--xh-tag-radius` 覆盖过的作者不受影响。

  **statistic 涨跌箭头改按字形档取尺。** root 新增使用者槽 `--xh-statistic-icon-size`（映射 `--xh-icon-size`），缺省
  `--xh-glyph-size-sm`（16px，跟着前后缀那一档 14px 字走），lg 档抬到 `--xh-glyph-size-md`（20px）；趋势箭头的兜底字形
  与作者塞进 trend 的图标读同一把尺（此前箭头 `--xh-glyph-size-text` 随文 1em ≈ 14px，作者图标落 `--xh-icon-size` 缺省
  20px，两者不一致）。标签 / 数值 / 前后缀 / 涨跌的字号、字重与颜色不变，无壳无形状。

  **timeline 说明改说明档 13px。** `--xh-timeline-description-font-size` 缺省由 `--xh-text-body-size`（14px）改为
  `--xh-text-secondary-size`（13px，§6.4 说明 / helper 档：13 / `--xh-fg-muted` / `--xh-leading-normal`），字色与行高本就在档上；
  条目标题仍是 `--xh-text-label-weight` 500（它是每条事件的标题，不是 Surface 面板标题），label / time 的 12px 次级标注、
  圆点 circle 与连线 pill 的身份、tone 圆点的 `--xh-fg-muted` 兜底都不变。

  **badge 圆点档改取 circle。** `indicator[data-dot]` 新增使用者槽 `--xh-badge-dot-radius`，缺省 `--xh-shape-circle`
  （§6.3 宽高同槽的正方盒必须取 circle，不得用胶囊冒充圆）；此前圆点档沿用计数档的 `--xh-badge-radius`（`--xh-shape-pill`
  9999px），在 6 / 8 / 10px 的正方盒上画出的仍是圆，像素不变，但作者按圆点覆盖圆角时只能改动计数档那一槽。计数档的
  胶囊身份、`--xh-badge-ring` 切边环、13 / 500 字形与三档尺寸都不变。check-shape-scale 身份表新增
  `badge:indicator[data-dot]=circle`。

  **timer 起停钮接入 Action Control text outline 档，去抬升，阶梯改 100 / 200。** connect 在 control 上投影
  `data-xh-action-control` / `profile="text"` / `variant="outline"` / `display="always"` / `size`（随 `size` 取
  sm / md / lg，缺省 `md`，钮高 32 / 36 / 40px 与此前一致）。皮肤 `@import` 家族 action-control，删除起停钮自写的盒、底、
  边、transition、hover / active / 缩放 / focus-visible / `:disabled` 规则与粗指针 `::before` 外扩，改为映射家族桥接槽
  （`--xh-timer-control-h` / `-px` / `-gap` / `-radius` / `-bg` / `-bg-hover` / `-bg-active` / `-bg-disabled` / `-fg` /
  `-border` / `-border-hover` / `-border-focus` / `-border-disabled` / `-shadow-hover` / `-shadow-active` 使用者槽全部保留为
  第一参数），只留 `--xh-text-label-size` 字号与 `--xh-text-label-weight` 字重；新增使用者槽 `--xh-timer-icon-size`
  （映射 `--xh-icon-size`，缺省按档取 `--xh-_action-profile-glyph-size` 16 / 20 / 24px，作者塞进钮里的图标随档取尺）。
  默认外观变化：静息底由 `--xh-bg-surface` 改为透明（描边仍 `--xh-border-control`、control 圆角、无影）；悬停由
  `--xh-bg-subtle-hover`（200）+ `--xh-elevation-raised` 抬升改为 `--xh-bg-subtle`（100）+ `--xh-border-control-hover`、
  不抬升（§8 raised 只给 Card 与可抬起部件）；按下由 `--xh-bg-subtle-active`（300）改为 `--xh-bg-subtle-hover`（200）
  （白底承载阶梯），0.97 按压与 120 / 200ms 节奏不变；焦点边不再随 `--xh-_tone`，由家族给中性边 + `--xh-ring-focus`
  焦点环（§7.2.5）；粗指针热区由家族外扩到 44px；禁用面由家族按 `data-disabled` 给（透明底 + `--xh-fg-disabled` +
  `--xh-border-subtle`），作者直接写原生 `disabled` 的钮不再有专属禁用面（Headless 未定义该状态）。

  **tabs 按下改为只换面，segment 档选中标签改白色抬起面并补描边，line 档悬停 / 按下改字色三步。** 标签是铺开的一段
  （§9.2 Tabs trigger 归行级），皮肤删除 `:active` 的 0.97 缩放与 transition 里的 `scale` 项，按下改为按形态换面：`card`
  坐在画布上，悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100）、按下 `--xh-bg-subtle-hover`（200）；`segment`
  坐在淡底轨道里，悬停 200、按下 `--xh-bg-subtle-active`（300），标签带作为淡底承载面向内下发 `--xh-action-host-bg-hover / -pressed`；选中标签不叠按下面（§7.3 有滑块开关无叠加态）。新增使用者槽 `--xh-tabs-trigger-bg-pressed`（缺省按形态取
  私有槽）与 `--xh-tabs-trigger-fg-pressed`（line 档，缺省 `--xh-_tabs-accent-text`）。`line` 档无底，悬停与按下只换前景：
  `--xh-tabs-trigger-fg-hover` 缺省由 `--xh-_tabs-accent-text` 改为 `--xh-fg-default`，静息 muted → 悬停 default → 按下与
  当前页 `--xh-fg-brand-strong` 三步各一档（此前悬停即品牌字色，按住与悬停无可见差别）；当前页补 `--xh-font-weight-medium`
  字重（新增槽 `--xh-tabs-trigger-font-weight-active`，与静息 `--xh-text-label-weight` 同为 500，像素不变）。`segment` 档
  （§7.3 有滑块开关）：选中标签的底由 `--xh-bg-surface` 改为 `--xh-bg-surface-raised`，补 `--xh-stroke-thin` 的
  `--xh-border-default` 描边（未选中标签带同宽透明边位，盒高不变），`--xh-elevation-raised` 影保留；标签带补一圈
  `--xh-stroke-thin solid transparent` 占位边（§8.3 淡底面 = subtle 底 + 透明边位 + 无影，`--xh-tabs-list-border` 在这一档也
  可覆盖它），标签带的盒因此各向外扩 1px。高对比档补按下通道（Highlight / HighlightText）。皮肤体积基线随三条新增规则
  （segment 标签带、segment 选中面、line 按下前景）重落。

  **segmented 轨道改透明占位边，滑块补 border-default 描边，按下改只换面。** 轨道是淡底面（§8.3）：`--xh-segmented-border`
  缺省由 `--xh-border-subtle` 改为 `transparent`（`--xh-bg-subtle` 底 + 同宽透明边位 + 无影，`--xh-border-subtle` 只作内部
  分隔），轨道作为淡底承载面向内下发 `--xh-action-host-bg-hover / -pressed`（200 → 300）。滑块 indicator 是有滑块开关的白色
  抬起面（§7.3）：底由 `--xh-bg-surface` 改为 `--xh-bg-surface-raised`，新增 `--xh-stroke-thin` 的 `--xh-border-default`
  描边（新增使用者槽 `--xh-segmented-indicator-border`；`data-tone` 档描边与实心语气底同色），`--xh-elevation-raised` 影保留；
  描边吃进连接层量出的盒里，滑块与段仍是同一块矩形。段是轨道里铺开的一段（§9.2）：删除 `:active` 的 0.97 缩放与 transition
  里的 `scale` 项，未选中段按下改为换到 `--xh-bg-subtle-active`（300，新增使用者槽 `--xh-segmented-item-bg-pressed`），选中段
  不叠按下面（有滑块开关无叠加态）；悬停 `--xh-bg-subtle-hover`（200）不变。高对比档补按下通道（Highlight / HighlightText）。

  **toggle-group 段接入 Action Control text 档，选中改品牌淡底前景，阶梯按承载面分档。** connect 在 item 上投影
  `data-xh-action-control` / `profile="text"` / `display="always"` / `size`（随 `size`，缺省 md）/ `variant`（随 `variant`，
  缺省 subtle）；皮肤 `@import` 家族 action-control，删除段自写的盒、底、边、transition、hover / active / disabled 规则与粗指针
  `::after` 外扩，改为映射家族桥接槽（`--xh-toggle-group-item-*` 使用者槽全部保留为第一参数），`--xh-action-scale-pressed: none`
  保住共边接缝（按下只换面）。选中段是无滑块开关（§7.3）：`--xh-toggle-group-item-fg-on` 缺省由 `--xh-fg-brand` 改为
  `--xh-fg-on-brand-subtle`，subtle / outline / ghost 三档选中后的悬停与按下面由 `--xh-bg-brand-subtle` 改为
  `--xh-bg-brand-subtle-hover` / `-active`（12% → 20% → 28%，此前选中段悬停与按下不换面），solid 仍是品牌实心；solid 选中段的
  焦点环改经 `--xh-action-ring-color-focus-visible` 灌 currentColor。阶梯按承载面（§7.2）：缺省 subtle 档的段坐在自己的淡底
  上，悬停 200 → 按下 300 不变；outline / ghost 的段坐在画布上，悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`
  （100）、按下由 `--xh-bg-subtle-active`（300）改为 `--xh-bg-subtle-hover`（200）。段改为定高盒并带 `min-inline-size`
  （与 Button 同构，text 档最小宽等于档位高度）；禁用段的光标由家族给 `not-allowed`。

  **radio-group 圆圈补悬停描边与按下换底，集合标题字号不随档、间距改 space-2。** 整行是命中区、回执落在圆圈上（§9.2
  集合行不允许零反馈）：未选中且未校验失败的圆圈在整行悬停时描边升到 `--xh-border-control-hover`（新增使用者槽
  `--xh-radio-group-indicator-border-hover`），整行按下时圆圈换底到 `--xh-bg-subtle-hover`（200，白底承载，新增
  `--xh-radio-group-indicator-bg-pressed`），圆点与几何不动，禁用与只读的行不给回执，选中圈与失败圈保住各自的描边；高对比档
  按下把描边换成 Highlight。集合标题（§6.4）：`--xh-radio-group-label-font-size` 缺省由随档的 `--xh-control-font-*` 改为
  `--xh-text-label-size`（14px 不随 size），单行行高 `--xh-leading-none`，整组禁用时标题落 `--xh-fg-subtle`（新增
  `--xh-radio-group-label-fg-disabled`）；`--xh-radio-group-gap` 缺省由 `--xh-stack-gap-md`（16px）改为 `--xh-space-2`
  （8px），标题到集合与条目之间同为一档紧密关系。皮肤体积基线随新增的四条规则重落。

  **checkbox-group 删除 `variant`，方框改字段家族控制盒，按下补换底，集合标题间距与条目字号归位。** 破坏性：`variant`
  （`primary | secondary`）从 Headless `CheckboxGroupProps`、Vue / React props 与 `<xh-checkbox-group>` 的 `variant` attribute
  中删除，root 不再投影 `data-variant`；它只剩「收掉控制盒海拔」一件事，海拔退出后为空 API（未发布的
  checkbox-group-secondary-variant changeset 一并撤回；独立 Checkbox 的 `CheckboxVariant` 随其自身迁移处理）。方框是字段
  家族的控制盒（§8.3）：`--xh-checkbox-group-indicator-bg` 缺省由 `--xh-material-soft-bg` 改为 `--xh-bg-canvas`，删除顶光
  渐变、静息 `--xh-material-soft-shadow` 与悬停 `--xh-elevation-raised` 抬升（使用者槽 `--xh-checkbox-group-indicator-highlight`
  / `-shadow-hover` / `-shadow-pressed` / `-shadow-disabled` / `-shadow-readonly` 随之删除，`-shadow` 保留、缺省 `none`），悬停时
  未勾选方框描边由语气色改为 `--xh-border-control-hover`（勾中方框悬停不换描边）；按下保留 0.97 缩放并补换底：未勾选换到
  `--xh-bg-subtle-hover`（新增 `--xh-checkbox-group-indicator-bg-pressed`），勾中 / 半选换到 `--xh-_tone-active`（缺省
  `--xh-bg-brand-active`，新增 `--xh-checkbox-group-indicator-bg-checked-pressed`）；禁用面改 `--xh-border-default` +
  `--xh-bg-subtle` + `--xh-fg-disabled`（此前 `--xh-border-control` + `--xh-bg-muted`）。`--xh-checkbox-group-gap` 缺省由
  `--xh-stack-gap-md`（16px）改为 `--xh-space-2`（8px，§6.4 集合标题与集合）；条目与全选格文字改随 size 档
  （`--xh-checkbox-group-item-font-size` / `-select-all-trigger-font-size` 缺省由 `--xh-text-label-size` 改为
  `--xh-control-font-sm / md / lg`，与 checkbox 标签、radio-group 条目统一），全选格圆角由 `--xh-shape-control` 改为
  `--xh-shape-inset`（同值 4px，身份归位）；`--xh-icon-size` 缺省改按方框比例取字形（与 checkbox 同一把尺）。示例
  `checkbox-group/05-tone-size`（变体）改为 `05-size`（尺寸）。

  **checkbox 删除 `variant`，方框改字段家族控制盒，按下补换底，禁用改中性面。** 破坏性：`CheckboxVariant`（`primary | secondary`）类型与 `variant` prop 从 Headless `CheckboxSchema`、Vue / React props 与 `<xh-checkbox>` 的 `variant` attribute 中
  删除，root 不再投影 `data-variant`；它只剩「收掉控制盒海拔」一件事，海拔退出后为空 API（未发布的
  checkbox-secondary-variant changeset 一并撤回）。方框是字段家族的控制盒（§8.3）：
  `--xh-checkbox-bg` 缺省由 `--xh-material-soft-bg` 改为 `--xh-bg-canvas`，删除顶光渐变、静息 `--xh-material-soft-shadow` 与
  悬停 `--xh-elevation-raised` 抬升（使用者槽 `--xh-checkbox-highlight` / `-shadow-hover` / `-shadow-pressed` /
  `-shadow-disabled` / `-shadow-readonly` 随之删除，`-shadow` 保留、缺省 `none`），悬停时未勾选方框描边由语气色改为
  `--xh-border-control-hover`（勾中方框悬停不换描边）；按下保留 0.97 缩放并补换底：未勾选换到 `--xh-bg-subtle-hover`（新增
  `--xh-checkbox-bg-pressed`），勾中 / 半选换到 `--xh-_tone-active`（缺省 `--xh-bg-brand-active`，新增
  `--xh-checkbox-bg-checked-pressed`），按压选择器改 `:is(:active, [data-pressed])`；禁用不再只降 opacity，改为
  `--xh-border-default` 描边 + `--xh-bg-subtle` 底 + `--xh-fg-disabled` 字形（新增 `--xh-checkbox-bg-disabled` /
  `-border-disabled` / `-fg-disabled`），勾中的禁用方框同样退回中性面、勾由置灰色画出；禁用标签色
  `--xh-checkbox-label-fg-disabled` 缺省由 `--xh-fg-disabled` 改为 `--xh-fg-subtle`（§6.4 禁用标签统一）。标签文字保持随
  size 档取 `--xh-control-font-*`（与 checkbox-group 条目同一把尺）。示例 `checkbox/03-tone` 由变体改为语气六档。

  **switch 滑块改 raised 抬起面，按下补换底，禁用改中性面，标签字号随档。** 滑块是可拖起部件（§5.3，逐部件登记 raised）：
  `--xh-switch-thumb` 缺省由 `--xh-material-soft-bg` 改为 `--xh-bg-surface-raised`，`--xh-switch-thumb-border` 缺省由
  `--xh-material-soft-border` 改为 `--xh-border-default`，`--xh-switch-thumb-shadow` 缺省由 `--xh-material-soft-shadow` 改为
  `--xh-elevation-raised`，`--xh-switch-thumb-fg` 缺省改 `--xh-fg-default`；删除顶光渐变（`--xh-switch-thumb-highlight` 随之删除）
  与悬停抬升规则（静息即 raised，`--xh-switch-thumb-shadow-hover` 随之删除）。轨道是定尺控件（§9.1）：按下保留 0.97 缩放并补
  换底——未选中轨道静息已是 `--xh-bg-subtle-active`（300），中性阶梯无更深一档，按下缺省仍取轨道面（新增
  `--xh-switch-bg-pressed`，换面通道由滑块拉伸与压平投影承担），选中轨道换到 `--xh-_tone-active`（缺省 `--xh-bg-brand-active`，
  新增 `--xh-switch-bg-checked-pressed`），按压选择器改 `:is(:active, [data-pressed])`，高对比档按下把轨道 outline 换成
  Highlight。禁用不再只降 opacity：轨道改 `--xh-bg-subtle` 底 + `--xh-border-default` 内描边 + `--xh-fg-disabled` 前景（新增
  `--xh-switch-bg-disabled` / `-border-disabled` / `-fg-disabled`），滑块前景置灰（新增 `--xh-switch-thumb-fg-disabled`），
  选中的禁用轨道同样退回中性面、值由滑块位置读出。只读选中轨道 `--xh-switch-bg-checked-readonly` 缺省由 `--xh-bg-muted` 改为
  `--xh-bg-subtle-active`（与未选中轨道同一中性面，§7.2 交互态的底只从语义面派生）；焦点环改为除禁用外一律灌 currentColor。
  加载环圆角由 `--xh-shape-pill` 改为 `--xh-shape-circle`（正方盒取 circle，像素不变）。标签：
  `--xh-switch-label-font-size` 缺省由 `--xh-text-label-size` 改为随 size 档的 `--xh-control-font-sm / md / lg`（与 checkbox
  标签同形），新增 `--xh-switch-label-leading`（缺省 `--xh-leading-normal`，长文字可换行），禁用标签色
  `--xh-switch-label-fg-disabled` 缺省由 `--xh-fg-disabled` 改为 `--xh-fg-subtle`。

  **calendar-picker 今天改品牌环，格子与钮的阶梯按白底承载分档，按下补换底，年网格滚动链改 auto。** 今天退出品牌淡底
  （§7.3）：`--xh-calendar-picker-today-bg` 缺省由 `--xh-bg-brand-subtle` 改为 `transparent`，`--xh-calendar-picker-today-border`
  缺省由 `transparent` 改为 `--xh-fg-brand`（格子自带的 1px 透明边位画成品牌环），品牌字保留；今天的悬停不再另给品牌淡底
  （`--xh-calendar-picker-today-bg-hover` 删除），走普通格子的阶梯。格子、四颗翻页钮与标题钮坐在日历的白底上：悬停由
  `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100），按下保留 0.97 缩放并补换底到 `--xh-bg-subtle-hover`（200，新增
  `--xh-calendar-picker-cell-bg-pressed` / `-nav-bg-pressed` / `-heading-trigger-bg-pressed`），选中格按下由 `--xh-bg-brand-hover`
  改为 `--xh-bg-brand-active`（§7.3 格状当前 pressed），按压选择器改 `:is(:active, [data-pressed])`，高对比档按下把边换成
  Highlight。不可用又选中的格由 `--xh-bg-muted` 改为 `--xh-bg-subtle` + `--xh-fg-disabled`（新增
  `--xh-calendar-picker-cell-bg-selected-disabled`）。快速选年的网格是页内结构容器（§6.6），删除
  `overscroll-behavior: contain`（嵌进 date-picker 浮层时由那份皮肤补）。翻页钮里的字形 `--xh-calendar-picker-icon-size` 缺省由
  `--xh-glyph-size-text` 改为 sm 档 `--xh-glyph-size-sm`（钮是 `--xh-control-h-sm` 见方的图标钮，§6.5）。

  **calendar-range-picker 今天改品牌环，格子与钮的阶梯按承载面分档，按下补换底，年网格滚动链改 auto。** 与 calendar-picker
  同构：`--xh-calendar-range-picker-today-bg` 缺省由 `--xh-bg-brand-subtle` 改为 `transparent`、`-today-border` 缺省由
  `transparent` 改为 `--xh-fg-brand`，今天的悬停不再另给品牌淡底（`-today-bg-hover` 删除），落在区间里的今天不再单独写透明底
  （环压在淡色带上）；格子、翻页钮与标题钮悬停 200 → 100、按下补换底 200 并保留缩放（新增 `-cell-bg-pressed` /
  `-nav-bg-pressed` / `-heading-trigger-bg-pressed`），端点按下由 `--xh-bg-brand-hover` 改为 `--xh-bg-brand-active`；区间中段的
  格坐在品牌淡底的轨道上，补悬停 `--xh-bg-brand-subtle-hover`（20%）与按下 `--xh-bg-brand-subtle-active`（28%，新增
  `-range-cell-bg-hover` / `-range-cell-bg-pressed`，§7.3 页内选中的叠加态）；按压选择器改 `:is(:active, [data-pressed])`，高对比档
  按下把边换成 Highlight；不可用又选中的格由 `--xh-bg-muted` 改为 `--xh-bg-subtle`（新增 `-cell-bg-selected-disabled`）；年网格删除
  `overscroll-behavior: contain`；翻页钮字形缺省改 `--xh-glyph-size-sm`。两份日历的日期格基础块、今天、选中、悬停与按下自此由
  check-family-parity 的「日历族」钉住同源。

  **pagination 四类格子接入 Action Control text 档，当前页经桥接槽画，面板补滚动隔离。** 上一页 / 下一页 / 页码 /
  省略位由 Headless 投影 `data-xh-action-control` + `data-xh-action-profile='text'` + `data-xh-action-variant='ghost'` +
  `data-xh-action-size`，盒型、三档几何、悬停 / 按下 / 禁用面、按压缩放与过渡改由家族配方给（§7.2 缺省中性；§9.1
  0.97 缩放并换底）：非当前页悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100）、按下由 `--xh-bg-subtle-active`
  （300）改为 `--xh-bg-subtle-hover`（200，画布承载阶梯）；使用者槽 `--xh-pagination-item-bg / -bg-hover / -bg-active / -fg / -item-h / -item-px / -item-min-size / -item-radius / -font-size` 改为映射到 `--xh-action-*` 桥接槽，名字与语义不变。当前页
  （§7.3 格状当前）三态与描边、顶高光改经桥接槽交给家族画（`--xh-pagination-item-shadow` 缺省由顶高光改为 `none`，高光
  走家族的 highlight 通道），环色改经 `--xh-action-ring-color-focus-visible` 灌 `currentColor`；省略位三态都压
  `--xh-pagination-ellipsis-trigger-fg`。摊开的页码面板补 `overscroll-behavior: contain`（浮层滚动面，§6.6），三端自绘条改传
  `size: 'sm'`（浮层 4px 档）。`--xh-pagination-icon-size` 缺省由 `--xh-glyph-size-text` 改为随档的 `--xh-glyph-size-sm / md / lg`
  （§6.5）。三端 computed 快照里格子多出家族给的 `gap`（单子节点，像素不变）与 `transition-property`。

  **file-upload 文件条目与禁用投放区的外边改 `--xh-border-default`。** `--xh-file-upload-item-border` 缺省由
  `--xh-border-subtle` 改为 `--xh-border-default`：条目是 `--xh-bg-surface` 底上带四边描边的列表卡面，§8.3 规定
  `--xh-border-subtle` 只作内部分隔线，根面外边一律 `--xh-border-default`。禁用的投放区外边同样由 `--xh-border-subtle`
  改为 `--xh-border-default`（§7.2 第 9 条：disabled = `--xh-border-default` + `--xh-bg-subtle` + `--xh-fg-disabled`，
  与独立 Checkbox / Switch 的禁用边一致）。

  **steps 禁用步骤的指示器描边改 `--xh-border-default`。** `--xh-steps-indicator-border-disabled` 缺省由 `--xh-border-subtle`
  改为 `--xh-border-default`（§7.2 第 9 条：disabled 外边一律 `--xh-border-default`，与独立 Checkbox / Switch 的禁用边一致；
  `--xh-border-subtle` 只作内部分隔线）。

  **tag 禁用标签的描边改 `--xh-border-default`。** `--xh-tag-border-disabled` 缺省由 `--xh-border-subtle` 改为
  `--xh-border-default`（§7.2 第 9 条：disabled 外边一律 `--xh-border-default`；`--xh-border-subtle` 只作内部分隔线）。

  **table 三颗勾选框的禁用描边改 `--xh-border-default`。** select-all-trigger / column-visibility-trigger / row-select-trigger
  禁用时的 `border-color` 由 `--xh-border-subtle` 改为 `--xh-border-default`（§7.2 第 9 条，与独立 Checkbox 的禁用边一致）。

  **transfer 内嵌勾选框的禁用描边改 `--xh-border-default`。** `--xh-transfer-checkbox-border-disabled` 缺省由 `--xh-border-subtle`
  改为 `--xh-border-default`（§7.2 第 9 条，与独立 Checkbox 的禁用边一致；`--xh-border-subtle` 只作内部分隔线）。

  **tree 内嵌勾选框的禁用描边改 `--xh-border-default`。** `--xh-tree-checkbox-border-disabled` 缺省由 `--xh-border-subtle`
  改为 `--xh-border-default`（§7.2 第 9 条，与独立 Checkbox 的禁用边一致；`--xh-border-subtle` 只作内部分隔线）。

  **color-picker 面板改 floating 实体面，自绘条走浮层 4px 档。** content 是取色面域 + 色相 / 透明度滑杆 + 通道输入的
  表单型多列面板，按 §8.4「含网格或多列的锚定面板 → floating」由 frosted 改为 floating：`--xh-color-picker-content-border`
  缺省由 `--xh-material-frosted-border` 改为 `--xh-border-default`、`-content-bg` 由 `--xh-material-frosted-bg` 改为
  `--xh-bg-surface`、`-content-fg` 由 `--xh-material-frosted-fg` 改为 `--xh-fg-default`、`-content-shadow` 由
  `--xh-material-frosted-shadow` 改为 `--xh-elevation-floating`；不再透景、不再画顶部边界光，`--xh-color-picker-content-backdrop`
  与 `--xh-color-picker-content-highlight` 两个槽删除。面板补 `overscroll-behavior: contain`（浮层滚动面，§6.6），三端自绘条
  改传 `size: 'sm'`（浮层 4px 档）。

  **checkbox 方框接入 Action Control icon 档。** root 由 Headless 投影 `data-xh-action-control` + `data-xh-action-profile='icon'` +
  `data-xh-action-variant='outline'` + `data-xh-action-display='always'` + `data-xh-action-size`（随 size，缺省 md），盒型、悬停 /
  按下 / 禁用面、0.97 缩放与换底、粗指针 44px 热区、焦点环与过渡改由家族配方给（§9.1「方框」）；边长仍按
  `--xh-control-indicator-sm / md / lg`（皮肤把 `--xh-action-visual-size` 钉在 16px 档），面按字段静息形态取值（canvas 底 +
  `--xh-border-control` 描边 + 无影，悬停只升描边、按下换到 200 档中性面，勾中按下换语气 active 档）。使用者槽
  `--xh-checkbox-bg / -bg-checked / -bg-pressed / -bg-checked-pressed / -bg-disabled / -border / -border-hover / -border-checked / -border-invalid / -border-disabled / -fg / -fg-disabled / -shadow / -radius` 名字与语义不变，改为映射到 `--xh-action-*`
  桥接槽。只读方框由映射钉回静息面：悬停不升描边、按下不缩放不换底。粗指针命中区改由家族 `::after` 外扩到 44px（此前皮肤自写
  14 / 16px 外扩）。三端 computed 快照里方框多出家族给的 `gap: 0`、控件字号 14px 与 `transition-property` 的 box-shadow / opacity。

  **switch 轨道接入 Action Control text 档。** root 由 Headless 投影 `data-xh-action-control` + `data-xh-action-profile='text'` +
  `data-xh-action-variant='outline'` + `data-xh-action-display='always'` + `data-xh-action-size`（随 size，缺省 md），按下 /
  禁用面、0.97 缩放与换底、粗指针 44px 热区、焦点环与过渡改由家族配方给（§9.1「轨道」）；轨道宽高仍按
  `--xh-switch-track-h-sm / md / lg` 算（皮肤钉 `--xh-action-visual-size` / `-min-inline-size`），边界仍由内描边经 shadow 通道画、
  border 宽度归零，滑块贴 inline-start（覆盖家族的居中排布）。悬停不换面（静息已是 300 档，阶梯只给按下）。使用者槽
  `--xh-switch-bg / -bg-checked / -bg-pressed / -bg-checked-pressed / -bg-checked-readonly / -bg-disabled / -border / -border-checked / -border-checked-readonly / -border-invalid / -border-disabled / -fg / -fg-checked / -fg-checked-readonly / -fg-disabled / -radius` 名字与语义不变，改经私有槽映射到 `--xh-action-*` 桥接槽。只读与提交中的手型经
  `--xh-action-cursor-*` 给（只读另钉按下不缩放不换底）。forced-colors 下按住的轨道由家族按压块换 Highlight 底，皮肤删自写的
  outline 换色。三端 computed 快照里轨道的边色由描边色改为 transparent（宽度本就为 0）、控件字号 14px、过渡多出
  border-color / opacity。

  **rating 星接入 Action Control icon 档。** item 由 Headless 投影 `data-xh-action-control` + `data-xh-action-profile='icon'` +
  `data-xh-action-variant='ghost'` + `data-xh-action-display='always'` + `data-xh-action-size='xs'`（24px 正方盒，与此前
  `--xh-control-action-size` 同尺寸），按下 / 禁用面、0.97 缩放与换底、焦点环与过渡改由家族配方给（§9.1「星」）。静息透明；
  悬停不换底——悬停预览由点亮的星形（`data-highlighted`）表达，再给盒换面是重复的通道；按下换到 200 档中性面。使用者槽
  `--xh-rating-item-fg / -fg-highlighted / -bg-pressed / -radius / -font-size` 名字与语义不变，改为映射到 `--xh-action-*` 桥接槽；
  只读由映射钉回静息面（不缩放、不换底、手型 default）。粗指针下星本身不外扩热区（五颗星密排，44px 热区会压住相邻的星并让
  半颗判定串到邻星），家族 icon 档 `::after` 的 44px 下限在本皮肤归零。forced-colors 下家族把悬停 / 按下的盒填成
  Highlight，会吞掉同为 Highlight 的点亮星形：皮肤把盒钉回 Canvas 底，字色仍按点亮与否取 GrayText / Highlight，按住画一圈
  Highlight 内环。三端 computed 快照里星多出家族的 1px 透明描边与 `gap: 0`，`color` 不再在过渡列表里（作者图标的点亮换色
  改为即时；皮肤字形的点亮仍走 `::after` 的 clip-path 过渡）。皮肤体积基线 rating.css 6675 → 7907，涨在桥接槽映射与
  forced-colors 补救。

  **steps 触发器接入 Action Control row 档，序号圆点改读宿主 host 槽换面。** trigger 由 Headless 投影 `data-xh-action-control` +
  `data-xh-action-profile=row` + `data-xh-action-variant=ghost` + `data-xh-action-display=always` +
  `data-xh-action-size`（随 `size`，缺省 md）：序号 + 标题 + 说明的整块内容行按 §9.2 归行级，悬停 / 按下 / 禁用面、手型、过渡与
  焦点环改由家族给，按下只换面不缩放；悬停 / 按下面改经桥接槽（`--xh-steps-trigger-bg-hover / -bg-pressed` 名字与缺省不变：
  坐画布走 100 → 200）。圆点是格状当前的标记（§7.3），但不是激活宿主，不投影配方：trigger 以 `--xh-action-host-bg-hover / -pressed`
  向内声明自己是圆点的承载面（圆点静息就坐在 `--xh-bg-subtle` 上，阶梯 100 → 200 → 300），圆点在 trigger 的悬停 / 按压选择器下
  读 host 槽的同一来源换面：悬停 200（`--xh-steps-indicator-bg-hover / -bg-completed-hover` 缺省来源改为喂给 host 槽的私有槽
  `--xh-_steps-host-bg-hover`）、按下 300（`--xh-steps-indicator-bg-pressed`，缺省来源 `--xh-_steps-host-bg-pressed`），当前步按下
  换语气 active 档（`--xh-steps-indicator-bg-current-pressed`，缺省 `--xh-_tone-active` / `--xh-bg-brand-active`），不缩放。
  三端 computed 快照里 trigger 多出家族的过渡列表、`user-select: none` 与透明描边色位。

  **table 四颗把手接入 Action Control icon 档，排序把手接入 row 档。** select-all-trigger / row-select-trigger /
  column-visibility-trigger 由 Headless 投影 `data-xh-action-control` + `data-xh-action-profile='icon'` +
  `data-xh-action-variant='outline'`，expand-trigger 投 `ghost`，sort-trigger 投 `row` + `ghost`；五者都带
  `data-xh-action-display='always'` 与 `data-xh-action-size`（随 size，缺省 md）。四颗把手的盒型、按下 / 禁用面、0.97 缩放与换底、
  焦点环与过渡改由家族配方给（§9.1「方框」），边长仍钉在 `--xh-control-indicator-size`；三颗勾选框按字段静息形态取值
  （空框由透明底改为 `--xh-bg-canvas` 底 + `--xh-border-control` 描边，与独立 Checkbox 同值），勾中实心品牌面按下派生
  `--xh-bg-brand-active`；禁用底由 `--xh-bg-muted` 改为 `--xh-bg-subtle`（§7.2 第 9 条）。排序把手按表头 host 槽下发的淡底阶梯
  悬停 200 / 按下 300 只换面不缩放，内距与最小高度归零（列头自己已给）；不可排序列的把手手型改为 not-allowed（家族禁用面）。
  使用者槽 `--xh-table-trigger-size / -radius / -bg-pressed / -bg-checked / -bg-checked-pressed / -border / -border-checked / -fg / -expand-fg / -sort-bg-hover / -sort-bg-pressed / -sort-gap` 名字与语义不变，改为映射到 `--xh-action-*` 桥接槽。
  粗指针下四颗把手不外扩热区（coarse-target 登记的密排存量），家族 `::after` 的 44px 下限在本皮肤归零；排序箭头字形的
  `::after` 钉回行内位置。三端 computed 快照里把手多出家族的 1px 透明描边（展开箭头）、`gap: 0`、`line-height` 与过渡列表。

  **transfer 全选格接入 Action Control text 档。** select-all-trigger 由 Headless 投影 `data-xh-action-control` +
  `data-xh-action-profile='text'` + `data-xh-action-variant='ghost'` + `data-xh-action-display='always'` +
  `data-xh-action-size='xs'`：它是「方框 + 文案」的整行命中区（§9.2），悬停 / 按下 / 禁用面与过渡改由家族配方给
  （白底承载 hover 100 → pressed 200），按下只换面不缩放；盒随内容收宽、高度由内容高改为 xs 档的 24px 命中地板
  （16px 方框居中其间），text 档的内距与最小宽度归零。使用者槽 `--xh-transfer-select-all-gap / -radius / -bg-hover / -bg-pressed / -fg / -font-size` 名字与语义不变，改为映射到 `--xh-action-*` 桥接槽。三端 computed 快照里全选格多出家族的
  1px 透明描边与过渡列表。

  **calendar-picker 翻页钮、标题钮与日期格接入 Action Control。** prev-year / prev / next / next-year 四颗方向钮由 Headless 投影
  `data-xh-action-control` + `data-xh-action-profile='icon'` + `data-xh-action-variant='ghost'` + `data-xh-action-size='sm'`
  （32px 正方盒），heading-year / heading-month 两颗标题钮与 cell-trigger 投 `text` + `ghost` + `sm`，都带
  `data-xh-action-display='always'`；悬停 / 按下 / 禁用面、0.97 缩放与换底、焦点环与过渡改由家族配方给（§9.1「日期翻页按钮、日历格」；
  §4.1 格状当前）。日期格几何仍由网格给（家族的固定高归 auto，宽由等分轨道、高按 aspect-ratio），今天 / 选中 / 邻月 / 不可用
  经三支私有槽或桥接槽三态换值；标题钮悬停只换字色不换底，到顶那层手型 default 且不换面；只读日视图的格手型 default。
  使用者槽 `--xh-calendar-picker-nav-size / -nav-radius / -nav-bg / -nav-bg-hover / -nav-bg-pressed / -nav-fg / -nav-fg-hover / -heading-trigger-px / -heading-trigger-radius / -heading-trigger-bg-pressed / -heading-trigger-fg-hover / -heading-fg / -heading-font-size / -cell-size / -cell-radius / -cell-bg-hover / -cell-bg-pressed / -cell-fg / -cell-fg-outside / -cell-font-size / -today-bg / -today-border / -today-fg / -cell-bg-selected / -cell-bg-selected-active / -cell-bg-selected-disabled / -cell-fg-selected`
  名字与语义不变，改为映射到 `--xh-action-*` 桥接槽。粗指针下铺满整格的命中区 `::after` 钉回原几何（家族 text 档用它扩热区）。
  三端 computed 快照里方向钮的 UA 内距 6px 归 0、字号取 sm 档 13px、过渡列表随家族。

  **calendar-range-picker 翻页钮、标题钮与日期格接入 Action Control。** 与 calendar-picker 同构：四颗方向钮投 icon ghost sm、
  两颗标题钮与 cell-trigger 投 text ghost sm。区间中段的格经私有槽把悬停 / 按下换到品牌淡底阶梯（20% / 28%，§7.3 页内选中的
  叠加态），区间两端与单选的选中格重写桥接槽三态（实心品牌、按下 brand-active），邻月的区间格钉回透明底与透明边，不可用格映射
  置灰字与置灰底，只读日视图的格手型 default。使用者槽名字与语义不变，改为映射到 `--xh-action-*` 桥接槽；
  check-family-parity 的「日历族」改比日期格基础块、今天换的三支私有槽与选中格重写的桥接槽（两份皮肤不再各写 :hover / :active）。
  三端 computed 快照里方向钮的 UA 内距归 0、字号取 sm 档、过渡列表随家族。

  **checkbox-group 条目与全选格接入 Action Control row 档，方框改读宿主桥接槽换面、不再缩放。** item 与 select-all-trigger 由
  Headless 投影 `data-xh-action-control` + `data-xh-action-profile='row'` + `data-xh-action-variant='ghost'` +
  `data-xh-action-display='always'` + `data-xh-action-size='xs'`：整行是「方框 + 文案」的行级命中区（§9.2），悬停 / 按下 / 禁用面、
  手型、过渡与焦点环由家族给，按下只换面不缩放；行自己坐画布走 hover 100 → pressed 200（新增使用者槽
  `--xh-checkbox-group-item-bg-hover / -bg-pressed`、`--xh-checkbox-group-select-all-trigger-bg-hover / -bg-pressed`，缺省
  `--xh-bg-subtle` / `--xh-bg-subtle-hover`），同时以 `--xh-action-host-bg-hover / -pressed` 向内声明自己是方框的承载面
  （200 / 300）。方框（indicator 与全选格的 `::before`）不投影配方，在宿主的悬停 / 按压选择器下读宿主 host 槽的同一来源换面：
  按下由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle-active`（300，`--xh-checkbox-group-indicator-bg-pressed` 的缺省来源改为
  喂给 host 槽的私有槽 `--xh-_checkbox-group-host-bg-pressed`），勾中 / 半选按下仍换语气 active 档，不再 0.97 缩放（过渡列表去掉
  `scale`）。条目行高由 16px 变为 xs 档的 24px 命中地板（方框居中其间），组的纵向节奏每项多 8px；只读时从槽上收回整行的悬停 /
  按下面与手型；粗指针下家族 44px 热区归零（条目密排，热区会压进相邻条目）。三端 computed 快照里 item / select-all-trigger 多出
  家族的过渡列表与 `min-height: 24px`，描边色位归透明。皮肤体积基线 checkbox-group.css 11448 → 13421，涨在桥接槽映射。

  **radio-group 条目接入 Action Control row 档，圆圈改读宿主桥接槽换面、与 checkbox-group 逐档一致。** item 由 Headless 投影
  `data-xh-action-control` + `data-xh-action-profile='row'` + `data-xh-action-variant='ghost'` + `data-xh-action-display='always'` +
  `data-xh-action-size='xs'`：整行是「圆圈 + 文案」的行级命中区（§9.2），悬停 / 按下 / 禁用面、手型、过渡与焦点环由家族给，按下只换面
  不缩放；行自己坐画布走 hover 100 → pressed 200（新增使用者槽 `--xh-radio-group-item-bg-hover / -bg-pressed`，缺省 `--xh-bg-subtle` /
  `--xh-bg-subtle-hover`），同时以 `--xh-action-host-bg-hover / -pressed` 向内声明自己是圆圈的承载面（200 / 300）。圆圈不投影配方，在宿主的
  按压选择器下读宿主 host 槽的同一来源换面：按下由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle-active`（300，
  `--xh-radio-group-indicator-bg-pressed` 的缺省来源改为喂给 host 槽的私有槽 `--xh-_radio-group-host-bg-pressed`）；选中圈的描边保住，
  按下换的是圆点（新增 `--xh-radio-group-indicator-dot-pressed`，缺省语气 active / `--xh-bg-brand-active`，与 checkbox-group 勾中方框按下同档）；
  禁用圆圈补上与独立 checkbox 同档的面（新增 `--xh-radio-group-indicator-border-disabled` / `-bg-disabled` / `-dot-disabled`，缺省
  `--xh-border-default` / `--xh-bg-subtle` / `--xh-fg-disabled`），此前禁用只置灰文字、圆圈不变。条目行高由 16px 变为 xs 档的 24px 命中地板
  （圆圈居中其间），组的纵向节奏每项多 8px；只读时从槽上收回整行的悬停 / 按下面与手型；粗指针下家族 44px 热区归零（条目密排）。
  三端 computed 快照里 item 多出家族的过渡列表与 `min-height: 24px`，描边色位归透明。皮肤体积基线 radio-group.css 5328 → 7313，涨在桥接槽映射。

### Minor Changes

- 3c49382: 建立由单一 JSON 真源生成的 Action Control Family Recipe，统一普通文字动作、icon-only / close、字段内嵌控制与浮动动作四种 profile 的 xs/sm/md/lg 视觉盒、状态、显示策略、逻辑方向和输入能力规则。

  Button 首批迁入该配方：Headless 只投影 `data-xh-action-*` 稳定视觉角色，皮肤保留既有 variant / tone / size / shape 和公开覆盖槽；粗指针下文字动作仅扩块轴，方形动作双轴保持至少 44px，forced-colors 与 reduced-motion 分别复用系统色和全局动效语义令牌。

- 004988f: **Action Control 家族配方增加形态颜色矩阵、承载面阶梯与行级 profile。** 配方 JSON 升到 version 2：
  solid / subtle / outline / ghost 四种形态 × rest / hover / pressed / focus-visible / disabled / loading
  六态的底色、前景、描边由 `data-xh-action-variant` 在家族层统一给出，无属性时等价 subtle。既有消费者
  （button、toggle、clipboard、download-trigger、text-field、color-field）在没有 `data-tone` 的上下文里
  零视觉变化；家族缺省从裸 `--xh-bg-subtle` / `--xh-fg-default` 改为 `--xh-_tone-subtle` / `--xh-_tone-fg`
  链之后，消费者皮肤没有设满的桥接槽在写了 `data-tone` 时会从中性面改取语气色：button 的 subtle /
  outline / ghost 形态在 focus-visible 与 loading 态的底改为语气 12% 淡底、前景改为语气前景；text-field /
  color-field 传了 `tone` 时清空钮 pressed 态的前景、focus-visible 态的底与前景同样改为语气色。这几档
  随各消费者迁入配方形态矩阵的提交收口。ghost / outline 的悬停与按下面改按承载面取阶梯——画布承载
  100 → 200，容器可用 `--xh-action-host-bg-hover` / `--xh-action-host-bg-pressed` 下发淡底承载的
  200 → 300；深色主题品牌实心面上收进家族；新增 `row` 与 `disclosure-trigger` 两个铺满宽度、只换面不缩放
  的 profile（新增桥接槽 `--xh-action-padding-block`）。生成物 `family/action-control.css` 与
  `index.unlayered.css` 同步再生成。
- fa08fb4: **动作与触发族补能力：三轴铺齐、两个 group 补分隔线与组级禁用、剪贴板补禁用与播报区、按钮补圆角档与标签选择。** 纯新增，公开面一个名字都没删。

  **三轴铺齐。** `toggle-group` 是全族唯一「有 tone 没 variant」的一件，现在补上 `variant`：四档与 `toggle` 一处对一处——未选中那些段的壳与选中那一段用哪一档底都由它定，切换仍由 `data-state='on'` 一条完成。`float-button` 补 `variant` / `tone` / `size`（尺寸缺省与 `lg` 同档，悬浮钮起步就比行内按钮大一号），`back-top` 补 `variant`，`download-trigger` 与 `clipboard` 补 `variant` / `tone` / `size`。五份皮肤同批把颜色改成「使用者令牌 → 私有槽 → 语义令牌」三级：使用者令牌排在形态之前，没写 `data-variant` 时逐值与从前相同。`float-button` 的前景这一支顺带接上语气槽，与 `back-top` 补齐；两颗角落浮钮的按钮块现在逐条同形，`check-family-parity` 立了「角落浮钮族」把它钉住。

  **两个 group。** `button-group` 与 `toggle-group` 各补一个可选的 `separator` 部件（`aria-hidden`，朝向是这条线自己的，与组的排布相反）与 `fullWidth`。`toggle-group` 另补 `hidden-input` 表单出口与 `name`，机器认 `FORM.RESET`，`check-form-reset` 的分母里因此多了一件。插了分隔线之后首末两段不再是 root 的首末子节点，圆角另按元素类型认一遍（条目是原生 `button`，分隔线不是），没有分隔线时与从前逐值相同。

  **组级禁用是真禁用。** `button-group` 补 `disabled`：Vue 侧经注入让组内每颗 `XhButton` 拿到原生 `disabled`，Web Components 侧把 `disabled` 写到组根的每个直接子节点上（作者自己声明的那一份按元素记住首见值，解禁时解得开）。只打 `data-*` 是假禁用——段照样可聚焦、照样派 click。

  **`toggle` 与 `button`。** `toggle` 补 `iconOnly` / `fullWidth` 与三档 `--xh-icon-size`，同一枚图标放进 `button` 与 `toggle` 直径终于一样。`button` 补 `shape`（`rounded` / `pill` / `square`，只换圆角这一个私有槽，不写进尺寸档）与 `as`（`button` / `a`，写成 `a` 时不再产出 `type` 与原生 `disabled`，禁用改由 `aria-disabled` 表达、点击仍被拦下），官方示例里那份「往 `<a>` 上手抄 `data-scope` / `data-part`」的写法可以退休了。

  **`clipboard` 与 `download-trigger`。** `clipboard` 补 `disabled`（守卫在机器层，作者调 `api.copy()` 也绕不过去）、`copy-trigger` 的 `indicator` 补上 `aria-hidden`，并新增一个可选的 `status` 部件：`role="status"` + `aria-live="polite"` 的视觉隐藏播报区，不给内容时念 `translations.copied`——在这之前，复制成功对读屏用户是零反馈。`ClipboardTranslations` 与 `DownloadTriggerTranslations` 从空接口立起来（`copy` / `copied`、`trigger`），两处的可及名都只在作者给了文案时才产出，不凭空盖掉按钮上的可见文字。`download-trigger` 另补兜底字形，新增令牌 `--xh-glyph-mark-download`。

  体积：`clipboard.css` 5630 → 9144 字节、`download-trigger.css` 3143 → 6914 字节，涨的全是四档形态与两档尺寸的槽赋值，与 `button.css` 同形。

- fa08fb4: **AI 与流式族补七项能力，全部是加法：不写新 prop 的既有用法逐值不变。**

  **`tool-call` 补形态轴 `variant`**（`outline` / `subtle` / `ghost`，缺省 `outline`）。三档与 `reasoning` 逐条同形——两件本来就共用一台机器，此前只有 `reasoning` 有形态轴，把两件并排放，一件能收成无壳内联、另一件永远自带一张抬起的面。`ghost` 供卡中卡用：嵌在 `message-feed` 的一条消息里时不再自带投影与描边。海拔改经私有槽 `--xh-_tool-call-shadow` 走，语气档那条 `box-shadow` 一并改读它，缺省档与语气档的计算值不变。

  **`tool-call` 补 `data-settled` / `data-errored` 两位布尔**（落根，配套只读 api 字段 `settled` / `errored` 与纯函数 `isToolCallSettled` / `isToolCallErrored`）。根上的 `data-state` 被开合占着，阶段此前只发在下面八个部件上，作者只渲根节点时选不中「跑完了」「跑砸了」。出错换描边色那条规则现在两条并列：`[data-errored]` 与原来的 `:has([data-state='output-error'])`。

  **`approval` 补形态轴 `variant`**（同三档，缺省 `outline`）。两档排在「判过了描边退回中性」那条之后，`subtle` / `ghost` 的透明描边不会被它按同等特指度盖回来。

  **`log` 补尺寸轴 `size`**（三档，缺省档逐值等于 `md`）。全族此前 8 件有档、只有它没有。三档只改行文字号（`--xh-_log-font-size`）与内衬（`--xh-_log-content-px`）两个私有槽；**行高不入档**——视口按 `rows` 定高读的是同一个基准，三档同值才对得上整数行。

  **`log` 补 `data-level`**（`debug` / `info` / `warn` / `error`）。Vue 侧是 `XhLogLine` 的 `level` prop，Web Components 侧是 line 角色节点上的 `level` 属性；不写就不落属性，行走内容层的前景色。新增 4 个使用者覆盖槽：`--xh-log-level-debug-fg` / `-info-fg` / `-warn-fg` / `-error-fg`。级别只染颜色不动排版——四档必须等高。官方示例 `05-levels` 两版随之改成走这一位，手写的行内级别色删掉。

  **`markdown-stream` 的 `announce` 补 `'assertive'` 一档**，与 `approval` 的 `live` 对齐。这一档下播报区换成 `role="alert"` + `aria-live="assertive"`；`off`（缺省）与 `polite` 两档一字未动。

  **`prompt-input` 新增 1 个公开只读槽 `--xh-prompt-input-computed-px`**：整框内衬的当前值，随尺寸档与 `--xh-prompt-input-p` 一起变。附件条与动作行由作者写在 root 里、不是本组件的部件，此前只能靠猜才对得齐那条内衬线。

- 262f119: AI 组件族八件统一补齐动效、表面语言与几处真实能力缺口。全部纯增量，没有删名或改名。

  **动效**

  - 卡片进场：`approval` / `tool-call` / `message-feed` 的条目与回到底部按钮都有了淡入上移的进场。
  - 折叠开合：`tool-call` 与 `reasoning` 的详情区改为行高与内缩同帧动的展开收起，收起在动画播完之后才真正落成，退场窗口内由 `inert` 挡住读屏与 Tab 序；折叠指示器的转向与它同一档时长同一条曲线。
  - 位移与高度类动画统一走新的 `--xh-motion-ease-enter-strong`，微交互仍走 `--xh-motion-ease-enter`。
  - 「正在跑 / 正在想」有了表达：`tool-call` 的状态文字与 `reasoning` 的标题会扫一道光，减少动效偏好下自动换回平色。
  - `markdown-stream` 的光标改成等第一个字时闪、开始出字后淡入一次并停在实心；块列表还空着时光标落在根上，「请求已经发出去」第一帧就看得见。

  **表面**

  `approval` / `code-view` / `diff-view` / `tool-call` / `reasoning` / `prompt-input` 的卡面与输入壳统一接了一档静态海拔，各自留有 `--xh-<组件>-shadow` 覆盖槽；`code-view` 补上了此前完全没有的描边与卡片底色。

  **新增的部件与属性**

  - `tool-call`：`summary`（收起态也看得见这次查了什么、改了哪个文件）与 `duration` 两个部件，配 `startTime` / `endTime` 两个属性、`durationMs` 与纯函数 `toolCallDuration()`、文案键 `ranFor`。
  - `reasoning`：`icon` 部件、`variant` 属性（`outline` / `subtle` / `ghost`，`ghost` 是无壳内联形态）、`statusText`（此前声明了却从没被消费的三个文案键现在真的生效）与纯函数 `reasoningStatusText()`。
    自定义元素侧另有只读属性 `element.durationMs`，与 Vue 根插槽的同名字段对齐。
  - `approval`：`note`（附在判定上的自由文本）、`result`（判定落定后看得见的那一格）、`actions` 三个部件，配 `note` / `defaultNote` / `onNoteChange` 与 `ApprovalNoteChangeDetails`。
  - `diff-view`：`stat`（头部的增删统计位）与 `segment`（字级差异高亮）两个部件，配 `wrap` 属性与 `DiffViewSegment` / `DiffViewSegmentProps`。
  - `prompt-input`：可选的 `input-row` 部件——写了它，外壳翻成竖排、输入框与按钮收进这一行，上下两侧腾出来放附件条与工具行。
  - `markdown-stream`：`caret` 开关与 `data-caret` 落点。

  **修复**

  - `code-view` 的行号被语法数字色染成琥珀色（`--xh-code-view-number-fg` 一个名字被两处消费）。
  - `prompt-input` 发送按钮禁用态的字底对比度（浅色 1.96:1、深色 2.08:1）。
  - 八处按下缩放没有过渡，按下与松手都是硬切。
  - `code-view` 的 `<pre>` 挂着 `aria-labelledby` 却没有能承载可访问名的角色，属性无效；现在发 `role="group"`。
  - `message-feed` 的集合语义从最外层挪到直接包着条目的内容层：`role="feed"` 只认 `role="article"` 的子节点，而播报区与回到底部按钮都是最外层的孩子。最外层继续当唯一的 Tab 停靠点与键盘宿主。播报区不再发 `role="status"`，改用等价的 `aria-live` + `aria-atomic` 两条。
  - `approval` 的备注框在根内，组合输入法期间按 Escape 是收候选词框而不是拒绝，现在挡住了组合态。

- dc0d5ea: Anchor 链接接入 Collection Item 家族的 `nav` 语境：`getLinkProps` 投影 `data-xh-collection-item` / `data-xh-collection-size` / `data-xh-collection-context='nav'`，`getLinkTextProps` 投影 `data-xh-collection-slot='text'`。皮肤删掉手写的 `:hover`、按下与 `[data-current]` 规则及 forced-colors 按下块，改在链接基础规则里把 `--xh-anchor-*` 公开槽映射到家族桥接槽；取值不变：静息 `--xh-fg-muted` + regular，hover `--xh-bg-subtle`（100）+ `--xh-fg-default` → pressed `--xh-bg-subtle-hover`（200）只换面，当前节 `--xh-fg-brand-strong` + medium 并叠加 hover / pressed 面，2px 指示条仍是 list 上的滑动 indicator 部件。
- 2cca93c: Anchor 按设计真源归位导航当前页与阶梯：当前节字色缺省由 `--xh-fg-brand` 改 `--xh-fg-brand-strong`（`--xh-anchor-link-fg-current` 覆盖槽不变，语气组仍取语气文字档）；链接悬停由 `--xh-bg-subtle-hover` 改白底承载的 `--xh-bg-subtle`（100），新增按下面 `--xh-anchor-link-bg-pressed` 缺省 `--xh-bg-subtle-hover`（200），只换面不缩放，高对比档按住用系统高亮反色画回。
- 680e2dc: **锚点目录不放 `indicator` 部件时，当前那一节的链接自带一条静态指示线。**

  设计真源 §7.3 把 Tabs line / Anchor / NavigationMenu 归为同一类「透明面 + 2px 指示条」，标签页已经在没放部件时自画静态线，锚点此前没放部件就只剩品牌字色与字重。现在目录里没有 `indicator` 部件时，当前链接在自己的 `::after` 上画一条静态线：竖排贴链接的行向起始缘（与部件同一侧，`dir="rtl"` 随逻辑属性镜像）、横排贴底边，主轴两端各退 `--xh-space-1` 避开链接的圆角（链接为省略号收着 overflow，贴满会被切角），厚度 / 颜色 / 圆角读 `--xh-anchor-indicator-thickness` / `-color` / `-radius` 与部件同一组槽和缺省（`--xh-stroke-thick` / 语气色 / pill），不做动画；放了部件即收起，不会画出两条。部件骑在 list 的轨道上、静态线画在链接盒内，两者同侧、差一线宽；嵌套目录里子级链接的静态线随自己的缩进走。forced-colors 下静态线与部件同取 `Highlight`。

  `anchor.css` 因此从 4457 字节涨到 5329 字节（静态线三条规则、部件在场探测与 forced-colors 一段）。

- 19570ad: **`approval` 判定在途补上视觉，默认渲染会变。**

  **此前在途只有禁用那一档灰**，与「必选项没勾满、批不了」长得一模一样：用户按下批准，两颗钮同时变灰，看不出是系统正在想还是自己漏勾了什么，只会接着点。现在两颗钮那一行里转一枚圆环，与 `download-trigger`、`clipboard`、`popconfirm`、`switch` 的在途同形——在途在全库读起来是同一件事。圆环挂在这一行上而不是某一颗钮上：连接层只拿到「有一条判定在途」，拿不到是哪一颗按下的。

  **在途那一档不再置灰**：`[data-part='approve-trigger'][aria-disabled='true']` 这条置灰规则现在排除在途（`:not([data-loading])`），只留给「必选项没勾满」。在途时两颗钮保持原来的底色与对比度，按不动这件事由圆环与 `cursor: progress` 说；读屏那一侧照旧由 `aria-disabled` 与 `aria-busy` 说。

  减弱动效（系统偏好与作者打的 `data-motion="reduce"` 两条通道）下圆环停下并整圈换成虚线，静止的形状仍读得出「还没好」。

  **拒绝钮的「按不动」那一档改挂在 `:disabled` 上。** 它原先写在 `[aria-disabled='true']` 上，而拒绝钮那一位只在判定在途时为真——等于整条规则从来只在在途那一档生效，落定后的拒绝钮反而没有描边上的变化。`--xh-approval-deny-border-off` 与 `--xh-approval-deny-bg-off` 两个槽仍是这两句的入口，生效的时机从「在途」换成了「已落定」。

  圆环的直径取两颗钮那一档字号（`--xh-approval-action-font-size`）的 1em，不取整行继承来的字号——它的宿主是整行而不是某一颗钮，不锁字号画出来会比另外两家大一圈。改这个槽会同时改按钮文字与圆环。

  **新增 1 个使用者覆盖槽**：`--xh-approval-loading-duration`。

- e65c6a5: **新增** `approval` 组件：危险动作执行前的人在环闸门，Vue 与 Web Components 两侧同时可用。

  **超时一律按拒绝收口，这条由机器结构保证、不靠调用方守规矩**：判定的取值域只有批准与拒绝，`expired` 只是显示态；通往批准的转移全机只有一条且必过守卫；到点事件只声明在待决态上，迟到的定时事件落地即静默丢弃；拒绝那条路不吃挂起中、不吃必选项、不吃任何闸门。

  **缺省不给默认超时值**——替宿主定安全策略比不定更危险。时长非有限或非正数时一个计时器都不起、停在待决：既不当 0ms 立刻到期，也绝不当成无限期放行。

  勾选与判定是原子的：批准的载荷带着「批的是哪几项」。拆成两个组件等于让每个宿主自己接线并保证先后顺序，中间必然存在「已批准但范围还没同步」的窗口，而这正是安全闸门最不该有的东西。

  `requestId` 变了即重入待决并按新时长重起计时，**不替旧一轮补一次拒绝**——旧结果由宿主自己作废。「卸载即拒绝」默认关着：机理成立不等于默认值成立，列表换 key、路由切换、热更新任何一次重挂都会替用户发出他没做过的判定。

  待决时批准键用 `aria-disabled` 而不是原生 `disabled`，保住可聚焦、让读屏念得到为什么按不动；授权项是 `role=checkbox`，只认 `Space`；`Escape` 判为拒绝而不是「关闭」——本组件不提供不作答的出口。剩余时间对读屏隐藏，逐秒跳字进活区会不停打断。

  导出 `APPROVAL_DENY_SELECTOR` 供 `dialog` 的 `initialFocus` 用：配 `role="alertdialog"` 并关掉 `closeOnEscape`，浮层就只剩批准与拒绝两个出口。

- fc89b39: **`approval` 的动作行一行排不下就折行。**

  两颗钮的文案都不折行（`white-space: nowrap`），而这一行是靠右排的：排不下时溢出的是**行首那一侧**。那一侧的溢出既不产生横向滚动条、`scrollWidth` 也量不到它，那截按钮就那么漫到卡片外面去，看不全也点不着。

  实测：320px 视口里动作行的内容宽是 286px，换成带说明的动作名（「驳回并要求补充材料」152px + 「批准并通知申请人」138px + 8px 间距 = 298px）之后，行首那颗钮的左缘落在 5.0px，已经漫出卡片的内衬边（17.0px）；英文动作名（`Deny and request changes` + `Approve and notify`，204 + 156）更远，左缘落在 **−64.7px**——整颗钮有一大半在视口之外。现在这两种情形都折成两行，每颗钮各自靠右：中文那对的左缘回到 151.0px 与 165.0px，英文那对行首那颗回到 98.9px，都落在动作行（17.0px 起）之内。

  排得下时一像素没动：短文案（「拒绝」「批准」）在 320 / 375 / 768 三档仍是并排一行；上面那对中文动作名在 375px 下也仍是一行——折行只在真排不下时发生。判定在途时行首那枚圆环跟着一起折行，不会把钮挤出去。

  `gap` 的横竖两轴同取 `--xh-approval-footer-gap`，折行后的行间距因此与钮间距一致，没有新增槽。

  **够不着的那一档**：单颗钮自己就宽过整行时（实测 320px 视口里一颗 334px 的钮，左缘 −30.8px）折行救不回来——一行只放得下它一个。动作名不截断是有意的：闸门上的动作名截成「Deny and request ch…」比漫出去更危险。这一档要么由使用者缩短文案，要么把闸门放进更宽的壳里。

- fa08fb4: **控件下方那一行辅助文字同时只留一段。** 新增 `css/description.css`，`field` 与 `fieldset` 的根一旦带上 `data-invalid`，它们自己那段 `description` 收起，位置让给 `error-text`。两段原先会同时在场，辅助区撑成两行，同一行栅格里的字段高度跟着参差。

  只收视觉：说明的 id 仍挂在控件的 `aria-describedby` 上——直接被 `aria-describedby` 指到的节点，隐藏与否都计入可及描述，读屏两段照旧都念得到。

  限定到直接子节点，字段集无效时收起的是它自己那段说明，不是组内各字段的。scope 逐个列出而不写通配：`description` 这个部件名在提示、气泡、空状态、说明列表上指的是另一段文字。按需引入的人多引一份：`import '@xihan-ui/styles/description.css'`，位置排在组件皮肤之前。

  **表单：字段一被编辑，就清掉它身上那条来自库外的错误。** 服务端返回后经 `setFieldError` 写进来的错误、作者预置的 `defaultErrors`、受控 `errors` 里那些，本库的校验都不认识：`validateOn` 是 `submit` 时两次提交之间没有任何一条路径会重算它们，而 `validate` 与 `rules` 都没给的表单连提交那一路的整表替换也不发生——用户照着提示改完，错误还挂在原处。现在 `FIELD.SET` 会先把这一条清掉，受控档经 `onErrorsChange` 回传。

  校验自己算出来的那几条不动，仍由下一次校验负责收回：提交失败后接着打字，规则报的错照旧留在那里。禁用与只读两档整条 `FIELD.SET` 都吃掉，也就不清。

  **`dialog` 新增 `indicator` 部件。** 语气徽记此前只活在命令式服务的一个私有渲染函数里，声明式写 `<XhDialogRoot role="alertdialog">` 的人拿不到它。现在它是正式部件：Vue 侧 `XhDialogIndicator`、Web Components 侧 `data-part="indicator"`，两条路得到同一个东西。

  圆底与字形两层，圆底是节点自己、字形走 `:empty::before`，作者往里塞节点即整枚换掉。画哪枚字形跟着节点自己那份 `data-tone` 走：`success` 勾、`warning` 三角、`danger` 叉，其余为圆圈问号。颜色取语气层派生的淡底与前景档，新增使用者覆盖槽 `--xh-dialog-indicator-size`、`--xh-dialog-indicator-mark-size`、`--xh-dialog-indicator-radius`、`--xh-dialog-indicator-bg`、`--xh-dialog-indicator-fg`。

  `createDialogService` 的默认模板改渲这个部件，那枚徽记从此由皮肤画：节点位置与标签名都没变，变的是它不再自带内联样式，改为按 `[data-scope="dialog"][data-part="indicator"]` 取样式。

  覆盖槽名、部件名、props、事件与 `data-*` 取值一个没删也没改名。

- c9cf5c8: **BackTop 触发器接入 Action Control floating 档与按压通道。** 连接层的 trigger 新增稳定属性
  `data-xh-action-control` / `data-xh-action-profile="floating"` / `data-xh-action-display="always"` /
  `data-xh-action-size`（随 `size`，缺省 `md`）/ `data-xh-action-variant`（缺省 `outline`，只有 `solid` 才品牌
  实心），root 的 `data-variant` 不传时显式落 `outline`——缺省与显式 `variant="outline"` 从此是同一档，见下；
  机器新增按压通道，Space / Enter 与触屏按住期间 trigger 投影 `data-pressed`，键盘表新增 `back-top.kbd.press`。

  视觉默认变化：触发器直径由 `--xh-control-h-md` 36px 改为 floating 档 md 的 `--xh-control-box-lg` 48px
  （compact 44px；sm 40px、lg 56px），与 FloatButton 同档；图标由随文 1em 改为随档 24px（sm 20 / lg 32）；
  缺省磨砂面的悬停 / 按下由 200 / 300 档改为画布承载阶梯 `--xh-bg-subtle`（100）→ `--xh-bg-subtle-hover`
  （200），ghost 同。显式 `variant="outline"` 自身的观感也变了：迁移前它是磨砂底 + `--xh-_tone-border-control`
  （缺省 `--xh-border-control`，悬停升 `--xh-border-control-hover`）描边、无顶光无 backdrop，`tone` 作用在
  描边上；迁移后它与缺省合流为同一份 M2 磨砂面——描边取 `--xh-material-frosted-border`（悬停不变）、前景取
  `--xh-material-frosted-fg`、带顶光与 backdrop。`tone` 不再作用于 outline 的静息描边与前景，只在悬停 / 按下的底上仍走
  `--xh-_tone-subtle` 阶梯；要一支带语气的描边浮钮，用 `solid` / `subtle` 或写 `--xh-back-top-border`
  覆盖。文档「变体」示例随之去掉与 outline 重复的缺省项。
  皮肤删除触发器自写的盒型、尺寸块、四态面、hover / active / focus-surface 规则与粗指针命中区
  （改由家族配方给出），公开槽 `--xh-back-top-bg / -bg-hover / -bg-active / -fg / -border / -border-hover / -shadow / -radius / -size / -icon-size` 改为桥接到配方之前；`--xh-_back-top-size` 私有槽删除，root 上的
  `data-size` 保留为作者样式钩子（尺寸由触发器的 `data-xh-action-size` 承载）。

- d78f778: Badge 的 sm 档收成贴在图标按钮角上的小号角标：计数盒最小尺寸由 16px 改为 14px（12 + 2 的半阶补偿），字仍是刻度最小的 12px；三档最小尺寸现为 14 / 28 / 32px。
- bdf4028: **新增 `bar-code`（条形码）：一维码七种常用码制，三端同时可用。**

  `matrix-code` 管二维码，`bar-code` 管一维码：货号、运单号、序列号、零售商品码、外箱码这些要让扫描枪一枪读出的内容。`format` 选码制——`code128`（缺省，任意 ASCII；`gs1` 打开即 GS1-128，起始符后放 FNC1，内容里的 GS 编成变长 AI 之间的分隔）、`ean13` / `ean8` / `upca` / `upce`（定长数字，校验位不给就补上、给了就核对）、`itf14`（缺省带上下承载条）、`code39`（`checksum` 附 mod 43 校验字符）。编码器自写（ISO/IEC 15417 / 15420 / 16390 / 16388），Code 128 按 GS1 通用规范的规则自动切换 A / B / C 子集与 shift；每种码制都配了独立重写的解码器做回环。

  几何走一个 `<svg>`：全部条合成一条 `<path>`，人读文字（`text`，缺省印）每段一个 `<text>`，EAN / UPC 的数字逐位落在自己那格下面、守卫条按规范延长 5X。`barWidth` 是最窄条的像素宽，整张码等比放大；`height` 是条高；`margin` 是静区，缺省按码制的规范值。内容不合码制规则（字符不在字符集、位数不对、校验位对不上）或码制不认识时一根条都不铺，根落到 `error` 态并在 `error` 里说明——画一张扫出错内容的码比不画更坏。对当前码制没有意义的选项（`gs1` 给了非 code128、`checksum` 给了非 code39、`bearerBars` 给了非 itf14）往诊断通道报一条 `bar-code.option-ignored` 警告，按没给处理。

  皮肤 `bar-code.css`：条色与底色取固定档（`--xh-bar-code-fg` / `--xh-bar-code-bg`），深色主题下不反相；人读文字走等宽字体（`--xh-bar-code-font-family`）。自定义元素 `<xh-bar-code>` 作者只写一个空的 `<svg data-xh-part="root">`。

- 6444083: Breadcrumb 链接接入 Collection Item 家族的 `nav` 语境：`getLinkProps` 投影 `data-xh-collection-item` / `data-xh-collection-size` / `data-xh-collection-context='nav'`，当前页额外投影布尔属性 `data-xh-collection-terminal`（它同时带 `aria-disabled='true'`，不显式标会被家族禁用面吃掉；`aria-current='page'`、`aria-disabled`、`tabindex=-1` 与拦点击不变）。皮肤删掉手写的悬停、按下、`[data-current]` 规则与 forced-colors 按下块，改在链接基础规则里把 `--xh-breadcrumb-*` 公开槽映射到家族桥接槽；取值不变：静息 `--xh-fg-muted` + regular，hover `--xh-bg-subtle`（100）+ 随语气字色 → pressed `--xh-bg-subtle-hover`（200）只换面，当前页透明面 + `--xh-fg-default` + medium + cursor default，不响应 hover / pressed。
- a4f9de1: Breadcrumb 按设计真源归位链接阶梯：链接悬停由 `--xh-bg-subtle-hover` 改白底承载的 `--xh-bg-subtle`（100），新增按下面 `--xh-breadcrumb-link-bg-pressed` 缺省 `--xh-bg-subtle-hover`（200），只换面不缩放，高对比档按住用系统高亮反色画回；当前页仍保留 `--xh-fg-default` + medium 字重，不给悬停与按下反馈。 皮肤体积基线 4099 → 4553 字节：涨在链接按下面规则与高对比档的按住补救块。
- d51d182: **在途与只读两档补上视觉，默认渲染会变。**

  **在途（`download-trigger` 的 `preparing`、`clipboard` 的 `copying`）此前只换指针形状。** 触屏上没有指针：手指按下去到结果出来之间屏幕上什么都不变，用户只会接着点。两处现在各转一枚圆环，与 `popconfirm` 的确认钮、`switch` 的滑块同形——在途在全库读起来是同一件事。圆环是按钮里的一个 flex 项，按钮的起始边不动，只往后长一截。

  `clipboard` 那处顺带去掉了 `opacity: 0.7` 这个裸值：它既没有令牌也没有覆盖槽，改不动，深色档下压出来的灰还会掉到读不清。

  减弱动效（系统偏好与作者打的 `data-motion="reduce"` 两条通道）下圆环停下并整圈换成虚线，静止的形状仍读得出「还没好」。

  **`switch` 的只读态此前与可操作态完全同貌**，用户会去按一个按不动的开关。现在指针不摆手型、选中档的轨道换成中性底、滑块收掉那层浮起的投影——投影是「这颗按得动」的信号。不借禁用那档灰：只读的值仍要读得清，也仍会随表单提交。滑块停在哪一端不变，值本身仍由位置这条非颜色通道读出。

  **新增 4 个使用者覆盖槽**：`--xh-download-trigger-loading-duration`、`--xh-clipboard-loading-duration`、`--xh-switch-bg-checked-readonly`、`--xh-switch-thumb-shadow-readonly`。

- f408efb: **ButtonGroup 的 variant / tone / size 下发到组内每一段，缺省形态显式落 subtle。** `connectButtonGroup`
  的 api 新增只读的 `variant`（缺省 `subtle`，组缺省中性淡底）、`tone`、`size`，根的 `data-variant` 不传时
  投影 `subtle`。三端适配器按整组禁用同一条路把三轴落到每一段：Vue 的 `provideButtonGroupDisabled` /
  `useButtonGroupDisabled` 改为 `provideButtonGroupContext` / `useButtonGroupContext`（内部 API），React 的
  `ButtonGroupDisabledProvider` 改为 `ButtonGroupProvider`，Web Components 对未自写 `variant` / `tone` /
  `size` 属性的 `<xh-button>` 子节点写入组值并记住作者自写的那一档；段自己写了的优先，组值压过全局配置的
  `size`。段因此自带 `data-xh-action-variant`，颜色由家族形态矩阵给出。皮肤删除向段灌色的
  `--xh-button-bg / -bg-hover / -bg-active / -fg` 与依赖「段不带 data-variant」的选择器；outline 组内每一段
  的描边一律压平（外框由组根画）；solid 段成组时静息不落贴地软影、悬停不抬起，只留顶光；组内段的
  `scale: none` 兼认 `data-pressed`。视觉默认变化：组内 outline / ghost 段的按下面从 300 改家族阶梯的 200。
- fc47abb: **Button 使用 M1 细化表面、压感、载入布局与实心焦点反馈。**

  默认与 `subtle` 从单一淡底升级为实体 M1 控制面：细边、单像素顶光与极弱 contact shadow 同源；`solid` 保留高遮蔽语气色并叠加接触影，不使用磨砂或背景模糊。`outline`、`ghost` 仍是透空形态。悬停升到 raised，按下时撤掉外影并使用既有 0.98 压感，按住状态不会继续保留 hover 投影。

  `loading` 不再与 `disabled` 共用整根 0.5 opacity。按钮保留完整表面、文字和焦点，只停止 hover/pressed 并使用 progress 光标；现有 `indicator` 统一为当前图标档大小，只在 loading 时显示、旋转。皮肤不生成缺失的 spinner：作者要稳定宽度，应让带真实图形的 indicator 常驻，非载入态由 `visibility` 隐藏。

  label、prefix、suffix、indicator 统一使用居中的 inline-flex 行盒，直接 SVG 与指示器按当前图标档对齐。实心按钮保留与表面对比明确的内环，并新增独立品牌外环；forced-colors 下外环使用系统 `Highlight`，减少动效与打印时 spinner 停转。

  ButtonGroup 中未自行声明 variant 的段继续由组控制高光且不逐段画外影，接缝与尺寸不因 M1 改变。

- 795eaa6: **Button 接入 Action Control 形态矩阵，缺省形态显式落 solid。** 连接层的 root 新增稳定属性
  `data-xh-action-variant`，与 `data-variant` 同源；不传 `variant` 时两者都投影 `solid`——只有 Button
  缺省品牌实心（真源 §7.2 第 2 条），不再存在「不传 variant」的第五种形态。皮肤删除四档形态自写的
  底 / 前景 / 描边、深色品牌实心覆盖与焦点 / 加载回落品牌面的规则，颜色全部由家族形态矩阵给出；公开槽
  `--xh-button-bg / -bg-hover / -bg-active / -fg` 改为桥接到矩阵之前（使用者槽 → 形态矩阵 → 家族缺省），
  只有 solid 一档保留已登记的顶光、贴地软影与悬停 raised。视觉默认变化：ghost / outline 的按下面由
  `--xh-bg-subtle-active`（300）改为家族阶梯的 `--xh-bg-subtle-hover`（200，白底承载 hover 100 → pressed
  200）；subtle 的静息描边由 `--xh-material-soft-border` 改为透明占位边（§8.3 淡底面）。实心面的双环焦点
  选择器改按 `data-xh-action-variant='solid'` 命中。
- fb3b186: **日历的大步翻那对钮补上兜底字形，组合框的清空钮改为顶替展开钮那一格。**

  **`calendar` / `date-picker` 的 `prev-year-trigger` / `next-year-trigger` 此前不写内容就是空钮**，示例里只好手打 `«` `»` 两个字符顶着——它们随字体走，与旁边由图标画出来的单步翻那对不是一套东西。现在两颗不写内容时由皮肤画双箭头，与单步翻的单箭头同一把尺、同一副着色；作者往里塞了自己的图形照旧让位。新增字形令牌 `--xh-glyph-mark-chevrons-left` / `--xh-glyph-mark-chevrons-right`，在任意子树上重声明即可换图。示例里的 `«` `»` 已删掉，写成自闭合部件即可。

  **`combobox` 的清空钮此前与展开钮并排堆在盒里**：有值时两枚图标挨着，用户分不清点哪个；清空钮出现与收起还会让盒的宽度跳一下（没定宽的盒尤其明显，多选每并入第一个值就撑宽一截）。现在与 `select` / `cascader` / `tree-select` 同一套契约——盒里有一颗没收起的清空钮时展开钮让位，两颗互斥显示、始终只占一格，盒宽不随有没有值变动。判据是盒里此刻真有一颗没收起的清空钮：没写清空钮的结构里展开钮照常留着。展开的入口不变，仍是输入框（打字、方向键、`openOnClick`）。

- efb3454: 日历以淡强调面标记今天，并继续用实心强调面表示选中日期，使两种状态在浅色、深色主题下保持清晰区分。
- 8dfd213: **大写锁定提示不再把密码框撑宽。**

  提示区从前是流内文本：一开大写锁定，区内多出一整句话，而控件根是收缩包裹的（`inline-flex`），控件当场宽出那句话的宽度——实测 236px → 335px，**差 99px**，换个语言差得更多。

  现在这一格恒占一个字形的宽，开合两态同宽。文字仍留在盒里不动（`role=status` 的活区域念的是内容，摘掉它读屏就不念了），只是被 `text-indent` 推出可视范围，露出来的是一枚上箭头记号。

  三种候选都量过再选的：浮到控件下方与上方都能做到零撑宽，但在裁切父级里分别只剩 60% 与 6.7% 可见，且分别会压到字段的说明文案与标签；「关闭态恒占位」在这里不成立——关着时区内文字是空串，没有宽度可预留。

  **破坏性**：`--xh-password-input-caps-lock-gap` 与 `--xh-password-input-caps-lock-px` 两个覆盖槽删除。这一格不再有并排子项、宽度也不再由内衬决定，两个槽都已无对应物；要调记号大小走 `--xh-password-input-icon-size`。

- 6e83afe: **Card 默认皮肤改用 M1 Soft Surface，成为材质系统的第一个真实组件使用者。**

  默认 `outline` 卡片从“通用实体底 + 单线框 + 无投影”换成 M1 的实体柔和底、明确边界、单条顶部高光与极弱两段投影；正文、次要文字和分隔线分别读取材质配方，不再各自从通用颜色拼出另一套表面。整卡保持不透明，不使用 `backdrop-filter`，也不添加大卡位移或缩放。

  现有四种形态继续有清楚边界：`outline` 是带明确边界的 M1 默认，`subtle` 使用淡底且无投影，`elevated` 在同一 M1 表面上升到 raised 投影，`ghost` 保持透明。可悬停卡片从 M1 接触影抬到 lifted，只有边界与投影按 micro 时长变化，触摸端仍不生成悬停态。

  高对比与打印行为由 M1 令牌统一穿透：高对比档取消装饰高光并加强边界，打印档取消高光和接触影。Card 没有新增自己的 blur、透明度或辅助模式分支。

- cc63f16: **Carousel 翻页 / 播放钮接入 Action Control floating 档，分页点改为圆点 + 当前胶囊。** 连接层的
  `prev-trigger` / `next-trigger` / `autoplay-trigger` 新增稳定属性 `data-xh-action-control` /
  `data-xh-action-profile="floating"` / `data-xh-action-display="always"` / `data-xh-action-size="md"`（组件没有
  size 轴），不投影 `data-xh-action-variant`，面由皮肤桥接到磨砂缺省。

  视觉默认变化：三颗钮的直径由 `--xh-control-h-md` 36px 改为 floating 档 md 的 `--xh-control-box-lg` 48px
  （compact 44px），面由 `--xh-bg-surface-raised` 改为 M2 磨砂四件套（`--xh-material-frosted-bg / -border / -shadow / -backdrop` + 顶光），悬停 / 按下由 200 / 300 档改为画布承载阶梯 `--xh-bg-subtle`（100）→
  `--xh-bg-subtle-hover`（200），图标由随文 1em 改为随档 24px；到头 / 未配自动播放的隐藏改挂在 `data-disabled`
  上。分页点由 16px 透明盒 + 2px 短线改为 8px 圆点（`--xh-border-default`），当前页拉长为 20px 品牌胶囊
  （`--xh-bg-brand`），悬停 / 按下按前景阶梯加深；自动播放时当前胶囊改为品牌淡底轨道（新增公开槽
  `--xh-carousel-indicator-bg-track`，缺省 `--xh-bg-brand-subtle`）+ 品牌填充条按停留间隔长满；粗指针下仍是
  首尾相接的 44px 按钮盒分区，点与进度条改由伪元素画。新增公开槽 `--xh-carousel-indicator-radius-current`
  （缺省 `--xh-shape-pill`）、`--xh-carousel-indicator-bg-active`、`--xh-carousel-indicator-bg-selected-active`、
  `--xh-carousel-indicator-fg-selected`，`--xh-carousel-indicator-size` 缺省由 `--xh-space-4` 改为
  `--xh-space-2`、`--xh-carousel-indicator-size-current` 缺省由 `--xh-space-6` 改为 `--xh-space-5`，
  `--xh-carousel-trigger-bg-hover / -bg-active / -border / -shadow-hover` 等改为桥接到配方之前，新增
  `--xh-carousel-trigger-shadow`。皮肤体积随桥接槽与分页点两套（细 / 粗指针）规则增加约 24%。

- c2ca771: **Carousel 的两端翻页钮、播放开关与指示点接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`（`CarouselPressedKey`：`prev` / `next` / `autoplay` / `indicator:<页码>`），事件 `PRESS.START` / `PRESS.END` 挂根级；到边界的翻页钮与没配自动播放的开关不进，按住途中翻到边界、关掉 `loop` 或去掉 `autoplay` 时由机器松开。
  指示点皮肤的按压规则改为 `:is(:active, [data-pressed])`，并补 `forced-colors: active` 下的系统前景描边。键盘表新增 `carousel.kbd.press`；`CarouselPressedKey` 进公开面。三端公开 props 与事件不变。
- d013ff2: Carousel 将自动播放间隔投影为分页进度时长，当前短线按每页停留时间填充，并在悬停、聚焦或手动暂停时冻结；纵向导航使用内置上下箭头，分页沿视口右侧竖排。

  时间进度、纵向底轨与减弱动效规则使 `carousel.css` 的压缩体积由 10397 字节增至 12550 字节。

- 1cf7eee: Checkbox 保持实体表单控件。未选中盒迁入 M1 Soft Surface 的实体背景、顶部高光与接触影，同时保留达到
  控件边界对比的真实描边；选中与半选改用 tone 的 control 色作为实心底和边界，六种 tone 在明暗主题下
  都让盒与页面、勾或短横与盒达到 3:1。高对比轴提升未选中边界，未引入 backdrop 或透明玻璃。

  indicator 不再在 unchecked 时 `display:none`，而是常驻控制盒，以 120ms opacity / scale 进入或离开有值态；
  兜底勾和半选横杠使用同一个随控制盒缩放的光学盒，sm / md / lg 与 compact 密度不再沿用固定文字图标尺寸。
  整行标签 hover 会反馈到控制盒，按下撤掉高光与海拔；disabled / readonly 分别使用不可用/默认光标并撤掉
  交互阴影。forced-colors 移除装饰层，用真实边界、CanvasText / GrayText 与系统状态环保持三态可辨。

  标签字号和间距现在跟随三尺寸及密度轴，控制盒设为不可压缩，RTL 与长标签下仍停在行内起点。
  新增 `--xh-checkbox-highlight`、`--xh-checkbox-shadow`、`--xh-checkbox-shadow-hover`、
  `--xh-checkbox-shadow-pressed`、`--xh-checkbox-shadow-disabled`、`--xh-checkbox-shadow-readonly`、
  `--xh-checkbox-border-hover` 与 `--xh-checkbox-label-leading` 覆写槽；既有槽未删除，因此 Styles 按 minor 记录。

  去注释与空白后的皮肤体积由 5283 增至 8587 字节；增量来自 M1 表面、indicator 状态动画、整行反馈、
  三尺寸标签节奏以及高对比/forced-colors 的显式通道。

  皮肤体积（去注释、压空白）：前一提交源码 5283 字节，当前 8617 字节；登记基线 5283 → 8617，只更新本组件，10% 容差保持不变。

- 7df7b1a: **Clipboard 复制钮接入 Action Control 形态矩阵与按压通道。** 连接层的 copy-trigger 新增稳定属性
  `data-xh-action-variant`（缺省 `subtle`，只有 `solid` 才品牌实心），root 的 `data-variant` 不传时显式落
  `subtle`；机器新增按压通道，Space / Enter 与触屏按住期间 copy-trigger 投影 `data-pressed`（禁用或写入在途
  不进入），键盘表新增 `clipboard.kbd.press`。皮肤删除六支形态私有槽、四档形态块、自写的 hover / active /
  :disabled 面与粗指针 ::after，颜色、0.97 按压缩放（此前锁 `scale: none`）、换底与 44px 命中区由家族配方给出；
  公开槽 `--xh-clipboard-copy-trigger-bg / -bg-hover / -bg-active / -bg-disabled / -fg / -border / -border-hover / -border-disabled / -shadow-hover` 改为桥接到矩阵之前（solid 不再悬停抬影，`-shadow-hover`
  缺省 none）；复制成功的前景经桥接槽换，悬停与按下不再退回平时字色；输入框焦点边改为
  `--xh-border-control-focus` 不随 tone；加载环由 pill 改 circle。
- fee406a: **新增** 九个独立触控目标在粗指针下的命中区外扩：`button` 本体、`clipboard` 的复制钮、`download-trigger` 本体、`pagination` 的页码格与前后翻页钮、`tabs` 的标签、`toggle-group` 的条目、`toggle` 本体。此前这些部件登记为「手指直接落上去」的目标，皮肤里却没有 `@media (pointer: coarse)` 块，触屏下命中区就是视觉盒本身——最矮的 sm 档只有 28px。

  外扩一律走绝对定位的伪元素 `inset-block: -8px`，视觉盒与布局占位一寸不动：这些部件多数排在整行控件里（最高 40px），直接加高盒子会把同一行的控件顶得高低不齐，标签带还会连着基线与滑条一起被顶下去。只扩块轴、不扩行内轴：页码格之间只隔一格间距、切换组条目靠负外边距共边相接、标签在行内轴上首尾相接，往两侧扩会与相邻目标的命中区叠上。实测 28px 档到 44px、32px 档到 48px。

  伪元素挑当前空着的那一颗，不覆盖已被占用的：`tabs` 用 `::before`（`::after` 是换位时的落点线），`clipboard`、`pagination`、`button`、`toggle`、`toggle-group` 用 `::after`，`download-trigger` 按取数在途与否在两颗之间轮换（在途时 `::before` 是那枚圆环、此外 `::after` 是兜底字形）。

  `carousel` 的指示点仍留在待做名单里：圆点直径 8px、点间距 4px，外扩到 44 要每侧 18px，相邻两点的命中区会大幅叠上；只扩块轴则得到 8×44 的一条竖带，行内那一边仍是 8px。

- c859508: **新增** `code-view` 组件：一段代码的逐行呈现，Vue 与 Web Components 两侧同时可用。

  它比 `code-block` 多出行号、指定行高亮、超长折叠与文件名四件，而这四件都建立在同一件事上——**逐行切分在连接层完成**。词法器是单趟不回溯的，一个记号可以横跨多行（未闭合的字符串与块注释就是这样），所以「一个记号一个 span」的渲染方式切不出行；行号与高亮行不是皮肤能反推出来的东西。切分保证无损：`lines.map(l => l.text).join('\n')` 逐字等于原文，着色实现即使给不全记号也用纯文本片段补齐。

  `lineNumbers` 的行号由皮肤用 `attr()` 画出来，因此**复制代码不会带上行号**，读屏也不会逐行念数字。`startLine` 让摘录与 patch 片段的行号对得上真实文件，`highlightLines` 收 `'3,7-9'` 或行号数组，写错的片段丢掉而不是让整段代码渲不出来。

  `clamp` 给出折叠阈值，`clamped` 是**纯受控**的：折叠态通常由页面上「全部展开 / 全部折叠」统一持有，组件内建一份只会跟它打架；要非受控就套 `collapsible`。折叠按钮带 `aria-expanded` 与指向代码区的 `aria-controls`。

  `complete` 与 `highlighter` 沿用 `code-block` 的取舍：未闭合默认不着色，着色端口返回 `null` 是合法结果、退回纯文本。渲了文件名节点它就成为代码区的可访问名，没渲则用 `translations.code` 兜底。复制不内建，与 `clipboard` 组合。

  **新增** 语义令牌 `--xh-text-code-leading`：代码行距从此有名字，`code-block` 与 `code-view` 都指向它，不再各写一份字面量。

- 99e8787: Collection Item 家族配方升级到 version 2：新增 `data-xh-collection-context='overlay' | 'page'` 上下文轴、pressed 与 current 状态。overlay 选中保持透明底 + 行尾对号；page 选中为 `--xh-bg-brand-subtle` 行面 + `--xh-fg-on-brand-subtle` + 前导对号，current 另画起始侧 2px 品牌指示条，selected/current 叠加 hover、按下分别取 `--xh-bg-brand-subtle-hover`、`--xh-bg-brand-subtle-active`；open-path 改为与 hover 同档的 `--xh-bg-subtle`；每类标记附 forced-colors 映射（Highlight / HighlightText / ButtonText）。

  Select 条目投影 `data-xh-collection-context='overlay'`。默认外观变化：条目按下面由 `--xh-bg-subtle-active` 改为 `--xh-bg-subtle-hover`（白底阶梯 hover 100 → pressed 200）并由家族统一提供；对号盒随尺寸档 16 / 20 / 24px（Chromium 会把跨两行的对号盒分一半高度给空的说明行，md / lg 条目因此各高 2px / 4px）；公开槽名与三端 API 不变。

- 270d162: 建立由单一 JSON 真源生成的 Collection Item Family Recipe，统一 sm/md/lg 尺寸节奏，prefix/text/description/shortcut/suffix/indicator 六列，以及 rest、hover、keyboard-highlight、selected、selected+highlight、open-path、checked、disabled、loading、error 状态。

  Select item 首批迁入该配方：Headless 投影 `data-xh-collection-*` 角色，并复用统一状态词汇表达选择事实，三端适配器继续只展开 Headless 属性；持久选择保持末端对号，选中叠加高亮仍使用中性面与独立焦点环，正文不加粗、条目宽度不变化。独立 Select 皮肤与 full bundle 共用同一份生成 CSS。

- 843c8d4: Collection Item 家族配方补 `nav` 语境（`data-xh-collection-context='nav'`，配方 version 3），给横向导航部件（Tabs line trigger、Anchor / Breadcrumb link、Menubar / NavigationMenu trigger）一整套白底承载阶梯：rest 透明面 + `--xh-fg-muted` + regular，hover `--xh-bg-subtle`（100）+ `--xh-fg-default` → pressed `--xh-bg-subtle-hover`（200）只换面，`data-in-path` 与 hover 同档；`data-current` = 透明面 + `--xh-fg-brand-strong` + `--xh-font-weight-medium`，叠加 hover 100 / pressed 200 / 焦点环；新增 `terminal` 态（`data-current` + `data-xh-collection-terminal`）给不可点的当前页：`--xh-fg-default` + medium + cursor default，不带交互守卫也不叠 hover / pressed，并以 (0,4,0) 压过家族禁用面（含 pointer 层给 `aria-disabled` 的 not-allowed 光标：terminal 规则自己写 `cursor`）。nav 不读 `aria-selected`、不画对号，2px 指示条由组件自己的滑动 indicator 部件承担；forced-colors 下当前页取 ButtonText。每态都带 `--xh-collection-<slot>-<state>` 覆盖槽（含 `-terminal`）。
- 1c75aa4: **浮层集合条目回到单行高，图标垂直居中。** Select、Combobox、Cascader、TreeSelect 等浮层里的候选行此前比一行文字高出半个图标（md 档 41–43px，应为 33px），行尾对号、前导图标与树的展开箭头都比文字低 4–5px。

  根因在 Collection Item 家族配方：条目是「正文 / 说明」两行网格，prefix、indicator 等图标跨两行居中。各皮肤为了省略号给正文槽写了 `overflow: hidden`，它因此成为滚动容器、自动最小尺寸归 0；网格轨道算法处理跨行图标时把图标高度平均分给两行，没有说明的条目也长出半个图标高的第 2 行。

  说明行改为 `minmax(0, max-content)`：最小尺寸钉在 0，不再参与跨行图标的高度分配，只在真有说明时按说明长；上限取 `max-content`，皮肤给条目定死 `block-size` 时多余空间也不会被说明行分走。条目高度 = 上下块内距 + 行高，图标与正文同一中线。

- 486aad2: **Collection Item 配方的选中主体兼认 `data-selected`，交互守卫兼认 `data-disabled`。** 此前 selected 只读 `[aria-selected='true']`、守卫只排除 `[aria-disabled='true']`；Tree / TreeSelect 的分支行（`branch-control`）不是 treeitem 本体，两项 ARIA 事实都在外层 `branch` 上，行上只有连接层同步下来的 `data-selected` / `data-disabled`——选中面永远命不中，禁用分支悬停仍换底。

  现在 selected 主体是 `:is([aria-selected='true'], [data-selected])`，守卫多排除一条 `[data-disabled]`；`:is` 取最高特指度，规则层级维持 (0,1,0) 起算，页内 / 浮层两种上下文的选中面与叠加态选择器源序不变。

- fa08fb4: **集合件的三种非条目相位补齐：空 `empty`、在途 `loading`、还有更多 `load-more-trigger`。**

  同一个库里「筛完没有结果」这件事，级联和组合框有正式部件、树没有；「远程取数在途」只有表格有；「还有更多，去取下一页」哪家都没有。三条本来就是同一件事——集合件在没有条目可看时处在哪一种相位——现在按同一套名字、同一套收放判据铺开。

  **`loading` 部件**给到八家：`select` / `combobox` / `tree-select` / `cascader` / `mention` / `transfer` / `listbox` / `tree`。配一个新的 `loading?: boolean` prop，缺省 `false`，不写即与此前逐像素相同。为真时条目容器报 `aria-busy`，在途占位顶上来、空态占位让位——两者摆在同一个位置，永远不同屏。给了 `collection` 时收放全归连接层；条目手写时库数不出有几条，那一档只按 `loading` 收放，其余归作者。相位判据与 `table` 一致：已经有条目可看时两个占位都不顶上来。

  **`empty` 部件**补给 `tree`（放在 `root` 里、`tree` 的兄弟——`role=tree` 只许拥有 `treeitem` 与 `group`）。其余七家此前已有。

  **`load-more-trigger` 部件**给 `table` 与 `listbox`，与 `infinite-scroll` 上那一颗同名同角色：还有没有下一页、点了做什么都归作者，连接层只保证取数在途与整列禁用两档点不动，并按 `data-loading` / `data-disabled` 转述给皮肤。它是一颗铺满一行的按钮，带悬停底色与按压缩放。

  八家的根节点同时多出 `data-loading` 一位，供作者接线；在途的观感由只在取数期在场的 `loading` 部件承载，不额外压灰任何东西。

  **新增部件**：`loading` × 9（含 `table` 已有的那一份不计）、`empty` × 1、`load-more-trigger` × 2。**新增 Vue 组件导出**：`XhSelectLoading`、`XhComboboxLoading`、`XhTreeSelectLoading`、`XhCascaderLoading`、`XhMentionLoading`、`XhTransferLoading`、`XhListboxLoading`、`XhTreeEmpty`、`XhTreeLoading`、`XhListboxLoadMoreTrigger`、`XhTableLoadMoreTrigger`。

- 74004f7: **新增** `color-field` 组件（颜色字段）：一个能手打颜色串的单行框，旁边一块当前颜色的色块。

  - 认 `#rgb` / `#rrggbb(aa)`、`rgb()` / `rgba()`、`hsl()` / `hsla()`；打字只留草稿（`data-editing`），回车或失焦收下后按 `format` 重写成规范写法，`alpha` 决定带不带透明度；Escape 放弃草稿；收不下的草稿留在框里并标成无效。
  - 空串是合法的「没有颜色」：`clearable` 开清空按钮与 Escape 清空；表单出口经 `hidden-input` 提交收下的值，框里的半截字不会被提交。
  - 视觉盒走 Field Chrome、色块走 Swatch 家族、清空按钮走 Action Control 的 field-inset 档；放进 `field` 里时说明、错误与四条状态轴随字段下发。
  - Vue `XhColorField*` 与 `useColorField`；React 同名组件与 hook；自定义元素 `<xh-color-field>`（`value` / `default-value` / `format` / `alpha` / `clearable` / `name` 等 attribute，`translations` 只走 property；`setValue` / `clear` / `commit` 命令式方法与 `canClear` / `editing` 只读属性）；皮肤 `@xihan-ui/styles/color-field.css`，覆盖槽前缀 `--xh-color-field-*`。

- 740e2e7: **ColorPicker 屏幕取色按钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。**
  机器 context 新增 `pressed`，事件 `PRESS.START` / `PRESS.END` 挂根级；禁用、只读或环境没有 EyeDropper 时不进；屏幕取色一开
  （窗口随即失焦）、浮层收起，或按住途中转入禁用 / 只读时由机器松开。皮肤里取色按钮的按压规则由 `:active` 改为
  `:is(:active, [data-pressed])`，并在 `forced-colors: active` 下用系统高亮反色画回按压面。键盘表新增 `color-picker.kbd.press`。
  三端公开 props 与事件不变。
- e63a9fd: ColorSlider 按设计真源归位字段标签、拇指描边与禁用面：标签缺省由 `--xh-fg-muted` 改 `--xh-fg-default`，根的 `--xh-color-slider-gap` 缺省由 `--xh-stack-gap-md` 改贴控件的 `--xh-space-1`，新增 `--xh-color-slider-label-fg-disabled`（缺省 `--xh-fg-subtle`）；拇指是 raised 面，描边缺省由 `--xh-bg-surface` 白边改 `--xh-border-default`（`--xh-color-slider-thumb-border` 覆盖槽不变）；禁用不再整体压暗，改为标签换禁用前景、颜色带与拇指在 control 上压暗一次、拇指收掉抬升（新增 `--xh-color-slider-thumb-shadow-disabled`，缺省 none），禁用的轨道与拇指改 `not-allowed` 手型；组件文档的禁用描述随之更新。
- 8503826: **新增** `color-slider` 组件（颜色滑块）：一条只推颜色某一路的滑杆，值是整个颜色串。

  - `channel` 七选一：`hue`（0-360）、`saturation` / `brightness` / `alpha`（0-100）、`red` / `green` / `blue`（0-255）；`format` 决定写法，`alpha` 决定串里带不带透明度（缺省时推透明度那一路带、其余不带）。
  - 轨道渐变由连接层按当前颜色现算写成内联 `background-image`（其余分量不动，只让本通道从 min 走到 max），拇指填当下那一档的颜色；透明度那一路皮肤垫棋盘格。
  - 拖动、键盘（方向键 / PageUp / PageDown / Home / End）、RTL 掉头与竖直排布整份取自内嵌的 `slider` 机器；`onValueChange` 拖动中连发，`onValueChangeEnd` 松手只发一次；灰度处色相靠锚保住。
  - Vue `XhColorSlider*` 与 `useColorSlider`；React 同名组件与 hook；自定义元素 `<xh-color-slider>`（`value` / `default-value` / `channel` / `format` / `alpha` / `orientation` / `dir` / `size` / `name` 等 attribute，`translations` 只走 property）；皮肤 `@xihan-ui/styles/color-slider.css`，覆盖槽前缀 `--xh-color-slider-*`。

- c260f81: ColorSwatchPicker 按设计真源归位形状、选中标记、阶梯与标签：格子与色块面的圆角由 control 改 inset（`--xh-color-swatch-picker-item-radius` 缺省 `--xh-shape-inset`），选中徽标的正方盒由 pill 改 circle；选中不再在格子外画 outline 环（外圈留给焦点环独占），改为色块自己的品牌描边（`--xh-color-swatch-picker-ring` 改映射到选中态的色块描边，缺省 `--xh-fg-brand`、语气组取语气色）加正中的徽标；悬停描边由 `--xh-border-strong` 改 `--xh-border-control-hover`，按下在缩放之外以描边换品牌色作第二通道（新增 `--xh-color-swatch-picker-swatch-border-pressed`，底是展示色不换）；标题走复合单字段标签角色：14px / 500 / `--xh-fg-default`、贴控件 `--xh-space-1`（新增 `--xh-color-swatch-picker-label-gap`），禁用标签新增 `--xh-color-swatch-picker-label-fg-disabled`。ColorPicker 内嵌色板同步撤掉不再消费的字号私有槽。
- 1b63bf3: **新增** `color-swatch-picker` 组件（颜色色块选择器）：从一组固定颜色里挑一个，每格是一颗 `role=radio` 的色块。

  - 与单选组同一套 roving tabindex：整组一个 Tab 位，四个方向键移焦点并选中、回绕、跳过禁用格，Space 选中；焦点从组外进来落在已选中的格子上。
  - 选中按颜色比不按串比（`rgb(255, 0, 0)` 与 `#ff0000` 是同一格）；`swatches` 给数据时可及名字与禁用从数据里查，格子部件只报 `value`，不写默认内容时按数据自动铺开。
  - 每格的色块面走 Swatch 家族；`readOnly` 只挡落值不挡焦点；表单出口是每格内一份 `inert` 的隐藏原生 radio。
  - Vue `XhColorSwatchPicker{Root,Label,Item}` 与 `useColorSwatchPicker`；React 同名组件与 hook；自定义元素 `<xh-color-swatch-picker>`（`value` / `default-value` / `disabled` / `read-only` / `invalid` / `required` / `dir` / `name` / `size` attribute，`swatches` 与 `translations` 只走 property；格子部件用 `value` / `label` 属性声明）；皮肤 `@xihan-ui/styles/color-swatch-picker.css`，覆盖槽前缀 `--xh-color-swatch-picker-*`。

- 216095b: **新增** `color-swatch` 组件（颜色色块）与 Swatch 色块面家族配方。

  - 色块把一个颜色画成一小块给人看，不接交互：认 `#rgb` / `#rrggbb(aa)`、`rgb()` / `rgba()`、`hsl()` / `hsla()`，解析不出时只画棋盘格底并带 `data-invalid`；`label` 给读屏一个有含义的名字，不给就念颜色串，两者都没有时整块视为装饰。
  - 家族配方 `@xihan-ui/styles/swatch.css`（`recipes/swatch.recipe.json` 生成）：棋盘格底、颜色填充层、描边与 sm / md / lg 尺寸档只有这一份真源，消费者投影 `data-xh-swatch` / `data-xh-swatch-size` 并经私有槽 `--xh-_swatch-color` 写入颜色；高对比模式退出强制着色保住原色，打印保留底色。色块选择器、颜色字段与取色器里的当前色块随后都改吃它。
  - Vue `XhColorSwatch`；React 同名组件；自定义元素 `<xh-color-swatch>`（`value` / `size` / `label` 三个 attribute）；皮肤 `@xihan-ui/styles/color-swatch.css`，覆盖槽前缀 `--xh-color-swatch-*`。

- a2a1be7: **Command 接入 Collection Item 配方：面板改 overlay 圆角 + sheet 三件套，命令补按下面，结果列表三端接自绘条。**

  - 命令投影 `data-xh-collection-item` / `-size` / `-context='overlay'`，`item-text` 落 `text` 槽。`aria-selected` 仍跟着活动候选走，家族的浮层选中面映射到与悬停同一档（`--xh-bg-subtle`），不投影对号槽，视觉上仍不绘制对号或选中底；按下 200（`--xh-bg-subtle-hover`，此前零反馈）与禁用面由家族给，新增 `--xh-command-item-bg-pressed`。
  - 面板由「surface 8px 圆角 + `--xh-bg-surface` + `--xh-elevation-sheet` 无描边」改为与 Dialog 同档：`--xh-shape-overlay` 12px 圆角，`--xh-material-elevated-border` 描边 + `--xh-material-elevated-bg` 底 + `--xh-material-elevated-shadow` 影，新增 `--xh-command-border`；`--xh-command-bg` / `--xh-command-fg` / `--xh-command-shadow` / `--xh-command-radius` 槽名不变、缺省随之改变。
  - 结果列表接自绘条：Vue / React `useScrollbars`、Web Components `ScrollbarsController`，壳是面板自己，条子走 4px 档；list 补 `overscroll-behavior: contain`，content 声明 `--xh-scrollbar-track-bg: transparent`。
  - 定位层与面板上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档。
  - 皮肤体积基线随面板三件套与家族槽映射重落（10621 → 11969 字节）。

- 2c5c5ac: **新增** `command` 组件（命令面板）：Vue 与 Web Components 两侧同时可用，组件数 125 → 126。

  一块盖在页面上的检索面板：打字筛出命令，方向键选，回车执行。功能散在很多层菜单里、
  用户知道要做什么却找不到入口时用它。

  它由既有地基组合而成，没有新造轮子：浮层的开合、焦点陷阱、滚动锁与背景失活照 `dialog` 那一套；
  检索框的 `role=combobox` 与 `aria-activedescendant` 照 `combobox`；结果列表是 `role=listbox`；
  唤起的快捷键与行尾的键帽用 `hotkeys`，命中片段的标注用 `highlight`——后两件由使用者组合，
  库不把它们焊进来。

  与 `combobox` 的分工：那一族把过滤留给调用方，这一族自己做。命令清单经 `collection` 交进来，
  按检索串逐词筛（`keywords` 让一条命令同时认英文名、拼音与旧称）、按 `group` 归组、空组自动丢掉。
  条目节点只报 `value`，此刻露不露面由连接层打的 `hidden` 说了算——铺开与手写部件因此产出同一棵 DOM。
  远端检索把 `filter` 置否即可关掉内置过滤。

  承诺的行为：面板是模态浮层，Escape 与点遮罩收起、收起后焦点还给触发按钮；焦点全程在检索框，
  锚点经 `aria-activedescendant` 报给读屏，方向键跳过禁用项；打字后锚点自动钉回首条命中项；
  空态与在途两个占位不同屏。`closeOnSelect` 决定选完收不收。

  实现细节，不进承诺：过滤与方向键落点走的是数据而不是活 DOM（因此开场首帧锚点就准）；
  面板贴着视口上沿摆，位置由皮肤的 inset 排布，不问定位引擎要坐标。

  动效沿用既有关键帧，不新增名字：遮罩 `xh-fade-in` / `xh-fade-out`，面板 `xh-overlay-pop-in`
  （`--xh-_overlay-enter-down` 让它从上方落下一小段）与 `xh-pop-out`，结果逐条 `xh-rise-in`，
  交错间隔走 `--xh-motion-stagger-step`，第六条起统一钉在第五级。

  体积：新增一份皮肤 `command.css`（去注释压空白后 11.1 kB），`.size-limit.json` 里 styles 那条的
  限额未动。

  新增的公开面：`@xihan-ui/headless` 14 个值导出与 13 个类型导出（`connectCommand` / `commandMachine` /
  `commandAnatomy` / `commandMeta` / `commandKeyboard`、过滤那一层的 `normalizeCommandQuery` /
  `matchesCommandTerms` / `flattenCommandGroups` / `resolveCommandGroups` / `resolveCommandNode` /
  `navigateCommandResults` / `COMMAND_UNGROUPED`，以及 `CommandSchema` / `CommandApi` /
  `CommandNode` / `CommandGroup` 等类型）；`@xihan-ui/vue` 12 个组件加 `useCommand` 与
  `CommandRootSlotProps` / `CommandContext`；`@xihan-ui/web-components` 的 `<xh-command>` 与
  `XhCommandElement`（17 个 attribute，另有 `collection` / `groups` / `translations` 三个 property
  与 9 个取数口）；`@xihan-ui/styles` 多一条子路径导出 `@xihan-ui/styles/command.css`，随之出
  55 个使用者槽（`--xh-command-*`）。

- 8ad1d03: 新增由 126 份独立组件皮肤实际 `var(public-slot, fallback)` 消费位生成的
  `components.tokens.json`，逐项记录组件、部件、CSS 属性、状态、缺省来源、可见性与说明；
  `@xihan-ui/styles/component-tokens` 同步提供可导入的 TypeScript 名称联合与 manifest 声明。

  组件文档 CSS 变量表、Web Components CEM `cssProperties` 与公开面基线改读同一 manifest。
  新门禁会从 CSS 重建 manifest 和类型，并逐组件核对文档与 CEM；未知、无组件归属或没有任何
  fallback 事实源的公开覆盖槽直接失败，不使用数量阈值或豁免名单。

  Web Components CEM 不再把 16 个全局设计令牌误报为组件 `cssProperties`；这些变量仍由
  `@xihan-ui/tokens` 原名提供，应从全局设计令牌清单读取。CEM 同时补齐过去因多行 `var()` 或
  跨组件消费而漏掉的 4 个真实组件覆盖槽。

- 49ed6b0: **修复**四处「想改一处视觉，改不动，或者调 A 把 B 一起改了」。四处都补了新槽名；被顶替的旧名不留兼容位，删掉的名字逐条列在「摘掉全部旧名兼容层」那份里。

  **toggle-group 整件不接语气轴。** 同族的 toggle 与 segmented 都发 `data-tone`，只有它不发，选中档的底、悬停底、按下底、前景与描边一律钉死在品牌色上——把一组开关放进 `data-tone="danger"` 的区域里，旁边的 toggle 变红，它一点不变。补上 `tone` prop 与 `data-tone`，选中档与「禁用且选中」档改读语气槽（`--xh-_tone` / `-hover` / `-active` / `-on`），没有语气时逐值退回原来的品牌配色。使用者的组件槽仍排在语气之前：写了 `--xh-toggle-group-item-bg-on` 就以它为准。顺带把作用在条目上的圆角槽改名成带部件段的 `--xh-toggle-group-item-radius`，与同文件另外 22 个条目槽同段；`--xh-toggle-group-radius` 已删。

  **button-group 把使用者的圆角槽写成 0。** 组在根上直接写 `--xh-button-radius: 0` 让段与段接成一条，可那正是使用者改按钮圆角的入口：设了胶囊按钮，进了组就静默归零，而且组内怎么写都盖不回来——继承来的值压不过组根上的那条声明。改成写私有槽 `--xh-_button-group-radius`（与同文件高度、内距、间距、字号四项一致），按钮的圆角兜底链插进这一层。不写覆盖时段与段照旧是直角，两端的圆角照旧归 `--xh-button-group-radius` 管。

  **navigation-menu 的两种面板形态共用一个内衬槽。** 逐项面板 content 的默认内衬是一档，共享外壳 viewport 是两档，两处却都读 `--xh-navigation-menu-content-p`——使用者一改，两者一起走，缺省的这一档差值再也调不开。外壳另立 `--xh-navigation-menu-viewport-p`，缺省仍是两档；`--xh-navigation-menu-content-p` 从此只管 content 那一处。

  **typography 一个槽吃掉六个语气。** `--xh-typography-text-fg` 同时管次要文字档与全部六个语气档，两条规则同权重：想把次要文字调淡一点，六族语气当场一起塌成同一个灰。拆成 `--xh-typography-text-fg-muted` 与 `--xh-typography-text-fg-tone`，`--xh-typography-text-fg` 已删。

- 21bcb16: **ContextMenu 接入 Collection Item 配方：条目按下面由 300 改 200，浮层条子走 4px 档并补 overscroll 隔离。**

  - 条目投影 `data-xh-collection-item` / `-size` / `-context='overlay'`，`item-text` 落 `text` 槽、`item-indicator` 落 `prefix` 槽（常显前导图标，不是选中对号）、`item-description` 落 `description` 槽，分隔线投影 `data-xh-collection-separator`；子菜单触发项由子层的 Menu 机器合并同一批标记并在子层开着时报 `data-in-path`。
  - 悬停 / 键盘锚点 100（`--xh-bg-subtle`）、按下 200（`--xh-bg-subtle-hover`，此前是 `--xh-bg-subtle-active` 300）、打开路径与 hover 同档、禁用面都由家族给，皮肤只映射公开槽；`--xh-context-menu-item-bg-pressed` 缺省随之改变。
  - 标记位盒尺改随家族按档下发的 `--xh-icon-size`（md 20px）；根与定位层上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档，content 上的重复声明删除。
  - content 补 `overscroll-behavior: contain`；三端自绘条改传 `size: 'sm'`（浮层里的条子走 4px 档）。

- fa08fb4: **数据展示族补能力：描述列表补跨列、统计数补涨跌、时间线补坐标列、JSON 视图补空态、树与 JSON 视图补形态轴、无限滚动补取下一页的按钮。** 纯新增，公开面一个名字都没删。

  **描述列表的跨列。** `descriptions` 的 `getItemProps` 从零参改成收一个可选的 `DescriptionsItemProps`（`{ span?: number }`），产出 `style.gridColumn`；`span` 钳在 1 与当前 `columns` 之间——跨出网格的格子会另起一行，比截断更难看。旧的零参调用照样成立。Vue 侧 `XhDescriptionsItem` 补 `span` prop，Web Components 侧从格子自己的 `span` 特性上读。

  **统计数的涨跌。** `statistic` 补 `trend` 部件与 `trend` prop（`up` / `down` / `flat`），方向落成部件上的 `data-direction`，皮肤据它出兜底箭头——示例里不必再手打箭头。`trend` 与 `tone` 保持正交，方向与颜色互不联动：跌也可以是好事（差错率、退货率），要不要联动由作者自己定。新增令牌 `--xh-glyph-mark-arrow-down`（`arrow-up` 与 `minus` 早已在册）。

  **时间线的坐标列。** `timeline` 补 `label` 部件：与内容对置的那一列，装这一条的日期或版本号。竖排三种侧别各给它一条轨道——结束侧占线之前那列、起始侧占线之后那列、逐条交替时恒在内容对面，时间戳因此不再跟着内容左右横跳。`time` 留在 `content` 里不动，两者语义不同：`label` 是这一条的坐标，`time` 是内容的一部分。横排不为它单开轨道。

  **JSON 视图的空态。** `json-viewer` 补 `empty` 部件与 `api.isEmpty` / `api.emptyText`：一行也摊不出来时（`value` 没给或给的是 `undefined`）由它说话，有行可摊时组件给它打 `hidden`。文案走新增的 `translations.empty`（缺省 `No data`），Vue 侧另有一个 `empty` 插槽，Web Components 侧由元素铺兜底文案。**这一件会改 DOM**：两个适配器都会在根里多渲一个 `[data-part='empty']` 节点，有数据时它带 `hidden` 不占位置；写了 `:last-child` 一类结构选择器的使用者要复核。

  **两条形态轴。** `tree` 与 `json-viewer` 各补 `variant`（`'plain' | 'surface'`），落成根上的 `data-variant`。**缺省是 `surface`，逐值与从前相同**；`plain` 是新增档，边框留着但转成透明——去掉外框不会让行的位置跳一格。皮肤同批把那两条边框与底色的声明改成「使用者令牌 → 私有槽 → 语义令牌」三级，使用者写的 `--xh-tree-border` / `--xh-json-viewer-bg` 仍排在形态之前。

  **无限滚动的键盘等价通路。** `infinite-scroll` 补 `load-more-trigger` 部件：一颗真按钮，点它与哨兵进可视区走同一段（机器新增 `LOAD` 事件，取数中与关掉两段同样不响应），按钮在这两段自动 `disabled` 并带 `data-loading` / `data-disabled`。读屏在虚拟光标模式下不产生滚动事件，只靠哨兵那条路取不到第二页——这颗按钮是它的等价入口。**文案由作者写在按钮里，组件不代填可及名字**：写死一句英文会与可见文字对不上，读屏念的与眼睛看的就分了家。部件是可选的，不写它的页面 DOM 一字不变。文档首段同批改口径：本组件是「取下一页」的通用触发器，滚动只是默认的触发方式。

  体积（去注释压空白后）：`statistic.css` 2190 → 3559 字节、`timeline.css` 9561 → 11643 字节、`json-viewer.css` 7740 → 8710 字节、`tree.css` 13253 → 13455 字节、`infinite-scroll.css` 447 → 2123 字节；`descriptions.css` 未动。涨的是新增部件的排版块与两条形态轴的槽赋值。

- 134dea9: 日期输入和日期选择器使用轻量分段焦点与弱化分隔符；日期选择器展开期间持续显示输入框激活边界，并压缩手机复合面板的时间列轨道，避免分钟列折行。
- 10f5d89: **`date-picker` 浮层的手机档排布：并排的那几块放不下时改成上下堆叠。**

  上一批只把面板夹回视口、撑出去的那截交给面内横滚。这一批把排布本身做出来，三处并排各自换法。

  **两张月历改折行。**`content` 加 `flex-wrap: wrap`，第二张放不下就落到第一张下面。这是不写查询的那一层：视口窄与面板被夹窄两种情形同时命中。实测 375px 上从「面内横滚 120px」变成两张竖着堆、`scrollWidth` 与 `clientWidth` 齐平；768 与 1280 两档逐值不变（两张仍在 x=26.2 与 x=241.3 并排）。日期钮宽度一格没被压：三档下相邻两颗间距恒 3.84px，末钮右缘 236.94 仍在周行右缘 238.86 之内。

  **分隔线跟着换边。**折行是 `flex-wrap` 的隐式行为，CSS 拿不到「这一项换行了没有」这个条件，所以线画在哪一边只能另找依据：手机档画在块起始边，`@media (min-width: 768px)` 起回到行内起始边。快捷选项与日历之间的空当同理。**代价**：视口在 768 以上而面板被锚点挤到装不下两张月历时会折行，线却还立在行内那一边。这一档跟不上：库里没有容器查询，形态换档一律按视口。

  **`showTime` 的时间列成组横排。**此前 `content` 是 `block`，时列与分列各占满一行竖着摞，375px 上面板内容高 608px、只能纵向滚。现在 `content` 同样是可折行的行内流：放得下就贴在日历旁边（375px 上时/分两列各 46.3px 宽，与日历同一行，面板不再纵向溢出），放不下时折到日历下面。确认按钮 `align-self: flex-end` 沉到所在行的底边。**已知限度**：几条时间列是彼此独立的 flex 项，中间没有包裹层，CSS 无法把它们锁成不可拆的一组——面板窄到 310px 左右时会出现「时列还在日历旁、分列已经折下去」的拆行。

  **快捷选项从左侧竖列改成顶部一条。**手机档 `flex: 0 0 100%` 让它独占面板顶部一行，条目横着排、放不下这一条自己横滚，分隔线画在块结束边；`@media (min-width: 768px)` 起回到日历行内起始一侧的竖列，滚动轴与分隔线一起转回来。这一件用了查询：换的是它自己的主轴方向、滚动轴与分隔线所在边，`flex-wrap` 只决定项目换不换行，表达不了；而且 375px 上左竖列加一张月历本来就放得下，折行根本不会触发。

- d374f89: **新增** `date-range-picker` 组件（日期范围选择器）：起止两组可键入的分段日期框、`range-separator`、日历触发器与内嵌 `calendar-range-picker` 的浮层组合成一个字段，承接原 `date-picker` `selectionMode="range"` 那一路。

  - 值恒为区间两端 `[start, end]`，按位存放，空缺的一端用空串占位（只填了终点是 `['', end]`），受控回写按同一份下标认领；`api.start` / `api.end` 直接取两端，两端都落定时 `periodValue` 给出周期首尾与回显键。
  - `name` 与 `endName` 各自决定两份 `hidden-input` 参不参与提交；`segment-group` 带 `data-index`（0 起点、1 终点），方向键换段不跨组，两组各报「开始日期」「结束日期」（`translations.startDate` / `endDate`）。
  - 浮层里是范围日历：先落起点再落终点，两端都落定才写值并（`closeOnSelect`）收起；`min` / `max` / `isDateUnavailable(value, anchor)` / `allowsNonContiguousRanges` / `visibleCount` / `granularity` 一并转给日历；终点早于起点或任一端越界时整个字段标为不合法。
  - `presets` 只收区间（`start/end` 写法），`dateRangePickerPresetRange` / `dateRangePickerPresetMonth` / `dateRangePickerPresetYear` 三个纯函数按时区算「近 N 天」「本月」「今年」。
  - Vue `XhDateRangePicker*` 与 `useDateRangePicker`；React 同名组件与 hook；自定义元素 `<xh-date-range-picker>`（`value` / `default-value` 是数组，只走 property）；皮肤 `@xihan-ui/styles/date-range-picker.css`，覆盖槽前缀 `--xh-date-range-picker-*`。

- 38efe68: 修复日期时间选择器的完整分段显示，统一清空按钮与选择图标的互斥状态，并为字段聚焦、日历按压和组件内部滚动补齐一致的反馈。
- fa08fb4: **日期与时间两家的展开钮换成日历与时钟字形，日历的翻页箭头在 RTL 下对调，时刻段补上触屏手势与内衬槽。**

  **`date-picker` / `time-picker` 的 `trigger` 此前不写内容画的都是向下的尖角**，与 `select` / `combobox` / `cascader` 的展开钮长得一模一样——一排表单控件摆在一起，哪个开出来的是日历、哪个开出来的是时刻列表，只能靠盒里的文字猜。现在两家各画各的：日期那颗是日历，时刻那颗是表盘。新增字形令牌 `--xh-glyph-mark-calendar` / `--xh-glyph-mark-clock`，在任意子树上重声明即可换图，置 `none` 就是「这里我自己放节点」；作者往部件里塞了自己的图形照旧让位。

  **`calendar` 的四颗翻页钮此前在 `dir="rtl"` 下指错方向**：月份从右往左排，箭头却仍按从左往右的页序画。现在四颗按 `dir` 分支对调 —— 单步的 `prev-trigger` / `next-trigger` 与大步的 `prev-year-trigger` / `next-year-trigger` 都跟着行进方向走。只在不写内容时命中，作者自己放的图形不受影响。

  **`time-field` 的 `segment` 补两条与 `date-field` 对齐的声明**：`touch-action: manipulation`（此前触屏上连点两段会被当成缩放手势），以及内衬槽 `--xh-time-field-segment-py`（此前竖向内衬写死为 0，改不动；默认值仍是 0，不写就与现在一模一样）。

- fc89b39: **`descriptions` 里作者写在某一格上的 `span`，改由皮肤逐档决定认不认。**

  这一格的跨列数此前是连接层直接写死的 `grid-column` 行内样式。行内样式盖过样式表里的一切规则，于是皮肤那条「窄档每格横跨所有列、一行只摆一组」对带 `span` 的格整个失效——而 `span` 的本意是「这一格要比别人宽」，窄档里它反而**比不带 `span` 的邻居窄一半**，宽窄倒过来了。

  实测（300px 视口、`columns=4`、第二格 `span=2`）：不带 `span` 的三格各 300px，带 `span` 的那格只有 **144px**，右边留着 150px 的空底；375px 视口里那一格的取值只分到 **181.5px**，一个地址要多折一行。现在四格都是 300px，取值拿到整行的 375px。

  改法：`getItemProps` 不再写 `style.gridColumn`，改把这个数落成 `--xh-_descriptions-item-span`（没写 `span` 即落空串把槽摘掉）；皮肤在窄档照旧 `grid-column: 1 / -1`，`span` 一律不认，宽档写 `grid-column: span var(--xh-_descriptions-item-span)` 把它接回来。

  逐档的认与不认：

  - 窄档（一行一组）：不认。二到六列每格都占满整行。
  - 768px 档的四列与六列（一行两格）：不认。一行只有两格时，认了 `span` 的那格照样比邻居窄。
  - 768px 档的二列与三列、1024px 档的四五六列（按作者写的列数摆）：认。实测 1100px 视口、`columns=4`，不带 `span` 的格 266px、带 `span=2` 的 544px（两条轨道加中间那道 12px 的缝），与改前逐一相等。

  `span` 的钳位没动（小于 1 按 1 算，超过列数按列数算）。不带 `span` 的格解析成 `span 1`，与从前的 `auto` 摆法等价，计算样式快照里不含 `grid-column`，三家适配器逐帧对拍不受影响。三家适配器都只是把 `getItemProps` 原样铺开，没有各自的改动。

  **够不着的那一档**：带边框时那套画网格线的 `nth-child` 规则按「每格宽度一致」算行首与首行，一份描述里混进 `span` 之后行的相位会错开，某几格的边线画不准。这一条在改动前后一样，不在这次的范围里。

- ae38d9a: **Dialog 触发器与关闭按钮接入 Action Control 与按压通道，说明文字改说明档，模态正文滚动归档。** 连接层的
  trigger 新增稳定属性 `data-xh-action-control` / `data-xh-action-profile="text"` / `data-xh-action-display="always"` /
  `data-xh-action-size="md"` / `data-xh-action-variant="outline"`；close-trigger 新增
  `data-xh-action-profile="icon"` / `data-xh-action-size="sm"` / `data-xh-action-variant="ghost"`。作者以 asChild
  换成自己的按钮时，家族标记不落到它身上。机器新增按压通道（`context.pressed` 记正被按住的那颗：`trigger` /
  `close-trigger`，导出类型 `DialogPressedPart`；Drawer 跑的是同一台机器，其事件表同步多出 `PRESS.START` /
  `PRESS.END`），Space / Enter 与触屏按住期间该按钮投影 `data-pressed`，面板收起时一并松开；键盘表新增
  `dialog.kbd.press`。

  视觉默认变化：trigger 此前是 UA 裸按钮，现由家族配方按 outline 列给出 md 档盒型、中性描边、悬停
  `--xh-bg-subtle`（100）→ 按下 `--xh-bg-subtle-hover`（200）并 0.97 缩放。close-trigger 删除自写的悬停 200 / 按下
  300、聚焦铺 `--xh-material-elevated-focus-surface` 实体底，改由配方 ghost 列给出（悬停 100 → 按下 200，焦点面透明吃
  库环）；作者塞入的图标由随文 1em 改为随档 16px。description 字号缺省 `--xh-text-body-size` 14 →
  `--xh-text-secondary-size` 13。content 的 `--xh-icon-size` 缺省由 `--xh-glyph-size-text` 改为 `--xh-glyph-size-md`。
  body 新增 `overscroll-behavior: contain` 与带 `:not([data-xh-scrollbar])` 守卫的 `scrollbar-gutter: stable`。

  公开槽 `--xh-dialog-close-size / -radius / -fg / -fg-hover / -bg-hover / -bg-active / -bg-focus / -fg-focus` 改为桥接
  到配方之前（`-bg-focus` / `-fg-focus` 桥到配方的 focus-visible 面，缺省不再铺实体底而是透明底 + 悬停字色，槽本身
  保留）。

- 228a4f0: Dialog 默认皮肤迁移到 M4 高层玻璃：正文采用高遮蔽表面、标题区使用可覆盖 lens，补齐边缘高光、三层投影、柔和模糊遮罩及辅助模式降级。

  Dialog 皮肤压缩后由 8455 增至 10808 字节；增长来自正文保护区、lens 渐变、分段边缘与 M4 三层投影，已通过皮肤体积门禁重录基线，不提高全局阈值。

- ccec02d: **新增** `diff-view` 组件：一份改动的逐行呈现，单栏与并排两种形态，Vue 与 Web Components 两侧同时可用。

  **两个入口归一到同一个模型**：`computeTextDiff(before, after)` 拿新旧两版全文算（Myers 最短编辑脚本），`parseUnifiedPatch(patch)` 解析统一格式的补丁；组件只认模型，两种输入在 AI 场景里都真实存在。另导出 `diffStats(model)` 数增删。

  **着色在建模时一次算好，不在连接层跑。** `computeTextDiff` 手里有两份完整文本，整体切一次再按行取，跨行的块注释与多行字符串才不会着错色；`parseUnifiedPatch` 拿不到完整文件，因此**一律不填着色**——宁可不着色也不错着色，与代码视图「未闭合默认不着色」是同一条取舍。

  `maxLines` 是必须有的上限：AI 会吐超大文件，超出即截断并在根上标出来。编辑距离超过内部上限时整段按「全删全增」呈现——那种情况下两份文本几乎没有共同行，逐行对齐既算不快也读不出意义。

  表格语义完整：`role=table` 配 `role=row` 与 `role=cell`，带 `aria-rowcount` / `aria-rowindex` / `aria-colcount` / `aria-colindex`。**列数只数真正暴露的内容列**——行号不算列，它不给 role、对读屏隐藏、由皮肤用 `attr()` 画出来，所以复制差异不会带上行号。并排视图里空的那一侧**照发格子**，否则列号会串位。每一行都带一段视觉隐藏的变更类型文字：变更不能只靠颜色传达。

  **刻意不采表格那套行级 roving**：只读差异不是网格，给每份差异一个吞方向键的焦点组会把页面滚动抢走，而读屏本来就有表格浏览模式。整份差异只占一个 Tab 停靠点。

  `contextLines` 把远离变更的连续上下文折成一格，展开集合可受控。

  **新增** 语义令牌 `--xh-diff-added-bg` / `--xh-diff-added-fg` / `--xh-diff-removed-bg` / `--xh-diff-removed-fg`：增删两色随主题明暗切换。

- 02713ab: **DownloadTrigger 接入 Action Control 形态矩阵与按压通道。** 连接层的 root 新增稳定属性
  `data-xh-action-variant`（缺省 `subtle`，只有 `solid` 才品牌实心），`data-variant` 不传时显式落 `subtle`；
  机器新增按压通道，Space / Enter 与触屏按住期间 root 投影 `data-pressed`（禁用或取数在途不进入），键盘表
  新增 `download-trigger.kbd.press`。皮肤删除六支形态私有槽、四档形态块、三档尺寸块、自写的 hover /
  active / :disabled 面与整段自写盒型（display / 高度 / 内距 / 边 / 底 / 字号 / 手型 / 过渡），颜色、几何、
  0.97 按压缩放（此前锁 `scale: none`）、换底与 44px 命中区由家族配方给出（没写内容的按钮 ::after 被兜底
  字形占着，粗指针命中区改由空着的 ::before 扩）；公开槽 `--xh-download-trigger-bg / -bg-hover / -bg-active / -bg-disabled / -fg / -border / -border-hover / -border-disabled / -shadow-hover / -h / -px / -gap / -font-size / -icon-size` 改为桥接到配方之前（solid 不再悬停抬影，`-shadow-hover` 缺省 none）；取数在途
  的圆环颜色改取加载态前景；加载环由 pill 改 circle。
- 31ab5d8: **Drawer 面板改 M4 sheet 三件套并走 slide 入场，触发器与关闭按钮接入 Action Control 与按压通道。** 连接层的
  trigger 新增稳定属性 `data-xh-action-control` / `data-xh-action-profile="text"` / `data-xh-action-display="always"` /
  `data-xh-action-size="md"` / `data-xh-action-variant="outline"`；close-trigger 新增
  `data-xh-action-profile="icon"` / `data-xh-action-size="sm"` / `data-xh-action-variant="ghost"`。作者以 asChild
  换成自己的按钮时，家族标记不落到它身上。Space / Enter 与触屏按住期间该按钮投影 `data-pressed`（记在与 Dialog 共用的
  机器 `context.pressed` 里，抽屉收起时一并松开），键盘表新增 `drawer.kbd.press`。

  视觉默认变化：content 由 `--xh-bg-surface` 底 + `--xh-elevation-sheet` 影、无描边，改为
  `--xh-material-elevated-border` 1px 描边 + `--xh-material-elevated-bg` 底 + `--xh-material-elevated-shadow`
  （新增公开槽 `--xh-drawer-border`；`--xh-drawer-bg / -shadow / -fg` 缺省随之改为 elevated 令牌）；四向入场由
  `--xh-motion-duration-enter` + `--xh-motion-ease-enter-strong` 改为 `--xh-motion-duration-slide`（320ms）+
  `--xh-motion-ease-slide`，退场不变；blur 遮罩补 `-webkit-backdrop-filter`。trigger 删除自写的描边盒型（静息
  `--xh-bg-canvas` 底、悬停 200、按下 300、只缩放）改由配方 outline 列给出（静息透明底，悬停 `--xh-bg-subtle` 100 →
  按下 `--xh-bg-subtle-hover` 200 并 0.97 缩放）；展开期间的压住面由 `--xh-bg-subtle-active` 改为悬停同档的
  `--xh-bg-subtle`，该态的 currentColor 环规则与 `:disabled` 置灰规则删除；作者塞入的图标由随文 1em 改为随档 20px。
  close-trigger 删除自写的悬停 200 / 按下 300，改由配方 ghost 列给出（悬停 100 → 按下 200）；图标改随档 16px。
  description 字号缺省 14 → `--xh-text-secondary-size` 13。root / content 的 `--xh-icon-size` 缺省改
  `--xh-glyph-size-md`。content 与 body 新增 `overscroll-behavior: contain`，body 新增带 `:not([data-xh-scrollbar])`
  守卫的 `scrollbar-gutter: stable`。

  公开槽 `--xh-drawer-trigger-gap / -h / -px / -radius / -font-size / -bg / -fg / -border / -bg-hover / -border-hover / -bg-active / -bg-open / -border-open`、`--xh-drawer-close-size / -radius / -fg / -fg-hover / -bg-hover / -bg-active`
  改为桥接到配方之前；新增 `--xh-drawer-close-bg-focus` / `--xh-drawer-close-fg-focus`，桥到配方的 focus-visible 面
  （与 Dialog 关闭钮同名同缺省：透明底 + 悬停字色）。

- fa08fb4: **反馈与状态族补十一项能力，全部是加法：不渲染新部件、不写新 prop 的既有用法逐值不变。**

  **`alert` 补 `content` 与 `action` 两个部件。** `content` 是文本列容器，套上它标题与说明就排成真正的一列；不套时 root 那层 `flex-wrap` 的旧排法一字未动。`action` 是操作槽，圈出按钮区、自占一行——此前全族只有 `alert` 是「能关不能做」的一件。Vue 侧新增 `XhAlertContent` / `XhAlertAction`，Web Components 侧新增两个 `csspart`。新增覆盖槽 `--xh-alert-content-gap` 与 `--xh-alert-action-gap`。

  **`toast` 补 `indicator` 与 `progress` 两个部件。** `indicator` 让作者换得掉那枚严重度字形：不渲染它时 root 伪元素上的兜底字形照旧，渲染了就由 `:has()` 让位，一行里不会出现两枚图形；部件为空时皮肤按 `data-severity` 画同一套兜底字形（`loading` 那一档连自转一起带上，并各自配了两块减弱动效停表）。`progress` 是倒计时条：连接层把机器算出的停留时长写进 `--xh-toast-progress-duration`，不自动消失的那些整条收起；指针悬停或焦点停留把计时按住时，动画随 `data-paused` 一并停住。新增 api 只读字段 `duration`，新增覆盖槽 `--xh-toast-progress-thickness` / `--xh-toast-progress-bg`。

  **`notification` 补 `item-progress` 部件**，与 `toast` 的那条同一件事：横跨卡片、走同一条 `xh-countdown`、同样随 `data-paused` 停表。新增 api 只读字段 `duration`，新增覆盖槽 `--xh-notification-progress-thickness` / `-radius` / `-bg`。

  `toast` 与 `notification` 的 `data-paused` 此前登记在 `check-dead-state-attr` 的「解剖里没有能承载停表的部件」名下，两条登记随这两个部件删除。

  **`loading-bar` 补 `peg` 部件**：跟在进度段末端的一道亮边，作者也可以往里塞自己的图形。它是纯装饰，进度仍由 range 的宽度与 root 上的 `aria-valuenow` 表出；高对比档整层背景图被丢弃，这一档由 range 自己的底色接住。新增覆盖槽 `--xh-loading-bar-peg-w` / `-fg`。

  **`empty-state` 补 `media` 部件**：插画槽，与图标槽二选一，尺寸另走一档（缺省由图标档翻一倍派生，跟着三个尺寸档走）。插画塞进按字形量的图标槽会被压到 40px 以下，这是它此前无处可放的原因。新增覆盖槽 `--xh-empty-state-media-size` / `-fg`。

  **`empty-state` 补语气轴 `tone`**（六值，不写即维持中性）。写了就把图标区的强调色接到语气层派生好的前景档上；两条规则排在状态码那几条之后，`status` 与 `tone` 都写时以显式的语气为准。

  **`spinner` 补形态轴 `variant`**（`ring` / `arc` / `dots`，缺省 `ring` 逐值等于现状）。`arc` 用锥形渐变加一圈环形遮罩画渐隐弧，转的还是同一条 `xh-spinner-rotate`；`dots` 是一行三点整组呼吸，自带 `xh-spinner-dots` 与两块减弱动效停表。高对比档会把整层背景图丢掉，两档在那一档里退回描边画法。

  **`skeleton` 补动效轴 `animation`**（`shimmer` / `pulse` / `none`，缺省 `shimmer` 逐值等于现状），落在容器的 `data-animation` 上。`pulse` 撤掉微光那层、整根条子在原色与禁用档之间来回淡（自带 `xh-skeleton-pulse` 与两块停表），`none` 两层动效都撤掉只留底色。新增覆盖槽 `--xh-skeleton-pulse-duration`。

  **`progress` 补语义轴 `semantics`**（`progress` / `meter`，缺省 `progress`）。`meter` 档发 `role="meter"` 并且 `indeterminate` 不再生效——磁盘占用、电量、评分这类量没有「未知」这一档。不新建组件：两者的皮肤逐行同构，拆开只会多出一份要同步维护的孪生皮肤。新增 api 只读字段 `semantics`。

- 90564e7: 建立由单一 JSON 真源生成的 Field Chrome Family Recipe，统一 single-line、textarea、multi-tag 三类布局，sm/md/lg 与 compact 尺寸，以及 rest、hover、focus、invalid、readOnly、disabled、loading 状态。

  TextField 首批迁入：Headless 改用 `data-xh-field-*` 投影字段视觉角色，并让 clear 复用 Action Control 的 `field-inset` / `has-value` 合同；移除旧 `data-multiline`、`data-auto-resize` 视觉钩子。独立皮肤与 full bundle 均包含同一份 Field Chrome、placeholder/autofill/forced-colors/reduced-motion 与粗指针 clear 规则。

- df18553: 统一日期、时间、文本、数字与通用表单字段的默认视觉盒，并将日期区间选择的默认日历面板收为单栏。
- fee406a: **新增** `--xh-field-label-gap-block`：竖排字段里标签与控件之间那一段距离的覆盖槽。

  从前竖排下这段距离没有自己的槽。字段根是一列 flex，标签 → 控件、控件 → 说明、说明 → 错误文案三段共用 `--xh-field-gap`，要把标签那一段单独放宽就只能连着另外两段一起改。已有的 `--xh-field-label-gap` 只在标签左置那一档当列间距用，竖排下它一寸也不管。

  新槽落在标签的 `margin-block-end` 上，按差值补在容器 gap 之上：**不设它时差值算成 0，各段距离逐值不变**（实测 4px → 4px）；设成 `16px` 则标签 → 控件量到 16px，控件 → 说明仍是 4px。表单的 `vertical` 与 `inline` 两档字段根都是竖排，同一支槽一起管；`horizontal` 那一档标签与控件是左右两列，这段补白在那儿清零，列间距照旧归 `--xh-field-label-gap`。

  `--xh-field-gap` 与 `--xh-field-label-gap` 两个槽名与取值都没动。

- 6b4c5d0: **改动** 字段的外框尺寸不再随错误文案的出现而变化。

  从前错误文案是流内的一块，从收起变成显示就把字段撑高一行。实测一个不带说明的字段：常态 50px，报错 73.5px，**一段错误文字长 23.5px**。整表跟着重排；父级限高又裁切时，长出来的那一截连同控件一起被挤出可视区（把父级掐在 50px 上量，错误文案的可见面积是 0）。

  带说明的字段早先就不撑高——说明与错误文案共用控件下方那一行，报错时说明让位（见 `description.css`）。撑高的只是**没有说明**的那一档。

  现在给辅助文字那一行留了固定的占位：字段渲染了错误文案、当前又没在报错时，根上补一个与错误文案等高的空块（`::after`，高度取 `1lh`，字号行距跟着 `--xh-field-error-font-size` 与 `--xh-leading-normal` 走）；报错时空块让位给错误文案。实测常态与报错态都是 73.5px，**差 0**；把父级掐在 73.5px 上量，错误文案可见面积与自身面积相等，一点没被裁。横排（`data-layout="horizontal"`）下占位块落在控件那一列，两态同样等高。

  两个条件缺一不可，所以占位不会到处冒出来：

  - 必须渲染了 `error-text` 且它当前带 `hidden`——**没渲染错误文案的字段一寸也不多占**（实测仍是 50px）；
  - 必须没有在场的 `description`——说明已经占着那一行了，那一档逐值不变。

  代价如实说：渲染了错误文案、又没有说明的字段，常态永久多出一行（23.5px）的空白。这一档换来的是外框恒定。

  **没有改用悬浮**。悬浮层量下来外框高度确实不变，但它把「字段被撑高」换成了「消息看不见」：父级限高又裁切时可见面积是 0，正是限高场景要解决的那件事；它还会盖住下一个字段（量到 1120px²），且带说明的字段会反向缩 23.5px。**也没有把消息压在控件盒内**：那样会盖住控件 61% 的面积，用户刚打的值被自己的错误提示挡住。

  无障碍那一路一个字没动：`error-text` 常态下仍由 `hidden` 属性收起、算出来是 `display: none`，占位是根上的伪元素，不带内容也不进无障碍树；报错时 `aria-describedby` 照旧同时指向说明与错误文案两段。

  `field.css` 因此从 3792 涨到 4276 字节（去注释压空白后），涨的是上面两条规则。

- 5c202e3: **FileUpload 选择钮、逐条删除钮与清空钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
  按压面。** 机器 context 新增 `pressed`（按 key 记住正被按住的那一个，删除钮按文件标识；新增导出类型 `FileUploadPressedKey`），
  事件 `PRESS.START` / `PRESS.END` 挂根级，禁用时不进；按住途中转入禁用，或按住的删除钮随文件一起离开列表（Enter 在 keydown
  即删）时由机器自行松开；选择钮打开系统文件框后随窗口失焦撤下。投放区仍不投影（按下回执由拖入态给出）。皮肤里三颗钮的按压规则
  由 `:active` 改为 `:is(:active, [data-pressed])`，并在 `forced-colors: active` 下用系统高亮反色画回按压面。键盘表新增
  `file-upload.kbd.press`。三端公开 props 与事件不变。
- 1516b35: **FloatButton 触发器接入 Action Control floating 档与按压通道。** 连接层的 trigger 新增稳定属性
  `data-xh-action-control` / `data-xh-action-profile="floating"` / `data-xh-action-display="always"` /
  `data-xh-action-size`（随 `size`，缺省 `md`）/ `data-xh-action-variant`（缺省 `outline`，只有 `solid` 才品牌
  实心），root 的 `data-variant` 不传时显式落 `outline`——缺省与显式 `variant="outline"` 从此是同一档，见下；
  机器新增按压通道，Space / Enter 与触屏按住期间 trigger 投影 `data-pressed`（禁用不进入），键盘表新增
  `float-button.kbd.press`。

  视觉默认变化：触发器直径由 `--xh-control-h-lg` 40px 改为 floating 档 md 的 `--xh-control-box-lg` 48px
  （compact 44px；sm 40px、lg 56px），图标由随文 1em 改为随档 24px（sm 20 / lg 32）；缺省磨砂面的悬停 /
  按下由 200 / 300 档改为画布承载阶梯 `--xh-bg-subtle`（100）→ `--xh-bg-subtle-hover`（200），ghost 同。
  显式 `variant="outline"` 自身的观感也变了：迁移前它是磨砂底 + `--xh-_tone-border-control`（缺省
  `--xh-border-control`，悬停升 `--xh-border-control-hover`）描边、无顶光无 backdrop，`tone` 作用在描边上；
  迁移后它与缺省合流为同一份 M2 磨砂面——描边取 `--xh-material-frosted-border`（悬停不变）、前景取
  `--xh-material-frosted-fg`、带顶光与 backdrop。`tone` 不再作用于 outline 的静息描边与前景，只在悬停 /
  按下的底上仍走 `--xh-_tone-subtle` 阶梯；要一支带语气的描边浮钮，用 `solid` / `subtle` 或写
  `--xh-float-button-border` 覆盖。文档「变体」示例随之去掉与 outline 重复的缺省项。
  皮肤删除触发器自写的盒型、四态面、hover / active / focus-surface / disabled 规则与粗指针命中区（改由家族
  配方给出），公开槽 `--xh-float-button-bg / -bg-hover / -bg-active / -fg / -border / -border-hover / -shadow / -radius / -size / -icon-size` 改为桥接到配方之前；`--xh-_float-button-radius` 私有槽删除。展开列表里的原生
  动作项不是 Headless 部件，仍由皮肤按同一张 floating 档尺寸表与形态表画面。皮肤体积随桥接槽增加约 16%。

- 31b9569: 角落浮钮家族（FloatButton、BackTop）缺省触发器迁移到 M3 通透玻璃：同源消费 `material.glass` 的背景、边缘、高光、柔影、磨砂与实体焦点面；显式形态保持原有语义表面。

  FloatButton 的压缩皮肤由 7894 增至 8537 字节，BackTop 由 4740 增至 5359 字节；增量来自 M3 顶光、backdrop、实体焦点面及辅助模式验证入口，已重录逐皮肤体积基线，不提高全局阈值。

- 72ac8eb: **FloatingPanel 三种按钮接入 Action Control 与按压通道，当前形态钮改品牌淡底。** 连接层的 trigger 新增
  稳定属性 `data-xh-action-control` / `data-xh-action-profile="text"` / `data-xh-action-display="always"` /
  `data-xh-action-size="md"` / `data-xh-action-variant="outline"`；window-state-trigger 与 close-trigger 新增
  `data-xh-action-profile="icon"` / `data-xh-action-size="sm"` / `data-xh-action-variant="ghost"`。机器新增按压
  通道（`context.pressed` 记正被按住的那颗：`trigger` / `close-trigger` / `window-state:<形态>`，导出类型
  `FloatingPanelPressedPart`），Space / Enter 与触屏按住期间该按钮投影 `data-pressed`（形态钮禁用时不进入，
  按住途中被禁用由机器收面；开合与关闭不受禁用影响），键盘表新增 `floating-panel.kbd.press`。

  视觉默认变化：trigger 删除自写盒型与只缩放不换底的 `:active`，改由家族配方按 outline 列给出——静息底由
  `--xh-bg-surface` 改为透明（描边不变），悬停
  `--xh-bg-subtle`（100）→ 按下 `--xh-bg-subtle-hover`（200）并 0.97 缩放；作者塞入的图标由随文 1em 改为
  随档 20px。形态钮与关闭钮删除自写的悬停 200 / 按下 300、聚焦铺 `--xh-material-frosted-focus-surface` 实体底
  与禁用面，改由配方 ghost 列给出（悬停 100 → 按下 200，焦点面透明吃库环，禁用 `--xh-fg-disabled`）；当前形态
  的按钮（`data-state="on"`）由 `--xh-bg-subtle-active` + `--xh-fg-default` 改为品牌淡底 `--xh-bg-brand-subtle`

  - `--xh-fg-on-brand-subtle`（悬停 20% → 按下 28%），on 态的 currentColor 环规则删除；图标由 1em 改为
    随档 16px。标题字重 `--xh-text-label-weight` 500 → `--xh-font-weight-semibold` 600。root / content 的
    `--xh-icon-size` 缺省由 `--xh-glyph-size-text` 改为 `--xh-glyph-size-md`。body 新增
    `overscroll-behavior: contain`。

  公开槽 `--xh-floating-panel-trigger-h / -px / -radius / -bg / -fg / -border`、
  `--xh-floating-panel-action-fg / -fg-hover / -fg-active / -bg-hover / -bg-active / -size / -radius`、
  `--xh-floating-panel-close-size / -radius` 改为桥接到配方之前（`-action-fg-active` / `-action-bg-active`
  现指按下态）；新增 `--xh-floating-panel-action-bg-on / -bg-on-hover / -bg-on-active / -fg-on`。

- 31b9569: **FloatingPanel 默认皮肤迁移到 M3 浮动玻璃配方。**

  内容面、标题栏、边缘、顶边高光与投影现在统一消费 `material.glass`；原有 `--xh-floating-panel-*` 覆盖槽仍优先。标题栏的形态和关闭按钮在键盘聚焦时先落到 `material.glass.focus-surface` 的实体隔离底，避免透入宿主背景后看不清焦点环。高对比、减少透明、强制色和打印不再由组件另开分支，而是由 M3 令牌原位改为可读的实体表面。

- 1f472ba: `floating-panel` 接上退场闸门，并补上进退场动画。

  此前它是浮层族里唯一没接 presence 的一个：收起那一帧定位层直接 `display: none`，退场动画连播都播不出来。现在两个适配器都把定位层的收起从「跟着展开态」改成「跟着 presence」——退场动画播完才真收。

  皮肤补一对关键帧（`xh-pop-in` / `xh-pop-out`，与锚定浮层族同一份内容），挂在 `positioner` 上：面板整棵子树都在它底下，收起与动画落在同一个节点才不会互相掐掉。随之撤掉 `[data-part='positioner'][hidden] { display: none }`——留着它退场一帧都播不出来，真正的收起改由适配器写内联 `display`。

  Vue 侧 `FloatingPanelContext` 多出 `positionerRef` 与 `visible` 两个字段。

- d51d182: **高对比档补上状态通道：新增公共补救层 `forced-colors.css`，八份皮肤各带一块自己的补丁。**

  Windows 高对比模式（`forced-colors: active`）里系统接管配色：作者写的每一个颜色取值都被换成系统调色板里的对应角色，`box-shadow` 与 `background-image` 直接丢弃。此前全库只有 `gradient-text` 一份表态，其余皮肤在这一档里普遍失效——列表的悬停档与展开路径档塌成同一个样子、勾上与没勾上分不出来、浮层与页面之间零分界、骨架屏与热力图整块空白。这一档在开发机上一点征兆都没有，所以一直没人发现。

  新增的公共补救层按状态词汇表把通道补回来，一处收 133 份皮肤：

  - 轻档（`data-highlighted`）画一圈内收的虚线环，强档（`data-selected` / `data-current` / `data-in-path` / `data-in-range` / `data-passed` / `data-indeterminate`，以及 `data-state` 的 `checked` / `indeterminate` / `active` / `on` / `current` / `completed` / `open`）画一圈更粗的实线环，两档一眼分得开；
  - 禁用换 `GrayText`，只读改画虚线边；
  - 定位层里那张面补一圈实边——三档海拔角色都写在 `box-shadow` 上，这一档里整层丢弃。

  自带补丁的八份：`color-picker` 与 `heatmap` 画的就是颜色本身，退出强制着色并各补一圈系统描边；`diff-view` 的新增行与删除行改画一实一虚两圈环；`rating` 的点亮与半颗改用系统的高亮色与不可用色分档；`skeleton` 描一圈边把条子勾出来；`reasoning` 与 `tool-call` 把裁到字形上的填充还回去；`gradient-text` 原有那块保留。

  补救块里的颜色一律只写系统调色板关键字（`Canvas` / `CanvasText` / `ButtonFace` / `ButtonText` / `ButtonBorder` / `Highlight` / `HighlightText` / `LinkText` / `GrayText`）——令牌在这一档已经不生效，写了是误导。

  新增门禁 `check-forced-colors.mjs`：选择器带状态钩子、声明里只改了底色、又没有 border / outline / 字形通道的规则，那个钩子必须落在公共补救层或本皮肤自己的补救块里；靠 `background-image` 承载信息的皮肤必须自带补救块；补救块里引颜色令牌即判红；公共补救层必须排在最后一条皮肤 `@import` 上，无层版产物里也必须落在最后一个皮肤标记之后——它与组件皮肤同层同特指度，谁赢全看源序，挪到前面去有层版与无层版会一起失效。两份登记名单都做过期反查。扫描面取自状态词汇表全集，新加一个状态属性自动进扫描面。

  常态渲染一个像素都没变：新增的规则全部关在 `@media (forced-colors: active)` 里。

- fa08fb4: **新增**文本输入与表单外壳族的能力补齐，九个组件共 16 条，全部是加法：部件、prop、覆盖槽都是新增，一个都没删也没改名，不改一行代码升上来渲染逐值不变。

  **装饰段**。`text-field` 与 `number-field` 各补 `prefix` / `suffix` 两个部件，流式排在 `input` 两侧、随 `data-disabled` 变淡、`aria-hidden` 不进可及树。框内摆货币符、单位或图标不必再自己套节点：

  ```vue
  <XhTextFieldControl>
    <XhTextFieldPrefix>¥</XhTextFieldPrefix>
    <XhTextFieldInput />
    <XhTextFieldSuffix>元</XhTextFieldSuffix>
  </XhTextFieldControl>
  ```

  **字数提示**。`text-field` 与 `tags-input` 各补 `count` 部件与 `showCount` prop；不写子节点时自己渲「已用 / 上限」，`TextFieldApi` 另开 `count` / `maxLength` / `showCount` 三个只读项。机器早就算得出 `atLimit`，现在有承载它的落点。

  **口令强度**。`password-input` 补 `strength-meter` 部件与 `strength` prop（0–4 五档，夹回区间后落 `aria-valuenow` 与 `data-level`，不给即整条收起）。打分算法归调用方——库不猜什么叫「强」。

  **分段与只读**。`pin-input` 补 `group` / `separator` 两个部件（`123-456` 这类分段写法有了角色节点，下标仍按文档序算）、逐格补发 `data-empty`，并补 `readOnly` 与 `required` 两个 prop（原生 `readonly` / `required` 加机器守卫，从此不必用全禁用代替只读）。

  **就地编辑的三条轴**。`editable` 补 `variant` / `tone` / `size`：尺寸换根上四个私有槽，形态给 outline / subtle / ghost 三档，语气落在聚焦描边与提交钮上。三颗按钮刻意不进尺寸档——比框小一号是形上的固定关系。

  **数组字段**。`field-array` 补 `invalid` / `readOnly` / `name` 三个 prop 与根级 `FORM.RESET`，给了 `name` 之后每行经 `item.name` 拿到 `名字[下标]`；另补 `item-label` 部件与行级 `data-invalid` / `data-readonly` / `data-at-min` / `data-at-max`。整份数组从此进得了原生表单、也认表单重置。

  **提及框**。`mention` 补 `label` 部件（`for` 写向真输入框）与 `empty` 部件（给了 `collection` 却一条不剩时显出，`role=status`），再补 `name` prop 与根级 `FORM.RESET`。

  **字段组排布**。`fieldset` 补 `field-group`（够宽自动分栏的一段字段）与 `actions`（组末尾那一行按钮）两个部件，并排字段与按钮行不必再自己套裸 `div`。

  配套的覆盖槽同批开出：`--xh-text-field-affix-*` / `-count-*`、`--xh-number-field-affix-*`、`--xh-password-input-strength-*`、`--xh-pin-input-separator-*` 与 `-box-bg-readonly`、`--xh-field-array-item-label-*`、`--xh-mention-label-*` / `-empty-*`、`--xh-tags-input-count-*`、`--xh-fieldset-field-group-*` / `-actions-gap`。

  **未做**：`field-array` 的 `variant` / `tone` 两条轴（那两条说的是控件盒的底与描边，而它的行没有盒，只补 `size` 会成半套三轴）、`fieldset` 的禁用够到 `div` 型控件（两条实现路径一条要拿无障碍换行为正确、一条要越过「只产出属性不改作者 DOM」的契约）。`fieldset` 的 doc 已写明现状：`disabled` 只连坐原生表单控件，组内 `div` 型控件须各自接 `disabled`。

- fee406a: **新增**表单的网格排布档。`layout` 从三档变四档，多出来的 `grid` 把字段排进等宽列；三档老值渲染逐值不变，不改一行代码升上来看不出差别。

  列数走新 prop `columns`，与栅格的 `cols` 同一套写法：整数是各档同一个列数，断点对象 `{ base, sm, md, lg, xl }` 逐档取值，没写的档沿用比它窄的那一档。取值 1 至 4，范围外按一列排。

  ```vue
  <XhFormRoot layout="grid" :columns="{ base: 1, md: 2 }">
    <XhFormFieldGroup value="name">…</XhFormFieldGroup>
    <XhFormFieldGroup value="phone">…</XhFormFieldGroup>
    <XhFormFieldGroup value="address" span="full">…</XhFormFieldGroup>
  </XhFormRoot>
  ```

  跨列由字段容器自报：`FormFieldGroupProps` 补 `span`，收 1 至 4 与 `full` 两种写法，落成 `data-span`。`full` 占满整行且跟着当下的列数走——窄视口收成一列时它仍是一整行；写数字则是固定跨度，比当下列数还大会多撑出一列。

  Web Components 侧 `<xh-form>` 补 `columns` 特性（写整数或 JSON 对象），字段容器的角色节点上再写个 `span` 特性；两者的取值判定与 Vue 侧同一份代码。

  皮肤补 `[data-layout='grid']` 一段：`data-columns` 与逐档的 `data-columns-sm/-md/-lg/-xl` 各接一条规则，`data-span` 接跨列。四个断点宽度与栅格同源。

  **未做**：整份轨道表的使用者覆盖槽（`columns` 已覆盖 1 至 4 与逐档写法，要非等宽的两列直接在自己的表单元素上写 `grid-template-columns`）；`labelWidth` / `labelAlign` 仍只在 `horizontal` 下生效，网格档里标签在控件上方。

- affa413: **Form 提交钮、重置钮与错误摘要条目接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副
  按压面。** 机器 context 新增 `pressed`（按 key 记住正被按住的那一个，摘要条目按字段路径键区分；新增导出类型
  `FormPressedKey`），事件 `PRESS.START` / `PRESS.END` 挂根级；整体禁用一律不进，只读时重置钮不进，所指字段没有错误
  （藏着）的条目不进；异步校验在途（提交或逐字段）时不进，按住途中开跑即由机器松开。按住途中转入禁用 / 只读，或条目所指
  字段改好了时同样松开。皮肤里错误摘要条目补上集合行的换面反馈：悬停 `--xh-bg-subtle`（100）、按下
  `--xh-bg-subtle-hover`（200）只换面不缩放，走按压 / 释放时间线，`forced-colors: active` 下用系统高亮反色画回；新增
  覆盖槽 `--xh-form-summary-item-bg / -bg-hover / -bg-pressed / -px / -radius`。键盘表新增 `form.kbd.press`。三端公开
  props 与事件不变。
- 5cfe820: **`heatmap` 详情条改与 Tooltip 同一副气泡，默认渲染会变。** `[data-part='tooltip']` 补一圈
  `var(--xh-stroke-thin)` 描边，颜色从字色里兑两成（`color-mix(in oklab, var(--xh-heatmap-tooltip-fg) 20%, transparent)`），
  与 `tooltip` 的 content 同一算法——真源 §8.4 规定任何浮层的 content 都必须有非透明描边，不得只靠影分层；深浅主题
  与作者换字色时描边跟着走。影由锚定浮层的 `--xh-elevation-floating` 改为 `--xh-material-frosted-compact-shadow`（frosted
  紧凑档，与 Tooltip 同深）；字号由 `--xh-text-caption-size`（12px）改为 `--xh-control-caption-md`（13px，Tooltip 缺省档）。
  反白底色、control 圆角、内衬与落点算法都不变。

  **新增 1 个使用者覆盖槽**：`--xh-heatmap-tooltip-border`；`--xh-heatmap-tooltip-shadow` 与 `--xh-heatmap-tooltip-font-size`
  的缺省值如上变更。check-elevation-role 登记 `heatmap.tooltip` 由 `floating` 改为 `frosted`。

- cd1a841: **HoverCard 说明文字改说明档，卡片面补 overscroll 隔离，自绘条走浮层档。** 视觉默认变化：description 字号
  `--xh-text-body-size` 14 → `--xh-text-secondary-size` 13（新增 `--xh-hover-card-description-font-size` 槽）；content
  新增 `overscroll-behavior: contain`，滚到头不再把页面一起带走；三端的自绘滚动条改走浮层 4px 档（`size: 'sm'`）。
- 1e7eb6f: HoverCard 内容面与 Popover 共用 M2 磨砂材质：背景单层模糊、顶光、边界与浮层阴影统一，文字保持不透明。箭头只读取同一底色和边界，不重复模糊。新增 `--xh-hover-card-backdrop` 覆盖槽。

  减少透明、高对比与强制颜色模式使用材质令牌对应的实体配方，强制颜色明确撤去装饰背景图；打印继续隐藏浮层。保留既有悬停宽限区与尺寸逻辑。

  去注释压空白的皮肤体积从 4988 增至 5453 字节，增量为材质、模糊及强制颜色规则；仅更新本组件基线，保持 10% 容差。

- 7b187ca: **四组皮肤的悬停强度、粗指针热区与无色档一起补齐。**

  **悬停回执分两族给足。** 此前全库有八十余条悬停规则只换一样东西：输入盒只挪一格 `border-color`（一条 1px 的描边色变化，在整框面积上读不出来），按钮形的面只换一层底色。现在按部件形态分两族：

  - **输入族换填充**——`text-field` / `number-field` / `password-input` / `pin-input` / `tags-input` / `mention` / `editable` / `select` / `combobox` / `cascader` / `tree-select` / `popselect` / `date-picker` / `time-picker` / `date-field` / `time-field` / `color-picker` / `prompt-input` / `file-upload` 的输入盒在换描边之外同时换底色，`transition` 补上 `background`。悬停底取本档常态底朝淡底兑一小步（`outline` 从画布起、`ghost` 从透明起），`subtle` 那一档换到淡底自己的悬停档；只读与禁用两档排除在外——它们的底色本身就在表达"改不动"。
  - **按钮形的面抬起一档**——`button`（`solid` 档抬升与顶边高光一起列，`outline` / `ghost` 两档收成 `none`）、`clipboard` / `download-trigger` / `timer` / `transfer` / `carousel` / `signature-pad` / `file-upload` 的动作钮悬停接 `--xh-elevation-raised`，按下收回，`transition` 补上 `box-shadow`。列表行按既有分界仍走中性灰高亮档，不接阴影。

  **粗指针热区补到 44×44。** `@media (pointer: coarse)` 下，`checkbox` / `switch` / `dialog` / `drawer` / `popover` / `tour` / `alert` / `notification` / `toast` / `carousel` / `segmented` / `timer` / `float-button` / `back-top` 的独立触控目标各挂一个绝对定位的伪元素承接指针，视觉盒与布局占位一点不动（`::before` 已被兜底字形占着，一律用 `::after`）。密排成网格或一排的条目（走马灯圆点、热力图格子、取色器色块与拇指、表格与树的行首把手、拖拽把手）没有外扩：它们外扩到 44px 相邻命中区会叠在一起，点错格子比命中区小更糟，理由留在登记表的 backlog 里。

  **打印与强制颜色两档补上非颜色通道。** 打印默认丢背景，`checkbox` / `radio-group` / `switch` / `rating` / `toggle` / `steps` / `tabs` / `pagination` / `calendar` / `segmented` / `table` / `timeline` / `diff-view` / `tag` / `badge` / `alert` 此前只靠底色表达的那些档（勾上、选中、当前页、区间、走过的步、变更类型、语气）改由描边粗细、虚实、字重、下划线这些印得出来的通道表达。强制颜色档里 `menu` / `menubar` / `context-menu` / `toolbar` / `steps` / `anchor` / `splitter` 的分隔线与指示条补 `CanvasText` / `Highlight`（这些部件本体就是一块底色，`forced-colors` 下整条消失），`progress` 的轨道与走过的段分开取色。共享层 `forced-colors.css` 只追加了一条日期／时间分段框的当前段焦点环，既有行一字未改。

  **另两处。** `question-flow` 的选项记号改读控件内图标档（原先读展示档，勾画进 16px 的盒里溢出 4px），单选圆点直径跟着按记号盒折半，与 `radio-group` 同口径；`skeleton` 的微光默认值从 `--xh-bg-subtle-hover` 改到 `--xh-bg-surface-raised`——浅色档下前者比骨架底更暗，扫过去的是一道暗带，与深色档相反。

  新增 37 个组件覆盖槽（`--xh-*-bg-hover` / `-shadow-hover` / `-shadow-active` / `-border-hover` / `-border-focus` / `--xh-question-flow-indicator-icon-size`），既有槽名、部件名、`data-*` 取值一个没删没改名。

- 891c368: **ImageCropper 把手悬停改中性面，圆形裁切框圆角走语义档。** 把手静息是白面（`--xh-bg-surface`），悬停
  由品牌淡底 `--xh-bg-brand-subtle-hover` 改为从同一语义面派生的 `--xh-bg-subtle`（拖动中仍是品牌实心
  `--xh-bg-brand`）；`data-shape="round"` 的裁切框 `border-radius` 由字面 50% 改为
  `var(--xh-image-cropper-crop-area-radius, var(--xh-shape-circle))`，新增公开槽
  `--xh-image-cropper-crop-area-radius`。
- 13d66fc: ImageCropper 将八向调整标记改为裁切框内部短条与折角，角部形状继承裁切框圆角，拖拽命中区和缩放补偿保持不变。皮肤体积增加用于绘制八向标记、悬停状态与角形继承规则。
- f241bea: **ImageViewer 十个 chrome 按钮接入 Action Control。** 连接层的 `prev-trigger` / `next-trigger` 新增稳定属性
  `data-xh-action-control` / `data-xh-action-profile="floating"` / `data-xh-action-display="always"` /
  `data-xh-action-size="md"`，`close-trigger` 投影 icon 档 `lg`，控件带七个按钮投影 icon 档 `xs`；均不投影
  `data-xh-action-variant`，面由皮肤桥接到取景器自己的深色半透明 chrome。

  视觉默认变化：翻页按钮由 40px 胶囊改为 48px 正圆（floating 档 md，compact 44px；正方盒取 circle），
  图标由随文 1em 改为随档（翻页 24px、关闭 24px、控件带 16px）；控件带外壳圆角由 pill 改为
  `--xh-shape-surface`、计数气泡由 pill 改为 `--xh-shape-control`（`--xh-image-viewer-overlay-radius` 仍是两者与
  翻页按钮共用的使用者入口，新增 `--xh-image-viewer-toolbar-radius-outer` / `--xh-image-viewer-counter-radius`
  分别覆盖）；遮罩 blur 变体补 `-webkit-backdrop-filter`；关闭按钮新增前景槽 `--xh-image-viewer-close-fg`。
  皮肤删除十个按钮自写的盒型、hover / active 规则，`--xh-image-viewer-chrome-bg / -action-bg-hover / -action-bg-active / -close-bg-hover / -close-bg-active / -close-size / -close-radius / -toolbar-radius / -icon-size` 改为桥接到配方之前。

- ea27877: **`infinite-scroll` 的取下一页按钮接入 Action Control row outline 档，默认几何与阶梯会变。** connect 在
  `load-more-trigger` 上投影 `data-xh-action-control` / `profile="row"` / `variant="outline"` / `display="always"` /
  `size="md"`（本组件没有 size 轴，档位固定）。真源 §9.2 把 load-more trigger 归为铺满一行的独立动作条目：宽度由容器给
  （`inline-size: 100%`）、高度随内容（至少一个控件高 36px，内衬 `--xh-list-option-py-md`、正文行高，文案可折行）、按下只换面
  不缩放。此前它是一颗行内 `inline-flex` 描边钮，宽度随文案、按下缩到 0.97。

  皮肤 `@import` 家族 action-control，删除按钮自写的盒、底、边、transition、hover / active / 缩放规则，改为映射家族桥接槽
  （`--xh-infinite-scroll-load-more-gap` / `-h` / `-px` / `-radius` / `-border` / `-border-hover` / `-bg` / `-bg-hover` /
  `-bg-active` / `-fg` / `-font-size` 使用者槽全部保留为第一参数），只留文案居中、正文行高与 `touch-action: manipulation`；
  新增使用者槽 `--xh-infinite-scroll-load-more-icon-size`（映射 `--xh-icon-size`，缺省按档取
  `--xh-_action-profile-glyph-size` 20px）。默认外观变化：静息底由 `--xh-bg-canvas` 改为透明（描边仍 `--xh-border-control`、
  control 圆角、无影）；悬停由 `--xh-bg-subtle-hover`（200）改为 `--xh-bg-subtle`（100）+ `--xh-border-control-hover`；按下由
  `--xh-bg-subtle-active`（300）+ 0.97 缩放改为 `--xh-bg-subtle-hover`（200）只换面（白底承载阶梯）；焦点环、禁用面
  （`data-disabled` 时透明底 + `--xh-fg-disabled` + `--xh-border-subtle`）与粗指针 44px 热区由家族给；取数中（`data-loading`）
  不再响应悬停。

  登记如实缩小：check-press-feedback 把 `infinite-scroll:load-more-trigger` 改登记为 `{ feedback: 'surface' }`，family-backlog
  删 press 段 1 条与 ladder 段 hover / pressed 2 条；check-dead-state-attr 删 `infinite-scroll:data-loading` 钩子（在途守卫由家族
  配方消费）。文档示例的取页钮外层不再用 flex 居中，按钮自己铺满一行。

- c4e10d5: 为 InputGroup 新增 `primary | secondary` 视觉变体，并将前缀、输入控件与后缀统一为一个输入表面。皮肤体积增加用于补齐外层材质、悬停、聚焦、校验与强制色状态，同时消除子输入重复绘制的背景、描边和阴影。
- fa08fb4: **新增** `input-group` 组件（输入组）：Vue 与 Web Components 两侧同时可用。

  它收编的是一份此前只存在于示例里的写法：输入框与它的前后缀、动作钮拼成一个盒。
  拼法有四处要拿捏——中缝合并、首尾圆角、聚焦那一段的层叠顺序、前后缀块与邻座同高——
  照抄示例意味着每个使用者各写一遍，四处各写各的，这正是同一套控件长出两种模样的来源。

  承诺的部分：`root` 负责中缝与两端圆角，`item` 是不可交互的前后缀块，档位跟着组内控件
  自己的 `data-size` 走（组上写 `size` 可以直接指定）。覆盖入口是 `--xh-input-group-radius`
  与 `--xh-input-group-item-*`。

  实现细节、不作承诺的部分：段的识别只认直接子节点与它下面那一层的控件盒；更深的节点是
  控件自己的内部结构，本组件不去动它。

- 31b54f4: **JsonViewer 的分支行接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面（行只换面不缩放）。**
  机器 context 新增 `pressedValue`，事件 `PRESS.START` / `PRESS.END` 按行路径记按住的那一行；键盘那一路由 `branch` 代发（焦点落在它身上），触屏按在 `branch-control` 上。
  皮肤的按压规则改为 `:is(:active, [data-pressed])`，并补 `forced-colors: active` 下的系统高亮反色。键盘表新增 `json-viewer.kbd.press`。三端公开 props 与事件不变。
- fa08fb4: **新增**布局与滚动族的能力补齐（滚动区的边缘渐隐单独一份变更集）。全部是加法，缺省档逐值等于改动前。

  **拖动能撤销了**。`splitter` 新增 `DRAG.CANCEL` 事件，拖动态在文档上听 Escape：按下即把布局退回按下那一刻的快照，`onSizesChangeEnd` 不发。`resizable` 的 `resizing` 态挂同一条通路，Escape 走既有的 `RESIZE.CANCEL`，尺寸与位移一起退回。两条键盘表各多一行 `cancel`。此前拖过头只能再拖回去猜原值，而错值已经发出去了。

  **骨架有名字了**。`splitter` 立 `SplitterTranslations { root, resizeTrigger(index, total) }`，根与每条分隔条从此各带一个 `aria-label`（兜底 `Split panels` / `Resize panel N`）。多条分隔条对读屏不再是一串同名盒子。Vue 侧接 `withXhConfig('splitter')`，Web Components 侧收 `translations` property。

  **拖动排序看得见落点**。`sortable` 新增 `drop-indicator` 部件：拾起时机器记下容器原点，连接层按当前落点算出那条缝并写进内联 `transform`，落点回到起点即 `hidden`。竖排画横线、横排与换行网格画竖线。换行网格里两个方向的项都在动，此前看不出会落到哪一格。同批把 `item-drag-trigger` 的禁用从 `aria-disabled` 改为**同时**发 `data-disabled`（`aria-disabled` 原样保留），全局 `[data-disabled]` 规则从此命中得到它。

  **侧栏会自己收了**。`layout` 新增 `siderBreakpoint`（`sm` / `md` / `lg` / `xl`，落根上的 `data-sider-breakpoint`）：没达到那一档时侧栏按折叠宽显示；同时发 `onSiderBreakpoint({ matched })`，宿主据此换成抽屉。断点像素值现读 `--xh-breakpoint-<档>` 令牌，JS 里不另抄一份。

  **栅格接得住真实版面**。`grid` 新增 `rows`（显式行轨道）、`minColWidth`（四档，走新令牌 `--xh-layout-col-min-xs|sm|md|lg`，皮肤改用 `repeat(auto-fill, minmax(…, 1fr))`，从此做得了「卡片最小 N，放得下几列就几列」）、`rowGap` / `columnGap`（排在 `gap` 档位之后取胜）。`span` 与 `offset` 另外收断点对象：

  ```vue
  <XhGridRoot :cols="{ base: 1, md: 2, lg: 3 }">
    <XhGridItem :span="{ base: 1, lg: 2 }">…</XhGridItem>
  </XhGridRoot>
  ```

  窄屏收成一列时 `span=6` 那一格不再溢出。两个适配器都收 JSON 串写法。

  **未做**：拖起态的观感调整、分隔条的抓手字形、瀑布流的换档动效——三条都是视觉/动效条目，且后者依赖「列与项交给作者持有」那次结构变更。

- 2c5c5ac: **侧栏能盖上来了**。`layout` 新增 `siderPresentation`（`inline` / `sheet`）：覆盖档下侧栏移出画外，展开时盖在内容之上并铺一层遮罩，侧栏那一列于是收成零宽、内容占满整宽。缺省仍是 `inline`，不写这个 prop 的骨架逐值等于改动前。

  与已有的 `siderBreakpoint` 配着写就是「宽屏占一列、窄屏覆盖」：覆盖档只在未达那一档时成立，宽屏落回占位档；跨档时侧栏跟着开合（进覆盖档收起、免得一挂上来就盖住内容，回占位档展开），走的仍是 `siderCollapsed` 那条通道，受控宿主照常收到 `onSiderCollapsedChange`。解析后的档位落在根的 `data-sider-presentation` 与侧栏的 `data-presentation` 上，`api.siderPresentation` 读得到同一个值。

  ```vue
  <XhLayoutRoot sider-breakpoint="md" sider-presentation="sheet">
    <XhLayoutHeader><XhLayoutSiderTrigger>菜单</XhLayoutSiderTrigger></XhLayoutHeader>
    <XhLayoutSiderBackdrop />
    <XhLayoutSider>…</XhLayoutSider>
    <XhLayoutContent>…</XhLayoutContent>
  </XhLayoutRoot>
  ```

  **新增 `sider-backdrop` 部件**（Vue 侧 `XhLayoutSiderBackdrop`，Web Components 侧同名 part）：点它收起侧栏；占位档下带 `hidden`，不占位也不吃指针。它与面板同一个层号，渲染时排在 `sider` 之前——谁盖谁由文档序决定。

  **键盘表多一行**：覆盖档下 Escape 收起侧栏（`layout.kbd.dismiss-sider-sheet`）。覆盖档不锁焦点、不把背后的内容标成惰性——它是骨架里的一段，不是模态浮层；要模态用 `drawer`。

  皮肤侧：面板贴死视口那条边、按自身宽度的百分比推出画外，位移与 `visibility` 同拍走 `--xh-motion-duration-slide` / `--xh-motion-ease-slide`；贴边的四条内衬与安全区取大的一头。新增使用者槽 `--xh-layout-sider-layer` / `--xh-layout-sider-shadow` / `--xh-layout-sider-backdrop-layer` / `--xh-layout-sider-backdrop-bg`。`layout.css` 的体积基线因这一档从 5742 涨到 7844 字节。

- 7e7bdfc: 全库视觉口径统一，三件事。

  **进场曲线**：31 处带位移、缩放或高度变化的进场与展开动画改用 `--xh-motion-ease-enter-strong`——起步快、收尾长，位移看得清。涉及对话框、抽屉、各类浮层的 `xh-pop-in`、通知、轻提示、引导、手风琴与折叠面板的展开。纯透明度的遮罩淡入不变。

  **输入族控件壳接一档静态落影**：文本框、数字框、密码框、验证码格、标签输入、日期/时间分段框、下拉选择、可搜下拉、级联、树选择、气泡选择、日期/时间选择器、取色器与就地编辑的控件壳，现在都带一层与卡片同档的落影（`--xh-elevation-raised`），与原有的发丝描边一起把控件从页面上抬起一层。形态轴按档生效：`outline` / `subtle`（以及不写 `data-variant` 的缺省档）接落影，`ghost` 档不接——它的底与描边都是透明的。浮层的投影档位不变。

  **实心档控件补内顶高光**：按钮（含按钮组的实心档）、标签、角标、图标底座、切换与分段的选中态、当前页码、走过的步骤，以及审批 / 提示词输入 / 会话输入 / 气泡确认 / 引导 / 表单 / 就地编辑 / 日期选择这几处的主操作按钮，顶边多了一条极浅的内高光，让实心面看起来是有厚度的一块而不是一片色块。描边档、幽灵档、淡底档一律不加；置灰后高光自动收掉；写了 `data-tone` 时高光跟着语气走。

  每一处都留了覆盖入口：落影写 `--xh-<组件>-<部件>-shadow`（`0 0 0 transparent` 关掉），高光同名槽（`none` 关掉），例如 `--xh-button-shadow: none`。

- 9cb1db6: **Listbox 接入 Collection Item 与 Action Control 配方，选中改页内持久集合的品牌淡底 + 前导对号，列表接自绘条。**

  - 条目投影 `data-xh-collection-item` / `data-xh-collection-size` / `data-xh-collection-context='page'`，文字与对号落在家族网格的 `text` / `indicator` 列；悬停 100、按下 200 只换面（此前按下零反馈），选中行铺 `--xh-bg-brand-subtle` 行面 + `--xh-fg-on-brand-subtle` 前景，对号前置到起始侧（此前透明底 + 行尾对号）；selected + hover 20%、+ pressed 28%。公开槽名不变，新增 `--xh-listbox-item-bg-pressed` / `--xh-listbox-item-bg-selected` / `--xh-listbox-item-check-fg`。
  - 取下一页的钮接 Action Control `row` 档 ghost 形态：铺满一行只换面不缩放（此前 0.97 缩放且不换底）。
  - 根上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档；条目内字形由家族按档下发。
  - 三端把 `content` 接上自绘滚动条（真源 §6.6 定高小列表）：条子挂在 `root` 上、贴层锚定、两轴都摆、走 6px 缺省档；Vue 的 `XhListboxContent` 与 React 的同名组件根节点从此是片段（列表 + 条子），直通属性仍落在列表节点上。

- fa08fb4: **标记与身份族补齐四项能力**，全是新增：不写新 prop、不加新部件的既有用法逐值不变。

  **`separator` 补带分节文字的三段形态。** 解剖由 `['root']` 扩为 `['root', 'line', 'content']`：
  渲染了 `content` 之后 `root` 改当容器，两条 `line` 夹着文字，间距、字号与靠边时的线长全部走令牌。
  形态由部件在不在决定，没有开关。Vue 侧新增 `XhSeparatorRoot` / `XhSeparatorLine` /
  `XhSeparatorContent` 三个部件组件；`XhSeparator` 保留为一体式入口——不给插槽仍是今天那一条线，
  给了插槽自动排成三段。此前 `XhSeparator` 收到插槽会投一条 `core.ignored-slot` 诊断并丢掉内容，
  这条诊断随之删除。同批补三个 prop：`align`（`start` / `center` / `end`，缺省居中）、
  `variant`（`default` / `subtle` / `strong`，三档只换线的深浅）、`dashed`（虚线，横竖两个朝向
  各自成立，段长走 `--xh-separator-dash-length` / `--xh-separator-dash-gap`）。
  三者缺省档都不落 DOM 属性。

  **`avatar` 补 `tone` 语气轴。** 落 `root` 的 `data-tone`，换的是淡底与回退字的配色族；
  整块规则带 `[data-tone]` 限定，没写语气的头像逐值不变。不开形态轴——头像只有「淡底 + 字/图」
  一种形态，实心底会压住图片。

  **`watermark` 补字体与图片两项能力。** `fontFamily` 指定印文字的字体（缺省 `sans-serif`，
  与从前产出逐字相同）；`image` 在文字上方印一张图，`imageSize` 给它的像素尺寸（缺省 64 × 64）。
  两条约束写在类型里也写在文档里：印子是当遮罩用的 SVG，遮罩只取透明度，所以图印出来是**剪影**，
  颜色仍由 `--xh-watermark-fg` 给；`image` 只收 `data:image/` 开头的内联图片，别的来源在入口挡下并
  报一条诊断——SVG 当图片用时取不到外部资源，收了也印不出东西。文字与图片都空了才落
  `data-state="empty"`。

  **`tag` 的纯文字自动包 `label`（仅 Vue）。** `<XhTagRoot>前端</XhTagRoot>` 这种写法此前拿不到
  `label` 上的截断规则，文字过长会把关闭钮挤出去；现在默认插槽里只有文字时自动包一层
  `XhTagLabel`，作者自己写了节点就一个都不动。Web Components 侧是 Light DOM，作者自己写节点，
  这件事改到不了，`tag` 的文档里加了一条反模式。

- a0ae74b: **新增** `markdown-stream` 组件：把已经渲好的 Markdown 块列表投影成带稳定 key 的正文结构，Vue 与 Web Components 两侧同时可用。

  它把 `@xihan-ui/markdown` 这个一直没有消费方的流式渲染内核接到了组件层上。**组件不解析 Markdown，也不持有渲染器**：块列表由宿主调 `createStreamRenderer().render(全文)` 得到后传进来——渲染器是有状态的，做成组件的 prop 会诱导使用者共享一个实例、每帧把整张缓存作废。

  块的 `key` 是稳定的：生长中的那一块 key 恒定，定型的块 key 不再变化。两个适配器都按 key 逐条比对复用节点，只有真正在长的那一块每帧重渲——整表重铺会把已定型的块连同用户正在拖的选区一起弄没，而稳定 key 正是为了避免这件事。

  **`html` 只对 markdown 块有效**，这条契约写在类型上：代码块与公式块拿 `source`（未转义的正文原文）交给 `code-view` 或宿主自选的公式引擎，照 `html` 渲会让同一段代码出现两次。没人接管时把原文当正文显示，这个降级是明写的，不是意外。

  流式光标是皮肤的 `::after`，挂在带 `data-live` 的那一块上，减弱动效时停在实心不闪。正文不套 role、也不做成活区——每来一个 token 播报一次会把读屏刷爆；要在一段回复写完时念一句，把 `announce` 设成 `polite` 并渲出播报区。

  **新增** 语义令牌 `--xh-caret-duration`：文本光标闪一次的周期。

- fa08fb4: 媒体与图形族补齐五处能力缺口，全部是加法：既有部件、槽、props 与事件一个都没有改名或退役。

  **`image` 新增 `placeholder` 部件**（`XhImagePlaceholder` / `part="placeholder"`）。此前 `fallback` 一个部件同时承担「还在加载」与「加载失败」，作者只能靠 `showFallback` 载荷自己分流，而它的默认长相是一行居中文字——加载中最需要的占位面没有着落。`placeholder` 只在 `idle` / `loading` 两相露面，铺满图位，默认给一层比根底稍重的面（槽 `--xh-image-placeholder-bg` / `--xh-image-placeholder-fg`），作者把骨架屏或模糊小图放进去即可。默认插槽的载荷同批加 `showPlaceholder`。节点是可选的，不写照旧。

  **`image-viewer` 新增大图的取图相位。** 打开一张几 MB 的原图时，`content` 已经淡入、`image` 还是空的，台前是一整块什么都没有的暗底。现在 `image` 与 `viewport` 两个部件在取图期间带 `data-loading`，`viewport` 同时报 `aria-busy`，皮肤给出 `cursor: progress` 与画面正中的一块占位面（槽 `--xh-image-viewer-loading-size` / `-radius` / `-bg`）；`ImageViewerApi` 加只读的 `imageStatus`（`loading` / `loaded` / `error`），Vue 侧经根组件默认插槽透出。换图与重开都回到 `loading`。

  **`image-viewer` 新增 `+` / `=` / `-` / `0` 四个键位**：放大一档、缩小一档、变换整体复位，与工具条上那三颗钮同一条通道（`ZOOM.BY` / `TRANSFORM.RESET`）。带 `Ctrl` / `Meta` 的同样按键不接，留给浏览器的页面缩放。**注意**：看片浮层打开期间，这三个按键不再冒泡到宿主——原先在宿主上监听 `+` / `-` / `0` 的页面，浮层开着时收不到它们。

  **`image-cropper` 新增 `zoom-slider` / `rotate-slider` 两个部件**（`XhImageCropperZoomSlider` / `XhImageCropperRotateSlider`，两侧都是原生 `<input type="range">`）。示例里早就有「缩放与旋转」这一档，解剖里却一个控制件都没有，作者只能各自拿滑块拼一套。同批把 `rotation` 从只读 prop 补成与 `zoom` 同形的受控通道：新增 `defaultRotation`、`onRotationChange`（Vue 的 `rotation-change` / `update:rotation`，WC 的 `rotation-change` 事件）与 `api.setRotation`；两条滑杆的区间与步长各留 `minZoom` / `maxZoom` / `zoomStep` 与 `minRotation` / `maxRotation` / `rotationStep`（缺省 1–3 步长 0.01、−180–180 步长 1），只约束滑杆，命令式赋值不受它们夹取。给了 `rotation` 的既有用法行为不变。

  **`file-upload` 新增 `item-progress` 部件**（`XhFileUploadItemProgress` / `part="item-progress"`）。机器一直在算 `progress`，解剖里却没有承载它的地方，示例只好自己拼一条进度条。新部件在传输中露面，宽度按连接层写下的比例走（槽 `--xh-file-upload-item-progress-w` / `-h` / `-radius` / `-track` / `-fill`）。同批给传完的那一行补一枚对勾字形（槽 `--xh-file-upload-item-fg-done`），与失败那一行的警示字形对称——此前「传完了」与「还没开始」在行上看不出分别。

- 858eac5: **Menu 接入 Collection Item 配方：条目按下面由 300 改 200，展开着的触发器改中性面，浮层条子走 4px 档并补 overscroll 隔离。**

  - 条目与子菜单触发项投影 `data-xh-collection-item` / `-size` / `-context='overlay'`，`item-text` 落 `text` 槽、`item-indicator` 落 `prefix` 槽（常显前导图标，不是选中对号）、`item-description` 落 `description` 槽，分隔线投影 `data-xh-collection-separator`；子层开着时子菜单触发项同报 `data-in-path`，打开路径的面由家族按它给。
  - 悬停 / 键盘锚点 100（`--xh-bg-subtle`）、按下 200（`--xh-bg-subtle-hover`，此前是 `--xh-bg-subtle-active` 300）、打开路径与 hover 同档、禁用面都由家族给，皮肤只映射公开槽；`--xh-menu-item-bg-pressed` 缺省随之改变。
  - 展开着的触发器由「品牌淡底、随 tone 换色」改为与家族 hover 同档的 `--xh-bg-subtle`；`--xh-menu-trigger-bg-active` 槽名不变，私有槽 `--xh-_menu-active-bg` 删除。
  - 标记位盒尺改随家族按档下发的 `--xh-icon-size`（md 20px）；content 上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档。
  - content 补 `overscroll-behavior: contain`；三端自绘条改传 `size: 'sm'`（浮层里的条子走 4px 档）。

- d74e0f2: **Menubar 接入 Collection Item 配方：条目按下面由 300 改 200，展开着的入口改中性面并只换面不缩放，下拉菜单三端接自绘条。**

  - 条目投影 `data-xh-collection-item` / `-size` / `-context='overlay'`，`item-text` 落 `text` 槽、`item-indicator` 落 `prefix` 槽（常显前导图标，不是选中对号）、`item-description` 落 `description` 槽，分隔线投影 `data-xh-collection-separator`；子菜单触发项由子层的 Menu 机器合并同一批标记并在子层开着时报 `data-in-path`。
  - 悬停 100（`--xh-bg-subtle`）、按下 200（`--xh-bg-subtle-hover`，此前是 `--xh-bg-subtle-active` 300）、打开路径与 hover 同档、禁用面都由家族给，皮肤只映射公开槽；`--xh-menubar-item-bg-pressed` 缺省随之改变。
  - 展开着的入口由「品牌淡底、随 tone 换色」改为与悬停同档的 `--xh-bg-subtle`；按下由缩放改为只换面到 200，新增 `--xh-menubar-trigger-bg-pressed`；私有槽 `--xh-_menubar-active-bg` 删除。
  - 标记位盒尺改随家族按档下发的 `--xh-icon-size`（md 20px）；根与定位层上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档，content 上的重复声明删除。
  - 下拉菜单接自绘条：Vue / React 每张菜单的 positioner 各配一套（`useScrollbars`，`size: 'sm'`），Web Components 由 `ScrollbarsController` 跟着最近展开的那张菜单走；层分支把当前那张的 positioner 记进去，按住条子拖动不再把菜单消解掉；content 补 `overscroll-behavior: contain`，positioner 声明 `--xh-scrollbar-track-bg: transparent`。

- ccc453d: Menubar 入口接入 Collection Item 家族的 `nav` 语境：`getTriggerProps` 投影 `data-xh-collection-item` / `data-xh-collection-size` / `data-xh-collection-context='nav'`，展开着的那一张新增布尔属性 `data-in-path`（与 Menu 子菜单入口同法；`data-state` open / closed 仍保留给箭头与 positioner）。皮肤删掉手写的悬停、展开、按下、禁用规则与 forced-colors 按下块，改在入口基础规则里把 `--xh-menubar-trigger-*` 公开槽映射到家族桥接槽，并新增 `--xh-menubar-trigger-fg` 静息字色槽（缺省 `--xh-fg-default`，菜单名不取 nav 缺省的 muted）；取值不变：hover `--xh-bg-subtle`（100），打开中与 hover 同档的中性面、不加粗不用品牌色，pressed `--xh-bg-subtle-hover`（200）只换面，禁用由家族按 `aria-disabled` 给字色与 not-allowed。
- 4abf7a4: **新增** `message-feed` 组件：一段会话的消息序列，Vue 与 Web Components 两侧同时可用。

  它把「粘底跟随」和「消息集合语义」合成一件。粘底那一半是内容增高时自动到底、用户上滚即解除、滚回底部阈值内自动恢复，并在往上插入历史消息时补偿滚动位置；集合那一半是 `role=feed` 配 `role=article`，带 `aria-posinset` 与 `aria-setsize`。

  **总数由 `count` 声明，不从 DOM 数**：分页加载或截断历史时，DOM 里的条数不等于会话长度；不给 `count` 就报 `-1`，那是 ARIA 规定的「总数未知」。

  **整份消息列表只占一个 Tab 停靠位。** `PageDown` / `PageUp` 在消息之间走，`Ctrl+End` / `Ctrl+Home` 一步走到消息流之外（会话界面里前者通常就是输入框），方向键一概不接管、留给浏览器滚动。这是对 APG Feed 示例的一处刻意偏离：示例给每个 article 都写 `tabindex="0"`，两百条消息就是两百个 Tab 停靠位。

  「回到底部」只看在不在底、不看粘附意图——粘着但内容还没追上时按钮不该冒出来。

  播报走一个独立的原子活区：一份会话只该有一个，每条消息各开一个会互相打断。消息流本身**不发 `aria-busy`**，它会压住同一棵子树内播报区的播报。

  消息内容全部由作者写：气泡、头像、时间、动作条都不是本组件的部件，按条目上的 `data-role` 出样式即可。

- fee406a: **新增** `resizable` 把手的可见反馈。此前八向把手在屏幕上完全不着色：指到哪一条、正在拖哪一条都看不出来。现在指针停在把手上时那一条显形（`--xh-bg-subtle-active`），正被拖的那一条换到品牌底（`--xh-bg-brand`），两档都按 `--xh-motion-duration-micro` + `--xh-motion-ease-enter` 过渡。高对比档里底色一律被系统换掉、三档会塌成一个样子，另补一条 `outline: Highlight` 把正在拖的那条画出来。

  **新增** `truncate` 可展开那一档的悬停提亮。真被裁了才是那颗按钮（皮肤原本只给到 `cursor: pointer`），现在指针停在上面时字色走到 `--xh-fg-default`，按不动的短文本不给这个反馈。

  **新增** `avatar` 与 `image` 的图片淡入。载入完成那一刻 `hidden` 撤掉，图片此前是硬切上来盖掉回退字 / 占位层，现在走一遍 `xh-fade-in`（`--xh-motion-duration-enter`）。两份皮肤同批同形态。

  **新增** `timeline` 圆点、`button-group` 段间线、`input-group` 前后缀块的色彩过渡：语气色随数据改、整组禁用换线色、前后缀色槽换档时，都按 `micro` 走一遍而不是跳变。

  **新增**门禁 `check-motion-coverage.mjs`：每份组件皮肤至少要有一条走 `--xh-motion-duration-*` 的过渡或动画（无限循环动画同样算数），剥掉 `prefers-reduced-motion` / `forced-colors` / `print` 三种块之后再判。零动效的 17 份纯排布 / 纯展示皮肤逐条登记进 `tooling/scripts/motion-exempt.json` 并写清理由，名单两侧反查。

- 8a2d914: **动效补上编排、方向感与退场三层：交错从零到 36 处，浮层有了锚点原点，退场不再是进场倒放。**

  **此前全库没有编排。** `animation-delay` 0 处、`transition-delay` 0 处、`will-change` 0 处、`transform-origin` 1 处——不是动画做得少，是每个动画各自孤立地淡入淡出，没有先后、没有方向、没有分档。175 条 `transition` 里 68% 用同一支时长、71% 用同一支曲线。

  现在：零动效皮肤 43 → 32、`transition` 175 → 200、`animation-delay` 0 → **36**（交错一律走 `calc(N * var(--xh-motion-stagger-step))`，封顶 6 项）、`will-change` 0 → **29**（全部挂在 `[data-state='open']` 一类的状态规则上，随状态一起撤走，不常驻占合成层）、`transform-origin` 1 → **14**（13 个锚定浮层按 `[data-placement]` 打原点并加 4px 方向位移，进场看得出是从哪儿冒出来的）。曲线分布：`enter` 272→238、`enter-strong` 51→150、`continuous` 4→24、`slide`/`sweep`/`settle` 各 0→1。

  **新增令牌 10 支，全部是加法。** 原语 3 支：`--xh-ease-out-fluid`（与 HeroUI 的 `--ease-out-fluid` 逐值相同）、`--xh-ease-in-out`（与本仓 `easing.ts` 的 `easeInOut` 逐值相同，新增它零 JS 改动）、`--xh-ease-out-back`（过冲后落位，全库此前不存在任何会过冲的动效）。语义 7 支：`--xh-motion-ease-slide` / `-sweep` / `-settle`、`--xh-motion-duration-slide`(320ms) / `-nudge`(200ms)、`--xh-motion-stagger-step`（派生自 `duration-enter` 的五分之一 = 40ms）、`--xh-motion-scale-exit`(0.98)。

  `sweep` 与 `loop` 分家的理由和当年 `loop` 与 `continuous` 分家同源：单向循环匀速是硬要求（转圈忽快忽慢不可接受），而往返循环在折返点需要两端减速——`linear` 在那里是瞬时反向，读成硬弹。

  `scale-exit` 0.98 比进场起点的 0.96 更靠近 1：退场不是进场倒放，收得更浅才不显得被吸走。

  减弱档：`duration-slide` / `-nudge` 归 1ms，`scale-exit` 归 1，`stagger-step` **显式归 0ms**——不靠 `calc` 传递。减弱档 `duration-enter` 是 1ms，除 5 得 0.2ms，六项交错累计出一毫秒的、看不见但确实在动的错位。三支新曲线不重映射，1ms 内曲线不可见。

  **焦点环一个字未动。** 曾有提议给 91 份皮肤加 `transition: outline-color`，但 `outline-color` 的初始值是 `currentColor` 不是 `transparent`，从它过渡到聚焦色得到的是一段颜色抹擦而不是淡入。真正的差距在 `box-shadow`：68 份皮肤用它表达悬停抬升、`focus-within` 海拔变化、选中态内阴影，此前只有 `card` 与 `slider` 两处把它写进过渡，其余全是硬切，本批按状态变化逐处补齐。

  **修掉 15 处 `will-change` 声明错属性。** `transform` 与 `scale` / `translate` / `rotate` 在现代 CSS 里是各自独立的属性——关键帧动的是 `scale` 与 `translate`，而声明写的是 `transform` 时，点到的那个属性一帧都不会动、真会动的两个一个没点到。`dialog` / `drawer` 与 13 个锚定浮层全中。新增判据 `check-will-change.mjs` 守住，它只咬「点了却不会动」，不咬「会动但没点」——`will-change` 的用途是提示合成层提升，只点需要提升的那几个是对的。

- fc89b39: **`file-upload` 的条目在窄容器里折成两行，`table` 的高度上限由视口收一次口。**

  **上传条目。** 条目里除文件名之外全是定宽件：预览 32px、大小文字 42.7px、进度条 64px、删除钮 24px，加上间距与内衬共 220.7px（`done` / `error` 那两档还各多一枚 16px 字形，共 244.7px）。文件名此前写 `min-inline-size: 0`，于是它是唯一让步的那一个——容器一窄，让步全由它承担。实测（文件名 `annual-report-final-v3.pdf`）：375px 容器里文件名只剩 **154.3px**，320px 剩 **99.3px**，280px 剩 **59.3px**，240px 的 `error` 档直接剩 **0**；再窄一档连定宽件自己都放不下，220px 的 `error` 档内容宽 **229px** > 容器 220px，200px 是 229 > 200、180px 是 229 > 180——那截溢出既不产生横滚也回不来。

  现在文件名的下限取 `--xh-control-min-w`（12rem / 192px，另留 `--xh-file-upload-item-name-min-w` 供单独改），条目自身 `flex-wrap: wrap`：名字缩到这个下限还不够，后面的部件就被推去下一行。同一组量测，375px 文件名回到 **258.3px**、320px 回到 **203.3px**、280px 回到 **214px**（预览与名字仍在同一行），三档都是两行；上面那四档溢出全部消失（220px 内容宽 218 ≤ 220、200px 是 198 ≤ 200、180px 是 178 ≤ 180）。下限再由 `100%` 收一次口，容器比 192px 还窄时名字只占满容器，不把整行顶宽。

  排得下时一像素没动：768px 与 480px 容器里五个部件仍在同一行，文件名分别是 547.3px 与 259.3px，与改前逐一相等。

  **够不着的那一档**：容器窄到 240px 以下时，预览会独占第一行、文件名落到第二行——一行放不下「预览 + 192px 名字」。这一档不溢出、文件名也读得全，只是多占一行。

  **表格高度。** `table` 根的 `max-block-size` 此前是 `--xh-viewport-h-lg` 的死值（24rem / 384px）。横屏手机的可视高度在 375 上下，比它还矮：表格自己就比屏幕高，它的内部滚动与吸顶表头都失去意义，只能靠页面滚。现在再由视口收一次口（`min(令牌, 100dvb)`，不认 `dvb` 的引擎由级联回落到前一条的 `100vh`）。实测：600px 高的视口里上限仍是 384px，375px 与 320px 高的视口里分别收到 375px 与 320px。放进滚动区的那一档（`max-block-size: none`）不受影响。

  两处都不写任何查询——同一份规则在窄视口与窄容器下同时成立。

- fa08fb4: **导航与展开族补一批能力，全部是加法：不渲染新部件、不写新 prop 的既有用法逐值不变。**

  **`menu` 补 `item-text` / `item-indicator` / `item-description` 三个部件，与 `menubar` / `context-menu` 那两家同形。** 连打检索从此优先取 `item-text`，条目里塞的图标与副文本不再算进检索串（没写这个部件时仍退回条目自身文本）。三个部件共用条目那一份 `data-disabled` / `data-highlighted`，样式层各处状态一致。Vue 侧新增 `XhMenuItemText` / `XhMenuItemIndicator` / `XhMenuItemDescription` 与条目上下文 `provideMenuItem` / `useMenuItemContext`，Web Components 侧新增三个 `csspart`。新增导出 `menuItemText`、类型 `MenuItemContext`。

  **`menu` 补 `typeahead` / `disabled` / `translations` 三条 prop。** 首字符连打默认开（APG 的 menu button 模式把它列为必需），收起时缓冲区清空；`disabled` 一票封住触发器与全部条目；`translations.content` 给菜单容器一个名字，不给时仍由触发器经 `aria-labelledby` 代为命名。

  **`menubar` 补 `arrow` / `item-description` 两个部件，`MenubarNode` 补 `group` / `groupLabel` / `separatorBefore` / `description` 四个字段。** 箭头指向它那张菜单自己的锚点（坐标取本菜单名下那份，换菜单时收起中的那张不会跳到新位置），定位引擎因此开始产出箭头落点。相邻同 `group` 的条目并成一段铺进 `group` 部件，段标题取组内首个给出 `groupLabel` 的条目，段首的分隔线落在分组外面——与 `context-menu` 的数据形状逐条对齐。Vue 侧新增 `XhMenubarArrow` / `XhMenubarItemDescription`。

  **`context-menu` 补 `item-description` 部件**，`ContextMenuNode` 随之补 `description`；没给这一项的条目不铺那个部件，行高与此前逐值相同。Vue 侧新增 `XhContextMenuItemDescription`。

  **`navigation-menu` 补 `trigger-indicator` 部件与 `disabled` prop。** 方向标记排在入口文字之后、展开时转 180°，没写内容时由皮肤画兜底字形；`disabled` 一票封住全部入口与面板展开。Vue 侧新增 `XhNavigationMenuTriggerIndicator`。

  **`accordion` 补 `item-separator` 部件与 `variant` / `loop` / `disabled` 三条 prop。** 显式渲染分隔线时原来那条「相邻条目画边」的规则自然不再命中，两条线不会同时出现；`variant` 三档 `plain`（缺省，即现状）/ `surface` / `bordered` 决定条目怎么与页面分开；`loop` 让方向键在首尾之间回绕（缺省仍不回绕）；`disabled` 一票封住整组。新增类型 `AccordionVariant`，Vue 侧新增 `XhAccordionItemSeparator`。

  **`collapsible` 补 `header` 部件与 `tone` / `dir` 两条 prop。** `header` 是触发器与其同排内容住的那一行，只写触发器时可以不渲染它；展开态的字色单开 `--xh-collapsible-trigger-fg-open` 一个槽接语气，不与常态共用一个。Vue 侧新增 `XhCollapsibleHeader`。

  **`pagination` 补 `summary` / `jumper` 两个部件。** 信息区的文本由新的只读字段 `api.summaryText` 给出（文案走 `translations.summary`，默认 `1-10 of 42` 这一形），跳页框敲页码按回车即跳、越界值由 `setPage` 夹回合法区间。两者都与页码格子同一族盒型，并排在一行上平齐。Vue 侧新增 `XhPaginationSummary` / `XhPaginationJumper`，`PaginationTranslations` 新增 `summary` 与 `jumper` 两句。

  **`anchor` 补 `link-text` 部件与 `bounds` prop。** 链接里另塞图标时，省略号只裁 `link-text` 这一段文字；`bounds` 是压线判定的容差（缺省 1px，与此前写死的那一档同值），长目录里靠它调「滚到哪儿才算进入下一节」。Vue 侧新增 `XhAnchorLinkText`，新增导出 `ANCHOR_DEFAULT_BOUNDS`，`resolveActiveAnchor` 多收一个可选参数。

  **`breadcrumb` 补 `link-icon` 部件与 `collection` / `maxItems` 两条 prop。** 折叠算法进 headless（`buildBreadcrumbItems`，纯函数）：层数超过 `maxItems` 才折，折的是中间那一段，首层与末层恒在序列里，展开的层数恒等于 `maxItems`。`api.items` 给出折叠后的序列，省略位自带被折掉的那几层；只交 `collection` 时 Vue 侧按它铺开整套结构。新增类型 `BreadcrumbNode` / `BreadcrumbNodeMeta` / `BreadcrumbItem`，新增导出 `normalizeBreadcrumbNodes`，Vue 侧新增 `XhBreadcrumbLinkIcon`。

  **`side-nav` 补 `tone` / `size` 两条轴。** 尺寸只换根与定位层上那三个私有槽（行高、行内边距、行内间距），中档逐值等于此前写死的那一份；语气把选中行的淡底与强调字、在途枝的字色接到语气层派生好的档上，不写 `data-tone` 时退回品牌色。折叠态的弹出面板被搬去落点、继承不到根上的槽，两条轴因此在 `positioner` 上再输出一次。

  **`toolbar` 补 `variant` 轴**：缺省 `surface` 就是此前那条描边加底色的控件带，新增的 `plain` 档把整块面撤掉、只留排布——嵌在卡片或另一条工具栏里时不会叠成双框。新增类型 `ToolbarVariant`。

  **`steps` 补 `collection` / `statuses` / `loop` / `translations` 四条 prop，`StepStatus` 扩到五档。** `error` 与 `warning` 两档不由步序算出，只能由 `statuses`（按下标覆盖）或 `collection` 显式指定，皮肤给出对应的描边与字色，出错那一步不必再由每个项目各写一套覆盖槽。`count` 缺省取 `collection` 的长度；`loop` 让方向键在首尾之间回绕（缺省仍不回绕）；`translations.list` 给 `role=tablist` 的容器一个名字。新增类型 `StepNode` / `StepNodeMeta`。

  **`tabs` 补 `indicator` / `separator` 两个部件与 `closable` prop。** 指示条照 `anchor` / `navigation-menu` 那一套写：主轴的位置与长度由机器量好写成内联样式、交叉轴的贴边与粗细归皮肤，选中值一变与窗口尺寸一变各重量一次，横竖两排各走一根轴。它是可选部件——不渲染它时选中态仍由标签自己的底色与字色表达，三档形态的画法一条都没动。`closable` 打开后，焦点落在标签上按 Delete / Backspace 即发 `tab-close`（携带关掉这一条之后余下的标签序），库不持有标签序、只发意图。新增类型 `TabsIndicatorRect` / `TabsCloseDetails`，新增导出 `tabsTriggerQuery`，Vue 侧新增 `XhTabsIndicator` / `XhTabsSeparator`。

- 5d97aab: NavigationMenu 入口与面板链接接入 Collection Item 家族的 `nav` 语境：`getTriggerProps` 投影 `data-xh-collection-item` / `data-xh-collection-size` / `data-xh-collection-context='nav'`，展开着的那一张新增布尔属性 `data-in-path`（`data-state` open / closed 仍保留给箭头、positioner 与 viewport）；`getLinkProps` 的 `data-xh-collection-context` 由 `'overlay'` 改为 `'nav'`，当前页（`data-current`）的 `--xh-fg-brand-strong` + medium 改由家族给。皮肤删掉入口手写的悬停、展开、按下、禁用规则、链接的 `[data-current]` 规则与 forced-colors 按下块，改在基础规则里把 `--xh-navigation-menu-trigger-*` / `--xh-navigation-menu-link-*` 公开槽映射到家族桥接槽。默认外观变化：入口悬停字色由 `--xh-fg-muted` 提到 `--xh-fg-default`，入口字重由 label（500）改为 regular（400）与 Anchor / Breadcrumb / Menubar 入口一致（作者可经 `--xh-navigation-menu-trigger-font-weight` 改回）；其余取值不变：静息 muted，hover 100，打开中与 hover 同档且不用品牌色，pressed 200 只换面，链接 hover 100 / pressed 200、当前页 brand-strong + medium 并叠 hover 面。
- 3956657: **NavigationMenu 接入 Collection Item 配方：面板链接由家族给悬停 / 按下面，当前页改 strong 档品牌字色，展开着的入口改中性面并只换面不缩放。**

  - 面板里的链接投影 `data-xh-collection-item` / `-size` / `-context='overlay'`（面板是锚定浮层），悬停 100（`--xh-bg-subtle`）与按下 200（`--xh-bg-subtle-hover`）由家族按 `:hover` / `:focus-visible` / `:active` 给出，此前按下零反馈也没有过渡；新增 `--xh-navigation-menu-link-bg-pressed`。链接不报 `aria-selected`，浮层选中面永不命中。
  - 当前页链接的字色缺省由 `--xh-fg-brand` 改为 `--xh-fg-brand-strong`，字重保持 medium，不再随 `tone` 换色；`--xh-navigation-menu-link-fg-current` 槽名不变。
  - 展开着的入口由「品牌淡底」改为与悬停同档的中性面（`--xh-bg-subtle`），不再随 `tone` 换色；按下由缩放改为只换面到 200，新增 `--xh-navigation-menu-trigger-bg-pressed`；私有槽 `--xh-_navigation-menu-active-bg` / `--xh-_navigation-menu-current-fg` 删除。
  - 根上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档。

- af547ca: **导航菜单里指向当前页面的链接自带一条静态指示线。**

  设计真源 §7.3 把 Tabs line / Anchor / NavigationMenu 归为同一类「透明面 + 2px 指示条」。导航菜单的 `indicator` 部件指的是「哪张面板开着」而不是当前页（写了 `current` 的是 `link`），此前当前页只靠品牌字色与字重。现在当前链接在自己的 `::after` 上画一条静态线，不随部件收起、两者各说各的：横排 list 里的直达链接贴底边，竖排的直达链接与面板里的链接贴行向起始缘（`dir="rtl"` 随逻辑属性镜像），主轴两端各退 `--xh-space-1` 避开链接的圆角；厚度 / 颜色 / 圆角读 `--xh-navigation-menu-indicator-thickness` / `-color` / `-radius` 与部件同一组槽和缺省（`--xh-stroke-thick` / 语气色 / pill），不做动画。forced-colors 下静态线与 `indicator` 部件同取 `Highlight`（部件此前在这一档整根消失）。

  `navigation-menu.css` 实测从 10374 字节涨到 11383 字节（基线原登记 10952 已过期，随之重落）。

- c1c5c03: NumberField 默认将减号与加号两颗控制按钮依次收在输入内容右侧，并只在输入区与动作组之间保留一条分隔线。RTL 下动作组跟随逻辑末端镜像，既有作者 DOM 顺序无需调整。
- b9c9912: **细化数字输入的尺寸节奏、内嵌动作与粗指针命中区。**

  `control` 继续作为输入、前后缀和两颗动作共用的唯一 Field Chrome。comfortable 下 `sm` / `md` / `lg` 控件高为 28 / 32 / 40px，动作盒为 24 / 24 / 32px；compact 下分别为 24 / 28 / 36px 与 20 / 20 / 28px。大尺寸动作不再沿用中尺寸的固定值，前后缀、数值和动作保持同一中线。

  粗指针环境会直接把两颗真实按钮及控件高度扩到 comfortable 48px、compact 44px。命中区由 flex 子项本身承担，不靠伪元素覆盖输入区；窄容器中减号、输入与加号仍各占独立矩形。

  加减钮与输入之间的短线默认改用 M1 的 `--xh-material-soft-separator`，保留既有 `--xh-number-field-trigger-divider` 覆盖槽。新增 `--xh-number-field-touch-target-size`，供产品按自身触摸规范同时覆盖粗指针下的按钮宽高和控件最小高度。

  本次只调整 `@xihan-ui/styles`：数值解析、步进、范围、长按和表单行为没有变化。归一化后的 `number-field.css` 从 18252 B 增至 18856 B。

  皮肤体积（去注释、压空白）：前一提交源码 18252 字节，当前 18856 字节；登记基线 18252 → 18856，只更新本组件，10% 容差保持不变。

- de9f9f6: 重构数字字段的默认视觉盒：两侧动作改为全高透明分栏，整体输入壳统一承担悬停与聚焦反馈，并将默认名称更新为“数字字段”。
- 6b4c5d0: **数字输入的加减钮与输入框之间加了一条分隔线。**

  一体式的 `control` 里，加减钮和输入框此前没有任何分界，三样东西糊在一个描边框里，看不出哪段是控制、哪段是可输入的。现在钮朝向输入的那一侧画一条细线。

  线**刻意不与控件等高**：长度是控件高的一半（三档分别 14 / 16 / 20px），上下各留一段空白。顶天立地的一条线会把控件切成两个盒子，而它们本来就该读作一体。

  线画在钮的 `::after` 上、绝对定位，**不占位、不推布局**——控件高、钮高、钮与输入之间的间隙三个数改前改后逐值不变。侧别全走逻辑属性，RTL 下自动换边；盒里没有输入框时一条线也不画。

  用 `border-inline-start` 画而不是铺底色，默认颜色取 `--xh-material-soft-separator`：它与 M1 Field Chrome 的层级相符；高对比档下系统会把边框替换为系统边色，线仍然可见。

  新增两个使用者覆盖槽 `--xh-number-field-trigger-divider`（颜色）与 `--xh-number-field-trigger-divider-h`（长度）。

  同族的其余「输入框内嵌控制」逐个看过，只有这一件该加：其余那些钮本身就是贴边的图标，再加一条线只会把控件切碎。

- 1f472ba: **四个条目集合浮层的面板不再窄于触发器。** select / popselect / combobox / tree-select 的浮层宽度此前只由静态档决定：`--xh-<组件>-content-min-w` 加一个 `--xh-overlay-max-w` 的上限，与触发器实际有多宽无关。控件被拉到 320px 时，展开的候选面板仍停在 200 出头，条目文字挤成两行，面板与它自己的触发框对不齐一条竖边。

  定位引擎本来就在量锚点：开了 `size` 的浮层，结果里除 `availableWidth` / `availableHeight` 外还带一份 `anchorWidth`，只是从没有人接。现在这四家的连接层把它写成 positioner 上的内联自定义属性，皮肤的 content 拿它当最小宽的下界：

  ```css
  min-inline-size: max(
    var(--xh-select-content-min-w, var(--xh-overlay-menu-min-w)),
    var(--xh-_select-anchor-w)
  );
  ```

  引擎没落位（或压根没有引擎）时该属性是 0，`max()` 取静态档，与改动前逐值相同。使用者槽仍排在最前：`--xh-<组件>-content-min-w` 写得比触发器还宽时以它为准。

  接线名单只收「已接引擎 size 通道且 content 是条目集合」这四家。气泡类浮层（popover / tooltip / hover-card 一族）的宽度由正文长度决定，不该跟着锚点走，不在此列。

- d51d182: **分页浮层里的视觉轴、拖动中的海拔档、树选择器的叶子对齐，以及折叠区域补上指示符部件。**

  **分页展开省略号后，面板里的页码格子不再塌。** `pagination` 的三档尺寸私有槽（`--xh-_pagination-item-size` / `-item-px` / `-font-size`）与四个语气派生槽此前只声明在 `root` 上，而 `positioner` 会被搬到 portal 落点、不再是 `root` 的后代。面板里的 `item` 取不到这几个槽，`var()` 没有第二层默认值即整条声明在计算值阶段失效：真实浏览器里量到的是最小宽 `auto`（应为 28/32/40px）、行高与字号 16px（应为 13/14/16px）、行内内衬 0（应为 8/12/16px）——三档尺寸全部退回初值，折叠页码丢掉等宽骨架。三轴私有槽现在在 `root` 与 `positioner` 上各声明一次，与同仓其余 11 份浮层皮肤同一种写法。`--xh-icon-size` 也从 `content` 上那份单独声明并进这一处，不再写两遍。

  面板与主区逐项同值这件事由一条浏览器态用例焊住（`overlay-visual-axes.spec.ts` 加了 `pagination`，量最小宽、高、行内内衬、行高与字号五项）。

  **滑杆拖动中的拇指改引 `--xh-elevation-lifted`。** 此前它借的是 `floating`——那是 portal 出去的锚定浮层那一档，浮层为自己调深时跟着手走的拇指会一起变重。新档在 `raised` 与 `floating` 之间，语义独立。`check-elevation-role` 的角色表随之从三档扩到四档，`slider` 的 `thumb` 登记成 `raised` + `lifted`。

  **树选择器的叶子行补上首格对齐。** 分支行的首格是展开箭头，叶子行没有这一格；作者摆了 `item-indicator` 时由它顶着，没摆（勾选档首位直接是作者自己的方框）就得由行盒自己补出来，否则叶子比同级分支往行首缩 24px，层级关系读不出来。`tree` 早有这条补偿，但那条规则的选择器带 `[data-orientation='vertical']` 前置，而 `tree-select` 的连接层一处都不发这个属性，照抄过去一条都不命中，所以这里写的是等价而真能命中的一条。摆了指示符的那档不受影响（`:has()` 匹配即不命中，不会重复缩进）。两档都由新的浏览器态用例 `tree-select-leaf-indent.spec.ts` 量住。

  **`collapsible` 新增 `indicator` 部件。** 折叠区域此前只有 `root` / `trigger` / `content` 三件，开箱的触发器看不出能展开——而触发器的皮肤是按两端对齐排的，却没有第二个部件可排；同构的 `accordion` / `reasoning` / `tool-call` 三家都有这个部件。现在 `connect` 产出 `getIndicatorProps()`（`aria-hidden` + `data-state` + `data-disabled`；开合语义仍由 `trigger` 的 `aria-expanded` 承担），两个适配器各接一处：Vue 是新组件 `XhCollapsibleIndicator`，Web Components 是新 csspart `indicator`。皮肤在部件空着时画一枚兜底箭头（`--xh-glyph-mark-chevron-down`），展开时转 180°；作者往部件里塞了自己的图形，兜底那条即不命中，转向照旧由皮肤按 `data-state` 打。新增使用者覆盖槽 `--xh-collapsible-icon-size`。纯新增，原有的三件与它们的属性一个都没动。

- 1f472ba: **新增**有遮罩的浮层的遮罩形态轴：`dialog` / `drawer` / `image-viewer` 三家收下 `variant`，落成 `backdrop` 上的 `data-variant`。

  三档封闭：`opaque` 是缺省档（不写这个 prop 时逐像素与从前相同）、`blur` 在同一层底色之上再糊背后的页面、`transparent` 去掉底色只留下吃指针的那一层（交互外关闭与滚动锁定照旧）。走 `variant` 而不另开属性名：形态、语气、尺寸三轴之外不再多一个概念。

  `tour` 不在此列：它的暗幕真身是 spotlight 那圈大扩散阴影，`backdrop` 只是下面一层垫子——`transparent` 档改了垫子暗幕照样在，`blur` 档会把洞里的高亮目标一起糊掉。

  **新增**全局令牌 `--xh-overlay-backdrop-blur`（12px）与三条组件覆盖槽 `--xh-dialog-backdrop-blur` / `--xh-drawer-backdrop-blur` / `--xh-image-viewer-backdrop-blur`。

- fa08fb4: **浮层容器族的三处能力补齐**：全是加法，既有的部件名、槽名、props 与事件一个没动。

  **`hover-card` 补 `title` / `description` 两个部件**（`XhHoverCardTitle` / `XhHoverCardDescription`，
  Web Components 侧对应 `title` / `description` 两个 part）。卡片是 `role="dialog"`，它的可及名
  此前恒取触发器：触发器是一张头像时，读屏念出来的对话框名字就是头像的替代文字。补上之后
  `aria-labelledby` 指 `title`、`aria-describedby` 指 `description`。

  **两个部件都不放的写法不受影响**：连接层现读 `getTitleEl` / `getDescriptionEl`，取不到节点
  就把可及名指回触发器、也不发 `aria-describedby`，与升级前逐字一致。皮肤新增
  `--xh-hover-card-title-*` 与 `--xh-hover-card-description-fg` 三支覆盖槽。

  **`popconfirm` 补 `arrow` 部件**（`XhPopconfirmArrow` / `arrow` part）：它此前是族内唯一没有
  尖角的锚定气泡，同一页上与 popover 并排时两者对不上。箭头坐标由它本来就在跑的 popover
  机器给出，几何走共享的 `overlay-arrow.css`，皮肤只出底色与描边色，新增 `--xh-popconfirm-arrow-size`。
  面板同批加了 `position: relative`——箭头的贴边要从面板自己的盒子起算。

  **`tour` 补 `progress-indicator` / `progress-dot` 两个部件**（`XhTourProgressIndicator` /
  `XhTourProgressDot`）：此前的进度只有 `progress-text` 一句话。圆点组挂 `aria-hidden`，
  读屏仍走 `progress-text` 那一份；每颗圆点带 `data-index`，走过的带 `data-complete`、
  当前那颗带 `data-current` 并拉成胶囊，换步时宽度与底色一起过渡。Vue 侧的
  `XhTourProgressIndicator` 不写子节点时按 `steps` 的长度自己铺圆点，Web Components 侧由作者
  逐个写节点、序号取节点上的 `index`（缺省按文档序）。新增 `--xh-tour-progress-indicator-gap`
  与 `--xh-tour-progress-dot-bg` / `-bg-complete` / `-bg-current` 四支覆盖槽；
  高对比档里走过的那几颗改由描边表出。

- 05e809c: **浮层不再宽过可用区。**

  定位引擎一直在算 `availableWidth`（与 `availableHeight` 同一处返回），但**从来没有一个 connect 把它下发成 CSS 变量**——14 个 connect 只发了 `available-h`，宽度那一条整个是空的。于是窄屏上浮层会伸出视口，最边上的内容点不到：`combobox` 越界 40.6px、`select` 24.1px、`tour` 13px，`cascader` 更狠——它的 `content` 明明写着 `overflow-x: auto` 却从不生效（外框自己就宽过可用区，盒内不产生溢出），**最右那一列整列在屏外，而 `positioner` 是 `position: fixed`，页面也滚不过去**。

  现在 16 个 connect 下发 `--xh-_<组件>-available-w`，皮肤统一夹取。夹住外框之后 `cascader` 那条 `overflow-x` 自然接管，越界变成面内横滚，最右列够得到。

  **跟随锚宽的那两家要写在 `min` 那一侧。** `select` 与 `combobox` 的 `content` 写的是 `min-inline-size: max(内容下限, 锚宽)`——下拉窄过触发器是视觉缺陷，跟随锚宽是这一族刻意的行为（`menu` / `popover` / `cascader` 都没接锚宽）。而 CSS 里 `min-inline-size` 恒压过 `max-inline-size`，所以夹取只写在 `max` 上是**死声明**：加了等于没加，还看起来像修好了。反向验证专门打了这一条——只留 `max` 侧的夹取时，用例照样判红。

  `popconfirm` 此前连块轴上限都没有（连静态档都没接），一并补齐。

  `date-picker` 只夹外框、内容面内横滚，**刻意不压缩**：压到 375px 会让日历的 28px 格子落在 24px 的网格轨道上、每颗日期钮与右邻重叠 4px。手机档真正的排布改动是另一件事。

  **`check-overlay-size` 跟着扩成宽高两条通道。** 此前它只核 `-available-h` 的机器 / connect / 皮肤三段，宽度这条新通道处在所有门禁之外——删掉某个 connect 的下发行，只有一条浏览器态用例拦得住。宽度那张豁免表三条都给了可查证的理由（`tooltip` 的静态档 320px 比最窄可用区 367px 还小；`floating-panel` 的几何由 geometry 层给、它确实会越界但修法不在这条通道上）。

  这一批同样一句媒体查询都没写：`available-w` 贴的是碰撞边界，比视口宽更准。

- c18683a: PageHeader 改用分区 Grid：标题与说明上下排列，返回位、媒体位和操作区跨越两行，窄屏时操作区换到下一行；现有部件与 API 保持不变。响应式网格使压缩后的独立皮肤从 3994 增至 4855 字节。
- 6b4c5d0: **分页的每页条数控制器换成库里的下拉，省略位补上字形。**

  **`pagination` 的 `page-size-select` 此前是一个抹掉了系统外观的原生 `<select>`**，与库里其它下拉两个长相：文档站上它顶着系统的下拉箭头、展开出来的是操作系统那份列表，旁边的 `select` / `combobox` / `cascader` 却都是自己的浮层。现在它就是 `select`：分页内嵌一台 select 机器（档位与当前档受控于分页机，换档经回调送回来），`page-size-select` 降为挂载点，里头的角色节点带的是 `data-scope="select"`，吃 select 那份皮肤，浮层、键盘、连打检索与三视觉轴一并跟着它走。

  - 档位仍来自 `pageSizeOptions`，每一档的文字改由 `translations.pageSizeOption` 给（此前这条文案在库里声明着却没人用，档位文字只能靠作者自己渲染 `<option>`）。
  - 控件的可及名仍是 `translations.pageSizeSelect`：下拉自己把名字指向「标签 + 当前值」两个节点，而分页行里不摆可见标签，只剩当前值那一段会被念成控件名，所以 `trigger` 与 `list` 两处的名字链在这里换成直给的 `aria-label`。
  - 清空（下拉在收起态收的 Delete / Backspace）不改档位：分页没有「不分页」这一档，落空即不发事件。

  **破坏性变更：**

  - `connectPagination(service, normalize)` 改收两台机器：`connectPagination({ root, pageSizeSelect }, normalize)`。新增导出 `paginationPageSizeSelectProps`（喂给内嵌下拉的那份 props）、`paginationLabels`、`pageSizeOptionsOf` 与类型 `PaginationServices`。
  - `api.getPageSizeSelectProps()` 从 `T['select']` 变成 `T['element']`，只剩挂载点该有的那几个属性；控件本体走新增的 `api.pageSizeSelect`（整份 `SelectApi`）。
  - Vue 的 `XhPaginationPageSizeSelect` 与 React 的同名组件不再收渲染 `<option>` 的插槽（React 侧的 `PaginationPageSizeSelectSlotProps` 一并去掉），它们自己铺完下拉的角色节点；React 侧新增 `container` prop，与 `XhPaginationPositioner` 同义。
  - Web Components 侧作者写的 `<select data-xh-part="page-size-select">` 改成一个空 `<div data-xh-part="page-size-select">`，里头那套角色节点由元素自己建（与自绘滚动条同一条路，自建节点不打 `data-xh-part`）。
  - 皮肤里 `--xh-pagination-page-size-bg` / `-bg-hover` / `-border` / `-border-hover` 四个覆盖槽随原生下拉一并去掉，改用 select 自己那批槽。

  **省略位不写内容时此前是一格空白**：库里没有省略号字形令牌，`ellipsis-trigger` 空着就只剩一个看不出能点的空位。新增 `--xh-glyph-mark-ellipsis`，皮肤按兜底字形那套 `:empty::before` 的 mask 块画三点；作者往部件里塞了自己的图形或文字照旧让位。

- 9d6654b: **PasswordInput 统一实体 Field Chrome 内的显隐动作、自动填充和状态细节。**

  显隐按钮与输入/状态区之间新增半高语义分隔，位置按按钮在输入前后的真实 DOM 顺序选择逻辑侧，并落在 control gap 中线；高度随 sm/md/lg 与 compact 控件高度计算。新增 `--xh-password-input-visibility-trigger-separator-h`、`--xh-password-input-visibility-trigger-separator-color` 与 `--xh-password-input-caps-lock-fg-disabled` 覆写口。forced-colors 下可用分隔使用 CanvasText，禁用分隔使用 GrayText。

  自动填充底色不再对所有形态强制使用 canvas：outline、subtle、readonly 与 disabled 分别跟随当前实体外框，禁用文字也保持 disabled 前景；ghost 因透明色无法覆盖浏览器注入底，明确使用 canvas 实体替代。公开的 `--xh-password-input-input-autofill-bg/fg` 仍可覆盖最终取值。

  自动填充门禁同步理解这条状态派生链：公开 autofill 槽可以直接落到 `--xh-bg-*` / `--xh-fg-*`，也可以落到当前组件 root 上声明的私有槽。门禁枚举私有槽依赖涉及的属性状态，按选择器权重与源序取最终声明，再逐层检查共享语气槽和令牌；未声明引用、循环引用、透明或半透明终值都会失败。内置正反夹具覆盖“ghost 普通底透明但 autofill 单独实体化”的合法路径，以及未声明、成环、透明、半透明和条件媒体伪证明的拒绝路径。

  私有派生只接受组件 root 上由有限属性选择器表达的状态；门禁通过共享 CSS 声明解析器保留完整祖先栈，只有 `@layer` 不改变命中条件。`@media`、`@supports`、`@container` 等条件祖先、后代节点、伪类或运行期作者变量都不能证明普通环境的默认色。需要这些条件时必须先把确定的实体默认值收回 root 状态槽，不能登记白名单或依赖浏览器兜底。

  显隐动作的 hover 前景加入同节奏颜色过渡，ghost 的空投影改为 `none`，禁用 control 内 Caps Lock 状态与按钮使用同一禁用墨色。`readOnly` 仍允许用户揭示、聚焦和核对已有值，只有 `disabled` 禁止显隐；本次没有改写显隐、选区恢复或 Caps Lock 机器，也没有新增密码强度行为。

  当前 anatomy 没有 prefix/suffix 部件，作者节点只消费 control 的统一 gap；`control` 在 meta 中仍可省略，但省略后没有共享 Field Chrome、组合焦点环或动作分隔。这两个结构合同作为后续独立 API 审计项记录，本次不靠选择器猜任意节点职责。

  皮肤体积（去注释、压空白）：前一提交源码 15957 字节，当前 18692 字节；登记基线 15957 → 18692，只更新本组件，10% 容差保持不变。

- 680e9a2: 重构 Calendar 与 DatePicker 的周期选择契约。

  - `view` 更名为 `granularity`，支持 `day / week / month / quarter / year`。
  - 删除 `weekSelection`；周成为一级粒度，可独立搭配 single、multiple 或 range。
  - 日期格与粗粒度格统一为 `CalendarPeriod`，包含 `key / start / end / label / outside`。
  - `CalendarDay.value` 改为 `start`，`inMonth` 改为 `outside`；面板与根插槽新增统一的 `periods`。
  - 新增 `calendarPeriodValue`，把单选或区间锚点转换成 `{ granularity, start, end, keys }`。
  - 切换粒度会清空旧选择；切换选择模式会按新模式收口现值。
  - 周面板改为一列一个整周周期格；区间选择仍默认单栏，多面板只由 `visibleCount` 显式开启。
  - 周字段与周面板统一使用 ISO 周历，固定周一到周日，不再随 `locale` 改变周边界。
  - `showTime` 明确只在 `granularity=day + selectionMode=single` 下生效。

  迁移：把 `view="day" + weekSelection` 改为 `granularity="week"`；其他 `view` 用法直接改名为 `granularity`。渲染日期矩阵时使用 `day.start` 作为格子值，以 `day.outside` 判断相邻月份。

- 34a4e80: 收紧日期与时间选择面板的圆角、间距、周期格和时间列尺寸，并统一时间项的选中反馈。
- 4b4db79: **Popconfirm 三颗按钮接入 Action Control 与按压通道，取消钮改中性描边，内容面接自绘条。** 连接层的 trigger 新增
  稳定属性 `data-xh-action-control` / `data-xh-action-profile="text"` / `data-xh-action-display="always"` /
  `data-xh-action-size="md"` / `data-xh-action-variant="outline"`；confirm-trigger 新增
  `data-xh-action-size="sm"` / `data-xh-action-variant="solid"`（确认是本浮层的主要动作，与 Button 主动作同待遇，语气
  仍随 content 的 `data-tone`）；cancel-trigger 新增 `data-xh-action-size="sm"` / `data-xh-action-variant="outline"`。
  Space / Enter 与触屏按住期间该按钮投影 `data-pressed`（记在共用的 popover 机器 `context.pressed` 里，浮层收起时一并
  松开），键盘表新增 `popconfirm.kbd.press`。

  视觉默认变化：trigger 此前是 UA 裸按钮，现由家族配方按 outline 列给出 md 档盒型与中性描边。确认钮删除自写的顶光、
  soft 影与悬停 `--xh-elevation-raised` 抬升，改由配方 solid 列给出（悬停 / 按下按语气色阶梯换底并 0.97 缩放，无影）。
  取消钮由 soft 材质淡底改为透明底 + `--xh-border-control` 描边，悬停 `--xh-bg-subtle`（100）→ 按下
  `--xh-bg-subtle-hover`（200），聚焦不再铺 `--xh-material-soft-focus-surface` 实体底。挂起圆环由 pill 改为
  `--xh-shape-circle`。description 字号 `--xh-text-body-size` 14 → `--xh-text-secondary-size` 13，颜色
  `--xh-material-frosted-fg-muted` → `--xh-fg-muted`（同值）。content 新增 `overscroll-behavior: contain`，并在三端
  接上与 Popover 同款的自绘滚动条（浮层 4px 档，positioner 记进层分支、轨道透明）。

  公开槽 `--xh-popconfirm-action-px / -radius / -shadow`、`--xh-popconfirm-confirm-bg / -fg / -shadow`、
  `--xh-popconfirm-cancel-bg / -fg / -bg-focus / -fg-focus` 改为桥接到配方之前（`-bg-focus` / `-fg-focus` 桥到配方
  的 focus-visible 面，缺省不再铺实体底而是透明底 + 静息字色，槽本身保留）；新增
  `--xh-popconfirm-cancel-bg-hover / -bg-active / -border / -border-hover`、`--xh-popconfirm-action-font-weight`、
  `--xh-popconfirm-description-font-size`、`--xh-popconfirm-icon-size`。

- 5c367e5: Popconfirm 内容面与 Popover 逐值共用 M2 Frosted Surface：背景 tint、顶部高光、边界、浮层投影、
  不透明文字和 backdrop blur 保持同源，箭头沿用同一底色与边界且不重复采样。新增
  `--xh-popconfirm-backdrop` 覆写口；减少透明与高对比由材质令牌原位切换，forced-colors 明确撤掉
  装饰背景图。

  标题与说明补齐窄宽断行和 M2 前景层级。确认、取消两颗内部操作改用 Button 同源的 soft 接触面、
  顶光、边界、投影和状态过渡；确认仍为实心主操作，pending 时封住 hover / active 换面并保留
  原位 spinner。新增 `--xh-popconfirm-action-shadow`、`--xh-popconfirm-cancel-bg-focus` 与
  `--xh-popconfirm-cancel-fg-focus` 覆写口；两颗按钮聚焦时都使用明确的不透明隔离底。粗指针下命中区
  沿块轴扩到 44px，不改变按钮视觉盒或操作区排布。

  去注释压空白的皮肤体积从 8109 增至 10806 字节；增加 M2 表面、M1 操作和聚焦隔离/辅助显示，仅更新本组件基线并保留 10%容差。

- 36ff669: **Popover 触发器与关闭按钮接入 Action Control 与按压通道，说明文字改说明档。** 连接层的 trigger 新增稳定属性
  `data-xh-action-control` / `data-xh-action-profile="text"` / `data-xh-action-display="always"` /
  `data-xh-action-size="md"` / `data-xh-action-variant="outline"`；close-trigger 新增
  `data-xh-action-profile="icon"` / `data-xh-action-size="sm"` / `data-xh-action-variant="ghost"`。作者以 asChild
  换成自己的按钮时，家族标记不落到它身上。机器新增按压通道（`context.pressed` 记正被按住的那颗：`trigger` /
  `close-trigger`，导出类型 `PopoverPressedPart`），Space / Enter 与触屏按住期间该按钮投影 `data-pressed`，浮层收起时
  一并松开；键盘表新增 `popover.kbd.press`。

  视觉默认变化：trigger 此前是 UA 裸按钮，现由家族配方按 outline 列给出 md 档盒型、中性描边、悬停
  `--xh-bg-subtle`（100）→ 按下 `--xh-bg-subtle-hover`（200）并 0.97 缩放。close-trigger 删除自写的悬停 200 / 按下
  300、聚焦铺 `--xh-material-frosted-focus-surface` 实体底，改由配方 ghost 列给出（悬停 100 → 按下 200，焦点面透明吃
  库环）；作者塞入的图标由随文 1em 改为随档 16px。description 字号 `--xh-text-body-size` 14 →
  `--xh-text-secondary-size` 13，颜色 `--xh-material-frosted-fg-muted` → `--xh-fg-muted`（两者同值）。content 的
  `--xh-icon-size` 缺省由 `--xh-glyph-size-text` 改为 `--xh-glyph-size-md`，并新增 `overscroll-behavior: contain`；
  三端的自绘滚动条改走浮层 4px 档（`size: 'sm'`）。

  公开槽 `--xh-popover-close-size / -radius / -fg / -fg-hover / -bg-hover / -bg-active / -bg-focus / -fg-focus` 改为
  桥接到配方之前（`-bg-focus` / `-fg-focus` 桥到配方的 focus-visible 面，缺省不再铺实体底而是透明底 + 悬停字色，
  槽本身保留）；新增 `--xh-popover-description-font-size`。

- 41c4e35: **Popover 改用 M2 Frosted Surface，成为磨砂材质的首个锚定浮层使用者。**

  内容面统一消费 M2 的 tint、边界、顶部高光、两段 floating 投影、不透明正文和 `blur(16px) saturate(108%)` backdrop。滤镜只落在实际打开的 Popover 内容面，不写到 positioner、页面根或内容子树，也不参与进退场动画和 `will-change`；动画仍只有 opacity、短位移与既有轻微 scale。

  箭头与内容面读取同一背景和边界。箭头不单独重复 backdrop blur，避免接缝处双重采样。关闭按钮聚焦时会实际铺上 M2 的不透明 `focus-surface`，品牌焦点环先与这块稳定隔离底比较，而不是只声明一支无人消费的令牌。

  新增 `--xh-popover-backdrop`、`--xh-popover-close-bg-focus` 与 `--xh-popover-close-fg-focus` 覆写口。减少透明、高对比、forced-colors 和打印均由同名 M2 令牌原位替换；Popover 不建立辅助模式专用结构。

- be08778: **修复** 18 个点得动的部件按下去毫无回应。守按压反馈的那道门禁是名单制，没登记的部件永远不查，这批就一直空着：`image-viewer` 十一颗按钮里只有关闭钮登记过，工具条那六颗、变换归零与两颗翻页钮全部零 `:hover` / `:active`；`color-picker` 的取色钮与色板格子、`date-picker` 的确认钮同样没有按下态。新增 5 个使用者槽，没有删名也没有改名。

  补规则逐件对参照物。浮在图上的那几颗钮跟着同组件的关闭钮走：底色在半透明深底上再压一档，按下多一次轻微下压（`--xh-image-viewer-action-bg-hover` / `-active`）。`date-picker` 的确认钮跟着框内那两颗小钮走（`--xh-date-picker-confirm-trigger-bg-active`；少一段的 `--xh-date-picker-confirm-bg-active` 已删）。色板格子的底色就是它要展示的那个颜色，换底等于把展示物盖掉，于是指到哪一格看描边（`--xh-color-picker-swatch-border-hover`）、按下去看下压。`composer` 的发送钮与 `pagination` 的四颗页码钮此前只换底不下压，与同族的 `prompt-input`、`segmented` 对齐后一并补上。

  缩放量一律走 `--xh-motion-scale-press`，减弱动效档下它归 1。名单补齐后受门禁保护的部件从 42 个增到 60 个。判定为「点得动但不给按压反馈」的部件另立一张登记表，眼下只有 `image-viewer` 的触发区一条——那是作者自己的一块内容，缩放它会把作者的排版一起抖起来；这张表两侧反查：部件名在解剖里查不到、或者皮肤里已经写上了 `:active`，都判失败。

- d51d182: **热力图的档位与代码块标出来的行，在打印时各补一条非颜色通道。**

  多数打印默认丢背景色。此前 `heatmap` 的深浅只写在格子的底色上、`code-view` 标出来的行只有一层淡底加一条写在 `inset` 阴影上的实心条——落到纸上，整张热力图是一片空白，标了哪几行完全读不出来。

  `heatmap` 的打印档把档位改画成边框的粗细：0 档只有一圈发丝线，往上逐档加厚，顶到一半格宽时整格填满。比例取 0.2 / 0.3 / 0.4 / 0.5，在缺省格宽下正好落在 2 / 3 / 4 / 5 像素，与 0 档那一像素合成五档整数宽——边宽在屏幕与纸上都取整，分数宽会有两档并到一起。档数由作者定，超出缺省五档的一律按最高档画。边算在尺寸里，格子大小一点不变。图例里那几个方块跟着走同一套。

  `code-view` 标出来的行改画一圈内收的实边。用 `outline` 不用 `border`：行是横排 flex，加边会把行号与正文一起往里推，没标的行不加边就对不齐了。

  `check-print-surface.mjs` 随之多一条判据：只有颜色通道承载语义的表面逐处登记，打印档里必须另开一条非颜色通道（描边的宽与线型、字形、下划线、字重或字形斜正都算，只写 `-color` / `-offset` / `-radius` 不算）；登了却扫不到即名单过期。

  常态渲染一个像素都没变：新增的规则全部关在 `@media print` 里。

- 6c05da3: **新增** `prompt-input` 组件：会话界面的输入框，Vue 与 Web Components 两侧同时可用。

  **发送与停止原位共用一个节点**：生成期间同一颗按钮换成停止身份、恒可用，只翻 `aria-label` 与 `data-mode`。另起一颗停止按钮摆在旁边会让两颗按钮互相挤位置，而按下去的那一刻它正好换了位置。

  `submitKey` 一个 prop 表达两档：`enter` 档 Enter 提交、Shift+Enter 换行、Mod+Enter 也提交；`mod-enter` 档 Enter 换行、只有 Mod+Enter 提交。输入法组合期间的 Enter 一律放行——那一下是在确认候选词；按住 Enter 不放只提交一次。

  **同一个输入框上叠了别的处理器且它已经处理过这一下时，组件让位。** 事件处理器是链式组合的，前一个 `preventDefault` 挡不住后一个，这条判断写在组件的 `onKeyDown` 首行，作者不必再包一层。

  `loading` 用一个布尔而不是四档运行态字符串：组件只需要二值判断，「这一轮走到哪一步」是宿主的事。`allowEmptySubmit` 是唯一为附件留的钩子，附件本身用 `file-upload` 装配。

  输入框的可访问名**只在给了 `translations.input` 时才发**：无条件发会盖掉作者自己的 `<label for>` 与 `aria-label`。三个视觉轴（形态 / 语气 / 尺寸）全接，自动长高仍是皮肤的两行 CSS、不进状态机。

- 31b9569: PromptInput 默认皮肤迁移到 M3 浮动玻璃外壳：消费完整材质配方，textarea 保持实体阅读底，并新增 `--xh-prompt-input-input-radius` 覆盖槽；高对比、减少透明度、强制色和打印继续由同源令牌降级。压缩后皮肤从 9953 增至 11092 字节；增长来自顶光层、24px 磨砂及 textarea 实体阅读底，已重录逐皮肤基线，不提高全局阈值。
- 12d3a04: **新增** `question-flow` 组件：动手之前先问几句的澄清问卷，一次一题、答完一起提交，Vue 与 Web Components 两侧同时可用。

  **一次只暴露一题**：题目栈纵向排在轨道上，非当前题对读屏 `aria-hidden`、对键盘 `inert`，里面的可聚焦物另发 `tabindex="-1"`。它们仍留在轨道上，所以卡片高度有得可量，来回翻页也不必重建 DOM。

  **高度与位移是量出来的，不是猜的**：机器在活 DOM 上量当前题的盒，把结果写进 context，连接层只把它格式化成两个私有槽（视口高度与轨道位移）。连接层仍是渲染期纯函数——不查 DOM、不起定时器、不读时钟。

  **单选自动前进，多选等人点继续**：选中一项后隔一小段自动翻到下一题，连着改主意时每改一次都从整段延时重新计。**自动前进只走下一题**——末题上它停住，不替人按发送。

  **一颗按钮两个身份**：不是末题时是「继续」，末题时是「发送」，原位换 `data-mode` 与可访问名，正在按它的人不会按空。跳过关掉时整颗收起，而不是留一颗按不动的按钮；末题上跳过即交卷，否则最后一题没有出口。

  自由文本与选项同等算数：写了一句「都不是，我想要……」就算答过这一题。进度只播报一次——计数那格对读屏隐藏，换题与交卷由播报区念。

  每题是 `role=group`，题干同时是选项组的可访问名；选项组按题型取 `radiogroup` 或 `group`，组内漫游焦点，`Enter` 前进、`Space` 切换、`Home` / `End` 一步到头。上一题 / 下一题只给按钮入口，不吃全局按键——那会和选项漫游抢同一批方向键。

  它与既有的 `approval` 并存、语义不同：`approval` 是危险动作的人在环闸门（批准 / 拒绝，超时按拒绝收口），`question-flow` 收的是「怎么做」，没有拒绝这条路。

- 9c43f67: 重构 Calendar 与 DatePicker 的区间选择模型：起点只记在组件里，两端都落定才写值。

  - **破坏**：区间模式下点第一下不再把 `[起点]` 写进 `value`，`onValueChange` 只在两端齐全时通知（长度恒为 2）；`Escape` 撤掉起点后原来的区间原样还在。原来靠长度为 1 的中间态渲染「起点 → 待定」的用法，改读 `api.rangeAnchor`。
  - 区间支持按住拖选：按下即落起点、拖到另一格松开即收尾；按住已选区间的一端拖动可直接改写那一端，原地松开则从那一端重新开始；触屏按住片刻才开始拖，轻点仍是普通点选。指针在日历（日期选择器则是浮层与输入行）之外松开时，区间就地收在起点到最后悬停的那一格；`Tab` 离开网格同样收口。
  - 确认键落起点后焦点自动前进一格（挑不了就退一格），方向键走到哪儿预览就铺到哪儿。
  - 新增 `allowsNonContiguousRanges`：默认关，落了起点之后可挑范围被夹在两侧最近的不可用日之间；开着时允许跨过，只是那些日子不铺轨道。`isDateUnavailable` 多了第二个参数——当前起点，可据此限制区间长度。
  - 新增 `invalid`（Calendar）：根带 `data-invalid`，已选区间里的格子报 `aria-invalid`；已选区间某一端越界或不可用时也会自己判。DatePicker 的 `invalid` 现在还会在区间终点早于起点时自己置真，`api.invalid` 与根节点同一口径。
  - 区间里两端之间的每一格都报 `aria-selected="true"` 并带 `data-selected`；新增 `CalendarTranslations`（挑区间的两句提示、区间两端的名字、今天），DatePicker 的 `translations` 原样转交。
  - 皮肤：挑到一半的预览与已落定的区间同一副长相（去掉更淡的预览轨道与淡面端点）；实心面按下再压深一档；轨道在行首行尾的圆角与控件同档；日期格一律中等字重；命中区铺满整格；拖动中网格保持手型。区间输入行里起点那组只占自己的宽度，分隔符紧跟在起点后面。

  覆盖槽变动：新增 `--xh-calendar-cell-bg-selected-active`、`--xh-calendar-cell-font-weight`、`--xh-date-picker-range-separator-mx`；删除 `--xh-calendar-range-preview-bg`、`--xh-calendar-range-preview-cap-bg`、`--xh-calendar-range-preview-cap-fg`。

- 655ac38: Calendar 的区间模式新增 hover 预览状态，连续轨道使用轻量行边界与完整起止圆帽，中间日期不再叠加普通悬停圆底。

  DatePicker 的区间模式新增 `range-separator` 部件及三适配器组件，起止日期输入可使用正式分隔部件组合，不再依赖空白区分。

- 7abaced: Rating 按设计真源归位字段标签、星形尺度与按压：标签缺省由 `--xh-fg-muted` / 随档字号改 `--xh-fg-default` / `--xh-text-label-size`（14 / 500），根的 `--xh-rating-gap` 缺省由 `--xh-stack-gap-md` 改贴控件的 `--xh-space-1`，新增 `--xh-rating-label-fg-disabled` 与 `--xh-rating-value-text-fg-disabled`（缺省 `--xh-fg-subtle`）；星形字形改按尺寸档取 `--xh-glyph-size-sm / md / lg`（16 / 20 / 24，此前 18 / 22 / 28）；星按下在 0.97 缩放之外同时换到白底承载的 200 档底（新增 `--xh-rating-item-bg-pressed`，缺省 `--xh-bg-subtle-hover`），高对比档按住画系统高亮环；禁用的整体压暗由 root 移到星带（control），标签与分值改换禁用前景而不再叠 opacity。 皮肤体积基线 6022 → 6675 字节：涨在标签 / 分值禁用前景、星带禁用压暗与按下换底规则及其高对比档补救块。
- 6d71d04: Rating 新增首方星形皮肤字形，空条目自动绘制中性底层与强调色覆盖层，完整、半档和 RTL 状态均通过图形裁切呈现。

  双层蒙版、半档裁切与独立命中盒使 `rating.css` 的压缩体积由 4286 字节增至 5914 字节。

- 8ff4cbb: Resizable 把手移动到容器内部：边缘使用居中短条，角部使用随容器圆角变化的内收折角，并为静息、悬停和拖动态提供分级反馈。皮肤体积增加用于绘制八向短条、折角和圆角继承规则。
- fc77e4d: **修一批实测出来的横向溢出。这一批一句媒体查询都没写。**

  逐组件量过之后的结论是：多数「窄处坏掉」的修法不需要任何查询——`flex-wrap`、`min-inline-size: 0`、`overflow-wrap`、把死地板改成能让步的形式，**这类规则在窄视口与窄容器两种情形下同时成立，一份规则管两轴**。只按视口写档的话，1280px 宽屏里的 260px 侧栏照样坏（实测溢出 86px）。

  **控件的 `12rem` 死地板**是一处根因，拖着 16 个组件：`text-field` / `select` / `combobox` / `cascader` / `tree-select` / `color-picker` / `date-field` / `date-picker` / `time-field` / `time-picker` / `number-field` / `password-input` / `tags-input` / `mention` / `clipboard` / `input-group`。它们此前在窄于 192px 的容器里恒定溢出（120px 容器越界 72px）。现在地板会让步，宽处默认一像素没动。

  注意：**改令牌取值本身是走不通的**——这些控件的根是 `inline-flex`（收缩到内容宽），百分比在不定宽的包含块里退化成 auto，实测 `select` 会从 192px 塌到 68px。改的是这条地板怎么被消费。

  **横向排布族**改为折行：`tabs` / `toolbar` / `menubar` / `navigation-menu` / `toggle-group` / `segmented`。刻意不用横滚——`overflow-x: auto` 会让 `overflow-y` 一起变 `auto`，`tabs` 的指示条 `inset-block-end` 是负值、整条挂在列表盒外沿，横滚会把它裁掉，而且排得下时也照裁。

  **内容撑破行**的一批走 `overflow-wrap` 与给代码块表格加 `overflow-x`：`typography` / `markdown-stream` / `page-header` / `timeline` / `tool-call` / `download-trigger`。

  **几处与断点无关的常量缺陷**一并收掉：`alert` 的 `content` 改 `flex: 1 1 0`（≤480px 时图标脱行、关闭叉掉到内容下方）、`slider` 两端刻度文案挂在轨道外、`image-cropper` 的滑杆没归零原生 `input[type=range]` 的 UA margin（任何宽度下恒溢出 4px）、`dialog` 的 `positioner` 内衬补 `max(令牌, env(safe-area-inset-*))`（刘海机横屏会压到刘海下）。

  **`button-group` 刻意不折行**：它的段与段共边焊成一条，折行会把两端圆角切在中间。朝向应由使用者显式给 `data-orientation`，皮肤不偷偷翻。结论写进了皮肤注释与组件文档。

  **已知代价**：`tabs` 折行之后，选中标签落在上面几行时指示条的纵向位置不对——机器只把主轴那一维写成内联样式，块向落点由皮肤钉在列表盒下沿。不折行时毫无变化。根治要让连接层把块向也量出来，属机器面改动。

- d51d182: **贴着视口边的七处让出安全区。**

  带刘海、圆角与底部横条的移动视口上，屏幕四周有一段是系统占着的。此前全库 `env(safe-area-inset-*)` 零命中：轻提示与通知的摞只按 `--xh-toast-inset` / `--xh-notification-inset` 贴边，一角会被圆角切掉；回到顶部的钮与浮动按钮压在底部横条底下；顶部进度条整条藏在状态栏里；抽屉的首尾两行钻进状态栏；看图时的工具条与翻页钮贴在屏幕最边上。

  改动的七处：`toast` / `notification` 的摞（内衬）、`back-top` 与 `float-button` 的四角贴边、`loading-bar` 的上沿、`drawer` 面板的内衬、`image-viewer` 那四件悬浮件的贴边。写法一律是 `max(<原来的贴边>, env(safe-area-inset-…))`——桌面上 `env()` 恒为 0，取值与原来完全一致，没有任何一处默认渲染变化。行内轴上两侧同取 `left` / `right` 里较宽的那一段：安全区只有物理方向的四个名字，分左右写在 RTL 下会翻错边。

  挂在局部容器里的抽屉（`data-contained`）碰不到屏幕边，那一段让位收回去。居中的对话框同理不加。

  新增门禁 `check-safe-area.mjs`：一份皮肤里被声明过 `position: fixed` 的部件，若还带着非零的贴边，那几条声明里必须至少有一条写了 `env(safe-area-inset-*)`；钉在铺满视口那一层上的悬浮件逐处登记，登记与放行两份名单都做过期反查。

  `@xihan-ui/stylelint-config` 的长度白名单随之从 `calc()` 放宽到整族数学函数（`calc` / `min` / `max` / `clamp`）——里面藏的裸长度仍由禁用清单挡住，口径不变。

- fa08fb4: **滚动区补边缘渐隐：新增 `variant` 形态轴与四位到头状态。**

  滚动区此前不暴露「还能往哪边滚」这件事：内容在容器边缘被齐平切断，看不出下面还有没有东西，也没有任何属性给作者自己去画。

  新增 `variant?: 'plain' | 'fade'`，缺省 `plain` 就是现在的样子，逐像素不变。写 `fade` 时视口在两条轴上各按「那一头还滚不滚得动」铺一道渐隐带：还回得去的那一侧把内容淡出，滚到头即收成 0。渐隐由双层 `mask-image` 取交集做出，两条轴互不干扰；自绘滚动条是视口的兄弟节点，不跟着一起淡掉。带宽跟着组件已有的 `size` 走（`sm` / `md` / `lg` 三档），**不另开第二个尺寸类 prop**。

  两条轴各自到没到头同时落成视口上的四位布尔：`data-at-min-vertical` / `data-at-max-vertical` / `data-at-min-horizontal` / `data-at-max-horizontal`。要自己画「还能往下滚」的提示，接这四位即可，不必开 `fade`。判据取滚动量而不是滑块起点——滑块长度有像素下限，贴着末端时那个比例到不了 1。

  从右往左排版时横向那一层的两端对调（渐变没有逻辑方向，只能沿物理方向铺），逻辑侧的取值不动。

  `ScrollAreaAxisState` 随之多出 `atMin` / `atMax` 两项；新增 1 个使用者覆盖槽 `--xh-scroll-area-fade-size`。

- b9b6e1a: **原生细条迁到 reset 层，新增 `data-xh-scroll` 作者入口。**

  组件内滚动面只有两档（设计真源 §6.6）：Overlay 家族与定高小列表接自绘条，页内结构容器走原生细条。此前那套细条规则（`scrollbar-width: thin` + 令牌色阶 + `::-webkit-scrollbar` 五条）住在 `scrollbar.css` 的 `xihan.components` 层，只有引了 Scrollbar 皮肤才生效，且只命中 `[data-scope][data-part]`——作者自己的滚动容器、文档示例、Typography prose 里的 `<pre>` 都吃不到。现在整段迁进 `reset.css`：选择器扩成 `:where([data-scope][data-part], [data-xh-scroll], [data-scope='typography'][data-part='prose'] pre)`，特指度仍是 (0,0,0)。作者在自建滚动容器上写 `data-xh-scroll` 即得同一套细条，不必引任何组件；`data-xh-scroll` 只挂样式，不进任何组件契约。原来那条 `scrollbar-gutter: auto` 不再写——它是初始值，`stable` 只给内容高度会变的容器由皮肤显式写。

  按需只引 `scrollbar.css` 的用户注意：细条规则不再随它带出，改由 `reset.css` 提供（`index.css` / `index.unlayered.css` 两份入口都已含）。`[data-xh-scrollbar]` 藏原生条那两条仍留在 `scrollbar.css`，它是 Scrollbar 组件的契约，(0,1,0) 在两种产物里都压得过 reset。

  随之收口的手写：`time-picker` / `time-range-picker` 的时间列与快捷列删掉自带的 `scrollbar-width: thin`（reset 已覆盖）；`menubar` / `popconfirm` 的 positioner 删掉死声明 `--xh-scrollbar-track-bg: transparent`（两者都没接自绘条，接线时随壳一起加回）。

  `@xihan-ui/stylelint-config` 新增两条：`scrollbar-width` 只许写 `none`（挂了自绘条时藏原生条），`scrollbar-color` 一律不许写；`reset.css` 与内联它的 `index.unlayered.css` 通过 override 放开这两条，其余禁用项原样保留。

  `check-scrollbar-hosts` 扩成滚动面归档门禁：`scroll-surface-registry.json` 逐面登记两档归属与 `overscroll` / `gutter` 该不该写；皮肤里每一处 `overflow: auto|scroll` 都得在表里、表里每一条都得扫得到；自绘面核三端接线、轴齐全、浮层壳 `size: 'sm'`；原生面不得自己写 `scrollbar-width` / `scrollbar-color`；`--xh-scrollbar-track-bg` 只有宿主的壳才有资格声明。尚未达标的面记在同一份 JSON 的 backlog 段，逐条理由，命中即删、只减不增。

  文档站的页面与侧栏滚动条回到与组件同一 `type`（`scroll-hover`）与令牌色阶，不再另写 `type="scroll"` 与三条滑块色覆写。

  `reset.css` 里原生细条的 `::-webkit-scrollbar-thumb` 圆角改取 `var(--xh-shape-pill)`：原生滑块与自绘 `scrollbar:thumb` 同为一维对象，形状身份是胶囊，不再按厚度折半凑半圆（三档厚度下可见形状不变）。`check-shape-scale` 的 NO_SLOT 登记 `reset:*::-webkit-scrollbar-thumb`，主体为 `:where(…)` 一组宿主的规则部件位记作 `*`。

- e24a3d3: Scrollbar 新增 `anchor` 属性（`shell` | `layer`，默认 `shell`）：`layer` 时根节点仍挂在定位壳里，
  但按滚动层在壳内的偏移盒（offsetLeft / offsetTop / offsetWidth / offsetHeight）由连接层写成内联几何
  贴在该层的盒子上，根带 `data-anchor="layer"`，皮肤放开壳边的 inset；层与并排兄弟的伸缩、增减都会
  重新测量。多个滚动层并排共用一个壳（级联的列、时间列）时每层各自一套滚动条。三端 `useScrollbars`
  / `ScrollbarsController` 同步接收 `anchor`，Web Components 的 `ScrollbarsController` 另支持
  `scrollables` 多路形态（按当前在场的层逐层建一套、离场即拆），并提供 `dispose()`。
- 2d78eb0: Scrollbar 改用透明轨道与半透明中性滑块，悬停和拖动时逐级增强对比，双轴交叉区域保持透明。
- 43ee4f3: Select 保持实体触发控件，并把选项 popup 迁入 M2 磨砂表面。content 的背景、前景、描边、阴影、
  backdrop 与顶边高光分别由现有 `--xh-select-content-*` 槽和新增的
  `--xh-select-content-backdrop` / `--xh-select-content-highlight` 控制；footer、分组标题、空态与加载态
  改用同一磨砂表面的次要前景，后继分组通过 `--xh-select-group-separator-color` 画实体分隔线。

  选项使用不猜测作者内容的弹性行：图标、头像、正文与尾部节点保持 DOM 顺序，正式 `item-text` 占据
  剩余宽度并截断长文，`item-indicator` 以自动逻辑边距固定到末端。单选、多选均由对号表示选中，
  正文保持正常颜色和字重；中性底只表达悬停与键盘高亮，键盘焦点保留独立焦点环；
  `--xh-select-item-bg-pressed` 提供独立按下反馈。禁用项与禁用勾选标记统一退到失效前景并显示不可用游标。

  popup 改用 `xh-overlay-slide-in` / `xh-overlay-slide-out`：positioner 先清零四个方向变量，再按物理
  placement 激活一侧，首帧落位后只做 opacity 与短位移，不再缩放。旧关键帧定义保留，不改变其他组件。
  多选标签继续直接渲染 Tag 的 root/label/close-trigger，外观由已发布的 Tag M1 皮肤负责。

  皮肤体积变化来自材质、弹性作者内容布局与状态反馈；基线只登记本组件，10% 容差保持不变。

  皮肤体积（去注释、压空白）：前一提交源码 20697 字节，当前 20577 字节；登记基线 20697 → 20577，只更新本组件，10% 容差保持不变。

- e3abd75: **`select` 多选标签行封顶：不给 `maxTagCount` 时最多摆 3 枚，其余合成一枚 `+N`；标签行成为部件，`+N` 是一枚 `tag`，三家适配器都渲出来。**

  从前 `maxTagCount` 缺省是「全摆」：选中几项，`api.tags` 就给几枚，`overflowCount` 恒 0；`+N` 没有部件，作者自己拿一个 span 画。触发器是一行控件（盒高钉在 `--xh-control-h-*`，这一点没变），标签排不下就往盒外冲——实测 320px 栏里选 10 项，最后一枚标签的右缘越过盒的右缘 195px，选 30 项越过 1315px，展开箭头一并被推出盒外；600px 栏里选 30 项也越过 1035px。

  现在：

  - **`maxTagCount` 缺省 3**，导出常量 `SELECT_DEFAULT_MAX_TAG_COUNT`。选中 4 项起 `api.tags` 只给前 3 枚，其余进 `overflowCount`。要回到从前的「全摆」，显式传 `maxTagCount: Infinity`。
  - **新增部件 `tag-list`**（`api.getTagListProps()`）：触发器里收着可见标签与 `+N` 的那一行。无选中时带 `hidden`。
  - **`+N` 那一枚**（`api.getOverflowTagProps()`）：折起的标签合成的一枚 `tag`（`data-scope="tag"`，带 `data-count`）；没有折起的标签时是 `tag` 的收起态（`data-state="closed"` + `hidden`），不留空位。文字由 `api.overflowText` 给，走新增的 `translations.overflowTag(count)`，默认 `+N`。与触发器里的标签一样套的是 `tag` 组件，见同批「选择器的标签套 `tag`」那份变更集。
  - **三家适配器**：Vue 新增 `XhSelectTagList` / `XhSelectOverflowTag`，React 同名两件；`+N` 那一枚不写内容即显示 `overflowText`。Web Components 侧作者写 `<span data-xh-part="tag-list">` 与 `<span data-xh-part="overflow-tag">`（后者由元素接成 `tag` 的 root），`+N` 由元素填字（留空归元素、写了内容归作者，与 `value-text` 同一条规矩）。根插槽 / 函数式 children 的载荷多一项 `overflowText`。
  - **皮肤**：`tag-list` 是触发器里可压缩、裁溢出的一行（`flex: 0 1 auto; min-inline-size: 0; overflow: hidden`），行里的标签装不下时各自缩短带省略号，`+N` 不缩；标签与 `+N` 的样子归 `tag.css`，按 `[data-scope="tag"][data-part="root"][data-count]` 覆盖 `--xh-tag-bg` / `--xh-tag-fg` 即可把 `+N` 与选中值区分；新增覆盖槽 `--xh-select-tag-list-gap`。标签行露面时 `value-text` 让位（`display: none`），无选中时反过来——两者同时写在触发器里即可，不必再按 `tags.length` 二选一；`value-text` 留在 DOM 里，触发器的可及名仍从它取到完整的选中项文本。

  同一组量测改后：320px 栏里选 10 项、30 项，标签行、每枚标签与 `+N` 的右缘都不越过盒的右缘，展开箭头留在盒里；192px 的最小盒里三枚长标签都带省略号，`+N` 完整可见；盒高在 0 / 3 / 10 / 30 枚下都是一行控件高。

  **破坏面：**

  - 缺省下选中超过 3 项的多选，`api.tags` 少了、`overflowCount` 不再恒 0。断言过「全摆」的用例要改，或显式传 `maxTagCount: Infinity`。
  - `SelectTranslations` 多一个必填键 `overflowTag`；自己整份实现该接口的要补上。
  - `SelectApi` 多 `overflowText` / `getTagListProps` / `getOverflowTagProps` 三个成员；自己按 `SelectApi` 造对象的要补上。
  - 解剖多一个部件：`tag-list`（`+N` 与标签是 `tag` 的 root，不算 select 的部件）。按部件数断言过的用例要改。
  - 皮肤新增了 `trigger:has(tag-list:not([hidden])) value-text { display: none }` 这条让位规则：从前把标签直接摆在触发器里、又同时渲着 `value-text` 的写法不受影响（没有 `tag-list` 就不让位）；换成 `tag-list` 之后 `value-text` 会在有选中时收起。

- fa08fb4: **选择与开关族补七项能力，全部是加法：不渲染新部件、不写新 prop 的既有用法逐值不变。**

  **`select` / `cascader` / `transfer` 补 `group` 与 `group-label` 两个部件。** 段落壳是 `role=group`（列表框允许拥有的两种子节点之一），段标题经 `aria-labelledby` 挂上来；条目照旧归到同一份集合，方向键与连打检索跨段贯通。三家的段标题与条目同一个 `padding-inline`，标题与条目文字因此在一条竖线上。`transfer` 的分组两侧各挂一份，身份连 `side` 一起算，两边的标题 id 不会撞；组内条目搬空或被搜索筛净时整段连标题一起收起。Vue 侧新增 `XhSelectGroup` / `XhSelectGroupLabel`、`XhCascaderGroup` / `XhCascaderGroupLabel`、`XhTransferGroup` / `XhTransferGroupLabel`，Web Components 侧各新增两个 `csspart`（段落壳自报 `value`）。新增类型 `SelectGroupProps` / `CascaderGroupProps` / `TransferGroupProps`。

  **`cascader` / `tree-select` 补 `footer` 部件**，与 `select` 的那条同一件事：浮层底部的操作区，写在 `content` 里，不进列表框与树的拥有关系，方向键与连打检索都走不到。`cascader` 的底栏横跨全部列——底栏在场时浮层壳才允许换行，没写它的浮层列多到放不下时仍是整体横向滚动。Vue 侧新增 `XhCascaderFooter` / `XhTreeSelectFooter`。新增覆盖槽 `--xh-cascader-footer-gap` / `-py` / `-px` / `-border` / `-font-size` 与同名的 `--xh-tree-select-footer-*` 五支。

  **`select` / `listbox` / `tree-select` / `transfer` 补 `empty` 部件。** 它一律待在列表框（或 `role=tree`）之外：`select` 与 `tree-select` 放 `content` 里当 `list` / `tree` 的兄弟，`listbox` 放 `root` 里当 `content` 的兄弟，`transfer` 放面板里当 `list` 的兄弟。露不露面的判据分两档：`transfer` 按本侧此刻可见的条目数由连接层收放；另外三家给了 `collection` 才由连接层按条数判定，条目手写时库数不出有几条，那一档不写 `hidden`，收放归作者。Vue 侧新增 `XhSelectEmpty` / `XhListboxEmpty` / `XhTreeSelectEmpty` / `XhTransferEmpty`。新增覆盖槽为四家各三支 `--xh-<组件>-empty-py` / `-px` / `-fg`（另有 `-font-size`）。

  **`slider` 补 `value-text` 部件**：挂在拇指里的值气泡，跟着拇指走位，默认只在推动那一刻露面（多拇指时只有手真正推着的那一个冒出来）。它是 `aria-hidden` 的，读屏仍走拇指自己的 `aria-valuetext`。新增 api `valueText(index)`：给了 `getValueText` 就是它的产出，否则是值本身；Web Components 侧留空的气泡由元素代填。新增覆盖槽 `--xh-slider-value-text-offset` / `-py` / `-px` / `-radius` / `-bg` / `-fg` / `-font-size`。

  **`rating` 补 `value-text` 部件**：写在 `root` 里、`control` 的兄弟，显示当前该点亮到的那个数（指针预览期间跟着预览值走），数字等宽因此不会带着星星左右挪。它在场时根改成两列栅格，星星带与分值并排、标题仍独占一整行；没写这个部件的评分不命中那条规则，还是原来的竖排。新增 api 只读字段 `valueText`。新增覆盖槽 `--xh-rating-value-text-fg` / `-font-size`。

  **`listbox` 与 `transfer` 补 `tone` / `size` / `invalid` / `readOnly` 四条轴，`checkbox-group` 补 `tone` / `size` 两条。** 尺寸只换根上的几个私有槽（条目内边距、间距、字号，以及 `transfer` / `checkbox-group` 的勾选方框直径），中档逐值等于此前写死的那一份；语气把勾选标记与勾中填色接到语气层派生好的档上，不写 `data-tone` 时退回品牌色。`listbox` / `transfer` 的只读改不动选中值但照常浏览与聚焦（`transfer` 连搬运一起封住、搜索照旧可用），校验失败在 `listbox` 落到列表框描边、在 `transfer` 落到两侧面板描边，两者同时发 `aria-readonly` 与 `aria-invalid`。两件随之登记进 `check-field-wiring` 的分组名单：它们的根有分组角色、焦点在各条目上，不是单一可聚焦控件。

- ff84284: Separator 的 decorative 模式现在同时输出 `role="none"` 与 `aria-hidden="true"`，确保带可见文案的纯装饰分隔整段退出无障碍树；语义分隔继续使用 `role="separator"`，垂直时才显式输出 `aria-orientation="vertical"`。

  默认线色改用会随浅深主题、对比度与透明度策略变化的 frosted material separator，subtle 档使用 soft material separator，strong 档保留高对比边界。根线与文字两侧端线增加统一的胶囊端点，让 1px 横竖线在实体和玻璃表面都保持细腻边缘。

- 825d92e: **聚焦环收进一份公共层。** 新增 `css/focus.css`，按 `[data-scope][data-part]:focus-visible` 给全库画环，粗细走 `--xh-ring-width`、颜色走 `--xh-ring-focus`、偏移走 `--xh-ring-offset`。它排在全部组件皮肤之前，组件皮肤同特指度且排在其后，要另画环照写即可压过。

  原先 91 份皮肤各写一遍同一段配方：其中 89 条与公共层逐值相同，已删；45 条只是往内收，改为只留一句 `--xh-_ring-offset: var(--xh-_ring-inset);`。两种内收写法（按环宽取负、按环偏移取负，取值同为 `-2px`）合并为一个。

  覆盖槽名、部件名与 `data-*` 取值一个没动，皮肤的取值也一个没变——两个适配器的计算样式快照逐字不变。

  一处行为变化：解剖发出的部件里，原先没有任何聚焦规则的那些，键盘落焦时画的是浏览器默认环，现在画库里这一圈。组件皮肤里写着 `outline: none` 的部件不受影响，仍然不画。

  按需引入的人多引一份：`import '@xihan-ui/styles/focus.css'`，位置排在组件皮肤之前。

- 825d92e: **字段族标签收进一份公共层。** 新增 `css/label.css`，按 `[data-part='label']` 给列出的 18 个 scope 画两条逐值相同的规则：行距取 `--xh-leading-none`，禁用档字色取 `--xh-fg-subtle`。原先这两条散在 18 份皮肤里各写一遍（22 处声明、其中 4 条整块规则），现在收成 2 条。

  字色、字号、字重三条仍留在各组件皮肤：它们挂着 `--xh-<组件>-label-*` 覆盖槽，槽名里带组件名，写不进一条共享规则。scope 逐个列出而不写通配：`label` 这个部件名在标签、统计、进度、推理、说明列表上指的是另一种文字。

  按需引入的人多引一份：`import '@xihan-ui/styles/label.css'`，位置排在组件皮肤之前。

  **`--xh-border-control-focus` 改指聚焦环色。** 它原先指着 `{border.control}`，四个档位下与常态描边逐值相同——输入类控件聚焦时那道描边过渡不出任何变化。现在指 `{ring.focus}`（浅色 brand-500、深色 brand-400），聚焦时描边与聚焦环同色。

  跟着换色的还有三处把它当默认值消费的指示条：表格的列宽拖拽条与放置条、标签页的放置条，拖拽中由中性灰变品牌色。要钉回中性色的写 `--xh-table-resize-fg-active` / `--xh-table-drop-fg` / `--xh-tabs-drop-fg`。

  覆盖槽名、部件名与 `data-*` 取值一个没删也没改名。

- 825d92e: **禁用光标与触摸高亮收进一份公共层。** 新增 `css/pointer.css`，两条规则：

  - `[data-scope][data-part][data-disabled]`、`:disabled`、`[aria-disabled='true']` 三种条件拼写合成一条选择器，光标一律 `cursor: not-allowed`。原先 151 处逐份手写，现在皮肤里只剩 3 处（提示条按钮的「待决」与「在途」分档、分栏与裁剪把手要压过按走向给的 resize 光标），其余由这条接住。
  - `[data-scope]` 上一条 `-webkit-tap-highlight-color: transparent`。它是继承属性，一条规则覆盖全库节点与它们的后代，触摸点按不再闪浏览器画的高亮方块。

  同批统一的两件事：

  - 在途光标从三种拼写（`progress` / `wait` / `not-allowed`）收成一种 `progress`，`cursor: wait` 归零；按钮的 `[data-loading]` 从「禁用」那档拆出来单列。挂在哪个部件上仍由组件自己说——`data-loading` 在若干组件上挂在包着作者内容的外壳节点上，写成通配会把光标铺到作者自己的内容上。
  - 只读与禁用相遇时的优先级统一写成 `[data-readonly]:not([data-disabled])`，不再靠源序定胜负（取色器的通道滑条原先源序写反，禁用态被只读态盖住）。

  `data-disabled` 由这条与组件无关的规则消费，`check-dead-state-attr` 的逐组件豁免登记随之删去 15 条。

  按需引入的人多引一份：`import '@xihan-ui/styles/pointer.css'`，位置排在组件皮肤之前。

- 825d92e: **面板外壳的内衬与角落关闭钮收进共享语义档。**

  令牌 `surface` 一族补齐两件事。原先 `py-md` 指着 `{section.py}`、`px-md` 指着 `{control.px-lg}`，而 `py-sm` / `px-sm` 是直写原语加 compact 表里逐档覆盖——同一族两条密度跟随路径。现在四档一律直写原语，compact 覆盖写在 compact 表里，两档同源。取值一个没变（comfortable 20/16，compact 16/12）。

  新增四边等宽的面板内衬档 `--xh-surface-pad-xs|sm|md|lg`（4 / 8 / 12 / 16）与角落钮贴边档 `--xh-surface-action-inset`（12）。`pad-*` 三档在 compact 下逐档收窄（6 / 8 / 12）。

  皮肤侧：

  - 气泡、悬浮卡、确认气泡三份各写一遍的三档内衬（每份 6 条声明、纵横两把尺）收成一个私有槽读 `--xh-surface-pad-*`，18 条声明变 9 条。纵向内缩原先取不随密度动的原语，现在与横向同尺，compact 下一起收窄。
  - 菜单、菜单栏、右键菜单、导航菜单四份外壳内衬改读 `--xh-surface-pad-xs`；通知卡片读 `--xh-surface-pad-lg`；提示条读 `--xh-surface-py-sm` / `--xh-surface-px-sm`。comfortable 取值不变，compact 下随密度收窄。
  - 四份角落关闭钮的贴边与标题让位量改读 `--xh-surface-action-inset`：漫游导览从 8px 挪到 12px，与对话框、抽屉、通知同档（它的面板内衬本就与对话框同为 20 / 16）；通知的标题让位量原先按 8px 让、钮却钉在 12px 处，现在两处取同一个值。气泡的贴边仍是 8px：它的面板内衬只有 12px，28px 的钮按 12px 贴边会伸出面板自己的盒子、被 `overflow` 裁掉。
  - 对话框、抽屉、气泡、漫游导览四份关闭钮的过渡属性表补上 `color`：这四颗叉悬停时换前景色，属性表里没有它，颜色是硬切的。九颗关闭钮的属性表现在统一为 `background` / `color` / `scale`（看图器那颗前景恒随外层继承、自己不定色，仍是两项）。

  覆盖槽名、部件名与 `data-*` 取值一个没删也没改名。

- f7cd99b: **SideNav 接入 Collection Item 配方：当前项改品牌淡底 + 2px 指示条，展开路径改中性面，行补按下面。**

  - 链接与分支按钮投影 `data-xh-collection-item` / `-size` / `-context='page'`，文字落 `text` 槽、箭头落 `suffix` 槽；分支按钮在原生 `disabled` 之外同报 `aria-disabled`。
  - 当前项由「品牌淡底 + 品牌深字」改为 `--xh-bg-brand-subtle` 行面 + `--xh-fg-on-brand-subtle` 前景 + 起始侧 2px `--xh-fg-brand` 指示条，字重保持 medium；current + hover 20%、+ pressed 28%。通往当前项的展开分支由「品牌字色」改为与悬停同档的中性面（`--xh-bg-subtle`），字色与字重不变。悬停 100、按下 200 只换面（此前按下零反馈，也没有过渡）。公开槽名不变，`--xh-side-nav-row-fg-active` / `--xh-side-nav-row-fg-in-path` 缺省值随之改变；新增 `--xh-side-nav-row-bg-pressed` / `--xh-side-nav-row-bg-in-path` / `--xh-side-nav-row-fg` / `--xh-side-nav-link-font-size` / `--xh-side-nav-indicator-color`。选中行与在途行不再随 `tone` 换色。
  - 折叠态弹出面板的滚动面补 `overscroll-behavior: contain`（锚定浮层里的滚动面）。
  - 根与定位层上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档。

- 2fdf721: **SignaturePad 画布改按字段外壳规则取值，清空按钮接入 Action Control text 档与按压通道。**
  连接层的 clear-trigger 新增稳定属性 `data-xh-action-control` / `data-xh-action-profile="text"` /
  `data-xh-action-display="always"` / `data-xh-action-size="sm"` / `data-xh-action-variant="outline"`；
  机器新增按压通道，Space / Enter 与触屏按住期间 clear-trigger 投影 `data-pressed`（禁用或只读不进入，
  按住途中转禁用 / 只读由机器收面），键盘表新增 `signature-pad.kbd.press`。

  视觉默认变化：画布 `control` 的圆角由 `--xh-shape-surface` 8px 改为字段身份的 `--xh-shape-control` 4px，
  静息底由 `--xh-bg-surface` 改为字段用的 `--xh-bg-canvas`（亮色同为 neutral-0，暗色 900 → 950），
  禁用面由只换 `--xh-bg-muted` 底改为 `--xh-border-default` 描边 + `--xh-bg-subtle` 底 + `not-allowed` 手型，
  只读新增 `--xh-bg-subtle` 底（描边不动）；新增公开槽 `--xh-signature-pad-bg-readonly` /
  `--xh-signature-pad-border-disabled`。标签由 `--xh-fg-muted` 改为字段标签档 `--xh-fg-default`，禁用标签
  `--xh-fg-subtle`（新增 `--xh-signature-pad-label-fg-disabled`）；根的 gap 由 `--xh-stack-gap-md` 16px 改为
  `--xh-space-2` 8px（画布到清空按钮与状态句），标签到画布收成 `--xh-space-1` 4px（新增
  `--xh-signature-pad-label-gap`）。状态句改说明角色：字号 `--xh-text-secondary-size` 13px、行高
  `--xh-leading-normal`。

  清空按钮：皮肤删除自写的盒型、高度、内距、描边、底、前景、字号、手型、过渡、hover 抬影
  （`--xh-elevation-raised`）、active 与 `:disabled` 面，改由家族配方按 outline 列给出——白底承载阶梯悬停
  `--xh-bg-subtle`（100）→ 按下 `--xh-bg-subtle-hover`（200），此前是 200 → 300 并悬停抬影；各态无影。
  公开槽 `--xh-signature-pad-clear-bg / -bg-hover / -bg-active / -bg-disabled / -fg / -border / -border-hover / -h / -px / -gap / -radius / -shadow-hover` 改为桥接到配方之前（`-shadow-hover` 缺省 none），新增
  `--xh-signature-pad-clear-font-size` / `-clear-icon-size` / `-clear-fg-empty`。皮肤体积基线随桥接槽一并重落。

- 51f2cbf: **修复**四处令牌与档位没对齐。

  **list 的 lg 档描述行还是中号字。** 三个尺寸档各换一组私有槽，`--xh-_list-description-size` 唯独 lg 那一档漏了声明：大号列表的标题跟着放大，描述行原地不动，两行字的级差在这一档塌成了零。补上 `--xh-control-caption-lg`，与 sm / md 同取一把尺。`check-size-ladder` 的判据是三档齐全才比，缺一档整个槽直接跳过——补齐之后这个槽才落进门禁管辖。

  **list 条目的悬停底色比同族深一档。** 列表条目的轻档在库里一律是中性灰的 `--xh-bg-subtle`（listbox / select / combobox / menu 都是这一档），只有 list 的兜底取了更深的 `--xh-bg-subtle-hover`：同一份数据换个组件渲，鼠标划过的深浅就跳一档。兜底改回 `--xh-bg-subtle`；显式写过 `--xh-list-item-bg-hover` 的用法不受影响。

  **新增使用者槽 `--xh-signature-pad-control-border-invalid`。** 画布的校验失败描边此前直接读语义令牌，是库里同类声明里唯一没留覆盖入口的一处——只想改这块画布的报错色，就得连带改掉全库所有控件的。

  **splitter 的禁用不透明度留出使用者槽 `--xh-splitter-disabled-opacity`（默认 0.6）。** 原先是写死的字面量，改不动。它没有跟着 `--xh-state-disabled-opacity`（0.5）走：那一档压的是控件自己的图形，而分栏这一层压的是宿主塞进面板里的正文，0.5 会把黑字白底压到 3.94:1、读不出字。

- 272d6ea: Slider 按设计真源归位字段标签、拇指描边与禁用面：标签缺省由 `--xh-fg-muted` 改 `--xh-fg-default`，根的 `--xh-slider-gap` 缺省由 `--xh-stack-gap-md` 改贴控件的 `--xh-space-1`，新增 `--xh-slider-label-fg-disabled`（缺省 `--xh-fg-subtle`）；拇指是 raised 面，描边缺省由 `--xh-bg-surface` 白边改 `--xh-border-default`（`--xh-slider-thumb-border` 覆盖槽不变）；刻度点是正方盒，圆角由 pill 改 circle；禁用不再整体压暗，改为前景与表面各自降级——新增 `--xh-slider-track-bg-disabled`（`--xh-bg-subtle`）、`--xh-slider-range-bg-disabled`（`--xh-fg-disabled`）、`--xh-slider-thumb-bg-disabled`（`--xh-bg-surface`）、`--xh-slider-thumb-shadow-disabled`（none）、`--xh-slider-tick-bg-disabled`、`--xh-slider-tick-bg-active-disabled`、`--xh-slider-tick-label-fg-disabled`，禁用的轨道与拇指改 `not-allowed` 手型。 皮肤体积基线 7646 → 8757 字节：涨在标签、轨道、区间、拇指、刻度与刻度文案各自的禁用规则。
- 49ed6b0: **修复**十二处槽名与它作用的部件对不上——使用者按名字找过去，改的是另一处，或者干脆找不到名字。十二处一律改名，走样的旧名不留兼容位，删掉的名字逐条列在「摘掉全部旧名兼容层」那份里。

  **number-field 的一体式盒挂着输入框的名字。** 描边、底、落影、圆角与悬停/聚焦/校验失败/只读/禁用五档全画在 `control` 上，槽却叫 `--xh-number-field-input-*`，而 `input` 是同一份解剖里另一个真实部件——同为一体式盒的 text-field 与 password-input 用的都是 `-control-`。补出 `--xh-number-field-control-bg` / `-border` / `-border-hover` / `-border-focus` / `-border-invalid` / `-bg-readonly` / `-bg-disabled` / `-shadow` / `-radius` 九个。`-control-` 只改一体式盒那一档，`-input-` 只改独立输入框那一档，两档各调各的。

  **notification 的卡片十二个槽没有部件段。** 卡片是 `item` 部件，其余六个角色都带 `item-` 前缀，只有卡片自己的间距、宽度、内衬、描边、圆角、底、前景、落影、字号与行距不带；其中管内衬的 `--xh-notification-px` / `-py` 与管摞贴边的 `--xh-notification-inset` 只差一个词，改错了要在九个落位上逐个试。十二个槽各补一个 `--xh-notification-item-*`。

  **另十处走样一并收口。** `password-input` 大写锁定提示的槽叫 `-hint-`（补 `--xh-password-input-caps-lock-*`）；`transfer` 面板里的头、标题与计数丢了 `panel-` 段（补 `--xh-transfer-panel-header-*` / `-panel-title-*` / `-panel-count-*`）；`tree` 叶子勾的前景少了 `item-` 段而分支那条没少（补 `--xh-tree-item-indicator-fg`）；`tree-select` 的 `--xh-tree-select-indicator-size` 名指触发器上那枚箭头、实改下拉行里的勾与展开箭头（补 `-item-indicator-size` 与 `-branch-indicator-size`）；`date-picker` 的确认钮劈了 `-confirm-trigger-` 与 `-confirm-` 两套前缀且高度无槽（统一到 `-confirm-trigger-`，并补 `-confirm-trigger-h`）；`highlight` 三个 mark 槽丢了部件名（补 `--xh-highlight-mark-radius` / `-bg` / `-fg`）；`back-top` 十三个槽里唯一带部件名的那个反向不一致（补 `--xh-back-top-size`，与 `float-button` 同形）；`layout` 两个宽度拼全成 `-width` 而同处的高度用 `-h` 缩写（补 `--xh-layout-sider-w` / `-sider-collapsed-w`）；`popconfirm` 的 `--xh-popconfirm-cancel-trigger-px` 同时管着确认钮（补两颗共用的 `--xh-popconfirm-action-px`）；`progress` 的 `--xh-_thickness` 与 `--xh-_diameter` 是全库仅有的两个不带组件前缀的私有槽，直接改名成 `--xh-_progress-thickness` / `--xh-_progress-diameter`（私有槽不在公开面里）。

  **`check-spacing-slots` 加了一条名字判据**：一个槽的部件段若正好是本组件另一个真实部件的名字，这条规则又不作用在那个部件上，就判失败。跨部件读取确实有意的（图例方块取格子的形状、表头单元格取表头行的底色、标签的上下留白由控件高度算出来等）写进 `CROSS_PART` 并逐条说明理由，登记过期即报。默认渲染逐像素未变。

- 3be9407: Sortable 把手接入 Action Control 家族并按设计真源归位拖起海拔：`item-drag-trigger` 投影 `data-xh-action-control` / `profile=icon` / `variant=ghost` / `display=always` / `size=xs`（24px 正方盒，与此前尺寸相同），盒、悬停 / 按下与 0.97 按压、粗指针热区、焦点环、禁用面由家族配方给，悬停由 `--xh-bg-subtle-hover` 改白底承载的 `--xh-bg-subtle`（100），新增按下面 `--xh-sortable-drag-bg-active`（缺省 `--xh-bg-subtle-hover`，200）与 `--xh-sortable-drag-icon-size`；既有 `--xh-sortable-drag-*` 覆盖槽保留，手型仍为 grab / grabbing；拖起的条目 `--xh-sortable-item-shadow-dragging` 缺省由 `--xh-elevation-raised` 改 `--xh-elevation-lifted`。 皮肤体积基线 3666 → 4255 字节：涨在把手映射到 Action Control 桥接槽的一组声明与拖动中的手型槽。
- 05576a4: **Splitter 分隔条悬停改按线取描边梯度。** `resize-trigger` 是一根线不是一块面，悬停不再落面阶梯的 300 档：
  `--xh-splitter-trigger-bg-hover` 的缺省由 `--xh-bg-subtle-active` 改为 `--xh-border-control`（与静息
  `--xh-border-default` 同向加深一档，和字段描边 rest → hover 同一梯度）；拖动中 `--xh-bg-brand`、禁用
  `--xh-border-subtle` 不变。使用者槽仍优先于缺省。
- e6542a9: **修复**六处「改一处视觉改不动、或改一处坏另一处」。新增 22 个使用者槽，没有删名也没有改名。

  **同一个槽既做常态又做状态，一调就把两档焊死。** `card` 的 `--xh-card-border` / `--xh-card-shadow` 同时写在常态与 `hoverable` 的悬停上，而两档的缺省本就不同（`border-default` 与 `border-strong`）——作者设了卡片描边，指针停上去就再也看不出变化，悬停这一档从此调不回来。`accordion` 的 `--xh-accordion-trigger-fg` 同时管常态与展开态，改了常态字色，展开那一条的语气高亮跟着被抹平。各另立 `--xh-card-border-hover` / `--xh-card-shadow-hover` / `--xh-accordion-trigger-fg-open`，缺省值原封不动，写法与 `float-button` 的悬停档、`navigation-menu` 的当前项一致。新槽只管状态那一档：`--xh-card-border` / `--xh-card-shadow` / `--xh-accordion-trigger-fg` 从此只管常态，两档要一起改就两个槽都设。

  **四家浮层的关闭钮没有前景槽。** `dialog` / `drawer` / `popover` / `tour` 的那颗叉把 `--xh-fg-muted` 与 `--xh-fg-default` 直接写在 `color` 上，要单独调淡或调深这一颗只能提高特指度去压整条规则；同为角落关闭钮的 `alert` / `notification` / `toast` / `floating-panel` 四家都留了槽。四家一起补 `--xh-<组件>-close-fg` 与 `-close-fg-hover`。`dialog` 的说明字号也补上 `--xh-dialog-description-font-size`——紧邻的标题一直都有。`check-clear-trigger` 同时加了这条判据：角落关闭钮的常态前景必须走本组件的使用者槽，悬停换了字色的那条也得走；`image-viewer` 的叉随整块 chrome 继承颜色、自己不定前景，作为例外登记在案，哪天它自己留了槽，登记过期会当场报出来。

  **三件下拉的标签禁用色没有槽。** `cascader` / `select` / `combobox` 的 `[data-part='label'][data-disabled]` 直接写 `--xh-fg-subtle`，而输入族另外 11 件（`text-field` / `date-field` / `number-field` …）缺省值一模一样却都留了 `-label-fg-disabled`。三件补齐。

  **三处最常被调的地方没有出口。** 卡片说明的色与字号（`alert` 的同名部件两样都有）补 `--xh-card-description-fg` / `-font-size`；侧栏当前页的品牌高亮（底色、字色、字重三样全写死，menu 族五家都有 `-bg-active`）补 `--xh-side-nav-row-bg-active` / `-fg-active` / `-font-weight-active`，指向当前页的那条祖先枝补 `--xh-side-nav-row-fg-in-path`；`timer` 的 `item` 部件此前在皮肤里一条规则都没有，数字段的颜色只能连着记号一起改，补 `--xh-timer-item-fg`，缺省取 `inherit`——计时走完时间区整体退一档，数字段照着继承才跟得上。

  **分页省略位补齐悬停与按下。** 它此前已并进可点观感组与聚焦环组，但漏了 `:hover` 与 `:active` 两组：有手型光标、有聚焦环，划过却不换底，指针用户会以为它坏了。两组各加一条，与页码走同一个 `--xh-pagination-item-bg-hover` / `-bg-active`；省略位没有当前页一说，不带页码那条的 `:not([data-current])` 守卫。

- 84d301c: Steps 按设计真源归位选中语义、按压与排版：已完成步退出品牌淡底，改为中性面上一枚品牌色对号（`--xh-steps-indicator-bg-completed` 缺省 `--xh-bg-subtle`、`--xh-steps-indicator-fg-completed` 缺省品牌色，序号空着时由皮肤画对号）；触发器按行级合同补按压反馈，hover `--xh-bg-subtle`（100）、按下新增 `--xh-steps-trigger-bg-pressed` 缺省 `--xh-bg-subtle-hover`（200），只换面不缩放；说明文字走说明角色 13px / `--xh-fg-muted` / `--xh-leading-normal`；指示符图标尺缺省改 `--xh-glyph-size-sm`。私有槽 `--xh-_steps-accent-soft` 与 `--xh-_steps-accent-soft-hover` 撤掉。
- 77a31e6: Steps 重新组织流程轴与状态层级：横向步骤保持单行连续，纵向连接线增加长度，当前、已完成与未开始标记分别使用实心强调、柔和强调与中性表面。皮肤体积增加用于补齐各状态背景、悬停反馈与双向流程轴布局。
- c23154d: 主入口 `.`（与 `./index.css`）改为一份生成的扁平有层文件：Action Control / Field Chrome / Collection Item / Swatch 四份家族配方与共享关键帧在 focus / label / description / pointer 四份公共层之后只内联一次、排在一切组件皮肤之前，各皮肤随后按源序内联并剥掉自带的 `@import '../family/*.css'`；`@layer` 结构原样保留，除令牌那一条外不再有 `@import`。引入顺序的真源改为不发布的 `index.source.css`，`index.unlayered.css` 由同一源序生成，内容不变。

  此前每份皮肤文件头各自 `@import` 家族、主入口再逐个 `@import` 皮肤，不去重 `@import` 的打包器（如 `@tailwindcss/vite` 自带的内联器）会把 Action Control 复制 65 份、Collection Item 69 份，产物翻倍，且有副本排在皮肤之后、反超皮肤对家族的覆盖。现在引用图里家族只有一份，与打包器无关：不去重展开的主入口从 4.9 MB 降到 2.0 MB。

  消费方注意：

  - 只 `import '@xihan-ui/styles'` 的项目无需改动，产物形态变化只在体积与家族出现次数上可见。
  - 单皮肤子路径（`./button.css` 等）仍可独立使用，文件头仍自带家族 `@import`；混用多份单皮肤时每份各带一份家族，不去重 `@import` 的打包器会复制多份，引入的皮肤超过几份时改用主入口。
  - 按需过滤顺序时，以 `index.css` 里 `/* styles/xxx.css */` 段标记的顺序为准。

- 1a83145: Switch 保持实体表单控件，不引入 backdrop 或玻璃轨道。未选中轨道新增不占几何的内边界，选中轨道使用
  实心语气底与配对前景，只读选中态使用中性底和控制边界；暗色下不再依赖浏览器默认 button 前景来决定
  聚焦环。disabled、readonly 与 loading 的根和标签光标分开，loading 不再触发可操作的按压反馈。

  滑块迁入 M1 Soft Surface：实体背景、细边、顶部高光与接触影同源，悬停升到 raised，按住时撤掉高光和
  投影并沿行进轴轻微拉长，释放后回圆；checked 端同步补偿位移，外缘不会越出轨道。RTL 的物理位移反转，
  三尺寸和 compact 密度继续由现有轨道高度推导。减弱动效取消拉伸并保留静止 loading 点线，forced-colors
  用轨道 outline 与滑块真实边框保住双层几何。

  新增轨道覆盖槽 `--xh-switch-border`、`--xh-switch-border-checked`、`--xh-switch-border-checked-readonly`、
  `--xh-switch-fg`、`--xh-switch-fg-checked`、`--xh-switch-fg-checked-readonly`；
  新增滑块覆盖槽 `--xh-switch-thumb-border`、`--xh-switch-thumb-highlight`、`--xh-switch-thumb-fg`、
  `--xh-switch-thumb-shadow-hover`、`--xh-switch-thumb-shadow-pressed`、`--xh-switch-thumb-shadow-disabled` 与
  `--xh-switch-thumb-press-stretch`。既有覆盖槽未删除，因此 Styles 按 minor 记录。

  去注释与空白后的皮肤体积由 5465 增至 9603 字节；增量来自实体轨道边界、M1 滑块表面、四类交互守卫、
  RTL/减弱动效以及 forced-colors 的明确双层几何。

  皮肤体积（去注释、压空白）：前一提交源码 5465 字节，当前 9603 字节；登记基线 5465 → 9603，只更新本组件，10% 容差保持不变。

- 42f7f15: **Table 表体行接入 Collection Item 配方，选中行改品牌淡底；把手按下换底，排序把手与取页钮补按压面。**

  - 表体行投影 `data-xh-collection-item` / `-size` / `-context='page'`（表头 / 脚注行不投影）；行盒几何逐项盖回：flex、零内衬、零圆角、默认光标，吸附列照旧 inherit 行底。悬停 100、按下 200 只换面（此前按下零反馈）；选中行由中性 `--xh-bg-subtle-active` 改为 `--xh-bg-brand-subtle` 行面 + `--xh-fg-on-brand-subtle` 前景，selected + hover 20%、+ pressed 28%；选中行的焦点环回默认环色。斑马纹改写家族的 rest 槽，悬停 / 选中 / 落点仍按原先先后盖过它。公开槽名不变，新增 `--xh-table-row-bg-pressed` / `--xh-table-row-fg-selected` / `--xh-table-row-cursor`。
  - 四颗把手按下在 0.97 缩放之外同时换底：空框与展开箭头落 200 档（`--xh-table-trigger-bg-pressed`），已勾选的品牌实心框落 `--xh-bg-brand-active`（`--xh-table-trigger-bg-checked-pressed`）；勾选方框圆角改 `--xh-shape-inset` 档（与 control 同值，身份归位）。
  - 排序把手补悬停 / 按下面：坐在表头淡底上，hover 200 → pressed 300 只换面（`--xh-table-sort-bg-hover` / `-pressed`）。
  - 取页钮接 Action Control `row` 档 ghost 形态：铺满一行只换面不缩放（此前缩放且不换底）。
  - 拖行「放进这一行里」的落点面由品牌淡底改为 `--xh-bg-subtle-hover`：品牌淡底专属选中。
  - 根上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档。

- 2c5c5ac: **`table` 补出列设置区与工具条两块，`page-header` 补出形态轴与面包屑 / 头像两个位。**

  排序（`sort` / `sortPriority`）、列宽（`resizable` / `setColumnWidth`）、显隐与列序（`COLUMN_PREF.PATCH`）这三样表格内部一直都有，缺的只是把它们摆出来的那两个部件——于是每个用它的应用都自己长一层几百行的设置面板壳。现在两块都在库里：

  - `toolbar` 是搜索、筛选、密度与列设置这些**对整张表下手**的控件的位置。它是 root 的兄弟不是子节点——root 是 grid 系角色，子节点只能是 row 与 rowgroup，所以 Vue 侧另开一个 `toolbar` 插槽（不写就一个节点都不渲），Web Components 侧照旧由作者写在元素里、摆在 root 之外。它不带 `role`：一条控件带要不要 `role=toolbar` 连同那套方向键 roving 归作者，要就往里放一个 Toolbar。
  - `column-list` + `column-visibility-trigger` 是列设置区与它的显隐把手（`role=checkbox`，勾着＝这一列显示着）。渲什么照新增的 `api.columnSettings` 走：作者定义的那些列按偏好排过序，**藏起来的也在其中**——生效列（`api.columns`）把它们滤掉了，而设置区正是把它们放回来的地方。只剩最后一列显示着时那颗把手转 `aria-disabled`：全藏起来的表是一张没有列的网格，而设置区里的把手都长在列上，用户从那里再也点不出一个把手把列放回来。
  - 冻结档补上写入口：`COLUMN_PREF.PATCH` 收 `sticky`，`api.setColumnSticky(columnId, sticky)` 与显隐、列宽、列序并列。此前 `TableColumnPreference.sticky` 只读得出、改不了，只能整份 `setColumnPreference` 换掉。
  - `columnSettings` 与 `setColumnSticky` 两侧都露：Vue 在两个插槽的载荷里，Web Components 上是 `el.columnSettings` 与 `el.setColumnSticky()`。

  `page-header` 这一侧：

  - 新增 `variant`（`plain` / `surface` / `raised`）。不写即不发 `data-variant`，与写 `plain` 长一个样，既有页头逐值不变；`surface` 加底色、圆角与左右内衬，`raised` 再加一层抬起投影。`bordered` 在有面的两档改画整圈描边——一块切了圆角的面底下横一条直线，两头会露在圆角外面。
  - 新增 `breadcrumb`（整行排在标题之上）与 `media`（头像 / 图标位，排在返回位与标题之间）两个部件，都可缺省。此前面包屑只能塞进 `footer`，而那是标题**下方**的位置。
  - `XhPageHeaderTitle` 收 `as`（默认仍是 `div`）：这一块在页面大纲里确实是一级标题时写 `as="h1"`，组件自己照旧不往文档大纲里插标题。

- bf75f85: Tabs 缺省 line 档的页签接入 Collection Item 家族的 `nav` 语境：`getTriggerProps` 在 `variant === 'line'` 时投影 `data-xh-collection-item` / `data-xh-collection-size` / `data-xh-collection-context='nav'`，并对所有变体的选中页签新增 `data-current`（`aria-selected` 与 activation 族 `data-state` 保留）。皮肤把 `--xh-tabs-trigger-*` 公开槽映射到家族桥接槽，悬停与按下由「只换前景」改为白底承载阶梯换面（hover `--xh-bg-subtle` + `--xh-fg-default` → pressed `--xh-bg-subtle-hover`，只换面不缩放），未选中页签字重由 label 500 改为 regular 400，当前页保持透明面 + `--xh-fg-brand-strong` + medium 并叠加 hover / pressed 面；card / segment 档不归族，面与字色规则收进各自形态作用域，取值不变。
- ea1b7db: **标签页 `line` 档不放 `indicator` 部件时，选中标签自带一条静态指示线；横向缺省从此也和纵向一样有线。**

  此前 `line` 档的 2px 指示线只由可选的滑动 `indicator` 部件画：基础用法不放它就只剩品牌字色与字重，纵向示例放了才有线。现在标签带里没有 `indicator` 部件时，选中标签在自己的 `::after` 上画一条静态线：横向贴底、纵向贴行向末端（与部件同一侧，`dir="rtl"` 随逻辑属性镜像），厚度 / 颜色 / 圆角读 `--xh-tabs-indicator-thickness` / `-color` / `-radius` 与部件同一组槽和缺省（`--xh-stroke-thick` / 语气色 / pill），不做动画；放了部件即收起，不会画出两条。拖动换位时当前页作为落点的那几帧让位给落点线。`card` / `segment` 档不受影响，forced-colors 下静态线与部件同取 `Highlight`。

  `tabs.css` 因此从 14233 字节涨到 16211 字节（静态线三条规则、部件在场探测与 forced-colors 一段）。设计真源 §7.3 的「导航当前页」一行随之改写：Tabs 无部件时自画静态线，Anchor / NavigationMenu 无部件时仍只靠字色与字重。

- cd90163: Tabs 的 `line` 变体改用文字与指示条反馈悬停和选中，并新增悬停文字颜色覆盖槽。
- ee85e3b: Tabs 的 `indicator` 部件在 `segment` 变体下成为滑动的白色抬起面：与 Segmented 的滑块同一套（`--xh-bg-surface-raised` 底 + `--xh-border-default` 描边 + `--xh-elevation-raised` 影），切换时整块沿标签带滑到当前标签下；标签带里放了它，选中标签自己透空，没放则面仍长在选中标签身上。连接层改为把选中标签的四个几何量写成私有槽 `--xh-_tabs-indicator-x / -y / -w / -h`（此前只写主轴的内联样式）并在部件上投影 `data-variant`，量的是标签带内衬盒的坐标（扣掉标签带自身的描边）。
- 32142f9: Tabs 的标签带放不下时不再折行：标签整体沿主轴位移露出被裁掉的那截。新增 `prev-trigger` / `next-trigger` 两个可选部件（Vue / React 为 `XhTabsPrevTrigger` / `XhTabsNextTrigger`，Web Components 为 `data-xh-part="prev-trigger|next-trigger"`），放在 `list` 里作两端翻页钮：接 Action Control icon 档 ghost 面，对读屏隐藏、不占 Tab 位，放得下时 `hidden`，挪到头那一侧禁用并收起；不写内容时皮肤画 chevron，盖底缺省取 surface（`segment` 轨道取 subtle），使用者槽 `--xh-tabs-scroll-trigger-bg` / `-fg`、`--xh-tabs-scroll-icon-size`。标签带上横向滚轮（触控板两指横划、Shift + 滚轮）按量位移并拦住页面滚动，竖滚轮放行；触屏手指按在标签带上沿主轴拖即跟手平移（走够激活距离才算平移，拖着时撤掉指下标签的按压面，抬手后紧跟的那次 click 不算点选；放不下时 `list` 写 `touch-action: pan-y pinch-zoom` 让出交叉轴，竖排为 `pan-x`），与换位拖动共用同一个指针会话；选中或聚焦的标签被裁在外面时自动挪进视野；位移在机器里按 continuous 档补间，减弱动效下一步到位。`api.overflow` 报两端各还有没有被裁掉的标签，放得下时为 `null`；新增事件 `SCROLL.PREV` / `SCROLL.NEXT` / `SCROLL.BY`。皮肤侧 `list` 改为 `flex-wrap: nowrap` + `overflow: clip visible`（只裁主轴，不是滚动容器：焦点环、粗指针外扩与 segment 抬起面的影都不被裁），`root` 加 `min-inline-size: 0` 让它在一行弹性 / 网格容器里也缩得下；指示条的几何改按排布几何（`offset*`）量，与位移无关。一致性夹具的标签带两端补上两只翻页钮，钉三端把它们建成同一种节点。tabs.css 涨约 3.7KB，全是翻页钮与位移规则。
- a316462: Tag 新增第四种公开 `ghost` variant，与既有 solid、subtle、outline 组成完整形态轴。默认与 subtle 改用 M1 soft material 的背景、边界、文字和轻阴影；outline 与 ghost 明确清除表面阴影，ghost 保持透明并可读取 tone 前景色。

  关闭钮维持 16px 视觉盒，同时用透明伪元素把实际指针命中扩到 24px，不改变标签行高。共同连接层现在通过 `setOpen(false)` 关闭，静态受控标签已经关闭时不会重复发同值 open-change 意图。

  皮肤按去注释、压空白的统一标准从 5581 增至 6314 字节（+733），增量对应 ghost 形态、M1 材质与关闭命中层；只重登记 Tag 基线，逐组件 10% 容差保持不变。

- 86ce3e7: TagGroup 按页内持久集合归位选中语义：新增 `item-indicator` 部件（Headless `getItemIndicatorProps`，Vue / React `XhTagGroupItemIndicator`，Web Components `data-xh-part="item-indicator"`）作为文字前的选中标记，选中时展示、未选中以 `hidden` 收起，内容留空时由皮肤绘制对号；按 `collection` 铺开的默认结构已包含它，手写部件时需自行加入。皮肤侧选中的标签改为品牌淡底 + 配对前景（`--xh-tag-group-item-bg-selected` / `-selected-hover` / `-selected-pressed` 新增，`--xh-tag-group-item-border-selected` 缺省改透明、`--xh-tag-group-item-fg-selected` 缺省改 `--xh-fg-on-brand-subtle`），实心档保留 currentColor 选中环；悬停改白底承载的 100 档，按下在缩放之外同时换底（`--xh-tag-group-item-bg-pressed`，实心档 `--xh-tag-group-item-bg-pressed-solid`）。皮肤体积增长来自选中三态、按下面、前导对号与高对比补救块。
- fa08fb4: **新增** `tag-group` 组件（标签组）：Vue 与 Web Components 两侧同时可用。

  它补的是标记族最大的一个缺口：一排可摘标签，此前只能逐枚写 `tag`，而每枚标签的关闭钮
  各占一个 Tab 停靠点——十枚标签就是十个停靠点；`tag` 的文档又明令禁止把标签整块当按钮用，
  却不给替代件。标签组把这一排收成**一个** Tab 停靠点：组内走方向键（roving tabindex），
  摘除走 `Delete` / `Backspace`，每枚标签的 `item-delete-trigger` 一律 `tabindex="-1"`。

  承诺的行为：

  - **焦点有去处**。摘掉一枚之后焦点交给前一枚——摘完之后它在文档里的位置原样不动、节点必然还在；
    前面没有就交给后一枚，一枚不剩就交给列表容器（它恒在，且此刻会重新认领 Tab 停靠点）。
    鼠标点摘除钮同样按这条走，焦点不会掉回页面开头。
  - **条目的去留归宿主**。`item-delete` 只报「用户要摘这一枚」，组件顺手把它从选中集合里去掉，
    节点由宿主改自己的数据摘掉——撤销、二次确认、服务端失败回滚都只有宿主知道。
  - **选中是另一条独立线**。`selectionMode` 取 `none`（默认）/ `single` / `multiple`；
    方向键只搬焦点，落值要按 `Enter` / `Space`，`Ctrl`/`Cmd` + `A` 全选。
    不接选中时不发 `aria-selected`——一排纯标记标签报「未选中」是句假话。

  解剖比单枚 `tag` 多一层 `cell`：摘除钮是可聚焦的按钮，而可聚焦的东西不许待在 `option`
  这类控件角色里（axe 的 `nested-interactive` 会判 serious），`gridcell` 允许，所以
  `list` 发 `role="grid"`、每枚标签发 `role="row"`、标签里那一格发 `role="gridcell"`。
  用 `collection` 时这一层由组件自己铺开，手写部件才需要写它。

  实现细节，不是承诺：这三个角色的具体取值；连打检索的取字处是 `item-text`。

  每一枚标签的观感与 `tag` 同源：形态 · 语气 · 尺寸三轴写在组上，由连接层打到每一枚标签身上。

- 6922cce: **Tag 关闭钮接入按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 机器 context
  新增 `pressed`（`TagPressedPart`：`root` / `close-trigger`，类型进公开面），根级事件 `PRESS.START { part }` / `PRESS.END { part }`；守卫 `canPress` 在禁用、只读时不进，关闭钮还要 `closable`，按住途中转入禁用 / 只读、收回关闭钮或标签收起时由机器
  自行松开。root 同一条通道只在触屏按下时进来，供把标签当条目用的宿主投影。`connectStaticTag` 新增可选的第四个入参 `press`
  （`TagPressPort`）：宿主替静态标签供给按压通道，未提供时两个部件都不接按压，既有调用不受影响。皮肤关闭钮的按压面改为
  `:is(:active, [data-pressed])`；键盘表新增 `tag.kbd.press`。三端公开 props 与事件不变。
- 9a798f6: **标签三档整体放大一级，同档标签有没有关闭钮都一样高。**

  从前三档的高全靠「一行字 + 上下内衬」，字号又只有 12 / 12 / 13 三档，缺省档带关闭钮量出来只有 22px、不带 18px，与相邻控件摆在一行里像缩了一号；现在三档各上一级：字号走 caption / secondary / body（12 / 13 / 14），行框取指示符档（sm / md 取 `--xh-control-indicator-md`、lg 取 `--xh-control-indicator-lg`）；关闭钮仍按库里「标签内移除钮以 `--xh-control-indicator-size` 为基准」的契约走，三档都是 16px。

  实测（comfortable 密度，含 1px 描边）：

  | 档  | 高 · 改前（无关闭钮 / 带关闭钮） | 高 · 改后 | 字号    | 上下内衬 | 左右内衬 | 关闭钮  |
  | --- | -------------------------------- | --------- | ------- | -------- | -------- | ------- |
  | sm  | 14 / 18                          | **22**    | 12 → 12 | 0 → 2    | 6        | 16 → 16 |
  | md  | 18 / 22                          | **26**    | 12 → 13 | 2 → 4    | 8        | 16 → 16 |
  | lg  | 23 / 26                          | **30**    | 13 → 14 | 4 → 4    | 12       | 16 → 16 |

  三档台阶一样宽（4px）；md 档 26px 放进 `--xh-control-h-md`（32px）的控件里不撑高；compact 密度下指示符档收一号，三档相应是 20 / 24 / 28，挂在子树上的局部 compact 也是这个数——为此令牌层的 compact 块补声明了一次别名 `--xh-control-indicator-size`：别名在 `:root` 上解析成像素后按计算值继承，子树上的 compact 原本收不动它，`select` / `tags-input` / `tag-group` 的删除钮同样受益。参照：Ant Design 默认 22 / 12px，Naive UI 22 / 28 / 34，Element Plus 20 / 24 / 32——md 落在 Naive medium 与 Element default 之间。

  带来的变化：同一排里有没有关闭钮的标签从此齐平（从前带钮的高 4px）；行框由 `line-height: 1` 改成「一行字与指示符档取大者」——作者把 `--xh-tag-font-size` 调得比行框还大时行框跟着字走，`label` 的截断不会剪掉字的上下沿；`--xh-tag-close-size` 仍只管关闭钮的边长。文档站的尺寸示例改成每档并排一枚无钮、一枚带钮。

  `tag-group` / `tags-input` / `select` 里各自画的标签没有套 `tag`，这一批不跟着动。

- 134dea9: 时间输入和时间选择器改用轻量分段焦点、弱化分隔符与更清晰的错误态；时间选择器以轻强调面表示选中项，展开空值时将焦点直接落到第一项。
- 0460036: **新增** `time-range-picker` 组件（时间范围选择器）：起止两组可键入的分段时间框、`range-separator`、触发器与浮层里并排的两组时列组合成一个字段；`time-picker` 本身不承接区间，这一路是净新增。

  - 值恒为区间两端 `[start, end]`，按位存放，空缺的一端用空串占位（只填了终点是 `['', end]`），受控回写按同一份下标认领；`api.start` / `api.end` 直接取两端，终点早于起点时 `api.reversed` 为真并把整个字段标为不合法。
  - `name` 与 `endName` 各自决定两份 `hidden-input` 参不参与提交；`segment-group` 带 `data-index`（0 起点、1 终点），方向键换段不跨组，两组各报「开始时间」「结束时间」（`translations.startTime` / `endTime`）。
  - 浮层里是 `column-group` × 2（各带 `column-group-label`），每组按 `granularity` / `hourCycle` / `step` 铺时、分、秒（与上下午）列；`min` / `max` 裁掉两组共同的界外值，另一端一填全再各自收窄一次（终点的下界是起点，起点的上界是终点）；`isTimeUnavailable(value, unit, index)` 多收一个端号，逐格判定；方向键在一组内换列、跨到另一组继续。
  - `presets` 只收区间，值用 `start/end` 写法：`timeRangePickerPresetValue` 拼两端，`timeRangePickerPresetTimes` 拆回，`timeRangePickerPresetFromNow(minutes)` 算「接下来 N 分钟」；不是恰好两端、越界或倒序的快捷项直接置灰。
  - Vue `XhTimeRangePicker*` 与 `useTimeRangePicker`；React 同名组件与 hook；自定义元素 `<xh-time-range-picker>`（`value` / `default-value` 是数组，只走 property；`columnGroups` 只读属性给出两组该铺的列与格）；皮肤 `@xihan-ui/styles/time-range-picker.css`，覆盖槽前缀 `--xh-time-range-picker-*`。

- c9c123a: **`timeline` 的横排按视口宽度堆叠；`steps` 只折行、不翻朝向。**

  两件都是「横排折竖排」，但机器那一侧的处境不同，做法因此分开。

  `timeline` 自身不可聚焦、不接管按键（键盘表是空的），皮肤翻朝向不会与任何机器状态脱钩。窄档一条一行、圆点与连线回到条目左侧，`@media (min-width: 768px)` 里才转回并排。基准档是堆叠：手机档停在这里，事件仍逐条读得完。根的 `flex-direction` 两档都是 `row`，换的是每条的 flex 基准——横排根写 `row` + `wrap`，窄档每条 `flex: 0 0 100%`。窄档另给坐标（`label`）补了一条轨道：不补的话它会自动落进圆点那一列、把列撑宽，圆点与连线因此错开半格。宽档的摆法逐值未变（1280 下每条 320、连线 294×2、根高 50.5，与改前一致）。

  `steps` **没有**做形态换档，登记表里那一条整条删掉了。它的键盘轴跟着 `orientation` 走——`navIntentFromKey(event, { axis: orientation })` 决定方向键收哪两个键，`aria-orientation` 也照它报。皮肤把横排翻成竖排会得到「视觉竖排、左右键上下走、读屏念横排」，视觉与键盘对不上。要做这件事得从机器面出：或者让 `orientation` 有一个随断点换的档、连 `data-orientation` 与导航轴一起换，或者由作者按断点显式给朝向。皮肤单方面翻不了。

  `steps` 改在第一层，两个朝向一起裁：

  - 横排的列表接 `flex-wrap: wrap`，每一步补一条折行下限 `min(--xh-layout-col-min-xs, 100%)`。一行摆不下几步时它们折到下一行，各自拿回够写标题的宽度；375 下标题盒从 36px 回到 96px（内容需 84px，此前被省略号切掉）。宽处的分配逐值未变——`flex` 简写里的基准值仍是 `0`，各步等分整行，这条下限够不着（768 下仍是 308 / 308 / 136）。
  - 竖排的根接 `flex-wrap: wrap`，面板补一条换行基准 `--xh-measure-prose`。步骤列与面板一起放不下时面板换到下一行，步骤列拿回整行：375 下标题盒从 46px 回到 96px。宽处仍并排（768 / 1024 / 1280 三档均是）。
  - 顺带修一处与断点无关的溢出：末步 `flex: none` 按内容宽摆、不参与伸缩，标题长过整行时会把列表顶出容器（320 下溢出 12px）。补 `max-inline-size: 100%` 收住，超出的部分走省略号。

  `timeline` 那条不可断长串的横向溢出（订单号那种）第一批已经修掉，这一批复量确认：撤掉 `overflow-wrap: anywhere` 后 375 下整条轴溢出 60px，装回即为 0。

  `timeline.css` 的体积基线从 11794 涨到 13547（+14.9%），涨在多出来的那一整档横排宽档规则上；`steps.css` 从 8823 涨到 9277（+5.1%）。

- d51d182: **轻提示的严重度补上字形通道，字形改由皮肤画。**

  `toast` 的 root 一直在发 `data-severity`，而皮肤一条规则都不读它：严重度只剩淡底与描边这一条色相通道，色觉障碍用户与黑白打印下「已保存」与「保存失败」长得一模一样。同一台机器出来的 `notification` 有整套字形指示符。

  皮肤现在按 `data-severity` 在条子行首各画一枚字形，取的是 `notification` 那套 `--xh-glyph-mark-*` 令牌，两家从此同一副读法：`info` 圆圈问号、`success` 勾、`warning` 三角、`error` 叉、`loading` 转圈箭头。轻提示的解剖到 root 为止、没有第二个节点可挂，字形因此画在 root 的伪元素上，与 `checkbox-group` 全选格同一种写法。颜色走语气层派生的前景档，新增使用者覆盖槽 `--xh-toast-icon-fg`；尺寸沿用已有的 `--xh-toast-icon-size`。

  减弱动效与打印下 `loading` 那一档停转。

  **破坏性（`@xihan-ui/vue`）：`createToastService` 的默认模板不再渲染那枚字形节点。** 此前字形只在这一条路径上存在——声明式的 `<XhToastRoot>` 与 `<xh-toast>` 元素上一枚都没有。现在三条路径都由皮肤统一画，模板里那个 `<span>` 随之删除。

  影响面：按 `[data-scope="toast"][data-part="root"] > span:first-child` 这类结构选择器给字形写过样式的，选不中了——改成写 `--xh-toast-icon-fg` / `--xh-toast-icon-size`，或按 `[data-scope="toast"][data-part="root"]::before` 覆盖。另外，条子里子节点的序号整体前移一位。

- 9ad1389: **Toggle 接入 Action Control 形态矩阵，按下态前景改淡底前景。** 连接层的 root 新增稳定属性
  `data-xh-action-variant`，由 `variant` × 开关态派生：`solid` 未按下投 `ghost`（透明底，白底承载 hover
  100 → pressed 200）、按下才投 `solid`（品牌实心）；其余三档原样投影；`data-variant` 不传时显式落
  `subtle`（缺省中性淡底，真源 §7.2 第 2 条）。皮肤删除缺省与四档形态自写的未按下面、深色 solid 覆盖，
  颜色由家族矩阵给出，公开槽 `--xh-toggle-bg / -bg-hover / -bg-active / -fg / -border / -bg-disabled / -fg-disabled / -border-disabled` 改为桥接到矩阵之前；按下（on）面按 §7.3 无滑块开关：品牌淡底 12 →
  悬停 20 → 按压 28，前景由 `--xh-fg-brand` 改为 `--xh-fg-on-brand-subtle`（视觉默认变化），outline 按下
  后描边仍是 `--xh-border-control`；只有 `solid` 按下后的实心面才灌 currentColor 环。family-backlog 删
  selection 段 `toggle:root`，快照重录、CEILING selection 1 → 0；check-family-parity 的按钮形触发器族改比
  基础规则里的 `--xh-action-bg-hover / -pressed` 桥接声明。
  四档按下且禁用仍掺一半中性面保留选中信息（`solid` 取实心面掺 `--xh-bg-subtle`，前景留配对前景），不随
  矩阵 disabled 列退成中性面。
- 2c5c5ac: **语气轴出 11 支公开令牌 `--xh-tone-*`，使用者的节点也能接语气。**

  此前语气层只声明私有槽 `--xh-_tone*`：库里的组件消费得到，使用者在自己的节点上接不到——`grep -o "--xh-tone-[a-z0-9-]*" packages/` 零命中，想让一块自定义卡片跟着 `danger` 走，只能把颜色写成裸值，六族语气、深浅两态、换过品牌色之后的取值一处都不跟。

  现在写了 `data-tone` 的节点上多出这一族，一支对一支指向同名私有槽，取值恒等：

  | 令牌                                                                      | 是什么                         |
  | ------------------------------------------------------------------------- | ------------------------------ |
  | `--xh-tone-solid` · `--xh-tone-solid-hover` · `--xh-tone-solid-active`    | 实心底与它的两个交互态         |
  | `--xh-tone-on`                                                            | 实心底上的前景色               |
  | `--xh-tone-subtle` · `--xh-tone-subtle-hover` · `--xh-tone-subtle-active` | 淡底与它的两个交互态           |
  | `--xh-tone-fg`                                                            | 普通背景上表达该语气的文字色   |
  | `--xh-tone-border` · `--xh-tone-border-control` · `--xh-tone-soft`        | 描边、可操作区边界、装饰性强调 |

  `--xh-_tone-shift` 是兑色的方向、不是一档能直接用的颜色，不出公开令牌。

  选择器仍是 `[data-tone]`，没有新开属性；私有槽与各族的推导一条没动，既有渲染逐像素不变。这一族只在写了 `data-tone` 的节点及其后代里有取值。`tone.css` 因这 11 条声明从 3297 涨到 3799 字节（去注释压空白后），逐皮肤体积基线随之更新。

  新增门禁 `check-tone-tokens`：公开令牌必须声明在语气层的 `[data-tone]` 或 `:root` 上（落在某个组件皮肤里等于没出这支令牌），取值必须恰好是对应私有槽，且私有槽与公开令牌两侧的名册对齐——新加一支语气私有槽而不出公开令牌会被拦下。

- 358f06e: **修复** `tool-call` 的指示符空盒。它的 `indicator` 是开合箭头，皮肤此前只写了转向与颜色，作者不往里塞图形时渲出来的是一个什么都不画的空盒——同族的 `reasoning` 早就有兜底字形，两家从此同一副写法：`:empty::before` 用 `--xh-glyph-mark-chevron-right` 画一枚，作者塞了自己的图形这条规则即不命中。同批按 18.10.1 的行式约定补 RTL 分流（收起朝行首、展开转向下方），并在 `root` 上声明 `--xh-icon-size`（新增覆盖槽 `--xh-tool-call-icon-size`），作者塞进来的 `XhIcon` 与兜底盒从此同一把尺。

  **收敛**聚焦环内收档的最后两处写法。`password-input` 的 visibility-trigger 与 `time-picker` 的 item 各自另画一条环，偏移写的是 `calc(-1 * var(--xh-ring-offset))`，与全库其余各处的 `calc(-1 * var(--xh-ring-width))` 是两支同值令牌的两种写法。两支当前都是 2px，**渲染结果逐像素不变**；收敛掉是为了「把环调粗一档」这类全局调整不会只走一半。

- 252e2d5: **新增** `tool-call` 与 `reasoning` 两个组件：Agent 界面里的「它正在做什么」与「它是怎么想的」，Vue 与 Web Components 两侧同时可用。两者共用同一台机器，但解剖、皮肤与文案各一份——正文形态不同，工具调用的参数与结果是等宽结构块，思考过程是散文。

  **自动开合的锁存靠转移的放置位置，不靠一个布尔位。** 跑起来自动展开、结束自动收起；用户手动开合过一次之后，阶段变化在结构上就够不着任何转移，自动开合永久停用。挂载那一刻已经在跑的调用会**直接展开**——工具块往往是带着「正在跑」被建出来的，等状态「翻真」是等不到的。

  `tool-call` 有五档阶段，比 AI 协议里的工具状态多出 `awaiting-approval` 一档：协议层的审批只改审批状态、不改工具状态，没有这一档的话「在等人批准」会被当成「在跑」。审批闸门是 `approval` 部件，**常驻在开关与详情之间**，不会被折叠藏起来。

  `reasoning` 的「想了多久」由起止两个时刻算出来，**任一缺席即算不出来**——流被中止时兜底收尾不写结束时刻，推理块会只有起点没有终点。名字与时长都排在开关里，「思考过程，用时 12 秒」整句自然构成开关的可访问名，不再另发 `aria-label`。

  两者收起都走 `hidden` + `inert`：退场动画播完之前内容还在渲染，`inert` 把这段窗口挡在读屏与 Tab 序之外。卡片自己都不开活区——一屏若干张各开一个会互相打断；播报文本由 `statusText` 交出去，由宿主写进会话级的那一个播报区。

  另导出两个纯函数：`isToolCallRunning(phase)` 与 `toneOfToolCallPhase(phase)`，后者给徽章之类的纯样式联动用。

- a435fad: Toolbar 分组改用连续的中性操作段，悬停与选中只改变当前分段；组内以半高低对比线分隔并开放透明度覆盖槽，附着式工具面调整为无描边胶囊表面。皮肤体积增加用于补齐横向、纵向连接规则与各分段状态。
- 33959f6: **Tooltip 迁入高遮蔽的紧凑反白 M2 表面。**

  默认反白与 `tone` 语义继续保留：Tooltip 是一句非交互说明，应与普通主题色的 Popover 操作面明确区分。surface 现在把 `_tone` 或默认前景色以 94% 高遮蔽 tint 合成，正文仍使用完全不透明的 `_tone-on` 或主题表面色。94% 是六种 tone 在纯黑、纯白、灰色和品牌色最坏底色上都达到 4.5:1 的首个安全整档；88% 与 92% 分别仍有最低 4.18 和 4.42 的失败组合。

  紧凑光学层只消费 `--xh-material-frosted-compact-alpha/backdrop/shadow`，组件不直接挑 alpha、blur 或投影原语；6px control radius 保持小表面比例。新增 `--xh-tooltip-border`、`--xh-tooltip-highlight` 与 `--xh-tooltip-backdrop` 覆写口。箭头读取与内容相同的 surface 和 border，不重复执行 backdrop blur。高对比与减少透明模式由 compact 配方原位切成同色实体并关闭 blur，高对比同时撤掉装饰顶光，forced-colors 使用 Canvas/CanvasText，打印继续隐藏整个定位层。

  进退场移除 zoom，改为共享 `xh-overlay-slide-in/out` 的 opacity + placement translate；positioner 先清零四个方向变量再启用实际一侧，阻断嵌套浮层继承。进出都使用现有 fast 120ms 时长，`will-change` 只登记 opacity 与 translate。共享 motion distance 当前最小为 4px；规格建议的 2px 留待公共 distance-xs 原语独立提交后统一接入，本次不局部覆盖全局语义令牌。

  长单句在共享最大宽度内使用 pretty wrapping，连续长词可断行。Tooltip 仍不承载按钮、链接或关闭控件；TooltipProvider、skip-delay、同组互斥与触发器滚动关闭没有在本次视觉提交中伪造。

  皮肤体积（去注释、压空白）从 3873 增至 5673 字节；增量为材质、稳定列布局与状态反馈，仅登记本组件，10% 容差保持不变。

- bdf09b8: **Tooltip 入场改走 enter 档，顶部高光缺省不画。** 展开动画 `xh-overlay-slide-in` 的时长由借用的
  `--xh-motion-duration-exit`（120ms）改为 `--xh-motion-duration-enter`（200ms），与其他锚定列表浮层同一
  节奏，退场不变；内描边式顶光的缺省由 on 色 24% 拼色改为透明（§8.1 不用顶部高光），公开槽
  `--xh-tooltip-highlight` 保留、要加自行灌色；私有槽 `--xh-_tooltip-highlight` 删除。反白身份保留：
  描边仍取 on 色 20% 拼色（真源 §8.4 已登记为反白 compact frosted 的刻意例外）。
- d642ddd: **Tour 气泡改 M4 sheet 三件套，末行三颗按钮与关闭按钮接入 Action Control 与按压通道。** 连接层的
  prev-trigger / next-trigger / skip-trigger 新增稳定属性 `data-xh-action-control` / `data-xh-action-profile="text"` /
  `data-xh-action-display="always"` / `data-xh-action-size="sm"`，variant 分别为 `outline` / `solid` / `ghost`
  （下一步是整条引导的主线动作，显式品牌实心）；close-trigger 新增 `data-xh-action-profile="icon"` /
  `data-xh-action-size="sm"` / `data-xh-action-variant="ghost"`；首步的 prev-trigger 在原生 `disabled` 之外同步投影
  `data-disabled`。Space / Enter 与触屏按住期间该按钮投影 `data-pressed`（记在机器 `context.pressed`，新增事件
  `PRESS.START` / `PRESS.END`，导出类型 `TourPressedPart`，气泡收起时一并松开；首步禁用的上一步不进按压面），
  键盘表新增 `tour.kbd.press`。

  视觉默认变化：content 与 arrow 由 `--xh-border-default` 描边 + `--xh-bg-surface` 底 + `--xh-elevation-sheet` 影，改为
  `--xh-material-elevated-border` / `-bg` / `-shadow` 三件套（`--xh-tour-border / -bg / -shadow / -fg` 缺省随之改为 elevated
  令牌，与 Dialog 同源）。next-trigger 删除自写的品牌实心 + 顶光 + 只缩放的按压，改由配方 solid 列给出（悬停 `--xh-bg-brand-hover`
  → 按下 `--xh-bg-brand-active` 并 0.97 缩放），`--xh-tour-next-shadow` 缺省由顶光改为 `none`；prev-trigger 改由配方 outline
  列给出（静息透明底 + `--xh-border-control` 描边，悬停 `--xh-bg-subtle` 100 → 按下 `--xh-bg-subtle-hover` 200，禁用
  `--xh-border-subtle` + `--xh-fg-disabled`）；skip-trigger 改由配方 ghost 列给出（静息字色由 `--xh-fg-muted` 改为
  `--xh-fg-default`，悬停 100 → 按下 200）；三颗的行内内衬缺省由 `--xh-control-px-md` 改为 sm 档 `--xh-control-px-sm`，字号改
  `--xh-control-font-sm`。close-trigger 删除自写的悬停 200 / 按下 300 与粗指针 `::after`，改由配方 ghost 列给出（悬停 100 →
  按下 200，命中区由家族外扩到 44px）。progress-dot 基础圆角由 `--xh-shape-pill` 改为 `--xh-shape-circle`，当前那颗单独取
  `--xh-shape-pill`（观感不变）。description 字号由 `--xh-text-body-size` 14 改为 `--xh-text-secondary-size` 13、行高改
  `--xh-leading-normal`，并新增 `overscroll-behavior: contain`。root / content 的 `--xh-icon-size` 缺省由 `--xh-glyph-size-text`
  改为 `--xh-glyph-size-md`，四颗按钮内随档取 16px。

  公开槽 `--xh-tour-next-bg / -bg-hover / -fg / -shadow`、`--xh-tour-action-radius`、`--xh-tour-skip-trigger-px`、
  `--xh-tour-close-size / -radius / -fg / -fg-hover / -bg-hover / -bg-active` 改为桥接到配方之前，使用者槽仍优先于形态矩阵。

- 00d9c58: Tour 在每次目标量测时同步目标节点的实际圆角，高亮框会在直角、圆角与胶囊目标之间连续过渡。
- 46a5116: **Transfer 接入 Collection Item 与 Action Control 配方，勾选行改品牌淡底，搬运钮改中性描边，两侧列表接自绘条。**

  - 条目投影 `data-xh-collection-item` / `-size` / `-context='page'`，文字落 `text` 槽、勾选方框是前导标记（`prefix`）；悬停 100、按下 200 只换面（此前按下零反馈），勾中的行铺 `--xh-bg-brand-subtle` 行面 + `--xh-fg-on-brand-subtle` 前景（此前行不染色），selected + hover 20%、+ pressed 28%。新增 `--xh-transfer-item-bg-pressed` / `--xh-transfer-item-bg-selected` / `--xh-transfer-item-fg-selected`。
  - 两颗搬运钮接 Action Control `icon` 档 outline 形态：中性描边、透明底，hover 100 → pressed 200 并 0.97 缩放（此前淡底 + 悬停 raised 抬升 + 200 / 300 阶梯）；`--xh-transfer-trigger-shadow-hover` / `-active` 缺省改 none。
  - 全选把手补悬停 / 按下面（`--xh-transfer-select-all-bg-hover` / `-pressed`），圆角改 `--xh-shape-inset` 档（与 control 同值）。
  - 面板标题字重由 500 改为 `--xh-font-weight-semibold`（Surface 内标题档）；根上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md` 并随 `size` 换档，勾选格里的勾按边长比例取尺。
  - 三端把两侧 `list` 接上自绘滚动条（真源 §6.6 定高小列表）：条子挂在 `root` 上、贴层锚定、紧跟在各自列表后面、两轴都摆、走 6px 缺省档；Vue 的 `XhTransferList` 与 React 的同名组件根节点从此是片段（列表 + 条子），直通属性仍落在列表节点上。

- 8ea0ff8: **Tree 接入 Collection Item 配方，页内选中改品牌淡底行面 + 前导标记，行补按下面。**

  - 叶子（`item`）与分支行（`branch-control`）投影 `data-xh-collection-item` / `-size='md'` / `-context='page'`，文字、对号、箭头、勾选把手与拖拽把手各带 `data-xh-collection-slot`；行布局保持 flex（一行可并排多个前导部件与作者内容），间距仍由行的 gap 给。
  - 选中行由「品牌深字 + 中字重」改为 `--xh-bg-brand-subtle` 行面 + `--xh-fg-on-brand-subtle` 前景、字重不变，叶子的对号（或勾选档的前导方框）是唯一标记；selected + hover 20%、+ pressed 28%；悬停 100、按下 200 只换面（此前按下零反馈）。分支行的选中面与禁用守卫按连接层同步的 `data-selected` / `data-disabled` 命中。公开槽名不变，`--xh-tree-row-fg-selected` 缺省改 `--xh-fg-on-brand-subtle`、`--xh-tree-row-selected-font-weight` 缺省改 regular；新增 `--xh-tree-row-bg-pressed` / `--xh-tree-row-bg-selected` / `--xh-tree-item-check-fg`。
  - 拖放「放进节点里」的落点面由品牌淡底改为 `--xh-bg-subtle-hover`：品牌淡底专属选中。
  - 根上 `--xh-icon-size` 缺省由随文字形改为 `--xh-glyph-size-md`；箭头 / 对号盒与叶子占位随家族字形尺，勾选方框里的勾按边长比例取尺。
  - 容器形态由 root 的 `data-variant` 向 `tree` 下发描边与底（删私有槽 `--xh-_tree-border` / `--xh-_tree-bg`），outline 面与 List / Descriptions 同源；外观逐值不变。

- fa08fb4: **排版与文字效果族补齐八项能力：富文本排版真源、两条轴、两处语气、行数槽、受控暂停、图标八档直径与旋转翻转。全部是加法，既有写法一行不动。**

  `typography` 多了一个 `prose` 部件——这是库里第一份富文本排版真源。`@xihan-ui/markdown` 与 `markdown-stream` 产出的整段 HTML 套进它就有排版：标题六档字号与 `heading` 部件同源、段与段之间只留一份间距、列表缩进、行内代码与 `text` 的 `code` 形态同源、代码块自己成一片面并横向滚动、引用带起始描边、图片不撑宽容器、表格行线到底。标签选择器一律包在 `:where()` 里，块内嵌 XiHan 组件时那份皮肤仍然赢。两个适配器分别是 `XhTypographyProse` 与 `data-xh-part="prose"`。

  `typography` 同批补 `align`（start / center / end / justify）与 `weight`（regular / medium / semibold / bold）两条轴，落在 `root` 上整块一起换；`weight` 也能只写在一段行内文字上，排在形态之后——与 `variant="strong"` 同写时粗到哪一档由它说了算。

  `highlight` 补 `tone`，落在 `root` 而不是 `mark` 上：一段里的命中片段有好几个，用哪族颜色是整段的属性。`mark` 的字重同批开出 `--xh-highlight-mark-font-weight`。

  `gradient-text` 补 `tone`：两端取该族主色与它压深一档的取值，深浅两态自动跟随；排在 `from` / `to` 之后，作者写了两端颜色即以作者为准。

  `truncate` 的行数开出 `--xh-truncate-lines`，排在连接层写的内联私有槽前面——在外层写一句即可整片改档。

  `marquee` 补受控暂停 `paused` → `data-paused`，排在悬停两条之后：作者说了停就停，指针离开也不会把它带回去走。`speed` 的口径同批在文档里说清——它按 `--xh-marquee-span` 换算成一圈时长，要逐字对上每秒像素数就把这支槽改到内容的真实长度。

  `icon` 的 `size` 从三档放宽到八档 `IconSize`（`text` / `sm` / `md` / `lg` / `xl` / `2xl` / `3xl` / `4xl`，逐档对应 `--xh-glyph-size-*`，`text` 跟着相邻文字的字号走），缺省仍是 `md`；同批补 `rotate`（90 / 180 / 270 三档，其余值不写出）与 `flip`（horizontal / vertical / both），两者是独立属性可以叠加。翻转的 `scale: -1` 登记进 `check-motion-amplitude` 的 `STATIC_GEOMETRY`：翻转是几何不是幅度，减弱动效档压成 1 等于把翻转撤掉。

- 54170dc: Clipboard 与 DownloadTrigger 的默认工具触发器改为只切换表面的稳定反馈，不再使用按压缩放；独立复制按钮采用无描边中性面，复制成功仅替换内容与前景色，不再改变轮廓。
- 30bc6ac: **`descriptions` / `diff-view` / `transfer` / `timeline` 四个组件的换档轴从容器宽度换成视口断点。**

  四个根上的 `container-type: inline-size`、`container-name` 与那三行行内轴填充
  （`-moz-available` / `-webkit-fill-available` / `stretch`）全部删掉，`@container` 改成 `@media`。
  分档语义逐条照旧，只是门槛从"这块盒有多宽"换成"视口有多宽"：

  | 组件           | 基准档（不写查询）         | 恢复宽档                                                                    |
  | -------------- | -------------------------- | --------------------------------------------------------------------------- |
  | `descriptions` | 收成一列，标签一律上置     | `≥768px` 最多两格一行、标签回到左边；`≥1024px` 按作者写的 `data-columns` 摆 |
  | `diff-view`    | `split` 的一行拆成上下两段 | `≥1024px` 回到并排                                                          |
  | `transfer`     | 两块面板上下堆叠           | `≥640px` 回到三栏并排                                                       |
  | `timeline`     | 横排一条一行               | `≥768px` 回到并排                                                           |

  **为什么换轴**：`container-type: inline-size` 让盒不再由内容撑宽。祖先链上只要有一层是收缩包裹的
  （没写 `flex-basis` 的 flex 项、`inline-block`、浮动），宽度就塌。此前给根补的行内轴填充只填得动
  直接父级，填不动一条本身就在收缩的祖先链——文档站的示例台正是这一种：示例台 `.xh-demo__stage` 是
  `display: flex; flex-wrap: wrap`，示例组件外面还有一层无类名的包裹 div，两层都是收缩包裹的 flex 项。
  1600 视口下示例台量到 927px，包裹层与根都只有 **520px**，于是 520 < 640 恒判窄档，
  穿梭框在大屏上一直竖排。组件被放进什么样的祖先链，库看不见也管不了，容器查询因此在这个库里落不了地。
  换成视口断点没有塌宽这一档。

  连带：

  - `container-scope-registry.json` 的四条全删，表现在是空的。`check-container-scope` 保留，它现在守的是
    「谁都不许再写 `container-type`」——皮肤里凡出现一处就没有对应登记，立刻判红。
  - `docs/guide/styling.md` 那一整节「有几个组件的根是查询容器」（含塌宽说明与避开写法）删掉，
    `check-doc-numbers` 里对应的那条登记与「查询容器根数」真值函数一并删掉。
  - 浏览器态用例：塌宽边界那份整份删掉（换轴之后没有对象可测）；四个组件的分档判据改用 iframe 量
    （宿主视口固定改不动，媒体查询只能按 iframe 自己的视口求值），并新增一份把三档形态逐个钉住的用例。

### Patch Changes

- b0ddd4d: Action Control 家族在 `(pointer: coarse)` 下扩热区的 `::after`，以及 DownloadTrigger / Sortable 皮肤复制到 `::before` 的同一套几何，rtl 下热区中心不再偏出宿主一个盒宽。起点 `inset-inline-start: 50%` 是逻辑属性、`translate: -50%` 是物理通道：rtl 下起点落在右半边、再往左挪半个盒，按钮 / 勾选框 / 开关 / 下载钮 / 排序把手本体在触屏上完全摸不着。现在 `:dir(rtl)` 下行内分量掉头（`translate: 50% -50%`），皮肤把平移钉回 `translate: none` 的字形规则特指度更高，不受影响。
- 2f517eb: Action Control 家族在 `(pointer: coarse)` 下扩热区的两条 `::after` 规则改由 `:where()` 包住，特指度从 (0,2,1) 降到 (0,0,1)。皮肤对同一伪元素的覆盖（Table 排序把手、Rating 星、RadioGroup 条目这些拿 `::after` 画字形的部件把热区钉回原位）从此只靠特指度就赢，不再依赖源序：消费方产物里家族被重复内联、副本排在皮肤之后时，手机上表头排序箭头不再被撑成整格。
- a3cd1ad: 修复 Action Control Family Recipe 会省略默认值相同状态声明的问题；hover、focus-visible、disabled、loading 等状态现在始终保留各自的 `--xh-action-*` 覆盖槽。
- 317b582: **新增**入场缓动令牌 `--xh-motion-ease-enter-strong`（原语 `--xh-ease-out-strong` = `cubic-bezier(0.23, 1, 0.32, 1)`）。位移与高度变化走这一条：起步快、收尾长，比 `--xh-motion-ease-enter` 看得清。JS 侧同值常量 `easing.outStrong` 一并加上，两边由门禁对账。

  **新增**正文行高令牌 `--xh-text-prose-leading`（原语 `--xh-leading-relaxed` = 1.625）。成段正文此前与控件文字共用 1.5 一个值。

  **新增**兜底字形令牌 `--xh-glyph-mark-arrow-up`。此前只能借语义不对的 `--xh-glyph-mark-sort-asc`。

  **修复** `code-view` 的行号被染成语法数字色。`--xh-code-view-number-fg` 一个名字被行号与数字记号两处消费，根上给它赋了语法色之后行号跟着变色。语法记号改用 `--xh-code-view-number-token-fg`，行号那个名字的语义不变。

  **修复** `prompt-input` 发送按钮禁用态的字底对比度（浅色 1.96:1、深色 2.08:1）。禁用时底色仍是品牌色而只把字变灰，现在底色一并降到 `--xh-bg-muted`。

  **修复** AI 族八处按下缩放是硬切。`approval` / `code-view` / `diff-view` / `message-feed` / `prompt-input` / `reasoning` / `tool-call` 的可点部件此前只声明了 `:active` 的缩放量、没有把 `scale` 写进 `transition`，按下与松手都不过渡；同批补齐悬停与描边的过渡。

- d360537: **五处实心面上的聚焦环改取面自己的前景色，键盘焦点重新看得见。**

  环往内收一个环宽，内侧紧挨着的是元素自己那块面。面是实心的那几档，默认环与面同族，贴上去读不出来。按 WCAG 2.2 SC 1.4.11 的非文本对比（3:1）逐档量过：

  - **回到顶部**与**剪贴板**的实心形态：钮压在语气实心底上吃默认环，六族浅深十二个组合 **1.00–2.89**，warning 深色档 1.00 等于整根看不见。三视觉轴打在 `root`、拿焦点的是钮，规则写成后代形式，补完 **4.83–7.80**。
  - **开关**的选中轨道：轨道是 `<button>`，皮肤没写 `color`，`currentColor` 取到的是 UA 的 `buttontext`——一支不随主题也不随语气走的色，浅色 neutral 档 **2.69**、深色 warning 档 **2.70**。这一档改成把语气配对的前景色写进环色槽，**4.83–7.80**。只读档的轨道是中性底，不进这条。
  - **气泡确认**的取消钮：常态的淡底 3.40 刚过线，悬停掉到 **2.97**、按下掉到 **2.52**。环改取这颗钮自己的前景色后三档分别是 **17.99 / 9.95 / 7.47**。
  - **标签输入**里反白标签上的删除叉：整颗胶囊反白成实心语气底，叉的环仍是框的环色，**1.00–2.89**；改取叉在反白档换过的那支字色后 **4.83–7.80**。

  热力图的高档格子与菜单栏的展开档一并量过，前者灌 `currentColor` 只到 1.44–1.54（格子的前景色是标签字色，不是这块面上的前景色），后者六族 3.07–6.17 本就过线且皮肤里写明环恒取 `--xh-ring-focus`，两处都不动。

- fadcb65: Button 与 ButtonGroup 的品牌实心外观在深色主题中保持深品牌背景和浅色前景，不再将标签切换为黑色。
- a5bc294: ButtonGroup 分隔线改为覆盖相邻按钮的接缝，不再留下贯穿控件高度的透明空隙。
- 071aaf6: ButtonGroup 现在把组内按压反馈限制在颜色与光照上，不再缩放单个 Button 段。相邻段仍按一像素共边
  连接，横排、竖排和 RTL 下按住中段时都不会从两侧裂开；组外 Button 保留原有缩放反馈，焦点段的
  层级与 disabled/loading 守卫不变。

  outline 组只给没有 `data-variant` 的 Button 段补组描边。子段显式声明 `solid`、`subtle`、`outline`
  或 `ghost` 时由自身形态决定边界，Vue/React 的直接子节点结构与 Web Components 的一层行为宿主
  结构采用相同规则。组件说明同步补回可选 `separator`，不再误称 ButtonGroup 只有 root 一个部件。

- 9ef5fbf: Button 的主色实心外观在 hover 与 pressed 状态继续使用品牌面前景色，不再退回默认文本色。
- cab6477: 固定周、月、季度和年份周期格在选中前后的尺寸，避免选中底色放大格子。
- 7fc15b7: 修复日历范围选择器在月面板首尾的邻月日期上继续绘制选区轨道和端点背景的问题。每张面板现在只为属于该月的日期绘制选区背景，邻月日期仍保留区间语义、弱化文字和完整交互。
- d6537b7: 系统强制颜色模式下移除 Card 的装饰高光背景图，由系统配色呈现实体面和边界。
- 5164ed5: Carousel 的分页指示器在粗指针环境下改为首尾相接的 44px 按钮分区，避免以负 inset 扩大命中区时相邻页互相覆盖；16/24px 短线、当前页进度、横向/纵向与 RTL 视觉保持不变，并新增 `--xh-carousel-indicator-target-size` 覆盖槽。
- f7bef6c: Carousel 非当前页分页点悬停 / 按下且落焦时，聚焦环改取前景色的配对面 `--xh-bg-canvas`：这两档的点走前景色阶梯（`--xh-fg-muted` → `--xh-fg-default`），浅色档悬停面与默认环同一明度、深色档按下面就是白点，默认环压上去看不见。
- c70c20d: 级联选择浮层统一为 M2 磨砂材质，同步列间和搜索分隔线及状态文字；弹层采用短位移、列项采用淡入，避免嵌套方向串扰和文字缩放。
- d0fda81: Cascader 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-icon-size`（§6.5）：分支条目行尾的展开 chevron `::after` 的缺省从 `--xh-icon-size` 改为 `--xh-control-indicator-size`（公开槽 `--xh-cascader-branch-arrow-size` 不变，comfortable 16px / compact 14px；此前恒 20px，比同一行 16px 的标记盒大一圈）；标记盒 `item-indicator` 在自己身上把 `--xh-icon-size` 改接到盒的尺（`--xh-cascader-item-indicator-size`，缺省 `--xh-control-indicator-size`）——空标记盒里皮肤画的兜底勾与半选杠、作者塞进标记盒的 XhIcon 从此都与盒同边长、随密度换档，与搜索候选行尾的勾同尺（此前勾与杠恒 20px，落在 16 / 14 的盒里比盒还大）。条目上由家族下发的 `--xh-icon-size`（桥自 `--xh-cascader-icon-size`，md 20px）仍只管作者直接放进条目里的图标。
- 7bdbbb1: Cascader 的单选、多选、列项与搜索结果统一使用末端对号表示选中，级联半选使用横线。

  选中正文恢复常态颜色与字重；展开路径改用中性底和正常字重，不再叠加品牌背景。悬停、键盘高亮和焦点继续使用中性反馈。既有 `--xh-cascader-item-*` 作者槽全部保留，搜索结果复用同一组 indicator 尺寸与颜色槽。

  同时修正 RTL 分支箭头方向，以及禁用列项、搜索结果、对号和分支箭头的统一失效颜色与鼠标反馈。数值选择、展开和关闭行为不变。

  归一化后的 `cascader.css` 从 24148 B 增至 26662 B，新增内容集中在搜索结果的末端标记轨与完整状态反馈。

  皮肤体积（去注释、压空白）：前一提交源码 26117 字节，当前 26662 字节；登记基线 26117 → 26662，只更新本组件，10% 容差保持不变。

- 25d0fde: 勾选框在粗指针下的 44×44 热区钉回方框中心：皮肤细指针外扩 6px 的 `inset` 特指度高于家族的 50% 起点，家族的 44px 尺寸与 -50% 平移却照旧生效，热区此前以方框左上角为中心、方框右下大半落在热区之外；现在粗指针块把起点交还家族。
- 530e2ba: Clipboard 的只读输入框与复制按钮改为连续控件，统一接缝、圆角、悬停与按压反馈，并修正实心变体复制成功时的文字对比度。

  复制状态不再插入瞬时加载圆环；复制前后指示器共享布局宽度，避免快速写入时按钮闪动。

- ca797ee: 让 Clipboard 的默认与成功指示器交叉淡化，退出内容在淡出完成后再隐藏，避免快速复制时出现空白闪帧。
- fa08fb4: **修复**复制钮的可访问名。

  `clipboard` 的 `indicator` **不再发 `aria-hidden`**。这个组件的解剖里没有单独的 label 部件，钮上写的字就装在指示器里（库里的示例写的是「复制」/「已复制」），把它藏起来等于把按钮唯一的可及名一起藏掉——浏览器实测判 `button-name` 严重违规，读屏与语音控制都点不动这颗钮。文字回执仍旧由 `status` 那个活区单独播报，两处说的不是同一件事：活区说「复制成功」，钮上的字是它自己的名字。

  **修复** `rating` 禁用态的双重压暗。`value-text` 上那条 `[data-disabled]` 改色规则删掉了：`root` 的禁用规则已经压了一层不透明度，后代再写一次 `fg-disabled` 是叠加，实际渲染比禁用态该有的更淡。禁用时的颜色由 `root` 那一层统一给。

- b3285b4: **宿主页面带焦点复位时，指针切换标签页等集合条目不再闪出一圈蓝边；集合条目的键盘环改为即时出现。**

  Collection Item 配方在条目根上常驻 `solid` 描边、静息透明，此前把 `outline-color` 放在 micro 过渡里。宿主页面常见的 `button:focus:not(:focus-visible) { outline: none !important }`（VitePress 默认主题 base.css 原文）是无层规则，压过库里分层的家族描边：指针点中标签时它把 `outline` 简写复位成 `none`，`outline-color` 同时落到 `currentColor`（当前页是品牌深字）；再点下一枚标签、焦点离开时规则失效，`solid` 立即回来，而颜色还要从品牌色淡回透明——这几帧上一枚标签画出一圈实心蓝边。文档站的 Tabs 页即如此。

  配方不再过渡 `outline-color`，与公共层 `focus.css` 的环同一节奏（即时出现、即时消失）；`tree.css` 自写的同款过渡一并去掉。受影响的是全部投影 `data-xh-collection-item` 的条目（菜单、右键菜单、菜单栏、下拉选项、列表框、级联、命令面板、提及、树、树选择、穿梭框、表格行、侧边导航、锚点、面包屑、导航菜单、标签页、日期 / 时间选择器的预设与时间列）：键盘 `:focus-visible` 与 `data-highlighted` 的环不再有 120ms 淡入淡出，面与字色的过渡不变。

- f2f025d: **集合类条目指针划过后，上一条目不再闪出一圈黑色描边。**

  菜单、右键菜单、菜单栏、下拉选项、列表框、级联、树、树选择、穿梭框、表格行、侧边导航、标签组与日期 / 时间选择器的预设、时间列这 17 份皮肤，都在 `:focus:not(:focus-visible)` 下给条目写了 `outline: none`。指针划入条目时焦点跟着搬到它身上，这条规则命中；`outline` 简写把 `outline-color` 复位成 `currentColor`。划到下一条时焦点离开、规则失效，`outline-style` 立即回到配方的 `solid`，而 `outline-color` 还要从近黑过渡回透明——这几帧里上一条目画出一圈实心黑边。

  UA 只在 `:focus-visible` 绘制环，这 21 条复位本就是死代码；整条删掉，条目的环仍由 Collection Item 配方经描边槽驱动，指针路径恒为透明，键盘 `:focus-visible` 照常带环。新增门禁 `check-focus-outline-reset` 拦住同类写法。

- ddd7bc9: 颜色选择器浮层接入 M2 磨砂表面、细顶光与四向短位移动效，保留取色区和色板原色，修复隐藏属性截断退场动画。
- 8258a1b: ColorPicker 取色中的滴管钮不再把聚焦环灌成 `currentColor`：这一档的面是 `--xh-bg-subtle-active`，浅色档 3.43:1、深色档改取 neutral-650 后 3.39:1，默认环够对比，非实心面一律吃库环。
- f261dd4: 组合框候选与状态共用 M2 磨砂表面和材质前景，增加细顶光，浮层采用四向无缩放短位移动效并隔离嵌套方向。
- ae285c3: Combobox 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-icon-size`（§6.5）：浮层条目里勾选标记所在的标记盒 `item-indicator` 在自己身上把 `--xh-icon-size` 改接到盒的尺（公开槽 `--xh-combobox-item-indicator-size` 不变，缺省 `--xh-control-indicator-size`，comfortable 16px / compact 14px）——空标记盒里皮肤画的兜底勾、作者塞进标记盒的 XhIcon 从此都与盒同边长、随密度换档（勾选标记不是勾选格，不取 × 0.75，与 Select / Listbox / Menu 族同口径；此前勾恒 20px，比 16 / 14 的盒大一圈）。root / positioner 按档下发的 `--xh-icon-size`（桥自 `--xh-combobox-icon-size`，md 20px）仍只管作者直接放进条目里的图标。
- 81f2678: Combobox 单选与多选统一使用末端对号表示选中。默认选中文字不再使用品牌色或加粗，选中本身不铺底；
  指针与键盘高亮继续使用中性实体底，选中叠加高亮时同时保留对号。

  `item-indicator` 固定到逻辑末端并保留稳定占位，RTL 自动翻转；禁用项与禁用对号统一使用失效前景和不可用游标。
  作者内容继续按 DOM 顺序参与弹性布局，正式 `item-text` 负责占据余量和截断长文。

  皮肤体积（去注释、压空白）：前一提交源码 19006 字节，当前 19073 字节；登记基线 19006 → 19073，只更新本组件，10% 容差保持不变。

- ced9f26: Command 的非模态模式不再创建或显示遮罩；全屏 positioner 只负责布局，不截获页面指针，content 自身保持可交互。

  展开期间切换 `modal` 会由无头状态机同步焦点陷阱、Tab 回绕、滚动锁和背景失活。默认模态行为保持不变。

- 02de41e: Command 无可见命令时收起空列表的额外内距，隐藏分组和隐藏条目不会留下空白行；禁用命令仍作为真实候选显示。
  没有作者内容的 Empty / Loading 节点不再占据纯留白。搜索输入、状态文案、底栏及焦点位置保持正常。

  数据集合保持不变，已有 DOM 中明确隐藏的候选退出键盘、指针、执行与 ARIA 高亮；未挂载或虚拟候选不作隐藏推断。
  三端在 List 节点提交和释放时通知私有可见性端口，保持展开替换节点时撤销旧观察并绑定新列表，不扫描整个 Document。

  皮肤体积（去注释、压空白）：前一提交源码 10959 字节，当前 11264 字节；登记基线 10959 → 11264，只更新本组件，10% 容差保持不变。

- a5c6146: **断点扫描面补齐，外加一道「不许再写 `container-type`」的门禁。**

  `check-breakpoints` 此前只扫 `@media` 的 `min/max-width` 冒号写法。现在 `@media` 与 `@container` 两种查询都扫，冒号写法与区间写法（`(width >= 768px)`、`(768px <= inline-size < 1024px)`）全收；顺带补了原正则的一个洞——同一条前奏里有多个宽度条件时，老写法只查第一个。

  新门禁 `check-container-scope`：只有登记在册的部件才许写 `container-type`，两侧反查。登记表现在是空的——库里一处 `container-type` 都没有，全部换档走视口断点，所以这道门禁此刻守的是「谁都不许再写 `container-type`」：皮肤里凡出现一处就没有对应登记，立刻判红。要重新启用某个落点，先在登记表里补一条写清判据。

  判据本身连同两处实测结论留在登记表与门禁的注释里：

  - `container-type: inline-size` **不会**让元素成为其 `absolute` 后代的包含块。在 Chromium 151 上带对照组量过：同一个根写 `contain: layout` 时 absolute 与 fixed 探针从 (0,0) 跳到 (24,40)，写 `container-type: inline-size` 或 `size` 时两枚探针纹丝不动、`getComputedStyle(root).contain` 恒为 `none`。
  - 真正会咬人的是行内轴的尺寸限制：**收缩包裹的盒宽度当场归零**——把这样的根放进「没写 `flex-basis` 的 flex 项」或 `inline-block` 父里，实测宽度 169→0、181→0、192→0，高度同时炸开。静态门禁看不见使用者的外层，只能写死在登记表判据与报错文案里。

- 222cc53: ContextMenu 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-icon-size`（§6.5）：带子菜单条目行尾的展开 chevron `::after` 取新增公开槽 `--xh-context-menu-submenu-indicator-size`（缺省 `--xh-control-indicator-size`，comfortable 16px / compact 14px；此前恒 20px，比同一行 16px 的指示符档大一圈，与既有的 `--xh-context-menu-submenu-indicator-fg` 配对）；标记位 `item-indicator` 的盒改按 `--xh-context-menu-item-indicator-size`（缺省从 `--xh-icon-size` 改为 `--xh-control-indicator-size`，comfortable 16px / compact 14px；此前随家族按档下发的 20px）取尺，并在自己身上把 `--xh-icon-size` 改接到盒的尺——空标记位里皮肤画的兜底勾与作者塞进标记位的 XhIcon 从此都与盒同边长、随密度换档（此前勾恒 20px，比盒还大）。条目上由家族下发的 `--xh-icon-size`（md 20px）仍只管作者直接放进条目里的图标。
- 2ed9963: **`check-css-floor` 的拒绝名单改成与 `.browserslistrc` 逐条对账。**

  这张门禁替浏览器硬底线把关：低于底线时皮肤整体无样式，所以「写了一个新特性」等于「悄悄抬了底线」。但它此前是一份**纯手写、无法证伪**的名单——脚本自己写着「`.browserslistrc` 只作记录，不参与判定」。

  结果就是它拦下了一个**本来就在底线之内**的特性：`@container` 那条写着「size 查询把底线从 2023-03 抬到 2023-09」，而容器尺寸查询是 Chrome 105 / Firefox 110 / Safari 16.0，本库钉的底线是 Chrome 111 / Firefox 113 / Safari 16.2——**三家全都严格高于它的要求**。这条登记不知何时起就已经过期，没有任何机制会发现。

  现在每条登记记着它要求的引擎版本，门禁拿 `.browserslistrc` 的地板逐条比：三家都写全、且都不高于地板时当场判红，报「把这条从 REJECT 里删掉」。少写一家的按「判不出」处理、条目照旧生效——宁可多拦，不可放行一个真会抬底线的。

  `@container` 那条随之删除。这不是抬底线，是把一条早就该删的登记删掉：底线一个字没动，`.browserslistrc` 与 `docs/guide/versioning.md` 的支持面表格都不需要改。

- f314a59: 统一日期选择器浮层的磨砂材质、顶光与内部分隔线，改用无缩放短位移动效，并隔离嵌套浮层方向；保留手机复合布局及退场几何。
- e6d9c6d: 修正日期时间组合面板的分区：时间列与日期内容区顶部、底部对齐，仅允许纵向滚动，并补齐贯穿面板的分隔线。
- 2c2e470: **修复**三处「操作发生了，但屏幕上看不出来」。

  **context-menu 触屏长按全程零反馈。** 触屏没有右键，菜单靠长按计时打开；此前这段等待里触发区一动不动，用户当成没按上就提前抬手，抬手事件把计时掐掉——症状是「右键菜单在手机上根本打不开」。触发区在按住期间压一档中性轻底当回执，新增使用者槽 `--xh-context-menu-trigger-bg-pressing`。只换底色不做缩放：触发区是作者的整块内容，缩放它会把作者自己的排版一起抖起来。`check-press-feedback` 相应认得第二种形态——反馈由状态属性驱动、比底色而非比缩放——并把 context-menu 收进名单。

  **approval 判定在途时还能按出第二条拒绝。** 提交中批准钮已经锁住，拒绝钮却没有任何闸门：状态机要等宿主回话才落定，这段空窗里再按一次就送出第二条判定，闸门后面的系统会收到两条相互矛盾的结论。拒绝钮按批准钮同构接上 `aria-disabled` / `aria-busy` / `data-loading` 与点击守卫，皮肤补上对应的置灰档（新增 `--xh-approval-deny-border-off` / `--xh-approval-deny-bg-off`）。Escape 是这颗钮的键盘等价物，同一道闸门一起接上——只锁按钮的话，等待期里换只手按 Escape 照样打得出第二条。

  锁的只是人手按的那两条路。机器这一层的 `DENY` 不变：超时、卸载兜底与宿主的 `deny()` 入口照旧无条件走得通，「拒绝永远拒得掉」这条不变量仍由状态机结构保证。

  **file-upload 传失败与传完的行渲染完全一致。** 连接层早已把相位发在 `data-state` 上，皮肤却一条都没消费，于是用户看不出哪一条失败、也就不知道该点哪一条的重试——组件自带的重试能力等于按不到。补上 error 一档：红边加红字（新增 `--xh-file-upload-item-border-error` / `--xh-file-upload-item-fg-error`），并在行首补一枚警示字形——只靠颜色的话，色觉障碍用户与灰度打印下这一档等于没有。

- 7e512dc: Dialog 在 `modal=false` 时不再创建或激活全屏遮罩，定位层不再拦截面板之外的页面指针；展开期间切换 `modal` 会同步更新焦点陷阱、滚动锁、背景失活和遮罩。

  FocusScope 的 `loop` 选项新增 getter 形式，使共享核心能够在不重建焦点域的情况下切换 Tab 边界回绕策略。

- 51f2cbf: **修复**六份皮肤里九条交互伪类规则没排除禁用态：置灰的件悬停照常换底、按下照常缩，看着还能点。

  这些件的禁用一律走 `aria-disabled` / `data-disabled` 而不是原生 `disabled`——禁用项要留在方向键行程里、要能被读屏念到为什么按不动，所以节点始终是可命中的，`:hover` 与 `:active` 一定命中。各自的置灰规则只写了 `cursor` 与 `opacity`，不复位 `background` / `scale`，于是交互反馈原样保留。按同库里已经写对的那几份（`float-button` / `steps` / `side-nav` / `menubar`）逐条补上守卫：button（另加挂起态，它走的也是 `aria-disabled`；原生置灰的那颗浏览器同样给 `:hover`）、tabs 常态与选中态两条、accordion、navigation-menu、approval 的授权项与批准/拒绝两颗、sortable 的拖拽把手。

  navigation-menu 的展开档与 approval 拒绝钮的置灰档此前靠书写顺序压过悬停那条，加守卫后特指度不再相同：展开档一并补上同一道守卫，拒绝钮置灰档里那条为压 `:active` 而写的 `scale: 1` 随之删掉。

- 2cc168a: 没写内容的下载钮在粗指针下兜底字形留在行内流：家族 text 档热区规则落在同一个 `::after` 上，字形此前被拎成绝对定位、盒撑到 44px 高，按钮随之收窄一格字形；现在粗指针块把字形的定位、下限与平移钉回，热区仍由皮肤的 `::before` 扩。
- 51f2cbf: **修复**三处「东西在那儿，但用不了」。

  **滚动区的滚动条拖不动。** 滚动区自己那层挂载点同时充当滚动条的根，排布是照独立滚动条那份根规则补齐的，唯独漏了 `pointer-events: auto`。浮层的 positioner 一律不吃指针，条子作为子节点继承下来，于是按不着也拖不动——把滚动区放进弹窗、抽屉或气泡里就会撞上。补上这一行，与独立滚动条那份对齐；收起态那条 `pointer-events: none` 优先级更高，收起时照旧穿透。

  **浮动面板最大化时四角露出底下的页面。** 最大化那一档几何层把面板写成铺满视口，而圆角、描边与投影都还按浮在页面上的那一档画：四个角上露出一圈页面底色，描边缩成贴着视口边缘的多余框线，投影整块落在视口之外。这一档一起撤掉三样。

  **越界的日期只有一小格标红。** 日期输入与日期选择器把「值落在 min/max 之外」只发给出错的那一段，不发给根与外框，而红边长在外框上——用户敲进一个超出范围的日期，除了那一小格没有任何整体反馈。两件的根与外框改成「显式 invalid 或值越界」都算不合法，与同族的时间输入一致；区间选择两端任意一端越界，整份输入都标出来。不新增任何属性或取值：`data-invalid` 本来就在发，只是多了一个触发条件。

- b81590f: **下拉候选的高亮只用底色，不再另画一圈环。**

  `combobox`、`mention` 与 `cascader`（检索结果那一列）在高亮条目上除底色外还画了一圈聚焦环。全库 21 份带候选的皮肤里，只有这三份这么做——`select` / `listbox` / `menu` / `command` / `tree` 等 18 份一直只用底色。

  那圈环画的并不是「焦点在这儿」：这几家走 `aria-activedescendant`，焦点恒在输入框上，候选从不持有焦点。皮肤注释自己写着「焦点恒在输入框，环跟着高亮条目走」——等于把一个焦点记号借去当高亮用。聚焦环改成内收之后它压在候选自己的面上，更显眼了。

  三份归一到与 `select` 同一口径。

- 2c2e470: **补齐**两处按钮的兜底字形。这两个部件的解剖里都没有第二个节点放图形，皮肤又没画，渲染出来是摸得着却看不见的空盒：`sortable` 的 `item-drag-trigger` 是一块透明方块、`floating-panel` 的 `window-state-trigger` 是标题栏上并排的两三个一模一样的空方块。名字只在 `aria-label` 上，看得见的那一路什么都没有。

  - `sortable` 的 `item-drag-trigger` 画两条竖线的抓手，与 `tabs` 的 `tab-drag-trigger`、`table` 的 `column-drag-trigger` 同一种画法（`:empty::after` + `border-inline`）。新增覆盖槽 `--xh-sortable-drag-grip-w` / `--xh-sortable-drag-grip-h`。
  - `floating-panel` 的 `window-state-trigger` 按 `data-target-window-state` 分三档：还原、铺满、收拢各一枚。选的是 `data-target-window-state` 而不是面板身上的 `data-window-state`——后者说的是面板此刻在哪一档，用它会让并排的几颗钮同时换成同一枚字形。

  **新增**两个字形令牌 `--xh-glyph-mark-maximize`（四角朝外）与 `--xh-glyph-mark-restore`（四角朝内），供上面那三档使用；「收拢」复用已有的 `--xh-glyph-mark-minus`。

  示例侧同步删掉手打的字符：`sortable` 四份示例里的 `⠿`、`floating-panel` 三份示例里的 `—` 与 `▢`。它们是缺兜底字形时的权宜之计，皮肤补上之后留着反而会把兜底顶掉。

- 5a4d047: **颜色字段、输入组和文本字段聚焦时只绘制最外层字段轮廓。** Field Chrome 内的原生输入与 `field-inset` 动作不再重复绘制内部焦点框。
- 0823d18: FileUpload 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-file-upload-icon-size`（§6.5）：条目行首传完的勾与失败的警示两枚 `::before` 固定状态标记此前读 root 的 `--xh-icon-size`（随文 1em，条目字号下 14px，且不随密度换档）；现在取新增公开槽 `--xh-file-upload-item-mark-size`（缺省 `--xh-control-indicator-size`，comfortable 16px / compact 14px）——comfortable 从 14px 放到 16px，与同一行里 icon 档的删除钮并排，compact 尺寸不变但从此随密度换档。它们是固定状态标记，作者塞进条目的部件顶不掉。`--xh-file-upload-icon-size` 仍只管作者放进缩略图槽、删除钮与清空钮里的图标与皮肤画的兜底叉（随文 1em 不变）。
- cf2e555: 为 FloatButton 建立专用 Headless 状态机与逻辑浮层生命周期。click/hover 展开后由同一
  Document 的 LayerRegistry 仲裁层外 pointerdown 和全局 Escape，后开的 Drawer/Popover
  优先消解，Toast 反馈通道不占可消解父层；关闭、禁用写回与卸载均精确释放资源。

  受控实例的交互只派发 open-change 意图，父级写回前不改可见 DOM；hover 模式的层外
  pointer/focus 由同一次 pointerleave 收口，disabled watch 每次变更只派一次意图。三端适配器仅桥接 RuntimeConfig、
  LayerRegistry 登记函数与根节点引用。

- f5fdef8: FloatButton 的原生按钮动作项默认继承触发器的玻璃表面、尺寸、圆角与交互状态，直接组合时不再退回浏览器按钮样式。
- d360537: **三处实心面上的聚焦环改取面自己的前景色，两处灌得过宽的收窄。**

  环往内收一个环宽，内侧紧挨着的是环压着的那块面。按 WCAG 2.2 SC 1.4.11 的非文本对比（3:1）逐档量过内侧这一对：

  - **悬浮钮**的实心形态：三视觉轴打在壳上、面画在触发器上，按形态限定的规则匹配不到拿焦点的那颗钮，默认环压在语气实心底上，六族浅深十四个组合 **1.01–2.89**（warning 深色档 1.01 等于整根看不见）。补一条后代规则，**4.83–7.83**。
  - **标签**上的关闭钮：叉自己透空，环压着的是标签那块实心底；它的字色本就是那块底上的前景色，环取过来即可。改前 **1.01–2.89**，改后 **4.83–7.83**。
  - **滑块**的拇指：圆点上没有字，皮肤从没给它写过 `color`，那条早就在的 `currentColor` 取到的是从页面继承下来的正文色而不是与这块底配对的前景色——浅色 neutral **2.53**、深色 success **2.91**、深色 warning **2.58** 三档在线下。拇指补一支 `color: var(--xh-_tone-on, var(--xh-fg-on-brand))` 之后 **4.83–7.83**，其余各档只升不降。拇指那圈描边与环同为一个 `--xh-stroke-thick`，环正好把它盖在底下，内侧仍是面。

  两处 `currentColor` 灌到了「面已经被换走」的档上，收窄成还铺着实心底的那几条：

  - **审批**的批准钮：关闭档（`aria-disabled` 且不在途）把面换成静默底、前景换成置灰色，环跟着字走 **2.36 / 1.94**；收窄后吃公共层的默认环，**3.39 / 5.61**。判定在途那一档单列一条分支保住 `currentColor`——它明说不置灰、面仍是实心语气底（**5.09 / 5.32**）。
  - **日历**的选中格：不可用的格子仍要能聚焦（方向键的起点），但它的面是静默底、前景是置灰色，**2.36 / 1.94**；规则追加 `:not([data-disabled])` 之后吃默认环，**3.39 / 5.61**。普通选中格不变（**5.09 / 5.32**）。

  滑块拇指多出来的那支 `color` 是计算值上的变化：拇指里没有字，这一支只喂环，三个适配器的计算样式快照一并更新。

  树的半选把手一并收进了勾满那条规则（两态铺的是同一块实心底），但这一处画面上没有变化：连接层给两颗勾选把手发的是 `aria-hidden` 与 `tabindex="-1"`，还在 `pointerdown` 里拦掉默认聚焦，焦点落不上去，这条 `:focus-visible` 规则连同它原本就有的勾满分支一起是死的。四条分支都登记在 `focus-ring-surface-registry.json` 里写明了这件事。

- 4c36a67: **十一处聚焦环的取色按「环在它自己那块面上看不看得见」重新量过，环不再消失、也不再罩到不该罩的档。**

  上一批把「实心面上的环取 currentColor」立成两道判据；这一批堵掉判据自己的洞之后，分母从 2130 档扩到 2549 档（同一元素上的形态档、状态两两叠加档、`:is()` 合写的分支此前整类不进分母），新照出来的不达标档逐条修，改前改后都是实测比值：

  - **表格**全选钮的半选档：`color: transparent` 让 currentColor 环整根透明（1.00:1）。环改取全选钮自己的前景色，5.09 / 5.32。
  - **剪贴板**实心形态复制成功那一档：字换成成功色、面仍是实心语气底，环 1.05–2.11。环改取复制钮的前景色，4.83–7.83。
  - **标签组**实心形态选中档与它的删除钮：选中规则把字换成语气正文色压过实心档的 on 色，环 1.18–2.49。环改取条目自己的前景色，4.83–7.83。
  - **悬浮钮**实心形态失效档、**时间选择器**条目与预设的选中且失效档：置灰字与中性实心面同色，环 1.00。currentColor 规则收窄到 `:not([data-disabled])`，失效档另给一支配对前景色，4.83–7.83。
  - **气泡确认**取消钮、**提示输入框**发送钮、**滚动条**滑块、**分割面板**拖柄、**开关**：五处 currentColor 规则罩得比实心面宽——常态 / 停止态 / 失效态 / 只读选中态那几档面是淡色，本就过线（3.40），灌了 currentColor 反倒把环从品牌色换成近黑近白。选择器逐条收窄到实心那一档，淡色档退回默认环。
  - **级联选择**浮层里的搜索框：此前 `outline: none` 且没有任何一层替它画环，键盘落焦时整个看不见焦点。与命令面板的搜索框同一口径，吃公共层的默认环。

  口径两条一并写进文档：**过了线的淡色档不为统一而灌 currentColor**（环随面走的是「面配对的前景色」，淡色面配对的是正文色，画上去反而与同族分叉）；**失效档按 WCAG 1.4.11 豁免对比度，但环不许消失**（`transparent` 与置灰同色都算消失）。

  皮肤体积基线表整份重落（`pnpm size:css --update`）：标签组 8481 → 9351 字节，涨的是上面那条选中档的环色规则；其余几十份的登记值是早先几批留下的旧数，这次一起对齐。

- 567d02a: 空菜单本身取得键盘焦点时绘制实体保护底，保持焦点环对比度不受透明背景影响；同步焦点静态检查器对主题分支和嵌入透明度变量的真实求值。
- 1066622: 让 GradientText 在局部高对比、系统高对比、强制色、打印与文字选区中改用稳定的实体前景。
- 775a3a9: Button 文档示例按常用场景重排，首例保持最标准用法，并统一变体、尺寸、图标、加载、全宽、禁用与链接示例。

  React `XhButton` 在 `as="a"` 时公开 `href`、`target` 与 `rel` 类型。

  React `XhIcon` 将结构化图标的 SVG 呈现属性转换为 React 属性名，避免运行时无效属性警告。

  ButtonGroup 默认分隔线在浅色与深色按钮面上均保持清晰可见。

- be08778: **修复**七个部件的收起态失效：声明了 `display` 却没把 UA 的 `[hidden] { display: none }` 还回去，作者给节点加 `hidden` 它照样占着版面。

  每份皮肤都在文件末尾补一条 `[data-part=…][hidden] { display: none }` 把这件事还回去，守它的门禁却只把带 `{` 的那一行当选择器——多行逗号列表里排在前面的选择器整段进不了判据，`[data-part='prev-trigger'],` 换行再写 `[data-part='next-trigger'] {` 的写法只有 next 被查过。判据改成规则块前每一条逗号分隔的选择器各判各的（拆分只在括号外的逗号处断开，`:is(:hover, [data-highlighted])` 里那个逗号属于伪类参数），并把注释先抹成等长空白，注释里成对出现的 `{}` 不再把块层级算歪。同时收窄免检口径：免检是留给 presence 那类落在部件自身、要把退场播完才卸载的动画，伪元素上的加载环转的是伪元素自己的盒子，宿主该消失照样消失，不再拿它当宿主缺兜底的理由。

  补上兜底的七处：`image-viewer` 的 prev-trigger（同一对翻页钮里 next 早就有）、`popconfirm` 的 confirm-trigger（cancel 早就有）、`side-nav` 的 list 与 branch-trigger、`tree` 的 item-checkbox（branch-checkbox 早就有）、`switch` 的 thumb、`spinner` 的 root——最后这份皮肤此前一条兜底都没写。

- 387629a: **输入组内的字段控件在 hover、focus 与失焦过渡期间始终保持透明。** 嵌套字段不再重新绘制或过渡内部边框与背景，所有交互状态只由输入组外轮廓表达。
- 97ba480: JsonViewer 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-json-viewer-icon-size`（§6.5）：分支行首展开箭头把手 `branch-trigger` 在自己身上把 `--xh-icon-size` 改接到盒的尺 `--xh-json-viewer-indicator-size`（缺省 `--xh-control-indicator-size`，comfortable 16px / compact 14px），盒里的 `branch-indicator` 兜底 chevron 从此与把手盒同边长——此前它读 root 按档下发的 `--xh-icon-size`（md 20px），20 的箭头装在 16 的把手里两侧各溢出 2px、compact 下盒收到 14 时它仍是 20。公开槽不新增，`--xh-json-viewer-indicator-size` 只是多管一处；`--xh-json-viewer-icon-size` 仍只管作者放进空态格里的图标（md 20px 不变）。

  json-viewer.css 体积基线从 9029 重落到 9987 字节：涨在 `branch-trigger` 改接 `--xh-icon-size` 这一条声明（88 字节），其余是此前分支行接入按压通道那批已入库的 `[data-pressed]` 与 forced-colors 规则（870 字节，当时没过 10% 红线未重落）。

- 502ee35: **必填星号与错误文案抽到公共层。** `label.css` 新收两段：必填星号（`--xh-glyph-mark-required` + `--xh-space-1` + `--xh-fg-danger`）与无效档标签色（`--xh-fg-danger`），按 `field` 的 `label`、`fieldset` 的 `legend` 自己身上的 `data-required` / `data-invalid` 选中；`description.css` 扩为说明与错误文案的公共层，收进两者逐值相同的外边距、行距、默认字号与字色（说明 `--xh-fg-muted`、错误 `--xh-fg-danger`，都是 `--xh-text-secondary-size`）。`field.css` 与 `fieldset.css` 删掉自己那份同样的声明，只留接覆盖槽的 `color` / `font-size`——`--xh-field-label-star`、`--xh-field-label-fg-invalid`、`--xh-field-description-*`、`--xh-field-error-*` 与 `--xh-fieldset-*` 各槽名字与默认值都没动。像素不变。

  自带标签的字段接入这一层 = connect 在标签部件投影 `data-required`，再把 scope 加进 `label.css` 的列表；控件本体不画星号。按需引入的人两份公共层都要引在组件皮肤之前：`import '@xihan-ui/styles/label.css'`、`import '@xihan-ui/styles/description.css'`。

  `label.css` 从 1162 字节涨到 1548、`description.css` 从 255 涨到 692，涨的就是这四段；`field.css`、`fieldset.css` 各缩 262 / 268 字节。

  **Headless：`field` 的 `getLabelProps` 与 `fieldset` 的 `getLegendProps` 新增投影 `data-required` 与 `data-invalid`。** 公共层按标签自己的状态位画，不再回头看根；根上的同名两位保留，供横排布局等规则用。属性名都已在公开面里，没有新名字。

- 48d6b88: LayerRegistry 现在按每个 Document 的真实逻辑栈派生视觉序号与 lane，并通过统一
  `--xh-_layer` 槽驱动已登记浮层的 z-index。嵌套 popover 高于所属 modal，后来登记的层
  不再被组件静态层级压住；动态 modal 会显式同步 Registry 与视觉绑定。

  删除 `Layer.setModal`。模态性继续由只读 `isModal()` getter 提供，变化后调用
  `LayerRegistry.sync(layer)`；`visualOf(layer)` 返回当前 `visualIndex`、`visualLane` 与可写入
  CSS 的 `visualLayer`。公开组件层级变量仍优先于 Registry 私有槽。

- 825d92e: **条目勾选标记的强调色统一走具名私有槽。** 级联选择与树形选择把内联的强调色提成具名私有槽，列表框把恒定的 `--xh-fg-brand` 接进语气通道——六件列表族现在写法一致：写了 `data-tone` 的列表，条目上的勾选标记跟着语气走，没写的仍是品牌色。

  覆盖槽名、部件名与 `data-*` 取值一个没动。

- c6a9c39: 修复 Listbox 零候选时遗留空描边和空分组间距。空集合从列表语义与 Tab 序列退出，作者现有 Empty / Loading 部件承接状态；候选恢复后保留正常键盘入口。默认渲染不添加虚构占位选项或默认提示。

  手写结构按真实 item 和显式 hidden 判断：空白文本、空组、隐藏分组不再撑出框体，隐藏条目不参与导航与全选，禁用候选仍显示。requiredParts 取消 item 必需，允许合法空态与首次加载；Content 契约与现有复合部件 API 保持原样。

  皮肤体积（去注释、压空白）：前一提交源码 8917 字节，当前 9523 字节；登记基线 8916 → 9523，只更新本组件，10% 容差保持不变。

- 039b74a: Listbox 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-icon-size`（§6.5）：page 语境下前导对号所在的标记盒 `item-indicator` 的缺省从 `--xh-icon-size` 改为 `--xh-control-indicator-size`（公开槽 `--xh-listbox-item-indicator-size` 不变，comfortable 16px / compact 14px；此前恒 20px，比指示符档大一圈），并在自己身上把 `--xh-icon-size` 改接到盒的尺——空标记盒里皮肤画的兜底勾、作者塞进标记盒的 XhIcon 从此都与盒同边长、随密度换档（前导对号不是勾选格，不取 × 0.75，与 Menu 族同口径；此前勾恒 20px）。条目上由家族下发的 `--xh-icon-size`（桥自 `--xh-listbox-icon-size`，md 20px）仍只管作者直接放进条目里的图标。
- 7b34cb6: Listbox 单选、多选统一用对号表示选中，默认正文保持正常颜色和字重；悬停与键盘聚焦共用中性底。
  勾选位固定在逻辑末端并保留未选中占位，键盘焦点底立即铺实，避免短暂透明过渡。
  Popover + Listbox 组合遵循同一规则，不改变值选择、只读与禁用行为。

  皮肤体积（去注释、压空白）：前一提交源码 8699 字节，当前 8916 字节；登记基线 8699 → 8916，只更新本组件，10% 容差保持不变。

- c3098de: 重新登记已验收的 Button、Card、Popover 皮肤体积基线，保留逐组件 10% 的增长阈值，不更新其他组件。

  去注释、压空白后的实际字节为：Button 6406 → 9902（+3496），增加 M1 边界与阴影状态、载入部件布局、实心双层焦点环及强制颜色处理；Card 3533 → 3970（+437），增加 M1 顶光、边界、接触影及强制颜色处理；Popover 6315 → 7077（+762），增加 M2 磨砂、实体聚焦隔离底与箭头材质。三项均使用同一标准计量，不通过修改全局容差放宽检查。

- 466b917: 提及候选浮层统一为 M2 磨砂与无缩放短位移，状态文字保持位于材质上方；限制最小宽度，避免窄空间溢出。
- 4117c9a: Menu 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-icon-size`（§6.5）：带子菜单条目行尾的展开 chevron `::after` 取新增公开槽 `--xh-menu-submenu-indicator-size`（缺省 `--xh-control-indicator-size`，comfortable 16px / compact 14px；此前恒 20px，比同一行 16px 的指示符档大一圈，与既有的 `--xh-menu-submenu-indicator-fg` 配对）；标记位 `item-indicator` 的盒改按 `--xh-menu-item-indicator-size`（缺省从 `--xh-icon-size` 改为 `--xh-control-indicator-size`，comfortable 16px / compact 14px；此前随家族按档下发的 20px）取尺，并在自己身上把 `--xh-icon-size` 改接到盒的尺——作者塞进标记位的 XhIcon 从此与盒同尺、随密度换档。条目上由家族下发的 `--xh-icon-size`（md 20px）仍只管作者直接放进条目里的图标。
- 67b27bb: Menubar 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-icon-size`（§6.5）：带子菜单条目行尾的展开 chevron `::after` 取新增公开槽 `--xh-menubar-submenu-indicator-size`（缺省 `--xh-control-indicator-size`，comfortable 16px / compact 14px；此前恒 20px，比同一行 16px 的指示符档大一圈，与既有的 `--xh-menubar-submenu-indicator-fg` 配对）；标记位 `item-indicator` 的盒改按 `--xh-menubar-item-indicator-size`（缺省从 `--xh-icon-size` 改为 `--xh-control-indicator-size`，comfortable 16px / compact 14px；此前随家族按档下发的 20px）取尺，并在自己身上把 `--xh-icon-size` 改接到盒的尺——空标记位里皮肤画的兜底勾与作者塞进标记位的 XhIcon 从此都与盒同边长、随密度换档（此前勾恒 20px，比盒还大）。root / positioner 上由家族下发的 `--xh-icon-size`（md 20px）仍只管作者直接放进条目里的图标。
- 4e0d857: **新增**连续缓动令牌 `--xh-motion-ease-continuous`（原语 `--xh-ease-standard` = `cubic-bezier(0.2, 0, 0, 1)`）。此前语义层只有 `-enter` / `-enter-strong` / `-exit` 三档，描述的都是元素与视口的进出关系；循环动画没有起终点，被推到新位置的元素起终点又都在屏内，两类都不属于进出，于是只能下探到原语。这一档说的是「两端都在屏内」这层关系：起步就带速度，收尾再减速。

  `segmented` 的滑块位置过渡与 `table` / `skeleton` / `progress` 的循环动画共 7 处，从直引 `--xh-ease-standard` 改走这一档。取值同源，视觉零改动。

  JS 侧不动：`@xihan-ui/motion` 的 `easing.standard` 就是同一条原语，两边由门禁对账。

- 8bbead4: **新增**循环缓动令牌 `--xh-motion-ease-loop`（恒是 `linear`）。无限循环的动画——加载环、流光、跑马灯——必须匀速：带缓动的曲线会让每一圈忽快忽慢。这一档背后刻意不设原语，匀速没有可调余地。

  **收窄** `--xh-motion-ease-continuous` 的语义：它现在只管「元素在屏内被推到新位置」，不再兼管循环动画。原描述把两者合在一起，导致三处循环动画拿到了带缓动的曲线，而另外八处只能手写 `linear` 绕开——同一道流光在库里跑出两种节奏。

  `button` / `marquee` / `notification` / `popconfirm` / `progress` / `reasoning` / `skeleton` / `spinner` / `switch` / `table` / `tool-call` 共 11 处循环改引 `--xh-motion-ease-loop`。取值与各自原先的实际表现一致或更正确，`segmented` 的滑块位置过渡保持在 `--xh-motion-ease-continuous`。

- 1e7e815: **几何类过渡改按角色选曲线档；58 个可点部件补上按压反馈。**

  **动位置、尺寸、缩放、旋转的过渡此前大多用着色彩那一档。** 规范 §8.2 的选用表把 `--xh-motion-ease-enter` 判给「仅不透明度 / 底色 / 边框色变化」，几何变化另有档位，但实测 86 项几何类过渡里 76 项用的是 `-enter`——因为既有判据只拦「下探原语 / 手写曲线 / 字面关键字」三类写法，判不出档位选错，这条规矩从来不会红。现在按被动的属性分两档：被推到新位置或新尺寸（`inset-*` / `inline-size` / `translate` / `transform` 等）走 `--xh-motion-ease-continuous`，原地形变（`scale` / `rotate`）走 `--xh-motion-ease-enter-strong`。80 项随之改档，涉及 52 份皮肤。观感上最明显的是指示条一类：此前只有 `segmented` 用对了连续档，`anchor` / `navigation-menu` / `tour` / `question-flow` 四家各写各的，滑块看着像自己飘过去；现在四家与它一致，起步就有速度。新增判据 `check-motion-role.mjs` 守住这一档，

  **点得动却按不出反应的部件补齐。** 皮肤里带 `cursor: pointer` 的部件有 157 个，此前只有 61 个登记过按压反馈的定性，其余静默放行——包括 `button` 自己，而规范 §14.4 正是拿它当这条的正例。106 个未登记部件逐个定性：58 个补上 `:active` 与 `--xh-motion-scale-press`（`button` / `toggle` / `toggle-group` / `checkbox` / `switch` / `rating` / `calendar` 的翻页与选格 / `carousel` 的翻页 / `tabs` / `accordion` / `collapsible` / `table` 的三个把手 / `popconfirm` / `tour` 的三颗钮等），48 个登记为不给并各留一句理由。不给的分六类：列表族条目（按下回执走高亮档，缩放会抖动整列）、扩大命中区的标签、方框圆圈连着文字的整行条目、字段外壳与铺满宽度的值显示体、拖拽轨道（回执由拇指给出）、大块区域。缩放量一律走 `--xh-motion-scale-press`，减弱动效档下自动归 1。

  判据同批改成全集反查：扫出全部可点部件，凡不在两张登记表里的判红，新组件不再默认逃过。

  本批共新增三道判据，`pnpm gate` 从 85 项增至 88 项。

  **体积预算一次到位，并补上逐皮肤与跨适配器两道度量。** 四条大条目此前余量约 1%（`styles` 143.37/145 kB、`headless` 252.56/255、`vue` 288.30/292、`web-components/define` 276.79/281），重构加第一份皮肤就撞线，之后每个提交都要顺手调预算——门禁变成了记账本。现按实测 × 1.15 一次调到位：`headless` 290 kB、`vue` 332 kB、`web-components/define` 318 kB、`styles` 165 kB、`tokens/tokens.css` 5 kB。逐组件条目从 3 条铺到每族 1 条（新增 `XhMenuRoot` 25.9 kB / `XhTableRoot` 22 kB / `XhSelectRoot` 22.3 kB / `XhToastRoot` 9.7 kB / `XhGridRoot` 1.15 kB / `XhMarkdownStreamRoot` 1.6 kB，各按实测留一成余量贴身守摇树）。

  另加两道此前没有的度量：`check-skin-size.mjs` 按份登记皮肤体积基线（单位是去注释压空白后的字节，`table.css` 原始 36773 字节里约四成是注释与空白，按原始字节算等于罚写注释的人），单份涨过一成判红；`check-computed-parity.mjs` 比对两个适配器的 DOM 计算样式快照，127 个组件各一份、逐字对拍——这一档查的是别的门禁查不到的那层：既有判据只能核「引的是不是同一个令牌」，核不到「令牌代换加继承加层序算完之后是不是同一个像素」。首跑 122/127 逐字一致，5 处已登记（三个模态两侧 fixture 不同构，`menubar` 与 `tour` 的 positioner 前景色两侧不同，是实测出来的真差异）。

- 3e84ef9: 共享箭头几何只匹配八类正式浮层的 arrow 部件，不再影响业务或其他组件的同名部件；保留原有四向、RTL 和描边优先级。

  五条几何规则显式限定八类消费者后，去注释压空白体积由 1023 增至 2038 字节；仅重登记这一文件的实际基线，逐皮肤 10% 增长检查仍保留。

- fe307e5: 新增两支语义令牌，把浮层时列的尺寸从各家皮肤的散值收成一处：`--xh-overlay-column-min-w`（3.5rem，成列排布的时 / 分 / 秒选项列的最小宽度）与 `--xh-overlay-column-item-h`（比小号控件行矮一档，列里一格的高度）；`time-picker` 与 `date-picker` 时列的 `column-min-w`、`time-picker` 的 `item-h` 这几条槽的默认值改读它们。`date-range-picker` 的 `range-separator-mx` 默认值先灌进私有槽再消费，对外契约不变。
- 7b187ca: **页面底与控件盒底分家，面的层次重新拉开。**

  **新增 `--xh-bg-page`。** 从前页面底与控件盒底共用 `--xh-bg-canvas`：浅色档它与 `--xh-bg-surface`、`--xh-bg-surface-raised` 三支同值，页面、面、抬起的面在一块白上分不出前后。`--xh-bg-page` 只管铺满视口的那一层，浅色档取 `neutral.50`、深色档取 `neutral.950`；`--xh-bg-canvas` 保持原值，全库三十余份皮肤的输入盒底色一处不动。布局根从 `--xh-bg-canvas` 改读 `--xh-bg-page`，它是全库唯一一处页面底的消费点。

  **深色档 `--xh-bg-surface-raised` 从 `neutral.800` 改到新增的半档 `neutral.750`。** 它原先与 `--xh-bg-subtle` 同值，抬起的面上那些底色取淡底的部件——通知卡里的动作钮、日志面板上的滚动钮——静态时明度差为 0，只有悬停才浮出来。新档的取值上界由深色档语气前景定：`neutral.750` 之上中性语气的字对这块面掉到 4.5 以下。

  `--xh-color-neutral-750` 与 `--xh-bg-page` 都是新增名字，既有令牌名一个没动。

- 51f2cbf: **修复**四处选择器写错或规则本身就是死的。

  **卡片与字段的后代规则会染到装进去的别家组件。** `card.css` 五条、`field.css` 一条后代选择器只写了部件名没带 scope，`[data-part='title']`、`[data-part='label']` 这两个名字全库分别有 15 件与 34 件在用，卡片身子里放一张告警、必填字段里放一个开关，别人的标题就跟着卡片换字号、别人的标签末尾凭空多出一颗必填星号。同文件里已经写全 scope 的那几条佐证这是漏写。卡片五条各补 `[data-scope='card']`；字段那条按 `fieldset.css` 的写法收成 `> [data-scope='field'][data-part='label']`。

  **分页的省略位被样式挡在指针之外。** 那条规则按「纯视觉占位、读屏已摘掉」写了 `pointer-events: none`，但连接层发的是一颗带 `aria-expanded` / `aria-haspopup` / 点击处理的真按钮——折进去的那几十页只有它一个入口，指针用户点不到，键盘 Tab 得进去却没有聚焦环。删掉吞事件与默认光标，把省略位并进可点观感组与聚焦环组，只保留压淡一档的字色。

  **对话框有一条永不命中的定位规则。** `[data-position='top']` 那条从来没生效过：连接层发的 `data-position` 是恒定的 `center`，对话框也没有对应的使用者入参。删掉该规则，属性照旧发；要按位置分档得先补入参，皮肤注释里写清楚了。

  **级联选择的半选横杠里有一条不起作用的字重。** 那个伪元素 `content` 是空的、横杠由 mask 画出，`font-weight` 改了没有任何反应，删掉。

- 2c2e470: **走马灯：自动播放补上暂停控件，并且不再在减弱动效档下自己起播。**

  `autoplay` 一直没有任何播放 / 暂停入口——解剖里没有这样的部件，`connect` 里的 `play` / `pause` / `resume` 三个方法从来没有被接出来过。自动翻页因此是一段用户按不住的动画：读得慢的人永远读不完一张，屏幕上的东西自己在动而没有出口。减弱动效那一路也只关掉了滑动过渡，翻页照走。

  - **新增**部件 `autoplay-trigger`（Vue 的 `XhCarouselAutoplayTrigger`，自定义元素的 `data-xh-part="autoplay-trigger"`）。它承载 `data-state="running" / "paused"`，名字随动作走（`translations.autoplayTriggerPlay` / `autoplayTriggerPause`），没配 `autoplay` 时转原生 `disabled`。
  - **新增** API 成员 `autoplayStopped`：只算「用户按停了没有」，不含悬停与焦点那两路一挪开就自己续上的临时按住。开关的名字与图形跟着它走，指针碰到按钮时不会翻面。
  - **变更**：减弱动效档下 `autoplay` 不再自己起播（停在 `idle`），要播由用户按下开关。偏好探测走 `@xihan-ui/motion` 的 `resolveMotionPreference`，应用级 `setMotionOverride` 同样管用。
  - **新增**字形令牌 `--xh-glyph-mark-play` / `--xh-glyph-mark-pause`，皮肤按 `data-state` 换字形。

  **差异视图：补上截断提示条，展开按钮补上可访问名。**

  超过 `maxLines` 的差异从尾部断开，界面上没有任何痕迹（`data-truncated` 全库无人消费），看着仍像一份完整差异——评审的人会以为自己看完了，而少掉的恰恰是没被审到的那几行。

  - **新增**部件 `truncation`（Vue 的 `XhDiffViewTruncation`，自定义元素的 `data-xh-part="truncation"`）与文案 `translations.truncated`，文字默认由组件自己填。
  - **新增** `DiffModel.truncatedLines` 与 API 的 `truncatedLines` / `truncationText`：砍掉多少行现在是模型的一部分。
  - **修正** `truncated` 的判据：上限改为按新旧两侧各自计，真砍掉了行才置位。旧判据用两侧行数之和，会在一行都没砍的情况下报「截断了」。
  - `DiffViewTranslations.expandGap` 由 `string` 放宽为 `string | ((count: number) => string)`。它是这个组件里唯一没有兜底的文案，此前展开按钮的可访问名就是按钮上那串「⋯ 12」，读屏念出来什么都没说明。给函数就能把折起来的行数念进名字；仍传字符串的调用方一行不用改——收两种形状是为了不把这一条修复变成整个锁步组的主版本。

- 4babe65: **按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 此前按压反馈只挂在 `:active` 上：键盘 Enter 按住、触屏手指按下时按钮纹丝不动，只有鼠标看得见缩放与换底（真源 §9.1 / §9.2）。

  - `@xihan-ui/core` 新增 `createPressTracker({ isPressed, onChange })`：把 Space / Enter 的 keydown / keyup / blur 与触屏的 pointerdown / pointerup / pointercancel 翻成「该按下 / 该松开」，不自存状态、不持有 DOM；长按重复键、输入法组合键、鼠标与笔一律不算。
  - `@xihan-ui/headless` 新增 `pressHandlers(service)` 与 `PressEvent` / `PressService`；`button` 与 `toggle` 的机器接上 `PRESS.START` / `PRESS.END`（context `pressed`），root 投影 `data-pressed`，禁用或进入加载途中按住的由机器自行松开。**破坏性：** `connectButton` 的第一个参数由 props 改为 `Service<ButtonSchema>`——按钮此前没有状态机，现在由 `buttonMachine` 承载按压通道，与其余跑机器的组件同构；`ButtonProps` 仍导出，等于 `ButtonSchema['props']`。
  - `@xihan-ui/styles` 的家族配方 `family/action-control.css` 与 `family/collection-item.css` 把按压选择器改为 `:is(:active, [data-pressed])`，特指度不变；组件皮肤自己写的 `:active` 规则由各组件迁移时改写。
  - 三个适配器的 `Button` 改跑 `buttonMachine`（公开 props 不变），键盘与触屏按住时呈现与指针一致的 0.97 缩放与 pressed 底；`Toggle` 同步接入。
  - `@xihan-ui/testing` 新增 `heldPress` / `heldPressIgnored` 共享步骤，button 与 toggle 套件三端核对按住中间帧。

  其余可按部件（`check-press-feedback` 的 PRESSABLE 表）已随各组件提交逐个接入；`family-backlog.json` 里的 `*:data-pressed` 总豁免随之删除，门禁 ⑧ 对没投影 `data-pressed` 的 getter 直接判红，不再留豁免入口。

- 2c2e470: **修复**两处「此刻按不动，但看不出来」。

  **只读态在四件上没有任何视觉。** calendar / checkbox / mention / radio-group 的连接层一直在发只读标记，皮肤一条都没消费：日格、方框、整行文字与单选条目仍是手型，只读这件事只剩读屏听得出来，看得见的人一路点下去毫无回应。四件各补一条 `cursor: default`——颜色与不透明度都不动，只读不是禁用，值改不动但内容照样要读得清、选得中。四条都排掉了禁用项：新规则的权重高过各自的禁用规则，不排就会把禁止号覆盖回默认光标。calendar 只收日视图那一档，粗粒度视图（月格、年格）点一格是往下钻一层，只读也照做，那些格子仍是按得动的按钮。mention 的候选被搬到浮层落点，根上的标记够不着，定位层因此也带上只读标记（`data-readonly`）。

  **ellipsis 把装得下的短文本也渲成按钮。** 开了 `expandable` 就无条件给 `role="button"` 加 `tabindex="0"` 加手型，可这段文字压根没被裁——按下去什么都不变。读屏念出一颗按不动的按钮，键盘用户 Tab 进去白停一站。改成量出被裁了才给这几件；铺开态无条件算数，那一档量测本就跳过，只按量测结果判会把收回去的入口一并撤掉。皮肤的手型同步收窄，`data-overflowing` 至此有人消费。

- 65f113a: **无层产物里 Action Control 三档字号在 reset 之后生效。** reset 层的每条选择器改由 `:where()` 包住，特指度压到 (0,0,0)。此前 `index.unlayered.css` 里 Family Recipe 的根规则（`[data-xh-action-control]`，(0,1,0)）排在 reset 段之前，而 reset 的 `font: inherit` 同为 (0,1,0)，靠源序把配方的 sm/md/lg 字号全压回 16px；有层版本靠层序不受影响。修法是压低 reset 而不是抬高配方，`check-layer-order` 门禁新增断言：reset 层剥去伪元素后必须整个由 `:where()` 包住，且无层产物里配方根规则仍排在 reset 之前。代价是无层模式下宿主的元素选择器 (0,0,1) 也压得过 reset，已写进文档站「皮肤与样式分层」。

  reset.css 去注释压空白后由 475 字节涨到 566 字节（+19%）：每条选择器多一层 `:where()`，伪元素两条无法放进 `:where()` 而拆成独立规则；`.size-limit.css.json` 只重落 reset.css 这一条。

- e547f3d: **可调容器与图片裁切的调整指示器改为贴住边框。** 新增 `--xh-stroke-strong` 描边令牌，两者的边缘短条统一使用稍粗的 3px 视觉厚度；图片裁切去掉中边指示器的额外描边并改用与可调容器一致的圆端造型，角部折角同步贴边。
- 49af6c3: **图片裁切的角部调整指示器改为与可调容器一致的单拐角圆弧。** 两个组件在键盘聚焦时直接高亮短条或折角本身，不再给透明命中盒绘制正方形或圆形外框。
- d360537: **四处「环内侧那块面不长在部件自己身上」的聚焦环改取面自己的前景色，键盘焦点重新看得见。**

  环往内收一个环宽，内侧紧挨着的是这块地方画出来的底。底不是元素自己那条 `background` 画的时候，默认环与那块底同族、贴上去读不出来。按 WCAG 2.2 SC 1.4.11 的非文本对比（3:1）逐档量过：

  - **分段控件**的选中段：段自己恒是透空的，底是压在它下面、与它同一块矩形的指示器。写了 `data-tone` 时那块底是语气实心色，默认环压上去 **1.08–2.89**（`info` 1.08、`warning` 深色 1.00）。环改取选中段自己那支前景色后 **4.83–7.80**。指示器是可选部件，作者没渲染它时选中段直接坐在轨道底上，那一档仍取默认环（**3.40 / 5.60**），两档由 `:has()` 分开。
  - **标签组**里实心标签上的摘除钮：叉自己透空，底是它外面那枚标签。默认环压上去无语气 **1.37 / 1.38**、写了 `data-tone` **2.10 / 2.89**；叉的字色本就是标签配那块底的前景色，环取它之后 **4.83–7.80**。
  - **标签组**的实心标签，两档误取 `currentColor` 收回默认环：置灰档的底已经换成静默色、字换成置灰色，环跟着字走只有 **2.36 / 1.94**，退回默认环是 **3.40 / 5.60**；没写语气的实心标签在轻档（悬停与键盘锚点）里底被换成中性灰而字仍是实心档那支浅字，环跟着字走 **1.26 / 1.91**，退回默认环是 **2.97 / 3.85**。写了语气的实心标签不受影响——它的底由语气那条规则压回实心色。
  - **就地编辑**的提交钮：底写了 `var(--xh-_tone, …)` 而字只写 `var(--xh-fg-on-brand)`，面接了语气、字没接，环取到的是一支与底不配对的色——`warning` 浅色 **2.70**、`neutral` 深色 **2.54**。字改接同一条语气链后 **4.83–7.80**。同一处的悬停与按下两档的底一并接上语气链（原先写了语气的提交钮一悬停就翻回品牌色），没写语气时三档都与改前逐值相同。

  `log` 的回到末尾钮与 `navigation-menu` 的展开档一并量过：前者的抬起面压默认环 **3.74 / 5.41**，后者六族 **3.07–6.17**，两处本就过线，皮肤里也写明环恒取 `--xh-ring-focus`，都不动。`image-viewer` 三颗钮的 `currentColor` 保留——那层深色纱压在使用者的图片上算不出稳定取值，而 `content` 把前景钉死在浅字上，白环对「纱 + 任意照片」最差 2.09、换默认环最差 1.29，回退是退步；那条规则上方说「面是实心的」的注释改成了纱的实情。

  新增浏览器态判据 `focus-ring-underlay-face.spec.ts`：环内侧那块面来自兄弟节点或祖先时逐档量比值，`focus-ring-face-contrast` 只顺着 `parentElement` 叠底色，看不见这两类。

- deb2f9b: **选择器选项的指针悬停只切换背景，不再绘制焦点描边。** 键盘 `focus-visible` 仍保留标准焦点环。
- 862df80: Select 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-icon-size`（§6.5）：浮层条目里勾选标记所在的标记盒 `item-indicator` 的缺省从 `--xh-icon-size` 改为 `--xh-control-indicator-size`（公开槽 `--xh-select-item-indicator-size` 不变，comfortable 16px / compact 14px；此前恒 20px，比指示符档大一圈），并在自己身上把 `--xh-icon-size` 改接到盒的尺——空标记盒里皮肤画的兜底勾、作者塞进标记盒的 XhIcon 从此都与盒同边长、随密度换档（勾选标记不是勾选格，不取 × 0.75，与 Listbox / Menu 族同口径；此前勾恒 20px）。条目上由家族下发的 `--xh-icon-size`（桥自 `--xh-select-icon-size`，md 20px）仍只管作者直接放进条目里的图标。
- 56ac906: 修正 Select / Listbox 选中项的普通字重引用，统一使用已声明的 `--xh-font-weight-regular`。
  此前误写未声明的 `--xh-font-weight-normal`，浏览器继承值掩盖了问题；令牌引用门禁明确验证此引用。
- 4ad7738: SideNav 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-side-nav-icon-size`（§6.5）：分支行尾展开方向指示符的 chevron 此前读家族按档下发到行的 `--xh-icon-size`（md 20px），指示符盒又没有自己的尺、被字形撑到 20×20，比同一栏里 16px 的指示符档大一圈，compact 下指示符档收到 14 时它仍是 20；`branch-indicator` 改为定尺盒并在自己身上把 `--xh-icon-size` 改接到新增公开槽 `--xh-side-nav-branch-indicator-size`（缺省 `--xh-control-indicator-size`，comfortable 16px / compact 14px，与 Tree / TreeSelect 的 branch-indicator 同款定尺盒）——兜底 chevron 与盒同边长，盒自己定尺、转 90° 时不再因随字形撑开而抖，作者塞进盒里的 XhIcon 从此与兜底字形同一把尺。`--xh-side-nav-icon-size` 仍只管作者放进行里的图标（随 size 档 sm / md / lg，缺省 md 20px 不变）。
- e5718f9: 让侧栏导航的字号随尺寸档位变化，并统一分组标题的内距与字重。
- 2860185: **修复**九份皮肤的尺寸档挡在使用者槽前面，改一处视觉改不动。

  **AI 族七份的档位直接给公开槽赋值。** `approval` / `code-view` / `diff-view` / `markdown-stream` / `message-feed` / `reasoning` / `tool-call` 的 `[data-size]` 三档写的是 `--xh-markdown-stream-font-size` 这类公开槽本身。自定义属性的解析先看元素自己身上有没有声明，档位声明就落在 root 上，作者在祖先上设的同名覆盖永远轮不到——改了没反应，也没有任何报错。三档改写 `--xh-_<组件>-*` 私有槽，缺省档写进 root 基础规则，公开槽只留在读处当首选。这一改还顺带把这批槽交给了 `check-size-ladder`（它认的是私有槽三档阶梯），门禁覆盖的阶梯从 496 组涨到 536 组。

  **`icon` 的 sm / lg 档与 light / bold 档直接写终值**，绕过 `--xh-icon-size` 与 `--xh-icon-stroke`。写了 `size` / `weight` 的那一枚从此不认外层下发的直径与描边：放进 `icon-wrapper` 里，底座换档而里面的图元原地不动。两档取值改成 `var(--xh-icon-size, <该档默认>)` 的形状，使用者槽排在档值前面。

  **`avatar` 的 sm / lg 档同样直接写终值**，绕过 `--xh-avatar-size` 与 `--xh-avatar-font-size`。`avatar-group` 正是靠下发这两个槽让一排头像齐平，组里但凡有一枚自己写了 `size="sm"`，整排就缺一个口——而这枚头像多大，作者在组上根本调不动。改法同 `icon`。单独摆的头像取不到这两个槽，仍按自己的档走。

  没有删名、没有改名，也没有新增公开槽；此前显式设过这些槽却不生效的写法，现在开始生效。

- 57f67c3: 排序把手没塞图标时的抓手在粗指针下保持 4×12 两条竖线：家族 icon 档热区规则落在同一个 `::after` 上，抓手此前被撑成 44×44、两条线跨出 24px 的把手；现在粗指针块把抓手钉回行内流，44×44 热区改由把手的 `::before` 扩，塞了图标的把手仍由家族的 `::after` 扩。

  sortable.css 体积从 4255 涨到 4689 字节，涨在粗指针块：抓手的复位与 `::before` 热区两条规则及其注释。

- e54562b: Steps 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-steps-icon-size`（§6.5）：走过的步里皮肤画的兜底对号此前读 root 的 `--xh-icon-size`（sm 16px，不随密度）；序号圆点现在在自己身上把 `--xh-icon-size` 改接到新增公开槽 `--xh-steps-indicator-mark-size`（缺省 `--xh-control-indicator-size`，comfortable 16px / compact 14px），兜底对号继续读它——comfortable 尺寸不变，compact 从 16px 收到 14px；作者塞进圆点里的 XhIcon 从此与兜底对号同一把尺、随密度换档。圆点本身仍走 space / control-h 的尺（md 32px），不随密度。`--xh-steps-icon-size` 仍只管作者放进标题 / 说明里的图标（sm 16px 不变）。
- cbc0ea5: 修正 Steps 纵向连接线继承横向最小宽度后被撑成粗胶囊的问题，纵向分隔线现在严格使用线宽尺寸。
- 418b713: 浅色主题公共焦点环由 brand-500 提升为 brand-600，保证它压在画布、实体面与浅灰高亮面上均达到 WCAG 3:1 非文本对比。
- 2cdfb9f: 开关在粗指针下的 44px 热区钉回轨道中心：皮肤细指针外扩 4px 的 `inset` 特指度高于家族的 50% 起点，家族的 100% 尺寸与 -50% 平移却照旧生效，热区此前以轨道左上角为中心、右半条开关落在热区之外；现在粗指针块把起点交还家族。
- 7b305d5: Table 全选 / 列显隐 / 行选择把手在「勾选且置灰」时聚焦环不再取 `currentColor`：置灰档的勾已藏成透明，环随之整个消失；`aria-disabled` 的把手仍能落焦，环退回默认那一支。
- 68e9c38: Table 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-table-icon-size`（§6.5）：排序箭头 `::after` 三态取新增公开槽 `--xh-table-sort-size`（缺省 `--xh-control-indicator-size`，comfortable 16px / compact 14px；此前恒 20px，比同一表头里 16px 的勾选框方盒与列头文字都大一圈）；三颗勾选框与展开箭头在自己身上把 `--xh-icon-size` 改接到方盒的尺——勾与半选杠按方盒边长 × 0.75（与 Checkbox / Tree 勾选格同比例，comfortable 12px / compact 10.5px；此前 20px 落在 14px 的盒里比盒还大），展开箭头的 chevron 与方盒同边长并钉住 `flex: none`；作者塞进这四颗把手里的 XhIcon 从此与兜底字形同一把尺。`--xh-table-icon-size` 仍只管作者放进单元格、列头与拖拽把手里的图标（md 20px 不变）。
- d360537: **滚动条滑块、按钮组实心段、表格与时间选择器的失效档：聚焦环重新看得见。**

  环往内收一个环宽，内侧紧挨着的是元素自己那块面。按 WCAG 2.2 SC 1.4.11 的非文本对比（3:1）逐档量过内侧这一对：

  - **滚动条**的滑块：开了 `focusable` 的滑块是真 Tab 位（`role=scrollbar`、`tabindex=0`），皮肤此前一条聚焦规则都没有，默认环压在中性实色的把手上——静息 **1.44 / 1.75**、悬停 **1.26 / 1.04**、拖拽 **2.08 / 1.82**。滑块里没有字，先给三档各配一支墨色（静息配正文墨、悬停与拖拽翻到反色那一支），环再取 `currentColor`：**7.63 / 4.53**、**4.73 / 7.63**、**7.80 / 13.36**。
  - **按钮组**里不自报形态的段：形态写在组上、段自己不带 `data-variant`，按钮那条按形态限定的 `currentColor` 规则匹配不上，段的面却已被组灌的 `--xh-button-bg` 染成实心语气底，六族浅深十二个组合 **1.00–2.89**。补一条按组限定的后代规则，**4.83–7.80**。
  - **表格**的全选与列可见性把手：失效档为了藏勾把 `color` 压成 `transparent`，`currentColor` 于是把整条环也变透明（实测 `outline-color: rgba(0, 0, 0, 0)`）。失效档退出这条规则、吃回默认环：**3.40 / 5.60**。
  - **时间选择器**的格子：`:focus-visible` 此前无条件写死 `outline: … solid currentColor`，通吃整个部件。没选中的格底是透空或淡底，失效格的前景是灰档（**2.59 / 2.28**）。规则收进选中那一档并改走 `--xh-_ring-color` 槽，其余各档吃默认环：**3.74 / 6.59**（透空）、**3.40 / 5.60**（淡底）。

  表格里选中且失效的行一并量过：`currentColor` 取到灰档前景 **1.75 / 1.00**（深色档环与底完全同色），改吃默认环后 **2.52 / 2.89**。这一档的面（`--xh-bg-subtle-active`）与默认环之间换环色换不出 3:1，过线要换这一档的面，先按判据钉住现状。

- 9a866b2: 将 Tabs 的默认视觉调整为浅色分段标签带，并保留 line 与 card 显式变体。
- 9b0092b: Tabs line 档页签接入 Collection Item 后，家族基础块的 `min-inline-size: 0` 让横排页签在 `flex: 1 1 0` 等分带宽排不下时被压到文字之下再横向顶出容器，标签带的 `flex-wrap` 永远等不到折行。页签皮肤收回 `min-inline-size: auto`，下限按文字算，排不下仍按原契约折行。
- a681d56: Tag 关闭钮按住且落焦时聚焦环改取叉自己的字色：按压面是从 `currentColor` 兑出的 22% 底，压在标签的淡底 / 选中面上把面往字色那头带一档，默认环在浅色档只剩 2.2–2.9:1；按压面正是从字色兑出来的，字色压在它上面六族语气与深浅两态都过 3:1。
- b3fa082: TagGroup 里标签的悬停 / 按下面带 `[data-tone]` 限定：没写语气的实心标签落在带 `data-tone` 的组里，按下不再读祖先的 `--xh-_tone-active` 跳成另一族；写了语气的淡底标签悬停 / 按下沿语气曲线走 20% / 28%，不再跳回中性阶梯丢掉语气。

  皮肤体积 5735 → 6448 字节：涨在语气标签悬停 / 按下的两条 [data-tone] 限定规则与实心按下拆成的缺省 / 语气两条。

- f051caf: 统一时间选择器浮层的磨砂材质、顶光与列分隔线，改用无缩放短位移动效，并隔离嵌套浮层的动画方向。
- a31b292: **时间范围选择器浮层四周留白与起止列组分隔留白统一。** 列组标题不再参与横向固有宽度计算，分钟列后不会残留一整列空白；右侧、底部和两组之间也使用同一档边距节奏。
- 754b1b6: Toast 关闭按钮改为行尾 flex 项，完整落在卡片内部并保持垂直居中，不再悬浮在右上外角；尺寸继续跟随统一的操作按钮密度令牌。折叠堆叠的后台条目会明确隐藏关闭入口，避免触屏环境同时露出多枚按钮。
- beab157: 修正 Toast 与 HeroUI 原实现的差异：全局服务改为测量真实高度的 Sonner 式堆叠，最新一条置前，后层按 12px 偏移和 0.05 比例收拢，鼠标或焦点进入后展开并暂停整组计时。

  进场从对应视口边缘落入折叠层级，退场沿相同方向移出；堆叠位移、缩放、高度和透明度使用独立过渡。

  Toast 独立皮肤增加真实堆叠、六个落位与三类进退场规则，压缩后体积由 11,650 字节调整为 14,487 字节。

  宽度覆盖槽由 `--xh-toast-w` 更名为 `--xh-toast-inline-size`，默认宽度对齐为 460px。

- 2a43393: 修复独立 Toast 被误判为折叠堆叠后台层、导致状态图标和文案全部透明的问题。折叠裁切现在只作用于已经登记 `data-stack-index` 的堆叠条目，单独渲染与文档示例保持完整可见。
- 9e47622: 将 Toolbar 默认调整为无外框工具带，并为 ToolbarItem 提供统一的工具按钮与选中态样式。Toolbar 皮肤体积增长来自新增默认、悬停、按下、选中、禁用和三档尺寸规则。
- d67fd51: 让 `showBackdrop=false` 同时关闭 Spotlight 的全屏暗幕，并保留目标高亮环。
- 2e3d7b2: **穿梭框在单向模式下将唯一的搬运按钮垂直居中。** 宽档不再把按钮停在两块面板之间的顶部。
- 1f0450e: 树选择浮层统一使用磨砂材质与四向短位移动效，输入框保持实体；同步空态、加载态和底部操作的材质前景与分隔线，修正窄空间下最小宽度越界及嵌套浮层方向继承。
- 63ee316: TreeSelect 面板里自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-tree-select-icon-size`（§6.5）：展开箭头把手 / 方向指示符的 chevron 与行尾的对号、半选杠此前读家族按档下发到行的 `--xh-icon-size`（md 20px），落在早已按 `--xh-control-indicator-size`（comfortable 16px / compact 14px）取尺的盒里比盒还大，把手盒也被字形撑到 20px；`branch-trigger`、`branch-indicator`、`item-indicator` 三个部件在自己身上把 `--xh-icon-size` 改接到盒的尺（`--xh-tree-select-branch-indicator-size` / `--xh-tree-select-item-indicator-size`，缺省 `--xh-control-indicator-size`）——兜底字形与盒同边长，作者塞进这三个盒里的 XhIcon 从此与兜底字形同一把尺。不新增公开槽；触发器上的箭头、清除钮的叉与 `--xh-tree-select-icon-size`（作者放进行里的图标，md 20px）不变。
- e164db0: TreeSelect 的单选、多选、叶子与分支统一使用末端对号表示选中，级联半选显示横线。
  选中正文不再变色或加粗，中性底仅表示悬停和键盘高亮；展开箭头与选择标记独立排布。

  补齐 Vue / React 自动分支结构的 `item-indicator`，Web Components 同一部件按最近叶子或分支接线。
  同步现有三端示例，级联示例使用正式标记部件，移除另外自绘的方框和重复状态判断。
  自定义分支结构应显式加入 `item-indicator`，未提供时不猜测或自动插入作者节点。

  皮肤体积（去注释、压空白）：前一提交源码 21941 字节，当前 21942 字节；登记基线 21941 → 21942，只更新本组件，10% 容差保持不变。

- b4d3fff: Tree 自绘的状态字形改按指示符档取尺，不再读只管作者图标的 `--xh-tree-icon-size`（§6.5）：展开箭头把手 / 方向指示符的盒、叶子的对号盒与没摆 `item-indicator` 的叶子由行盒补出的首格占位共用的 `--xh-tree-indicator-size` 缺省从家族按档下发的 `--xh-icon-size`（md 20px）改为 `--xh-control-indicator-size`（comfortable 16px / compact 14px；此前 20px 的 chevron 与对号比同一行里 16px 的勾选把手大一圈，compact 下勾选把手收到 14px 时它们仍是 20px）；`branch-trigger`、`branch-indicator`、`item-indicator` 三个部件在自己身上把 `--xh-icon-size` 改接到盒的尺——兜底 chevron 与对号与盒同边长，作者塞进这三个盒里的 XhIcon 从此与兜底字形同一把尺。勾选把手里的勾与半选杠仍按方盒 × 0.75（12px / 10.5px）、`node-drag-trigger` 不变；`--xh-tree-icon-size` 仍只管作者放进行里的图标（md 20px 不变）。
- 6958085: **无层产物把家族配方排到全部皮肤之前，InputGroup 内嵌字段不再叠出第二圈焦点环。** 只影响 `index.unlayered.css`；有层产物 `index.css` 不变。

  此前无层产物为了压住宿主正文规则把 Family Recipe 的根规则抬到与皮肤同档（`[data-scope]` 前缀），同档只剩源序竞争——而配方仍在第一个引用它的皮肤处才展开，排在它前面的皮肤对配方物理属性的直接覆盖（InputGroup 把内嵌字段外壳的 `outline` 置 `none`）就全被反超：聚焦输入框时组壳与内嵌 TextField 各画一圈环。有层产物里皮肤靠特指度高一级压过配方，不受影响，所以单测与门禁全绿。

  现在 `family/` 下全部配方紧随令牌、先于一切皮肤内联一次，皮肤自己的 `@import` 展开到已内联的文件时跳过；同档时皮肤靠源序胜出，与有层产物「皮肤高一级即胜」等价。`check-layer-order` 门禁新增断言：无层产物里每条家族根规则都必须排在第一条皮肤规则之前；另有 Chromium 用例把同一份 DOM 分别装进只引其中一份产物的 iframe，逐元素比对计算样式。

- 7c5a8f0: **无层产物把家族配方抬到 (0,2,0)。** `index.unlayered.css` 里 Family Recipe 的规则此前保持源文件的 (0,1,0)，只压得住宿主 `button` 这类裸标签 reset；宿主正文排版常见的 `.article a { color }`（(0,1,1)）会把直接写在 `<a>`、`<li>`、`<td>` 上的配方底色与字色压掉——文档站的 `.vp-doc a` 正是这样把侧栏导航、导航菜单的链接变回浏览器默认蓝，当前页的品牌淡底也一并丢失。

  生成器现在给家族根属性加 `[data-scope]` 前缀（角色节点必带该属性，命中范围不变），与皮肤选择器同档、且在产物里排在皮肤之前。有层产物靠层序竞争，不受影响。`check-layer-order` 按新形态核对配方根规则。

- 3b7a72b: Clipboard 与 DownloadTrigger 接入 Button 的 Action Control 视觉合同，同时保留中性工具面与各自的状态反馈。

  DownloadTrigger 的准备状态改为延迟显示且不改变按钮尺寸；Clipboard 的独立触发器与 Button 对齐高度、字号和胶囊圆角。

- 36bc286: **`virtualizer` 视口不再截住溢出滚动。** `[data-part='viewport']` 删除 `overscroll-behavior: contain`：它是页内结构容器，
  真源 §6.6 只把 `contain` 给浮层、模态 body 与粘底视口，其余保持 `auto`——长列表滚到尽头时剩余的滚动量交给外层，
  与 Table、Tree、Transfer 面板同一行为。滚动条照旧走 reset 层的原生细条，皮肤不再有任何滚动边界声明。
- eee8712: Dialog 的显式 `data-transparency="reduce"` 档现在与系统减少透明度一致，会撤掉 `blur` 变体的全屏遮罩模糊；默认透明档不变。
- Updated dependencies [fa08fb4]
- Updated dependencies [317b582]
- Updated dependencies [4b058b2]
- Updated dependencies [fb3b186]
- Updated dependencies [c859508]
- Updated dependencies [cbb844f]
- Updated dependencies [fa08fb4]
- Updated dependencies [38efe68]
- Updated dependencies [fa08fb4]
- Updated dependencies [390fa7a]
- Updated dependencies [ca8156d]
- Updated dependencies [c981f41]
- Updated dependencies [ccec02d]
- Updated dependencies [0f2072f]
- Updated dependencies [7b187ca]
- Updated dependencies [2c2e470]
- Updated dependencies [622a825]
- Updated dependencies [df18553]
- Updated dependencies [6b4c5d0]
- Updated dependencies [3990795]
- Updated dependencies [afcb45b]
- Updated dependencies [ab984e8]
- Updated dependencies [fa08fb4]
- Updated dependencies [a0ae74b]
- Updated dependencies [28bc87c]
- Updated dependencies [b07abfc]
- Updated dependencies [f247580]
- Updated dependencies [6135250]
- Updated dependencies [adb91cb]
- Updated dependencies [4e0d857]
- Updated dependencies [8bbead4]
- Updated dependencies [8a2d914]
- Updated dependencies [1f472ba]
- Updated dependencies [fe307e5]
- Updated dependencies [7b187ca]
- Updated dependencies [6b4c5d0]
- Updated dependencies [751645b]
- Updated dependencies [2c2e470]
- Updated dependencies [c894319]
- Updated dependencies [6d71d04]
- Updated dependencies [e547f3d]
- Updated dependencies [825d92e]
- Updated dependencies [825d92e]
- Updated dependencies [4c287eb]
- Updated dependencies [418b713]
- Updated dependencies [9a798f6]
- Updated dependencies [d51d182]
- Updated dependencies [1c827ba]
- Updated dependencies [db1fa77]
- Updated dependencies [9d0de29]
- Updated dependencies [80f9809]
  - @xihan-ui/tokens@2.0.0

## 1.1.0

### Minor Changes

- 442bdcc: **新增** `resizable` 组件：一块能拖着改尺寸的区域，八条边都能推，键盘也能推。

  `edges` 决定开放哪几条边（默认八向全开），没开放的边不显示把手。`minWidth` / `maxWidth` / `minHeight` / `maxHeight` 夹住范围，`aspectRatio` 锁宽高比，`step` 吸附到整数倍。两个回调分工明确：`onSizeChange` 拖动途中连着发，`onSizeChangeEnd` 收尾才发一次，存尺寸用后者。

  键盘按**屏幕方向**推：推东边时右键变宽、推西边时右键变窄，与拖动完全同义；Home / End 直接推到两端。`edge` 说的是逻辑方向——`e` 是行尾侧，从右往左排版时它落在屏幕左边，机器把逻辑边翻成物理边再算几何。

  **推西边与北边时容器的起点会动**，那段位移写成 root 的 `left` / `top`。皮肤已给 `position: relative`，开箱即对；把 root 改成 `static` 会让这两个方向只变尺寸不移位。只用东 / 南 / 东南三向时没有这个前提。

- 97482ad: **新增** `sortable` 组件：列表 / 网格拖拽排序，Vue 与 Web Components 两侧同时可用。

  落点走乐观投影——拖动过程中其余条目实时让位，松手即定，不是拖完才跳一下。判据是被拖项的中心越过了谁的中心，沿轴扫描一遇到没越过的就停，因此落点连续，不会从第 0 位跳到第 5 位。几何一律取按下那一刻的快照：让位之后布局已经变了，拿变形后的几何再算会自激振荡。

  **键盘路径默认开着且关不掉**：空格拾起、方向键挪一格、空格放下、Esc 取消，每一步都写进视觉隐藏的 `role=status` 区域。手柄带 `aria-roledescription="sortable"` 与 `aria-pressed`；拖动中的 Tab 被拦下，焦点一旦移走这一场就没有出口。

  `orientation` 三档：竖排、横排，以及换行网格用的 `both`（按最近中心判落点）。排版方向由首尾两项的先后推出，从右往左排时自动反向。按下之后要走够 `activationDistance`（默认 5px）才算拖动，因此条目本身仍然可以点击。拖到容器边缘会自动滚动，速度随入侵深度线性上升。

  `sort` 事件直接给出重排好的 `ids`，可以直接写回数据源，Vue 侧支持 `v-model:ids`。

  **新增** `@xihan-ui/pointer` 的拖放几何层：排序投影、让位计算、激活阈值与边缘滚动，全部是纯函数，零 DOM、零状态。

- 69577fa: **新增** `table` 的列拖拽排序：列上标了 `reorderable` 才产出拖拽把手，拖到别的列上换位；
  把手自占一个 Tab 位，方向键挪一格、Home / End 挪到可拖区段的首末。

  **新增** 两个部件 `column-drag-trigger` 与 `live-region`，一个属性名 `data-drop`（落点参照列，
  取值 `before` / `after`），以及 `api.draggableColumns` / `api.dropTarget` / `api.announcement`。

  **新增** `shared/drag.ts` 的沿轴落点判定（两档与三档）、插入下标折算与拖拽播报，
  `table.drag.ts` 的可拖列判定与列偏好下标折算。

  拖动中被拖的列**原地不动**，只落 `data-dragging`，落点由参照列上的一条指示线表示。
  不写位移是因为冻结列是 `position: sticky` 的后代，祖先一有 `transform` 就掉出吸附；
  斑马纹与行间线按 DOM 位置算，跟手让位会让它们在拖动全程与行错开。

  键盘不做拾起 / 放下两态：按一下就是一次已过守卫的完整提交，各自播报一句。
  列头里已经有排序把手与改宽把手两个 Tab 位，再加一套模态按键会让三者互相抢键。

  提交走既有的 `COLUMN_PREF.PATCH`，列序仍然只有一处在改。落点按列 id 认而不是按第几个，
  于是隐藏列自然留在原本的邻居旁边，前缀列压根不进落点快照。

  不可拖的列与冻结列都是**屏障**：可拖范围被它们切成段，只有最长的那一段能拖。
  跨过冻结列去落，落下来那一列会夹在两根钉住的列当中一起悬在滚动之上。

  播报区渲在 `root` **之外**。`root` 是 `role=grid`，它的子节点只能是 `row` 与 `rowgroup`，
  塞一个活动区域进去是 `aria-required-children`（critical）——不带 role 只留 `aria-live` 也一样，
  无角色但带全局 aria 属性的节点照样被算进 owned。两个适配器都自己把它渲成 `root` 的兄弟，
  使用者不必操心位置。

- 0a147ba: **新增** `table` 的列宽拖拽：列上标了 `resizable` 就产出改宽把手，拖动与方向键都能调。

  把手是可聚焦的分隔条，报出当前列宽与上下限；拖出表头仍跟手，系统收走指针时宽度退回按下那一刻。方向键一次 8px、按住 Shift 一次 40px，rtl 下左右两键对调而语义恒是「加宽 / 收窄」。列宽落在列偏好里，可以直接存起来下次还原。

  列宽写成百分比这类算不出 px 的写法时不认可改宽——读屏要一个数值，给不出就不该声称自己是可调控件，键盘本来也动不了它。

  **新增** `@xihan-ui/pointer` 的尺寸调整几何层：八向边推动加约束（上下限 / 宽高比 / 吸附步进 / 容器夹取），纯函数。`floating-panel` 的 `resizeFloatingPanel` 与 `clampFloatingPanelSize` 保留签名、内部改走它，行为不变。

- 889c54d: **新增** `table` 的行拖拽排序：`rowReorderable` 打开后整行都是拖动源，拖到别的行上换位；
  焦点在表体里时 `Alt` + 上下键挪一格。搬完发 `onRowMove`，载荷是 `{ id, parent, index, ids }`——
  搬到 `parent` 那一行底下的第 `index` 位（`parent` 为 `null` 即根层，`index` 已算过「先摘后插」），
  `ids` 是重排好的整份行序。

  **新增** 行上的 `data-row-draggable` 与 `data-drop`（`before` / `after` / `inside`），
  以及 `api.rowReorderDisabledReason`。

  行序**不进机器**：`rows` 是 prop，库没有一份自己的行序可写，所以只发意图、写回归宿主。
  这与列不同——列序有 `columnPreference.order` 这个受控通道。

  按下不等于拖动：整行可拖没有把手表明意图，要走够 5px 才算，在那之前界面上一点变化都没有。
  按在行内的输入框、按钮、链接一类控件上不起拖。

  **树形行照样搬**：`rows` 里有行声明了 `parentId` 就是树，落点分三档——拖到一行的上下两端
  是插在它前后（跟着换到那一层），拖到中段是落进它里面、认它当父。只有可展开或已经有子行的行
  给中段那一档，普通数据行不会因为被拖过就凭空长出一层。键盘上 `Alt` + 左右键改缩进层级：
  往里认上一个兄弟当爹，往外变成父行的下一个兄弟，rtl 下两键对调；平表下这两个键不归表格管。
  落进自己的后代会拖出一个环，库自己拦下，指示线也不画。新增 `allowRowDrop` 收业务侧的规矩。

  写回是**两件事**：按 `ids` 重排、再把那一行的 `parentId` 设成 `parent`。只做一件都对不上——
  表格的树是一份带 `parentId` 的扁平数组，结构由 `parentId` 定、同层次序由数组先后定。

  **两条降级**，各自有原因可读：排序链非空（拖出来的新序下一帧就被排序键覆盖）、
  宿主只渲了一段（量到的行数与数据行数对不上，窗口外的行没有矩形）。
  前一条渲染期就知道，后一条按下量过才知道。

  展开着的行按**整块**算：数据行连同紧跟它的详情行是一个落点。不并块的话，
  拖过一个展开着的行时指针明明还在这一块里，落点却因为跨进详情行那一段而反复跳。

  拖动中被拖的行**原地不动**：斑马纹按 `nth-of-type` 算、行间线按兄弟选择器算，
  两者认的都是 DOM 位置，跟手让位会让它们在拖动全程与行错开。

  **触屏不开拖**。纵向手势在按下那一刻就归了浏览器滚动，`touch-action` 事后改不回来；
  而把行设成 `touch-action: none` 又会让长表在行上完全滚不动。触屏那一路要等一个专门的
  拖动把手（不占 Tab 位，自带 `touch-action: none`），单独排。

  **修复** `table` 的键盘处理器不再吞掉落在可编辑单元格里的按键。表体的处理器挂在 `body` 上，
  单元格里输入框冒上来的按键也经过它：焦点先落过行再进输入框时，打空格会被当成
  「切换这一行的选中」、`Ctrl+A` 会全选行、方向键会换行。现在输入法组合中的按键与
  落在可编辑控件上的按键一律放行。

- 161ee77: **新增** `tabs` 的标签拖拽换位：`reorderable` 打开后整个标签都是拖动源，拖到别的标签上换位；
  焦点在标签带里时 `Alt` + **主轴**方向键挪一位。搬完发 `onTabMove`，载荷是
  `{ value, from, to, values }`，`values` 是重排好的整份标签序，可直接写回数据源。

  **新增** `live-region` 部件、标签上的 `data-dragging` / `data-drop` / `data-draggable`、
  `translations` prop，以及 `api.dropTarget` / `api.announcement`。

  轴向跟随 `orientation`：横排量横轴、竖排量纵轴，键盘也只认主轴那两个键——
  另一轴的方向键照常放行给页面滚动与读屏。横排 rtl 下左右对调。

  禁用的标签**仍进落点快照**。它自己挪不动，但别人可以落在它前后；把它摘掉的话，
  指针划过它那一段会没有落点，指示线一闪一闪。

  顺序不进机器：`collection` 是 prop，库没有一份自己的标签序可写，只发意图、写回归宿主。

  **重构** 一维重排的三件算术提到 `shared/drag`：`reorderFlat`、`flatMoveCommand`、
  `flatMoveIntentFromKey`（后者收轴向与文字方向两个参数）。`table` 的行拖拽改指共享实现，
  `moveRowIds` / `rowMoveCommand` / `rowMoveIntentFromKey` 三个行专用名字随之删除——
  它们与本批同属一个未发布的系列，现在合并是免费的。三个组件从此共用同一份重排语义，
  往后要改「先摘后插」这类算术只有一处。

- c0a190f: **新增** 三个拖动把手：`table` 的 `row-drag-trigger`、`tree` 的 `node-drag-trigger`、
  `tabs` 的 `tab-drag-trigger`。它们是**触屏那一路的入口**。

  三处的「整块起手」此前都不认触屏：纵向手势在按下那一刻就归了浏览器滚动，
  `touch-action` 事后改不回来；而把整行 / 整个节点设成 `touch-action: none`
  又会让长列表在上面完全滚不动。把手是一小块专门让出去的地方，自带 `touch-action: none`，
  手势从按下那一刻就是拖动的——同仓的 `column-resize-trigger` 早就是这个机制。

  把手**不占 Tab 位**（`aria-hidden` + `tabindex=-1`）：键盘那一路早就由容器上的
  `Alt` + 方向键承担，把手只是指针侧的第二个入口。整块起手（鼠标与笔）原样保留。

  按下即拖，不等激活距离——把手是专门的入口，意图无歧义。三处的 `*_DRAG.START` 事件
  因此多一个 `activate` 旗标，整块起手仍走激活距离那条路。

  把手常挂即可：开关关着或这一项拖不动时它自报 `data-disabled`、也不再让出滚动。
  按拖不拖得动来决定渲不渲，会让 DOM 结构随状态变。

  **修复** `tabs` 的 Web Components 侧：把手此前只收 `value`，漏了「没给 `collection`、
  禁用写在标记上」那条来路，于是标签禁着而把手仍判可拖。现在与 `trigger` 走同一条判定。

  抓手字形按「线的走向与能拖的方向垂直」转了向：列是横排所以画竖线，行与树节点是纵排
  所以画横线，`tabs` 跟着 `orientation` 两种都给。

- e14c407: **新增** `tree` 的节点拖拽搬家：`draggable` 打开后整个节点都是拖动源，拖到别的节点上换位或换父。
  焦点在树里时 `Alt` + 上下键在同层兄弟间挪，`Alt` + 左右键改缩进层级。
  搬完发 `onNodeMove`，载荷是 `{ value, parent, index }`——搬到哪个父下面的第几位，父为 `null` 即根层。

  **新增** `allowDrop` 与 `translations` 两个 prop、`live-region` 部件、
  节点上的 `data-dragging` / `data-drop` / `data-draggable`，以及 `api.dropTarget` / `api.announcement`。
  （`TreeTranslations` 以前只有类型没有对应的 prop，空接口所以一直没人发现，这次一并补上。）

  **落点三档**：`before` / `after` 插在同层，`inside` 落进这个分支。叶子上只有前后两档。
  「放进这个文件夹」和「插在这两行之间」是两件事，皮肤上必须一眼分得开。

  **分支量的是 `branch-control` 不是 `branch`**。后者是「这一行 + 整棵子层」的外壳，
  展开着的时候它的矩形把整棵子树都吞进去，落点会永远命中最外层那个分支，一辈子落不到子节点上。

  **自我后代判据用 `indexPath` 前缀，不沿 `parent` 上溯**。作者写出自引用的数据是被支持的
  （`collectNodes` 有祖先链防护），沿 `parent` 走会死循环；而同一个 value 挂在两个父下时
  `parent` 只留先出现的那一支，判出来的祖先也是错的。前缀比较 O(深度) 且天然无环。

  树的**状态树一行未改**：跟手的会话挂在根级效应上常驻，8 个既有事件原地不动。

  **修复** `@xihan-ui/pointer` 的 `createMultiPointerSession`：`onEnd` 现在带 `reason`
  （`pointerup` / `pointercancel`）。此前两者走同一条路、调用方分不开，于是**系统收走指针会被当成落定提交**。
  `carousel` 与 `image-viewer` 不受影响（它们本就把两者同等对待）。

  **修复** `tree` 的键盘处理器不再吞掉落在可编辑节点内容里的按键。处理器挂在 `tree` 部件上，
  节点里输入框冒上来的按键也经过它：打空格会被当成「选中这一项」，打字会被连打检索吃掉。
  `isEditableTarget` 从 `table` 提到 `shared/`——这是它的第二个消费者。

  **触屏不开拖**（与 table 行拖拽同因）。

  **改写** `tree/10-drag-move` 示例。它此前整个用 HTML5 `draggable` + `dataTransfer` 手写，
  只支持「拖进文件夹」、没有前后排序、落点提示是内联 style——正是 AntD 审计点名的那份样板。
  现在落点判定、三档落点、指示线、自我后代守卫全归库，宿主只留按 `{ value, parent, index }`
  搬数组这一段。

### Patch Changes

- 7ec6d92: **修复** 开着 `striped` 的表里，偶数行既不响应悬停也显不出选中——斑马纹那条把两档都盖掉了。
  祖先链照字面写出来是 0-8-0，比悬停的 0-6-0 与选中的 0-3-0 都高，源码位置又在它们之后，
  于是偶数行恒是斑马底。现在祖先链与 `:nth-of-type` 都收进 `:where()`，斑马纹落到与基础底
  同档，只压过基础底一条。

  行底色的先后自此是：基础底 < 斑马纹 < 选中 < 悬停 / 键盘锚点 < 换父落点。这条由一个跑在真实
  Chromium 上的用例钉住——五档各喂一个互不相同的颜色再量，jsdom 不跑级联，量不出谁盖过谁。

  - @xihan-ui/tokens@1.1.0

## 1.0.0

### Major Changes

- bc7eeed: 徽标收窄成「只做角标」，并补齐角标该有的能力。

  原先 badge 与 tag 是一对孪生：`variant` 三形态、`size` 三档、默认插槽放任意内容，
  连档位取值都逐个相同。两个组件做同一件事，使用者只能靠猜。

  现在 badge 只做一件事——挂在别的元素角上的一枚标记：

  ```vue
  <XhBadge :count="5" tone="danger" label="5 条未读">
    <XhButton>收件箱</XhButton>
  </XhBadge>
  ```

  - 解剖从单层 `root` 变成 `root`（锚点）+ `indicator`（角标），定位归组件自己管，
    不再要宿主手写 `position: relative` 与负偏移。
  - 新增 `placement`：`top-end`（默认）/ `top-start` / `bottom-end` / `bottom-start`，
    用逻辑属性写，rtl 下自动落到另一侧。
  - `size` 换的是圆点直径、两位数时的最小宽度与字号，不再是药丸那套内衬与行高。
  - Vue 侧另出 `XhBadgeRoot` / `XhBadgeIndicator`，要往角标里塞自定义内容时用它们。

  **破坏性**：删掉 `variant`；行内的状态药丸请改用 `tag`（`XhTagRoot` + `XhTagLabel`）。
  `data-size` 与 `data-tone` 从 `root` 挪到 `indicator`。

- 479bfcb: 级联选择皮肤全面翻修：展开路径改品牌淡底加粗、分支条目补右向箭头、列改内容撑宽定高、条目度量放宽。

  破坏性：4 个覆盖槽改名（不留旧名）：

  - `--xh-cascader-row-bg-highlight` → `--xh-cascader-row-bg-active`：展开路径的底色从中性灰二档改为品牌淡底（经 `--xh-_tone-subtle` 随语气、缺省 `--xh-bg-brand-subtle`）并加 `--xh-cascader-row-active-font-weight`（缺省 600）；悬停与键盘锚点保持中性灰轻档，两档靠色相分家。
  - `--xh-cascader-column-w` → `--xh-cascader-column-min-w`：列从定宽 11rem 改为内容撑宽 + 下限 7rem。
  - `--xh-cascader-column-max-h` → `--xh-cascader-column-h`：列高从内容撑（上限 16rem）改为定高 11.25rem，切换展开路径浮层不再上下跳动。
  - `--xh-cascader-indicator-size` → `--xh-cascader-item-indicator-size`：与既有 `--xh-cascader-item-indicator-fg` 配对，避免与触发器 indicator 部件混名。

  新增：

  - 分支条目行尾自动画右向小箭头（`data-branch`，纯 CSS，`--xh-cascader-branch-arrow-size/-fg/-stroke` 可覆写，rtl 自动翻转，禁用同灰）。
  - 触发器箭头与勾选标记的 `:empty` 兜底字形（▾ / ✓），与 select 同约定；级联勾选半选态皮肤自绘横杠。
  - 条目 padding 放宽为 6px / 12px（行内走 `--xh-control-px-md`，紧凑密度自动收窄）、上限宽 25rem、背景与文字色过渡。
  - 搜索候选与列内条目共用同一套行度量槽；搜索视图规则移入 `xihan.components` 层。
  - 三处聚焦环改固定 `--xh-ring-focus`（不再随语气）；浮层入场横移 rtl 翻转。

- bc65cb7: 首个公开版本：框架无关的 UI 基座。

  自研薄 FSM 内核 + headless（anatomy / machine / connect）+ 设计令牌与主题运行时 + 样式层，
  102 个组件在 Vue 与 Web Components 两套适配器上共用同一份内核，跨适配器一致性套件与
  真实 Chromium 里的无障碍扫描、浮层定位契约全绿。

  浮层定位、虚拟滚动、Web Components 响应式基类、代码着色、流式 Markdown 均为自研，
  运行时不带第三方依赖。

- 84b1aa3: 新增 Icon 原语，`@xihan-ui/icons` 整包重写为首方图标集。

  旧的 `@xihan-ui/icons` 是 27 个第三方图标集的聚合（约四万个图标），已整体移除并在
  npm 上弃用。新包只收自研图标，第一批 29 个覆盖组件库自用的全部语义，24×24 单色
  描边、`stroke-width` 2。

  用法：

  - `@xihan-ui/kernel` 导出 `IconRecord` / `IconNode` / `IconTag` 三个类型
  - `@xihan-ui/headless` 导出 `connectIcon` / `iconAnatomy` / `iconMeta` / `iconKeyboard`
  - `@xihan-ui/vue` 导出 `XhIcon`，`@xihan-ui/web-components` 注册 `<xh-icon>`
  - `@xihan-ui/styles` 新增 `icon.css`，`data-size` 与 `data-weight` 各三档

  图标记录是结构化节点数组而不是 SVG 字符串，渲染端逐节点建元素，运行期不经 HTML
  解析器。图标数据传的是记录本身而不是名字：按名字查表要把全表静态引进来，摇树会
  整个失效。

  WC 侧要在 `<svg data-xh-part="root">` 里留一个空的 `<g data-xh-part="glyph"></g>`
  作为授权点，元素只在它内部铺图元；不留这个空壳就一个节点都不动，手写内联 SVG 与
  `<use>` 引用两种写法因此都还能用。`icon` 是对象，只能走 property 传，属性里写不出来。

  可及名字两态互斥：`label` 给了非空白文本就输出 `role="img"` 与 `aria-label`，否则
  输出 `aria-hidden="true"`。只有图标的按钮请把名字写在按钮上而不是图标上，两处都写
  读屏会念两遍。

- 9d7d703: 下拉/列表族条目度量与高亮档位统一（select / menu / listbox / combobox / popselect / tree / tree-select，向级联选择的两档制看齐）。

  破坏性：7 个覆盖槽改名或移除（不留旧名）：

  - `--xh-select-item-bg-highlight` → `--xh-select-item-bg-hover`、`--xh-combobox-item-bg-highlight` → `--xh-combobox-item-bg-hover`、`--xh-popselect-item-bg-highlight` → `--xh-popselect-item-bg-hover`、`--xh-menu-item-bg-highlight` → `--xh-menu-item-bg-hover`：悬停与键盘锚点统一为中性灰轻档（缺省 `--xh-bg-subtle`），不再随语气换色。
  - `--xh-listbox-item-bg-highlight`、`--xh-tree-row-bg-highlight`、`--xh-tree-select-row-bg-highlight` 移除：键盘锚点并入轻档，与悬停共用 `-bg-hover` 一个槽（键盘位置由聚焦环表达，选中仍是文字色 + ✓ 标记，互不挤占）。

  新增（menu）：

  - 打开子菜单的触发条目升为强档：品牌淡底（经 `--xh-_tone-subtle` 随语气、缺省 `--xh-bg-brand-subtle`）+ 600 字重，新增 `--xh-menu-item-bg-active` 与 `--xh-menu-item-active-font-weight` 槽；两档靠色相分家，与级联选择的展开路径同一套词汇。
  - 条目行高从 none 抬到 normal，新增 `--xh-menu-item-leading` 槽。

  度量：

  - 七家条目 padding 统一为 6px / 12px（`--xh-space-1_5` / `--xh-control-px-md`，行内随密度轴收窄），底色与文字色补 micro 过渡。
  - menu 尺寸阶梯重排：sm = `--xh-space-1` / `--xh-control-px-sm`，lg = `--xh-space-2` / `--xh-control-px-lg`。
  - listbox / combobox 分组标题行内内缩跟随条目改为 `--xh-control-px-md`，与条目文字保持同一条竖线。

- f7d53de: 列表族条目度量与高亮档位统一第二批（context-menu / menubar / mention / time-picker / transfer / table），与 select 族同一套两档词汇。

  破坏性：9 个覆盖槽改名或移除（不留旧名）：

  - `--xh-context-menu-item-bg-highlight` → `--xh-context-menu-item-bg-hover`、`--xh-menubar-item-bg-highlight` → `--xh-menubar-item-bg-hover`、`--xh-transfer-item-bg-highlight` → `--xh-transfer-item-bg-hover`、`--xh-table-row-bg-highlight` → `--xh-table-row-bg-hover`、`--xh-time-picker-item-bg-highlight` → `--xh-time-picker-item-bg-hover`：悬停与键盘锚点统一为中性灰轻档（缺省 `--xh-bg-subtle`），不再随语气换色。
  - `--xh-time-picker-item-bg-checked-highlight` → `--xh-time-picker-item-bg-checked-hover`：同一档位词汇；选中格保持品牌实底不变。
  - `--xh-mention-item-bg-highlight` → `--xh-mention-item-bg-hover`，`--xh-mention-item-fg-highlight` 与 `--xh-mention-item-font-weight-highlight` 移除：候选锚点回归纯轻档底色，不再借选中的文字色与字重。

  新增：

  - context-menu 打开子菜单的触发条目升强档：品牌淡底（经 `--xh-_tone-subtle` 随语气、缺省 `--xh-bg-brand-subtle`）+ 600 字重，新增 `--xh-context-menu-item-bg-active` 与 `--xh-context-menu-item-active-font-weight`。
  - menubar 展开着的菜单 trigger 升强档：`--xh-menubar-trigger-bg-active` 槽名不变、缺省从中性灰改为品牌淡底；不加字重（横排加粗会推挤相邻触发器）。悬停新增轻档槽 `--xh-menubar-trigger-bg-hover`。
  - 条目行高从 none 抬到 normal，新增 `--xh-context-menu-item-leading` 与 `--xh-menubar-item-leading`。

  度量：

  - context-menu / menubar / mention / transfer 条目与 time-picker 格 padding 统一 6px / 12px（`--xh-space-1_5` / `--xh-control-px-md`，行内随密度轴收窄），底色文字色补 micro 过渡；context-menu / menubar 尺寸阶梯重排（sm = `--xh-space-1` / `--xh-control-px-sm`，lg = `--xh-space-2` / `--xh-control-px-lg`）。
  - time-picker 格保持紧排行高：居中的单个数字格没有截断层，列内多露几格。
  - transfer 面板头与搜索框行内内缩跟随条目改 `--xh-control-px-md`，勾选列与全选框保持同一条竖线。
  - table 只统一行高亮档位词汇；行选中保持底色表达（宽行扫读依赖底色通道），单元格度量不动。
  - tags-input 不入组：其 data-highlighted 是退格/方向键的操作光标（整颗反白表示即将删除或编辑），语义与列表导航高亮不同，胶囊度量亦非列表行。

- d43624c: 把跨组件已经分叉的名字统一回一套。part 名与 prop 名在 1.0 之后就是公开 API——皮肤按
  `data-part` 选择、使用者按 prop 名调用——改名一律是破坏性变更，所以趁 alpha 一次改完。

  **time-picker 的列表条目由 `option` 改叫 `item`。** 另外 32 个组件的列表条目都叫 `item`，
  只有它是 `option`。ARIA 角色仍是 `role="option"`（那是角色不是部件名），列里的候选值集合
  `TimePickerColumn.options` 也不动（那是数据不是部件）。

  迁移点：

  - `data-part='option'` 改成 `data-part='item'`；皮肤覆盖槽 `--xh-time-picker-option-*`
    改成 `--xh-time-picker-item-*`（共 10 个）。
  - Vue 组件 `XhTimePickerOption` 改名 `XhTimePickerItem`。
  - WC 的 `::part(option)` 改成 `::part(item)`。
  - headless 导出：`timePickerOptionQuery` → `timePickerItemQuery`、`findTimePickerOption` →
    `findTimePickerItem`、`timePickerOptionValue` → `timePickerItemValue`、
    `TimePickerOptionProps` → `TimePickerItemProps`。
  - `TimePickerApi` 上：`getOptionProps` → `getItemProps`、`isOptionSelected` → `isItemSelected`、
    `isOptionDisabled` → `isItemDisabled`、`focusedOption` → `focusedItem`。
  - 键盘规格号 `time-picker.kbd.option-*` → `time-picker.kbd.item-*`。

  **transfer 的数据入口由 `items` 改叫 `collection`。** 另外 17 个集合组件的数据入口都叫
  `collection`。单条的类型名 `TransferItem`、某一侧看得见的条目 `visibleItems`、纯函数
  `transferVisibleItems` 都不动——它们说的是「条目」，不是「数据入口」。

  迁移点：

  - Vue：`<XhTransferRoot :items="…">` 改成 `:collection="…"`。
  - WC：`el.items = […]` 改成 `el.collection = […]`（这个入口表达不成属性，本来就只能走 property）。
  - `TransferApi.items` → `TransferApi.collection`。

  **checkbox-group 的组内子部件对齐 radio-group。** 同一语义两套名字：checkbox-group 用
  `item-control` / `item-hidden-input`，radio-group 用 `indicator` / `hidden-input`。裸名是全仓
  多数（`indicator` 13 处、`hidden-input` 10 处），checkbox-group 随大流。`item-text` 不动
  （21 份解剖都这么叫）。

  迁移点：

  - `data-part='item-control'` → `'indicator'`，`data-part='item-hidden-input'` → `'hidden-input'`。
  - 皮肤覆盖槽 `--xh-checkbox-group-control-*` → `--xh-checkbox-group-indicator-*`（10 个），
    与 radio-group 的 `--xh-radio-group-indicator-*` 对齐。
  - `CheckboxGroupApi.getItemControlProps` → `getIndicatorProps`，
    `getItemHiddenInputProps` → `getHiddenInputProps`（两个名字 radio-group 早就在用）。
  - Vue 组件 `XhCheckboxGroupItemControl` → `XhCheckboxGroupIndicator`。

  **table 的空态部件由 `empty-state` 改叫 `empty`。** 部件名不该与组件的 scope 名撞车——
  `empty-state` 是一个独立组件的 `data-scope`，再拿它当 table 的部件名，写皮肤时
  `[data-part='empty-state']` 与 `[data-scope='empty-state']` 混在一起读不出谁是谁。
  combobox 早就叫 `empty`。独立的 `empty-state` 组件本身不动。

  迁移点：

  - `data-part='empty-state'` → `'empty'`。
  - `TableApi.getEmptyStateProps` → `getEmptyProps`。
  - Vue 组件 `XhTableEmptyState` → `XhTableEmpty`（`XhEmptyState*` 那一族是另一个组件，不变）。
  - WC 的 `::part(empty-state)` → `::part(empty)`。

  **transfer 的 `onSelectedChange` 改叫 `onSelectionChange`。** table 与 tree 都叫
  `onSelectionChange`。

  - `TransferSelectedChangeDetails` → `TransferSelectionChangeDetails`。
  - Vue 事件 `@selected-change` → `@selection-change`；WC 的 `selected-change` 事件同改。

  **`size` 不再一名两用。** 三轴里的 `size` 是语气枚举，而 qr-code 的 `size` 是像素数值、
  splitter 的 `size` 是百分比数组——两者占着同一个名字却是完全不同的类型，使用者写
  `size="md"` 得到的是静默的错。

  - qr-code：`size` → `pixelSize`（WC 属性 `size` → `pixel-size`）。中心 logo 挖空区的
    `QrCodeLogoArea.size` 是模块数标量，不动。
  - splitter：数组值的一律改复数——`size` → `sizes`、`defaultSize` → `defaultSizes`、
    `onSizeChange` → `onSizesChange`、`onSizeChangeEnd` → `onSizesChangeEnd`、载荷字段
    `{ size }` → `{ sizes }`、机器事件 `SIZE.SET` → `SIZES.SET`、Vue 的 `v-model:size` →
    `v-model:sizes`、WC 属性 `size` → `sizes`。标量的不动：每块面板的 `collapsedSize`、
    `BOUNDARY.SET` 的 `size`、`setPanelSize`、`SplitterPanelState.size`。

  **「移除列表里的一项」统一叫 `item-delete-trigger`。** 同一个动作四个组件三个名字：tags-input
  与 file-upload 已经是 `item-delete-trigger`，select 叫 `tag-remove`、dynamic-input 叫
  `remove-trigger`。tag 的 `close-trigger` 不动——它关的是标签自身，不是列表里的一项。

  迁移点：

  - select：`data-part='tag-remove'` → `'item-delete-trigger'`；皮肤覆盖槽
    `--xh-select-tag-remove-*` → `--xh-select-item-delete-*`（6 个）；
    `SelectApi.getTagRemoveProps` → `getItemDeleteTriggerProps`；Vue 组件 `XhSelectTagRemove` →
    `XhSelectItemDeleteTrigger`；WC 的 `::part(tag-remove)` → `::part(item-delete-trigger)`。
  - dynamic-input：`data-part='remove-trigger'` → `'item-delete-trigger'`；皮肤覆盖槽
    `--xh-dynamic-input-remove-fg-hover` → `--xh-dynamic-input-item-delete-fg-hover`；
    `DynamicInputApi.getRemoveTriggerProps` → `getItemDeleteTriggerProps`；Vue 组件
    `XhDynamicInputRemoveTrigger` → `XhDynamicInputItemDeleteTrigger`；WC 的
    `::part(remove-trigger)` → `::part(item-delete-trigger)`。

  **这枚按钮的文案键统一叫 `deleteItem`。** 四个组件的签名各不相同，统一的是命名形态。

  - select：`SelectTranslations.removeTag: string` → `deleteItem: (label: string) => string`，
    由定值串改成接收标签文本的函数，缺省 `Delete ${label}`。
  - tags-input：`deleteTagTrigger` → `deleteItem`。
  - file-upload：`deleteFile` → `deleteItem`；`FileUploadApi.deleteFile` 方法与 `FILE.DELETE`
    事件名不动——那是动作不是文案。
  - dynamic-input：`removeTrigger` → `deleteItem`。

  **没有合并的一处，记在这里免得后人重新翻案。** 就绪度审计说 pin-input 的 `onValueComplete`、
  editable 的 `onValueCommit`、slider 的 `onValueChangeEnd` 是「三个名字表达同一语义」，
  逐条读过源码后判定不成立：`onValueComplete` 是「每格都填满的那一刻」（值的形状谓词），
  `onValueCommit` 是「提交那一刻」（用户显式确认），`onValueChangeEnd` 是「一次操作结束」
  （手势结束，splitter 的 `onSizesChangeEnd` 用的是同一套）。三件不同的事，合并会让 API 更差。

- 3c033ca: 通知按卡片重排：左侧类型字形、右上角关闭钮、两列网格。

  它的皮肤是从旧的 toast 卡片逐字搬来的，搬完没人按「通知该长什么样」审过一遍，
  于是留下三处硬伤：

  - **叉掉到了卡片左下方**。`item` 是竖排 flex，而叉上写着
    `align-self: flex-start` + `margin-inline-start: auto`——交叉轴上的 auto 外边距
    会让对齐属性整条失效（flexbox §9.6），`align-self` 那行一点作用都没有，
    叉成了正文下面的第三行。实测它落在距卡片顶 55px 处，卡片因此高出一截。
    三家参考实现（Ant Design / Element Plus / Naive UI）都是绝对定位钉在右上角内衬处。
  - **组件路径下一个类型指示物都没有**。徽记只由服务档的默认模板画，
    12 份示例与所有 Web Components 使用者拿到的卡片，语气全靠起始侧那条 4px 色条承载，
    而它压在卡片底上只有 1.9–2.8:1，`loading` 与 `info` 除颜色外完全同形。
  - **字号比轻提示还小一档**（13px），标题与说明只差 7.7%，两层文字挤成一片。

  现在：

  - 新增 `item-indicator` 部件。作者留空即由皮肤按 `data-type` 画一枚兜底字形
    （info / success / warning / error 各一枚，`loading` 给转圈），
    颜色取 `--xh-_tone-fg`——与 alert 的状态图标同档，压在卡片底上十二组最低 4.08:1。
  - **两列网格**：左列字形、右列标题与说明；叉绝对定位钉在右上角，标题自动让位
    （写法照 dialog / drawer）。起始侧那条语气色条随之删除——三家都没有，
    语气改由字形承载。
  - 卡片宽 320 → 384px（`--xh-overlay-max-w-lg`，与 Ant Design 同值），
    内衬四边 16px，字号回到正文档 14px。
  - 服务档的默认模板改成四个节点平铺（不再套一层皮肤够不着的行容器），
    说明部件恒渲染——`aria-describedby` 是无条件发的，节点缺席就成了悬空引用。
  - 地标 `role="region"` 从 `root` 搬到 `group`。root 是 `display: contents` 的作用域包装，
    量出来 0×0，地标挂在它身上跳过去落不到任何看得见的地方；那一摞才是真盒子。

  顺带补上三处从来没有门禁看管的地方：`check-elevation-role`、`check-press-feedback`、
  `check-clear-trigger` 三份名单都没登记过 notification，眼下合规纯属巧合。

  **破坏性**：删掉 `--xh-notification-accent` 与 `--xh-notification-accent-width`
  两个覆盖槽（色条没了）。另有几个槽的默认值变了：`--xh-notification-w`（20rem → 24rem）、
  `--xh-notification-py` / `-px`（12/16 → 16/16）、`--xh-notification-font-size`（13 → 14）、
  `--xh-notification-gap` 的语义从「行距」改为「图标与正文的列距」（行距另开
  `--xh-notification-row-gap`）。地标从 root 挪到 group，按 `root[role=region]` 写过
  自动化断言的要跟着改。

- 516bd46: 浮层搬进单一落点，层号与背景失活跟着改口。

  ## 浮层不再原地渲染

  此前 20 个带 positioner 的浮层里只有 dialog / drawer / image-viewer 搬走，其余 16 个
  留在触发器旁边。坐标一直是对的（定位引擎特意处理了「祖先抢走包含块」），坏的是层叠序：
  宿主应用的祖先只要建了层叠上下文——`transform` / `translate` / `scale` / `filter` /
  `backdrop-filter` / `opacity` 小于 1 / `contain` / `will-change` / `position: sticky` /
  定位元素带 `z-index` / `isolation`——浮层的层号就退化成那个上下文里的局部序号，被任何
  上层兄弟盖住。这是库无法从自身约束的：宿主怎么写 DOM 不归库管。

  kernel 新增 `ensurePortalRoot(doc)`，在 body 末尾维护单一 `#xh-portal-root`，
  `RuntimeConfig.portalContainer` 的默认值指向它。Vue 侧 19 个浮层的 positioner
  （tour 连同 backdrop 与 spotlight）一律 Teleport 过去。落点自身一条样式都不写——
  子元素全是 `position: fixed`，不占布局，而任何 `position` / `transform` / `contain` /
  `isolation` 都会平白建出新的层叠上下文，正是要躲的东西。

  WC 适配器是 Light DOM，解剖契约就是「作者写在哪就在哪」，搬不动。改为在浮层展开时
  沿祖先链探一次层叠上下文，命中就投一条诊断，指名是哪个祖先的哪条属性。

  **破坏性**：浮层的 DOM 位置变了。按 `wrapper.querySelector` 之类以挂载根为基准取浮层
  节点的代码要改从 `document` 取。

  ## 遮罩式浮层并到同一档层号

  `--xh-z-drawer` 删除，`--xh-layer-drawer` 与 `--xh-layer-modal` 解析到同一个值。

  原先抽屉 1000 低于对话框 1100，而两者都在同一个栈上下文里，纯靠数字定序：从对话框里
  拉出抽屉时，抽屉连同自己的遮罩一起沉在对话框遮罩底下，用户只看到画面又暗一层、什么都
  没出现，而焦点已经陷进看不见的面板。反方向是对的，所以这是只在一个方向上炸的组合。
  并档之后先后交给 portal 顺序决定，与对话框套对话框的现有行为一致。

  **破坏性**：`--xh-z-drawer` 这个名字没有了。改用 `--xh-layer-drawer`。

  ## 背景失活改走祖先链

  `hideOutside` 此前只遍历 body 直接子元素，判据是「这个子元素包含 target 就整块放行」。
  WC 适配器的浮层长在作者写它的位置，应用只要有一层根容器（`#app` 之类）就会因包含浮层
  被整块豁免——模态对话框身后的整个应用对读屏依然完全可遍历，不认外点关闭的
  `alertdialog` 更是完全可点。改成沿每个 target 到 body 的祖先链逐层罩住其余兄弟。

  `data-xh-inert-exempt` 的语义随之扩大：带标记的元素及其后代不被罩住，**其祖先只递归、
  不整块罩住**。通知队列因此在任意嵌套深度都能保持可点，外点判定也一并豁免（点通知不再
  把模态关掉）。

  ## 其余

  - `--xh-editable-preview-line-height` 删除，改用 `--xh-editable-preview-min-h`：预览态
    原先拿行高冒充高度，实测比同组件的编辑态高 2px，切换时跳一下。
  - tooltip 与 navigation-menu 入层栈，Escape 不再连它们下面的对话框一起关掉。
  - 定位引擎新增 size 中间件，回报可用空间与锚点宽度；菜单族补上高度上限与内部滚动。
  - 包含块判定补齐 `translate` / `rotate` / `scale` 独立属性与 `backdrop-filter`。
  - 滚动锁补滚动条补偿与滚动根探测。

- 1590d92: Select 的盒不再自带宽度上限，框宽交回布局；视觉行为变更。

  `[data-part='control']` 上原有一条 `max-inline-size`，兜底取 `--xh-overlay-max-w`（20rem / 320px）。
  浮层的宽度预算被搬到了在流内排布的表单控件上：格子一旦宽过 320px，select 就停在 320px 不再跟着长——
  两列栅格的弹窗里，左边的 select 比右边的数字输入框窄一截。硬上限也不是必需的：`value-text` 与
  `trigger` 各有 `min-inline-size: 0` 配省略号，长值撑不破盒。

  同族的 cascader / tree-select / popselect / color-picker，以及 text-field / number-field，
  control 上都没有上限，select 是唯一一家。这条删掉之后全族同形。

  破坏性变更：**覆盖槽 `--xh-select-control-max-w` 随之移除**。此前写过
  `--xh-select-control-max-w: 24rem` 的，改在自己的布局层给 select 的根或所在格子写宽度
  （`inline-size` / `max-inline-size`），效果一致且对同族其余控件通用。

  `check-family-parity` 的下拉族 control 名单补上 `max-inline-size`：往后任何一家单独给盒封顶都会被拦下。
  公开面基线（`tooling/public-surface.json`）需随本次改动跑一次 `pnpm surface:update`。

- 934e126: 每份皮肤现在都能单独引入了，动画不再指望别处的文件在场。

  `styles` 的 exports 逐组件铺了一百多条子入口，`import '@xihan-ui/styles/dialog.css'` 是受支持的用法。但 `xh-fade-in`、`xh-fade-out`、`xh-spin`、`xh-dialog-in/out` 这五支关键帧住在 `motion.css` 里，被 15 份别的皮肤引用——单独引入其中任何一份，动画名都查不到。`@keyframes` 的名字查找只认「文档里有没有这个名字」，查不到既不报错也不降级，看上去就是「这个组件没做动效」。`spinner.css` / `switch.css` / `popconfirm.css` 三处注释早就写明了这条理由，只是这五支没照办。

  现在每份皮肤都自带它用到的关键帧。`motion.css` 因此空了，**已删除，`./motion.css` 子入口一并移除**——如果你显式引过它，删掉那行即可，它提供的关键帧已经跟着各组件走了。

  新增 `check-keyframe-refs` 门禁盯住三件事：引用的动画名必须在同一份皮肤里定义、同名的多份定义必须逐字一致（名字是全局的，两份不同内容会互相覆盖）、关键帧必须写在 `@layer xihan.motion` 里（使用者按层覆盖时才盖得住）。

  产物只大了 60 B：重复的关键帧对 gzip 几乎是免费的。

- f4d3708: 轻提示改成短消息的样子：顶部居中、宽度包着内容、一行图标加一句话。

  上一版把 toast 从通知卡片收窄成操作反馈时只动了结构，皮肤还是照着卡片那份抄的——
  定宽 320px、竖排、起始侧一条 4px 语气色条、行尾一颗叉。一句「已保存」于是撑成一个
  方块，右边留着一大片空白，看着仍然像一则公告。

  现在它是这样：

  ```
  ┌──────────────────┐
  │  ✓  已保存        │   ← 贴着文字收缩，顶部居中
  └──────────────────┘
  ```

  - **收缩包裹**：`inline-size` 的默认值从 `--xh-overlay-max-w` 改成 `auto`，
    上限压在 `min(48rem, 100%)`，长文案在上限处换行、仍然居中。
  - **单行横排**：`flex-direction` 去掉，`align-items: center`；标题吃掉剩余宽度，
    操作钮与叉自动落到行尾（两者不再 `align-self: flex-start`）。
  - **矮一档**：纵内衬从面档（12px）换成控件档 `--xh-field-py`（8px），条子高 39px，
    与 Element Plus message 的 39px 齐平、比 Ant Design message 的 40px 矮 1px。
  - **语气走淡底**：底与描边取语气层的 `--xh-_tone-subtle` / `--xh-_tone-border`
    （与 alert 同一套口径），正文留中性——正文也跟着兑成语气色的话，绿字压绿底是整条里
    对比度最差的一处。起始侧那条 4px 色条随之删除。
  - **字号回到正文档**：13px → 14px；标题不再加粗、不再换行高，一句话的反馈没有主次之分。
  - **状态字形不带圆底**：服务档的默认模板改用新的 `typeGlyph`（16px 裸字形，颜色取
    `--xh-_tone-fg`，与 alert 的状态图标同档），圆底徽记 `typeBadge` 留给对话框那种有余裕的版面（通知的类型字形由皮肤在 `item-indicator` 上画）。
  - **到点自己走的不出关闭按钮**：`createToastService` 的默认模板据此分两档——
    会自己消失的不出叉（三家参考实现都是这样），`loading` 与 `duration <= 0` 这种走不掉的
    反过来默认出叉，否则界面上一个可点、可聚焦的节点都没有。两档都能用 `closable` 显式改口。

  **破坏性**：删掉 `--xh-toast-accent` 与 `--xh-toast-accent-width` 两个覆盖槽（色条没了）。
  另有四个槽的默认值变了：`--xh-toast-w`（20rem → auto）、`--xh-toast-bg`
  （`--xh-bg-surface-raised` → 语气淡底）、`--xh-toast-border`（中性 → 语气描边）、
  `--xh-toast-title-font-weight`（semibold → regular）；`--xh-toast-close-size` 的默认值
  从 `--xh-control-h-sm`（28px）降到 `--xh-control-action-size`（24px）。
  靠「轻提示是 320px 定宽」做过对齐、或依赖默认那颗叉关闭常驻提示的用法要跟着改。

- 5a1aedd: 轻提示与通知分家：新增 notification，toast 收窄成操作反馈，toaster 删除。

  原先 toast 一个组件担了两件事——「用户刚点了一下，告诉他结果」和「系统主动推来一条消息」。
  两者的信息量、停留时长、落位习惯、谁触发都不一样，混在一起的结果是标题加正文两层文本、
  九宫格落位、堆叠上限这些只有后者需要的东西全压在轻提示上，而轻提示自己反倒要靠一个
  额外的容器组件才能用起来。

  **通知（新增）**

  ```vue
  <XhNotificationRoot v-slot="{ create, dismiss }">
    <XhNotificationGroup>
      <template #default="{ item }">
        <XhNotificationItem :id="item.id" :title="item.title" :description="item.description">
          <XhNotificationItemIndicator />
          <XhNotificationItemTitle />
          <XhNotificationItemDescription />
          <XhNotificationItemCloseTrigger />
        </XhNotificationItem>
      </template>
    </XhNotificationGroup>
  </XhNotificationRoot>
  ```

  队列与卡片是同一个组件的两层：`root`（队列的作用域包装）/ `group`（某个位置上的那一摞，也是 `role=region` 的地标）/ `item` 起是单条卡片。
  九宫格落位、`max` 上限、同 id 就地改写、逐条计时与暂停都在这里。
  Web Components 侧是 `<xh-notification>` 与 `<xh-notification-item>`。

  单条卡片的生命周期复用 toast 那台机器——「会自己消失的卡片」这一行为与消息来源无关。

  通知另有命令式的 `createNotificationService`：推送连接的回调、后台任务的收尾、
  拦截器里的一条系统消息，调用点都在组件之外，让它们各自去找一份队列上下文并不现实。
  队列要长在页面结构里（通知中心那一栏自己排版）时用组件形态，两者不共享队列。

  **轻提示（收窄）**

  - 解剖去掉 `description`：一次操作的结果一句话说得完，说不完的那是通知。
  - 新增 `group` 部件：同时在场的几条叠成一摞。这一摞由全局服务渲染，没有对应的容器组件——
    反馈落在哪儿是整个服务的口径，不该让每个业务页面各挂一份容器再各自决定。
  - `createToastService` 的队列改为服务内部私有，`info` / `success` / `warning` / `error` /
    `loading` / `create` / `update` / `dismiss` / `dismissAll` 签名不变，调用点零改动。
    服务选项新增 `placement`（默认 `top`）、`max`（默认 5）、`gap`。

  **破坏性**

  - 删除 toaster：`XhToasterRoot` / `XhToasterGroup` / `useToaster` / `<xh-toaster>` /
    `connectToaster` / `toasterMachine` / `toasterAnatomy` / `@xihan-ui/styles/toaster.css` 等
    一并移除。组件树内的通知队列改用 notification，命令式轻提示继续用 `createToastService`。
  - toast 删掉 `description` 部件与 `getDescriptionProps`；`<xh-toast>` 的 `description` 属性同时移除。
    机器上的 `description` prop 保留——notification 的卡片复用同一台机器。
  - `ToastOptions` / `ToastRecord` 不再带 `placement`：轻提示的落位归服务，不逐条各去一处。
  - 覆盖槽 `--xh-toaster-inset` / `--xh-toaster-layer` 改名为 `--xh-notification-inset` /
    `--xh-notification-layer`；`--xh-toast-description-*` 随部件一起移除。

### Minor Changes

- 906b712: 真机 axe 扫出的无障碍缺陷逐条修，并把三个模态补进扫描名单。

  **dialog / drawer / image-viewer 此前从没被真机 axe 扫过**：它们的 presence 模型与共享套件对不上，各自单开了一份 WC 规格，因而不在扫描名单里——而焦点陷阱、`aria-modal`、背景 inert 恰恰最该在真浏览器里验。补进名单后三者全绿。

  同一次扫描照出四类既有缺陷：

  - **side-nav 折叠成图标栏后，行按钮与链接没有可及名**（critical + serious，14 条）：皮肤把 `branch-text` / `link-text` 整个 `display: none`，可及名随之归零——读屏用户在折叠侧栏里完全不知道每一项是什么。改成仓内既有的视觉隐藏配方（文字仍在无障碍树里），可及名恒等于可见文本，不必再让连接层去猜名字，也不会覆盖作者自己写的 `aria-label`。
  - **side-nav 的 `ul` 直接装 `a`**（serious，19 条）：Vue 适配器早就偷偷包了一层没登记的 `<li>`。把它提成正式的 `item` 部件（解剖 / connect / meta / 两个适配器 / 套件 / 示例同步），与同族的 breadcrumb、anchor、navigation-menu 一致。
  - **有值时下拉钮被藏掉**（date-picker / time-picker / combobox）：清空钮的互斥契约此前让「清空钮顶替下拉钮」，但这三家的 `trigger` 是打开浮层的那颗按钮而不是装饰箭头——藏掉它，鼠标用户在有值之后没有入口，浮层收起时的焦点归还也会落到隐藏节点上，键盘用户当场丢失位置（真机里 Escape 后焦点掉到 `body`）。改为只有纯装饰的 `indicator` 才让位（select / cascader / tree-select 那三家），这三家的清空钮与下拉钮并排显示。
  - select 的隐藏原生 `select` 在派生用例里被插了两份，第二份没有接线因而没有可及名——套件的 fixture 助手补幂等判断。

  `data-name` 这类写成常量再当计算键用的属性，此前公开面采集器的正则扫不到，基线漏登记；采集器补上常量形态。新增 `check-release-tag`：标签写的版本号必须与 changesets 的 pre 模式对得上，否则打 `v1.0.0` 却发出 `1.0.0-alpha.N`、或退出 pre 后打 `v1.0.0-rc.1` 直接占掉 `latest`。

- c57542d: 补齐 4 处「边框改不动」的覆盖槽。

  这几处的边框颜色绑在背景槽上，或者干脆没有槽——想只改边框改不了，一动就连底色一起变：

  - `form` 的提交按钮三态：`border-color` 直接读 `--xh-form-submit-bg`，没有 `--xh-form-submit-border`。
  - `editable` 的提交按钮 hover / active：静息态有 `--xh-editable-submit-border`，另两态回落到 bg 槽，
    覆盖被顶掉。
  - `table` 的行选中把手选中态：静息态有 `--xh-table-trigger-border`，选中态改用 bg 槽。
  - `steps` 的禁用态指示器：全皮肤唯一一条没有对外覆盖槽的边框声明，而且拿前景令牌
    `--xh-fg-disabled` 当边框色；同部件的 current / completed 两态都有各自的 border 槽。

  新增 8 个槽，都排在既有 bg 槽之前作为第一优先，未设置时求值链回落到原值——**渲染结果逐字不变**，
  既有的 `--xh-form-submit-bg` 之类覆盖照旧同时改动边框与底色。

- e12e337: 日历可以并排展示连续几个月，date-picker 的区间选择默认就是两个。

  区间的起止常常跨月，只有一个面板就得「点起点 → 翻页 → 点终点」，翻的时候还看不见起点在哪。
  两个并排是这类选择器的通行做法，也是这次补上的。

  - **calendar 新增 `visibleCount`**（默认 1）与 **`panels`**：一个锚点铺出 N 个连续月，
    翻页只动锚点、整窗一起走一个月，不是各翻各的。跨年自然接上（12 月的下一个面板是次年 1 月）。
  - **`getGridProps` / `getHeadingProps` 收面板下标**，每个面板一份标题 id，网格各由自己那行标题命名。
    不给下标即首个面板，旧调用一字不改。
  - **`CalendarCellProps` 多一个 `index`**：同一天会同时出现在两个面板里（8 月末那几天也铺在 9 月首行），
    「是不是本月」只有连着面板一起看才判得出来。
  - **往后翻的边界按整窗算**：新露出来的是窗口末尾再往后一个月。单面板时与从前逐字一致。
  - **date-picker 新增 `visibleCount`**，缺省单选 1、区间 2。
  - 皮肤只在 `content` 直接摆了两张日历时才横排（`:has`），并给第二张起画一道左分隔线——
    `showTime` 那套结构里 content 的直属子节点是作者自己的包裹块与确认行，无条件横排会把它们并到日历旁边去。

  旧字段 `weeks` / `visibleMonth` / `headingLabel` 保留，恒指首个面板。

- ff84a16: 日历补上按月 / 季度 / 年 / 周挑，并修掉多面板下的两处硬伤。

  **面板粒度 `view`**（`day` 默认 / `month` / `quarter` / `year`）

  格子的值一律是「那段时间的第一天」的 ISO 串，不另立一套值形态——min/max 比较、区间逻辑、
  不可用判定、表单出口于是全都原样复用。点 Q3 落的就是 `2026-07-01`。

  - 月面板一年 12 格、季度 4 格、年面板一页十年（两端各带一格邻十年，与日视图带邻月同一套做法）
  - 一页翻多久跟着视图走：日 1 个月、月与季度 12 个月、年 120 个月；翻页边界同样按整页算
  - 标题按 locale 出：`2026年8月` / `2026年` / `2020年-2029年`
  - 网格上多一个 `data-view`，皮肤据此换排布（月与年 3 列、季度 4 列）；日视图一个字没动

  **周选 `weekSelection`**：点任意一天落的是它所在的整整一周（两端一起给），周首日随 locale。
  只在 `view=day` 且区间模式下生效，其余情形照旧只落这一天。

  **修：点第二个面板里的日子会整窗往后翻一页**

  视窗起点此前直接由聚焦日反推，于是点右边那个面板 → 聚焦日落到下个月 → 整窗跟着走，
  看着就像「点一下翻一页、根本选不中」。现在视窗是独立的浏览位置，只在聚焦日走出视窗时
  才挪过去，挪到刚好把它露出来的那一端。

  **修：浮层展开后指针那条路没有出口**

  上一版把触发钮变成可选部件后，点输入行只能展开、不能收起——而段位里敲出来的值又不触发
  「选完即收」（那时人还在打字），于是浮层关不掉。现在点输入行是开合对称的，段上按 `Enter`
  也收起（`Alt+ArrowDown` 展开的对偶）。

- a19bbaa: 级联选择补空态兜底：新增 empty 部件，搜索无候选或 collection 为空（根列没有条目）时露面，其余时候带 hidden。

  - headless：`getEmptyProps` 管空态占位的露面与收起；`getSearchListProps` 无候选时带 `data-empty`，`getContentProps` 根列没有条目时带 `data-empty`；新增 `translations` prop（`empty` / `noMatch` 两键，默认英文）与 api 上并入默认后的完整一份。
  - vue：`XhCascaderContent` 自动补渲空态占位，`empty` 插槽可换内容，缺省文案按视图取无匹配或无数据；`translations` prop 接入全局 `provideXhConfig` 注入点（`translations.cascader`）。
  - web-components：新增可缺省的 `empty` 部件，元素代管其 hidden，文案归作者。
  - styles：空态占位居中排版（`--xh-cascader-empty-min-h` / `--xh-cascader-empty-p` / `--xh-cascader-empty-fg` 可覆写）；无候选时候选列表不再占位，根列没有条目时空列让位。

- 089db90: 清空 / 关闭 / 移除按钮收成四类契约，`check-clear-trigger` 门禁固化。

  **内嵌清空钮**（cascader · tree-select · combobox · date-picker · time-picker · text-field · tags-input · select，以及新增部件的 popselect · date-field · time-field）统一为：`tabindex=-1` 不占 Tab 位但**不再 aria-hidden**——读屏按 `aria-label` 找得到它，文案统一走 `translations.clearTrigger`（缺省 `'Clear'`；select 的 `clear` 键改名）；pointerdown 不夺焦，点完发 `VALUE.CLEAR` 并把焦点送回宿主（trigger / input / 第一段）；没值就 `hidden`，不再同时打 `disabled`/`data-disabled`、皮肤也不再留一颗永远看不见的灰钮；尺寸与圆角统一为 `var(--xh-<c>-action-size, var(--xh-control-action-size))` / `var(--xh-<c>-action-radius, var(--xh-shape-control))`——text-field 此前与输入框等高、select / tags-input 按指示符尺寸走 pill，`--xh-text-field-clear-*` / `--xh-tags-input-clear-*` / `--xh-select-clear-*` 槽改名 `action-*`；互斥一律由 connect 在被让位的部件上打 `data-clearable`、皮肤一条 `display: none`——select 去掉了 `:has()` 让位与 `:hover` 才显形（触屏此前根本看不到清空钮），清空钮改为 trigger 的兄弟并排（`--xh-select-control-gap`）。

  **键盘清空**：select · cascader · tree-select · popselect 此前没有任何键盘清空路径。现在焦点在 trigger、有值且可编辑时 **Delete 清空全部、Backspace 单选清空 / 多选去掉最后一个**，键盘表与一致性套件同步。

  **select** 补 `readOnly`（浮层照常展开、值改不动、清不掉）与 `VALUE.CLEAR` 事件（`api.clear()` 不再借 `VALUE.SET []`）；Vue 的 select / combobox Root 新增 `clearable`（缺省 false）决定 collection 自动渲染树是否带清空钮——combobox 此前无条件渲染，示例已补 `clearable`。

  **独立动作钮**（file-upload · signature-pad）：file-upload 的 `api.clearFiles()` 改名 `clear()`、`translations.clearFiles` 改名 `clearTrigger`；列表为空时不再原生 disabled（清完焦点会掉回 body），只打 `data-empty` 压淡。

  **浮层关闭钮**（dialog · drawer · popover · tour · toast · alert · floating-panel · image-viewer）统一 `var(--xh-<c>-close-size, var(--xh-control-h-sm))` / `var(--xh-<c>-close-radius, var(--xh-shape-control))`，dialog / drawer / popover / tour 补上使用者槽；image-viewer 保持 `--xh-control-h-lg`（全屏看片的 chrome 钮按触控靶走）但圆角归 control。**标签内移除钮**（tag · tags-input item · select tag）尺寸基准 `--xh-control-indicator-size`、圆角 `--xh-shape-inset`；行级删除钮（file-upload item · dynamic-input）按 `--xh-control-action-size` / `--xh-shape-control`。

  四类按钮都补了 `:active` 按压反馈（`--xh-motion-scale-press`），27 处登记进 `check-press-feedback`。

  `--xh-select-clear-*` / `--xh-tags-input-clear-*` / `--xh-text-field-clear-*` 共 20 个槽名变更是公开面删减，基线已推。

- 72dc39c: color-picker 能进 HTML 表单了。

  此前它既没有 `name` prop 也没有表单影子——放进 `<form>` 里提交，`FormData` 里没有这个字段。
  同仓 11 个组件早就做全了这件事，它是缺口之一。

  照仓内既成的形状补：新增 `hidden-input` 部件（`type=hidden`，排在解剖末位）、`name?: string` prop、
  `ColorPickerApi.getHiddenInputProps()`。影子产出的属性恰好五条——parts 属性、`type`、`name`、`value`、
  `disabled`——`type` 必须排在 `value` 前（改 type 会重置输入的值），`name` 不给就整条不产出、这份输入
  不参与提交，禁用时带原生 `disabled` 不提交值，只读照常提交。

  **这是纯增量**：影子是作者自己写的可选部件（Vue 侧新增 `XhColorPickerHiddenInput`，WC 侧新增
  `::part(hidden-input)`），不写它就不存在，既有 DOM 与皮肤选择器一个字节不变。

- 4748212: 控件边界切到 `border.control`，WCAG SC 1.4.11 的 3:1 第一次真的达标。

  **这是一次观感变更**：输入框、选择器、复选框、单选、开关、步进钮这一类控件的边框会比以前明显一点
  （浅色 1.26 → 3.23，深色 1.91 → 3.59），悬停档 4.73 / 4.18。分隔线、卡片描边、表格行线、浮层外框
  一律不动——它们不在 SC 1.4.11 的范围内，跟着变重只会毁掉版面。

  131 处改动，判定规则是可机械执行的四问，其中决定性的一问是**焦点环画在谁身上**：环向下委派给
  后代（`outline: none` 且后代另有画环规则）的盒子是取景框不是控件，它的边框不承载「不看清就做不成事」
  的信息。`table` 的 root 与 `listbox` 的 content 因此同判装饰——两份文件里各自写着的注释就是依据
  （「纯容器：焦点落它身上不画环，高亮永远长在行上」／「落焦不画环：高亮永远长在条目上」）。

  **三处二阶效应，逐条处理过：**

  - `splitter` 的分隔条静息走 `background` 取 `border.default`，而它的悬停走的是 `bg-*` 族。只迁静息会让
    悬停比静息更淡，所以这一处不迁。
  - `text-field` / `number-field` 的**聚焦态描边**兜底仍是 `border.default`。静息提到 3.23 之后，控件一被
    聚焦边框反而掉回 1.26——比静息淡一大截。8 条聚焦槽一并迁走（含 subtle / ghost 两个变体：它们静息是
    `transparent`，聚焦那道边就是当下唯一的边界）。
  - `transfer` 的搜索框 `border: 0` 只留一条下边线，而它与面板共用 `--xh-transfer-panel-border`。新增
    `--xh-transfer-search-border` 单独承载，默认控件级。

  写了一份倒挂检查：13 个私有边框槽族 × 四个主题档位（浅、深、浅+高对比、深+高对比），逐档比对
  静息 / 悬停 / 聚焦的权重必须单调不减，现在零倒挂。

  **仍未达标、如实记账的一处**：带语气的 outline 形态（`<XhButton variant="outline" tone="danger">` 这类）
  走的是 `--xh-_tone-border`，它是语气色兑 40% 底色的结果，六种语气在两套主题下是 1.44–2.18，新令牌够不着。
  要治得另立一支控件级的语气边框槽，而那一支里 `warning` 对白底只有 2.70，仍需单独裁定——留待下一轮。

- 7f8021e: 日期区间的框选改成逐行横杠，面板数按区间跨不跨页现算，面板号写在日历上一处即可。

  **区间底色画成了一整块实心方块。** 底色铺在格子的背景上，格子上下的内衬也算背景区，
  而行与行之间没有间距——七月一整月被选中时，五行底色首尾相接连成一个大方块，
  两端那两枚圆点像是被按在方块上，看不出区间是一天一天连起来的。

  底色改由格子的 `::before` 铺：横向铺满格子，相邻两格接成一条；纵向收在格子内衬里，
  行与行之间留出 4px 空当。每一行的行首与行尾各自收圆，跨周的区间于是是一行一条两头圆的横杠。
  摆了周序号格的行里，行首那一格排在周序号后面，圆角跟着落到它身上。

  **两端那一格只铺半格**，另外半格由选中圆片占满：区间收在圆点上而不是收在格子边上。
  起止落在同一天时两条一起生效，底色宽度归零，只剩那枚圆点。

  **邻月的日子不再吃区间底色与选中圆片。** 并排两张面板里同一天会各出现一次
  （7 月 31 日既在七月的末行、也在八月的首行），两张都画就成了两个端点、两段底色。
  邻月的日子回到「压暗的数字」这一档。

  **粗粒度视图的邻月判定修正。** 月/季度/年三档里格子的值是那一段的第一天，与面板起点比月份恒不相等，
  于是除首格外整页都被判成邻月、整页压暗。这三档改用网格自报的 `inView`。

  **区间默认铺几个面板改成现算**：已选的两端落在同一页里就一张，跨页才并排两张；
  只落了一端（还在挑）时仍按两张算。日历同时恒渲染六行（新 prop `fixedWeeks`，默认开），
  并排的两张面板等高，翻页时浮层高度也不再跟着月份变。

  **面板号写在 `XhDatePickerCalendar` 上一处即可**：新增 `index` prop，面板内的
  `Heading` / `HeadingYearTrigger` / `HeadingMonthTrigger` / `Grid` / `Cell` 不写就跟着它走，
  自己写了仍按自己写的算。此前这五个部件各要写一遍，漏掉任何一个都会静默落到面板 0——
  两张面板显示同一个月份、第二张面板的邻月判定整片错位，都是这么来的。五个 prop 一并兼收字符串。

  **快捷选项列的高度由并排的日历给。** 此前这一列按内容收、上限写死一档，
  右侧那道分隔线只画到最后一条选项，比日历矮一截；它与旁边那张日历之间也补上了与两张日历之间同样的空当。

- e2292bf: date-picker 与 time-picker 补上三条视觉轴：`variant` / `tone` / `size`。

  这两个组件此前是全仓仅有的两处「有输入行却没有形态轴」——同一张表单里，
  文本框、数字框、分段日期、分段时间都能换档，唯独这两个换不了，只能靠覆盖令牌硬凑。
  它们各自内嵌的 `date-field` / 分段时间输入早就有三轴，缺的一直是外层这一份。

  轴的落法与全仓一致：三个属性只写在 `root` 上，输入行、日历格与浮层里的列都从那里继承皮肤声明的私有槽，
  所以换一档不必给每个部件各写一条选择器。

  皮肤同步把两份里原先散着的写死值收成私有槽：

  - 尺寸档换 `control-h` / `control-px` / 两档字号（time-picker 还多一个列表格子的内边距）
  - 形态档换底色与两档描边；输入类照例不做实心档——填满一个要往里打字的框，字与底没法同时读
  - 语气只落在聚焦环、段位反白、时间列选中与确认按钮上，正文与日期数字不归它管

  不写这三个属性时一个 `data-*` 都不产出，皮肤走缺省档，观感与之前逐像素一致。

- 0be028c: 抽屉可以挂在页面里的某一块区域上了，`portalContainer` 也不再是个死字段。

  `RuntimeConfig.portalContainer` 自打声明起就没人读过——全部浮层的搬运目标一律写死 `'body'`，
  所以「局部抽屉」根本做不出来。这次两头一起接：

  - **drawer 新增 `contained`**：遮罩与定位层从 `fixed` 换成 `absolute`，只罩住最近的定位祖先而不是盖满整屏。
    `data-contained` 同时落在 root / backdrop / positioner / content 上，页面里那半边与被搬走的那半边都能选到。
  - **Vue 新增 `container`**（选择器或元素）：浮层搬进那个容器，并**隐含 `contained`**——
    一处给定、两件事从它派生，不会出现「搬进去了但还画着全屏遮罩」这种两边各说各话。
    显式写了 `contained` 以显式的为准。
  - **`portalContainer` 真正接上**：`XhConfig` 多一个同名字段，应用级注入一次，
    没写 `container` 的浮层就落到它给的容器里；都没有才落 `body`。
  - **Web Components** 是 Light DOM，作者写在哪浮层就在哪，因此只需要 `contained` 这一个属性来让皮肤按容器画。

  那个容器要自己带 `position`（`relative` 之类），否则 `absolute` 会往上找到别的定位祖先——
  这一条写进了 props 说明与示例。

- f154e07: 组件自带的兜底字形改为真正的图标：勾、半选横杠、展开箭头、清空与关闭的叉、排序方向、加减号、翻页箭头、图片查看器工具条这些，原先要么是皮肤里的 Unicode 字符（`✓ ▾ ✕`，跨字体跨系统长得各不一样），要么由作者在每个部件里手打一个字符。现在统一走 `--xh-glyph-mark-*` 一族二十个令牌，取值是图标包里对应 SVG 的 `url("data:image/svg+xml,…")`，皮肤拿它当 `mask-image`、用 `currentColor` 着色——随语气、悬停、禁用自动变色，与 `<XhIcon>` 画出来的一模一样。令牌的 `$type` 为 `icon`、`$value` 是图标名，构建期从图标包读 SVG 内联，改图标只改一处。

  使用者换图标有两条路：在 `:root` 上重声明令牌即全局换，写在任意容器上即只换那一块（任何 SVG 都行，着色一样走 `currentColor`）；或者往部件里放自己的节点，皮肤那条 `:empty` 守卫即不命中。兜底覆盖面从 14 份皮肤扩到 39 份：此前 tree / tree-select / table / toast / dialog / drawer / number-field / carousel / transfer / image-viewer 等二十个组件的把手空着就什么都不画，文档示例只好逐个手打字符；现在示例里的 960 处手打字符全部删掉，由皮肤画。命令式 toast / dialog 的类型徽记与 `XhToastCloseTrigger`、`XhImageViewer*Trigger` 的默认内容同样改走这族令牌。

  图标包新增 `info` / `rotate-left` / `rotate-right` / `flip-horizontal` / `flip-vertical` 五枚。`check-glyph-slots` 门禁禁止皮肤里再写字面字形，并双向核对令牌与用处（适配器里的 JS 默认模板也算）。

- 1e90ce6: 热力图新增 `palette` 色板轴：`green` / `blue` / `orange` / `purple` / `red` / `gray`，直接按颜色点名色阶满档那一端，三种形态与图例一起跟着走。它是装饰性的一条轴，不是第四条语义轴——与 `tone` 同时写时听色板的，两条都压不过作者自己写的 `--xh-heatmap-ink`；不写时行为与之前逐字一致。

  令牌层随之补上紫色原语 `--xh-color-purple-600`：明度与彩度照 danger 的 600 档，只把色相换成 302。

- 091bbef: 补上动效地基的四个缺口。

  **减弱动效此前基本是失效的。** `tokens.css` 里一个 `prefers-reduced-motion` 都没有，降级靠 19 份皮肤各写各的 `@media`，而它们只把 `animation-duration` 压到 `0.01ms`——位移与缩放是写死的字面量，压时长压不掉。前庭不适恰恰来自大位移与缩放，所以「减弱动效」的用户看到的是瞬间跳完整段位移。现在幅度走 `--xh-motion-distance-sm/-md` 与 `--xh-motion-scale-enter`，令牌层在 reduce 下把它们归零，皮肤不必自带 `@media`。删掉 8 份已经冗余的降级块（含 8 条 `!important`）；marquee / skeleton / spinner 那几处有讲得通的自定义降级，保留。

  **dialog 与 image-viewer 的退场动画从来没播过。** 皮肤给挂着退场动画的 `content` 补了 `[hidden]{display:none}`，收起时元素当场不生成盒子，动画不启动，退场探测器放弃申领租约、就地卸载。drawer 早就绕开了这个坑，它的注释还写着「与 dialog 一致」——而 dialog 恰恰是反的。现在真的一致了，四条退场动画同时补上 `forwards`。

  **Web Components 端全域没有退场动画。** 三个浮层元素把收起写死在展开态上，与 `data-state="closed"` 同帧写内联 `display:none`。现在收起跟着 presence 走；Light DOM 下被拉长的不是节点存在的时间，而是可见的时间。

  **破坏性程度**：进场缩放统一到 `0.96`（此前 0.98 与 0.96 混用），dialog / toast 进场 / color-picker 的起势略明显一点。button 的加载转圈不再被压成 `0.01ms`——转圈是「系统还在做事」的唯一可感知信号，压掉等于把加载态变成假死。

  回归测试进了 `tests/browser/`：jsdom 不把样式表里的 animation 算进 `getComputedStyle`，这三件事在 jsdom 里结构性测不到。

- 689ed0f: 13 个宿主的滚动层自带自绘滚动条：滚动时或指针在这一片时露出、静止后收起，浮在内容之上不占宽度。

  **哪些宿主**：12 个浮层族的 `content`（cascader / color-picker / combobox / context-menu / date-picker / hover-card / mention / menu / pagination / popover / popselect / tree-select）与 json-viewer 的 `tree`、`text`，共 14 个滚动容器。条子由库自己建，作者一个部件都不用写：它是滚动层的兄弟，绝对定位贴在组件既有的壳上（浮层族是 `positioner`，json-viewer 是 `root`）。轴按各自的溢出方向摆——cascader 只摆横的，tree-select 与 json-viewer 竖横都摆、两条都溢出时各让出交叉口那一格，其余只摆竖的。

  挂上条子的容器带 `data-xh-scrollbar`（挂在它身上的条数），皮肤据此把原生条藏成零宽：容器的可用宽度一点不减，也不再需要为原生条留空道。露面时机、尺寸档、拖动、触屏交给原生滚动这些全是 `scrollbar` 那一套，与手写 `<XhScrollbar>` / `<xh-scrollbar>` 挂上去的完全一致，缺省档是 `scroll-hover`。

  **json-viewer 换档跟随**：树档与原文档互斥，换档时条子跟到此刻在场的那个容器，节点不重建（换档不会把滚动条闪一下）。

  **按在 `positioner` 上不再消解浮层**：条子住在 `positioner` 里、是 `content` 的兄弟，浮层的层分支因此把 `positioner` 一并记上——不记的话按住条子拖动那一下会被判成层外交互，面板当场收起。副作用是 `positioner` 的其他子节点也算进了层内：吃指针的只有 combobox 的 `empty` 空态占位，按它不再关闭候选面板（此前会关）。其余 11 个浮层的 `positioner` 除了条子没有吃指针的子节点（`positioner` 自身是 `pointer-events: none`），按在面板之外仍照旧消解。

  **皮肤侧要跟着改的**：自带皮肤给这 13 个壳补了 `--xh-scrollbar-track-bg: transparent`（浮在内容上的条子不该有实色轨道），json-viewer 的 `root` 补了 `position: relative`（条子贴它的内边距盒）。第三方皮肤若整份接管这些 part，同样要给壳一个定位上下文，并把轨道底色关掉。滚动条自身的 `root` 补了 `pointer-events: auto`，抵消 `positioner` 那句 `none`。

- 843e17a: json-viewer 补原文视图：`view="text"` 直接出缩进过的 JSON 原文。

  树档是拿来"翻"的——折叠、逐层看结构；而"核对这份报文与后端下发的是不是一字不差"、
  "把它整段拷走"这两件事树档做不到：值受 `maxStringLength` 截断、成员受 `maxItems` 折减，
  分支摘要与把手还带 `user-select: none`，框选拿到的不是原文。原文档就是补这一件事，
  因此它刻意不吃那两个折减选项。

  `api.text` 在两档下都取得到，作者要做"复制原文"按钮时不必自己再序列化一遍。
  序列化与树同源：同一个 `jsonEntries` 排键（`sortKeys` 一样生效）、同一条祖先链判环
  （环落成 `"[Circular]"`，两条不相干分支共享同一个对象照样摊开），
  `bigint` / `undefined` / 函数这些 JSON 没有写法的值退回树上那份文本并按字符串写出，
  整份始终解析得动。

  新增 headless 出口 `jsonText` 与类型 `JsonViewerView`，解剖新增 `text` 部件。
  皮肤与树档共用同一套边框、内衬与高度令牌，两档切过去盒子不跳。

- ec93d6b: 浮层里的条目之间加 2px 行距，新增语义令牌 `--xh-list-option-gap` 统一这把尺。

  **下拉里选中项与悬停项贴成一整块。** a11 的选中蓝底与 b22 的悬停灰底之间没有一丝缝，
  两块底色首尾相接，读起来像一条被涂了两截颜色的长条而不是两个条目。

  **库内自己就有三种方言**：浮层选项列（time-picker / date-picker 的时间列与预设列）已经是
  2px，页面导航列（side-nav / navigation-menu）是 4px，下拉、菜单、树这一族是 0。补上 2px
  是把这一族拉回库内既有的口径。

  `list` 组的描述原文写着「option-\* 给浮层里的条目——菜单项、下拉选项、树行、时间列」，
  新令牌落在这一组：`--xh-list-option-gap: 2px`。compact 档不覆盖，2px 已是最小档。

  22 个条目的直接父容器接上这把尺：select 的 `list`；combobox / listbox 的 `content` 与
  `item-group`；popselect 与 mention 的 `content`；menu / menubar / context-menu 的 `content`
  与 `group`；cascader 的 `column` 与 `search-list`；tree 与 tree-select 的 `tree`、
  `branch-content`、`branch`；transfer 的 `list`。装 list 加 footer 的外壳（select /
  tree-select 的 `content`）不接——它不是条目的父层。json-viewer 也不接，只读数据视图与
  table、log 同为紧排一档。

  `tree` 与 `tree-select` 的 `branch` 此前是块盒，为接这把尺改成纵向 flex，tree-select 同时
  补上此前缺的 `[hidden]` 兜底。

  节奏顺手收一级，加了 gap 之后总量不变：combobox 与 listbox 的组间距 8px → 6px，
  menu / menubar / context-menu 的分隔线外边距 4px → 2px。time-picker 那两处等值的
  `--xh-space-0_5` 改指新令牌，视觉不变。

  这把尺打在容器上，所以分组标题与它下面第一条之间同样多出 2px——分组标题是 `group`
  的第一个子元素，与条目同属一层 flex 子项。

- 8d35702: 动效与浮层口径收口。

  **减弱动效只剩一条通道。** 此前 kernel 的 `RuntimeConfig.reducedMotion` 只读系统 matchMedia、motion 包的 `setMotionOverride` 只有 animate / 滚动 / 数字动画在听，presence 与 stick-to-bottom 感知不到应用级覆盖；无 matchMedia 的宿主两包还给出相反答案（kernel 直接抛 TypeError、motion 报 reduce）。现在 kernel 依赖 motion，`reducedMotion` 缺省即 `resolveMotionPreference() === 'reduce'`（覆盖 ?? 系统偏好），没有 matchMedia 一律不减弱；glyph 转圈、backgrounds、滚动、数字动画全部走同一函数。CSS 侧 `tokens.css` 新增 `:where([data-motion='reduce'])` 块，与 `@media (prefers-reduced-motion: reduce)` 同源生成、逐条相同——作者把 `data-motion="reduce"` 打在任意容器即局部减弱。全局配置加 `motion?: 'reduce' | 'no-preference'`，Vue `provideXhConfig` / WC `<xh-config motion>` 收到即调 `setMotionOverride`。

  **缓动与时长的真源是令牌。** motion 包新增 `durations = { fast, normal, slow }`，`animate()` 缺省与 `@xihan-ui/animations` 的缺省时长都引它；`check-motion-source` 比对 primitive.json 与 easing.ts / durations.ts，值不等即红；`check-reduced-motion-channel` 禁止 motion 包之外再出现 `matchMedia('(prefers-reduced-motion')`。

  **皮肤的 reduce 块归口。** 只在两种情况自写：无限循环动画要整个停掉、有使用者时长槽的过渡要兜住穿透。image-viewer / side-nav / layout 三份纯重复令牌层的块删掉；table 的 `0.01ms !important` 改 `animation: none`；保留的 10 份每块配一份等价的 `[data-motion='reduce']` 规则。animation / transition 不再直引 `--xh-duration-*` 原语：spinner 走 `--xh-spin-duration`，skeleton 走新令牌 `--xh-shimmer-duration`（1600ms）。`check-infinite-motion` / `check-motion-primitives` 守住。

  **浮层的 placement / offset 默认值只有两种语义。** `OVERLAY_PLACEMENT_ANCHORED = 'bottom'`（气泡类）与 `OVERLAY_PLACEMENT_LIST = 'bottom-start'`（列表类）、`OVERLAY_OFFSET = 8` 从 headless 共享导出，各组件的 `<C>_DEFAULT_PLACEMENT` 改为引用它们（tooltip / hover-card / popover / popconfirm / popselect 新增导出常量），所有机器显式传 offset，不再隐式靠引擎兜底；`check-overlay-defaults` 守住。

  **层级覆盖槽齐全、后缀统一。** 22 个浮层族的 positioner / backdrop、toaster、navigation-menu 面板都有了 `--xh-<c>-layer` 槽（缺省仍是 `--xh-layer-*`）；tour / table / heatmap 的 `-z` 后缀槽改名 `-layer`（7 个，公开面变更，基线已推）。

  **进退场对称。** toast 退场位移从 distance-sm 改 distance-md（与进场、与 dialog 一致）；tour 的气泡改用 pop 族，聚光灯补退场；side-nav 折叠态弹出面板补进退场并在 Vue / WC 接上退场租约。

  **navigation-menu 的定位登记变成可验证的。** 三道浮层门禁此前按「anatomy 有 positioner」发现族，它从没被检查过；现在 `SKIN_POSITIONED` 名单要求它没有 positioner、不接引擎、面板由皮肤 absolute 排布，任一条不成立即红。`check-arrow-geometry` 增比对 JS 箭头常量（8·√2 / 8）与令牌（8px 边长 / 8px 圆角）。

- 239eb5d: 浮层箭头改为指向锚点，不再钉死在浮层中点。

  定位结果新增箭头落点：`PositionResult.arrow` 给出箭头中心距浮层起始缘的距离（上下两侧给 x、左右两侧给 y），由调用方在 `PositionOptions.arrow` 里交出箭头的尺寸与让开圆角的余量才计算，不要就缺席。落点算在翻面与挪位之后，两者的位移因此自动带上；锚点落在浮层之外时钳到最近的合法点。

  六个带箭头的浮层（popover / tooltip / hover-card / menu / context-menu / tour）接上这条链路：机器把箭头的量交给引擎，连接层把落点写成内联自定义属性，皮肤消费它、引擎没给时退回原来的居中。此前只要 placement 带 `-start` / `-end` 对齐、浮层比锚点宽、或引擎为避让把浮层挪了位，箭头就指向空处。

  tooltip 的箭头补了 `data-placement`，皮肤的四条侧向规则从挂祖先 positioner 改为挂箭头自己，与其余五个统一。

- 8fc5f05: 上一页 / 下一页默认就是两枚箭头。

  原先库里一个字都不产出，可见内容全靠作者往插槽里塞——于是每份示例都手写了
  「上一页 / 下一页」四个字，翻译、宽度与图标风格全归使用者自己操心。

  皮肤补上兜底字形：两个把手为空时各画一枚 chevron，走既有的 `--xh-glyph-mark-*` 令牌
  （mask + currentColor，跟着语气、悬停与禁用一起变色）。rtl 下两枚对调，指向行进方向。
  作者往部件里塞了自己的图形或文字，`:empty` 即不命中，原样让位。

  读屏名字一如既往来自 `translations.prevTrigger / nextTrigger`，不受影响——
  去掉的只是可见文字，不是可及名字。

- 1a36b7e: 省略号能摊开了：折进去的那几页现在有路走到。

  原先省略位是 `aria-hidden` + `pointer-events: none` 的死占位，而 `pages` 序列
  只说「这里折了一段」，说不出折的是哪几页——那几页除了手打跳页输入框没有任何入口。

  分页因此升级成浮层族，新增 `positioner` 与 `content` 两个部件：

  ```vue
  <XhPaginationRoot v-slot="{ pageItems }" :count="2000" :page-size="10">
    <template v-for="item in pageItems">
      <XhPaginationEllipsis v-if="item.type === 'ellipsis'" :side="item.side" />
      <XhPaginationItem v-else :value="item.value">{{ item.value }}</XhPaginationItem>
    </template>
    <XhPaginationPositioner>
      <XhPaginationContent v-slot="{ pages }">
        <XhPaginationItem v-for="p in pages" :key="p" :value="p">{{ p }}</XhPaginationItem>
      </XhPaginationContent>
    </XhPaginationPositioner>
  </XhPaginationRoot>
  ```

  - 新增 `api.pageItems`：与 `pages` 同一串序列，但省略位带着被折叠的那几页。
    `pages` 由它派生，两者的窗口数学只有一份。旧的 `pages` 写法一行不用改。
  - 悬停摊开（`openDelay` / `closeDelay`），**点一下也摊开**——纯悬停会把键盘用户挡在外面。
    Escape 与点外面都能收起（走消解层）。
  - 至多两个省略位，用 `side`（`'start' | 'end'`）区分；同时只开一个，一份定位层就够。
    Web Components 侧由作者在节点上写 `side="end"`，与页码按钮自报 `value` 同一套写法。
  - 浮层 portal 到统一落点，三视觉轴在 `positioner` 上重打一遍。

  **破坏性**：`getEllipsisProps()` 改为收 `{ side }`；省略位从 `<span>` 变 `<button>`、
  不再带 `aria-hidden`。

- 911d0b7: 每页条数控制器随分页一起给了。

  ```vue
  <XhPaginationPageSizeSelect v-slot="{ options }">
    <option v-for="o in options" :key="o" :value="String(o)">{{ o }} 条 / 页</option>
  </XhPaginationPageSizeSelect>
  ```

  用**原生 `<select>`** 而不是再造一个浮层：档位就那么几档，浮层带不来什么，
  却要多接一层定位、消解与键盘；原生控件在 Web Components 侧也一样能用，键盘天然可达。
  不给插槽时按 `pageSizeOptions` 渲染默认档位。

  受控时会把 DOM 的选中项同步回填：宿主不写回的话，用户改过的原生 select 与真正生效的
  档位会对不上，而 vdom 那边没有变化就不会打补丁——这一条两个适配器共用。

- d738f78: `date-picker` 与 `time-picker` 新增快捷选项：给 `presets` 数据就在浮层里多排一列（「今天」「近 7 天」「此刻」这类），点一条整份写进值。新增 `presets` / `preset` 两个部件、`getPresetsProps` / `getPresetProps` 两个产出与两条键盘行；这一列自成一套 listbox 键盘，与日历网格、时分秒那几列互不抢键。

  单日的值就是一条 ISO 日期串，区间用 ISO 8601 的区间写法把两端拼起来（`2026-08-15/2026-08-21`），一个串同时充当这一项的身份。日子由使用者算好传进来——连接层每帧求值，`today()` 放进渲染期会跨零点算出两个答案；headless 备了 `datePickerPresetDay` / `-Range` / `-Month` / `-Year` 与 `timePickerPresetNow` 五个纯函数。

  date-picker 的收起沿用 `closeOnSelect` 那条守卫（区间要两端齐、showTime 仍由确认按钮收口）；time-picker 的快捷选项给的是整份时间，写完即收。

- a41b931: 进度条新增环形与仪表盘两种形态。

  - 新增 `variant` 轴：`line`（缺省，行为逐字不变）/ `circle` / `dashboard`，以及 `canvas`（承载环的 svg）与 `label`（环心那一块）两个可缺省部件。
  - 新增 props：`strokeWidth`（环的线宽，viewBox 单位，缺省 6）、`gapDegree` 与 `gapPosition`（仪表盘的缺口，缺省 75 度朝下）、`valueText`（进度不是百分比时给读屏念的那句话）。线宽是 prop 不是令牌——它改的是几何，半径要跟着往里收；线形的厚度仍走 `--xh-progress-thickness`。
  - 环的直径、底槽色、进度色与端点形状走令牌（`--xh-progress-size` / `-track` / `-range` / `-linecap`），几何由连接层算好写进标记，皮肤只上色。

  顺带两处修正：

  - 退化输入不再算成满进度：`max` 不为正或不是数时回落 100，`value` 不是数时按 0 处理（此前 `max=0` 会让进度算成满格）。
  - 线形的长度不再取整：`value=3 / max=8` 由 38% 改为 37.5%，相邻两档不会再看起来一样长。

- 9548330: 新增 `scrollbar` 组件：自绘滚动条，挂在**任意一个**滚动容器上——表格的滚动盒、虚拟滚动的视口、随手一个 `overflow: auto` 的 div 都行，不必是本组件的后代。此前这套东西焊在 `scroll-area` 里，只有连视口带内容一起交出去的场景用得上。

  解剖 `root` / `track` / `thumb` 三层必需、`corner` 可选（横竖两条同时摆着时写在其中一条里补交叉口，配合 `gutter` 让两条各自让出那一格）；四种露面时机（`auto` / `always` / `scroll` / `hover`）带收起延时；拖滑块、点轨道跳转、RTL 双向换算、滑块像素下限、成段的 `scroll-start` / `scroll-end` 与 `drag-start` / `drag-end` 都在库里。`focusable` 打开后滑块进 Tab 序、报 `role="scrollbar"` 与三个 `aria-value*`，方向键 / 翻页键 / Home / End 可用；缺省不进 Tab 序也对读屏隐藏——滚动本身由滚动容器报，同一件事没必要报两遍。触屏（粗指针）上默认交给原生滚动，整条不画并带 `data-native`，`forceVisible` 打开才画。收起不再打 `hidden`，而是 `data-state=hidden` 由皮肤淡出（`visibility` 随退场播完才收），露出同样淡入；根上另有 `data-hover` 标指针在不在这一片。

  **`scroll-area` 改由 `scrollbar` 组装。** 滚动区不再有自己的机器：它是视口加两条 scrollbar——`scrollbar` 角色节点是那条滚动条的挂载点、同时充当它的根，里面照 scrollbar 的写法摆 `track` / `thumb` / `corner`（戴 `data-scope="scrollbar"`），显隐、拖动、键盘、几何、触屏原生、淡入淡出全是 scrollbar 那一套，两个组件共用一份滚动条。Vue 新增 `XhScrollAreaTrack`；交叉口 `corner` 改写在竖条的挂载点里，两条都显形时才露；`scroll-area` 新增 `size` / `forceVisible`；视口的占道改打在视口自己身上（`data-lane-vertical` / `data-lane-horizontal`），不再依赖 `:has()`。原 `--xh-scroll-area-thumb-*` / `-bar-*` / `-corner-bg` 那几个槽随之归到 `--xh-scrollbar-*` 名下；`scrollAreaMachine` / `ScrollAreaSchema` / `SCROLL_AREA_*` 导出不再有，连接层改收两台 scrollbar 机器与 props（`scrollAreaScrollbarProps` 给出每台的 props）。挂了自绘滚动条的容器带 `data-xh-scrollbar`（挂在它身上的条数），皮肤据此藏掉原生滚动条的外观——表格放进滚动区即可滚（吸顶表头与吸附列钉在视口上），虚拟滚动的视口给个 id 用 `controls` 挂上即可。

  滚动容器换了会自动把监听挪过去（`scrollable` / `controls` 指向另一个节点、或条件渲染的容器重建）；查不到时投一条 `scrollbar.missing-scrollable` 诊断，不静默，容器后到时调一次 `api.measure()` 即接上。容器里内容长短变了会自动重量（`MutationObserver` 盯着子树，一拍内合并成一次），量不到的场合另有 `api.measure()`。

- abe790b: 滚动条新增 `scroll-hover` 档，并把它定为缺省档。

  **新增 `'scroll-hover'`**：滚动时露出，指针进入滚动容器或滚动条时也露出；指针占着容器时滚动只重画滑块、不起收起倒计时，指针离开或停手满 `hideDelay` 才收起。它是 `hover` 与 `scroll` 两档显形条件的并集，与那两档一样浮在内容之上——`data-lane-*` 的判据只认 `auto` / `always`，视口宽度一点不减（横条同理不占高度）。

  **缺省档由 `'hover'` 改为 `'scroll-hover'`**：`scrollbar` 与 `scroll-area` 不写 `type` 时都走新档。显形集合是原缺省档的严格超集，没有一条本来看得见的滚动条会消失；占道与否、触屏交给原生滚动那一路都不变。

  **需要跟着改的代码**：对 `ScrollbarType` 做穷尽 `switch` / 映射表的地方要补 `'scroll-hover'` 分支；读 `ScrollbarApi.type` 或 `data-type` 并按值分派的代码会收到这个新值。

  状态机的两个判据改了名：`isHoverType` → `showsOnHover`、`isScrollType` → `showsOnScroll`（原名在新档下会读成谎话）。判据名只在机器内部与文档的「状态机」小节露面，不进公开 API。

  日志的视口那条 `scrollbar-gutter` 收窄到「还在用原生条」的情形：带 `data-xh-scrollbar` 的容器原生条已被藏成零宽，空道对它没有布局作用。没挂自绘条时空道照留，原生滚动条出现与消失仍不推动文字。

- 35c9b65: 四家分段控件（date-field · time-field · date-picker · time-picker）的盒内布局统一。

  **解剖新增 `segment-group`**：包住全部段位与作者写在段间的分隔符。date-field / time-field /
  time-picker 三家新增这个部件，date-picker 已有的分段容器 `input` 改名为它——四家从此同名同职。
  time-picker 的 `input` 仍是段位本身（多实例），语义不动。

  破坏性改动：

  - `date-picker` 的 `input` 部件改名 `segment-group`，不留别名。
    - `getInputProps` → `getSegmentGroupProps`；`DatePickerInputProps` → `DatePickerSegmentGroupProps`。
    - Vue `XhDatePickerInput` → `XhDatePickerSegmentGroup`。
    - WC `@csspart input` → `@csspart segment-group`（作者标记写 `data-xh-part="segment-group"`）。
  - `--xh-time-field-segment-fg-placeholder` → `--xh-time-field-placeholder-fg`；
    `--xh-time-picker-segment-fg-placeholder` → `--xh-time-picker-placeholder-fg`。
  - `--xh-time-picker-column-max-h` → `--xh-time-picker-column-h`（列改定高）。
  - `--xh-date-picker-content-p` → `--xh-date-picker-content-py` / `-px`；
    `--xh-time-picker-content-p` → `--xh-time-picker-content-py` / `-px`。

  作者要把段位与分隔符挪进 `segment-group` 里，清空钮与展开钮留在 `control` 直属：

  ```html
  <div data-xh-part="control">
    <div data-xh-part="segment-group">
      <span data-xh-part="segment"></span>
      <span>:</span>
      <span data-xh-part="segment"></span>
    </div>
    <button data-xh-part="clear-trigger"></button>
  </div>
  ```

  行为与外观：

  - 尾部按钮一律靠框内末端，靠 `segment-group` 的 `flex: 1 1 auto` 顶；
    time-field 清空钮与 time-picker 展开钮的 `margin-inline-start: auto` 删掉。
  - 四家 `control` 的 `gap` / `block-size` / `padding-inline` / `min-inline-size` 逐条同值，
    `gap` 随尺寸档走 `--xh-control-gap-sm/md/lg`。
  - 时间列定高：`time-picker` 的 `column` 与 `date-picker` 的 `time-column` 走 `--xh-viewport-h-sm`，
    两家的快捷选项列同档；两家浮层补上最大高度。
  - 段位内衬统一 `--xh-space-1`；标题不再写 `cursor`；`:focus-within` 一律带 `:not([data-disabled])`；
    time-picker 聚焦时补画聚焦环；图标尺寸随尺寸档走 `--xh-glyph-size-sm/md/lg`。

- bbc3431: select 浮层多出一个底部操作区：「新建」「全选」这类按钮终于有地方放了。

  原来放不进去有两条硬理由，都不是样式能绕的：`content` 既是 `role="listbox"`
  （而 listbox 只许拥有 option 与 group，塞按钮进去是违规），又是那个 `overflow-y: auto` 的滚动容器
  （放进去的按钮会跟着条目滚走）。所以这次把两件事拆开：

  - **`content` 退成浮层外壳** —— 描边、底色、阴影、整体尺寸与键盘收口归它，它自己不滚。
  - **新增 `list` 部件** —— `role="listbox"`、条目的拥有关系、滚动与那个「无锚点时兜底的 Tab 位」全在它身上。
  - **新增 `footer` 部件** —— `list` 的兄弟。因此它既不进列表框的拥有关系，方向键与连打检索也走不到它，
    条目多到要滚时它仍贴在下沿不动。

  **破坏性变更（alpha 期）**：条目现在要写在 `list` 里。

  - Vue：`<XhSelectContent>` 与条目之间加一层 `<XhSelectList>`；底部操作区用新增的 `<XhSelectFooter>`。
    只传 `collection`、不写插槽的那条路由组件自己铺好，一个字都不用改。
  - Web Components：`<div data-xh-part="content">` 里加一层 `<div data-xh-part="list">` 包住条目。
    `list` 已列进 `requiredParts`，忘了写会在诊断通道上报 `wc.missing-part`，不会静默丢掉列表框语义。
  - `trigger` 的 `aria-controls` 随之改指 `list`（它才是那个列表框）。

- 309feb2: DOM 状态属性收成一套词汇（`tooling/scripts/state-vocabulary.json` 是真源，`check-state-vocabulary` 七条判据守住）。皮肤靠这些 `data-*` 选中状态，使用者的全局规则同样靠它们，所以同一含义只留一个名字：

  - **当前项**：`aria-current` 在 data 侧一律配 `data-current`。anchor 的 `data-active`、carousel 指示点 / pagination 页码 / side-nav 链接的 `data-selected` 都改过来；steps 保持 `data-state=current`（步骤族）。
  - **`data-active` 一名三义退役**：展开 / 选中路径上的祖先改 `data-in-path`（cascader 列项、side-nav 分支），滑杆刻度已被越过改 `data-passed`（slider mark / mark-label）。
  - **混合态一个词**：checkbox-group / table 表头 / transfer 列头的组级汇总 `data-state` 从 `all | some | none` 改为 `checked | unchecked | indeterminate`，与 checkbox 同词（`CheckboxGroupCheckedState` / `TableSelectionState` / `TransferCheckState` 的取值随之改）。
  - **显隐**：有开合交互的 tag，`data-state` 从 `visible | hidden` 改 `open | closed`（机器状态名同改，`onOpenChange` 不变）；派生显隐的 back-top 从布尔 `data-visible` 改 `data-state: visible | hidden`。
  - **折叠**：layout 侧栏从 `data-state=collapsed|expanded` 改布尔 `data-collapsed`，与 side-nav / splitter 同写法。
  - **死属性删除**：button 与 infinite-scroll 根上皮肤零引用的 `data-state`；scroll-area / scrollbar 的 `data-hover`（悬停走 `:hover`）。calendar 格子的 `data-focused` 改 `data-focus`。

  退役的四个属性名（`data-active` / `data-focused` / `data-hover` / `data-visible`）与四个 `data-state` 取值（`all` / `some` / `none` / `collapsed`）是公开面删减，基线已推。

- 8d6e450: 整洁度归队（统一性审计的最后一批）。

  **令牌**：dialog / drawer 的宽度档提为 `--xh-overlay-sheet-w-sm/md/lg`（24/32/48rem）与 `--xh-overlay-drawer-w-sm/md/lg`（16/20/28rem），empty-state / result 的图标档提为 `--xh-glyph-size-xl/2xl/3xl/4xl`；`--xh-control-gap-lg` 此前与 md 恒等，改为 space-3（compact space-2）；补 `--xh-fg-warning` / `--xh-fg-info`（与 success 同构）。tokens README 写明 px 与 rem 的口径，以及「单行控件本体的槽一律叫 control」。

  **皮肤**：number-field 的 `--xh-number-field-input-h` 在 control 上用错部件名，改 `--xh-number-field-control-h`；spinner 三档归 glyph 尺寸族、anchor / pagination / steps / composer / menubar 的内衬对齐 control-px 阶梯；back-top / card / float-button / switch / dynamic-input 的阴影补使用者槽；timeline / typography / field / slider 的字面残留改令牌；30 处与令牌同值却不引令牌的兜底改引（15 处登记理由）；checkbox-group / transfer 的指示符字形与 checkbox 同一配方。菜单与列表族的条目高亮只认 `[data-highlighted]`（菜单族此前还并挂 `:focus` / `:focus-visible`）。

  **无障碍**：select 的触发器按 APG select-only combobox 打 `role=combobox` + `aria-haspopup=listbox` + `aria-controls`（popselect 是按钮式弹出保持 button）；image-viewer 触发器补 `aria-controls`；83 处 `aria-hidden` 统一写布尔；iconOnly 按钮没有 `aria-label` / `aria-labelledby` 时开发模式提醒一次（Vue / WC 把作者写在根节点上的可及名转告连接层）。

  **共享配方**：visually-hidden 的 9 条声明收成 headless 的 `VISUALLY_HIDDEN_STYLE`，六份 connect 引它；七份皮肤各自那份必须与 `visually-hidden.css` 逐条一致。

  **门禁**：`check-literal-fallbacks`（兜底字面量与令牌同值即红）、`check-visually-hidden`、`check-tone-contrast`（自算 oklch → WCAG 对比度，六族 × 两主题 26 组配对，1 组已知例外登记理由）、`check-aria-shapes`（aria-hidden 字符串写法 / listbox 触发器角色）；`check-elevation-role` 增「阴影必须带使用者槽」。

- 032f3fd: 带语气的 outline 控件边框补到 3:1，并修掉上一版留下的一处断链。

  上一版把控件边界迁到 `border.control` 时，如实记了一笔「带语气的 outline 形态够不着 3:1」——
  它走的是 `--xh-_tone-border`（语气色兑 40% 底色），六族在两套主题下是 1.44–2.18。这一版补上。

  新增 `--xh-_tone-border-control`：直接取语气主色本体，不再兑底色。两族在各自的底上仍不够，
  按主题各兜一次——语气色是固定原语、不随主题翻，这是唯一能表达的地方：

  - 黄在白底上只有 2.70，浅色态改取新增的 `--xh-color-warning-700`（3.75）；深色态 600 档就有 7.32，不动。
  - 中性在深色底上只有 2.54，深色态改取 `--xh-color-neutral-550`（3.59）；浅色态 600 档就有 7.80，不动。

  六族 × 两套主题现在最低 3.04（浅色 success），全部达标。

  **调色板新增一档** `--xh-color-warning-700 = oklch(0.62 0.15 70)`。步距 ΔL 0.085，落在同族 700 档的
  区间中间（brand 0.058 / danger 0.077 / success 0.138），色度按同族惯例微降，色相与 600 一致。
  黄族此前只有 500/600 两档，没有更深的档可取，所以必须新增。

  **顺带修掉一处断链**：上一版把 `toggle.css` 的 outline 边框改指了 `--xh-_tone-border-control`，
  而那个槽当时并不存在——`<XhToggle variant="outline" tone="danger">` 的边框一直退到中性色，语气丢了。
  这一版把槽真正建起来，`button` 与 `button-group` 一并接上。

  **新增门禁 `check-private-slots`**：皮肤里消费的每个 `--xh-_*` 私有槽都必须在某份皮肤里声明过，
  声明了没人用的也要删。上面那条断链正是它该拦下的——CSS 不报错、TS 不报错，
  而既有的 `check-token-refs` 整体放行 `--xh-_` 前缀，谁都看不见。拿改动前的仓库实跑过：它红在
  `toggle.css:71`，改完转绿。

- 918b870: 实心底上的前景色与交互态挪动方向改由语气色现推，换肤下配对自动成立。

  `--xh-_tone-on` 此前按语气族写死：brand / neutral / danger 配白字，success / warning / info 配深字。这个分派是按本仓这套 600 档实测出来的，但 `--xh-_tone` 是可换肤的——使用者把各族的 600 改写成自己的调色板，配对的前提就没了，而门禁只验本仓的色，失配一路绿灯。

  改成从 `--xh-_tone` 现推：把语气色转成线性 sRGB 分量、按 WCAG 的权重算出相对亮度，低于 0.179 配白字、高于配深字。0.179 是白字与黑字对比度相等的那一点，解析解，不是估的。

  `--xh-_tone-shift`（交互态往哪个方向挪）一并现推，取前景的反面。只推前景不推方向会出净回归：静态态救回来了，悬停与按下却把底往前景那一侧挪——某消费方调色板上实测 danger 静态 4.70 而悬停掉到 3.78、按下 3.18。

  用相对颜色语法 `color(from … srgb-linear …)`，高于本仓的浏览器地板（Chrome 119 / Firefox 128 / Safari 16.4 起），所以整块包在 `@supports` 里，逐族写死的那一份留着当兜底；探针按实际用到的整个形态测，只测得起半截语法的引擎不会落进坏值。alpha 显式写 1，不然会连语气色的透明度一起继承。

  某消费方调色板上的实测（浅色 / 深色，静态 · 悬停 · 按下）：

  改前 info 3.94 · danger 4.47 不达标
  改后 六族最低 4.70，全部达标

  本仓自己这套色只升不降：success 6.51→6.90、warning 7.36→7.80、info 5.71→6.05、深色 brand 5.32→5.64。

  三条门禁跟着改：

  - `check-tone-contrast` 此前只验写死的那一份。现在把 `@supports` 块单独解析，现推档与兜底档**各验一遍**（158 组配对，原 122 组），并按 tone.css 里那两条式子的形态逐字对账——式子改了形态对不上就失败。
  - `check-css-floor` 新增「受 `@supports` 守卫的增强」这一档并登记相对颜色语法：块外出现即失败。此前它对这条语法是静默的，等于谁都能悄悄抬底线。
  - `check-token-refs` 不再把注释里提到的颜色、`@supports` 的探测条件、以及 `fn(from var(--xh-…) …)` 当成颜色字面量——前两者不落到任何元素上，后者的源色本身就是令牌。

- a69cead: 树补一条 `leafOrientation`：末端那一层可以横排。

  只作用于「子节点全是叶子」的那一层——菜单授权里就是按钮那层。一个菜单下十几个按钮，
  横排一行铺完，省掉大量纵向翻找：

  ```vue
  <XhTreeRoot :collection="menus" leaf-orientation="horizontal" />
  ```

  **中间层与整棵树恒是竖排，不提供开关。** 它们承载的是层级本身，横过来层级就读没了。
  判据是「这一层不再往下分」而不是「深度等于几」：同一棵树里各枝深浅不一，
  按深度判会把浅枝的中间层也横过来。

  **方向键不跟着改。** 树上左右是层级操作（收起 / 展开、回父层 / 进子层）、上下走可见行，
  这是 treeview 的规范语义，横排只是排布。

  顺带修一处：叶子行在竖排下会自己补出「箭头那一格」与同级分支对齐，横排下补出来的
  是节点之间的空隙而不是层级，那条规则因此按行盒**所在的那层容器**判定方向。

- 4abe899: 统一性收口的头两批：先立门禁让跑偏能红，再补语义令牌把皮肤里的原语引用与互异的字面量收成一处。

  **海拔改按角色走。** `--xh-elevation-0…4` 五档删掉，换成三个角色：`raised`（静态抬起面：卡片的 elevated 变体、分段控制器的滑块、滑杆拇指）、`floating`（锚定浮层：下拉、菜单、popover、hover-card、tooltip）、`sheet`（遮罩式与通知：dialog / drawer / toast / tour / floating-panel / float-button / back-top）。深色主题的三档更重、外加一圈 1px 浅描边，暗底上浮层才分得出层。34 份皮肤全部迁过去，`check-elevation-role` 校验每处阴影都走角色、且 27 个浮层/遮罩面的角色与部件对得上。这是公开面的删减，基线已推。

  **字号不再下探原语。** 新增 `--xh-control-font-sm/md/lg`（控件主文字，与 `--xh-control-h-*` 同构按档走）、`--xh-control-caption-sm/md/lg`（控件里的次级文字：提示、计数、快捷键、清空钮，比同档主文字低一级）、`--xh-text-heading-1/2-*`、`--xh-text-caption-size`、`--xh-text-secondary-size`。皮肤里两百三十处 `--xh-font-size-*` 引用全部换成语义档；typography 的六级标题与 rating 的星标是字号阶梯本身，登记为例外。`check-text-scale` 守住。

  **默认宽度、内衬、轨道、折叠面的共享字面量收成令牌。** `--xh-control-min-w`（12rem）统一了 select / combobox / tree-select / cascader / color-picker / date-picker 六个触发器此前的六个值，time-picker / text-field / date-field / time-field / password-input 五家此前没有任何宽度声明，现在同样接上；`--xh-surface-py/px-sm/md` 统一了 dialog / drawer / tour / floating-panel / toast 的内衬；`--xh-track-thickness` / `--xh-track-thumb-size` 给滑杆与进度条；`--xh-nav-link-max-w`、`--xh-viewport-max-h`、`--xh-motion-scale-drag`（减弱动效归 1）、`--xh-glyph-size-text`（跟文字走的字形尺寸）、`--xh-control-box-sm/md/lg`（pin-input 的方格，随 compact 收）、`--xh-switch-track-h-*`、`--xh-syntax-string/number/keyword`（code-block 与 json-viewer 的语法色，随主题明暗切换，皮肤里不再有 hex 字面量）。`check-shared-slots` 新增「同后缀跨组件字面量互异也报」。

  **聚焦态描边统一成一派。** 此前三派：描边不变只画环、描边跟着环色走（语气轴在这一派整个失效）、只画环不管描边。现在 21 份输入类皮肤都写 `border-color: var(--xh-<c>-<part>-border-focus, var(--xh-_tone, var(--xh-border-control-focus)))`，新令牌 `--xh-border-control-focus` 缺省等于 `--xh-border-control`；time-field 聚焦补上了此前缺的环。`check-focus-ring` 加校验。

  **图标尺寸接线。** 38 份画兜底字形的皮肤在 root（浮层族在 content）上声明 `--xh-icon-size: var(--xh-<c>-icon-size, var(--xh-glyph-size-text))`，兜底字形的盒同样按它量——作者往指示符槽塞 `<XhIcon>` 时不再从 1em 跳到 20px。`check-icon-size` 守住。

  **几何修正。** pin-input 的方格此前缺省引的是 lg 档高度、sm 档引 md；segmented 横排外盒此前 38px（item 32 + 轨道内衬 + 描边），现在外盒本身即一档控件高、段撑满轨道内侧；checkbox 的方框锚在 `--xh-control-indicator-size` 上随 compact 收；checkbox-group 的指示符不再是 16px 字面量。radio-group / checkbox-group / composer 的禁用态去掉叠加的不透明度（与容器一起变淡会把对比度压穿）。

  **门禁。** 新增 `check-stroke-scale`（描边宽度只走 `--xh-stroke-*` / ring）、`check-keyboard-suites`（键盘表非空 ⇒ 一致性套件存在且两个适配器都登记）；`check-control-height` 按「组件 → 控件本体部件」显式管辖（button / toggle / segmented / pagination 等此前在门禁外）并校验 sm/md/lg 档位与 `data-size` 对应；`check-disabled-contrast` 改正则并加跨块判定；`check-shape-scale` 扩到逻辑角与私有槽；`check-keyframe-refs` 增扫适配器源码里的内联动画名（反馈服务的加载徽记改用 Web Animations，不再依赖某份皮肤在场）；`check-state-vocabulary` 接上 `state-vocabulary.json` 真源（`data-state` 的 43 个取值分 9 个族，connect 字面量与皮肤选择器两头对表，并报告「发射但零引用」的属性）；`check-token-refs` 禁皮肤里的颜色字面量。

  **套件。** 补 image-viewer（8 行键盘表，Tab 循环两行 jsdom 豁免）与 side-nav（10 行含折叠态弹出）的一致性套件，Vue 与 WC 两侧登记。

- 35c9b65: 相似组件与组合组件的视觉、动效、行为收成一套口径。

  **盒的定义统一了。** 此前 16 个输入 / 选择控件有三种「盒」：9 家由 `control` 画描边与底、5 家由 `trigger`（一个 `<button>`）当盒、2 家由 `input` 自画。盒是 button 的那 5 家（select · cascader · tree-select · popselect · color-picker）没法把清空钮放进框里，只能贴在框外——这就是「清空钮位置不统一」的总根因。现在判据只有一条：**解剖里有 `control` 就是盒**，`trigger` 退化成盒内那颗 `flex: 1 1 auto; border: 0; background: transparent` 的按钮，聚焦环改画在 `control:focus-within` 上。cascader / tree-select / popselect / color-picker / text-field 的解剖新增 `control` 部件。

  **尾部按钮一律在框内最右。** 盒内布局恒为「内容区 `flex: 1` → 尾钮组 `flex: none`」。段位并排、没有单一容器的四家（date-field · time-field · date-picker · time-picker）新增 `segment-group` 部件把段位与分隔符包起来当内容区（date-picker 原有的 `input` 分段容器改名 `segment-group`，四家从此同名同职），`margin-inline-start: auto` 那套 hack 删掉。行内动作钮（清空 / 展开 / 明暗切换 / 加减）一律 `--xh-control-action-size` 方钮——number-field 的加减钮与 password-input 的明暗钮此前是「贴边的控件高钮」。

  **并排成对的面板定高。** 新增 `--xh-viewport-h-sm/md/lg`（12/16/24rem，compact 同比例收）。transfer 两侧列表此前是 `min 8rem / max 16rem`，条目搬走后整个组件跟着变矮——现在定高 `--xh-viewport-h-md`，左右等高、空侧也占满。cascader 的列、date-picker / time-picker 的时间列同样定高；单个浮层面板仍内容驱动，但补上了此前缺失的高度上限。

  **菜单族三家逐条同值。** `menu` / `menubar` / `context-menu` 共用同一台机器，皮肤却各写各的：menubar 根本没有 `item[data-state='open']` 这条规则，所以「发送到…」展开时不像 menu 那样加粗高亮。现在条目内衬 / 字号 / 圆角 / 行高 / 展开态 / 高亮态 / `content` 外观 / `separator` / `group-label` 全族同值，menu 补齐 `group` / `group-label` / `separator` 部件，子菜单箭头走字形令牌。navigation-menu 与 side-nav 的弹出面板按同族口径归队。

  **浮层面板与输入族小件归队。** `content` 一律双槽内衬 + 族档 min-w / max-w；cascader 的 48rem、color-picker 的 15rem、tour 的 22rem 等裸值改令牌（新增 `--xh-overlay-max-w-xl`）；label 颜色与间距、图标尺寸随档、聚焦环私有槽（invalid 时变红）、`:focus-within` 的禁用守卫、disabled / readonly 的三样齐——逐条统一。password-input 的明暗钮用上了新的 `--xh-glyph-mark-eye` / `-eye-off` 字形令牌。

  **门禁**：`check-control-box`（盒结构 12 条判据）、`check-panel-height`（面板高度只走滚动面令牌、并排面板必须定高）、`check-family-parity`（菜单族 / 分段族 / 下拉族 / 气泡族逐条同值）。

  公开面：五家 `--xh-<c>-trigger-*` → `--xh-<c>-control-*` 槽改名、date-picker 的 `input` 部件与 `XhDatePickerInput` 组件改名 `segment-group` / `XhDatePickerSegmentGroup`、`--xh-hover-card-font-size` 与 transfer 的 `-list-min-h` / `-list-max-h` 删除，共 43 项，基线已推。

- 520b847: 周序号成为一等部件 `week-number`，不再由使用者自己拼一列出来。

  上一版只把数字算出来（`panel.weekNumbers`），列宽得作者用行内 `grid-template-columns` 自己撑，
  库不管它的皮——同一份东西在不同项目里会长得不一样，这不是组件库该留的样子。

  - 解剖新增 `week-number`（可选部件，不写即不渲染），语义是这一行的表头（`role=rowheader`）：
    在 `role=grid` 里，一行的标号本就该是 rowheader，而不是又一个可选的格子
  - `getWeekNumberProps` / `getWeekNumberText` 两条，文字由两个适配器各自填，保证同构；
    表头那一格是占位、不带值，解析不了不抛、给空串占住列宽
  - 皮肤接管列宽与字样：摆了周序号格的行自动让出行首一列
    （`--xh-calendar-week-number-w`，默认 2.25rem），数字比日子小一号、颜色压下去、不跟着选中态走
  - 新增 `XhCalendarWeekNumber` / `XhDatePickerWeekNumber`；WC 侧写
    `<span data-xh-part="week-number" value="行首那天">` 即可

  选择器那条列宽规则写的是 `:not([hidden]):has(...)`——同特指度的规则谁在后面谁赢，
  不带这一道的话收起态会被这条 `display` 掀开（上一轮刚栽过一次，已有门禁拦着）。

### Patch Changes

- 33af800: 角标的三档尺寸：每一档的盒都抬到大于字号。

  原先 sm 档的盒高与字号都是 12px，两位数会把角标撑破。字号刻度最小就是 12px
  （`--xh-font-size-xs`），所以往上抬盒子而不是往下压字：盒 16 / 20 / 24，
  字 12 / 13 / 14，圆点 6 / 8 / 10，三条阶梯各自严格递增。

- a55c76e: 日历补上快速翻年、周选整周预览，日期示例按粒度重整。

  **« / » 快速翻**：新增 `prev-year-trigger` / `next-year-trigger` 两个可选部件（不写即不渲染），
  步长跟着视图走——日视图一年，月与季度十年，年视图一百年（它的 `‹ ›` 本来就走十年，
  大步得更大才有用）。边界与 `‹ ›` 各判各的：上界卡在今年之内时，下一页还翻得动、整年跳出去就按不动了。

  **周选悬停整周亮**：`weekSelection` 下指针扫过哪一行哪一行整整七天一起亮，与点下去的结果对得上。
  此前沿用的是「起点 → 悬停点」那一段，一格一格拉出来的区间在周选里讲不通。不开周选时照旧。

  **示例重整**

  - 天 / 周 / 月 / 季度 / 年归拢成一个「五种粒度」示例，一套结构走完
  - 「区间选择」补齐五种粒度，都是并排两页
  - 删掉旧的「按月选择」——它是 `view` 出现之前手搓的一版面板（拿 `XhButton` 拼的），
    与新的 `view="month"` 长相不一致；它想演的「输入行只留年月两段」并进新示例，
    按年挑就只留年那一段

- 9294172: 日历的「大步翻」两颗钮不再被无条件收掉，« » 与 ‹ › 同一副长相。

  四条规则的选择器列表里，限定只跟在后两条上：`[data-part='prev-year-trigger'], [data-part='prev-trigger'][hidden], [data-part='next-year-trigger'], [data-part='next-trigger'][hidden]` —— 年那两颗是裸的，于是无条件命中 `display: none`，翻年的钮从来就没画出来过。行为层一直是通的（`canGoPrevYear` / `stepYear` / `getPrevYearTriggerProps` 都在），只是看不见也点不着。

  同样的漏写还在悬停、禁用、聚焦环三条上：那三条把月钮的状态样式无条件加在了年钮身上。四条一并补齐限定。

  新增 `tests/browser/calendar-nav-skin.spec.ts` 钉住：四颗翻页钮都画得出来、同一副尺寸，打上 `hidden` 才收起，禁用态四颗同一副长相。这类「被一条 display 悄悄收掉」只有在真实浏览器里按级联算才验得出来。

- bae3231: combobox 展开按钮翻面改为只转箭头字形（或作者塞的图形），不再旋转按钮本体：按钮自带悬停底色，整体旋转会带着底色一起转出一个歪斜的方块。
- 9da2444: 修：区间选择器的浮层恒亮、糊在视口左上角、怎么点都关不掉。

  多面板那一版给 `content` 加了条 `:has(> calendar + calendar)` 的横排规则。它与上面那条
  `[data-part='content'][hidden] { display: none }` 特指度相同（都是 0-3-0），却排在它后面，
  于是收起态被它掀开：浮层一直显示，又因为定位引擎只在展开时跑、坐标恒为 0，就糊在视口左上角。
  只有区间那一个示例中招——它是唯一摆了两张日历的。

  选择器补上 `:not([hidden])`，与顺序、特指度都无关了。

  同时新增门禁 `check-hidden-override`：某个 part 已经有 `[hidden]` 兜底，其后又有规则把
  display 改回非 none 且没带 `[hidden]` / `:not([hidden])` 的，一律拦下。
  拿这次的坏规则反向验证过：去掉 `:not([hidden])` 当场报错并指到行号。
  全仓 109 份皮肤 · 314 条兜底扫下来，此前只有这一处。

- 8a44b64: 四处被祖先 `overflow` 裁掉的聚焦环改成往内收。

  `outline` + 正的 `outline-offset` 把环画在元素盒外面，祖先只要是
  `overflow: hidden / auto / scroll`，环就会被裁掉一截——键盘用户看到的是
  三条边或者两侧缺口的半圈蓝环。四处改为 `outline-offset: calc(-1 * var(--xh-ring-width))`，
  环整圈落在盒内：

  - image-cropper 的 `crop-area` 与 `crop-handle`：两者都长在 `viewport` 里，
    那层 `overflow: hidden` 同时还替暗遮罩（`box-shadow: 0 0 0 9999px`）收边。
  - heatmap 的 `grid`：`root` 为一整年五十几列备了 `overflow-x: auto`。
  - table 与 transfer 的 `select-all-trigger`：同文件的邻居
    （table 的 `row` / `sort-trigger`、transfer 的 `search` / `item`）本就是内收写法，
    这两处是仅剩的外扩。

  `--xh-ring-offset` 令牌本身不动：库里另有 9 条规则写着
  `calc(-1 * var(--xh-ring-offset))`，翻令牌的符号会把它们一起翻成外扩。

- 1b7a5f1: 统一性审计收口后的六条遗留项。

  **px 与 rem 按口径归位。** 字号七档 `--xh-font-size-xs…3xl` 从 px 改为 rem（0.75 / 0.8125 / 0.875 / 1 / 1.125 / 1.375 / 1.75rem，根字号 16 时像素不变，使用者改根字号时整套排版随之缩放）；字形与控件几何改为 px：`--xh-glyph-size-sm/md/lg` 16 / 20 / 24px、`--xh-glyph-size-xl…4xl` 32 / 40 / 56 / 72px、`--xh-control-action-size` 24px（compact 20px）、`--xh-control-indicator-size` 16px（compact 14px）；color-picker 的动作钮与色块同样归 px。

  **side-nav 折叠态换枝播退场。** 机器里弹出面板的坐标改为按分支记账（`popoutPlacements`），换枝时旧面板保留坐标、`data-state=closed` 播 `xh-pop-out`，新面板同帧 `open` 播 `xh-pop-in`；此前旧面板的坐标在新枝 OPEN 那一拍被作废，退场瞬时。

  **tree-select 的 Vue Root 补 collection 自动渲染树。** 没给默认插槽且传了 `collection` 时自动铺 label? / trigger / clear-trigger? / positioner / content / tree（分支与叶子递归），新增 `label` prop 与插槽、`clearable` prop（缺省 false）；自动树与手写树 DOM 逐字同构，与 select / combobox 同口径。

  **门禁与测试整洁。** 三道浮层门禁共用 `tooling/scripts/lib/overlay-families.mjs`（名单与核实逻辑一份，各门禁的子集差异写明）；27 处测试里为旧 kernel 缺省桩的 `matchMedia` 删掉（减弱动效探测无 matchMedia 时已一律不减弱）。

- 177b3c3: 三道新门禁把版本政策里「只靠自觉」的条款焊成机器检查，`pnpm gate` 由二十项变二十三项。

  - **`check-css-floor`**：`.browserslistrc` 书面记录浏览器硬底线，拒绝名单拦住 `@container`
    这类无兜底的抬底线特性（`@scope`、`@starting-style`、`view-transition`、滚动驱动动画、
    CSS 嵌套等），`light-dark()` / `dvh` 必须同级联兜底；`field-sizing` 的退化路径在 HTML 侧，
    按文件白名单放行。
  - **`check-version-lock`**：17 个库包的 `package.json` 必须同版本。此前改一个包的 version
    而不动其余 16 个没有任何门禁会响，锁步发版只靠自觉。
  - **`check-wiring`**：`tooling/scripts` 里每个检查脚本都必须接进某个 pnpm script——写了不接线
    等于没写，死引用同样被拦下。

  同时 `check-slot-types` 补上第四条判据：写进 `SlotsType` 却从不渲染的插槽（消费方合法传进来的
  `#slot` 会被静默吞掉），裸引用 `slots.item` 整体传给 helper 的 collection 族用法计入「用过」。

- ed51531: 菜单族的勾选标记跟着语气走。

  `context-menu` 与 `menubar` 都有 `tone` 轴、也都在根上发 `data-tone`，但 `item-indicator`
  的颜色写死在 `--xh-fg-brand`：把菜单标成 `tone="danger"`，整条菜单换了族，勾选标记还是品牌蓝。
  同族的 `select` / `popselect` / `combobox` / `cascader` / `tree-select` 五家早就是跟着语气走的，
  只有这两家掉队。

  两家的颜色链改成 `var(--xh-<组件>-item-indicator-fg, var(--xh-_tone, var(--xh-fg-brand)))`：
  写了语气跟语气，没写落回 `--xh-fg-brand`——**没写 `tone` 的用法一个像素都不变**。
  `listbox` 不动，它没有语气轴，链尾就是全部。

- ac885c9: number-field 新增可选 `control` 部件:加减按钮叠进输入框内,与输入框成为视觉一体。

  此前加减钮与输入框是兄弟节点,受 HTML 约束进不了框内,只能三件并排。现在把输入框与两个按钮
  放进 `control` 部件,皮肤把描边、底色、聚焦环(改为 `:focus-within`)整体画在 control 上:
  框内 input 退成透明,减钮在左、加钮在右、输入框居中(顺序由作者模板决定),前后缀图标/文字
  直接流式插在 input 两侧,不用绝对定位;悬停/按下/贴边禁用沿用原有语义色。

  - **Vue**:新增 `XhNumberFieldControl`;`data-disabled` / `data-readonly` / `data-invalid`
    三个状态属性由 connect 落到 control 上。
  - **Web Components**:作者写 `<div data-xh-part="control">` 包裹即得同样的一体式。
  - **不写 control 时完全退回旧观感**:control 是可选部件,旧模板一行不改照常渲染,三档
    variant / tone / size 与旧式并排布局一致。

  一致性测试的 fixture 改成一体的 control 结构,两个适配器的 conformance 同步通过。

- 0a056e6: number-field 的 `control` 收成一枚整件:一道描边、一个圆角、一枚聚焦环,盒里再无第二条边界。

  此前盒内的加减钮仍带着独立版的灰底与自己的圆角,白底的框上贴着两块灰、圆角还比框的内角大一档
  顶到描边外面,一枚控件被读成三块拼起来的。现在盒内三段一律透明,底色、描边、圆角全部只由
  control 画一次,符号取次级前景、悬停与按下才浮出底色,贴住 min / max 的那一侧只压灰符号而不再铺灰底。

  - 两端圆角取盒子的内圆角(`圆角 - 描边`),并按 `:first-child` / `:last-child` 认位置——
    三件的先后由作者模板定,减钮不一定在最前面(库内 `12-precision` / `13-change-timing` 两例即是输入框在前)。
  - 盒内输入框默认居中、默认宽 `5em`,不写行内样式也是一枚齐整的步进器;
    可用 `--xh-number-field-input-align` 与 `--xh-number-field-input-w` 改。
  - control 由 `align-items: stretch` 改成 `center`:作者插在框里的前后缀文字此前被拉满整框高度,
    字贴着框顶;输入框与加减钮各自明写撑满,不受影响。
  - 不写 `control` 的三件并排布局一行未动。

- 7a5d898: 漏引皮肤不再静默：新增 `startSkinCheck()` 开发期探测与 `styles.missing-skin` 诊断码。

  按需引皮肤时漏掉一行原本是这个库最难查的失效：那个组件的 `data-scope` / `data-part` 照常都在、
  别的皮肤也确实加载了，只有它渲染成没有内边距、没有底色的裸元素，看起来像组件坏了而不是少引了一行。
  这一条正是「按组件挑」在真实项目里立不住的根本原因。

  每份组件皮肤现在在自己的 `[data-scope='X']` 上落一个 `--xh-X-skin` 标记（104 份）。
  `startSkinCheck()` 扫页面上出现过的每个 scope，取不到标记就报诊断：

  ```ts
  if (import.meta.env.DEV) {
    const { startSkinCheck } = await import("@xihan-ui/kernel/skin-check");
    startSkinCheck();
  }
  ```

  ```
  [xh][button] [styles] button 的皮肤没引：import '@xihan-ui/styles/button.css'，或改引全量的 '@xihan-ui/styles'
  ```

  两处刻意的取舍：

  - **每个 scope 只探一次。** 探测要读计算样式，逐实例探是真实的强制样式重算；一个 scope 的皮肤
    在不在场与实例数无关，探一次就够。
  - **标记落在 `[data-scope='X']` 而不是 root 部件上。** 浮层族的 `content` 被 portal 到 body，
    不在 root 的子树里，只在 root 上声明的话自定义属性继承不过去，这些部件会误报。

  探测器走 `@xihan-ui/kernel/skin-check` 子路径而不是主入口：它是开发期工具，不该躺在每个消费方都会打包的那条入口里（放主入口会让 kernel 的体积棘轮超 118 B，那条棘轮量的正是整包）。

  新增 `check-skin-markers` 门禁守住 104 份皮肤的标记齐全——漏一份，那个组件就退回静默失效，
  而且探测器还一声不吭。`pnpm gate` 十九项 → 二十项。

- 93fe061: `light-dark()` 与 `dvh` 补上级联兜底，旧引擎不再靠解析失效退化。

  `code-block` 的三种语法色原本只有 `light-dark(...)` 一条声明，不认它的引擎里整条声明被丢弃，
  变量取不到、靠消费点的 `var()` 失效继承出单色——退化是碰巧成立的，不是写出来的。
  `layout` 侧栏的 `100dvh` 上限同理。现在两条都按「先旧后新」的级联兜底写法：旧引擎保留前一条。

  改动由新增的 `check-css-floor` 门禁保证不会再回潮（见同一批提交）。

- 59c86fa: 新增 `check-style-entries` 门禁：每份皮肤都必须进得了全量入口、也够得着按需入口。

  `index.css` 的 `@import` 清单是手工维护的，`package.json` 的子路径导出也是。两处任何一处漏了，
  结果都是静默的：漏进 `index.css`，全量引入的人拿不到那份皮肤，组件渲染成裸元素；
  漏了子路径导出，按需引入的人根本 import 不到它。今天 109 份皮肤两处齐全，但没有任何东西守着。

  门禁同时把「按需产物的顺序只能由 `index.css` 过滤得来」钉在这里。同一个 `@layer xihan.components`
  内，等特异性的规则靠源序定胜负；另起一套排序（按字母、按目录读取序）今天看不出差别——
  当前仅有的 3 处跨 scope 规则在两种排序下相对次序恰好一致——但那正是它危险的地方：
  将来加进第四处，按需引入的人就会与全量引入的人渲染不同，而且全绿。

  `installation.md` 的「样式的三种接法」如实补上第二种要自己扛的两条风险，并给出体积口径
  （全量 51 kB gzip，含令牌与 109 份皮肤），建议没有明确体积压力就用全量。

- c8c7c18: 修复 `index.css` 的级联层序：`layers.css` 的层序声明挪到入口最顶。此前 tokens 与部分组件皮肤抢先立层，实际层序成了 `tokens < components < reset < motion < overrides`，`reset` 的 `font: inherit` 会压掉表单控件皮肤的 `font-size`。date-picker 的 showTime 皮肤同步从 motion 层归位 components 层。仅分层入口受影响，`index.unlayered.css` 行为不变。
- 3ed6b9f: 描边档的标签改用「可操作区边界」那一档语气色，轮廓看得清了。

  `outline` 的边就是这枚标签的全部轮廓——它没有底色，边没了就只剩一行字。此前取的是 `--xh-_tone-border`（语气色兑四成面色），而 tone.css 自己就注明这一支六族都落在 1.44–2.18，当轮廓根本分不出边界。

  改取 `--xh-_tone-border-control`：那一支是为「可操作区边界要 3:1」准备的，取的是语气本体。在某消费方的调色板上实测，边相对面从 1.59–1.76 抬到 4.56–7.83（浅色）、2.13–3.42（深色），文字那一档没动（5.14–9.35）。

  `--xh-tag-border` 这个使用者槽仍排在最前，要另配一档边照旧写它。

- 87f5b73: 装饰档 `--xh-_tone-soft` 从 500 提到与控件边界同一档

  色条、指示条、锚点高亮这些用装饰档画的东西是非文字图形，按 WCAG 1.4.11 要 3:1。
  500 档压在浅色画布上，success 2.29、warning 1.92、info 2.75 都够不到。

  `--xh-_tone-border-control` 早就为同一个阈值兜过底（warning 在浅色下取 700、
  neutral 在深色下取 550），要求完全一样，装饰档就直接跟着那一支走，六族十二组全部达标。
  `check-tone-contrast` 补上这条断言，覆盖从 110 组扩到 122 组。

  观感上所有色条、时间线指示点、锚点高亮会比原来重一档。

- b6fb182: 叶子行补上箭头那一格的缩进，不再比同级分支往行首缩。

  分支行的首格是展开箭头，叶子行没有这一格。作者摆了 `item-indicator` 时由它顶着，
  可勾选档的首位直接是 `item-checkbox`——没有东西占位，叶子的文字就比所在分支的文字
  往行首缩了一个间隙，第三级与第二级挤在同一条竖线上，层级关系读不出来。

  行盒改为在没有 `item-indicator` 时自己补出这一格（`:has()` 判定，摆了指示符的那档
  不受影响、不会被重复缩进）。宽度取的是箭头与指示符共用的那两个令牌，
  覆盖 `--xh-tree-indicator-size` / `--xh-tree-row-gap` 时跟着走。

- Updated dependencies [9ea57f6]
- Updated dependencies [f72664d]
- Updated dependencies [3469066]
- Updated dependencies [bc65cb7]
- Updated dependencies [1b7a5f1]
- Updated dependencies [f154e07]
- Updated dependencies [1e90ce6]
- Updated dependencies [091bbef]
- Updated dependencies [ec93d6b]
- Updated dependencies [8d35702]
- Updated dependencies [89d8c54]
- Updated dependencies [516bd46]
- Updated dependencies [9548330]
- Updated dependencies [8d6e450]
- Updated dependencies [032f3fd]
- Updated dependencies [4abe899]
- Updated dependencies [35c9b65]
  - @xihan-ui/tokens@1.0.0

## 1.0.0-preview.0

### Major Changes

- bc7eeed: 徽标收窄成「只做角标」，并补齐角标该有的能力。

  原先 badge 与 tag 是一对孪生：`variant` 三形态、`size` 三档、默认插槽放任意内容，
  连档位取值都逐个相同。两个组件做同一件事，使用者只能靠猜。

  现在 badge 只做一件事——挂在别的元素角上的一枚标记：

  ```vue
  <XhBadge :count="5" tone="danger" label="5 条未读">
    <XhButton>收件箱</XhButton>
  </XhBadge>
  ```

  - 解剖从单层 `root` 变成 `root`（锚点）+ `indicator`（角标），定位归组件自己管，
    不再要宿主手写 `position: relative` 与负偏移。
  - 新增 `placement`：`top-end`（默认）/ `top-start` / `bottom-end` / `bottom-start`，
    用逻辑属性写，rtl 下自动落到另一侧。
  - `size` 换的是圆点直径、两位数时的最小宽度与字号，不再是药丸那套内衬与行高。
  - Vue 侧另出 `XhBadgeRoot` / `XhBadgeIndicator`，要往角标里塞自定义内容时用它们。

  **破坏性**：删掉 `variant`；行内的状态药丸请改用 `tag`（`XhTagRoot` + `XhTagLabel`）。
  `data-size` 与 `data-tone` 从 `root` 挪到 `indicator`。

- 3c033ca: 通知按卡片重排：左侧类型字形、右上角关闭钮、两列网格。

  它的皮肤是从旧的 toast 卡片逐字搬来的，搬完没人按「通知该长什么样」审过一遍，
  于是留下三处硬伤：

  - **叉掉到了卡片左下方**。`item` 是竖排 flex，而叉上写着
    `align-self: flex-start` + `margin-inline-start: auto`——交叉轴上的 auto 外边距
    会让对齐属性整条失效（flexbox §9.6），`align-self` 那行一点作用都没有，
    叉成了正文下面的第三行。实测它落在距卡片顶 55px 处，卡片因此高出一截。
    三家参考实现（Ant Design / Element Plus / Naive UI）都是绝对定位钉在右上角内衬处。
  - **组件路径下一个类型指示物都没有**。徽记只由服务档的默认模板画，
    12 份示例与所有 Web Components 使用者拿到的卡片，语气全靠起始侧那条 4px 色条承载，
    而它压在卡片底上只有 1.9–2.8:1，`loading` 与 `info` 除颜色外完全同形。
  - **字号比轻提示还小一档**（13px），标题与说明只差 7.7%，两层文字挤成一片。

  现在：

  - 新增 `item-indicator` 部件。作者留空即由皮肤按 `data-type` 画一枚兜底字形
    （info / success / warning / error 各一枚，`loading` 给转圈），
    颜色取 `--xh-_tone-fg`——与 alert 的状态图标同档，压在卡片底上十二组最低 4.08:1。
  - **两列网格**：左列字形、右列标题与说明；叉绝对定位钉在右上角，标题自动让位
    （写法照 dialog / drawer）。起始侧那条语气色条随之删除——三家都没有，
    语气改由字形承载。
  - 卡片宽 320 → 384px（`--xh-overlay-max-w-lg`，与 Ant Design 同值），
    内衬四边 16px，字号回到正文档 14px。
  - 服务档的默认模板改成四个节点平铺（不再套一层皮肤够不着的行容器），
    说明部件恒渲染——`aria-describedby` 是无条件发的，节点缺席就成了悬空引用。
  - 地标 `role="region"` 从 `root` 搬到 `group`。root 是 `display: contents` 的作用域包装，
    量出来 0×0，地标挂在它身上跳过去落不到任何看得见的地方；那一摞才是真盒子。

  顺带补上三处从来没有门禁看管的地方：`check-elevation-role`、`check-press-feedback`、
  `check-clear-trigger` 三份名单都没登记过 notification，眼下合规纯属巧合。

  **破坏性**：删掉 `--xh-notification-accent` 与 `--xh-notification-accent-width`
  两个覆盖槽（色条没了）。另有几个槽的默认值变了：`--xh-notification-w`（20rem → 24rem）、
  `--xh-notification-py` / `-px`（12/16 → 16/16）、`--xh-notification-font-size`（13 → 14）、
  `--xh-notification-gap` 的语义从「行距」改为「图标与正文的列距」（行距另开
  `--xh-notification-row-gap`）。地标从 root 挪到 group，按 `root[role=region]` 写过
  自动化断言的要跟着改。

- 1590d92: Select 的盒不再自带宽度上限，框宽交回布局；视觉行为变更。

  `[data-part='control']` 上原有一条 `max-inline-size`，兜底取 `--xh-overlay-max-w`（20rem / 320px）。
  浮层的宽度预算被搬到了在流内排布的表单控件上：格子一旦宽过 320px，select 就停在 320px 不再跟着长——
  两列栅格的弹窗里，左边的 select 比右边的数字输入框窄一截。硬上限也不是必需的：`value-text` 与
  `trigger` 各有 `min-inline-size: 0` 配省略号，长值撑不破盒。

  同族的 cascader / tree-select / popselect / color-picker，以及 text-field / number-field，
  control 上都没有上限，select 是唯一一家。这条删掉之后全族同形。

  破坏性变更：**覆盖槽 `--xh-select-control-max-w` 随之移除**。此前写过
  `--xh-select-control-max-w: 24rem` 的，改在自己的布局层给 select 的根或所在格子写宽度
  （`inline-size` / `max-inline-size`），效果一致且对同族其余控件通用。

  `check-family-parity` 的下拉族 control 名单补上 `max-inline-size`：往后任何一家单独给盒封顶都会被拦下。
  公开面基线（`tooling/public-surface.json`）需随本次改动跑一次 `pnpm surface:update`。

- f4d3708: 轻提示改成短消息的样子：顶部居中、宽度包着内容、一行图标加一句话。

  上一版把 toast 从通知卡片收窄成操作反馈时只动了结构，皮肤还是照着卡片那份抄的——
  定宽 320px、竖排、起始侧一条 4px 语气色条、行尾一颗叉。一句「已保存」于是撑成一个
  方块，右边留着一大片空白，看着仍然像一则公告。

  现在它是这样：

  ```
  ┌──────────────────┐
  │  ✓  已保存        │   ← 贴着文字收缩，顶部居中
  └──────────────────┘
  ```

  - **收缩包裹**：`inline-size` 的默认值从 `--xh-overlay-max-w` 改成 `auto`，
    上限压在 `min(48rem, 100%)`，长文案在上限处换行、仍然居中。
  - **单行横排**：`flex-direction` 去掉，`align-items: center`；标题吃掉剩余宽度，
    操作钮与叉自动落到行尾（两者不再 `align-self: flex-start`）。
  - **矮一档**：纵内衬从面档（12px）换成控件档 `--xh-field-py`（8px），条子高 39px，
    与 Element Plus message 的 39px 齐平、比 Ant Design message 的 40px 矮 1px。
  - **语气走淡底**：底与描边取语气层的 `--xh-_tone-subtle` / `--xh-_tone-border`
    （与 alert 同一套口径），正文留中性——正文也跟着兑成语气色的话，绿字压绿底是整条里
    对比度最差的一处。起始侧那条 4px 色条随之删除。
  - **字号回到正文档**：13px → 14px；标题不再加粗、不再换行高，一句话的反馈没有主次之分。
  - **状态字形不带圆底**：服务档的默认模板改用新的 `typeGlyph`（16px 裸字形，颜色取
    `--xh-_tone-fg`，与 alert 的状态图标同档），圆底徽记 `typeBadge` 留给对话框那种有余裕的版面（通知的类型字形由皮肤在 `item-indicator` 上画）。
  - **到点自己走的不出关闭按钮**：`createToastService` 的默认模板据此分两档——
    会自己消失的不出叉（三家参考实现都是这样），`loading` 与 `duration <= 0` 这种走不掉的
    反过来默认出叉，否则界面上一个可点、可聚焦的节点都没有。两档都能用 `closable` 显式改口。

  **破坏性**：删掉 `--xh-toast-accent` 与 `--xh-toast-accent-width` 两个覆盖槽（色条没了）。
  另有四个槽的默认值变了：`--xh-toast-w`（20rem → auto）、`--xh-toast-bg`
  （`--xh-bg-surface-raised` → 语气淡底）、`--xh-toast-border`（中性 → 语气描边）、
  `--xh-toast-title-font-weight`（semibold → regular）；`--xh-toast-close-size` 的默认值
  从 `--xh-control-h-sm`（28px）降到 `--xh-control-action-size`（24px）。
  靠「轻提示是 320px 定宽」做过对齐、或依赖默认那颗叉关闭常驻提示的用法要跟着改。

- 5a1aedd: 轻提示与通知分家：新增 notification，toast 收窄成操作反馈，toaster 删除。

  原先 toast 一个组件担了两件事——「用户刚点了一下，告诉他结果」和「系统主动推来一条消息」。
  两者的信息量、停留时长、落位习惯、谁触发都不一样，混在一起的结果是标题加正文两层文本、
  九宫格落位、堆叠上限这些只有后者需要的东西全压在轻提示上，而轻提示自己反倒要靠一个
  额外的容器组件才能用起来。

  **通知（新增）**

  ```vue
  <XhNotificationRoot v-slot="{ create, dismiss }">
    <XhNotificationGroup>
      <template #default="{ item }">
        <XhNotificationItem :id="item.id" :title="item.title" :description="item.description">
          <XhNotificationItemIndicator />
          <XhNotificationItemTitle />
          <XhNotificationItemDescription />
          <XhNotificationItemCloseTrigger />
        </XhNotificationItem>
      </template>
    </XhNotificationGroup>
  </XhNotificationRoot>
  ```

  队列与卡片是同一个组件的两层：`root`（队列的作用域包装）/ `group`（某个位置上的那一摞，也是 `role=region` 的地标）/ `item` 起是单条卡片。
  九宫格落位、`max` 上限、同 id 就地改写、逐条计时与暂停都在这里。
  Web Components 侧是 `<xh-notification>` 与 `<xh-notification-item>`。

  单条卡片的生命周期复用 toast 那台机器——「会自己消失的卡片」这一行为与消息来源无关。

  通知另有命令式的 `createNotificationService`：推送连接的回调、后台任务的收尾、
  拦截器里的一条系统消息，调用点都在组件之外，让它们各自去找一份队列上下文并不现实。
  队列要长在页面结构里（通知中心那一栏自己排版）时用组件形态，两者不共享队列。

  **轻提示（收窄）**

  - 解剖去掉 `description`：一次操作的结果一句话说得完，说不完的那是通知。
  - 新增 `group` 部件：同时在场的几条叠成一摞。这一摞由全局服务渲染，没有对应的容器组件——
    反馈落在哪儿是整个服务的口径，不该让每个业务页面各挂一份容器再各自决定。
  - `createToastService` 的队列改为服务内部私有，`info` / `success` / `warning` / `error` /
    `loading` / `create` / `update` / `dismiss` / `dismissAll` 签名不变，调用点零改动。
    服务选项新增 `placement`（默认 `top`）、`max`（默认 5）、`gap`。

  **破坏性**

  - 删除 toaster：`XhToasterRoot` / `XhToasterGroup` / `useToaster` / `<xh-toaster>` /
    `connectToaster` / `toasterMachine` / `toasterAnatomy` / `@xihan-ui/styles/toaster.css` 等
    一并移除。组件树内的通知队列改用 notification，命令式轻提示继续用 `createToastService`。
  - toast 删掉 `description` 部件与 `getDescriptionProps`；`<xh-toast>` 的 `description` 属性同时移除。
    机器上的 `description` prop 保留——notification 的卡片复用同一台机器。
  - `ToastOptions` / `ToastRecord` 不再带 `placement`：轻提示的落位归服务，不逐条各去一处。
  - 覆盖槽 `--xh-toaster-inset` / `--xh-toaster-layer` 改名为 `--xh-notification-inset` /
    `--xh-notification-layer`；`--xh-toast-description-*` 随部件一起移除。

### Minor Changes

- 7f8021e: 日期区间的框选改成逐行横杠，面板数按区间跨不跨页现算，面板号写在日历上一处即可。

  **区间底色画成了一整块实心方块。** 底色铺在格子的背景上，格子上下的内衬也算背景区，
  而行与行之间没有间距——七月一整月被选中时，五行底色首尾相接连成一个大方块，
  两端那两枚圆点像是被按在方块上，看不出区间是一天一天连起来的。

  底色改由格子的 `::before` 铺：横向铺满格子，相邻两格接成一条；纵向收在格子内衬里，
  行与行之间留出 4px 空当。每一行的行首与行尾各自收圆，跨周的区间于是是一行一条两头圆的横杠。
  摆了周序号格的行里，行首那一格排在周序号后面，圆角跟着落到它身上。

  **两端那一格只铺半格**，另外半格由选中圆片占满：区间收在圆点上而不是收在格子边上。
  起止落在同一天时两条一起生效，底色宽度归零，只剩那枚圆点。

  **邻月的日子不再吃区间底色与选中圆片。** 并排两张面板里同一天会各出现一次
  （7 月 31 日既在七月的末行、也在八月的首行），两张都画就成了两个端点、两段底色。
  邻月的日子回到「压暗的数字」这一档。

  **粗粒度视图的邻月判定修正。** 月/季度/年三档里格子的值是那一段的第一天，与面板起点比月份恒不相等，
  于是除首格外整页都被判成邻月、整页压暗。这三档改用网格自报的 `inView`。

  **区间默认铺几个面板改成现算**：已选的两端落在同一页里就一张，跨页才并排两张；
  只落了一端（还在挑）时仍按两张算。日历同时恒渲染六行（新 prop `fixedWeeks`，默认开），
  并排的两张面板等高，翻页时浮层高度也不再跟着月份变。

  **面板号写在 `XhDatePickerCalendar` 上一处即可**：新增 `index` prop，面板内的
  `Heading` / `HeadingYearTrigger` / `HeadingMonthTrigger` / `Grid` / `Cell` 不写就跟着它走，
  自己写了仍按自己写的算。此前这五个部件各要写一遍，漏掉任何一个都会静默落到面板 0——
  两张面板显示同一个月份、第二张面板的邻月判定整片错位，都是这么来的。五个 prop 一并兼收字符串。

  **快捷选项列的高度由并排的日历给。** 此前这一列按内容收、上限写死一档，
  右侧那道分隔线只画到最后一条选项，比日历矮一截；它与旁边那张日历之间也补上了与两张日历之间同样的空当。

- 689ed0f: 13 个宿主的滚动层自带自绘滚动条：滚动时或指针在这一片时露出、静止后收起，浮在内容之上不占宽度。

  **哪些宿主**：12 个浮层族的 `content`（cascader / color-picker / combobox / context-menu / date-picker / hover-card / mention / menu / pagination / popover / popselect / tree-select）与 json-viewer 的 `tree`、`text`，共 14 个滚动容器。条子由库自己建，作者一个部件都不用写：它是滚动层的兄弟，绝对定位贴在组件既有的壳上（浮层族是 `positioner`，json-viewer 是 `root`）。轴按各自的溢出方向摆——cascader 只摆横的，tree-select 与 json-viewer 竖横都摆、两条都溢出时各让出交叉口那一格，其余只摆竖的。

  挂上条子的容器带 `data-xh-scrollbar`（挂在它身上的条数），皮肤据此把原生条藏成零宽：容器的可用宽度一点不减，也不再需要为原生条留空道。露面时机、尺寸档、拖动、触屏交给原生滚动这些全是 `scrollbar` 那一套，与手写 `<XhScrollbar>` / `<xh-scrollbar>` 挂上去的完全一致，缺省档是 `scroll-hover`。

  **json-viewer 换档跟随**：树档与原文档互斥，换档时条子跟到此刻在场的那个容器，节点不重建（换档不会把滚动条闪一下）。

  **按在 `positioner` 上不再消解浮层**：条子住在 `positioner` 里、是 `content` 的兄弟，浮层的层分支因此把 `positioner` 一并记上——不记的话按住条子拖动那一下会被判成层外交互，面板当场收起。副作用是 `positioner` 的其他子节点也算进了层内：吃指针的只有 combobox 的 `empty` 空态占位，按它不再关闭候选面板（此前会关）。其余 11 个浮层的 `positioner` 除了条子没有吃指针的子节点（`positioner` 自身是 `pointer-events: none`），按在面板之外仍照旧消解。

  **皮肤侧要跟着改的**：自带皮肤给这 13 个壳补了 `--xh-scrollbar-track-bg: transparent`（浮在内容上的条子不该有实色轨道），json-viewer 的 `root` 补了 `position: relative`（条子贴它的内边距盒）。第三方皮肤若整份接管这些 part，同样要给壳一个定位上下文，并把轨道底色关掉。滚动条自身的 `root` 补了 `pointer-events: auto`，抵消 `positioner` 那句 `none`。

- 843e17a: json-viewer 补原文视图：`view="text"` 直接出缩进过的 JSON 原文。

  树档是拿来"翻"的——折叠、逐层看结构；而"核对这份报文与后端下发的是不是一字不差"、
  "把它整段拷走"这两件事树档做不到：值受 `maxStringLength` 截断、成员受 `maxItems` 折减，
  分支摘要与把手还带 `user-select: none`，框选拿到的不是原文。原文档就是补这一件事，
  因此它刻意不吃那两个折减选项。

  `api.text` 在两档下都取得到，作者要做"复制原文"按钮时不必自己再序列化一遍。
  序列化与树同源：同一个 `jsonEntries` 排键（`sortKeys` 一样生效）、同一条祖先链判环
  （环落成 `"[Circular]"`，两条不相干分支共享同一个对象照样摊开），
  `bigint` / `undefined` / 函数这些 JSON 没有写法的值退回树上那份文本并按字符串写出，
  整份始终解析得动。

  新增 headless 出口 `jsonText` 与类型 `JsonViewerView`，解剖新增 `text` 部件。
  皮肤与树档共用同一套边框、内衬与高度令牌，两档切过去盒子不跳。

- ec93d6b: 浮层里的条目之间加 2px 行距，新增语义令牌 `--xh-list-option-gap` 统一这把尺。

  **下拉里选中项与悬停项贴成一整块。** a11 的选中蓝底与 b22 的悬停灰底之间没有一丝缝，
  两块底色首尾相接，读起来像一条被涂了两截颜色的长条而不是两个条目。

  **库内自己就有三种方言**：浮层选项列（time-picker / date-picker 的时间列与预设列）已经是
  2px，页面导航列（side-nav / navigation-menu）是 4px，下拉、菜单、树这一族是 0。补上 2px
  是把这一族拉回库内既有的口径。

  `list` 组的描述原文写着「option-\* 给浮层里的条目——菜单项、下拉选项、树行、时间列」，
  新令牌落在这一组：`--xh-list-option-gap: 2px`。compact 档不覆盖，2px 已是最小档。

  22 个条目的直接父容器接上这把尺：select 的 `list`；combobox / listbox 的 `content` 与
  `item-group`；popselect 与 mention 的 `content`；menu / menubar / context-menu 的 `content`
  与 `group`；cascader 的 `column` 与 `search-list`；tree 与 tree-select 的 `tree`、
  `branch-content`、`branch`；transfer 的 `list`。装 list 加 footer 的外壳（select /
  tree-select 的 `content`）不接——它不是条目的父层。json-viewer 也不接，只读数据视图与
  table、log 同为紧排一档。

  `tree` 与 `tree-select` 的 `branch` 此前是块盒，为接这把尺改成纵向 flex，tree-select 同时
  补上此前缺的 `[hidden]` 兜底。

  节奏顺手收一级，加了 gap 之后总量不变：combobox 与 listbox 的组间距 8px → 6px，
  menu / menubar / context-menu 的分隔线外边距 4px → 2px。time-picker 那两处等值的
  `--xh-space-0_5` 改指新令牌，视觉不变。

  这把尺打在容器上，所以分组标题与它下面第一条之间同样多出 2px——分组标题是 `group`
  的第一个子元素，与条目同属一层 flex 子项。

- 8fc5f05: 上一页 / 下一页默认就是两枚箭头。

  原先库里一个字都不产出，可见内容全靠作者往插槽里塞——于是每份示例都手写了
  「上一页 / 下一页」四个字，翻译、宽度与图标风格全归使用者自己操心。

  皮肤补上兜底字形：两个把手为空时各画一枚 chevron，走既有的 `--xh-glyph-mark-*` 令牌
  （mask + currentColor，跟着语气、悬停与禁用一起变色）。rtl 下两枚对调，指向行进方向。
  作者往部件里塞了自己的图形或文字，`:empty` 即不命中，原样让位。

  读屏名字一如既往来自 `translations.prevTrigger / nextTrigger`，不受影响——
  去掉的只是可见文字，不是可及名字。

- 1a36b7e: 省略号能摊开了：折进去的那几页现在有路走到。

  原先省略位是 `aria-hidden` + `pointer-events: none` 的死占位，而 `pages` 序列
  只说「这里折了一段」，说不出折的是哪几页——那几页除了手打跳页输入框没有任何入口。

  分页因此升级成浮层族，新增 `positioner` 与 `content` 两个部件：

  ```vue
  <XhPaginationRoot v-slot="{ pageItems }" :count="2000" :page-size="10">
    <template v-for="item in pageItems">
      <XhPaginationEllipsis v-if="item.type === 'ellipsis'" :side="item.side" />
      <XhPaginationItem v-else :value="item.value">{{ item.value }}</XhPaginationItem>
    </template>
    <XhPaginationPositioner>
      <XhPaginationContent v-slot="{ pages }">
        <XhPaginationItem v-for="p in pages" :key="p" :value="p">{{ p }}</XhPaginationItem>
      </XhPaginationContent>
    </XhPaginationPositioner>
  </XhPaginationRoot>
  ```

  - 新增 `api.pageItems`：与 `pages` 同一串序列，但省略位带着被折叠的那几页。
    `pages` 由它派生，两者的窗口数学只有一份。旧的 `pages` 写法一行不用改。
  - 悬停摊开（`openDelay` / `closeDelay`），**点一下也摊开**——纯悬停会把键盘用户挡在外面。
    Escape 与点外面都能收起（走消解层）。
  - 至多两个省略位，用 `side`（`'start' | 'end'`）区分；同时只开一个，一份定位层就够。
    Web Components 侧由作者在节点上写 `side="end"`，与页码按钮自报 `value` 同一套写法。
  - 浮层 portal 到统一落点，三视觉轴在 `positioner` 上重打一遍。

  **破坏性**：`getEllipsisProps()` 改为收 `{ side }`；省略位从 `<span>` 变 `<button>`、
  不再带 `aria-hidden`。

- 911d0b7: 每页条数控制器随分页一起给了。

  ```vue
  <XhPaginationPageSizeSelect v-slot="{ options }">
    <option v-for="o in options" :key="o" :value="String(o)">{{ o }} 条 / 页</option>
  </XhPaginationPageSizeSelect>
  ```

  用**原生 `<select>`** 而不是再造一个浮层：档位就那么几档，浮层带不来什么，
  却要多接一层定位、消解与键盘；原生控件在 Web Components 侧也一样能用，键盘天然可达。
  不给插槽时按 `pageSizeOptions` 渲染默认档位。

  受控时会把 DOM 的选中项同步回填：宿主不写回的话，用户改过的原生 select 与真正生效的
  档位会对不上，而 vdom 那边没有变化就不会打补丁——这一条两个适配器共用。

- abe790b: 滚动条新增 `scroll-hover` 档，并把它定为缺省档。

  **新增 `'scroll-hover'`**：滚动时露出，指针进入滚动容器或滚动条时也露出；指针占着容器时滚动只重画滑块、不起收起倒计时，指针离开或停手满 `hideDelay` 才收起。它是 `hover` 与 `scroll` 两档显形条件的并集，与那两档一样浮在内容之上——`data-lane-*` 的判据只认 `auto` / `always`，视口宽度一点不减（横条同理不占高度）。

  **缺省档由 `'hover'` 改为 `'scroll-hover'`**：`scrollbar` 与 `scroll-area` 不写 `type` 时都走新档。显形集合是原缺省档的严格超集，没有一条本来看得见的滚动条会消失；占道与否、触屏交给原生滚动那一路都不变。

  **需要跟着改的代码**：对 `ScrollbarType` 做穷尽 `switch` / 映射表的地方要补 `'scroll-hover'` 分支；读 `ScrollbarApi.type` 或 `data-type` 并按值分派的代码会收到这个新值。

  状态机的两个判据改了名：`isHoverType` → `showsOnHover`、`isScrollType` → `showsOnScroll`（原名在新档下会读成谎话）。判据名只在机器内部与文档的「状态机」小节露面，不进公开 API。

  日志的视口那条 `scrollbar-gutter` 收窄到「还在用原生条」的情形：带 `data-xh-scrollbar` 的容器原生条已被藏成零宽，空道对它没有布局作用。没挂自绘条时空道照留，原生滚动条出现与消失仍不推动文字。

- 918b870: 实心底上的前景色与交互态挪动方向改由语气色现推，换肤下配对自动成立。

  `--xh-_tone-on` 此前按语气族写死：brand / neutral / danger 配白字，success / warning / info 配深字。这个分派是按本仓这套 600 档实测出来的，但 `--xh-_tone` 是可换肤的——使用者把各族的 600 改写成自己的调色板，配对的前提就没了，而门禁只验本仓的色，失配一路绿灯。

  改成从 `--xh-_tone` 现推：把语气色转成线性 sRGB 分量、按 WCAG 的权重算出相对亮度，低于 0.179 配白字、高于配深字。0.179 是白字与黑字对比度相等的那一点，解析解，不是估的。

  `--xh-_tone-shift`（交互态往哪个方向挪）一并现推，取前景的反面。只推前景不推方向会出净回归：静态态救回来了，悬停与按下却把底往前景那一侧挪——某消费方调色板上实测 danger 静态 4.70 而悬停掉到 3.78、按下 3.18。

  用相对颜色语法 `color(from … srgb-linear …)`，高于本仓的浏览器地板（Chrome 119 / Firefox 128 / Safari 16.4 起），所以整块包在 `@supports` 里，逐族写死的那一份留着当兜底；探针按实际用到的整个形态测，只测得起半截语法的引擎不会落进坏值。alpha 显式写 1，不然会连语气色的透明度一起继承。

  某消费方调色板上的实测（浅色 / 深色，静态 · 悬停 · 按下）：

  改前 info 3.94 · danger 4.47 不达标
  改后 六族最低 4.70，全部达标

  本仓自己这套色只升不降：success 6.51→6.90、warning 7.36→7.80、info 5.71→6.05、深色 brand 5.32→5.64。

  三条门禁跟着改：

  - `check-tone-contrast` 此前只验写死的那一份。现在把 `@supports` 块单独解析，现推档与兜底档**各验一遍**（158 组配对，原 122 组），并按 tone.css 里那两条式子的形态逐字对账——式子改了形态对不上就失败。
  - `check-css-floor` 新增「受 `@supports` 守卫的增强」这一档并登记相对颜色语法：块外出现即失败。此前它对这条语法是静默的，等于谁都能悄悄抬底线。
  - `check-token-refs` 不再把注释里提到的颜色、`@supports` 的探测条件、以及 `fn(from var(--xh-…) …)` 当成颜色字面量——前两者不落到任何元素上，后者的源色本身就是令牌。

- a69cead: 树补一条 `leafOrientation`：末端那一层可以横排。

  只作用于「子节点全是叶子」的那一层——菜单授权里就是按钮那层。一个菜单下十几个按钮，
  横排一行铺完，省掉大量纵向翻找：

  ```vue
  <XhTreeRoot :collection="menus" leaf-orientation="horizontal" />
  ```

  **中间层与整棵树恒是竖排，不提供开关。** 它们承载的是层级本身，横过来层级就读没了。
  判据是「这一层不再往下分」而不是「深度等于几」：同一棵树里各枝深浅不一，
  按深度判会把浅枝的中间层也横过来。

  **方向键不跟着改。** 树上左右是层级操作（收起 / 展开、回父层 / 进子层）、上下走可见行，
  这是 treeview 的规范语义，横排只是排布。

  顺带修一处：叶子行在竖排下会自己补出「箭头那一格」与同级分支对齐，横排下补出来的
  是节点之间的空隙而不是层级，那条规则因此按行盒**所在的那层容器**判定方向。

### Patch Changes

- 33af800: 角标的三档尺寸：每一档的盒都抬到大于字号。

  原先 sm 档的盒高与字号都是 12px，两位数会把角标撑破。字号刻度最小就是 12px
  （`--xh-font-size-xs`），所以往上抬盒子而不是往下压字：盒 16 / 20 / 24，
  字 12 / 13 / 14，圆点 6 / 8 / 10，三条阶梯各自严格递增。

- 9294172: 日历的「大步翻」两颗钮不再被无条件收掉，« » 与 ‹ › 同一副长相。

  四条规则的选择器列表里，限定只跟在后两条上：`[data-part='prev-year-trigger'], [data-part='prev-trigger'][hidden], [data-part='next-year-trigger'], [data-part='next-trigger'][hidden]` —— 年那两颗是裸的，于是无条件命中 `display: none`，翻年的钮从来就没画出来过。行为层一直是通的（`canGoPrevYear` / `stepYear` / `getPrevYearTriggerProps` 都在），只是看不见也点不着。

  同样的漏写还在悬停、禁用、聚焦环三条上：那三条把月钮的状态样式无条件加在了年钮身上。四条一并补齐限定。

  新增 `tests/browser/calendar-nav-skin.spec.ts` 钉住：四颗翻页钮都画得出来、同一副尺寸，打上 `hidden` 才收起，禁用态四颗同一副长相。这类「被一条 display 悄悄收掉」只有在真实浏览器里按级联算才验得出来。

- 8a44b64: 四处被祖先 `overflow` 裁掉的聚焦环改成往内收。

  `outline` + 正的 `outline-offset` 把环画在元素盒外面，祖先只要是
  `overflow: hidden / auto / scroll`，环就会被裁掉一截——键盘用户看到的是
  三条边或者两侧缺口的半圈蓝环。四处改为 `outline-offset: calc(-1 * var(--xh-ring-width))`，
  环整圈落在盒内：

  - image-cropper 的 `crop-area` 与 `crop-handle`：两者都长在 `viewport` 里，
    那层 `overflow: hidden` 同时还替暗遮罩（`box-shadow: 0 0 0 9999px`）收边。
  - heatmap 的 `grid`：`root` 为一整年五十几列备了 `overflow-x: auto`。
  - table 与 transfer 的 `select-all-trigger`：同文件的邻居
    （table 的 `row` / `sort-trigger`、transfer 的 `search` / `item`）本就是内收写法，
    这两处是仅剩的外扩。

  `--xh-ring-offset` 令牌本身不动：库里另有 9 条规则写着
  `calc(-1 * var(--xh-ring-offset))`，翻令牌的符号会把它们一起翻成外扩。

- ed51531: 菜单族的勾选标记跟着语气走。

  `context-menu` 与 `menubar` 都有 `tone` 轴、也都在根上发 `data-tone`，但 `item-indicator`
  的颜色写死在 `--xh-fg-brand`：把菜单标成 `tone="danger"`，整条菜单换了族，勾选标记还是品牌蓝。
  同族的 `select` / `popselect` / `combobox` / `cascader` / `tree-select` 五家早就是跟着语气走的，
  只有这两家掉队。

  两家的颜色链改成 `var(--xh-<组件>-item-indicator-fg, var(--xh-_tone, var(--xh-fg-brand)))`：
  写了语气跟语气，没写落回 `--xh-fg-brand`——**没写 `tone` 的用法一个像素都不变**。
  `listbox` 不动，它没有语气轴，链尾就是全部。

- 3ed6b9f: 描边档的标签改用「可操作区边界」那一档语气色，轮廓看得清了。

  `outline` 的边就是这枚标签的全部轮廓——它没有底色，边没了就只剩一行字。此前取的是 `--xh-_tone-border`（语气色兑四成面色），而 tone.css 自己就注明这一支六族都落在 1.44–2.18，当轮廓根本分不出边界。

  改取 `--xh-_tone-border-control`：那一支是为「可操作区边界要 3:1」准备的，取的是语气本体。在某消费方的调色板上实测，边相对面从 1.59–1.76 抬到 4.56–7.83（浅色）、2.13–3.42（深色），文字那一档没动（5.14–9.35）。

  `--xh-tag-border` 这个使用者槽仍排在最前，要另配一档边照旧写它。

- 87f5b73: 装饰档 `--xh-_tone-soft` 从 500 提到与控件边界同一档

  色条、指示条、锚点高亮这些用装饰档画的东西是非文字图形，按 WCAG 1.4.11 要 3:1。
  500 档压在浅色画布上，success 2.29、warning 1.92、info 2.75 都够不到。

  `--xh-_tone-border-control` 早就为同一个阈值兜过底（warning 在浅色下取 700、
  neutral 在深色下取 550），要求完全一样，装饰档就直接跟着那一支走，六族十二组全部达标。
  `check-tone-contrast` 补上这条断言，覆盖从 110 组扩到 122 组。

  观感上所有色条、时间线指示点、锚点高亮会比原来重一档。

- b6fb182: 叶子行补上箭头那一格的缩进，不再比同级分支往行首缩。

  分支行的首格是展开箭头，叶子行没有这一格。作者摆了 `item-indicator` 时由它顶着，
  可勾选档的首位直接是 `item-checkbox`——没有东西占位，叶子的文字就比所在分支的文字
  往行首缩了一个间隙，第三级与第二级挤在同一条竖线上，层级关系读不出来。

  行盒改为在没有 `item-indicator` 时自己补出这一格（`:has()` 判定，摆了指示符的那档
  不受影响、不会被重复缩进）。宽度取的是箭头与指示符共用的那两个令牌，
  覆盖 `--xh-tree-indicator-size` / `--xh-tree-row-gap` 时跟着走。

- Updated dependencies [9ea57f6]
- Updated dependencies [ec93d6b]
  - @xihan-ui/tokens@1.0.0-preview.0

## 1.0.0-alpha.3

### Major Changes

- 516bd46: 浮层搬进单一落点，层号与背景失活跟着改口。

  ## 浮层不再原地渲染

  此前 20 个带 positioner 的浮层里只有 dialog / drawer / image-viewer 搬走，其余 16 个
  留在触发器旁边。坐标一直是对的（定位引擎特意处理了「祖先抢走包含块」），坏的是层叠序：
  宿主应用的祖先只要建了层叠上下文——`transform` / `translate` / `scale` / `filter` /
  `backdrop-filter` / `opacity` 小于 1 / `contain` / `will-change` / `position: sticky` /
  定位元素带 `z-index` / `isolation`——浮层的层号就退化成那个上下文里的局部序号，被任何
  上层兄弟盖住。这是库无法从自身约束的：宿主怎么写 DOM 不归库管。

  kernel 新增 `ensurePortalRoot(doc)`，在 body 末尾维护单一 `#xh-portal-root`，
  `RuntimeConfig.portalContainer` 的默认值指向它。Vue 侧 19 个浮层的 positioner
  （tour 连同 backdrop 与 spotlight）一律 Teleport 过去。落点自身一条样式都不写——
  子元素全是 `position: fixed`，不占布局，而任何 `position` / `transform` / `contain` /
  `isolation` 都会平白建出新的层叠上下文，正是要躲的东西。

  WC 适配器是 Light DOM，解剖契约就是「作者写在哪就在哪」，搬不动。改为在浮层展开时
  沿祖先链探一次层叠上下文，命中就投一条诊断，指名是哪个祖先的哪条属性。

  **破坏性**：浮层的 DOM 位置变了。按 `wrapper.querySelector` 之类以挂载根为基准取浮层
  节点的代码要改从 `document` 取。

  ## 遮罩式浮层并到同一档层号

  `--xh-z-drawer` 删除，`--xh-layer-drawer` 与 `--xh-layer-modal` 解析到同一个值。

  原先抽屉 1000 低于对话框 1100，而两者都在同一个栈上下文里，纯靠数字定序：从对话框里
  拉出抽屉时，抽屉连同自己的遮罩一起沉在对话框遮罩底下，用户只看到画面又暗一层、什么都
  没出现，而焦点已经陷进看不见的面板。反方向是对的，所以这是只在一个方向上炸的组合。
  并档之后先后交给 portal 顺序决定，与对话框套对话框的现有行为一致。

  **破坏性**：`--xh-z-drawer` 这个名字没有了。改用 `--xh-layer-drawer`。

  ## 背景失活改走祖先链

  `hideOutside` 此前只遍历 body 直接子元素，判据是「这个子元素包含 target 就整块放行」。
  WC 适配器的浮层长在作者写它的位置，应用只要有一层根容器（`#app` 之类）就会因包含浮层
  被整块豁免——模态对话框身后的整个应用对读屏依然完全可遍历，不认外点关闭的
  `alertdialog` 更是完全可点。改成沿每个 target 到 body 的祖先链逐层罩住其余兄弟。

  `data-xh-inert-exempt` 的语义随之扩大：带标记的元素及其后代不被罩住，**其祖先只递归、
  不整块罩住**。通知队列因此在任意嵌套深度都能保持可点，外点判定也一并豁免（点通知不再
  把模态关掉）。

  ## 其余

  - `--xh-editable-preview-line-height` 删除，改用 `--xh-editable-preview-min-h`：预览态
    原先拿行高冒充高度，实测比同组件的编辑态高 2px，切换时跳一下。
  - tooltip 与 navigation-menu 入层栈，Escape 不再连它们下面的对话框一起关掉。
  - 定位引擎新增 size 中间件，回报可用空间与锚点宽度；菜单族补上高度上限与内部滚动。
  - 包含块判定补齐 `translate` / `rotate` / `scale` 独立属性与 `backdrop-filter`。
  - 滚动锁补滚动条补偿与滚动根探测。

### Minor Changes

- 906b712: 真机 axe 扫出的无障碍缺陷逐条修，并把三个模态补进扫描名单。

  **dialog / drawer / image-viewer 此前从没被真机 axe 扫过**：它们的 presence 模型与共享套件对不上，各自单开了一份 WC 规格，因而不在扫描名单里——而焦点陷阱、`aria-modal`、背景 inert 恰恰最该在真浏览器里验。补进名单后三者全绿。

  同一次扫描照出四类既有缺陷：

  - **side-nav 折叠成图标栏后，行按钮与链接没有可及名**（critical + serious，14 条）：皮肤把 `branch-text` / `link-text` 整个 `display: none`，可及名随之归零——读屏用户在折叠侧栏里完全不知道每一项是什么。改成仓内既有的视觉隐藏配方（文字仍在无障碍树里），可及名恒等于可见文本，不必再让连接层去猜名字，也不会覆盖作者自己写的 `aria-label`。
  - **side-nav 的 `ul` 直接装 `a`**（serious，19 条）：Vue 适配器早就偷偷包了一层没登记的 `<li>`。把它提成正式的 `item` 部件（解剖 / connect / meta / 两个适配器 / 套件 / 示例同步），与同族的 breadcrumb、anchor、navigation-menu 一致。
  - **有值时下拉钮被藏掉**（date-picker / time-picker / combobox）：清空钮的互斥契约此前让「清空钮顶替下拉钮」，但这三家的 `trigger` 是打开浮层的那颗按钮而不是装饰箭头——藏掉它，鼠标用户在有值之后没有入口，浮层收起时的焦点归还也会落到隐藏节点上，键盘用户当场丢失位置（真机里 Escape 后焦点掉到 `body`）。改为只有纯装饰的 `indicator` 才让位（select / cascader / tree-select 那三家），这三家的清空钮与下拉钮并排显示。
  - select 的隐藏原生 `select` 在派生用例里被插了两份，第二份没有接线因而没有可及名——套件的 fixture 助手补幂等判断。

  `data-name` 这类写成常量再当计算键用的属性，此前公开面采集器的正则扫不到，基线漏登记；采集器补上常量形态。新增 `check-release-tag`：标签写的版本号必须与 changesets 的 pre 模式对得上，否则打 `v1.0.0` 却发出 `1.0.0-alpha.N`、或退出 pre 后打 `v1.0.0-rc.1` 直接占掉 `latest`。

- e12e337: 日历可以并排展示连续几个月，date-picker 的区间选择默认就是两个。

  区间的起止常常跨月，只有一个面板就得「点起点 → 翻页 → 点终点」，翻的时候还看不见起点在哪。
  两个并排是这类选择器的通行做法，也是这次补上的。

  - **calendar 新增 `visibleCount`**（默认 1）与 **`panels`**：一个锚点铺出 N 个连续月，
    翻页只动锚点、整窗一起走一个月，不是各翻各的。跨年自然接上（12 月的下一个面板是次年 1 月）。
  - **`getGridProps` / `getHeadingProps` 收面板下标**，每个面板一份标题 id，网格各由自己那行标题命名。
    不给下标即首个面板，旧调用一字不改。
  - **`CalendarCellProps` 多一个 `index`**：同一天会同时出现在两个面板里（8 月末那几天也铺在 9 月首行），
    「是不是本月」只有连着面板一起看才判得出来。
  - **往后翻的边界按整窗算**：新露出来的是窗口末尾再往后一个月。单面板时与从前逐字一致。
  - **date-picker 新增 `visibleCount`**，缺省单选 1、区间 2。
  - 皮肤只在 `content` 直接摆了两张日历时才横排（`:has`），并给第二张起画一道左分隔线——
    `showTime` 那套结构里 content 的直属子节点是作者自己的包裹块与确认行，无条件横排会把它们并到日历旁边去。

  旧字段 `weeks` / `visibleMonth` / `headingLabel` 保留，恒指首个面板。

- ff84a16: 日历补上按月 / 季度 / 年 / 周挑，并修掉多面板下的两处硬伤。

  **面板粒度 `view`**（`day` 默认 / `month` / `quarter` / `year`）

  格子的值一律是「那段时间的第一天」的 ISO 串，不另立一套值形态——min/max 比较、区间逻辑、
  不可用判定、表单出口于是全都原样复用。点 Q3 落的就是 `2026-07-01`。

  - 月面板一年 12 格、季度 4 格、年面板一页十年（两端各带一格邻十年，与日视图带邻月同一套做法）
  - 一页翻多久跟着视图走：日 1 个月、月与季度 12 个月、年 120 个月；翻页边界同样按整页算
  - 标题按 locale 出：`2026年8月` / `2026年` / `2020年-2029年`
  - 网格上多一个 `data-view`，皮肤据此换排布（月与年 3 列、季度 4 列）；日视图一个字没动

  **周选 `weekSelection`**：点任意一天落的是它所在的整整一周（两端一起给），周首日随 locale。
  只在 `view=day` 且区间模式下生效，其余情形照旧只落这一天。

  **修：点第二个面板里的日子会整窗往后翻一页**

  视窗起点此前直接由聚焦日反推，于是点右边那个面板 → 聚焦日落到下个月 → 整窗跟着走，
  看着就像「点一下翻一页、根本选不中」。现在视窗是独立的浏览位置，只在聚焦日走出视窗时
  才挪过去，挪到刚好把它露出来的那一端。

  **修：浮层展开后指针那条路没有出口**

  上一版把触发钮变成可选部件后，点输入行只能展开、不能收起——而段位里敲出来的值又不触发
  「选完即收」（那时人还在打字），于是浮层关不掉。现在点输入行是开合对称的，段上按 `Enter`
  也收起（`Alt+ArrowDown` 展开的对偶）。

- 089db90: 清空 / 关闭 / 移除按钮收成四类契约，`check-clear-trigger` 门禁固化。

  **内嵌清空钮**（cascader · tree-select · combobox · date-picker · time-picker · text-field · tags-input · select，以及新增部件的 popselect · date-field · time-field）统一为：`tabindex=-1` 不占 Tab 位但**不再 aria-hidden**——读屏按 `aria-label` 找得到它，文案统一走 `translations.clearTrigger`（缺省 `'Clear'`；select 的 `clear` 键改名）；pointerdown 不夺焦，点完发 `VALUE.CLEAR` 并把焦点送回宿主（trigger / input / 第一段）；没值就 `hidden`，不再同时打 `disabled`/`data-disabled`、皮肤也不再留一颗永远看不见的灰钮；尺寸与圆角统一为 `var(--xh-<c>-action-size, var(--xh-control-action-size))` / `var(--xh-<c>-action-radius, var(--xh-shape-control))`——text-field 此前与输入框等高、select / tags-input 按指示符尺寸走 pill，`--xh-text-field-clear-*` / `--xh-tags-input-clear-*` / `--xh-select-clear-*` 槽改名 `action-*`；互斥一律由 connect 在被让位的部件上打 `data-clearable`、皮肤一条 `display: none`——select 去掉了 `:has()` 让位与 `:hover` 才显形（触屏此前根本看不到清空钮），清空钮改为 trigger 的兄弟并排（`--xh-select-control-gap`）。

  **键盘清空**：select · cascader · tree-select · popselect 此前没有任何键盘清空路径。现在焦点在 trigger、有值且可编辑时 **Delete 清空全部、Backspace 单选清空 / 多选去掉最后一个**，键盘表与一致性套件同步。

  **select** 补 `readOnly`（浮层照常展开、值改不动、清不掉）与 `VALUE.CLEAR` 事件（`api.clear()` 不再借 `VALUE.SET []`）；Vue 的 select / combobox Root 新增 `clearable`（缺省 false）决定 collection 自动渲染树是否带清空钮——combobox 此前无条件渲染，示例已补 `clearable`。

  **独立动作钮**（file-upload · signature-pad）：file-upload 的 `api.clearFiles()` 改名 `clear()`、`translations.clearFiles` 改名 `clearTrigger`；列表为空时不再原生 disabled（清完焦点会掉回 body），只打 `data-empty` 压淡。

  **浮层关闭钮**（dialog · drawer · popover · tour · toast · alert · floating-panel · image-viewer）统一 `var(--xh-<c>-close-size, var(--xh-control-h-sm))` / `var(--xh-<c>-close-radius, var(--xh-shape-control))`，dialog / drawer / popover / tour 补上使用者槽；image-viewer 保持 `--xh-control-h-lg`（全屏看片的 chrome 钮按触控靶走）但圆角归 control。**标签内移除钮**（tag · tags-input item · select tag）尺寸基准 `--xh-control-indicator-size`、圆角 `--xh-shape-inset`；行级删除钮（file-upload item · dynamic-input）按 `--xh-control-action-size` / `--xh-shape-control`。

  四类按钮都补了 `:active` 按压反馈（`--xh-motion-scale-press`），27 处登记进 `check-press-feedback`。

  `--xh-select-clear-*` / `--xh-tags-input-clear-*` / `--xh-text-field-clear-*` 共 20 个槽名变更是公开面删减，基线已推。

- e2292bf: date-picker 与 time-picker 补上三条视觉轴：`variant` / `tone` / `size`。

  这两个组件此前是全仓仅有的两处「有输入行却没有形态轴」——同一张表单里，
  文本框、数字框、分段日期、分段时间都能换档，唯独这两个换不了，只能靠覆盖令牌硬凑。
  它们各自内嵌的 `date-field` / 分段时间输入早就有三轴，缺的一直是外层这一份。

  轴的落法与全仓一致：三个属性只写在 `root` 上，输入行、日历格与浮层里的列都从那里继承皮肤声明的私有槽，
  所以换一档不必给每个部件各写一条选择器。

  皮肤同步把两份里原先散着的写死值收成私有槽：

  - 尺寸档换 `control-h` / `control-px` / 两档字号（time-picker 还多一个列表格子的内边距）
  - 形态档换底色与两档描边；输入类照例不做实心档——填满一个要往里打字的框，字与底没法同时读
  - 语气只落在聚焦环、段位反白、时间列选中与确认按钮上，正文与日期数字不归它管

  不写这三个属性时一个 `data-*` 都不产出，皮肤走缺省档，观感与之前逐像素一致。

- 0be028c: 抽屉可以挂在页面里的某一块区域上了，`portalContainer` 也不再是个死字段。

  `RuntimeConfig.portalContainer` 自打声明起就没人读过——全部浮层的搬运目标一律写死 `'body'`，
  所以「局部抽屉」根本做不出来。这次两头一起接：

  - **drawer 新增 `contained`**：遮罩与定位层从 `fixed` 换成 `absolute`，只罩住最近的定位祖先而不是盖满整屏。
    `data-contained` 同时落在 root / backdrop / positioner / content 上，页面里那半边与被搬走的那半边都能选到。
  - **Vue 新增 `container`**（选择器或元素）：浮层搬进那个容器，并**隐含 `contained`**——
    一处给定、两件事从它派生，不会出现「搬进去了但还画着全屏遮罩」这种两边各说各话。
    显式写了 `contained` 以显式的为准。
  - **`portalContainer` 真正接上**：`XhConfig` 多一个同名字段，应用级注入一次，
    没写 `container` 的浮层就落到它给的容器里；都没有才落 `body`。
  - **Web Components** 是 Light DOM，作者写在哪浮层就在哪，因此只需要 `contained` 这一个属性来让皮肤按容器画。

  那个容器要自己带 `position`（`relative` 之类），否则 `absolute` 会往上找到别的定位祖先——
  这一条写进了 props 说明与示例。

- f154e07: 组件自带的兜底字形改为真正的图标：勾、半选横杠、展开箭头、清空与关闭的叉、排序方向、加减号、翻页箭头、图片查看器工具条这些，原先要么是皮肤里的 Unicode 字符（`✓ ▾ ✕`，跨字体跨系统长得各不一样），要么由作者在每个部件里手打一个字符。现在统一走 `--xh-glyph-mark-*` 一族二十个令牌，取值是图标包里对应 SVG 的 `url("data:image/svg+xml,…")`，皮肤拿它当 `mask-image`、用 `currentColor` 着色——随语气、悬停、禁用自动变色，与 `<XhIcon>` 画出来的一模一样。令牌的 `$type` 为 `icon`、`$value` 是图标名，构建期从图标包读 SVG 内联，改图标只改一处。

  使用者换图标有两条路：在 `:root` 上重声明令牌即全局换，写在任意容器上即只换那一块（任何 SVG 都行，着色一样走 `currentColor`）；或者往部件里放自己的节点，皮肤那条 `:empty` 守卫即不命中。兜底覆盖面从 14 份皮肤扩到 39 份：此前 tree / tree-select / table / toast / dialog / drawer / number-field / carousel / transfer / image-viewer 等二十个组件的把手空着就什么都不画，文档示例只好逐个手打字符；现在示例里的 960 处手打字符全部删掉，由皮肤画。命令式 toast / dialog 的类型徽记与 `XhToastCloseTrigger`、`XhImageViewer*Trigger` 的默认内容同样改走这族令牌。

  图标包新增 `info` / `rotate-left` / `rotate-right` / `flip-horizontal` / `flip-vertical` 五枚。`check-glyph-slots` 门禁禁止皮肤里再写字面字形，并双向核对令牌与用处（适配器里的 JS 默认模板也算）。

- 1e90ce6: 热力图新增 `palette` 色板轴：`green` / `blue` / `orange` / `purple` / `red` / `gray`，直接按颜色点名色阶满档那一端，三种形态与图例一起跟着走。它是装饰性的一条轴，不是第四条语义轴——与 `tone` 同时写时听色板的，两条都压不过作者自己写的 `--xh-heatmap-ink`；不写时行为与之前逐字一致。

  令牌层随之补上紫色原语 `--xh-color-purple-600`：明度与彩度照 danger 的 600 档，只把色相换成 302。

- 8d35702: 动效与浮层口径收口。

  **减弱动效只剩一条通道。** 此前 kernel 的 `RuntimeConfig.reducedMotion` 只读系统 matchMedia、motion 包的 `setMotionOverride` 只有 animate / 滚动 / 数字动画在听，presence 与 stick-to-bottom 感知不到应用级覆盖；无 matchMedia 的宿主两包还给出相反答案（kernel 直接抛 TypeError、motion 报 reduce）。现在 kernel 依赖 motion，`reducedMotion` 缺省即 `resolveMotionPreference() === 'reduce'`（覆盖 ?? 系统偏好），没有 matchMedia 一律不减弱；glyph 转圈、backgrounds、滚动、数字动画全部走同一函数。CSS 侧 `tokens.css` 新增 `:where([data-motion='reduce'])` 块，与 `@media (prefers-reduced-motion: reduce)` 同源生成、逐条相同——作者把 `data-motion="reduce"` 打在任意容器即局部减弱。全局配置加 `motion?: 'reduce' | 'no-preference'`，Vue `provideXhConfig` / WC `<xh-config motion>` 收到即调 `setMotionOverride`。

  **缓动与时长的真源是令牌。** motion 包新增 `durations = { fast, normal, slow }`，`animate()` 缺省与 `@xihan-ui/animations` 的缺省时长都引它；`check-motion-source` 比对 primitive.json 与 easing.ts / durations.ts，值不等即红；`check-reduced-motion-channel` 禁止 motion 包之外再出现 `matchMedia('(prefers-reduced-motion')`。

  **皮肤的 reduce 块归口。** 只在两种情况自写：无限循环动画要整个停掉、有使用者时长槽的过渡要兜住穿透。image-viewer / side-nav / layout 三份纯重复令牌层的块删掉；table 的 `0.01ms !important` 改 `animation: none`；保留的 10 份每块配一份等价的 `[data-motion='reduce']` 规则。animation / transition 不再直引 `--xh-duration-*` 原语：spinner 走 `--xh-spin-duration`，skeleton 走新令牌 `--xh-shimmer-duration`（1600ms）。`check-infinite-motion` / `check-motion-primitives` 守住。

  **浮层的 placement / offset 默认值只有两种语义。** `OVERLAY_PLACEMENT_ANCHORED = 'bottom'`（气泡类）与 `OVERLAY_PLACEMENT_LIST = 'bottom-start'`（列表类）、`OVERLAY_OFFSET = 8` 从 headless 共享导出，各组件的 `<C>_DEFAULT_PLACEMENT` 改为引用它们（tooltip / hover-card / popover / popconfirm / popselect 新增导出常量），所有机器显式传 offset，不再隐式靠引擎兜底；`check-overlay-defaults` 守住。

  **层级覆盖槽齐全、后缀统一。** 22 个浮层族的 positioner / backdrop、toaster、navigation-menu 面板都有了 `--xh-<c>-layer` 槽（缺省仍是 `--xh-layer-*`）；tour / table / heatmap 的 `-z` 后缀槽改名 `-layer`（7 个，公开面变更，基线已推）。

  **进退场对称。** toast 退场位移从 distance-sm 改 distance-md（与进场、与 dialog 一致）；tour 的气泡改用 pop 族，聚光灯补退场；side-nav 折叠态弹出面板补进退场并在 Vue / WC 接上退场租约。

  **navigation-menu 的定位登记变成可验证的。** 三道浮层门禁此前按「anatomy 有 positioner」发现族，它从没被检查过；现在 `SKIN_POSITIONED` 名单要求它没有 positioner、不接引擎、面板由皮肤 absolute 排布，任一条不成立即红。`check-arrow-geometry` 增比对 JS 箭头常量（8·√2 / 8）与令牌（8px 边长 / 8px 圆角）。

- d738f78: `date-picker` 与 `time-picker` 新增快捷选项：给 `presets` 数据就在浮层里多排一列（「今天」「近 7 天」「此刻」这类），点一条整份写进值。新增 `presets` / `preset` 两个部件、`getPresetsProps` / `getPresetProps` 两个产出与两条键盘行；这一列自成一套 listbox 键盘，与日历网格、时分秒那几列互不抢键。

  单日的值就是一条 ISO 日期串，区间用 ISO 8601 的区间写法把两端拼起来（`2026-08-15/2026-08-21`），一个串同时充当这一项的身份。日子由使用者算好传进来——连接层每帧求值，`today()` 放进渲染期会跨零点算出两个答案；headless 备了 `datePickerPresetDay` / `-Range` / `-Month` / `-Year` 与 `timePickerPresetNow` 五个纯函数。

  date-picker 的收起沿用 `closeOnSelect` 那条守卫（区间要两端齐、showTime 仍由确认按钮收口）；time-picker 的快捷选项给的是整份时间，写完即收。

- 9548330: 新增 `scrollbar` 组件：自绘滚动条，挂在**任意一个**滚动容器上——表格的滚动盒、虚拟滚动的视口、随手一个 `overflow: auto` 的 div 都行，不必是本组件的后代。此前这套东西焊在 `scroll-area` 里，只有连视口带内容一起交出去的场景用得上。

  解剖 `root` / `track` / `thumb` 三层必需、`corner` 可选（横竖两条同时摆着时写在其中一条里补交叉口，配合 `gutter` 让两条各自让出那一格）；四种露面时机（`auto` / `always` / `scroll` / `hover`）带收起延时；拖滑块、点轨道跳转、RTL 双向换算、滑块像素下限、成段的 `scroll-start` / `scroll-end` 与 `drag-start` / `drag-end` 都在库里。`focusable` 打开后滑块进 Tab 序、报 `role="scrollbar"` 与三个 `aria-value*`，方向键 / 翻页键 / Home / End 可用；缺省不进 Tab 序也对读屏隐藏——滚动本身由滚动容器报，同一件事没必要报两遍。触屏（粗指针）上默认交给原生滚动，整条不画并带 `data-native`，`forceVisible` 打开才画。收起不再打 `hidden`，而是 `data-state=hidden` 由皮肤淡出（`visibility` 随退场播完才收），露出同样淡入；根上另有 `data-hover` 标指针在不在这一片。

  **`scroll-area` 改由 `scrollbar` 组装。** 滚动区不再有自己的机器：它是视口加两条 scrollbar——`scrollbar` 角色节点是那条滚动条的挂载点、同时充当它的根，里面照 scrollbar 的写法摆 `track` / `thumb` / `corner`（戴 `data-scope="scrollbar"`），显隐、拖动、键盘、几何、触屏原生、淡入淡出全是 scrollbar 那一套，两个组件共用一份滚动条。Vue 新增 `XhScrollAreaTrack`；交叉口 `corner` 改写在竖条的挂载点里，两条都显形时才露；`scroll-area` 新增 `size` / `forceVisible`；视口的占道改打在视口自己身上（`data-lane-vertical` / `data-lane-horizontal`），不再依赖 `:has()`。原 `--xh-scroll-area-thumb-*` / `-bar-*` / `-corner-bg` 那几个槽随之归到 `--xh-scrollbar-*` 名下；`scrollAreaMachine` / `ScrollAreaSchema` / `SCROLL_AREA_*` 导出不再有，连接层改收两台 scrollbar 机器与 props（`scrollAreaScrollbarProps` 给出每台的 props）。挂了自绘滚动条的容器带 `data-xh-scrollbar`（挂在它身上的条数），皮肤据此藏掉原生滚动条的外观——表格放进滚动区即可滚（吸顶表头与吸附列钉在视口上），虚拟滚动的视口给个 id 用 `controls` 挂上即可。

  滚动容器换了会自动把监听挪过去（`scrollable` / `controls` 指向另一个节点、或条件渲染的容器重建）；查不到时投一条 `scrollbar.missing-scrollable` 诊断，不静默，容器后到时调一次 `api.measure()` 即接上。容器里内容长短变了会自动重量（`MutationObserver` 盯着子树，一拍内合并成一次），量不到的场合另有 `api.measure()`。

- 35c9b65: 四家分段控件（date-field · time-field · date-picker · time-picker）的盒内布局统一。

  **解剖新增 `segment-group`**：包住全部段位与作者写在段间的分隔符。date-field / time-field /
  time-picker 三家新增这个部件，date-picker 已有的分段容器 `input` 改名为它——四家从此同名同职。
  time-picker 的 `input` 仍是段位本身（多实例），语义不动。

  破坏性改动：

  - `date-picker` 的 `input` 部件改名 `segment-group`，不留别名。
    - `getInputProps` → `getSegmentGroupProps`；`DatePickerInputProps` → `DatePickerSegmentGroupProps`。
    - Vue `XhDatePickerInput` → `XhDatePickerSegmentGroup`。
    - WC `@csspart input` → `@csspart segment-group`（作者标记写 `data-xh-part="segment-group"`）。
  - `--xh-time-field-segment-fg-placeholder` → `--xh-time-field-placeholder-fg`；
    `--xh-time-picker-segment-fg-placeholder` → `--xh-time-picker-placeholder-fg`。
  - `--xh-time-picker-column-max-h` → `--xh-time-picker-column-h`（列改定高）。
  - `--xh-date-picker-content-p` → `--xh-date-picker-content-py` / `-px`；
    `--xh-time-picker-content-p` → `--xh-time-picker-content-py` / `-px`。

  作者要把段位与分隔符挪进 `segment-group` 里，清空钮与展开钮留在 `control` 直属：

  ```html
  <div data-xh-part="control">
    <div data-xh-part="segment-group">
      <span data-xh-part="segment"></span>
      <span>:</span>
      <span data-xh-part="segment"></span>
    </div>
    <button data-xh-part="clear-trigger"></button>
  </div>
  ```

  行为与外观：

  - 尾部按钮一律靠框内末端，靠 `segment-group` 的 `flex: 1 1 auto` 顶；
    time-field 清空钮与 time-picker 展开钮的 `margin-inline-start: auto` 删掉。
  - 四家 `control` 的 `gap` / `block-size` / `padding-inline` / `min-inline-size` 逐条同值，
    `gap` 随尺寸档走 `--xh-control-gap-sm/md/lg`。
  - 时间列定高：`time-picker` 的 `column` 与 `date-picker` 的 `time-column` 走 `--xh-viewport-h-sm`，
    两家的快捷选项列同档；两家浮层补上最大高度。
  - 段位内衬统一 `--xh-space-1`；标题不再写 `cursor`；`:focus-within` 一律带 `:not([data-disabled])`；
    time-picker 聚焦时补画聚焦环；图标尺寸随尺寸档走 `--xh-glyph-size-sm/md/lg`。

- bbc3431: select 浮层多出一个底部操作区：「新建」「全选」这类按钮终于有地方放了。

  原来放不进去有两条硬理由，都不是样式能绕的：`content` 既是 `role="listbox"`
  （而 listbox 只许拥有 option 与 group，塞按钮进去是违规），又是那个 `overflow-y: auto` 的滚动容器
  （放进去的按钮会跟着条目滚走）。所以这次把两件事拆开：

  - **`content` 退成浮层外壳** —— 描边、底色、阴影、整体尺寸与键盘收口归它，它自己不滚。
  - **新增 `list` 部件** —— `role="listbox"`、条目的拥有关系、滚动与那个「无锚点时兜底的 Tab 位」全在它身上。
  - **新增 `footer` 部件** —— `list` 的兄弟。因此它既不进列表框的拥有关系，方向键与连打检索也走不到它，
    条目多到要滚时它仍贴在下沿不动。

  **破坏性变更（alpha 期）**：条目现在要写在 `list` 里。

  - Vue：`<XhSelectContent>` 与条目之间加一层 `<XhSelectList>`；底部操作区用新增的 `<XhSelectFooter>`。
    只传 `collection`、不写插槽的那条路由组件自己铺好，一个字都不用改。
  - Web Components：`<div data-xh-part="content">` 里加一层 `<div data-xh-part="list">` 包住条目。
    `list` 已列进 `requiredParts`，忘了写会在诊断通道上报 `wc.missing-part`，不会静默丢掉列表框语义。
  - `trigger` 的 `aria-controls` 随之改指 `list`（它才是那个列表框）。

- 309feb2: DOM 状态属性收成一套词汇（`tooling/scripts/state-vocabulary.json` 是真源，`check-state-vocabulary` 七条判据守住）。皮肤靠这些 `data-*` 选中状态，使用者的全局规则同样靠它们，所以同一含义只留一个名字：

  - **当前项**：`aria-current` 在 data 侧一律配 `data-current`。anchor 的 `data-active`、carousel 指示点 / pagination 页码 / side-nav 链接的 `data-selected` 都改过来；steps 保持 `data-state=current`（步骤族）。
  - **`data-active` 一名三义退役**：展开 / 选中路径上的祖先改 `data-in-path`（cascader 列项、side-nav 分支），滑杆刻度已被越过改 `data-passed`（slider mark / mark-label）。
  - **混合态一个词**：checkbox-group / table 表头 / transfer 列头的组级汇总 `data-state` 从 `all | some | none` 改为 `checked | unchecked | indeterminate`，与 checkbox 同词（`CheckboxGroupCheckedState` / `TableSelectionState` / `TransferCheckState` 的取值随之改）。
  - **显隐**：有开合交互的 tag，`data-state` 从 `visible | hidden` 改 `open | closed`（机器状态名同改，`onOpenChange` 不变）；派生显隐的 back-top 从布尔 `data-visible` 改 `data-state: visible | hidden`。
  - **折叠**：layout 侧栏从 `data-state=collapsed|expanded` 改布尔 `data-collapsed`，与 side-nav / splitter 同写法。
  - **死属性删除**：button 与 infinite-scroll 根上皮肤零引用的 `data-state`；scroll-area / scrollbar 的 `data-hover`（悬停走 `:hover`）。calendar 格子的 `data-focused` 改 `data-focus`。

  退役的四个属性名（`data-active` / `data-focused` / `data-hover` / `data-visible`）与四个 `data-state` 取值（`all` / `some` / `none` / `collapsed`）是公开面删减，基线已推。

- 8d6e450: 整洁度归队（统一性审计的最后一批）。

  **令牌**：dialog / drawer 的宽度档提为 `--xh-overlay-sheet-w-sm/md/lg`（24/32/48rem）与 `--xh-overlay-drawer-w-sm/md/lg`（16/20/28rem），empty-state / result 的图标档提为 `--xh-glyph-size-xl/2xl/3xl/4xl`；`--xh-control-gap-lg` 此前与 md 恒等，改为 space-3（compact space-2）；补 `--xh-fg-warning` / `--xh-fg-info`（与 success 同构）。tokens README 写明 px 与 rem 的口径，以及「单行控件本体的槽一律叫 control」。

  **皮肤**：number-field 的 `--xh-number-field-input-h` 在 control 上用错部件名，改 `--xh-number-field-control-h`；spinner 三档归 glyph 尺寸族、anchor / pagination / steps / composer / menubar 的内衬对齐 control-px 阶梯；back-top / card / float-button / switch / dynamic-input 的阴影补使用者槽；timeline / typography / field / slider 的字面残留改令牌；30 处与令牌同值却不引令牌的兜底改引（15 处登记理由）；checkbox-group / transfer 的指示符字形与 checkbox 同一配方。菜单与列表族的条目高亮只认 `[data-highlighted]`（菜单族此前还并挂 `:focus` / `:focus-visible`）。

  **无障碍**：select 的触发器按 APG select-only combobox 打 `role=combobox` + `aria-haspopup=listbox` + `aria-controls`（popselect 是按钮式弹出保持 button）；image-viewer 触发器补 `aria-controls`；83 处 `aria-hidden` 统一写布尔；iconOnly 按钮没有 `aria-label` / `aria-labelledby` 时开发模式提醒一次（Vue / WC 把作者写在根节点上的可及名转告连接层）。

  **共享配方**：visually-hidden 的 9 条声明收成 headless 的 `VISUALLY_HIDDEN_STYLE`，六份 connect 引它；七份皮肤各自那份必须与 `visually-hidden.css` 逐条一致。

  **门禁**：`check-literal-fallbacks`（兜底字面量与令牌同值即红）、`check-visually-hidden`、`check-tone-contrast`（自算 oklch → WCAG 对比度，六族 × 两主题 26 组配对，1 组已知例外登记理由）、`check-aria-shapes`（aria-hidden 字符串写法 / listbox 触发器角色）；`check-elevation-role` 增「阴影必须带使用者槽」。

- 4abe899: 统一性收口的头两批：先立门禁让跑偏能红，再补语义令牌把皮肤里的原语引用与互异的字面量收成一处。

  **海拔改按角色走。** `--xh-elevation-0…4` 五档删掉，换成三个角色：`raised`（静态抬起面：卡片的 elevated 变体、分段控制器的滑块、滑杆拇指）、`floating`（锚定浮层：下拉、菜单、popover、hover-card、tooltip）、`sheet`（遮罩式与通知：dialog / drawer / toast / tour / floating-panel / float-button / back-top）。深色主题的三档更重、外加一圈 1px 浅描边，暗底上浮层才分得出层。34 份皮肤全部迁过去，`check-elevation-role` 校验每处阴影都走角色、且 27 个浮层/遮罩面的角色与部件对得上。这是公开面的删减，基线已推。

  **字号不再下探原语。** 新增 `--xh-control-font-sm/md/lg`（控件主文字，与 `--xh-control-h-*` 同构按档走）、`--xh-control-caption-sm/md/lg`（控件里的次级文字：提示、计数、快捷键、清空钮，比同档主文字低一级）、`--xh-text-heading-1/2-*`、`--xh-text-caption-size`、`--xh-text-secondary-size`。皮肤里两百三十处 `--xh-font-size-*` 引用全部换成语义档；typography 的六级标题与 rating 的星标是字号阶梯本身，登记为例外。`check-text-scale` 守住。

  **默认宽度、内衬、轨道、折叠面的共享字面量收成令牌。** `--xh-control-min-w`（12rem）统一了 select / combobox / tree-select / cascader / color-picker / date-picker 六个触发器此前的六个值，time-picker / text-field / date-field / time-field / password-input 五家此前没有任何宽度声明，现在同样接上；`--xh-surface-py/px-sm/md` 统一了 dialog / drawer / tour / floating-panel / toast 的内衬；`--xh-track-thickness` / `--xh-track-thumb-size` 给滑杆与进度条；`--xh-nav-link-max-w`、`--xh-viewport-max-h`、`--xh-motion-scale-drag`（减弱动效归 1）、`--xh-glyph-size-text`（跟文字走的字形尺寸）、`--xh-control-box-sm/md/lg`（pin-input 的方格，随 compact 收）、`--xh-switch-track-h-*`、`--xh-syntax-string/number/keyword`（code-block 与 json-viewer 的语法色，随主题明暗切换，皮肤里不再有 hex 字面量）。`check-shared-slots` 新增「同后缀跨组件字面量互异也报」。

  **聚焦态描边统一成一派。** 此前三派：描边不变只画环、描边跟着环色走（语气轴在这一派整个失效）、只画环不管描边。现在 21 份输入类皮肤都写 `border-color: var(--xh-<c>-<part>-border-focus, var(--xh-_tone, var(--xh-border-control-focus)))`，新令牌 `--xh-border-control-focus` 缺省等于 `--xh-border-control`；time-field 聚焦补上了此前缺的环。`check-focus-ring` 加校验。

  **图标尺寸接线。** 38 份画兜底字形的皮肤在 root（浮层族在 content）上声明 `--xh-icon-size: var(--xh-<c>-icon-size, var(--xh-glyph-size-text))`，兜底字形的盒同样按它量——作者往指示符槽塞 `<XhIcon>` 时不再从 1em 跳到 20px。`check-icon-size` 守住。

  **几何修正。** pin-input 的方格此前缺省引的是 lg 档高度、sm 档引 md；segmented 横排外盒此前 38px（item 32 + 轨道内衬 + 描边），现在外盒本身即一档控件高、段撑满轨道内侧；checkbox 的方框锚在 `--xh-control-indicator-size` 上随 compact 收；checkbox-group 的指示符不再是 16px 字面量。radio-group / checkbox-group / composer 的禁用态去掉叠加的不透明度（与容器一起变淡会把对比度压穿）。

  **门禁。** 新增 `check-stroke-scale`（描边宽度只走 `--xh-stroke-*` / ring）、`check-keyboard-suites`（键盘表非空 ⇒ 一致性套件存在且两个适配器都登记）；`check-control-height` 按「组件 → 控件本体部件」显式管辖（button / toggle / segmented / pagination 等此前在门禁外）并校验 sm/md/lg 档位与 `data-size` 对应；`check-disabled-contrast` 改正则并加跨块判定；`check-shape-scale` 扩到逻辑角与私有槽；`check-keyframe-refs` 增扫适配器源码里的内联动画名（反馈服务的加载徽记改用 Web Animations，不再依赖某份皮肤在场）；`check-state-vocabulary` 接上 `state-vocabulary.json` 真源（`data-state` 的 43 个取值分 9 个族，connect 字面量与皮肤选择器两头对表，并报告「发射但零引用」的属性）；`check-token-refs` 禁皮肤里的颜色字面量。

  **套件。** 补 image-viewer（8 行键盘表，Tab 循环两行 jsdom 豁免）与 side-nav（10 行含折叠态弹出）的一致性套件，Vue 与 WC 两侧登记。

- 35c9b65: 相似组件与组合组件的视觉、动效、行为收成一套口径。

  **盒的定义统一了。** 此前 16 个输入 / 选择控件有三种「盒」：9 家由 `control` 画描边与底、5 家由 `trigger`（一个 `<button>`）当盒、2 家由 `input` 自画。盒是 button 的那 5 家（select · cascader · tree-select · popselect · color-picker）没法把清空钮放进框里，只能贴在框外——这就是「清空钮位置不统一」的总根因。现在判据只有一条：**解剖里有 `control` 就是盒**，`trigger` 退化成盒内那颗 `flex: 1 1 auto; border: 0; background: transparent` 的按钮，聚焦环改画在 `control:focus-within` 上。cascader / tree-select / popselect / color-picker / text-field 的解剖新增 `control` 部件。

  **尾部按钮一律在框内最右。** 盒内布局恒为「内容区 `flex: 1` → 尾钮组 `flex: none`」。段位并排、没有单一容器的四家（date-field · time-field · date-picker · time-picker）新增 `segment-group` 部件把段位与分隔符包起来当内容区（date-picker 原有的 `input` 分段容器改名 `segment-group`，四家从此同名同职），`margin-inline-start: auto` 那套 hack 删掉。行内动作钮（清空 / 展开 / 明暗切换 / 加减）一律 `--xh-control-action-size` 方钮——number-field 的加减钮与 password-input 的明暗钮此前是「贴边的控件高钮」。

  **并排成对的面板定高。** 新增 `--xh-viewport-h-sm/md/lg`（12/16/24rem，compact 同比例收）。transfer 两侧列表此前是 `min 8rem / max 16rem`，条目搬走后整个组件跟着变矮——现在定高 `--xh-viewport-h-md`，左右等高、空侧也占满。cascader 的列、date-picker / time-picker 的时间列同样定高；单个浮层面板仍内容驱动，但补上了此前缺失的高度上限。

  **菜单族三家逐条同值。** `menu` / `menubar` / `context-menu` 共用同一台机器，皮肤却各写各的：menubar 根本没有 `item[data-state='open']` 这条规则，所以「发送到…」展开时不像 menu 那样加粗高亮。现在条目内衬 / 字号 / 圆角 / 行高 / 展开态 / 高亮态 / `content` 外观 / `separator` / `group-label` 全族同值，menu 补齐 `group` / `group-label` / `separator` 部件，子菜单箭头走字形令牌。navigation-menu 与 side-nav 的弹出面板按同族口径归队。

  **浮层面板与输入族小件归队。** `content` 一律双槽内衬 + 族档 min-w / max-w；cascader 的 48rem、color-picker 的 15rem、tour 的 22rem 等裸值改令牌（新增 `--xh-overlay-max-w-xl`）；label 颜色与间距、图标尺寸随档、聚焦环私有槽（invalid 时变红）、`:focus-within` 的禁用守卫、disabled / readonly 的三样齐——逐条统一。password-input 的明暗钮用上了新的 `--xh-glyph-mark-eye` / `-eye-off` 字形令牌。

  **门禁**：`check-control-box`（盒结构 12 条判据）、`check-panel-height`（面板高度只走滚动面令牌、并排面板必须定高）、`check-family-parity`（菜单族 / 分段族 / 下拉族 / 气泡族逐条同值）。

  公开面：五家 `--xh-<c>-trigger-*` → `--xh-<c>-control-*` 槽改名、date-picker 的 `input` 部件与 `XhDatePickerInput` 组件改名 `segment-group` / `XhDatePickerSegmentGroup`、`--xh-hover-card-font-size` 与 transfer 的 `-list-min-h` / `-list-max-h` 删除，共 43 项，基线已推。

- 520b847: 周序号成为一等部件 `week-number`，不再由使用者自己拼一列出来。

  上一版只把数字算出来（`panel.weekNumbers`），列宽得作者用行内 `grid-template-columns` 自己撑，
  库不管它的皮——同一份东西在不同项目里会长得不一样，这不是组件库该留的样子。

  - 解剖新增 `week-number`（可选部件，不写即不渲染），语义是这一行的表头（`role=rowheader`）：
    在 `role=grid` 里，一行的标号本就该是 rowheader，而不是又一个可选的格子
  - `getWeekNumberProps` / `getWeekNumberText` 两条，文字由两个适配器各自填，保证同构；
    表头那一格是占位、不带值，解析不了不抛、给空串占住列宽
  - 皮肤接管列宽与字样：摆了周序号格的行自动让出行首一列
    （`--xh-calendar-week-number-w`，默认 2.25rem），数字比日子小一号、颜色压下去、不跟着选中态走
  - 新增 `XhCalendarWeekNumber` / `XhDatePickerWeekNumber`；WC 侧写
    `<span data-xh-part="week-number" value="行首那天">` 即可

  选择器那条列宽规则写的是 `:not([hidden]):has(...)`——同特指度的规则谁在后面谁赢，
  不带这一道的话收起态会被这条 `display` 掀开（上一轮刚栽过一次，已有门禁拦着）。

### Patch Changes

- a55c76e: 日历补上快速翻年、周选整周预览，日期示例按粒度重整。

  **« / » 快速翻**：新增 `prev-year-trigger` / `next-year-trigger` 两个可选部件（不写即不渲染），
  步长跟着视图走——日视图一年，月与季度十年，年视图一百年（它的 `‹ ›` 本来就走十年，
  大步得更大才有用）。边界与 `‹ ›` 各判各的：上界卡在今年之内时，下一页还翻得动、整年跳出去就按不动了。

  **周选悬停整周亮**：`weekSelection` 下指针扫过哪一行哪一行整整七天一起亮，与点下去的结果对得上。
  此前沿用的是「起点 → 悬停点」那一段，一格一格拉出来的区间在周选里讲不通。不开周选时照旧。

  **示例重整**

  - 天 / 周 / 月 / 季度 / 年归拢成一个「五种粒度」示例，一套结构走完
  - 「区间选择」补齐五种粒度，都是并排两页
  - 删掉旧的「按月选择」——它是 `view` 出现之前手搓的一版面板（拿 `XhButton` 拼的），
    与新的 `view="month"` 长相不一致；它想演的「输入行只留年月两段」并进新示例，
    按年挑就只留年那一段

- 9da2444: 修：区间选择器的浮层恒亮、糊在视口左上角、怎么点都关不掉。

  多面板那一版给 `content` 加了条 `:has(> calendar + calendar)` 的横排规则。它与上面那条
  `[data-part='content'][hidden] { display: none }` 特指度相同（都是 0-3-0），却排在它后面，
  于是收起态被它掀开：浮层一直显示，又因为定位引擎只在展开时跑、坐标恒为 0，就糊在视口左上角。
  只有区间那一个示例中招——它是唯一摆了两张日历的。

  选择器补上 `:not([hidden])`，与顺序、特指度都无关了。

  同时新增门禁 `check-hidden-override`：某个 part 已经有 `[hidden]` 兜底，其后又有规则把
  display 改回非 none 且没带 `[hidden]` / `:not([hidden])` 的，一律拦下。
  拿这次的坏规则反向验证过：去掉 `:not([hidden])` 当场报错并指到行号。
  全仓 109 份皮肤 · 314 条兜底扫下来，此前只有这一处。

- 1b7a5f1: 统一性审计收口后的六条遗留项。

  **px 与 rem 按口径归位。** 字号七档 `--xh-font-size-xs…3xl` 从 px 改为 rem（0.75 / 0.8125 / 0.875 / 1 / 1.125 / 1.375 / 1.75rem，根字号 16 时像素不变，使用者改根字号时整套排版随之缩放）；字形与控件几何改为 px：`--xh-glyph-size-sm/md/lg` 16 / 20 / 24px、`--xh-glyph-size-xl…4xl` 32 / 40 / 56 / 72px、`--xh-control-action-size` 24px（compact 20px）、`--xh-control-indicator-size` 16px（compact 14px）；color-picker 的动作钮与色块同样归 px。

  **side-nav 折叠态换枝播退场。** 机器里弹出面板的坐标改为按分支记账（`popoutPlacements`），换枝时旧面板保留坐标、`data-state=closed` 播 `xh-pop-out`，新面板同帧 `open` 播 `xh-pop-in`；此前旧面板的坐标在新枝 OPEN 那一拍被作废，退场瞬时。

  **tree-select 的 Vue Root 补 collection 自动渲染树。** 没给默认插槽且传了 `collection` 时自动铺 label? / trigger / clear-trigger? / positioner / content / tree（分支与叶子递归），新增 `label` prop 与插槽、`clearable` prop（缺省 false）；自动树与手写树 DOM 逐字同构，与 select / combobox 同口径。

  **门禁与测试整洁。** 三道浮层门禁共用 `tooling/scripts/lib/overlay-families.mjs`（名单与核实逻辑一份，各门禁的子集差异写明）；27 处测试里为旧 kernel 缺省桩的 `matchMedia` 删掉（减弱动效探测无 matchMedia 时已一律不减弱）。

- 177b3c3: 三道新门禁把版本政策里「只靠自觉」的条款焊成机器检查，`pnpm gate` 由二十项变二十三项。

  - **`check-css-floor`**：`.browserslistrc` 书面记录浏览器硬底线，拒绝名单拦住 `@container`
    这类无兜底的抬底线特性（`@scope`、`@starting-style`、`view-transition`、滚动驱动动画、
    CSS 嵌套等），`light-dark()` / `dvh` 必须同级联兜底；`field-sizing` 的退化路径在 HTML 侧，
    按文件白名单放行。
  - **`check-version-lock`**：17 个库包的 `package.json` 必须同版本。此前改一个包的 version
    而不动其余 16 个没有任何门禁会响，锁步发版只靠自觉。
  - **`check-wiring`**：`tooling/scripts` 里每个检查脚本都必须接进某个 pnpm script——写了不接线
    等于没写，死引用同样被拦下。

  同时 `check-slot-types` 补上第四条判据：写进 `SlotsType` 却从不渲染的插槽（消费方合法传进来的
  `#slot` 会被静默吞掉），裸引用 `slots.item` 整体传给 helper 的 collection 族用法计入「用过」。

- ac885c9: number-field 新增可选 `control` 部件:加减按钮叠进输入框内,与输入框成为视觉一体。

  此前加减钮与输入框是兄弟节点,受 HTML 约束进不了框内,只能三件并排。现在把输入框与两个按钮
  放进 `control` 部件,皮肤把描边、底色、聚焦环(改为 `:focus-within`)整体画在 control 上:
  框内 input 退成透明,减钮在左、加钮在右、输入框居中(顺序由作者模板决定),前后缀图标/文字
  直接流式插在 input 两侧,不用绝对定位;悬停/按下/贴边禁用沿用原有语义色。

  - **Vue**:新增 `XhNumberFieldControl`;`data-disabled` / `data-readonly` / `data-invalid`
    三个状态属性由 connect 落到 control 上。
  - **Web Components**:作者写 `<div data-xh-part="control">` 包裹即得同样的一体式。
  - **不写 control 时完全退回旧观感**:control 是可选部件,旧模板一行不改照常渲染,三档
    variant / tone / size 与旧式并排布局一致。

  一致性测试的 fixture 改成一体的 control 结构,两个适配器的 conformance 同步通过。

- 0a056e6: number-field 的 `control` 收成一枚整件:一道描边、一个圆角、一枚聚焦环,盒里再无第二条边界。

  此前盒内的加减钮仍带着独立版的灰底与自己的圆角,白底的框上贴着两块灰、圆角还比框的内角大一档
  顶到描边外面,一枚控件被读成三块拼起来的。现在盒内三段一律透明,底色、描边、圆角全部只由
  control 画一次,符号取次级前景、悬停与按下才浮出底色,贴住 min / max 的那一侧只压灰符号而不再铺灰底。

  - 两端圆角取盒子的内圆角(`圆角 - 描边`),并按 `:first-child` / `:last-child` 认位置——
    三件的先后由作者模板定,减钮不一定在最前面(库内 `12-precision` / `13-change-timing` 两例即是输入框在前)。
  - 盒内输入框默认居中、默认宽 `5em`,不写行内样式也是一枚齐整的步进器;
    可用 `--xh-number-field-input-align` 与 `--xh-number-field-input-w` 改。
  - control 由 `align-items: stretch` 改成 `center`:作者插在框里的前后缀文字此前被拉满整框高度,
    字贴着框顶;输入框与加减钮各自明写撑满,不受影响。
  - 不写 `control` 的三件并排布局一行未动。

- 93fe061: `light-dark()` 与 `dvh` 补上级联兜底，旧引擎不再靠解析失效退化。

  `code-block` 的三种语法色原本只有 `light-dark(...)` 一条声明，不认它的引擎里整条声明被丢弃，
  变量取不到、靠消费点的 `var()` 失效继承出单色——退化是碰巧成立的，不是写出来的。
  `layout` 侧栏的 `100dvh` 上限同理。现在两条都按「先旧后新」的级联兜底写法：旧引擎保留前一条。

  改动由新增的 `check-css-floor` 门禁保证不会再回潮（见同一批提交）。

- Updated dependencies [1b7a5f1]
- Updated dependencies [f154e07]
- Updated dependencies [1e90ce6]
- Updated dependencies [8d35702]
- Updated dependencies [516bd46]
- Updated dependencies [9548330]
- Updated dependencies [8d6e450]
- Updated dependencies [4abe899]
- Updated dependencies [35c9b65]
  - @xihan-ui/tokens@1.0.0-alpha.3

## 1.0.0-alpha.2

### Major Changes

- 934e126: 每份皮肤现在都能单独引入了，动画不再指望别处的文件在场。

  `styles` 的 exports 逐组件铺了一百多条子入口，`import '@xihan-ui/styles/dialog.css'` 是受支持的用法。但 `xh-fade-in`、`xh-fade-out`、`xh-spin`、`xh-dialog-in/out` 这五支关键帧住在 `motion.css` 里，被 15 份别的皮肤引用——单独引入其中任何一份，动画名都查不到。`@keyframes` 的名字查找只认「文档里有没有这个名字」，查不到既不报错也不降级，看上去就是「这个组件没做动效」。`spinner.css` / `switch.css` / `popconfirm.css` 三处注释早就写明了这条理由，只是这五支没照办。

  现在每份皮肤都自带它用到的关键帧。`motion.css` 因此空了，**已删除，`./motion.css` 子入口一并移除**——如果你显式引过它，删掉那行即可，它提供的关键帧已经跟着各组件走了。

  新增 `check-keyframe-refs` 门禁盯住三件事：引用的动画名必须在同一份皮肤里定义、同名的多份定义必须逐字一致（名字是全局的，两份不同内容会互相覆盖）、关键帧必须写在 `@layer xihan.motion` 里（使用者按层覆盖时才盖得住）。

  产物只大了 60 B：重复的关键帧对 gzip 几乎是免费的。

### Minor Changes

- 091bbef: 补上动效地基的四个缺口。

  **减弱动效此前基本是失效的。** `tokens.css` 里一个 `prefers-reduced-motion` 都没有，降级靠 19 份皮肤各写各的 `@media`，而它们只把 `animation-duration` 压到 `0.01ms`——位移与缩放是写死的字面量，压时长压不掉。前庭不适恰恰来自大位移与缩放，所以「减弱动效」的用户看到的是瞬间跳完整段位移。现在幅度走 `--xh-motion-distance-sm/-md` 与 `--xh-motion-scale-enter`，令牌层在 reduce 下把它们归零，皮肤不必自带 `@media`。删掉 8 份已经冗余的降级块（含 8 条 `!important`）；marquee / skeleton / spinner 那几处有讲得通的自定义降级，保留。

  **dialog 与 image-viewer 的退场动画从来没播过。** 皮肤给挂着退场动画的 `content` 补了 `[hidden]{display:none}`，收起时元素当场不生成盒子，动画不启动，退场探测器放弃申领租约、就地卸载。drawer 早就绕开了这个坑，它的注释还写着「与 dialog 一致」——而 dialog 恰恰是反的。现在真的一致了，四条退场动画同时补上 `forwards`。

  **Web Components 端全域没有退场动画。** 三个浮层元素把收起写死在展开态上，与 `data-state="closed"` 同帧写内联 `display:none`。现在收起跟着 presence 走；Light DOM 下被拉长的不是节点存在的时间，而是可见的时间。

  **破坏性程度**：进场缩放统一到 `0.96`（此前 0.98 与 0.96 混用），dialog / toast 进场 / color-picker 的起势略明显一点。button 的加载转圈不再被压成 `0.01ms`——转圈是「系统还在做事」的唯一可感知信号，压掉等于把加载态变成假死。

  回归测试进了 `tests/browser/`：jsdom 不把样式表里的 animation 算进 `getComputedStyle`，这三件事在 jsdom 里结构性测不到。

### Patch Changes

- 7a5d898: 漏引皮肤不再静默：新增 `startSkinCheck()` 开发期探测与 `styles.missing-skin` 诊断码。

  按需引皮肤时漏掉一行原本是这个库最难查的失效：那个组件的 `data-scope` / `data-part` 照常都在、
  别的皮肤也确实加载了，只有它渲染成没有内边距、没有底色的裸元素，看起来像组件坏了而不是少引了一行。
  这一条正是「按组件挑」在真实项目里立不住的根本原因。

  每份组件皮肤现在在自己的 `[data-scope='X']` 上落一个 `--xh-X-skin` 标记（104 份）。
  `startSkinCheck()` 扫页面上出现过的每个 scope，取不到标记就报诊断：

  ```ts
  if (import.meta.env.DEV) {
    const { startSkinCheck } = await import("@xihan-ui/kernel/skin-check");
    startSkinCheck();
  }
  ```

  ```
  [xh][button] [styles] button 的皮肤没引：import '@xihan-ui/styles/button.css'，或改引全量的 '@xihan-ui/styles'
  ```

  两处刻意的取舍：

  - **每个 scope 只探一次。** 探测要读计算样式，逐实例探是真实的强制样式重算；一个 scope 的皮肤
    在不在场与实例数无关，探一次就够。
  - **标记落在 `[data-scope='X']` 而不是 root 部件上。** 浮层族的 `content` 被 portal 到 body，
    不在 root 的子树里，只在 root 上声明的话自定义属性继承不过去，这些部件会误报。

  探测器走 `@xihan-ui/kernel/skin-check` 子路径而不是主入口：它是开发期工具，不该躺在每个消费方都会打包的那条入口里（放主入口会让 kernel 的体积棘轮超 118 B，那条棘轮量的正是整包）。

  新增 `check-skin-markers` 门禁守住 104 份皮肤的标记齐全——漏一份，那个组件就退回静默失效，
  而且探测器还一声不吭。`pnpm gate` 十九项 → 二十项。

- 59c86fa: 新增 `check-style-entries` 门禁：每份皮肤都必须进得了全量入口、也够得着按需入口。

  `index.css` 的 `@import` 清单是手工维护的，`package.json` 的子路径导出也是。两处任何一处漏了，
  结果都是静默的：漏进 `index.css`，全量引入的人拿不到那份皮肤，组件渲染成裸元素；
  漏了子路径导出，按需引入的人根本 import 不到它。今天 109 份皮肤两处齐全，但没有任何东西守着。

  门禁同时把「按需产物的顺序只能由 `index.css` 过滤得来」钉在这里。同一个 `@layer xihan.components`
  内，等特异性的规则靠源序定胜负；另起一套排序（按字母、按目录读取序）今天看不出差别——
  当前仅有的 3 处跨 scope 规则在两种排序下相对次序恰好一致——但那正是它危险的地方：
  将来加进第四处，按需引入的人就会与全量引入的人渲染不同，而且全绿。

  `installation.md` 的「样式的三种接法」如实补上第二种要自己扛的两条风险，并给出体积口径
  （全量 51 kB gzip，含令牌与 109 份皮肤），建议没有明确体积压力就用全量。

- Updated dependencies [3469066]
- Updated dependencies [091bbef]
  - @xihan-ui/tokens@1.0.0-alpha.2

## 1.0.0-alpha.1

### Major Changes

- 479bfcb: 级联选择皮肤全面翻修：展开路径改品牌淡底加粗、分支条目补右向箭头、列改内容撑宽定高、条目度量放宽。

  破坏性：4 个覆盖槽改名（不留旧名）：

  - `--xh-cascader-row-bg-highlight` → `--xh-cascader-row-bg-active`：展开路径的底色从中性灰二档改为品牌淡底（经 `--xh-_tone-subtle` 随语气、缺省 `--xh-bg-brand-subtle`）并加 `--xh-cascader-row-active-font-weight`（缺省 600）；悬停与键盘锚点保持中性灰轻档，两档靠色相分家。
  - `--xh-cascader-column-w` → `--xh-cascader-column-min-w`：列从定宽 11rem 改为内容撑宽 + 下限 7rem。
  - `--xh-cascader-column-max-h` → `--xh-cascader-column-h`：列高从内容撑（上限 16rem）改为定高 11.25rem，切换展开路径浮层不再上下跳动。
  - `--xh-cascader-indicator-size` → `--xh-cascader-item-indicator-size`：与既有 `--xh-cascader-item-indicator-fg` 配对，避免与触发器 indicator 部件混名。

  新增：

  - 分支条目行尾自动画右向小箭头（`data-branch`，纯 CSS，`--xh-cascader-branch-arrow-size/-fg/-stroke` 可覆写，rtl 自动翻转，禁用同灰）。
  - 触发器箭头与勾选标记的 `:empty` 兜底字形（▾ / ✓），与 select 同约定；级联勾选半选态皮肤自绘横杠。
  - 条目 padding 放宽为 6px / 12px（行内走 `--xh-control-px-md`，紧凑密度自动收窄）、上限宽 25rem、背景与文字色过渡。
  - 搜索候选与列内条目共用同一套行度量槽；搜索视图规则移入 `xihan.components` 层。
  - 三处聚焦环改固定 `--xh-ring-focus`（不再随语气）；浮层入场横移 rtl 翻转。

- 9d7d703: 下拉/列表族条目度量与高亮档位统一（select / menu / listbox / combobox / popselect / tree / tree-select，向级联选择的两档制看齐）。

  破坏性：7 个覆盖槽改名或移除（不留旧名）：

  - `--xh-select-item-bg-highlight` → `--xh-select-item-bg-hover`、`--xh-combobox-item-bg-highlight` → `--xh-combobox-item-bg-hover`、`--xh-popselect-item-bg-highlight` → `--xh-popselect-item-bg-hover`、`--xh-menu-item-bg-highlight` → `--xh-menu-item-bg-hover`：悬停与键盘锚点统一为中性灰轻档（缺省 `--xh-bg-subtle`），不再随语气换色。
  - `--xh-listbox-item-bg-highlight`、`--xh-tree-row-bg-highlight`、`--xh-tree-select-row-bg-highlight` 移除：键盘锚点并入轻档，与悬停共用 `-bg-hover` 一个槽（键盘位置由聚焦环表达，选中仍是文字色 + ✓ 标记，互不挤占）。

  新增（menu）：

  - 打开子菜单的触发条目升为强档：品牌淡底（经 `--xh-_tone-subtle` 随语气、缺省 `--xh-bg-brand-subtle`）+ 600 字重，新增 `--xh-menu-item-bg-active` 与 `--xh-menu-item-active-font-weight` 槽；两档靠色相分家，与级联选择的展开路径同一套词汇。
  - 条目行高从 none 抬到 normal，新增 `--xh-menu-item-leading` 槽。

  度量：

  - 七家条目 padding 统一为 6px / 12px（`--xh-space-1_5` / `--xh-control-px-md`，行内随密度轴收窄），底色与文字色补 micro 过渡。
  - menu 尺寸阶梯重排：sm = `--xh-space-1` / `--xh-control-px-sm`，lg = `--xh-space-2` / `--xh-control-px-lg`。
  - listbox / combobox 分组标题行内内缩跟随条目改为 `--xh-control-px-md`，与条目文字保持同一条竖线。

- f7d53de: 列表族条目度量与高亮档位统一第二批（context-menu / menubar / mention / time-picker / transfer / table），与 select 族同一套两档词汇。

  破坏性：9 个覆盖槽改名或移除（不留旧名）：

  - `--xh-context-menu-item-bg-highlight` → `--xh-context-menu-item-bg-hover`、`--xh-menubar-item-bg-highlight` → `--xh-menubar-item-bg-hover`、`--xh-transfer-item-bg-highlight` → `--xh-transfer-item-bg-hover`、`--xh-table-row-bg-highlight` → `--xh-table-row-bg-hover`、`--xh-time-picker-item-bg-highlight` → `--xh-time-picker-item-bg-hover`：悬停与键盘锚点统一为中性灰轻档（缺省 `--xh-bg-subtle`），不再随语气换色。
  - `--xh-time-picker-item-bg-checked-highlight` → `--xh-time-picker-item-bg-checked-hover`：同一档位词汇；选中格保持品牌实底不变。
  - `--xh-mention-item-bg-highlight` → `--xh-mention-item-bg-hover`，`--xh-mention-item-fg-highlight` 与 `--xh-mention-item-font-weight-highlight` 移除：候选锚点回归纯轻档底色，不再借选中的文字色与字重。

  新增：

  - context-menu 打开子菜单的触发条目升强档：品牌淡底（经 `--xh-_tone-subtle` 随语气、缺省 `--xh-bg-brand-subtle`）+ 600 字重，新增 `--xh-context-menu-item-bg-active` 与 `--xh-context-menu-item-active-font-weight`。
  - menubar 展开着的菜单 trigger 升强档：`--xh-menubar-trigger-bg-active` 槽名不变、缺省从中性灰改为品牌淡底；不加字重（横排加粗会推挤相邻触发器）。悬停新增轻档槽 `--xh-menubar-trigger-bg-hover`。
  - 条目行高从 none 抬到 normal，新增 `--xh-context-menu-item-leading` 与 `--xh-menubar-item-leading`。

  度量：

  - context-menu / menubar / mention / transfer 条目与 time-picker 格 padding 统一 6px / 12px（`--xh-space-1_5` / `--xh-control-px-md`，行内随密度轴收窄），底色文字色补 micro 过渡；context-menu / menubar 尺寸阶梯重排（sm = `--xh-space-1` / `--xh-control-px-sm`，lg = `--xh-space-2` / `--xh-control-px-lg`）。
  - time-picker 格保持紧排行高：居中的单个数字格没有截断层，列内多露几格。
  - transfer 面板头与搜索框行内内缩跟随条目改 `--xh-control-px-md`，勾选列与全选框保持同一条竖线。
  - table 只统一行高亮档位词汇；行选中保持底色表达（宽行扫读依赖底色通道），单元格度量不动。
  - tags-input 不入组：其 data-highlighted 是退格/方向键的操作光标（整颗反白表示即将删除或编辑），语义与列表导航高亮不同，胶囊度量亦非列表行。

- d43624c: 把跨组件已经分叉的名字统一回一套。part 名与 prop 名在 1.0 之后就是公开 API——皮肤按
  `data-part` 选择、使用者按 prop 名调用——改名一律是破坏性变更，所以趁 alpha 一次改完。

  **time-picker 的列表条目由 `option` 改叫 `item`。** 另外 32 个组件的列表条目都叫 `item`，
  只有它是 `option`。ARIA 角色仍是 `role="option"`（那是角色不是部件名），列里的候选值集合
  `TimePickerColumn.options` 也不动（那是数据不是部件）。

  迁移点：

  - `data-part='option'` 改成 `data-part='item'`；皮肤覆盖槽 `--xh-time-picker-option-*`
    改成 `--xh-time-picker-item-*`（共 10 个）。
  - Vue 组件 `XhTimePickerOption` 改名 `XhTimePickerItem`。
  - WC 的 `::part(option)` 改成 `::part(item)`。
  - headless 导出：`timePickerOptionQuery` → `timePickerItemQuery`、`findTimePickerOption` →
    `findTimePickerItem`、`timePickerOptionValue` → `timePickerItemValue`、
    `TimePickerOptionProps` → `TimePickerItemProps`。
  - `TimePickerApi` 上：`getOptionProps` → `getItemProps`、`isOptionSelected` → `isItemSelected`、
    `isOptionDisabled` → `isItemDisabled`、`focusedOption` → `focusedItem`。
  - 键盘规格号 `time-picker.kbd.option-*` → `time-picker.kbd.item-*`。

  **transfer 的数据入口由 `items` 改叫 `collection`。** 另外 17 个集合组件的数据入口都叫
  `collection`。单条的类型名 `TransferItem`、某一侧看得见的条目 `visibleItems`、纯函数
  `transferVisibleItems` 都不动——它们说的是「条目」，不是「数据入口」。

  迁移点：

  - Vue：`<XhTransferRoot :items="…">` 改成 `:collection="…"`。
  - WC：`el.items = […]` 改成 `el.collection = […]`（这个入口表达不成属性，本来就只能走 property）。
  - `TransferApi.items` → `TransferApi.collection`。

  **checkbox-group 的组内子部件对齐 radio-group。** 同一语义两套名字：checkbox-group 用
  `item-control` / `item-hidden-input`，radio-group 用 `indicator` / `hidden-input`。裸名是全仓
  多数（`indicator` 13 处、`hidden-input` 10 处），checkbox-group 随大流。`item-text` 不动
  （21 份解剖都这么叫）。

  迁移点：

  - `data-part='item-control'` → `'indicator'`，`data-part='item-hidden-input'` → `'hidden-input'`。
  - 皮肤覆盖槽 `--xh-checkbox-group-control-*` → `--xh-checkbox-group-indicator-*`（10 个），
    与 radio-group 的 `--xh-radio-group-indicator-*` 对齐。
  - `CheckboxGroupApi.getItemControlProps` → `getIndicatorProps`，
    `getItemHiddenInputProps` → `getHiddenInputProps`（两个名字 radio-group 早就在用）。
  - Vue 组件 `XhCheckboxGroupItemControl` → `XhCheckboxGroupIndicator`。

  **table 的空态部件由 `empty-state` 改叫 `empty`。** 部件名不该与组件的 scope 名撞车——
  `empty-state` 是一个独立组件的 `data-scope`，再拿它当 table 的部件名，写皮肤时
  `[data-part='empty-state']` 与 `[data-scope='empty-state']` 混在一起读不出谁是谁。
  combobox 早就叫 `empty`。独立的 `empty-state` 组件本身不动。

  迁移点：

  - `data-part='empty-state'` → `'empty'`。
  - `TableApi.getEmptyStateProps` → `getEmptyProps`。
  - Vue 组件 `XhTableEmptyState` → `XhTableEmpty`（`XhEmptyState*` 那一族是另一个组件，不变）。
  - WC 的 `::part(empty-state)` → `::part(empty)`。

  **transfer 的 `onSelectedChange` 改叫 `onSelectionChange`。** table 与 tree 都叫
  `onSelectionChange`。受控的 `selected` prop 与载荷字段 `{ selected }` 不动——那是「被勾中的值」，
  与回调名说的不是一回事。

  - `TransferSelectedChangeDetails` → `TransferSelectionChangeDetails`。
  - Vue 事件 `@selected-change` → `@selection-change`；WC 的 `selected-change` 事件同改。
  - `v-model:selected` 不变。

  **`size` 不再一名两用。** 三轴里的 `size` 是语气枚举，而 qr-code 的 `size` 是像素数值、
  splitter 的 `size` 是百分比数组——两者占着同一个名字却是完全不同的类型，使用者写
  `size="md"` 得到的是静默的错。

  - qr-code：`size` → `pixelSize`（WC 属性 `size` → `pixel-size`）。中心 logo 挖空区的
    `QrCodeLogoArea.size` 是模块数标量，不动。
  - splitter：数组值的一律改复数——`size` → `sizes`、`defaultSize` → `defaultSizes`、
    `onSizeChange` → `onSizesChange`、`onSizeChangeEnd` → `onSizesChangeEnd`、载荷字段
    `{ size }` → `{ sizes }`、机器事件 `SIZE.SET` → `SIZES.SET`、Vue 的 `v-model:size` →
    `v-model:sizes`、WC 属性 `size` → `sizes`。标量的不动：每块面板的 `collapsedSize`、
    `BOUNDARY.SET` 的 `size`、`setPanelSize`、`SplitterPanelState.size`。

  **没有合并的一处，记在这里免得后人重新翻案。** 就绪度审计说 pin-input 的 `onValueComplete`、
  editable 的 `onValueCommit`、slider 的 `onValueChangeEnd` 是「三个名字表达同一语义」，
  逐条读过源码后判定不成立：`onValueComplete` 是「每格都填满的那一刻」（值的形状谓词），
  `onValueCommit` 是「提交那一刻」（用户显式确认），`onValueChangeEnd` 是「一次操作结束」
  （手势结束，splitter 的 `onSizesChangeEnd` 用的是同一套）。三件不同的事，合并会让 API 更差。

### Minor Changes

- c57542d: 补齐 4 处「边框改不动」的覆盖槽。

  这几处的边框颜色绑在背景槽上，或者干脆没有槽——想只改边框改不了，一动就连底色一起变：

  - `form` 的提交按钮三态：`border-color` 直接读 `--xh-form-submit-bg`，没有 `--xh-form-submit-border`。
  - `editable` 的提交按钮 hover / active：静息态有 `--xh-editable-submit-border`，另两态回落到 bg 槽，
    覆盖被顶掉。
  - `table` 的行选中把手选中态：静息态有 `--xh-table-trigger-border`，选中态改用 bg 槽。
  - `steps` 的禁用态指示器：全皮肤唯一一条没有对外覆盖槽的边框声明，而且拿前景令牌
    `--xh-fg-disabled` 当边框色；同部件的 current / completed 两态都有各自的 border 槽。

  新增 8 个槽，都排在既有 bg 槽之前作为第一优先，未设置时求值链回落到原值——**渲染结果逐字不变**，
  既有的 `--xh-form-submit-bg` 之类覆盖照旧同时改动边框与底色。

- a19bbaa: 级联选择补空态兜底：新增 empty 部件，搜索无候选或 collection 为空（根列没有条目）时露面，其余时候带 hidden。

  - headless：`getEmptyProps` 管空态占位的露面与收起；`getSearchListProps` 无候选时带 `data-empty`，`getContentProps` 根列没有条目时带 `data-empty`；新增 `translations` prop（`empty` / `noMatch` 两键，默认英文）与 api 上并入默认后的完整一份。
  - vue：`XhCascaderContent` 自动补渲空态占位，`empty` 插槽可换内容，缺省文案按视图取无匹配或无数据；`translations` prop 接入全局 `provideXhConfig` 注入点（`translations.cascader`）。
  - web-components：新增可缺省的 `empty` 部件，元素代管其 hidden，文案归作者。
  - styles：空态占位居中排版（`--xh-cascader-empty-min-h` / `--xh-cascader-empty-p` / `--xh-cascader-empty-fg` 可覆写）；无候选时候选列表不再占位，根列没有条目时空列让位。

- 72dc39c: color-picker 能进 HTML 表单了。

  此前它既没有 `name` prop 也没有表单影子——放进 `<form>` 里提交，`FormData` 里没有这个字段。
  同仓 11 个组件早就做全了这件事，它是缺口之一。

  照仓内既成的形状补：新增 `hidden-input` 部件（`type=hidden`，排在解剖末位）、`name?: string` prop、
  `ColorPickerApi.getHiddenInputProps()`。影子产出的属性恰好五条——parts 属性、`type`、`name`、`value`、
  `disabled`——`type` 必须排在 `value` 前（改 type 会重置输入的值），`name` 不给就整条不产出、这份输入
  不参与提交，禁用时带原生 `disabled` 不提交值，只读照常提交。

  **这是纯增量**：影子是作者自己写的可选部件（Vue 侧新增 `XhColorPickerHiddenInput`，WC 侧新增
  `::part(hidden-input)`），不写它就不存在，既有 DOM 与皮肤选择器一个字节不变。

- 4748212: 控件边界切到 `border.control`，WCAG SC 1.4.11 的 3:1 第一次真的达标。

  **这是一次观感变更**：输入框、选择器、复选框、单选、开关、步进钮这一类控件的边框会比以前明显一点
  （浅色 1.26 → 3.23，深色 1.91 → 3.59），悬停档 4.73 / 4.18。分隔线、卡片描边、表格行线、浮层外框
  一律不动——它们不在 SC 1.4.11 的范围内，跟着变重只会毁掉版面。

  131 处改动，判定规则是可机械执行的四问，其中决定性的一问是**焦点环画在谁身上**：环向下委派给
  后代（`outline: none` 且后代另有画环规则）的盒子是取景框不是控件，它的边框不承载「不看清就做不成事」
  的信息。`table` 的 root 与 `listbox` 的 content 因此同判装饰——两份文件里各自写着的注释就是依据
  （「纯容器：焦点落它身上不画环，高亮永远长在行上」／「落焦不画环：高亮永远长在条目上」）。

  **三处二阶效应，逐条处理过：**

  - `splitter` 的分隔条静息走 `background` 取 `border.default`，而它的悬停走的是 `bg-*` 族。只迁静息会让
    悬停比静息更淡，所以这一处不迁。
  - `text-field` / `number-field` 的**聚焦态描边**兜底仍是 `border.default`。静息提到 3.23 之后，控件一被
    聚焦边框反而掉回 1.26——比静息淡一大截。8 条聚焦槽一并迁走（含 subtle / ghost 两个变体：它们静息是
    `transparent`，聚焦那道边就是当下唯一的边界）。
  - `transfer` 的搜索框 `border: 0` 只留一条下边线，而它与面板共用 `--xh-transfer-panel-border`。新增
    `--xh-transfer-search-border` 单独承载，默认控件级。

  写了一份倒挂检查：13 个私有边框槽族 × 四个主题档位（浅、深、浅+高对比、深+高对比），逐档比对
  静息 / 悬停 / 聚焦的权重必须单调不减，现在零倒挂。

  **仍未达标、如实记账的一处**：带语气的 outline 形态（`<XhButton variant="outline" tone="danger">` 这类）
  走的是 `--xh-_tone-border`，它是语气色兑 40% 底色的结果，六种语气在两套主题下是 1.44–2.18，新令牌够不着。
  要治得另立一支控件级的语气边框槽，而那一支里 `warning` 对白底只有 2.70，仍需单独裁定——留待下一轮。

- 239eb5d: 浮层箭头改为指向锚点，不再钉死在浮层中点。

  定位结果新增箭头落点：`PositionResult.arrow` 给出箭头中心距浮层起始缘的距离（上下两侧给 x、左右两侧给 y），由调用方在 `PositionOptions.arrow` 里交出箭头的尺寸与让开圆角的余量才计算，不要就缺席。落点算在翻面与挪位之后，两者的位移因此自动带上；锚点落在浮层之外时钳到最近的合法点。

  六个带箭头的浮层（popover / tooltip / hover-card / menu / context-menu / tour）接上这条链路：机器把箭头的量交给引擎，连接层把落点写成内联自定义属性，皮肤消费它、引擎没给时退回原来的居中。此前只要 placement 带 `-start` / `-end` 对齐、浮层比锚点宽、或引擎为避让把浮层挪了位，箭头就指向空处。

  tooltip 的箭头补了 `data-placement`，皮肤的四条侧向规则从挂祖先 positioner 改为挂箭头自己，与其余五个统一。

- a41b931: 进度条新增环形与仪表盘两种形态。

  - 新增 `variant` 轴：`line`（缺省，行为逐字不变）/ `circle` / `dashboard`，以及 `canvas`（承载环的 svg）与 `label`（环心那一块）两个可缺省部件。
  - 新增 props：`strokeWidth`（环的线宽，viewBox 单位，缺省 6）、`gapDegree` 与 `gapPosition`（仪表盘的缺口，缺省 75 度朝下）、`valueText`（进度不是百分比时给读屏念的那句话）。线宽是 prop 不是令牌——它改的是几何，半径要跟着往里收；线形的厚度仍走 `--xh-progress-thickness`。
  - 环的直径、底槽色、进度色与端点形状走令牌（`--xh-progress-size` / `-track` / `-range` / `-linecap`），几何由连接层算好写进标记，皮肤只上色。

  顺带两处修正：

  - 退化输入不再算成满进度：`max` 不为正或不是数时回落 100，`value` 不是数时按 0 处理（此前 `max=0` 会让进度算成满格）。
  - 线形的长度不再取整：`value=3 / max=8` 由 38% 改为 37.5%，相邻两档不会再看起来一样长。

- 032f3fd: 带语气的 outline 控件边框补到 3:1，并修掉上一版留下的一处断链。

  上一版把控件边界迁到 `border.control` 时，如实记了一笔「带语气的 outline 形态够不着 3:1」——
  它走的是 `--xh-_tone-border`（语气色兑 40% 底色），六族在两套主题下是 1.44–2.18。这一版补上。

  新增 `--xh-_tone-border-control`：直接取语气主色本体，不再兑底色。两族在各自的底上仍不够，
  按主题各兜一次——语气色是固定原语、不随主题翻，这是唯一能表达的地方：

  - 黄在白底上只有 2.70，浅色态改取新增的 `--xh-color-warning-700`（3.75）；深色态 600 档就有 7.32，不动。
  - 中性在深色底上只有 2.54，深色态改取 `--xh-color-neutral-550`（3.59）；浅色态 600 档就有 7.80，不动。

  六族 × 两套主题现在最低 3.04（浅色 success），全部达标。

  **调色板新增一档** `--xh-color-warning-700 = oklch(0.62 0.15 70)`。步距 ΔL 0.085，落在同族 700 档的
  区间中间（brand 0.058 / danger 0.077 / success 0.138），色度按同族惯例微降，色相与 600 一致。
  黄族此前只有 500/600 两档，没有更深的档可取，所以必须新增。

  **顺带修掉一处断链**：上一版把 `toggle.css` 的 outline 边框改指了 `--xh-_tone-border-control`，
  而那个槽当时并不存在——`<XhToggle variant="outline" tone="danger">` 的边框一直退到中性色，语气丢了。
  这一版把槽真正建起来，`button` 与 `button-group` 一并接上。

  **新增门禁 `check-private-slots`**：皮肤里消费的每个 `--xh-_*` 私有槽都必须在某份皮肤里声明过，
  声明了没人用的也要删。上面那条断链正是它该拦下的——CSS 不报错、TS 不报错，
  而既有的 `check-token-refs` 整体放行 `--xh-_` 前缀，谁都看不见。拿改动前的仓库实跑过：它红在
  `toggle.css:71`，改完转绿。

### Patch Changes

- bae3231: combobox 展开按钮翻面改为只转箭头字形（或作者塞的图形），不再旋转按钮本体：按钮自带悬停底色，整体旋转会带着底色一起转出一个歪斜的方块。
- c8c7c18: 修复 `index.css` 的级联层序：`layers.css` 的层序声明挪到入口最顶。此前 tokens 与部分组件皮肤抢先立层，实际层序成了 `tokens < components < reset < motion < overrides`，`reset` 的 `font: inherit` 会压掉表单控件皮肤的 `font-size`。date-picker 的 showTime 皮肤同步从 motion 层归位 components 层。仅分层入口受影响，`index.unlayered.css` 行为不变。
- Updated dependencies [f72664d]
- Updated dependencies [89d8c54]
- Updated dependencies [032f3fd]
  - @xihan-ui/tokens@1.0.0-alpha.1

## 1.0.0-alpha.0

### Major Changes

- bc65cb7: 首个公开版本：框架无关的 UI 基座。

  自研薄 FSM 内核 + headless（anatomy / machine / connect）+ 设计令牌与主题运行时 + 样式层，
  102 个组件在 Vue 与 Web Components 两套适配器上共用同一份内核，跨适配器一致性套件与
  真实 Chromium 里的无障碍扫描、浮层定位契约全绿。

  浮层定位、虚拟滚动、Web Components 响应式基类、代码着色、流式 Markdown 均为自研，
  运行时不带第三方依赖。

- 84b1aa3: 新增 Icon 原语，`@xihan-ui/icons` 整包重写为首方图标集。

  旧的 `@xihan-ui/icons` 是 27 个第三方图标集的聚合（约四万个图标），已整体移除并在
  npm 上弃用。新包只收自研图标，第一批 29 个覆盖组件库自用的全部语义，24×24 单色
  描边、`stroke-width` 2。

  用法：

  - `@xihan-ui/kernel` 导出 `IconRecord` / `IconNode` / `IconTag` 三个类型
  - `@xihan-ui/headless` 导出 `connectIcon` / `iconAnatomy` / `iconMeta` / `iconKeyboard`
  - `@xihan-ui/vue` 导出 `XhIcon`，`@xihan-ui/web-components` 注册 `<xh-icon>`
  - `@xihan-ui/styles` 新增 `icon.css`，`data-size` 与 `data-weight` 各三档

  图标记录是结构化节点数组而不是 SVG 字符串，渲染端逐节点建元素，运行期不经 HTML
  解析器。图标数据传的是记录本身而不是名字：按名字查表要把全表静态引进来，摇树会
  整个失效。

  WC 侧要在 `<svg data-xh-part="root">` 里留一个空的 `<g data-xh-part="glyph"></g>`
  作为授权点，元素只在它内部铺图元；不留这个空壳就一个节点都不动，手写内联 SVG 与
  `<use>` 引用两种写法因此都还能用。`icon` 是对象，只能走 property 传，属性里写不出来。

  可及名字两态互斥：`label` 给了非空白文本就输出 `role="img"` 与 `aria-label`，否则
  输出 `aria-hidden="true"`。只有图标的按钮请把名字写在按钮上而不是图标上，两处都写
  读屏会念两遍。

### Patch Changes

- Updated dependencies [bc65cb7]
  - @xihan-ui/tokens@1.0.0-alpha.0
