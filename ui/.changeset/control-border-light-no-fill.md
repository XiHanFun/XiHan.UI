---
'@xihan-ui/tokens': major
'@xihan-ui/styles': major
---

所有带边框的控件盒改成同一条边线、不填底。`--xh-border-control` 在缺省档改为与装饰边界 `--xh-border-default` 同色（浅色 neutral 200、深色 700），输入框壳、Checkbox / CheckboxGroup / Transfer / Tree / Table 的方框、RadioGroup / QuestionFlow 的圆圈、Switch 轨道、InputGroup 组壳、ColorPicker 控件、FileUpload 拖放区与 SignaturePad 画布从此与旁边的浮层面板、卡片描边同一重量；`--xh-border-control-hover` 改为 neutral 400 / 550，悬停仍看得出一道台阶。

字段家族 outline 档与上述控件盒的静息、聚焦、无效、加载态底色由 `--xh-bg-canvas` 改为 `transparent`，露出宿主的面；悬停在透明上罩 `color-mix(--xh-bg-subtle 45%, transparent)`，readOnly / disabled 仍填 `--xh-bg-subtle`。`--xh-bg-canvas` 保留给自动填充遮罩、色块选中环等必须不透明的地方。

破坏性变化：缺省档的控件边界不再满足 WCAG 1.4.11 的 3:1（浅色 1.26:1），该门槛只在 `data-contrast="more"` / `prefers-contrast: more` 下保持（neutral 600 / 400）；令牌测试相应改为「缺省档与装饰边同色、高对比档 3:1、悬停棘轮」。铺在非白底上的字段不再自带白底，需要白底的宿主请写对应组件的底色槽，如 `--xh-text-field-control-bg: var(--xh-bg-canvas)`、`--xh-checkbox-bg: var(--xh-bg-canvas)`。
