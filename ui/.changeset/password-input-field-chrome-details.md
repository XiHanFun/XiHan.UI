---
"@xihan-ui/styles": minor
---

**PasswordInput 统一实体 Field Chrome 内的显隐动作、自动填充和状态细节。**

显隐按钮与输入/状态区之间新增半高语义分隔，位置按按钮在输入前后的真实 DOM 顺序选择逻辑侧，并落在 control gap 中线；高度随 sm/md/lg 与 compact 控件高度计算。新增 `--xh-password-input-visibility-trigger-separator-h`、`--xh-password-input-visibility-trigger-separator-color` 与 `--xh-password-input-caps-lock-fg-disabled` 覆写口。forced-colors 下可用分隔使用 CanvasText，禁用分隔使用 GrayText。

自动填充底色不再对所有形态强制使用 canvas：outline、subtle、readonly 与 disabled 分别跟随当前实体外框，禁用文字也保持 disabled 前景；ghost 因透明色无法覆盖浏览器注入底，明确使用 canvas 实体替代。公开的 `--xh-password-input-input-autofill-bg/fg` 仍可覆盖最终取值。

自动填充门禁同步理解这条状态派生链：公开 autofill 槽可以直接落到 `--xh-bg-*` / `--xh-fg-*`，也可以落到当前组件 root 上声明的私有槽。门禁枚举私有槽依赖涉及的属性状态，按选择器权重与源序取最终声明，再逐层检查共享语气槽和令牌；未声明引用、循环引用、透明或半透明终值都会失败。内置正反夹具覆盖“ghost 普通底透明但 autofill 单独实体化”的合法路径，以及未声明、成环、透明、半透明和条件媒体伪证明的拒绝路径。

私有派生只接受组件 root 上由有限属性选择器表达的状态；门禁通过共享 CSS 声明解析器保留完整祖先栈，只有 `@layer` 不改变命中条件。`@media`、`@supports`、`@container` 等条件祖先、后代节点、伪类或运行期作者变量都不能证明普通环境的默认色。需要这些条件时必须先把确定的实体默认值收回 root 状态槽，不能登记白名单或依赖浏览器兜底。

显隐动作的 hover 前景加入同节奏颜色过渡，ghost 的空投影改为 `none`，禁用 control 内 Caps Lock 状态与按钮使用同一禁用墨色。`readOnly` 仍允许用户揭示、聚焦和核对已有值，只有 `disabled` 禁止显隐；本次没有改写显隐、选区恢复或 Caps Lock 机器，也没有新增密码强度行为。

当前 anatomy 没有 prefix/suffix 部件，作者节点只消费 control 的统一 gap；`control` 在 meta 中仍可省略，但省略后没有共享 Field Chrome、组合焦点环或动作分隔。这两个结构合同作为后续独立 API 审计项记录，本次不靠选择器猜任意节点职责。

皮肤体积（去注释、压空白）：前一提交源码 15957 字节，当前 18692 字节；登记基线 15957 → 18692，只更新本组件，10% 容差保持不变。
