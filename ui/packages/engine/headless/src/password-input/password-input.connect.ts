import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { PasswordInputApi, PasswordInputSchema } from './password-input.types'
import { dataAttr, isComposingEvent } from '@xihan-ui/kernel'
import { passwordInputAnatomy, passwordInputInputId } from './password-input.anatomy'

const parts = passwordInputAnatomy.build()

/**
 * 从按键事件里读大写锁定的开关。
 * 只有事件对象知道这件事：平台没有"现在查一下修饰键"的接口，所以提示要等用户按下第一个键才亮得起来。
 */
function capsLockOf(event: KeyboardEvent): boolean {
  // 合成事件与个别环境里没有这个方法，读不到就当没开
  return typeof event.getModifierState === 'function' && event.getModifierState('CapsLock')
}

export function connectPasswordInput<T extends PropTypes>(
  service: Service<PasswordInputSchema>,
  normalize: NormalizeProps<T>,
): PasswordInputApi<T> {
  const { prop, send, context, scope } = service
  const ids = scope.ids(passwordInputAnatomy.name, 'label', 'capsLock')
  // 与机器里放回光标用的是同一份算法
  const inputId = passwordInputInputId(scope)

  const value = context.get('value')
  const visible = context.get('visible')
  const capsLock = context.get('capsLock')
  const empty = value === ''
  const disabled = !!prop('disabled')
  const readOnly = !!prop('readOnly')
  const invalid = !!prop('invalid')
  const inputType = visible ? 'text' : 'password'

  const translations = prop('translations')
  const label = {
    visibilityTriggerShow: translations?.visibilityTriggerShow ?? 'Show password',
    visibilityTriggerHide: translations?.visibilityTriggerHide ?? 'Hide password',
    capsLockOn: translations?.capsLockOn ?? 'Caps Lock is on',
  }

  // 状态没变就不送：每敲一个字符都会走一遍这条路
  const syncCapsLock = (event: KeyboardEvent): void => {
    // 组合期间的按键属于输入法候选框：那一刻的 keydown 是合成事件，读出来的锁定态不可信，
    // 据此翻提示会在用户敲候选词时闪一句错的
    if (isComposingEvent(event))
      return
    const on = capsLockOf(event)
    if (on !== capsLock)
      send({ type: 'CAPS_LOCK.SET', on })
  }

  return {
    value,
    empty,
    visible,
    capsLock,
    disabled,
    readOnly,
    invalid,
    inputType,
    capsLockMessage: capsLock ? label.capsLockOn : '',
    setValue: next => send({ type: 'VALUE.SET', value: next }),
    setVisible: next => send({ type: 'VISIBILITY.SET', visible: next }),
    toggleVisibility: () => send({ type: 'VISIBILITY.TOGGLE' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 三个视觉轴只落在 root，子部件从这里继承皮肤声明的私有槽
      'data-variant': prop('variant'),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
      'data-empty': dataAttr(empty),
    }),

    getLabelProps: () => normalize.label({
      ...parts.label.attrs,
      'id': ids.label,
      // for 指向真正的 input，不是外层包裹节点：指到不可标注的元素上，点标题不会聚焦
      'for': inputId,
      'data-disabled': dataAttr(disabled),
    }),

    // 视觉盒画在 control 上：描边、底色与聚焦环归它，框内三件都是透明分段
    getControlProps: () => normalize.element({
      ...parts.control.attrs,
      'data-disabled': dataAttr(disabled),
      'data-readonly': dataAttr(readOnly),
      'data-invalid': dataAttr(invalid),
    }),

    getInputProps: () => normalize.input({
      ...parts.input.attrs,
      'id': inputId,
      // 隐藏态就是原生密码框；显示态换成 text，除此之外两态完全一样
      'type': inputType,
      'name': prop('name'),
      'value': value,
      'placeholder': prop('placeholder'),
      // 密码管理器靠 autocomplete 决定这一格是填旧密码还是存新密码
      'autocomplete': prop('autoComplete') ?? 'current-password',
      // 明文态下 input 就是普通文本框，平台的拼写检查会把框里的内容发去远端服务，
      // 移动端还会给首字母自动大写、按词典自动纠错——三件事都不能落到密码上
      'spellcheck': 'false',
      'autocapitalize': 'off',
      'autocorrect': 'off',
      'disabled': disabled || undefined,
      'readonly': readOnly || undefined,
      'required': prop('required') || undefined,
      // 作者把 label 换成非 <label> 元素时 for 会失效，这条兜住名字
      'aria-labelledby': ids.label,
      // 显式 true/false：省略是没说，显式 false 是明确说了不是
      'aria-invalid': invalid ? 'true' : 'false',
      // 大写锁定亮着时把提示挂进描述：焦点晚于提示出现的用户，进框就能听见
      'aria-describedby': capsLock ? ids.capsLock : undefined,
      'data-disabled': dataAttr(disabled),
      'data-invalid': dataAttr(invalid),
      'onInput': (event: Event) => {
        const el = event.target as HTMLInputElement
        send({ type: 'VALUE.SET', value: el.value })
      },
      // 按下与松开各读一次：按 CapsLock 这一下本身，两个时刻报出来的状态在各平台不一致
      'onKeyDown': syncCapsLock,
      'onKeyUp': syncCapsLock,
      // 焦点走了就熄灭：没有按键就再也读不到状态，留着的那句提示会一直停在过期值上
      'onBlur': () => send({ type: 'CAPS_LOCK.SET', on: false }),
    }),

    getVisibilityTriggerProps: () => normalize.button({
      ...parts['visibility-trigger'].attrs,
      // 少了 type，按钮落在 form 里会变成 submit
      'type': 'button',
      // 名字随动作走。名字换了就不再加 aria-pressed：两个通道各说各的，
      // 会念成"隐藏密码 已按下"，听的人分不清此刻到底是明是暗
      'aria-label': visible ? label.visibilityTriggerHide : label.visibilityTriggerShow,
      'aria-controls': inputId,
      // 单体控件走原生 disabled
      'disabled': disabled || undefined,
      'data-state': visible ? 'visible' : 'hidden',
      'data-disabled': dataAttr(disabled),
      // 不拦 pointerdown：焦点本就该落在按钮上，切完还能接着按第二下
      'onClick': () => {
        if (!disabled)
          send({ type: 'VISIBILITY.TOGGLE' })
      },
    }),

    // 播报区恒在场、恒渲染，只换区内文字：读屏念的是活区域里变动的内容，
    // 拿 hidden 或 display 把区域本身撤下去，再出现时它当作插入了个新节点，多数不念
    getCapsLockIndicatorProps: () => normalize.element({
      ...parts['caps-lock-indicator'].attrs,
      'id': ids.capsLock,
      'role': 'status',
      'aria-live': 'polite',
      // 整段一起念：文案是一句话，只念新增的半句听不懂
      'aria-atomic': 'true',
      'data-state': capsLock ? 'visible' : 'hidden',
    }),
  }
}
