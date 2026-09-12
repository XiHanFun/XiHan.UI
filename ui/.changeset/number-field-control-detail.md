---
"@xihan-ui/styles": minor
---

**细化数字输入的尺寸节奏、内嵌动作与粗指针命中区。**

`control` 继续作为输入、前后缀和两颗动作共用的唯一 Field Chrome。comfortable 下 `sm` / `md` / `lg` 控件高为 28 / 32 / 40px，动作盒为 24 / 24 / 32px；compact 下分别为 24 / 28 / 36px 与 20 / 20 / 28px。大尺寸动作不再沿用中尺寸的固定值，前后缀、数值和动作保持同一中线。

粗指针环境会直接把两颗真实按钮及控件高度扩到 comfortable 48px、compact 44px。命中区由 flex 子项本身承担，不靠伪元素覆盖输入区；窄容器中减号、输入与加号仍各占独立矩形。

加减钮与输入之间的短线默认改用 M1 的 `--xh-material-soft-separator`，保留既有 `--xh-number-field-trigger-divider` 覆盖槽。新增 `--xh-number-field-touch-target-size`，供产品按自身触摸规范同时覆盖粗指针下的按钮宽高和控件最小高度。

本次只调整 `@xihan-ui/styles`：数值解析、步进、范围、长按和表单行为没有变化。归一化后的 `number-field.css` 从 18252 B 增至 18856 B。

皮肤体积（去注释、压空白）：前一提交源码 18252 字节，当前 18856 字节；登记基线 18252 → 18856，只更新本组件，10% 容差保持不变。
