import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { SpinnerApi, SpinnerProps } from './spinner.types'
import { spinnerAnatomy } from './spinner.anatomy'

const parts = spinnerAnatomy.build()

/** 作者与语言包都没给文案时的兜底可及名字。 */
export const SPINNER_DEFAULT_LABEL = 'Loading'

/**
 * 按 label → translations.label → 兜底值挑出第一段有字的文案。
 * 空串与纯空白不算给过：属性写成 `label` 或 `label=""` 时取到的正是空串，
 * 认了它活区就成了没有名字的空壳，等于绕过"必须有可及名字"这条。
 */
function resolveLabel(props: SpinnerProps): string {
  for (const text of [props.label, props.translations?.label]) {
    if (text != null && text.trim() !== '')
      return text
  }
  return SPINNER_DEFAULT_LABEL
}

// Spinner 无状态机：一个活区加一段文案，属性全部来自 props。
export function connectSpinner<T extends PropTypes>(
  props: SpinnerProps,
  normalize: NormalizeProps<T>,
): SpinnerApi<T> {
  const label = resolveLabel(props)

  return {
    label,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'status',
      // status 隐含的活区礼貌级别就是 polite，显式写出来是为了让没有实现隐含映射的读屏也认得
      'aria-live': 'polite',
      // 转圈是纯图形，读屏在这个活区里读不到任何东西；名字只能由这里给，
      // 缺了它读屏只报出"有个 status 区域"，念不出在等什么
      'aria-label': label,
      // 缺省档不写属性：皮肤的基础规则就是缺省档
      'data-size': props.size,
      'data-tone': props.tone,
    }),

    getLabelProps: () => normalize.element({
      ...parts.label.attrs,
    }),
  }
}
