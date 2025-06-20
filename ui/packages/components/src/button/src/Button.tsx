import { defineComponent, ref, watch, computed, onMounted, onUnmounted } from "vue";
import { buttonProps } from "./interface";
import type { ButtonInstance, ButtonStatus } from "./interface";

// 导入样式引擎和主题系统
import { engineUtils } from "@xihan-ui/themes";
import { getThemeTokens } from "../../theme";

// 导入样式
import buttonStyles from "./styles/index.cssr";

// 创建样式引擎实例
const styleEngine = engineUtils.getEnvironmentEngine();

export default defineComponent({
  name: "XhButton",
  props: buttonProps,
  emits: ["click", "focus", "blur", "change", "loading-change", "disabled-change"],
  setup(props, { slots, emit, expose }) {
    // DOM 引用
    const buttonRef = ref<HTMLButtonElement | null>(null);
    const rippleRef = ref<HTMLDivElement | null>(null);

    // 状态管理
    const isPressed = ref(false);
    const isFocused = ref(false);
    const ripples = ref<Array<{ id: string; x: number; y: number; size: number }>>([]);

    // 计算当前状态
    const buttonStatus = computed<ButtonStatus>(() => {
      if (props.loading) return "loading";
      if (props.disabled) return "disabled";
      return "normal";
    });

    // 编译样式
    const compiledStyles = computed(() => {
      return styleEngine.compile(buttonStyles);
    });

    // 按钮类名
    const buttonClass = computed(() => {
      const compiledClass = compiledStyles.value.className;
      const classes = [compiledClass, "button"];

      // BEM 修饰符类名
      classes.push(`button--${props.type}`);
      classes.push(`button--${props.size}`);
      classes.push(`button--${props.shape}`);

      // 状态修饰符
      if (props.disabled) {
        classes.push("button--disabled");
      }

      if (props.loading) {
        classes.push("button--loading");
      }

      // 变体修饰符
      if (props.text) {
        classes.push("button--text");
      }

      if (props.ghost) {
        classes.push("button--ghost");
      }

      if (props.block) {
        classes.push("button--block");
      }

      // 交互状态修饰符
      if (isPressed.value) {
        classes.push("button--pressed");
      }

      if (isFocused.value) {
        classes.push("button--focused");
      }

      return classes;
    });

    // 按钮内联样式（仅用于自定义颜色）
    const buttonStyle = computed(() => {
      const style: Record<string, string> = {};

      // 自定义颜色
      if (props.color) {
        style["--xh-button-color"] = props.color;
        style["--xh-button-border-color"] = props.color;
        style.backgroundColor = props.color;
        style.borderColor = props.color;
      }

      if (props.textColor) {
        style["--xh-button-text-color"] = props.textColor;
        style.color = props.textColor;
      }

      return style;
    });

    // 无障碍属性
    const ariaAttributes = computed(() => {
      const attrs: Record<string, string | boolean | number | undefined> = {
        "aria-label": props.ariaLabel || undefined,
        "aria-describedby": props.ariaDescribedby || undefined,
        "aria-pressed": props.ariaPressed,
        "aria-expanded": props.ariaExpanded,
        "aria-controls": props.ariaControls || undefined,
        "aria-haspopup": props.ariaHaspopup,
        role: props.role || undefined,
        tabindex: props.disabled ? -1 : props.tabindex,
      };

      // 过滤 undefined 值
      return Object.fromEntries(Object.entries(attrs).filter(([_, value]) => value !== undefined));
    });

    // 点击事件处理
    const handleClick = (event: MouseEvent) => {
      if (props.disabled || props.loading) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // 触发波纹效果
      if (props.ripple) {
        handleRipple(event);
      }

      emit("click", event);
      emit("change", event);
    };

    // 焦点事件处理
    const handleFocus = (event: FocusEvent) => {
      if (props.disabled) return;

      isFocused.value = true;
      emit("focus", event);
    };

    const handleBlur = (event: FocusEvent) => {
      isFocused.value = false;
      emit("blur", event);
    };

    // 鼠标事件处理
    const handleMouseDown = (event: MouseEvent) => {
      if (props.disabled || props.loading) return;

      isPressed.value = true;

      // 处理波纹效果
      if (props.ripple) {
        handleRipple(event);
      }
    };

    const handleMouseUp = () => {
      isPressed.value = false;
    };

    const handleMouseLeave = () => {
      isPressed.value = false;
    };

    // 键盘事件处理
    const handleKeydown = (event: KeyboardEvent) => {
      if (props.disabled || props.loading) return;

      if ((event.key === "Enter" || event.key === " ") && props.keyboard) {
        event.preventDefault();
        handleClick(event as unknown as MouseEvent);
      }
    };

    // 波纹效果处理
    const handleRipple = (event: MouseEvent) => {
      if (!rippleRef.value || !buttonRef.value) return;

      const rect = buttonRef.value.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const ripple = {
        id: `ripple-${Date.now()}-${Math.random()}`,
        x,
        y,
        size,
      };

      ripples.value.push(ripple);

      // 自动清理波纹
      setTimeout(() => {
        handleRippleEnd(ripple);
      }, 600);
    };

    const handleRippleEnd = (ripple: { id: string; x: number; y: number; size: number }) => {
      const index = ripples.value.findIndex(r => r.id === ripple.id);
      if (index > -1) {
        ripples.value.splice(index, 1);
      }
    };

    // 监听属性变化
    watch(
      () => props.loading,
      newValue => {
        emit("loading-change", newValue);
      },
    );

    watch(
      () => props.disabled,
      newValue => {
        emit("disabled-change", newValue);
      },
    );

    // 注入样式
    onMounted(() => {
      // 确保主题令牌存在
      const themeTokens = getThemeTokens();
      if (!themeTokens) {
        console.warn("主题令牌未找到，Button 组件可能无法正确显示样式");
      }

      // 注入完整的CSS
      styleEngine.inject(compiledStyles.value.css, `xh-button-styles`);
    });

    // 清理
    onUnmounted(() => {
      ripples.value = [];
    });

    // 组件实例方法
    const instance: ButtonInstance = {
      $el: buttonRef,
      getState: () => ({
        isPressed: isPressed.value,
        isFocused: isFocused.value,
        status: buttonStatus.value,
      }),
      reset: () => {
        isPressed.value = false;
        isFocused.value = false;
        ripples.value = [];
      },
      setLoading: (loading: boolean) => {
        emit("loading-change", loading);
      },
      setDisabled: (disabled: boolean) => {
        emit("disabled-change", disabled);
      },
    };

    expose(instance);

    // 渲染函数
    return () => {
      return (
        <button
          ref={buttonRef}
          class={buttonClass.value}
          style={buttonStyle.value}
          type={props.attrType}
          disabled={props.disabled || props.loading}
          onClick={handleClick}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onMousedown={handleMouseDown}
          onMouseup={handleMouseUp}
          onMouseleave={handleMouseLeave}
          onKeydown={handleKeydown}
          {...ariaAttributes.value}
        >
          <span class="button__content">
            {props.loading && (
              <span class="button__loading" aria-hidden="true">
                {slots.loading?.() || (
                  <svg class="button__loading-icon" viewBox="0 0 24 24" width="1em" height="1em">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-dasharray="31.416"
                      stroke-dashoffset="31.416"
                      fill="none"
                    >
                      <animate
                        attributeName="stroke-dasharray"
                        dur="2s"
                        values="0 31.416;15.708 15.708;0 31.416"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="stroke-dashoffset"
                        dur="2s"
                        values="0;-15.708;-31.416"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                )}
              </span>
            )}
            {!props.loading && slots.prefix && (
              <span class="button__prefix" aria-hidden="true">
                {slots.prefix()}
              </span>
            )}
            <span class="button__text">{slots.default?.()}</span>
            {!props.loading && slots.suffix && (
              <span class="button__suffix" aria-hidden="true">
                {slots.suffix()}
              </span>
            )}
          </span>
          {props.ripple && (
            <div ref={rippleRef} class="button__ripple" aria-hidden="true">
              {ripples.value.map(ripple => (
                <span
                  key={ripple.id}
                  class="button__ripple-effect"
                  style={{
                    left: `${ripple.x}px`,
                    top: `${ripple.y}px`,
                    width: `${ripple.size}px`,
                    height: `${ripple.size}px`,
                    animation: `xh-button-ripple 600ms cubic-bezier(0.4, 0, 0.2, 1)`,
                  }}
                  onAnimationend={() => handleRippleEnd(ripple)}
                />
              ))}
            </div>
          )}
        </button>
      );
    };
  },
});
