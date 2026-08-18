import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { TourApi, TourSchema } from './tour.types'
import { dataAttr } from '@xihan-ui/kernel'
import { tourAnatomy } from './tour.anatomy'
import { clampTourStep, currentTourStep, isTourLastStep, TOUR_DEFAULT_PLACEMENT, tourStepCount } from './tour.machine'

const parts = tourAnatomy.build()

/**
 * 焦点落在这些控件上时 content 不接管 Enter/Space：平台已把这两个键翻成对它们的激活，
 * 这里再走一遍等于一次按键推进两步。
 */
const INTERACTIVE = 'button, a[href], input, select, textarea, [role="button"], [contenteditable="true"]'

export function connectTour<T extends PropTypes>(
  service: Service<TourSchema>,
  normalize: NormalizeProps<T>,
): TourApi<T> {
  const { state, prop, send, context, scope } = service

  const open = state.get() === 'open'
  const steps = prop('steps')
  const count = tourStepCount(steps)
  // 显示用的步序一律夹过：清单改短后内部值会停在一个已不存在的步上
  const step = clampTourStep(context.get('step'), count)
  const currentStep = currentTourStep(steps, step)
  const firstStep = step <= 0
  const lastStep = isTourLastStep(step, count)
  // 锚定与否只看这一步自己的声明，不看量出来的框：量是推迟到宿主提交之后的
  const anchored = !!currentStep?.target

  const ids = scope.ids('tour', 'content', 'title', 'description')
  const stateAttr = open ? 'open' : 'closed'
  const stepAttr = String(step)

  // 位置与高亮框都由效应写进 context，这里只读结果，不量 DOM、不调引擎
  const position = context.get('position')
  // 箭头落点：引擎没算（没要箭头 / 尚未落位）时缺席，皮肤退回居中
  const arrowAt = position?.arrow
  const spotlight = context.get('spotlight')
  const placement = position?.placement ?? currentStep?.placement ?? prop('placement') ?? TOUR_DEFAULT_PLACEMENT

  const translations = prop('translations')
  const closeLabel = translations?.close ?? 'Close'
  const progress = translations?.progress ?? ((m: number, n: number) => `Step ${m} of ${n}`)
  // 空清单时序号写 0，避免念出第 1 步共 0 步
  const progressText = count > 0 ? progress(step + 1, count) : progress(0, 0)

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }

  return {
    open,
    step,
    count,
    currentStep,
    firstStep,
    lastStep,
    anchored,
    progressText,
    setOpen,
    setStep: next => send({ type: 'STEP.SET', step: next }),
    goToNextStep: () => send({ type: 'STEP.NEXT' }),
    goToPrevStep: () => send({ type: 'STEP.PREV' }),
    skip: () => send({ type: 'SKIP' }),
    remeasure: () => send({ type: 'GEOMETRY.SYNC' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
      'data-step': stepAttr,
      // 一步都没声明时浮层里什么都没有，打个标记供作者排查
      'data-empty': dataAttr(count === 0),
    }),

    // 遮罩纯装饰，读屏不念它；点它关不关由 closeOnInteractOutside 说了算
    getBackdropProps: () => normalize.element({
      ...parts.backdrop.attrs,
      'aria-hidden': 'true',
      'data-state': stateAttr,
      'hidden': !open || !(prop('showBackdrop') ?? true) || undefined,
    }),

    /**
     * 挖洞的高亮框：位置与尺寸是量出来的，只能走内联 style。
     * 量不到时写 0 而不是不写：键的集合每帧一致，WC 侧 Object.assign 才不会留下上一步的残值。
     */
    getSpotlightProps: () => normalize.element({
      ...parts.spotlight.attrs,
      'aria-hidden': 'true',
      'data-state': stateAttr,
      // 收起态与居中步都不画；判据用作者声明的 target 而不是量到的框，与量测时机无关
      'hidden': !open || !anchored || undefined,
      'style': {
        position: 'fixed',
        left: `${spotlight?.x ?? 0}px`,
        top: `${spotlight?.y ?? 0}px`,
        inlineSize: `${spotlight?.width ?? 0}px`,
        blockSize: `${spotlight?.height ?? 0}px`,
      },
    }),

    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      'data-state': stateAttr,
      // 居中步交给样式表摆，锚定步的坐标由引擎写内联
      'data-position': anchored ? 'anchored' : 'center',
      'data-placement': placement,
      'hidden': !open || undefined,
      'style': {
        position: 'fixed',
        // 居中步显式写空串把上一步留下的内联坐标撤掉，不写键的话 WC 侧会留着旧值
        left: anchored ? `${position?.x ?? 0}px` : '',
        top: anchored ? `${position?.y ?? 0}px` : '',
      },
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'dialog',
      'tabindex': -1,
      // 引导期间页面其余部分不该被误触，与焦点陷阱一致
      'aria-modal': 'true',
      'aria-labelledby': ids.title,
      'aria-describedby': ids.description,
      'data-state': stateAttr,
      'data-step': stepAttr,
      'data-placement': placement,
      // 收起时留在 DOM 只隐藏，不卸载作者节点
      'hidden': !open || undefined,
      'onKeydown': (event: KeyboardEvent) => {
        if (!open)
          return
        // 方向键一概不接管，浮层里可能有可滚动的长文与作者自己的控件
        const target = event.target as HTMLElement | null
        if (target?.closest(INTERACTIVE))
          return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          send({ type: 'STEP.NEXT' })
        }
      },
    }),

    getTitleProps: () => normalize.element({ ...parts.title.attrs, id: ids.title }),
    getDescriptionProps: () => normalize.element({ ...parts.description.attrs, id: ids.description }),

    /**
     * 第 m 步共 n 步。挂 aria-live：换步时对话框不会重新打开、焦点也不移动，不播报就没人知道走到哪了。
     */
    getProgressTextProps: () => normalize.element({
      ...parts['progress-text'].attrs,
      'aria-live': 'polite',
      'data-step': stepAttr,
    }),

    // 上一步/下一步/跳过/关闭都是单体控件，禁用一律用原生 disabled
    getPrevTriggerProps: () => normalize.button({
      ...parts['prev-trigger'].attrs,
      'type': 'button',
      'disabled': firstStep || undefined,
      'data-state': stateAttr,
      'onClick': () => send({ type: 'STEP.PREV' }),
    }),

    getNextTriggerProps: () => normalize.button({
      ...parts['next-trigger'].attrs,
      'type': 'button',
      // 末步这颗按钮的语义是完成，作者据此换文案
      'data-last': dataAttr(lastStep),
      'data-state': stateAttr,
      'onClick': () => send({ type: 'STEP.NEXT' }),
    }),

    getSkipTriggerProps: () => normalize.button({
      ...parts['skip-trigger'].attrs,
      'type': 'button',
      'data-state': stateAttr,
      'onClick': () => send({ type: 'SKIP' }),
    }),

    // 关闭按钮通常只有一个叉，名字只能从 translations 给；
    // 上一步/下一步/跳过都带可见文案，不再写 aria-label
    getCloseTriggerProps: () => normalize.button({
      ...parts['close-trigger'].attrs,
      'type': 'button',
      'aria-label': closeLabel,
      'onClick': () => send({ type: 'CLOSE', src: 'close-trigger' }),
    }),

    getArrowProps: () => normalize.element({
      ...parts.arrow.attrs,
      'aria-hidden': 'true',
      'data-placement': placement,
      // 居中步没有锚点，不出箭头
      'hidden': !open || !anchored || undefined,
      // 箭头交叉轴上的落点由定位引擎给：上下两侧走行内轴、左右两侧走块轴。
      // 两根轴每帧都写，翻面后另一根不会留着上一帧的值；空串即撤掉声明，皮肤退回居中
      'style': {
        '--xh-_tour-arrow-x': arrowAt?.x != null ? `${arrowAt.x}px` : '',
        '--xh-_tour-arrow-y': arrowAt?.y != null ? `${arrowAt.y}px` : '',
      },
    }),
  }
}
