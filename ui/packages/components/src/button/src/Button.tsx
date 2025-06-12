import { defineComponent, ref, computed, watch } from "vue";
import { buttonProps } from "./interface";
import { getButtonStyles } from "./styles";
import { createRippleEffect } from "@xihan-ui/themes";
import { LoadingIcon } from "@xihan-ui/icons";

export default defineComponent({
  name: "Button",
  props: buttonProps,
  emits: ["click", "focus", "blur", "change", "loading-change", "disabled-change"],
  setup(props, { slots, emit, expose }) {
    const buttonRef = ref<HTMLElement | null>(null);
    const isPressed = ref(false);
    const isFocused = ref(false);

    // 计算按钮状态
    const buttonStatus = computed(() => {
      if (props.disabled) return "disabled";
      if (props.loading) return "loading";
      return "normal";
    });

    // 计算按钮样式
    const buttonClass = computed(() => {
      const styles = getButtonStyles(props);
      return styles.filter(Boolean).join(" ");
    });

    // 处理点击事件
    const handleClick = (event: MouseEvent) => {
      if (props.disabled || props.loading) return;

      // 创建波纹效果
      if (props.ripple && buttonRef.value) {
        createRippleEffect(buttonRef.value, event);
      }

      emit("click", event);
    };

    // 处理焦点事件
    const handleFocus = (event: FocusEvent) => {
      isFocused.value = true;
      emit("focus", event);
    };

    const handleBlur = (event: FocusEvent) => {
      isFocused.value = false;
      emit("blur", event);
    };

    // 处理鼠标按下事件
    const handleMouseDown = () => {
      if (!props.disabled && !props.loading) {
        isPressed.value = true;
      }
    };

    const handleMouseUp = () => {
      isPressed.value = false;
    };

    // 监听状态变化
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

    // 暴露组件实例方法
    expose({
      $el: buttonRef,
      getState: () => ({
        isPressed: isPressed.value,
        isFocused: isFocused.value,
        status: buttonStatus.value,
      }),
      reset: () => {
        isPressed.value = false;
        isFocused.value = false;
      },
      setLoading: (loading: boolean) => {
        props.loading = loading;
      },
      setDisabled: (disabled: boolean) => {
        props.disabled = disabled;
      },
    });

    return () => {
      const { type, size, shape, disabled, loading, text, ghost, block } = props;

      return (
        <button
          ref={buttonRef}
          class={[
            "xh-button",
            buttonClass.value,
            {
              "is-pressed": isPressed.value,
              "is-focused": isFocused.value,
              "is-disabled": disabled,
              "is-loading": loading,
              "is-text": text,
              "is-ghost": ghost,
              "is-block": block,
            },
          ]}
          type={type === "submit" ? "submit" : "button"}
          disabled={disabled || loading}
          onClick={handleClick}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onMousedown={handleMouseDown}
          onMouseup={handleMouseUp}
          onMouseleave={handleMouseUp}
        >
          <span class="xh-button__content">
            {loading && <span class="xh-button__loading">{slots.loading ? slots.loading() : <LoadingIcon />}</span>}
            {!loading && slots.prefix && <span class="xh-button__prefix">{slots.prefix()}</span>}
            <span class="xh-button__text">{slots.default?.()}</span>
            {!loading && slots.suffix && <span class="xh-button__suffix">{slots.suffix()}</span>}
          </span>
          {props.ripple && <span class="xh-button__ripple" />}
        </button>
      );
    };
  },
});
