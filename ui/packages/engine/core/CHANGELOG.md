# @xihan-ui/core

## 2.1.0

### Minor Changes

- 1e7bc1d: Portal 视觉桥不再按「浮层数 × 自定义属性数」重读计算样式。此前祖先链上任何一次非 `style` 的属性变更——最常见的是页面级过渡类的增删——都会让链下每个 Portal 各跑一次同步，而每次同步把来源、壳父节点与文档根三份计算样式里的自定义属性整张表枚举一遍。实测一页 61 个浮层、776 个自定义属性时，往页面根上加一个 class 等于 121108 次 `getPropertyValue()`；Vue 的类式页面过渡一次进场增删五轮，每次切页多付约 200ms 主线程。

  三处改动，投影结果不变：

  - **按文档索引样式表，收窄每次同步要读的名字。** 只由文档根（`:root`、`html`）或桥会复制到壳上的那些属性（七个视觉轴与 `data-tone`）选中的声明——令牌层的 `:where(:root)`、`:where([data-density='compact'])` 就是这个形状——在壳上会被同一条规则再命中一次，不进候选；再去掉根上没有声明的 `--xh-` 名字（组件槽、家族槽、私有槽与语气族本来就不跨 Portal）。索引按样式表指纹缓存，跨域样式表读不到规则时整体让位、退回枚举整表。
  - **`class` 变更先便宜地否决。** 只有增删的名字出现在「声明了自定义属性的选择器」里才重算。`[class]` 属性选择器出现时该判定让位，照旧重算。
  - **同一微任务检查点内的多台桥共享读取。** 文档根的声明判定与壳父节点的取值对同批次每台桥都是同一个答案，只读一次；壳上写过东西后落在它里面的父节点取值立即作废（嵌套 Portal）。显式 `sync()` 不走批次，每次都是全新读取。

  行为上有两点可观察的收敛：祖先上密度、主题等轴的局部切换不再把对应令牌逐条复制成壳的 inline 声明，改为只带属性、由壳自己解析（浮层内解析到的值不变，实测 `data-density="compact"` 下每个壳少写 55 条 inline）；来源没有显式声明某个轴时，该轴相关的令牌与既有的轴语义一致，继续继承落点容器而不是从来源复制。此外，通过 CSSOM 往已有分组规则内部插入声明自定义属性的规则不改变索引指纹，这种改动后需要显式 `sync()`。

### Patch Changes

- abd9e8c: 可 tab 候选的渲染判定不再按「候选数 × 容器层数」查计算样式。`getTabbables` 逐个调 `isRendered`，而 `isRendered` 每次都从元素自己一路查到文档根，同一个容器里的候选祖先高度重合，整条链被重复查了几百遍；焦点域每按一次 Tab 都要走一遍。现在一次查询共享一枚探针：`display: none` 沿祖先链查到第一个已有答案即止，整条链的结论顺手记下，探针不跨查询留存。Tab 边界回绕另走只求首尾两个候选的路径，从两端各扫到第一个命中即止，不再把整屏候选都判一遍。

  一屏 400 个控件、15 层容器时，一次 `getTabbables` 从 8000 次 `getComputedStyle` 降到 418 次，十次查询由 29ms 降到 4.3ms。

  - @xihan-ui/motion@2.1.0

## 2.0.0

### Major Changes

- 09a1a45: Dialog 与共用机器的 Drawer 在退出期间立即失活内容，保持模态资源直到内容和遮罩实际完成退出，并提供 onExitComplete/exit-complete 通知。重开撤销旧退出且恢复原焦点域，卸载立即清理。

  Presence.claimExit 删除 timeoutMs 参数，CSS 退出不再猜测声明时长或首个事件完成，而等待全部实际有限动画对象完成或取消；自定义租约必须由创建方完成或取消。FocusScope 增加 reactivate()，供保留中的焦点域恢复域内焦点。

- 2dd6293: `createDismissLayer` 的公开参数保持不变，内部从每实例三条 Document 监听改为每 Document 一套共享 Hub。每份显式 LayerRegistry 按对象身份拥有独立 lane；首个参与者同步事务化安装监听，最后参与者释放时完整卸载。同一 registry 的同一 Layer 重复创建 DismissableLayer 现在明确失败。

  pointer 与 focus 在业务回调前冻结一次 composed path 和全部 lane snapshot，再按各 lane 原始栈顶到栈底生成关闭计划。计划 getter 改变 snapshot 时立即放弃整条 lane，不再读取更低层。无参与者、未武装、无节点、命中层内或 surface 边界、表决否决、受控关闭后未退栈，以及关闭期间出现额外层栈变化，都会阻断更低层；执行中动态出现的 surface 会在关闭所属层后停止。候选完整返回 `onDismiss` 且 Layer 确实退栈后，协调器才按新的严格前缀继续下一候选。Escape 每条 lane 只处理事件开始时的原始栈顶。

  Hub 对整次 Document 派发加重入锁。派发期间最后参与者释放会延迟到 finally，回调同步新建的参与者复用原 Hub；一条 lane 抛错不会截断其他 registry lane，所有异常在末尾按发生顺序报告。监听、参与者武装、动画帧与清理全部来自 Scope 所属 realm，初始化和释放继续采用 LIFO 全量清理，单错原样、多错聚合并保留首错 cause。

- d822ffd: DismissableLayer 的 `onPointerDownOutside`、`onFocusOutside` 与 `onInteractOutside` 票据现在在
  `detail.originalEvent` 中保留触发本轮仲裁的原生事件对象。pointer 票严格给出 `PointerEvent`，
  focus 票严格给出 `FocusEvent`，interact 票给出两者的联合类型；事件不克隆，并由所属 Window
  构造外层 `CustomEvent`。DOM 票与 options 回调继续收到同一个可取消事件，任一路
  `preventDefault()` 都会在 specific、interact 两票送达后阻止本次关闭。

  三个公开回调原先使用未约束的 `CustomEvent<any>`，现在收紧为上述精确泛型。显式把回调参数
  标成其他 detail 形状的 TypeScript 调用方需要改为读取 `detail.originalEvent`。

- 3116bd3: DismissableLayer 现在严格使用 RuntimeConfig Scope 所属 Window 构造全部可取消事件、安排武装微任务与焦点抑制帧，并要求 `layerRegistry.ownerDocument`、Scope Document 与 Window 三者同域。iframe、画中画窗口和顶层 CustomEvent 全局缺失时，事件仍保持目标 realm 的正确身份。

  未登记到指定 registry 的 layer、非 HTMLElement、跨 Document 的动态 layer node、非冻结的 registry 快照，以及缺少 CustomEvent、queueMicrotask 或动画帧能力的宿主现在会明确失败，不再借 ambient DOM 或调度能力。

  keydown、pointerdown 与 focusin 监听改为创建期间同步事务化注册，微任务只负责武装交互。任一 add 或 queue 失败都会同步按 LIFO 完整回滚，使 Headless 浮层外壳继续撤销已经登记的 Layer。正常 dispose 先进入终态，再按动画帧、focus、pointer、keydown 全量清理；单错原样上抛，多错按顺序聚合并以首错为 cause。`onDismiss` 抛错时即使焦点抑制帧清理也失败，业务原异常仍位于聚合首位。

  首次 node getter 也受初始化快照约束：让 layer 退栈或成功 ABA 会在零监听状态同步失败，失败登记补偿回同一 snapshot 则可继续。Escape、pointer 与 focus 表决固定 LayerRegistry 的冻结快照和该次节点。DOM 与选项回调期间只要层栈快照或节点换代，旧决定便失效；成功补偿回原 snapshot 的失败登记不误伤原票。pointer/focus 在提交前还会针对同一快照重算动态 branches 与 surfaces，避免回调刚把目标纳入逻辑分支后仍误关浮层。pointer 建帧后的票据复核与 `onDismiss` 共用主异常优先的清理边界，getter 失败同样会立即撤帧。延迟注册的 setTimeout 兜底已移除。

- 19570ad: **移除** `@xihan-ui/kernel` 上 12 个导出。

  九个属性名常量全库零引用——`data-state` 这类名字库里一律直接写字面量，常量从来没人取：`DATA_STATE` `DATA_DISABLED` `DATA_ORIENTATION` `DATA_HIGHLIGHTED` `DATA_SIDE` `DATA_ALIGN` `DATA_LAYER` `DATA_LAYER_BRANCH` `DATA_COLLECTION_ITEM`。其中后三个还是幻影：`data-xh-layer` `data-xh-layer-branch` `data-xh-collection-item` 这三个属性没有任何代码往 DOM 上打过。需要这些名字的写字面量即可，它们是 CSS 里本来就要照着写的那一串。

  三个重置函数是测试脚手架，生产代码零调用、文档零提及，却进了版本承诺：`resetSkinCheck` `resetRuntimeHost` `resetMetadataBanner`。需要出厂状态的用例改用 `vi.resetModules()` 重取一份模块。注意 `resetDiagnostics` 不在此列——诊断通道挂在 `globalThis` 上，重取模块清不掉它，那个函数是给宿主用的公开 API。

  **修复**四个消解事件名的双真源。`xh.dismiss.escapeKeyDown` / `pointerDownOutside` / `focusOutside` / `interactOutside` 此前在 kernel 与 behavior 各写了一遍字面量，改一处不改另一处就会静默分叉。现在 `@xihan-ui/behavior` 的消解层从 kernel 引 `EV_ESCAPE_KEY_DOWN` / `EV_POINTER_DOWN_OUTSIDE` / `EV_FOCUS_OUTSIDE` / `EV_INTERACT_OUTSIDE`，与同包的聚焦域引 `EV_MOUNT_AUTO_FOCUS` 一个口径。事件名本身没变，监听方不受影响。

- f0a2e34: **删掉废弃登记与探测整套。** 它当初是为了兑现「废弃保留期」而建的：把移走的旧名登记进一张表，dev 构建下扫一遍样式表与 DOM，旧用法经诊断通道收到一条带迁移方向的 `warn`。本库不设废弃期，那条承诺已经撤销，这套东西也随之没有位置——它从落地到现在，登记表一条都没登过。名字被移走之后唯一的告知渠道是更新日志：每次移除都在 changeset 里把旧名与替换写法逐条列全，可以直接照着在自己的代码库里全文搜索。

  **破坏性：`@xihan-ui/kernel/deprecations` 这个子入口已删，从它导入的一切都不再存在。**

  | 已删                     | 种类 |
  | ------------------------ | ---- |
  | `registerDeprecation`    | 函数 |
  | `deprecationEntries`     | 函数 |
  | `findDeprecatedPart`     | 函数 |
  | `startDeprecationScan`   | 函数 |
  | `resetDeprecations`      | 函数 |
  | `DeprecatedEntry`        | 类型 |
  | `DeprecationMedium`      | 类型 |
  | `DeprecationScanOptions` | 类型 |

  `DIAGNOSTIC_CODES` 上的五个码一并删除：`deprecatedCssVar`（`deprecated.css-var`）、`deprecatedLayer`（`deprecated.layer`）、`deprecatedSelector`（`deprecated.selector`）、`deprecatedAttribute`（`deprecated.attribute`）、`deprecatedPart`（`deprecated.part`）。按码过滤诊断的地方要把这五个去掉。

  Web Components 侧两处随之变了：`defineXhElements()` 在 dev 里不再启动扫描（锁步版本检查照旧）；部件契约校验遇到解剖外的角色名只报 `wc.unknown-part` 一条，不再额外报 `deprecated.part`。

- 19570ad: **移除** 25 条从未打算公开的子路径导出。

  这五个包用 `unbundle` 构建，产物按源文件逐个切块；exports 是构建后按 `dist/` 里的产物回写的，于是内部块被一并写成了公开子入口——它们不在任何一个包的 tsdown 入口表里，漏出与否只取决于源文件在不在 `src/` 根目录。被删的是：

  - `@xihan-ui/kernel`：`./anatomy` `./attrs` `./compose` `./constants` `./guards` `./id-generator` `./locale` `./merge-props` `./normalize-props` `./runtime-config` `./scope` `./types`
  - `@xihan-ui/machine`：`./create-machine` `./delay` `./errors` `./form-reset` `./guards` `./service` `./setup` `./state` `./transitions`
  - `@xihan-ui/behavior`：`./dispatch`
  - `@xihan-ui/position`：`./compute`
  - `@xihan-ui/code-highlight`：`./languages` `./tokenize`

  留下的是各包 tsdown 显式声明的入口：kernel 的 `.` `./metadata` `./skin-check` `./vite`、machine 的 `.` `./vanilla`、behavior 的 `.` `./presence`，position 与 code-highlight 只剩 `.`。

  **迁移**：这些子路径暴露的名字主入口全都有，把 `import { x } from '@xihan-ui/kernel/anatomy'` 改成 `import { x } from '@xihan-ui/core'` 即可，按需引入靠 tree-shaking。

  **新增** `@xihan-ui/machine` 主入口再导出类型 `Setup`。它是公开函数 `setup()` 的返回类型，此前只能从 `@xihan-ui/machine/setup` 拿到；随该子路径一起消失的话，`setup()` 的结果就写不出类型标注了。

  生成 exports 的脚本同时改了判据：只有 tsdown 入口表里声明的名字才写进 exports，不再按 `dist/` 里「有 .js 也有 .d.ts」推导——内部块开着类型生成时同样两样都有，旧判据挡不住。

- 8b4d452: 新增公开 `FocusableElement = Element & HTMLOrSVGElement`，并统一 Scope、FocusScope、tabbable 工具与 `focusItem` 的焦点目标类型。`getTabbables` 的返回类型从不准确的 `HTMLElement[]` 修正为 `FocusableElement[]`，可聚焦 SVG/MathML 成为正式合同。

  MessageFeed 的流外焦点候选同步采用 `FocusableElement`，不会再把原生查询可能返回的 SVG 强制断言成 HTMLElement。

- 7640d5c: `hideOutside(getTargets, config, options)` 现在要求 `config` 同时提供 Scope 与 `LayerRegistry`，并只订阅显式传入的注册表。调用方必须从 `config.layerRegistry` 查询 `elementsAbove`；自定义注册表的登记、释放与失败登记补偿现在都会立即重算背景失活状态，不再错误监听 Scope Document 的默认注册表。

  LayerRegistry 新增只读 `ownerDocument`，注册表公共记录在创建后被冻结。`createRuntimeConfig` 与 `hideOutside` 都会拒绝注册表归属和 Scope Document 不一致的配置。Command、Dialog、Drawer 与 ImageViewer 已直接传入各自 RuntimeConfig；双注册表回归测试锁定只响应显式实例的行为，默认注册表、自定义注册表和跨 Document Scope 共用同一份明确合同。

- 8e8d953: `hideOutside` 现在严格使用 Scope 所属 Window 的 MutationObserver，并能在 iframe、画中画窗口与 adopted 节点场景下重算后挂的 inert 豁免节点。

  跨 Document 的 target、离线 Document、缺少 MutationObserver 的宿主与观察器初始化失败现在都会明确抛错；初始化失败不会留下 inert 状态或层栈订阅。

- 21b006a: `trackHoverIntent` 的触发器从误导性的动态 `getTriggerEl` 改为必填 `trigger` 创建快照。跟踪器固定使用该元素所属的 Document 与 Window，严格校验动态 content、计时参数与活动 realm，并在 content 换代、重复安全三角和重复清理时完整释放旧资源。

  Menu 与 SideNav 在各自 effect 的 DOM flush 中解析 trigger；无渲染器或该次提交没有节点时，该 effect 明确保持未绑定。SideNav 后续悬停会话会重新建立状态 effect，Menu 调用方则必须在启动服务前接好锚点引用。

  Vue 与 React 的 `useHoverIntent` 继续接受 nullable trigger getter，并新增各自公开的 `UseHoverIntentOptions`。包装会在 DOM 提交后绑定，随 trigger 与计时参数重建；Vue 的 content getter 和意图回调读取当前响应式选项，React 读取最近一次已提交选项。

- bd67168: LayerRegistry 现在用冻结快照表达每一次层栈状态，`list()`、订阅通知与 Layer 记录都不能从外部篡改。Layer id 始终由注册表生成，运行时伪造的 `input.id` 不再覆盖它；失败登记已经分配的 id 也不会复用。

  `register()` 改为同步补偿事务。它会固定本轮订阅者并通知完所有人；任一通知失败后恢复登记前的同一快照，再向见过临时状态的同一批订阅者发布补偿。变更阶段与补偿阶段的异常分别按订阅顺序聚合，两阶段都失败时再以变更异常为 cause 聚合上抛。订阅期间新增或移除的回调从下一轮正常变更起生效，不会打断这一轮补偿。

  `dispose()` 采用资源释放所需的提交点：非栈顶诊断先在旧状态上报告，随后永久移除 Layer、终结 cleanup，再通知全部订阅者。诊断输出与通知即使同时失败也不会阻止移除，两个阶段的异常会按发生顺序聚合上抛；已经释放且上层不再持有 cleanup 的 Layer 不会复活成幽灵层，重复 cleanup 保持幂等。

  LayerRegistry 通知期间同步嵌套的 `register()` 与仍存活 Layer 的 `dispose()` 现在会明确失败，避免订阅者在一轮快照广播中插入另一轮状态变更。已经成功终结的 cleanup 仍是幂等无操作。

- 48d6b88: LayerRegistry 现在按每个 Document 的真实逻辑栈派生视觉序号与 lane，并通过统一
  `--xh-_layer` 槽驱动已登记浮层的 z-index。嵌套 popover 高于所属 modal，后来登记的层
  不再被组件静态层级压住；动态 modal 会显式同步 Registry 与视觉绑定。

  删除 `Layer.setModal`。模态性继续由只读 `isModal()` getter 提供，变化后调用
  `LayerRegistry.sync(layer)`；`visualOf(layer)` 返回当前 `visualIndex`、`visualLane` 与可写入
  CSS 的 `visualLayer`。公开组件层级变量仍优先于 Registry 私有槽。

- db52f9b: **`matrix-code` 新增 `data-matrix` 码制与 `gs1` 模式；根上的 `data-modules` 与 api 的 `count` 改为列、行两个数。**

  `format="data-matrix"` 画 Data Matrix ECC 200（ISO/IEC 16022，含 2024 版并入的矩形扩展 DMRE 共 48 档尺寸）：编码器自写，ASCII 模式（数字两两压缩、Latin-1 以外的字符按 UTF-8 并声明 ECI 26），多块交错的 52×52 以上与 144×144 的 8+2 分块都按规范处理；`rectangular` 从矩形尺寸里挑，窄条标签放得下。Data Matrix 没有码眼，只铺模块那一条 `<path>`，L 形定位图形随 `moduleShape` 一起换——点刻打标出来的 Data Matrix 就是一排点。缺省静区按码制的规范值（qr 4、data-matrix 1）。里德-所罗门抽成共享的 `createReedSolomon(primitive, firstRoot)`，QR 与 Data Matrix 各自建域。

  `gs1` 三端同名（自定义元素 attribute `gs1`）：QR 在字节模式段前放 FNC1 首位指示符、Data Matrix 最前面放 FNC1 码字，即 GS1 QR / GS1 DataMatrix；变长 AI 之间用内容里的 GS（U+001D）分隔。`qrEncode` 与 `qrCapacityBytes` 各多一个可选参数。

  破坏性：一张码不再恒是正方形，`MatrixCodeApi.count` 拆成 `columns` 与 `rows`，根上的 `data-modules` 改为 `data-columns` 与 `data-rows`；`pixelSize` 现在是宽度，高按含静区的模块比例算出（正方形码不变）。`data-level` 与 `data-version` 只在 qr 下写。对当前码制没有意义的选项（`level` / `eyeShape` / `logo` 给了 data-matrix、`rectangular` 给了 qr）往诊断通道报一条新的 `matrix-code.option-ignored` 警告，按没给处理，码照画。

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

- 80e6fdf: **`qr-code` 改名 `matrix-code`，新增 `format` 选码制：二维码不再只有 QR 一种身份。**

  QR Code 之外还有 Data Matrix、PDF417、Aztec 这些同样常用的二维码制，它们与 QR 共用一张码面、一套命名、一块 logo 位与同一份皮肤，只是编码器不同。把组件名钉在 `qr-code` 上就没有地方放它们，于是整个公开面改名：Headless 的 `connectQrCode` / `qrCodeAnatomy` / `qrCodeKeyboard` / `qrCodeMeta` 与 `QrCode*` 类型改为 `connectMatrixCode` / `matrixCodeAnatomy` / `matrixCodeKeyboard` / `matrixCodeMeta` 与 `MatrixCode*`（`QrModuleShape` / `QrEyeShape` 改为 `MatrixCodeModuleShape` / `MatrixCodeEyeShape`）；Vue 与 React 的 `XhQrCode` / `XhQrCodeLogo` 改为 `XhMatrixCode` / `XhMatrixCodeLogo`，上下文与 provide / use 同步；自定义元素 `<xh-qr-code>` 改为 `<xh-matrix-code>`；皮肤子路径 `qr-code.css` 改为 `matrix-code.css`，覆盖槽 `--xh-qr-code-*` 改为 `--xh-matrix-code-*`；`data-scope` 改为 `matrix-code`；诊断码 `qr-code.logo-damage` 改为 `matrix-code.logo-damage`（`DIAGNOSTIC_CODES.qrCodeLogoDamage` → `matrixCodeLogoDamage`）。QR 编码器本身的导出（`qrEncode` / `qrCapacityBytes` / `qrAlignmentPositions` / `QR_MAX_VERSION` / `QrLevel` / `QrMatrix`）不改名，它们描述的就是 QR。

  新增 `format` prop（三端同名，自定义元素 attribute `format`），缺省 `qr`，根上落 `data-format`。给了不认识的值不静默退回 QR：一个模块都不铺，根落到 `error` 态并在 `error` 里说明只认哪些码制——按错码制画出来的码扫得出内容但对不上，作者却看不出哪里错了。当前只有 `qr` 一种取值，其余码制随后各自补上。

- 5397ae3: 移除零调用的公开 `dispatchCancelable`。它直接使用 ambient `CustomEvent` 构造器，无法保证事件与目标元素属于同一 Window；在 iframe、画中画窗口和多 realm 页面中会产生错误的事件身份。

  这项能力没有通用替代函数。调用方应从事件目标所属 Document 取得 Window，使用该 Window 的 `CustomEvent` 构造器创建可取消事件，派发后读取 `event.defaultPrevented`：

  ```ts
  const win = target.ownerDocument.defaultView;
  if (!win) throw new Error("事件目标没有活动 Window");
  const event = new win.CustomEvent(type, {
    bubbles: false,
    cancelable: true,
    detail,
  });
  target.dispatchEvent(event);
  const accepted = !event.defaultPrevented;
  ```

- 842da07: Scope 不再把无锚点 SSR 或离线 Document 混入主页面 realm。空锚点在读取时没有有效全局 Document 会抛出稳定错误；所属 Document 没有活动 Window 时 `getWin()` 直接失败，不再回退全局 Window。
- a15f0f3: ScrollLock 改为只接受 `RuntimeConfig.scrollRoot()` 的显式结论：返回 `null`、`body`、`documentElement` 或 `scrollingElement` 都表示页面，返回其他已连接 HTMLElement 表示该容器。删除自动扫描页面后代与目标兜底；同一 Document 的并行锁必须解析到同一规范化目标，不同目标会明确失败。

  `RuntimeConfig.scrollRoot` 从可选字段改为必填函数。`createRuntimeConfig()` 会默认注入 `() => null`，手写 RuntimeConfig 的调用方必须迁移：页面滚动写 `scrollRoot: () => null`，自定义滚动容器返回所属 Scope Document 中已连接的原生 HTMLElement。

  每轮锁现在精确保存双轴滚动位置、所有受影响内联样式的值与优先级，以及既有 gutter 变量。锁声明使用 `important`，释放时仍精确还原作者原值与原优先级；业务在锁期间改过的样式只要不再等于本轮写入值就会保留。滚动条补偿直接读取页面或容器盒几何，`scrollbar-gutter: stable` 已预留空间时不重复补偿。

  初始化失败会逆序回滚；最终释放先终结引用计数与 epoch，再完整尝试清理并聚合异常。目标解析、获取和释放由同一个 Document 事务守卫串行化，动态 getter 不能重入改写当前 epoch。页面滚动以 instant 行为恢复，也不再安装无效果的 viewport 与 orientation 监听。

- 30a811b: `startSkinCheck({ root })` 现在从 root 所属 Window 取得 Element 品牌、计算样式与 MutationObserver，并支持顶层 DOM globals 缺失时检查显式外部 root。

  显式 root 没有活动 Window 或 MutationObserver 时改为明确抛错，删除原先只扫描一次后静默停止持续检查的降级行为。

- 9c32ad7: 状态机现在会在开发和生产模式下统一静态校验具名 action、guard 与 effect 引用，并递归检查组合 guard。组合子持有冻结的表达式快照，循环、访问器或畸形元数据会直接以 `INLINE_IMPL` 拒绝。实现必须是 implementations 分组自身的数据属性函数；继承成员、访问器和非函数值一律视为缺失，检查过程不会调用 getter。动态列表解析后也会一次取得并验证全部实现快照，再执行任何 action 或初始化 effect。

  运行时缺少实现会先以原有 `MISSING_ACTION`、`MISSING_GUARD` 或 `MISSING_EFFECT` 进入诊断通道；没有其他停机异常时，随后抛出记录中 `detail.reason` 的同一个 `MachineError`，并始终停止服务。guard 不再静默退回 `false`，action 不再跳过缺项后继续执行，effect 也不会因列表后部缺项而先创建前部资源；缺项与回滚异常同时发生时会保留完整的 `AggregateError`。`inspect` 观察器的异常不会遮蔽缺项错误或阻止停机。

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

- bdf4028: **新增 `bar-code`（条形码）：一维码七种常用码制，三端同时可用。**

  `matrix-code` 管二维码，`bar-code` 管一维码：货号、运单号、序列号、零售商品码、外箱码这些要让扫描枪一枪读出的内容。`format` 选码制——`code128`（缺省，任意 ASCII；`gs1` 打开即 GS1-128，起始符后放 FNC1，内容里的 GS 编成变长 AI 之间的分隔）、`ean13` / `ean8` / `upca` / `upce`（定长数字，校验位不给就补上、给了就核对）、`itf14`（缺省带上下承载条）、`code39`（`checksum` 附 mod 43 校验字符）。编码器自写（ISO/IEC 15417 / 15420 / 16390 / 16388），Code 128 按 GS1 通用规范的规则自动切换 A / B / C 子集与 shift；每种码制都配了独立重写的解码器做回环。

  几何走一个 `<svg>`：全部条合成一条 `<path>`，人读文字（`text`，缺省印）每段一个 `<text>`，EAN / UPC 的数字逐位落在自己那格下面、守卫条按规范延长 5X。`barWidth` 是最窄条的像素宽，整张码等比放大；`height` 是条高；`margin` 是静区，缺省按码制的规范值。内容不合码制规则（字符不在字符集、位数不对、校验位对不上）或码制不认识时一根条都不铺，根落到 `error` 态并在 `error` 里说明——画一张扫出错内容的码比不画更坏。对当前码制没有意义的选项（`gs1` 给了非 code128、`checksum` 给了非 code39、`bearerBars` 给了非 itf14）往诊断通道报一条 `bar-code.option-ignored` 警告，按没给处理。

  皮肤 `bar-code.css`：条色与底色取固定档（`--xh-bar-code-fg` / `--xh-bar-code-bg`），深色主题下不反相；人读文字走等宽字体（`--xh-bar-code-font-family`）。自定义元素 `<xh-bar-code>` 作者只写一个空的 `<svg data-xh-part="root">`。

- c7966d3: 新增框架无关的 `groupAdjacentRuns` 集合投影；ContextMenu 与 Menubar 的数据驱动默认渲染改用同一 Core 真源，不再由 Vue、React 各自复制相邻分组算法。
- 9658294: `createScope` 新增动态 Element getter 输入，供框架在 setup 阶段创建稳定 Scope、待真实组件根节点就位后再解析 DOM realm。
  Scope 的 `id` 与部件 ID 在节点变化时保持不变；root、Document、Window、ID 查询、活动焦点与计算样式每次从当前真实节点解析，不缓存旧 realm。

  静态 `null` 继续使用既有的 ambient Document 语义。动态 getter 返回 `null`/`undefined` 时明确抛出
  `[xh] Scope 的动态锚点尚未就绪`，不会静默回退到主 Document；返回非 Element 值同样明确拒绝。

- 249819e: 新增统一的 `normalizeItemIndex` 部件下标归一函数；Slider 与 Splitter 的 Vue、React、Web Components 接线不再分别复制有限数与回退判定。
- 7e512dc: Dialog 在 `modal=false` 时不再创建或激活全屏遮罩，定位层不再拦截面板之外的页面指针；展开期间切换 `modal` 会同步更新焦点陷阱、滚动锁、背景失活和遮罩。

  FocusScope 的 `loop` 选项新增 getter 形式，使共享核心能够在不重建焦点域的情况下切换 Tab 边界回绕策略。

- ce5d75a: 新增 `createEscapeFallback(options)` 与 `EscapeFallbackOptions`，让不登记为 Layer 的覆盖界面使用显式 RuntimeConfig 参与 Document Hub 的 Escape 层级仲裁。每份 LayerRegistry lane 在 capture 阶段冻结 Layer 与 fallback token 快照；当时存在任意 Layer 即消费该 lane 的本次按键，空栈时才在 bubble 阶段复核并调用最近注册且启用的一个 fallback。目标节点取消或阻断原生事件、fallback 注册/启用换代、token ABA 与 Layer 空栈 ABA 都不会提交过期计划。

  Layout 覆盖式侧栏改用该 fallback。相同 LayerRegistry 下同时展开多个侧栏时按最近展开顺序一键收一个；受控侧栏未写回时持续占位，inline 档动态跳过，上层 Layer 即使同步退栈也不会让同一次 Escape 继续关闭侧栏。

- 147daa4: **焦点域挂载聚焦：宿主提交 DOM 后先补试一次，不再只等下一帧。**

  `createFocusScope` 新增可选的 `flush`（取机器的 flush）。各家「渲染」与「机器效应」的先后不同：Vue / React 先渲染出带 tabindex 的部件再跑效应，建域那一刻同步聚焦即落定；Web Components 行为宿主先把机器 mount 起来才有属性可写，建域时容器还没接线、`initialFocus` 也还是 null，此前只能等 rAF 重试，`defaultOpen` 的浮层在挂载那一拍焦点仍在 body。现在宿主提交之后立刻补试一次，挂载帧里的焦点落点与先渲染后跑效应的框架一致；逐帧 rAF 重试仍作兜底。浮层壳（overlay-shell）与 popover / dialog / drawer / command / image-viewer / tour 的焦点域都交了 flush。

- ab984e8: ToggleGroup 默认外观改为浅色胶囊分段控件，选中项使用品牌淡底；`solid` 继续提供强品牌选中态。组内按压不再缩放，分隔线改为覆盖接缝的半高细线。

  ButtonGroup 与 ToggleGroup 的 `outline` 改由组根绘制一条连续外框，子项不再各自绘制贯穿全高的边框；组内仍使用半高分隔线。

  移除 `--xh-toggle-group-separator-inset` 与 `--xh-toggle-group-separator-gap`，新增 separator size、opacity 与 disabled opacity 覆盖槽。

  ButtonGroup 与 ToggleGroup 默认自动生成相邻项分隔线，并新增 `separators` 属性控制显示。移除 `XhButtonGroupSeparator`、`XhToggleGroupSeparator` 及对应 Headless separator 部件与 connect API；分隔线改为适配器内部结构，不再要求作者手工维护。

  Button、ButtonGroup、Toggle 与 ToggleGroup 皮肤增加浅色/深色交互状态、连续外框和自动分隔线规则；同步更新 CSS 体积基线。

  视觉环境控制器迁入 Core，适配器不再硬依赖 Tokens；`@xihan-ui/tokens/runtime` 保持原导出入口。

- ed347e1: 状态机现在会事务化初始化同一状态节点的 effect 批次。后一项 effect 初始化失败时，已取得的 cleanup 会按资源取得逆序完整回滚，不再遗留未登记到服务清理表的资源。成功挂载后的正常清理也统一改为资源取得逆序。

  路径清理会先摘除登记，返回 `void` 的 effect 也会占用状态路径，同一路径的重复挂载则直接报告 `DUPLICATE_EFFECT_PATH` 不变式错误。停机会立即进入 `Stopped`、清空事件与 tracker 队列，再清完全部 effect 并执行 machine exit。因此清理抛错不会重复执行，cleanup 或 exit 内的 `send` 也不会重新推进机器，终态服务也不会因宿主重复 mount 而复活。

  初始化、清理与 exit 的多项异常会在继续清理后完整聚合报告，最外层 `MachineError` 通过 `cause` 保留原始异常链。抛出路径与诊断通道共享同一份聚合结果。

  effect 执行前会先占用状态路径，防止机器内部的同路径批次相互覆盖。服务本身只接受一次宿主 mount；`Started` 期间无论当前有无 effect，同步重入 mount 都会以 `DUPLICATE_SERVICE_MOUNT` 服务级不变式崩溃并清理。setup 内同步停机时，该调用迟到返回的 cleanup 会当场释放，后续 entry 与根 effect 不再执行。`null`、`undefined` 与非 `Error` 抛出值都会保留原始 `cause`，不可格式化的值使用稳定诊断文案。

  首次 mount 期间的 `send` 会先按 FIFO 排队，等 state effect、machine entry、根 effect 与 state entry 完整提交、tracker 同步完成后再消费；初始化失败则连队列一起清空。内部初始化来源和根 effect 改用不可与用户状态路径冲突的标识，`__init__` 因此可作为正常初态并同时挂载根 effect。

  公开的 `MachineErrorCode` 新增 `DUPLICATE_SERVICE_MOUNT` 与 `DUPLICATE_EFFECT_PATH`，`MachineError` 构造器新增可选 `ErrorOptions`，用于暴露标准 `cause` 链。

- 1042c06: 修正多级 Menu、ContextMenu 与 Menubar 在 Portal 之间悬停时祖先提前关闭的问题。

  `trackHoverIntent` 新增可选的 `getHoverBranches` 端口：调用方可显式登记同一 Document 中、
  逻辑上属于当前悬停树的 Portal 后代。主内容、后代分支与触发器之间均使用实时区域快照和
  安全多边形仲裁；没有登记的 Dialog、Popover 等无关浮层不会被推断成菜单后代。

  Menu 机器新增适配器 ref `getHoverBranches`。React 与 Vue 的 Menu、ContextMenu、Menubar
  组合部件按真实父子关系递归登记仅处于展开态的子菜单 positioner；进入三级、在三级内移动、
  返回二级均不会触发祖先的旧关闭计时。末级选择改为从叶到根同步收链，避免共享 LayerRegistry
  出现非栈顶释放；键盘逐层进入、返回与 Escape 栈顶语义保持不变。

- 1f472ba: **新增**有遮罩的浮层的遮罩形态轴：`dialog` / `drawer` / `image-viewer` 三家收下 `variant`，落成 `backdrop` 上的 `data-variant`。

  三档封闭：`opaque` 是缺省档（不写这个 prop 时逐像素与从前相同）、`blur` 在同一层底色之上再糊背后的页面、`transparent` 去掉底色只留下吃指针的那一层（交互外关闭与滚动锁定照旧）。走 `variant` 而不另开属性名：形态、语气、尺寸三轴之外不再多一个概念。

  `tour` 不在此列：它的暗幕真身是 spotlight 那圈大扩散阴影，`backdrop` 只是下面一层垫子——`transparent` 档改了垫子暗幕照样在，`blur` 档会把洞里的高亮目标一起糊掉。

  **新增**全局令牌 `--xh-overlay-backdrop-blur`（12px）与三条组件覆盖槽 `--xh-dialog-backdrop-blur` / `--xh-drawer-backdrop-blur` / `--xh-image-viewer-backdrop-blur`。

- 963fe2c: 新增 `createPortalLease`、`PortalLease` 与 `PortalLeaseOptions`，把物理 Portal 的多 root 搬迁、
  同 Document 目标校验、独占无盒壳、既有视觉桥、初始化回滚、占位精确归位、幂等释放和多异常
  聚合收敛到 Core。适配器可通过 `onShellReady` 在 root 搬迁前挂接组件特有逻辑所有权，并在
  roots 全部归位后清理；不新增 Web Components 的 `portalContainer` 公开 API，也不改变视觉环境轴。
- 07e29f9: **Portal 租约公开占位节点，Light DOM 宿主能把自己生成的节点排在浮层的作者位置之前。**

  `PortalLease` 新增 `placeholders`，与 `roots` 一一对应：租约期间留在各根作者原位的占位节点，归位时被根替换。Web Components 的 `PortalLeaseController` 据此给出 `homeOf(root)`，`AnchoredPortalController` 给出 `home()`：未搬迁时是 positioner 自己，搬迁中是占位节点。宿主自己生成、要排在浮层前面的节点（表单出口）按它定位，浮层归位后文档序不变。

- b991bb5: **Portal 按实例桥接逻辑来源的局部视觉环境，局部主题不再在搬到共享落点后丢失。**

  Core 新增 `createPortalVisualBridge`、`PortalVisualBridge` 与 `PortalVisualBridgeOptions`。桥只复制仓库当前真实存在的六个 DOM 环境轴：`data-theme`、`data-brand`、`data-density`、`data-contrast`、`data-motion` 与 `dir`。每一轴独立读取来源 composed 祖先链中最近的显式声明；来源未声明时，实例壳不写该属性，继续继承业务显式 portalContainer 的环境。

  桥不会复制计算后的 CSS 自定义属性，也不会凭规格文字虚构 `data-transparency`。当前 transparency 只有系统媒体查询，没有 DOM 控制轴；`shape` 是组件自身形态轴，不属于主题环境。后续只有在 VisualEnvironmentController 真正建立对应 DOM 合同时才会扩充名单。

  Vue 与 React 的每个 Portal 增加独占的 `display: contents` 壳；共享 `xh-portal-root` 不写任何主题属性，因此同页多个局部 dark/light、compact/comfortable 或 contrast 档不会互相覆盖。祖先属性改值、删除、来源换父、ShadowRoot 与 slot 重新分配均会异步同步；观察器取自来源 Document 的 Window，跨 Document 来源与壳直接失败。

  已有触发器或控件 ref 的锚定浮层直接以该节点作为 source，不生成来源 marker，避免改变 ButtonGroup 的 `:first-child` / `:last-child`、`root > *` 与 Toolbar 的直接子项。没有现成来源节点的模态/浮动组合使用无布局的 `template[data-xh-portal-source]`。React 的 `XhPortalProps` 新增可选 `source`；Vue 的桥组件保持内部实现，不新增公开组件家族。Web Components 声明式浮层仍在 Light DOM 原位，继续通过真实祖先链自然继承，不为了这一缺陷引入节点搬运。

  **破坏面：** Vue 与 React 的 portalContainer 直接子节点现在是 `div[data-xh-portal-shell]`，实际浮层位于壳内；React SSR 的原位输出也带 source/shell。按 `#xh-portal-root > [data-scope]` 或假定浮层部件直接父节点就是业务容器的样式和测试，应改为通过公开部件属性匹配后代；`data-xh-portal-shell` 仍是库内部标记。壳不产生布局盒，不改变定位包含块与层叠上下文。

- 95ebc66: Portal 视觉桥现在投影 `data-transparency` 与来源解析出的 CSS 自定义属性，并在 `class`、`style` 或祖先变化后同步；释放时精确还原实例壳原有属性。普通计算样式不复制。
- 4babe65: **按压通道：Space / Enter 与触屏按住投影 `data-pressed`，与指针 `:active` 同一副按压面。** 此前按压反馈只挂在 `:active` 上：键盘 Enter 按住、触屏手指按下时按钮纹丝不动，只有鼠标看得见缩放与换底（真源 §9.1 / §9.2）。

  - `@xihan-ui/core` 新增 `createPressTracker({ isPressed, onChange })`：把 Space / Enter 的 keydown / keyup / blur 与触屏的 pointerdown / pointerup / pointercancel 翻成「该按下 / 该松开」，不自存状态、不持有 DOM；长按重复键、输入法组合键、鼠标与笔一律不算。
  - `@xihan-ui/headless` 新增 `pressHandlers(service)` 与 `PressEvent` / `PressService`；`button` 与 `toggle` 的机器接上 `PRESS.START` / `PRESS.END`（context `pressed`），root 投影 `data-pressed`，禁用或进入加载途中按住的由机器自行松开。**破坏性：** `connectButton` 的第一个参数由 props 改为 `Service<ButtonSchema>`——按钮此前没有状态机，现在由 `buttonMachine` 承载按压通道，与其余跑机器的组件同构；`ButtonProps` 仍导出，等于 `ButtonSchema['props']`。
  - `@xihan-ui/styles` 的家族配方 `family/action-control.css` 与 `family/collection-item.css` 把按压选择器改为 `:is(:active, [data-pressed])`，特指度不变；组件皮肤自己写的 `:active` 规则由各组件迁移时改写。
  - 三个适配器的 `Button` 改跑 `buttonMachine`（公开 props 不变），键盘与触屏按住时呈现与指针一致的 0.97 缩放与 pressed 底；`Toggle` 同步接入。
  - `@xihan-ui/testing` 新增 `heldPress` / `heldPressIgnored` 共享步骤，button 与 toggle 套件三端核对按住中间帧。

  其余可按部件（`check-press-feedback` 的 PRESSABLE 表）已随各组件提交逐个接入；`family-backlog.json` 里的 `*:data-pressed` 总豁免随之删除，门禁 ⑧ 对没投影 `data-pressed` 的 getter 直接判红，不再留豁免入口。

- d366e45: Core 新增可独立 tree-shake 的 `DIAGNOSTIC_WARN` 单项诊断码；Sound 复用该入口与内部声部/服务构造器，保持诊断通道和声音配方不变，同时避免为一个码保留整张诊断表。

### Patch Changes

- f070bb8: 焦点域卸载归还只认处于渲染树里的落点。子菜单按方向键收起后归还帧还没到，父层就被 Escape 收掉时，落点（子菜单触发条目）已藏在父层 hidden 的 content 里；浏览器对藏起来的元素 `focus()` 是空操作，jsdom 却会照聚不误并派出一枚假 focusin，消解层据此把父层当成「焦点落到层外」一并收掉。现在按渲染判据跳过这类落点并显式松手，与 portal 租约归位时的 refocus 同一口径。
- 589d192: DOM 类型守卫改为使用节点所属窗口的构造器，`createScope` 现在能正确识别 iframe 中的 Document、Window、Element、HTMLElement 与 ShadowRoot，不再静默回落到主文档。
- b23b40a: DismissableLayer 现在把触摸的层外关闭推迟到同一次有效触摸生成的 `click`：`pointerdown`
  只冻结路径与各 LayerRegistry lane 的关闭计划，匹配的 `pointerup` 只证明触摸完成，不会直接关闭；
  随后同目标、同 pointer 身份的 `click` 到达时才重新核对 Layer、参与者与节点票据并提交。

  滚动、`pointercancel`、长按 `contextmenu`、新 pointer、Window 失焦、Document 可见性变化或键盘进入新交互都会取消
  待提交计划；Layer snapshot、参与者或节点换代同样使旧票失效。等待期间的触摸 `focusin` 不会抢先
  触发 focus-outside。实现不使用固定超时，因滚动或长按没有生成 click 时不会误关。

  mouse 与 pen 仍在原 `pointerdown` 当场仲裁。触摸提交时，`onPointerDownOutside` 与
  `onInteractOutside` 的 `detail.originalEvent` 仍是最初建票的真实 `PointerEvent`；click 只作为
  内部提交证据，公开事件名、回调名与类型保持不变。

- d5576cb: 修复动态 Scope 的宿主锚点先于异步焦点归还卸载时抛错的问题。已释放焦点域按创建时所属 Document 与本域容器、分支的真实 ShadowRoot 清理遗留焦点，保留 iframe 和闭合 ShadowRoot 的归属，不再重新查询已卸载锚点。

  动态 Scope 在锚点缺失时的严格错误合同保持不变，没有吞掉异常或改用全局 document。

- 9bf22c1: FocusScope 的存活序列改为按 Document 隔离。iframe 或画中画窗口中较晚建立的焦点域不再阻止当前文档归还焦点；同一文档中更新焦点域的接管语义保持不变。
- ffe0797: FocusScope 现在会在当前域内焦点节点或其祖先被移除后恢复焦点。恢复按精确祖先路径触发，并在所属 Window 的下一动画帧重新检查活动层、trapped、分支、closed ShadowRoot、动态容器和业务焦点交接。暂停中的恢复会等焦点所有权回归，每个候选聚焦后重新仲裁，避免无关 DOM 变化、微任务交接或同步打开的新层导致误抢焦点。
- add5b79: **焦点域归还落不下去时显式松手，焦点不再留在已经关掉的层里。**

  `createFocusScope` 拆除时把焦点还给创建前的持有者；挂载即展开（`defaultOpen`）或程序化打开的层，创建前没人持有焦点，那个「持有者」是 body——body 不在各引擎一致的可聚焦集合里，`focus()` 是空操作，焦点于是停在已经 hidden / inert 的条目上：Chromium 要等渲染更新末尾的 focus fixup 才收走，jsdom 永远不收。现在归还之后核对一次是否真落定，没落定就走原持有者已离场那条路，显式 blur 松手。tour 的跳过 / 关闭、以及所有没有触发器的浮层收起都受益。

- 1540cc1: `focusSafely` 与 `focusFirst` 改按节点所属 Document/ShadowRoot 判断活动元素，并以严格 HTMLElement 身份识别可选中文本控件。Shadow DOM 候选不再被误判为聚焦失败，iframe 与跨文档 adopted 输入框也能执行请求的文本选择。
- 5982974: FormResetBridge 改用跨 realm 的原生 HTMLElement 品牌与 `form` 节点名识别 reset 目标。iframe 表单和从其他 Window adopt 的表单现在会正确重置组件，普通元素派发的同名事件仍被忽略。
- 3577e4c: 表单重置桥支持显式 form 归属；未指定时继续查找祖先表单，指定无效目标时不回退其他表单，三端按机器正式 form 属性接线。
- 0d35f1a: `hostLocale` 与 `resolveLocale` 现在把不可用的 Scope Window 或 navigator 明确视为“宿主未提供语言”，按既有解析链落到 `en-US`，不会在 SSR 阶段要求伪造 DOM，也不会借用其他页面的 ambient Window。

  Calendar、DateField、DatePicker 与 Heatmap 因此可以在未显式配置 locale 时完成服务端渲染。

- 3f9c145: **修复**随包发到 npm 的文本。

  `@xihan-ui/pointer` 补上 README。它是唯一一个没有 README 的发布包，npm 页面此前只有 package.json 的一句 description。

  三份 README 的示例引了不存在的名字，照抄即解析失败：`@xihan-ui/chat-stream` 的 `createChatStore` / `httpSseTransport` 改成真名 `createThreadStore` / `createHttpSseTransport`；`@xihan-ui/behavior` 的 `createDismissableLayer` 改成 `createDismissLayer`；`@xihan-ui/vue` 的 `XhDialog` 改成组合式的 `XhDialogRoot` / `XhDialogTrigger` / `XhDialogContent`。

  `@xihan-ui/web-components` 的 README 把两处过期说法改写成结论：逐帧 parity 的覆盖面是 101 个套件（不是只有 Button 一个），收不进来的 26 个逐条登记在 `EXCLUDED` 里并各带理由，dialog 属两端 presence 模型不同的永久性差异；受控 open 的跨适配器一致性由两端各自跑同一份 conformance 规格覆盖。

  十份 CHANGELOG 里 38 处指向仓外文档目录的引用整体删掉——那些路径不随包发布，点过去是 404。

  三道门禁把这几类问题焊住：`check-package-manifests`（每个发布包必须有 README，16 张包清单与实际发布包双向对账）、`check-doc-imports`（README 与文档正文里的导入名必须在公开面里）、`check-published-refs`（包内文本不许指向仓外文档目录）。

- fc0ecaf: Portal 视觉桥的自定义属性投影收窄：`--xh-` 命名空间只投影文档根上有声明的名字（令牌与写在 `:root` 上的组件槽覆盖），皮肤写在组件 / 家族元素上的公开槽、私有槽与 `--xh-tone-*` 不再顺着触发器泄进浮层；作者自定义属性照旧投影。语气改经 `data-tone` 属性带到实例壳，浮层内自定义节点读 `--xh-tone-*` 仍取来源那一族。
- eabcc37: `createPortalLease` 在搬迁与归位 roots 时保住落在 roots 里的焦点：节点摘下再插回会失焦，
  物理 Portal 只是换个父节点，不该改变文档的焦点。Web Components 的 `<xh-popconfirm default-open>`
  首轮渲染把 positioner 搬进 portal 壳后，焦点域已放到取消按钮上的焦点不再丢回 body；
  Popover 与 Popconfirm 以打开态挂载时，焦点域放进内容区的初始焦点同样得以保住。
- c544218: **Portal 租约搬迁前显式松开放不回去的焦点。** 物理搬迁把焦点元素摘下再插回，落在浮层里的焦点会先丢回 body；归位常发生在浮层已收起之后，藏起来的元素接不住 `focus()`，这份焦点本就放不回去。此前它随节点摘下时静默丢失：摘下时派不派 `blur` / `focusout` 各家不一（Chromium 派，按规范的 focus fixup 与 jsdom 不派），靠 `focusout` 上报「焦点离开浮层」的部件——菜单栏收起后清 roving 锚点、把 Tab 位退回根——在后两者里漏掉这一程，Web Components 的菜单栏按 Tab 收起后仍把 Tab 位留在上一个 trigger 上，与 Vue / React 分叉。

  现在租约建立与释放两条路都在搬迁前检查：落在 roots 里、且此刻已不可见（`hidden` / `display: none` / `visibility: hidden`）的焦点显式 `blur()`，`focusout` 在每个运行时都派出一次、`relatedTarget` 为 `null`，与 Chromium 摘下时派的那一枚同型；可见的焦点仍照旧搬迁后放回原元素，不多派事件。

- ff3593c: **Portal 视觉桥只投影祖先链上的局部覆盖，:root 上的令牌靠继承。** 此前 `createPortalVisualBridge` 每次同步都把来源计算样式里的全部自定义属性（文档站 700 多个令牌）逐个写进壳的 inline 样式，而壳挂在 portal 落点下本来就能从 `:root` 继承到它们。现在同一批次读完来源与壳父节点两份计算样式，只把「来源计算值 ≠ 壳父节点计算值」的名字写进壳——来源祖先链上 inline 或样式表的局部声明、组件皮肤在来源上落的槽；先前投影过、现在已与父节点一致的会撤掉。常规页面每份壳从 700 多条 inline 声明降到几十条。

  观察随之收窄：祖先链的属性观察只看七个视觉轴、`style`、`class` 与 `slot`，来源自身的 `data-state` / `aria-*` 翻转不再触发重同步；`style` 变化只在前后任一侧含自定义属性时才算数，body 滚动锁定写的 `overflow` / `padding` 不算；childList 只在摘掉或挂入链上节点时才算换父，浮层打开时插进 body 的焦点护栏不再让页面上每一份桥整套重算。祖先上其他属性（如 `id`、`data-state`）驱动的样式表自定义属性变化不再被自动跟随，需要时显式调用 `sync()`。

  jsdom 下不枚举继承自定义属性的兜底（祖先 inline 样式）改为最近声明优先，此前外层祖先的 inline 声明会盖过内层。

- f45e0f7: **新增第三个适配器 `@xihan-ui/react`，本批只交运行时接缝。**

  `ReactiveRuntime` 的五个口子这次是第三份实现。React 与 Vue 不同类：它没有细粒度依赖追踪，只能整体重渲加提交后拉，所以接缝照的是 Web Components 那份，不是 Vue 那份。`cell` 变化推一个版本号喂 `useSyncExternalStore`；`track` 是拉式的，宿主每次提交后逐项比对依赖；`flush` 排队之后由提交后的 layout effect 取走，接不上提交时退到微任务里先 `flushSync` 逼出一次同步提交再跑。

  **`flush` 是这一批唯一真正难的一格。** 它的契约是「跑在宿主提交完这次渲染、DOM 已经落定之后」，全仓 64 个调用点吃这条，其中浮层定位与模态背景失活两处写错了都不报错——浮层量到零尺寸就定位到左上角，背景收不到节点就永远 Tab 得出去。Vue 靠 `nextTick` 套 `nextTick`、WC 靠轮询 `updateComplete`，React 两者都没有。这次先写了一份 18 条的判据套件（`tests/support/runtime-contract.tsx`），再让三种策略各实现一遍拿它评分：提交后 effect 排空得 16/18，`requestAnimationFrame` 兜底得 13/18，`flushSync` 强制提交 18/18。判据本身也做过反向验证——拿一份故意写错的实现（推式 `track` 加微任务 `flush`）跑，红的正是预期那四条。

  判据覆盖的是几种具体的写错方式，不是泛泛的冒烟：只在 props 上变、永不经过 `cell.set` 的值 `track` 看不看得见（推式实现在这里全线失效，受控回写跟着一起哑）；`flush` 在 React 事件内、事件外、消费方自己的 effect 里、以及回调里再次转移这四种时机是否都排在提交之后；受控判定有没有被首帧闭包冻住；StrictMode 走完 mount → cleanup → mount 之后状态与上下文会不会分叉。

  停机后的 service 会静默丢弃一切事件，所以 StrictMode 那一轮走整台重建，与 WC 的 `MachineController` 同一做法；`useMachine` 返回的是身份稳定的门面而不是 service 本体，否则重建前的渲染闭包里抓到的旧 service 会让绑在 JSX 上的 `send` 全部落空。

  `reactNormalize` 一并交了：11 项属性改名（`tabindex` 137 处、`readonly` 13 处、`for` 11 处等）、事件名按全小写索引归一（headless 里 `onKeyDown` 与 `onKeydown` 一类的两种写法并存共 48 处）、`onFocusIn` / `onFocusOut` 归到 `onFocus` / `onBlur`、两处字符串 `style` 解析成对象。

  `@xihan-ui/core` 这一侧只改了对外自报的适配器名单。

  **尚未交付**：组件、命令式服务、表单桥、SSR、一致性套件接线。React 侧的公开面这一批还是空的。

  已知缺口，逐条记在案：外部组件在自己的 effect 或 ref 回调里调进 `send` 时，两面禁区旗盖不住，那一路会退化成不保证提交后；`flush` 回调自排回调的同轮上限是 100；`flushSync` 只保证 DOM 与 layout effect 落定，被动 effect 可能仍在后面；并发渲染下被丢弃的那次渲染同样会写脏 props 取值器，直到下一次渲染盖掉。

- 82b5de5: `createRuntimeConfig({ scope })` 的默认 locale、LayerRegistry、PortalRoot 与 reduced-motion 改从显式 Scope 所属的 document/window 派生，不再错误使用主页面全局对象。显式配置仍具有最高优先级。

  无全局 DOM 时必须提供 root/document/window 一致的有效 Scope；只提供 layer registry 不再构造不可用的空 Scope。默认 PortalRoot 缺少 Document.body 时会抛出稳定错误。

  DOM 类型守卫在顶层构造器缺失时改用节点所属 Window 的 Web IDL getter，因此有效的外部 Scope 在真实 SSR 宿主中仍能通过严格品牌检查。

- 7f77bdd: **状态机初始化：初态 entry 先跑，根 effect 最后挂。**

  `createService` 首次 mount 的编排改为 state effect → machine entry → state entry → 根 effect（此前根 effect 排在 state entry 之前）。根 effect 是整个生命周期的资源——层、焦点域、观察器——建起那一刻读到的必须是进入完毕的初态。此前 `defaultOpen` / `open` 挂载时，浮层的焦点域在 open 态 entry 挑锚点（高亮项、焦点格）之前就同步落焦：Vue / React 先渲出带 tabindex 的部件再跑效应，焦点因此定死在 time-picker / time-range-picker 的整列容器、select 的列表本体上，方向键与 Enter 没有起点，也与 Web Components（升级晚一拍、锚点已就位）的落点不一致。现在挂载那一拍焦点就落在首格 / 选中项上，三端同构。转移（非初始化）的编排不变。

- 00bca80: FocusScope 的挂载和卸载自动聚焦事件现在由 DOM 监听器与选项回调共享，且每个生命周期只派发一次。任一通道调用 `preventDefault()` 都能阻止默认聚焦或焦点归还；DOM 监听器已取消时，选项回调仍会收到同一枚事件。

  卸载通知不再被 `restoreFocus=false` 或更新层短路，事件始终发给首次挂载的容器；从未取得容器时不会伪造 body 事件。挂载回调抛错会先回滚焦点域资源；事件使用 scope 所属窗口提供的构造器。

- Updated dependencies [317b582]
- Updated dependencies [dc64383]
  - @xihan-ui/motion@2.0.0

## 合并之前

本包由 `@xihan-ui/kernel`、`@xihan-ui/machine`、`@xihan-ui/behavior` 三个包合并而成。
`1.1.0` 及更早的条目留在那三个包各自的 npm 页面上。
