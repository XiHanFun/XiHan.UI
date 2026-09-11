/**
 * 可由 Form 或 Field 下传给录入控件的四条状态轴。
 *
 * 值保持 optional 是有意的：`false` 是实例明确取消继承，`undefined` 才表示
 * 「本实例没说，继续向上取」。适配器不能把缺省布尔提前归一成 false。
 */
export interface FormControlState {
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean
}

/** 已完成继承后的四条状态轴，交给具体控件机器使用。 */
export interface ResolvedFormControlState {
  disabled: boolean
  readOnly: boolean
  required: boolean
  invalid: boolean
}

/**
 * Form/Field 状态的唯一优先级规则：实例值 > 最近的继承值 > 内建 false。
 *
 * 这条是无头层的纯计算；Vue/React 的 Context 与 Web Components 的 DOM 发现
 * 只负责把最近状态接到这里，不能各自再复制一套 `??` 规则。
 */
export function resolveFormControlState(
  instance: FormControlState,
  inherited: FormControlState | undefined,
): ResolvedFormControlState {
  return {
    disabled: instance.disabled ?? inherited?.disabled ?? false,
    readOnly: instance.readOnly ?? inherited?.readOnly ?? false,
    required: instance.required ?? inherited?.required ?? false,
    invalid: instance.invalid ?? inherited?.invalid ?? false,
  }
}
