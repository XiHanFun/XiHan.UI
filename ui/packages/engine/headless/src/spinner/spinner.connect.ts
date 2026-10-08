/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 spinner 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { SpinnerApi, SpinnerProps, SpinnerSchema } from './spinner.types'
import { SPINNER_EN_US } from '../locale/en-US'
import { spinnerAnatomy } from './spinner.anatomy'

const parts = spinnerAnatomy.build()

/** 作者与语言包都没给文案时的兜底可及名字，取自 en-US 语言包。 */
export const SPINNER_DEFAULT_LABEL = SPINNER_EN_US.label

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

// 一个活区加一段文案；状态机只管露面前的那段等待，其余属性全部来自 props。
export function connectSpinner<T extends PropTypes>(
  service: Service<SpinnerSchema>,
  normalize: NormalizeProps<T>,
): SpinnerApi<T> {
  const { state, prop } = service
  const props: SpinnerProps = {
    label: prop('label'),
    size: prop('size'),
    variant: prop('variant'),
    tone: prop('tone'),
    orientation: prop('orientation'),
    translations: prop('translations'),
  }
  const label = resolveLabel(props)
  const variant = props.variant ?? 'arc'
  const visible = state.get() === 'visible'

  return {
    label,
    visible,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'status',
      // status 隐含的活区礼貌级别就是 polite，显式写出来是为了让没有实现隐含映射的读屏也认得
      'aria-live': 'polite',
      // 转圈是纯图形，读屏在这个活区里读不到任何东西；名字只能由这里给，
      // 缺了它读屏只报出"有个 status 区域"，念不出在等什么
      'aria-label': label,
      // 尺寸缺省档不写属性；形态显式写出，默认就是渐隐弧。
      'data-size': props.size,
      'data-variant': variant,
      'data-tone': props.tone,
      // 转圈与配文的排布显式写出，默认并排
      'data-orientation': props.orientation ?? 'horizontal',
      // 露面前的等待是派生的显隐：皮肤藏起整块但保留位置，布局在露面那一刻不跳
      'data-state': visible ? 'visible' : 'hidden',
    }),

    getLabelProps: () => normalize.element({
      ...parts.label.attrs,
    }),
  }
}
