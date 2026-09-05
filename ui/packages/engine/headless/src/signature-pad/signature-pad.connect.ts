import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { SignaturePadApi, SignaturePadSchema } from './signature-pad.types'
import { dataAttr } from '@xihan-ui/kernel'
import { VISUALLY_HIDDEN_STYLE } from '../shared/visually-hidden'
import { signaturePadAnatomy } from './signature-pad.anatomy'
import { signaturePadSvg, strokesToPaths } from './signature-pad.geometry'

const parts = signaturePadAnatomy.build()

/**
 * 基准线在画布上的落位，用百分比表达，跟着画布一起缩放。
 * 两端各留一截，线压在下方——签名写在线上方，与纸质表单的习惯一致。
 */
const GUIDE_INSET = '8%'
const GUIDE_END = '92%'
const GUIDE_BASELINE = '76%'

export function connectSignaturePad<T extends PropTypes>(
  service: Service<SignaturePadSchema>,
  normalize: NormalizeProps<T>,
): SignaturePadApi<T> {
  const { context, prop, send, scope, state } = service
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const required = !!prop('required')
  const invalid = !!prop('invalid')
  // 能否落笔；清空按钮用的是同一道判据
  const editable = !disabled && !readOnly
  const drawing = state.matches('drawing')
  const translations = prop('translations')
  const ids = scope.ids('signature-pad', 'label')

  const surface = context.get('surface')
  const paths = strokesToPaths(context.get('strokes'), prop('drawing') ?? {})
  const empty = paths.length === 0
  const statusText = empty
    ? translations?.statusEmpty ?? 'No signature yet'
    : translations?.statusSigned ?? 'Signed'
  // 每一笔是一条子路径，全部落在同一条 path 上：条数是画出来的，作者写不出对应数量的节点
  const d = paths.join(' ')
  const toSvg = (): string => signaturePadSvg(paths, surface)

  return {
    paths,
    empty,
    drawing,
    disabled,
    readOnly,
    statusText,
    toSvg,
    clear: () => send({ type: 'STROKES.CLEAR' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-empty': dataAttr(empty),
      'data-drawing': dataAttr(drawing),
    }),

    getLabelProps: () => normalize.element({
      ...parts.label.attrs,
      'id': ids.label,
      'data-disabled': dataAttr(disabled),
    }),

    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      // 触摸落笔要接管手势：不关掉浏览器的滚动与缩放，指针事件会被系统收走（pointercancel）
      'style': { touchAction: 'none' },
      // 视窗按钉住的那套尺寸写：容器变宽变窄时已有笔迹跟着缩放，而不是留在原像素上错位。
      // 还没量到尺寸（一笔都没画）时不写，写成 0 0 0 0 会把整块画布缩没
      'viewBox': surface.width > 0 && surface.height > 0
        ? `0 0 ${surface.width} ${surface.height}`
        : undefined,
      // 缩放按两轴各自铺满，笔迹坐标与指针坐标才是同一套换算；留白居中会让两者错开
      'preserveAspectRatio': 'none',
      // 签名是一张图。它不接键盘也不进 Tab 序列，报成控件就是骗读屏；
      // 可用性的落点在 doc.md 写明的替代路径上，不在这个节点上
      'role': 'img',
      // 作者渲染了标题就用标题；没渲染时这条 IDREF 悬空，读屏退回下面这句内建文案
      'aria-labelledby': ids.label,
      'aria-label': translations?.label ?? 'Signature',
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-empty': dataAttr(empty),
      'data-drawing': dataAttr(drawing),
      'onPointerDown': (event: PointerEvent) => {
        // 只认主键：右键要弹上下文菜单，中键是自动滚动
        if (!editable || event.button !== 0)
          return
        // 挡掉文本选中与默认拖拽，手一划就会把画布连同旁边的文字刷成选中态
        event.preventDefault()
        // 捕获这根指针：后续移动一律回到画布上，手划出画布也不会被别的元素截走
        ;(event.currentTarget as Element | null)?.setPointerCapture?.(event.pointerId)
        send({
          type: 'DRAW.START',
          point: {
            clientX: event.clientX,
            clientY: event.clientY,
            pressure: event.pressure,
            pointerId: event.pointerId,
          },
        })
      },
    }),

    getGuideProps: () => normalize.element({
      ...parts.guide.attrs,
      'x1': GUIDE_INSET,
      'y1': GUIDE_BASELINE,
      'x2': GUIDE_END,
      'y2': GUIDE_BASELINE,
      // 基准线只是画面，读屏念它没有任何意义
      'aria-hidden': true,
      'data-disabled': dataAttr(disabled),
    }),

    getPathProps: () => normalize.element({
      ...parts.path.attrs,
      'd': d,
      'data-empty': dataAttr(empty),
    }),

    getClearTriggerProps: () => normalize.button({
      ...parts['clear-trigger'].attrs,
      // 少了 type，按钮落在 form 里会变成 submit
      'type': 'button',
      // 按钮里通常只有一个叉，读屏念不出它清掉的是什么
      'aria-label': translations?.clearTrigger ?? 'Clear signature',
      // 单体控件用原生 disabled；它不是集合条目，不必留着当导航起点
      'disabled': !editable || undefined,
      'data-disabled': dataAttr(!editable),
      // 空画布时按钮照常可按（按下去是空操作），收掉它会让焦点掉回 body
      'data-empty': dataAttr(empty),
      'onClick': () => {
        if (editable)
          send({ type: 'STROKES.CLEAR' })
      },
    }),

    getStatusProps: () => normalize.element({
      ...parts.status.attrs,
      // 画布是 role=img，名字恒定，签上与清空对读屏是同一句话。
      // 这块活区域把"签没签"念出来，是签名唯一的感知出口
      'role': 'status',
      'aria-live': 'polite',
      // 整句重念，只念变动的词读不出上下文
      'aria-atomic': 'true',
      // 空与否只发这一条布尔：另外四个部件也发它，同一个事实在同一个节点上再编码一遍
      // 只会让使用者的全局规则写歪一半（'signed' 至今零消费）
      'data-empty': dataAttr(empty),
    }),

    getHiddenInputProps: () => normalize.input({
      ...parts['hidden-input'].attrs,
      // type 先于 value 写入：改 type 会重置输入的值
      'type': 'text',
      // 缺省时不产出该属性，这份输入不参与提交
      'name': prop('name'),
      // 空签名提交空串而不是一份没有图元的 SVG，required 才拦得住
      'value': toSvg(),
      'required': required || undefined,
      // 原生 disabled，禁用时不提交值
      'disabled': disabled || undefined,
      // 只读随 prop 走，恒真会让 required 不生效
      'readonly': readOnly || undefined,
      'aria-invalid': invalid ? 'true' : 'false',
      'aria-hidden': true,
      'tabindex': -1,
      'data-disabled': dataAttr(disabled),
      'style': VISUALLY_HIDDEN_STYLE,
    }),
  }
}
