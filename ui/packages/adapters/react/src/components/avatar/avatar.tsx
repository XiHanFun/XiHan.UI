import type { Size, Tone } from '@xihan-ui/core'
import type { AvatarSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { mergeReactProps } from '../../runtime/merge-props'
import { AvatarProvider, useAvatarContext } from './context'
import { useAvatar } from './use-avatar'

type AvatarProps = AvatarSchema['props']

export interface XhAvatarRootProps extends ComponentPropsWithRef<'span'> {
  /** 缺席即无来源，落回退态。 */
  src?: string
  alt?: string
  size?: Size
  tone?: Tone
  /** 状态落位时通知，过渡态 idle 不通知。 */
  onStatusChange?: AvatarProps['onStatusChange']
}

export function XhAvatarRoot({
  src,
  alt,
  size,
  tone,
  onStatusChange,
  children,
  ...rest
}: XhAvatarRootProps): ReactNode {
  const ctx = useAvatar({ src, alt, size, tone, onStatusChange })
  return (
    <AvatarProvider value={ctx}>
      <span {...mergeReactProps(ctx.api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </span>
    </AvatarProvider>
  )
}

XhAvatarRoot.xhEvents = ['status-change'] as const

/** 图片节点常挂，靠 hidden 显隐；src / alt 由 connect 写上。 */
export interface XhAvatarImageProps extends Omit<ComponentPropsWithRef<'img'>, 'children' | 'src' | 'alt'> {}

export function XhAvatarImage(props: XhAvatarImageProps): ReactNode {
  const ctx = useAvatarContext()
  const imageRef = useRef<HTMLImageElement | null>(null)
  const { service, api } = ctx
  const status = api.status

  // 进入 loading 时为已就绪的图（如注水前就加载完的图）补报一次加载完成
  useEffect(() => {
    if (status !== 'loading' || service.getStatus() !== 'Started')
      return
    const img = imageRef.current
    if (img?.complete && img.naturalWidth > 0 && img.currentSrc === img.src)
      service.send({ type: 'IMAGE.LOAD' })
  }, [status, service])

  return (
    <img
      {...mergeReactProps(
        api.getImageProps() as Record<string, unknown>,
        props as Record<string, unknown>,
        { ref: imageRef },
      )}
    />
  )
}

export interface XhAvatarFallbackProps extends ComponentPropsWithRef<'span'> {}

/** 回退位：图片没就绪时顶在台前，节点常挂、靠 hidden 显隐。 */
export function XhAvatarFallback({ children, ...rest }: XhAvatarFallbackProps): ReactNode {
  const ctx = useAvatarContext()
  return (
    <span {...mergeReactProps(ctx.api.getFallbackProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}
