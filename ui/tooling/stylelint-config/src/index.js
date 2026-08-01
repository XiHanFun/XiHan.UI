// @xihan-ui/stylelint-config —— 库 CSS 约定：
// ① 强制逻辑属性（禁 margin-left/padding-right 等物理属性，RTL 就绪）
// ② 颜色一律走令牌变量
// ③ 自定义属性统一 --xh- 前缀
// 暂不引 stylelint-config-standard（避免对空仓库报噪），规则保持最小可执行集。

/** @type {import('stylelint').Config} */
export default {
  rules: {
    // 禁物理内外边距，强制逻辑属性
    'declaration-property-value-disallowed-list': {
      '/^margin-(left|right)$/': [/.*/],
      '/^padding-(left|right)$/': [/.*/],
    },
    'property-disallowed-list': ['margin-left', 'margin-right', 'padding-left', 'padding-right', 'left', 'right'],
    'color-no-invalid-hex': true,
    // 颜色只准取令牌或关键字。语法着色的裸十六进制写在自定义属性定义里，不受这条约束
    // （令牌集里没有语法色这一类，见 styled/styles/code-block.css 的说明）。
    'declaration-property-value-allowed-list': {
      '/^(color|background-color|border-color|outline-color|fill|stroke)$/': [
        /^var\(--xh-/,
        /^light-dark\(/,
        'transparent',
        'currentColor',
        'inherit',
        'none',
      ],
    },
    // 半档间距写作 space-0_5，故允许下划线
    'custom-property-pattern': '^xh-(_)?[a-z0-9_-]+$',
  },
}
