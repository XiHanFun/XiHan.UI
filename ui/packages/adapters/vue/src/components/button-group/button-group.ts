import type { ActionVariant, Size, Tone } from '@xihan-ui/core'
import type { ButtonGroupProps } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import { connectButtonGroup } from '@xihan-ui/headless'
import { Comment, computed, defineComponent, Fragment, h, Text } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideButtonGroupDisabled } from './context'

/** 从实际调用推出 api 形状，免得再写一遍 normalize 的类型参数。 */
type VueButtonGroupApi = ReturnType<typeof connectButtonGroup>

function flattenChildren(children: readonly VNode[]): VNode[] {
  const result: VNode[] = []
  for (const child of children) {
    if (child.type === Comment || child.type === Text)
      continue
    if (child.type === Fragment && Array.isArray(child.children)) {
      result.push(...flattenChildren(child.children.filter(value => typeof value === 'object') as VNode[]))
      continue
    }
    result.push(child)
  }
  return result
}

function renderChildren(children: readonly VNode[], api: VueButtonGroupApi): VNode[] {
  const nodes = flattenChildren(children)
  if (!api.separators)
    return nodes
  return nodes.flatMap((node, index) => index === 0
    ? [node]
    : [h('span', {
        'key': `separator-${index}`,
        'aria-hidden': true,
        'data-xh-button-group-separator': '',
        'data-orientation': api.orientation === 'horizontal' ? 'vertical' : 'horizontal',
        'data-disabled': api.disabled ? '' : undefined,
      }), node])
}

export const XhButtonGroup = defineComponent({
  name: 'XhButtonGroup',
  // 有 connect 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    orientation: { type: String as PropType<'horizontal' | 'vertical'> },
    variant: { type: String as PropType<ActionVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    disabled: { type: Boolean, default: undefined },
    fullWidth: { type: Boolean, default: undefined },
    separators: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const configured = withXhConfig('button-group', props) as ButtonGroupProps
    const api = computed<VueButtonGroupApi>(() => connectButtonGroup(configured, vueNormalize))
    // 组内每一段收到的是真禁用：只打 data-* 的话按钮照样点得动
    provideButtonGroupDisabled(computed(() => api.value.disabled))
    // 组内每一段是作者放进插槽的按钮，直接当直接子节点摆
    return () => h(
      'div',
      api.value.getRootProps() as Record<string, unknown>,
      renderChildren(slots.default?.() ?? [], api.value),
    )
  },
})
