import type { Size } from '@xihan-ui/core'
import type { HotkeysPlatform, HotkeysProps, HotkeysTarget, HotkeysTranslations } from '@xihan-ui/headless'
import type { ReactNode } from 'react'
import { Fragment, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { useHotkeys } from './use-hotkeys'

export interface XhHotkeysProps {
  keys?: string[]
  platform?: HotkeysPlatform
  target?: HotkeysTarget
  preventDefault?: boolean
  enabled?: boolean
  size?: Size
  translations?: Partial<HotkeysTranslations>
  onHotKey?: HotkeysProps['onHotKey']
}

/**
 * 把一组键铺成一排键帽，并按 target 指定的节点接住这次组合。
 *
 * 内容整份由 keys 与平台算出，组件不收 children——键帽上写什么、连接符出不出，
 * 两个平台的答案不一样，内容另有来源就对不上了。
 *
 * 注册与渲染是两件事：只要注册不要键帽就直接用 useHotkeys。
 */
export function XhHotkeys(props: XhHotkeysProps): ReactNode {
  const rootRef = useRef<HTMLElement | null>(null)
  const { api } = useHotkeys(withXhConfig('hotkeys', props), rootRef)

  const separatorProps = api.getSeparatorProps() as Record<string, unknown>
  return (
    <span
      {...api.getRootProps() as Record<string, unknown>}
      ref={(el: HTMLSpanElement | null) => { rootRef.current = el }}
    >
      {api.segments.map((segment, index) => (
        <Fragment key={`${segment.source}-${index}`}>
          {index > 0 ? <span {...separatorProps}>{api.separator}</span> : null}
          <kbd {...api.getKeyProps({ value: segment.source }) as Record<string, unknown>}>{segment.label}</kbd>
        </Fragment>
      ))}
    </span>
  )
}

XhHotkeys.xhEvents = ['hot-key'] as const
