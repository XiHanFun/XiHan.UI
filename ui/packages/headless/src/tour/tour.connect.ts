import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { TourApi, TourSchema } from './tour.types'
import { dataAttr } from '@xihan-ui/core'
import { tourAnatomy } from './tour.anatomy'
import { clampTourStep, currentTourStep, isTourLastStep, TOUR_DEFAULT_PLACEMENT, tourStepCount } from './tour.machine'

const parts = tourAnatomy.build()

/**
 * 焦点落在这些控件上时 content 不接管 Enter/Space：平台会把这两个键翻成对它们的激活，
 * 这里再走一遍等于一次按键推进两步（按"上一步"却前进了一步就是这么来的）。
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
  // 显示用的步序一律夹过：宿主把清单改短之后内部值会停在一个已不存在的步上，
  // 不夹的话 currentStep 恒为 null，标题与描述会整段消失
  const step = clampTourStep(context.get('step'), count)
  const currentStep = currentTourStep(steps, step)
  const firstStep = step <= 0
  const lastStep = isTourLastStep(step, count)
  // 锚定与否只看这一步自己的声明，不看量出来的框：量是异步的（推迟到宿主提交之后），
  // 拿它当判据的话首帧会先按居中画一次、下一帧再跳到锚定形态
  const anchored = !!currentStep?.target

  const ids = scope.ids('tour', 'content', 'title', 'description')
  const stateAttr = open ? 'open' : 'closed'
  const stepAttr = String(step)

  // 位置与高亮框都由效应写进 context；这里只读结果，不量 DOM、不调引擎，保持纯函数
  const position = context.get('position')
  const spotlight = context.get('spotlight')
  const placement = position?.placement ?? currentStep?.placement ?? prop('placement') ?? TOUR_DEFAULT_PLACEMENT

  const translations = prop('translations')
  const closeLabel = translations?.close ?? 'Close'
  const progress = translations?.progress ?? ((m: number, n: number) => `Step ${m} of ${n}`)
  // 空清单时序号写 0：写 "第 1 步，共 0 步" 是在对读屏说一句自相矛盾的话
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

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
      'data-step': stepAttr,
      // 一步都没声明（作者漏了 steps）：浮层里什么都没有，打个标记比让人对着空白猜强
      'data-empty': dataAttr(count === 0),
    }),

    // 遮罩纯装饰：读屏不该念它，也不该把它当成一个可点的东西。
    // 点它归不归"关闭"由 closeOnInteractOutside 说了算（缺省不关），与这里无关
    getBackdropProps: () => normalize.element({
      ...parts.backdrop.attrs,
      'aria-hidden': 'true',
      'data-state': stateAttr,
      'hidden': !open || !(prop('showBackdrop') ?? true) || undefined,
    }),

    /**
     * 挖洞的高亮框：位置与尺寸是量出来的，只能走内联 style。
     * 量不到（居中步、目标还没挂上来）时写 0 而不是不写——键的集合每帧一致，
     * 命令式适配器（WC 用 Object.assign 写 style）才不会留下上一步的残值。
     */
    getSpotlightProps: () => normalize.element({
      ...parts.spotlight.attrs,
      'aria-hidden': 'true',
      'data-state': stateAttr,
      // 收起态与居中步都不画。判据用作者声明的 target 而不是量到的框，
      // 这样 hidden 与量测时机无关，两个适配器的每一帧都对得上
      'hidden': !open || !anchored || undefined,
      'style': {
        position: 'fixed',
        insetInlineStart: `${spotlight?.x ?? 0}px`,
        insetBlockStart: `${spotlight?.y ?? 0}px`,
        inlineSize: `${spotlight?.width ?? 0}px`,
        blockSize: `${spotlight?.height ?? 0}px`,
      },
    }),

    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      'data-state': stateAttr,
      // 居中步交给样式表摆（inset:0 + flex 居中），锚定步的坐标由引擎写内联
      'data-position': anchored ? 'anchored' : 'center',
      'data-placement': placement,
      'hidden': !open || undefined,
      'style': {
        position: 'fixed',
        // 居中步显式写空串把上一步留下的内联坐标撤掉：
        // 只是"不写这两个键"的话，命令式适配器会把旧值原样留在节点上
        insetInlineStart: anchored ? `${position?.x ?? 0}px` : '',
        insetBlockStart: anchored ? `${position?.y ?? 0}px` : '',
      },
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'dialog',
      'tabindex': -1,
      // 引导期间页面其余部分不该被误触：显式写 true，与焦点陷阱是一套说辞的两面
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
        // 方向键一概不接管：引导浮层里可能有可滚动的长文，也可能有作者自己的控件，
        // 抢走上下左右会把这些一并弄坏，读屏的浏览模式也走不动
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
     * "第 m 步，共 n 步"。挂 aria-live：换步时对话框不会重新打开、焦点也不移动，
     * 不主动播报的话读屏用户根本不知道自己走到哪儿了。
     */
    getProgressTextProps: () => normalize.element({
      ...parts['progress-text'].attrs,
      'aria-live': 'polite',
      'data-step': stepAttr,
    }),

    // 上一步/下一步/跳过/关闭都是单体控件，禁用一律用原生 disabled
    // （集合条目才用 aria-disabled——那是为了让禁用项仍可聚焦、仍能当方向键起点，
    // 这四个按钮没有这个需求）
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
      // 末步这颗按钮的语义是"完成"，作者据此换文案；不替作者改文字
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

    // 关闭按钮通常只有一个叉，没有可读的文字，名字只能从 translations 给。
    // 上一步/下一步/跳过都带可见文案，再写 aria-label 会让读屏念出的名字与眼睛看到的对不上
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
      // 居中步没有锚点，一个指向虚空的箭头只会误导
      'hidden': !open || !anchored || undefined,
    }),
  }
}
