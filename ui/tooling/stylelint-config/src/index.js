// @xihan-ui/stylelint-config —— 库 CSS 约定：
// ① 强制逻辑属性（禁 margin-left/padding-right 等物理属性，RTL 就绪，见 §12/D21）
// ② @layer 命名约定（xihan.*）
// ③ 令牌白名单在 M1 令牌产物落地后经 check-tokens-dist 补充
// 首期不引 stylelint-config-standard（避免对空仓库报噪），规则最小可执行集。

/** @type {import('stylelint').Config} */
export default {
  rules: {
    // 禁物理内外边距，强制逻辑属性
    'declaration-property-value-disallowed-list': {
      '/^margin-(left|right)$/': [/.*/],
      '/^padding-(left|right)$/': [/.*/],
    },
    'property-disallowed-list': ['margin-left', 'margin-right', 'padding-left', 'padding-right', 'left', 'right'],
    // 颜色一律走令牌变量，禁裸十六进制（M1 令牌落地后收紧）
    'color-no-invalid-hex': true,
  },
}
