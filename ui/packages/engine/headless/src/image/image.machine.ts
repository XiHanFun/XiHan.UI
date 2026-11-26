/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 image 相关实现。

import type { ImageSchema } from './image.types'
import { setTimeoutEffect, setup } from '@xihan-ui/core'
import { beginImageSwap, endImageSwap } from '../shared/image-swap'
import { trackPartPresence } from '../shared/part-presence'

const { createMachine } = setup<ImageSchema>()

/** 回退延迟归一：负数与 NaN 按 0 处理，Infinity 保留（表示加载期间永不露面）。 */
export function resolveFallbackDelay(delay: number | undefined): number {
  const ms = delay ?? 0
  if (Number.isNaN(ms) || ms <= 0)
    return 0
  return ms
}

/** 占位层该不该露面：来源决议前与载入中铺满图位，图片落位或失败即撤下。 */
export function imagePlaceholderVisible(status: ImageSchema['state']): boolean {
  return status === 'idle' || status === 'loading'
}

/** 回退内容该不该露面：失败时恒露面；idle 与 loading 看延迟窗口是否已过。 */
export function imageFallbackVisible(status: ImageSchema['state'], fallbackVisible: boolean): boolean {
  return status === 'error' || (status !== 'loaded' && fallbackVisible)
}

/** 预览层里看的那张图：preview 写成对象且给了 src 时取它，否则取 src；预览没开、或两处都没有地址时为 undefined。 */
export function resolveImagePreviewSrc(props: Pick<ImageSchema['props'], 'src' | 'preview'>): string | undefined {
  const { preview } = props
  if (!preview)
    return undefined
  const src = (typeof preview === 'object' ? preview.src : undefined) || props.src
  return src || undefined
}

// 异步来源只有 <img> 的 load / error，由适配器回送。
export const imageMachine = createMachine({
  name: 'image',
  context: ({ prop, cell }) => ({
    shownSrc: cell<string | null>(() => ({ defaultValue: null })),
    // 初值按 fallbackDelay 定
    fallbackVisible: cell<boolean>(() => ({
      defaultValue: resolveFallbackDelay(prop('fallbackDelay')) <= 0,
    })),
    placeholderRendered: cell<boolean>(() => ({ defaultValue: true })),
    fallbackRendered: cell<boolean>(() => ({ defaultValue: false })),
    previewOpen: cell<boolean>(() => ({ defaultValue: false })),
  }),
  // 占位层与回退内容撤下时先淡出、与图片的淡入交叉，播完才藏起
  effects: ['trackPlaceholderPresence', 'trackFallbackPresence', 'releaseSwap'],
  // 首帧一律停在 idle，来源决议推迟到宿主提交一帧之后（见 resolveSrc）
  initialState: () => 'idle',
  watch: ({ track, prop, action }) => {
    track([() => prop('src')], () => action(['syncSrc']))
    // 预览关掉了、或者没图可看了：开着的预览层跟着收起
    track([() => prop('preview'), () => prop('src')], () => action(['syncPreview']))
  },
  // 换图重走一轮；loading→loading 用 reenter 重跑 entry 并重挂计时器。
  // 预览的开合与加载相位无关：载入中、失败了都能打开，大图在预览层里另走一遍加载。
  on: {
    'SRC.CHANGE': [
      { guard: 'hasSrc', target: 'loading', reenter: true, actions: ['beginSwap'] },
      { target: 'error', actions: ['beginSwap'] },
    ],
    'PART.RENDERED': { actions: ['setPartRendered'] },
    'PREVIEW.OPEN': { guard: 'canPreview', actions: ['openPreview'] },
    'PREVIEW.CLOSE': { actions: ['closePreview'] },
  },
  states: {
    idle: {
      effects: ['resolveSrc'],
      // 决议落地前图片已就绪（缓存命中）时也接事件
      on: {
        'IMAGE.LOAD': { target: 'loaded' },
        'IMAGE.ERROR': { target: 'error' },
      },
    },
    loading: {
      entry: ['invokeLoading', 'resetFallback'],
      effects: ['trackFallbackDelay'],
      on: {
        'IMAGE.LOAD': { target: 'loaded' },
        'IMAGE.ERROR': { target: 'error' },
        'after.fallbackDelay': { actions: ['showFallback'] },
      },
    },
    loaded: {
      entry: ['invokeLoaded', 'rememberSrc', 'endSwap'],
    },
    // 加载失败与无 src 同落此态，回退内容不受延迟约束
    error: {
      entry: ['invokeError', 'endSwap'],
    },
  },
  implementations: {
    guards: {
      hasSrc: ({ prop }) => !!prop('src'),
      canPreview: ({ prop }) => resolveImagePreviewSrc({ src: prop('src'), preview: prop('preview') }) !== undefined,
    },
    actions: {
      /**
       * 换图开始：上一回载好过、又换了一张时，在图片节点后面放一张旧图的替身盖着，新图载好或失败时再淡出。
       * 不靠 DOM 里此刻的 src：React 的宿主可能已经换上了新的
       */
      beginSwap: ({ context, prop, scope }) => {
        const previous = context.get('shownSrc')
        if (previous && previous !== prop('src'))
          beginImageSwap(scope, scope.getById<HTMLImageElement>(scope.partId('image', 'image')), previous)
      },
      rememberSrc: ({ context, prop }) => context.set('shownSrc', prop('src') ?? null),
      endSwap: ({ context, scope, state }) => {
        if (state.matches('error'))
          context.set('shownSrc', null)
        endImageSwap(scope)
      },
      invokeLoading: ({ prop }) => prop('onStatusChange')?.({ status: 'loading' }),
      invokeLoaded: ({ prop }) => prop('onStatusChange')?.({ status: 'loaded' }),
      invokeError: ({ prop }) => prop('onStatusChange')?.({ status: 'error' }),
      syncSrc: ({ send }) => send({ type: 'SRC.CHANGE' }),
      // 换图时把上一轮翻开的回退内容按回去
      resetFallback: ({ context, prop }) => {
        context.set('fallbackVisible', resolveFallbackDelay(prop('fallbackDelay')) <= 0)
      },
      showFallback: ({ context }) => {
        context.set('fallbackVisible', true)
      },
      openPreview: ({ context }) => context.set('previewOpen', true),
      closePreview: ({ context }) => context.set('previewOpen', false),
      syncPreview: ({ context, prop }) => {
        if (context.get('previewOpen') && resolveImagePreviewSrc({ src: prop('src'), preview: prop('preview') }) === undefined)
          context.set('previewOpen', false)
      },
      setPartRendered: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PART.RENDERED')
          context.set(e.part === 'placeholder' ? 'placeholderRendered' : 'fallbackRendered', e.rendered)
      },
    },
    effects: {
      /** 卸载时撤掉还没播完的旧图替身。 */
      releaseSwap: ({ scope }) => () => endImageSwap(scope, true),
      /** 占位层撤下（图片载好或失败）时先淡出，播完才写 hidden：模糊小图与图片交叉，不露一拍底色。 */
      trackPlaceholderPresence: ({ state, scope, send, track, flush }) => trackPartPresence({
        scope,
        id: scope.partId('image', 'placeholder'),
        open: () => imagePlaceholderVisible(state.get()),
        track,
        flush,
        onRenderedChange: rendered => send({ type: 'PART.RENDERED', part: 'placeholder', rendered }),
      }),
      /** 回退内容撤下（图片载好）时浮在图片之上淡出，播完才写 hidden。 */
      trackFallbackPresence: ({ state, context, scope, send, track, flush }) => trackPartPresence({
        scope,
        id: scope.partId('image', 'fallback'),
        open: () => imageFallbackVisible(state.get(), context.get('fallbackVisible')),
        track,
        flush,
        onRenderedChange: rendered => send({ type: 'PART.RENDERED', part: 'fallback', rendered }),
      }),
      // 推迟到宿主提交一帧之后再决议；离开 idle（含卸载）后回调作废。
      resolveSrc: ({ send, flush }) => {
        let disposed = false

        flush(() => {
          if (!disposed)
            send({ type: 'SRC.CHANGE' })
        })

        return () => {
          disposed = true
        }
      },
      // 计时器只在 loading 期间存在，离开 loading 即撤
      trackFallbackDelay: ({ prop, send }) => {
        const ms = resolveFallbackDelay(prop('fallbackDelay'))
        // 0（回退内容已露面）与 Infinity（永不露面）都不起计时器
        if (ms <= 0 || !Number.isFinite(ms))
          return undefined
        return setTimeoutEffect(() => send({ type: 'after.fallbackDelay' }), ms)
      },
    },
  },
})
