# @xihan-ui/sound

## 3.1.0

### Patch Changes

- Updated dependencies [fc9c306]
  - @xihan-ui/core@3.1.0

## 3.0.0

### Major Changes

- e4d038a: 反馈服务的声音包装改名，不再绑定轻提示：`@xihan-ui/sound` 的装饰器与类型、Vue / React `sound` 子入口的包装函数一律改用 Notification 的名字，旧名不保留。适配器侧的包装改为按结构化端口泛型，传入哪个服务就原样交回哪个服务的类型。

  | 旧                                                                 | 新                                                              |
  | ------------------------------------------------------------------ | --------------------------------------------------------------- |
  | `withToastSoundService`（`@xihan-ui/sound`）                       | `withNotificationSoundService`                                  |
  | `ToastSoundServicePort`                                            | `NotificationSoundServicePort`                                  |
  | `ToastSoundServiceOptions`                                         | `NotificationSoundServiceOptions`                               |
  | `ToastSoundKey`                                                    | `NotificationSoundKey`（Vue / React 的 `sound` 子入口同时导出） |
  | `withToastSound`（`@xihan-ui/vue/sound`、`@xihan-ui/react/sound`） | `withNotificationSound`                                         |
  | `ToastSoundOptions`                                                | `NotificationSoundOptions`                                      |

  迁移只改名字，选项、声音映射（四档语气各一把、`loading` 静音、`update` 只在改语气或打开 `loading` 时发声）与返回值不变：

  ```ts
  // 之前
  import { withToastSound } from "@xihan-ui/vue/sound";
  export const toast = withToastSound(createToastService());

  // 之后（轻提示服务同批并入通知，见通知的 changeset）
  import { withNotificationSound } from "@xihan-ui/vue/sound";
  export const toast = withNotificationSound(
    createNotificationService({ preset: "toast" })
  );
  ```

### Patch Changes

- Updated dependencies [f660e16]
- Updated dependencies [25ccc68]
- Updated dependencies [6dec15e]
- Updated dependencies [a85b582]
- Updated dependencies [a72c5bb]
- Updated dependencies [41a393e]
- Updated dependencies [fac80f7]
- Updated dependencies [4e619a5]
- Updated dependencies [e19c0b4]
- Updated dependencies [3092b47]
- Updated dependencies [d210959]
- Updated dependencies [d1cca09]
- Updated dependencies [65d6fc3]
- Updated dependencies [467c967]
- Updated dependencies [bc8120d]
- Updated dependencies [f7cec9b]
- Updated dependencies [768b06f]
- Updated dependencies [6356589]
- Updated dependencies [94aee78]
- Updated dependencies [8a2b0fa]
- Updated dependencies [c292b0f]
- Updated dependencies [1b0701c]
- Updated dependencies [7878927]
- Updated dependencies [ad0b9da]
- Updated dependencies [25db668]
- Updated dependencies [8ca7eaa]
- Updated dependencies [0c8d389]
- Updated dependencies [e90cad8]
- Updated dependencies [f2e9fb0]
- Updated dependencies [4edea3b]
- Updated dependencies [7bf67f9]
- Updated dependencies [606ef8d]
- Updated dependencies [2f6e6b3]
- Updated dependencies [648c368]
- Updated dependencies [1b7ad21]
- Updated dependencies [d48dbf7]
- Updated dependencies [4920b59]
- Updated dependencies [6d95e8c]
- Updated dependencies [bfbf28b]
  - @xihan-ui/core@3.0.0

## 2.1.0

### Patch Changes

- Updated dependencies [1e7bc1d]
- Updated dependencies [abd9e8c]
  - @xihan-ui/core@2.1.0

## 2.0.0

### Major Changes

- c8790c8: **`@xihan-ui/kernel`、`@xihan-ui/machine`、`@xihan-ui/behavior` 三个包合并成 `@xihan-ui/core`。三个旧包名不再发布，也没有转发包。**

  三者原本是一条严格的链（`machine` 依赖 `kernel`，`behavior` 依赖 `kernel` 与 `motion`），从不单独安装：装了任意一个适配器就三个一起来。分成三个包对使用者没有取舍空间，只多出两份包名、两份版本号与两份 README。合并之后公开包从 18 个减到 16 个。

  **导出的名字一个都没有变。** 原先从三个包里导出的东西现在全部从 `@xihan-ui/core` 的主入口导出，签名与行为不变。两处例外：

  - `Dict` 本来就是结构原语那一段的类型，状态机那一段只是转手再导出一遍，现在只剩一处定义。
  - 锁步版本不一致那条诊断（`core.version-mismatch`）的 `detail` 字段由 `kernelVersion` 改名为 `coreVersion`，播报文案里的包名同步改口。读这条诊断做分流的要跟着改字段名。

  ## 包名怎么改

  | 从前                 | 现在             |
  | -------------------- | ---------------- |
  | `@xihan-ui/kernel`   | `@xihan-ui/core` |
  | `@xihan-ui/machine`  | `@xihan-ui/core` |
  | `@xihan-ui/behavior` | `@xihan-ui/core` |

  同一个文件里如果原来从两个或三个旧包各引一行，合并之后是同一个模块说明符，按自己的 lint 规则并成一行即可。

  ## 子路径怎么改

  子入口一条不少，名字原样平移：

  | 从前                          | 现在                        |
  | ----------------------------- | --------------------------- |
  | `@xihan-ui/kernel/metadata`   | `@xihan-ui/core/metadata`   |
  | `@xihan-ui/kernel/skin-check` | `@xihan-ui/core/skin-check` |
  | `@xihan-ui/kernel/vite`       | `@xihan-ui/core/vite`       |
  | `@xihan-ui/machine/vanilla`   | `@xihan-ui/core/vanilla`    |
  | `@xihan-ui/behavior/presence` | `@xihan-ui/core/presence`   |

  ## 依赖怎么改

  `package.json` 里把三个旧包名删掉，换成一条 `@xihan-ui/core`。装适配器的使用者不用动：`@xihan-ui/vue` 与 `@xihan-ui/web-components` 已经改成依赖 `@xihan-ui/core`，升级适配器就一并带过来。

- a16f7f2: **轻提示与通知的 `type` 改名 `tone`，取值收成全库语气轴的 `info | success | warning | danger`；加载中从语气里拆出来，独立成 `loading?: boolean`。**

  原来的 `type` 一位说了两件事：既是配色语气，又用 `'loading'` 表达"事情还没完"，于是 `'error'` 得先翻译成语气层的 `danger`，`'loading'` 又得偷偷派生成中性色。现在语气与加载态各占一位：`tone` 直接落到 `data-tone`，决定配色、行首字形与实时区级别（`danger` 走 alert + assertive）；`loading` 落到 `data-loading`，字形换成转圈且不自动消失，配色照语气走，完事后写 `{ loading: false, tone: 'success' }` 收尾。皮肤不再读 `data-severity`。

  三端与服务同步：Vue / React 的 `type` prop、自定义元素的 `type` attribute 改为 `tone` + `loading`；`ToastType` / `NotificationType` 改名 `ToastTone` / `NotificationTone`；轻提示与通知服务的 `error()` 糖改名 `danger()`，`loading()` 糖改为打开 `loading` 位，`promise()` 落定后以 `{ loading: false, tone }` 改写；`@xihan-ui/sound` 的 `withToastSound` 端口同步改成 `danger`，`sounds` 覆盖表的键从 `error` 改为 `danger`（缺省仍发主题里那把 `error` 声）。

### Minor Changes

- 75ec9fb: 按压音效的声明归一、禁用标记判断与首手势解锁接线迁入框架无关的 sound 包；Vue、React 不再各自维护三份相同规则。
- 995d675: `@xihan-ui/sound` 新增框架无关的共享播放器、业务语义声音与 Toast/Dialog 服务装饰控制器。控制器通过最小结构化服务端口和解锁接线回调工作，不反向依赖 Headless 或 UI 框架。

  Vue 与 React 的 `withToastSound`、`withDialogSound`、`getSoundPlayer`、`setSoundPlayer` 公开 API 保持不变，内部改为复用声音包控制器；各自的 directive/hook、DOM 点击与首次手势监听仍由适配器持有。

### Patch Changes

- d366e45: Core 新增可独立 tree-shake 的 `DIAGNOSTIC_WARN` 单项诊断码；Sound 复用该入口与内部声部/服务构造器，保持诊断通道和声音配方不变，同时避免为一个码保留整张诊断表。
- Updated dependencies [bdf4028]
- Updated dependencies [c7966d3]
- Updated dependencies [9658294]
- Updated dependencies [f070bb8]
- Updated dependencies [249819e]
- Updated dependencies [589d192]
- Updated dependencies [7e512dc]
- Updated dependencies [09a1a45]
- Updated dependencies [2dd6293]
- Updated dependencies [d822ffd]
- Updated dependencies [3116bd3]
- Updated dependencies [b23b40a]
- Updated dependencies [19570ad]
- Updated dependencies [f0a2e34]
- Updated dependencies [19570ad]
- Updated dependencies [ce5d75a]
- Updated dependencies [d5576cb]
- Updated dependencies [9bf22c1]
- Updated dependencies [147daa4]
- Updated dependencies [ffe0797]
- Updated dependencies [add5b79]
- Updated dependencies [1540cc1]
- Updated dependencies [8b4d452]
- Updated dependencies [5982974]
- Updated dependencies [3577e4c]
- Updated dependencies [ab984e8]
- Updated dependencies [7640d5c]
- Updated dependencies [8e8d953]
- Updated dependencies [21b006a]
- Updated dependencies [bd67168]
- Updated dependencies [48d6b88]
- Updated dependencies [0d35f1a]
- Updated dependencies [ed347e1]
- Updated dependencies [db52f9b]
- Updated dependencies [1042c06]
- Updated dependencies [c8790c8]
- Updated dependencies [3f9c145]
- Updated dependencies [1f472ba]
- Updated dependencies [fc0ecaf]
- Updated dependencies [963fe2c]
- Updated dependencies [eabcc37]
- Updated dependencies [07e29f9]
- Updated dependencies [c544218]
- Updated dependencies [b991bb5]
- Updated dependencies [ff3593c]
- Updated dependencies [95ebc66]
- Updated dependencies [4babe65]
- Updated dependencies [80e6fdf]
- Updated dependencies [f45e0f7]
- Updated dependencies [5397ae3]
- Updated dependencies [82b5de5]
- Updated dependencies [842da07]
- Updated dependencies [a15f0f3]
- Updated dependencies [7f77bdd]
- Updated dependencies [00bca80]
- Updated dependencies [30a811b]
- Updated dependencies [d366e45]
- Updated dependencies [9c32ad7]
- Updated dependencies [33c6805]
  - @xihan-ui/core@2.0.0

## 1.1.0

### Patch Changes

- Updated dependencies [03fb633]
  - @xihan-ui/kernel@1.1.0

## 1.0.0

### Minor Changes

- b8afdb2: 新增 `@xihan-ui/sound` 声音层：纯 Web Audio 程序化 UI 音效，零音频文件、零第三方依赖、框架无关。声音是可序列化的声明式配方（振荡器与噪声分层、包络驱动、可选滤波与混响），内置 default / minimal / soft 三套主题覆盖 14 个语义名；`createSoundPlayer` 管好自动播放策略、音量、开关与同名节流。

### Patch Changes

- Updated dependencies [e73b671]
- Updated dependencies [d0202b2]
- Updated dependencies [7da1272]
- Updated dependencies [bc65cb7]
- Updated dependencies [ed01a81]
- Updated dependencies [84b1aa3]
- Updated dependencies [a321a50]
- Updated dependencies
- Updated dependencies [8d35702]
- Updated dependencies [239eb5d]
- Updated dependencies [89d8c54]
- Updated dependencies [516bd46]
- Updated dependencies [24721f4]
- Updated dependencies [9548330]
- Updated dependencies [7a5d898]
- Updated dependencies [4b949c2]
  - @xihan-ui/kernel@1.0.0

## 1.0.0-preview.0

### Patch Changes

- Updated dependencies [e73b671]
  - @xihan-ui/kernel@1.0.0-preview.0

## 1.0.0-alpha.3

### Patch Changes

- Updated dependencies [d0202b2]
- Updated dependencies [7da1272]
- Updated dependencies [ed01a81]
- Updated dependencies [a321a50]
- Updated dependencies [8d35702]
- Updated dependencies [516bd46]
- Updated dependencies [9548330]
  - @xihan-ui/kernel@1.0.0-alpha.3

## 1.0.0-alpha.2

### Patch Changes

- Updated dependencies [7a5d898]
  - @xihan-ui/kernel@1.0.0-alpha.2

## 1.0.0-alpha.1

### Minor Changes

- b8afdb2: 新增 `@xihan-ui/sound` 声音层：纯 Web Audio 程序化 UI 音效，零音频文件、零第三方依赖、框架无关。声音是可序列化的声明式配方（振荡器与噪声分层、包络驱动、可选滤波与混响），内置 default / minimal / soft 三套主题覆盖 14 个语义名；`createSoundPlayer` 管好自动播放策略、音量、开关与同名节流。

### Patch Changes

- Updated dependencies [239eb5d]
- Updated dependencies [89d8c54]
- Updated dependencies [24721f4]
- Updated dependencies [4b949c2]
  - @xihan-ui/kernel@1.0.0-alpha.1
