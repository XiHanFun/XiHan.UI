/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 watermark 相关实现。

import type { PropFn } from '@xihan-ui/core'
import type { WatermarkProps, WatermarkSchema } from './watermark.types'
import { DIAGNOSTIC_CODES, reportDiagnostic, setup } from '@xihan-ui/core'
import { watermarkAnatomy } from './watermark.anatomy'
import { planWatermark, toWatermarkImageAddress } from './watermark.connect'

const { createMachine } = setup<WatermarkSchema>()

const parts = watermarkAnatomy.build()

/** 取回的图片画进 canvas 时长边的上限：图样里最大 512，留一倍给高分屏。 */
const MAX_IMAGE_EDGE = 1024

/** 防篡改盯住的根节点属性：解剖两位与状态属性，外加内联 style 里的两支图样变量与 class 里的皮肤挂载类。 */
const GUARDED_ATTRS = ['data-scope', 'data-part', 'data-state', 'data-fullscreen'] as const

function readProps(prop: PropFn<WatermarkSchema>): WatermarkProps {
  return {
    text: prop('text'),
    rotate: prop('rotate'),
    gap: prop('gap'),
    fontSize: prop('fontSize'),
    opacity: prop('opacity'),
    fontFamily: prop('fontFamily'),
    image: prop('image'),
    imageSize: prop('imageSize'),
    fullscreen: prop('fullscreen'),
  }
}

/**
 * 把地址形式的图片取回来，画进 canvas 转成内联的 PNG。
 *
 * 按匿名跨域取：同源照取；跨域的地址要带 Access-Control-Allow-Origin，否则浏览器直接拒载。
 * 万一 canvas 仍被污染，toDataURL 会抛 SecurityError，一并按取不回处理。
 */
function loadImageData(doc: Document, src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const view = doc.defaultView
    if (!view) {
      reject(new Error('no window'))
      return
    }
    const img = new view.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        // 只写了 viewBox 的矢量图没有固有尺寸：按上限的一半画，矢量图在画布里按比例居中、不拉伸
        const width = img.naturalWidth || MAX_IMAGE_EDGE / 2
        const height = img.naturalHeight || MAX_IMAGE_EDGE / 2
        const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(width, height))
        const canvas = doc.createElement('canvas')
        canvas.width = Math.max(1, Math.round(width * scale))
        canvas.height = Math.max(1, Math.round(height * scale))
        const ctx = canvas.getContext('2d')
        if (!ctx)
          throw new Error('no 2d context')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/png'))
      }
      catch (error) {
        reject(error)
      }
    }
    img.onerror = () => reject(new Error('load failed'))
    img.src = src
  })
}

export const watermarkMachine = createMachine({
  name: 'watermark',
  context: ({ cell }) => ({
    imageData: cell<string | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    getRootEl: () => null,
  }),
  initialState: () => 'idle',
  effects: ['trackImage', 'trackTamper'],
  states: {
    idle: {
      on: {
        'IMAGE.LOADED': { actions: ['setImageData'] },
        'IMAGE.CLEAR': { actions: ['clearImageData'] },
      },
    },
  },
  implementations: {
    actions: {
      setImageData: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'IMAGE.LOADED')
          context.set('imageData', e.data)
      },
      clearImageData: ({ context }) => context.set('imageData', null),
    },
    effects: {
      /**
       * 地址形式的图片先取回：取到即交给图样，取不回（跨域未放行、canvas 被污染、地址失效）报一条诊断、只印文字。
       * image 一换就作废上一次取回，重新取；内联图片与没有图片时清空。
       */
      trackImage: ({ prop, scope, send, track }) => {
        let cancel: (() => void) | undefined
        const sync = (): void => {
          cancel?.()
          cancel = undefined
          send({ type: 'IMAGE.CLEAR' })
          const address = toWatermarkImageAddress(prop('image'))
          if (address === undefined)
            return
          let cancelled = false
          cancel = () => {
            cancelled = true
          }
          loadImageData(scope.getDoc(), address).then(
            (data) => {
              if (!cancelled)
                send({ type: 'IMAGE.LOADED', data })
            },
            () => {
              if (cancelled)
                return
              reportDiagnostic({
                code: DIAGNOSTIC_CODES.warn,
                level: 'warn',
                scope: watermarkAnatomy.name,
                message: '水印图片取不回来：跨域地址要带 Access-Control-Allow-Origin 放行，否则拒载或污染 canvas；这张图不印，文字照印',
                detail: { image: address },
              })
            },
          )
        }
        track([() => prop('image')], sync)
        sync()
        return () => cancel?.()
      },

      /**
       * 防篡改：盯住根节点的解剖与状态属性、内联的图样变量，以及它在父节点里的位置。被删掉的根节点原位放回，
       * 被改的属性与变量改回当下 props 算出的值；宿主按新 props 重渲写进来的值本就与之相同，不会被顶回去。
       * 适配器在移除节点之前停机（Vue onBeforeUnmount、React layout effect 清理），观察器先撤、正常卸载不被当成篡改。
       */
      trackTamper: ({ prop, context, refs, scope, flush }) => {
        const Observer = scope.getWin().MutationObserver
        if (!Observer)
          return undefined
        let disposed = false
        let root: HTMLElement | null = null
        let observer: MutationObserver | null = null

        const restore = (el: HTMLElement): void => {
          const plan = planWatermark(readProps(prop), context.get('imageData') ?? null)
          const expected: Record<string, string | undefined> = {
            'data-scope': parts.root.attrs['data-scope'],
            'data-part': parts.root.attrs['data-part'],
            ...plan.attrs,
          }
          for (const name of GUARDED_ATTRS) {
            const want = expected[name]
            if (el.getAttribute(name) === (want ?? null))
              continue
            if (want === undefined)
              el.removeAttribute(name)
            else
              el.setAttribute(name, want)
          }
          // 挂载类只补不删：class 里作者自己的词不归这里管
          const mount = parts.root.attrs.class
          if (mount && !el.classList.contains(mount))
            el.classList.add(mount)
          for (const [name, value] of Object.entries(plan.vars)) {
            if (el.style.getPropertyValue(name).trim() !== value)
              el.style.setProperty(name, value)
          }
        }

        const observe = (): void => {
          if (!observer || !root)
            return
          observer.disconnect()
          observer.observe(root, { attributes: true, attributeFilter: [...GUARDED_ATTRS, 'style', 'class'] })
          if (root.parentNode)
            observer.observe(root.parentNode, { childList: true })
        }

        const onMutations = (records: MutationRecord[]): void => {
          if (disposed || !root)
            return
          for (const record of records) {
            if (record.type !== 'childList' || !Array.from(record.removedNodes).includes(root) || root.parentNode)
              continue
            // 原位放回：紧挨着它原来的后一个兄弟；那个兄弟也不在了就放到末尾
            const next = record.nextSibling && record.nextSibling.parentNode === record.target ? record.nextSibling : null
            record.target.insertBefore(root, next)
          }
          restore(root)
          // 放回与改回本身也会产生记录：清掉这一轮，重新盯（父节点可能换了）
          observer?.takeRecords()
          observe()
        }

        // 首轮渲染后根节点才在（Web Components 的角色节点要等首次接线）
        flush(() => {
          if (disposed)
            return
          root = refs.get('getRootEl')()
          if (!root)
            return
          observer = new Observer(onMutations)
          observe()
          restore(root)
          observer.takeRecords()
        })

        return () => {
          disposed = true
          observer?.disconnect()
          observer = null
        }
      },
    },
  },
})
