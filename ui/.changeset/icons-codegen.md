---
"@xihan-ui/icons": minor
---

`@xihan-ui/icons` 新增 SVG → `IconRecord` 的构建期转换器：`xihan-icons` 命令与 `@xihan-ui/icons/codegen` 子路径。首方集保持小而准，图标由使用者自带——把任意 SVG 目录交给转换器，产出可摇树的运行期模块（`--dts` 一并出类型）。属性层走宽松模式（`class` / `width` / `height` 等丢弃并记进 `notes`），标签层仍严格（`<use>` / `<text>` / `<style>` 报错，因为收下就是产出一枚画错的图标），非 24 网格的源按比例归一到 24。三套真实集实测：Lucide 2025/2025、Tabler outline 5130/5130、Bootstrap Icons 2077/2078。
