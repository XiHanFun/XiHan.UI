// @xihan-ui/stylelint-config —— 库 CSS 约定：
// ① 强制逻辑属性（禁 margin-left/padding-right 等物理属性，RTL 就绪）
// ② 颜色一律走令牌变量
// ③ 圆角 / 内衬 / 间隙的长度一律走令牌变量
// ④ 过渡只列要动的属性，不写 all
// ⑤ 自定义属性统一 --xh- 前缀
// 暂不引 stylelint-config-standard（避免对空仓库报噪），规则保持最小可执行集。

/**
 * 圆角 / 内衬 / 间隙三族属性。三族共用同一条判据：长度只能来自令牌。
 * 圆角连简写、逻辑角与物理角一起收；内衬收简写与逻辑长属性，另外把 padding-top / padding-bottom
 * 也收进来兜一道（本仓写的是逻辑属性，但物理的这两个没被整条禁掉，不收就是个口子）；
 * padding-left / padding-right 不在此列，它们整条属性已被下面的 property-disallowed-list 禁掉。
 */
const LENGTH_PROP = /^(?:border(?:-[a-z]+)*-radius|padding(?:-(?:block|inline)(?:-(?:start|end))?|-(?:top|bottom))?|(?:row-|column-)?gap)$/

/**
 * 裸长度：带绝对或相对单位的数字。
 * 前后两个否定环视把令牌名里的数字排除掉——`--xh-space-1_5` 的 `1` 前面是 `-`、`5` 前面是 `_`，都不算。
 * 行盒单位 lh / rlh 故意不在名单里：它量的是一行字有多高，用来把文字在控件里居中
 * （`calc((var(--xh-field-control-h) - 1lh) / 2)`），不是从间距档里挑出来的长度。
 */
const RAW_LENGTH = /(?<![\w-])\.?\d[\d.]*(?:r?(?:em|ex|ch|cap|ic)|px|[sdl]?v(?:[whib]|min|max)|cm|mm|q|in|pt|pc)(?![\w-])/i

/**
 * 过渡属性位上的 all。
 * 两侧的否定环视让它只命中独立的 `all`，不会误伤名字里带 all 的令牌（`var(--xh-x-all)`）。
 */
const TRANSITION_ALL = /(?<![\w-])all(?![\w-])/

/** 属性名的键要写成 stylelint 认的「斜杠包起来的正则」形态，与上面的判据同一个来源。 */
const asKey = re => `/${re.source}/`

/**
 * 默认报错只说「这个取值不许」，不说该换成什么。按属性分流成中文文案，让人看完就知道往哪改。
 * 入参是 stylelint 传给消息的那两个值：属性名与取值。
 */
function allowedListMessage(property, value) {
  if (LENGTH_PROP.test(property)) {
    return `${property} 的取值 "${value}" 不是令牌：圆角写 var(--xh-<组件>-<部件>-radius, var(--xh-shape-…))，`
      + '内衬与间隙写 var(--xh-<组件>-<部件>-<后缀>, var(--xh-space-…))；直角写 0，撑满写百分比'
  }
  return `${property} 的取值 "${value}" 不是颜色令牌：写 var(--xh-…)，或 transparent / currentColor / inherit / none`
}

/**
 * 同上，禁用清单一侧的文案。
 */
function disallowedListMessage(property, value) {
  if (property.startsWith('transition')) {
    return `${property} 的取值 "${value}" 里写了 all：逐个列出要动的属性`
      + '（transition: background var(--xh-motion-duration-micro) var(--xh-motion-ease-enter)）'
  }
  if (LENGTH_PROP.test(property)) {
    return `${property} 的取值 "${value}" 里有裸长度：换成 var(--xh-shape-…) / var(--xh-space-…)，`
      + '或本组件的覆盖槽；calc() 与 var() 的兜底位同样只能放令牌'
  }
  return `${property} 是物理方向属性：改用逻辑属性（margin-inline-start / padding-inline-end 等）`
}

/** @type {import('stylelint').Config} */
export default {
  rules: {
    'declaration-property-value-disallowed-list': [
      {
        // 禁物理内外边距，强制逻辑属性
        '/^margin-(left|right)$/': [/.*/],
        '/^padding-(left|right)$/': [/.*/],
        // 写 all 的过渡会把以后新加的属性一并接上：某天补一条 background-image 或 box-shadow，
        // 就凭空多出一段没人设计过的动画，而且浏览器要逐帧比对全部属性。要动什么就列什么。
        '/^transition(-property)?$/': [TRANSITION_ALL],
        // 白名单是整值比对，看得见取值的外形，看不进 var() 的兜底位与 calc() 内部。
        // 这条补的就是里面那一层：任何位置出现裸长度都判红。两条合起来才等于「长度只能来自令牌」。
        [asKey(LENGTH_PROP)]: [RAW_LENGTH],
      },
      { message: disallowedListMessage },
    ],
    'property-disallowed-list': ['margin-left', 'margin-right', 'padding-left', 'padding-right', 'left', 'right'],
    'color-no-invalid-hex': true,
    // 颜色只准取令牌或关键字。这条只挂在下面这六个长属性上，`background` / `border` 简写、
    // `box-shadow` 的颜色位与自定义属性赋值它都看不见，那几类由 check-color-literals.mjs 收。
    // 语法着色没有豁免位：三种真需要色相的走 --xh-syntax-* 令牌，皮肤里不存在裸十六进制。
    'declaration-property-value-allowed-list': [
      {
        '/^(color|background-color|border-color|outline-color|fill|stroke)$/': [
          /^var\(--xh-/,
          /^light-dark\(/,
          'transparent',
          'currentColor',
          'inherit',
          'none',
        ],
        // 圆角 / 内衬 / 间隙写死像素，换一次尺寸档就有一处对不上，而尺寸类门禁只看令牌引用、
        // 看不见字面量，会一路绿灯。这条正面挡住：取值只能是令牌引用、直角 0、auto、inherit、
        // 百分比，或由这些拼出来的 calc()。
        [asKey(LENGTH_PROP)]: [
          /^var\(\s*--xh-[\s\S]*\)$/,
          /^calc\([\s\S]*\)$/,
          /^(?:\d+(?:\.\d+)?|\.\d+)%$/,
          '0',
          'auto',
          'inherit',
        ],
      },
      { message: allowedListMessage },
    ],
    // 半档间距写作 space-0_5，故允许下划线
    'custom-property-pattern': '^xh-(_)?[a-z0-9_-]+$',
  },
}
