import { defineComponent, ref, computed, watch, onMounted, onUnmounted, nextTick, useTemplateRef } from "vue";
import {
  iconProps,
  type IconProps,
  type IconInstance,
  type IconAnimation,
  type IconSize,
  type IconCache,
  type IconLoader,
} from "./interface";
import { IconBase, addIcons, listIcons } from "@xihan-ui/icons";
import { isString, isNumber, isObject, generateId, createLogger, assert, tryCatch } from "@xihan-ui/utils/core";
import { debounceFn, throttleFn } from "@xihan-ui/utils/core";
import { style } from "@xihan-ui/utils/dom";
import { preloadImage } from "@xihan-ui/utils/file";

// 创建日志记录器
const logger = createLogger({ prefix: "[XhIcon]" });
const { addClass, removeClass } = style;

// 图标缓存实现
class IconCacheImpl implements IconCache {
  private cache = new Map<string, any>();
  private maxSize = 100;

  get(key: string): any {
    return this.cache.get(key);
  }

  set(key: string, value: any): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// 图标加载器实现
class IconLoaderImpl implements IconLoader {
  private cache = new IconCacheImpl();
  private loadingPromises = new Map<string, Promise<any>>();

  async load(name: string, options?: any): Promise<any> {
    if (this.cache.has(name)) {
      return this.cache.get(name);
    }

    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }

    const promise = this.loadIcon(name, options);
    this.loadingPromises.set(name, promise);

    try {
      const data = await promise;
      this.cache.set(name, data);
      return data;
    } finally {
      this.loadingPromises.delete(name);
    }
  }

  private async loadIcon(name: string, options?: any): Promise<any> {
    // 检查是否已注册
    const registeredIcons = listIcons();
    if (registeredIcons[name]) {
      return registeredIcons[name];
    }

    // 尝试从远程加载
    if (options?.url) {
      const response = await fetch(options.url);
      if (!response.ok) {
        throw new Error(`Failed to load icon: ${name}`);
      }
      return await response.text();
    }

    throw new Error(`Icon not found: ${name}`);
  }

  async preload(names: string[]): Promise<void> {
    await Promise.all(names.map(name => this.load(name)));
  }

  getIconData(name: string): any {
    return this.cache.get(name);
  }

  isLoaded(name: string): boolean {
    return this.cache.has(name);
  }
}

// 全局图标加载器实例
const iconLoader = new IconLoaderImpl();

export default defineComponent({
  name: "XhIcon",
  props: iconProps as any,
  emits: [
    "click",
    "dblclick",
    "mouseenter",
    "mouseleave",
    "focus",
    "blur",
    "load-start",
    "load-success",
    "load-error",
    "load-complete",
    "animation-start",
    "animation-end",
  ],
  setup(props: IconProps, { slots, emit, expose }: any) {
    // 响应式状态
    const elementRef = useTemplateRef<HTMLElement | SVGElement>("iconRef");
    const loading = ref(false);
    const error = ref(false);
    const loaded = ref(false);
    const iconData = ref<any>(null);
    const currentAnimation = ref<IconAnimation | null>(null);
    const animationTimer = ref<number | null>(null);

    // 生成唯一ID
    const iconId = generateId("xh-icon-");

    // 计算属性
    const actualSize = computed(() => {
      if (isNumber(props.size)) {
        return `${props.size}px`;
      }
      if (isString(props.size) && /^\d+$/.test(props.size)) {
        return `${props.size}px`;
      }
      return props.size;
    });

    const sizeClass = computed(() => {
      const sizeMap = {
        tiny: "12px",
        small: "16px",
        medium: "20px",
        large: "24px",
        huge: "32px",
      };
      return sizeMap[props.size as keyof typeof sizeMap] || props.size;
    });

    const iconClasses = computed(() => {
      const classes = [props.prefix];

      if (isString(props.size) && ["tiny", "small", "medium", "large", "huge"].includes(props.size)) {
        classes.push(`${props.prefix}--${props.size}`);
      }

      if (props.type && props.type !== "default") {
        classes.push(`${props.prefix}--${props.type}`);
      }

      if (props.animation) {
        classes.push(`${props.prefix}--${props.animation}`);
      }

      if (props.speed && props.speed !== "normal") {
        classes.push(`${props.prefix}--${props.speed}`);
      }

      if (props.flip) {
        classes.push(`${props.prefix}--flip-${props.flip}`);
      }

      if (props.disabled) {
        classes.push(`${props.prefix}--disabled`);
      }

      if (props.clickable) {
        classes.push(`${props.prefix}--clickable`);
      }

      if (props.hover) {
        classes.push(`${props.prefix}--hover`);
      }

      if (props.inverse) {
        classes.push(`${props.prefix}--inverse`);
      }

      if (loading.value) {
        classes.push(`${props.prefix}--loading`);
      }

      if (error.value) {
        classes.push(`${props.prefix}--error`);
      }

      return classes;
    });

    const iconStyles = computed(() => {
      const styles: Record<string, any> = {};

      // 尺寸
      if (props.width) {
        styles.width = isNumber(props.width) ? `${props.width}px` : props.width;
      } else if (actualSize.value) {
        styles.width = actualSize.value;
      }

      if (props.height) {
        styles.height = isNumber(props.height) ? `${props.height}px` : props.height;
      } else if (actualSize.value) {
        styles.height = actualSize.value;
      }

      // 颜色
      if (props.color) {
        styles.color = props.color;
        styles.fill = props.color;
      }

      // 旋转
      if (props.rotate && props.rotate !== 0) {
        styles.transform = `rotate(${props.rotate}deg)`;
      }

      // 缩放
      if (props.scale && props.scale !== 1) {
        const currentTransform = styles.transform || "";
        styles.transform = `${currentTransform} scale(${props.scale})`.trim();
      }

      // 合并用户自定义样式
      if (props.style) {
        if (isString(props.style)) {
          // 解析字符串样式
          const userStyles = props.style.split(";").reduce(
            (acc: Record<string, string>, style: string) => {
              const [key, value] = style.split(":").map((s: string) => s.trim());
              if (key && value) {
                acc[key] = value;
              }
              return acc;
            },
            {} as Record<string, string>,
          );
          Object.assign(styles, userStyles);
        } else {
          Object.assign(styles, props.style);
        }
      }

      return styles;
    });

    // 加载图标数据
    const loadIconData = async () => {
      if (!props.name && !props.src && !props.svg) {
        return;
      }

      loading.value = true;
      error.value = false;
      emit("load-start");

      try {
        let data: any = null;

        if (props.svg) {
          // 直接使用 SVG 内容
          data = { raw: props.svg, type: "svg" };
        } else if (props.src) {
          // 从 URL 加载
          if (props.mode === "img") {
            data = { src: props.src, type: "img" };
          } else {
            const response = await fetch(props.src);
            if (!response.ok) {
              throw new Error(`Failed to load icon from ${props.src}`);
            }
            const content = await response.text();
            data = { raw: content, type: "svg" };
          }
        } else if (props.name) {
          // 从图标库加载
          data = await iconLoader.load(props.name);
        }

        iconData.value = data;
        loaded.value = true;
        emit("load-success", data);
      } catch (err) {
        error.value = true;
        logger.error("Failed to load icon:", err);
        emit("load-error", err as Error);

        // 尝试加载回退图标
        if (props.fallback && props.fallback !== props.name) {
          try {
            const fallbackData = await iconLoader.load(props.fallback);
            iconData.value = fallbackData;
            loaded.value = true;
          } catch (fallbackErr) {
            logger.error("Failed to load fallback icon:", fallbackErr);
          }
        }
      } finally {
        loading.value = false;
        emit("load-complete");
      }
    };

    // 防抖的加载函数
    const debouncedLoad = debounceFn(loadIconData, 100);

    // 监听属性变化
    watch(
      [() => props.name, () => props.src, () => props.svg],
      () => {
        if (props.lazy) {
          // 懒加载模式下，等待元素进入视口
          return;
        }
        debouncedLoad();
      },
      { immediate: true },
    );

    // 懒加载实现
    const setupLazyLoading = () => {
      if (!props.lazy || !elementRef.value) return;

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              loadIconData();
              observer.disconnect();
            }
          });
        },
        { threshold: 0.1 },
      );

      observer.observe(elementRef.value);
    };

    // 动画控制
    const playAnimation = (animation: IconAnimation, duration?: number) => {
      if (!elementRef.value) return;

      currentAnimation.value = animation;
      addClass(elementRef.value as HTMLElement, `${props.prefix}--${animation}`);
      emit("animation-start", animation);

      if (duration) {
        animationTimer.value = window.setTimeout(() => {
          stopAnimation();
        }, duration);
      }
    };

    const stopAnimation = () => {
      if (!elementRef.value || !currentAnimation.value) return;

      removeClass(elementRef.value as HTMLElement, `${props.prefix}--${currentAnimation.value}`);
      emit("animation-end", currentAnimation.value);
      currentAnimation.value = null;

      if (animationTimer.value) {
        clearTimeout(animationTimer.value);
        animationTimer.value = null;
      }
    };

    // 事件处理
    const handleClick = (event: MouseEvent) => {
      if (props.disabled) return;
      emit("click", event);
    };

    const handleDblClick = (event: MouseEvent) => {
      if (props.disabled) return;
      emit("dblclick", event);
    };

    const handleMouseEnter = (event: MouseEvent) => {
      emit("mouseenter", event);
    };

    const handleMouseLeave = (event: MouseEvent) => {
      emit("mouseleave", event);
    };

    const handleFocus = (event: FocusEvent) => {
      emit("focus", event);
    };

    const handleBlur = (event: FocusEvent) => {
      emit("blur", event);
    };

    // 渲染函数
    const renderSVGIcon = () => {
      if (!iconData.value) return null;

      if (iconData.value.type === "img") {
        return (
          <img
            src={iconData.value.src}
            alt={props.title || props.description}
            style={iconStyles.value}
            {...props.attrs}
          />
        );
      }

      // 使用 IconBase 组件渲染 SVG
      if (props.name && listIcons()[props.name]) {
        return (
          <IconBase
            name={props.name}
            title={props.title}
            scale={props.scale}
            animation={props.animation}
            flip={props.flip}
            speed={props.speed}
            hover={props.hover}
            inverse={props.inverse}
            style={iconStyles.value}
            {...props.attrs}
          />
        );
      }

      // 直接渲染 SVG 内容
      if (iconData.value.raw) {
        return <div innerHTML={iconData.value.raw} style={iconStyles.value} {...props.attrs} />;
      }

      return null;
    };

    const renderLoadingState = () => {
      if (slots.loading) {
        return slots.loading();
      }
      return (
        <div class={`${props.prefix}__loading`}>
          <svg class={`${props.prefix}__spinner`} viewBox="0 0 24 24" style={iconStyles.value}>
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              stroke-dasharray="31.416"
              stroke-dashoffset="31.416"
            />
          </svg>
        </div>
      );
    };

    const renderErrorState = () => {
      if (slots.error) {
        return slots.error();
      }
      return (
        <div class={`${props.prefix}__error`}>
          <svg viewBox="0 0 24 24" style={iconStyles.value}>
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="currentColor"
            />
          </svg>
        </div>
      );
    };

    const renderPlaceholder = () => {
      if (slots.placeholder) {
        return slots.placeholder();
      }
      if (props.placeholder) {
        return <div class={`${props.prefix}__placeholder`}>{props.placeholder}</div>;
      }
      return null;
    };

    // 生命周期
    onMounted(() => {
      if (props.lazy) {
        nextTick(() => {
          setupLazyLoading();
        });
      }

      // 自动播放动画
      if (props.animation) {
        nextTick(() => {
          playAnimation(props.animation!);
        });
      }
    });

    onUnmounted(() => {
      if (animationTimer.value) {
        clearTimeout(animationTimer.value);
      }
    });

    // 暴露实例方法
    const instance: IconInstance = {
      get $el() {
        return elementRef.value!;
      },
      getState() {
        return {
          loading: loading.value,
          error: error.value,
          loaded: loaded.value,
          name: props.name,
          size: props.size,
          color: props.color,
        };
      },
      reset() {
        loading.value = false;
        error.value = false;
        loaded.value = false;
        iconData.value = null;
        stopAnimation();
      },
      async reload() {
        instance.reset();
        await loadIconData();
      },
      getIconData() {
        return iconData.value;
      },
      setColor(color: string) {
        if (elementRef.value) {
          elementRef.value.style.color = color;
          elementRef.value.style.fill = color;
        }
      },
      setSize(size: IconSize) {
        if (elementRef.value) {
          const sizeValue = isNumber(size) ? `${size}px` : size;
          elementRef.value.style.width = sizeValue;
          elementRef.value.style.height = sizeValue;
        }
      },
      playAnimation,
      stopAnimation,
    };

    expose(instance);

    // 渲染
    return () => {
      const Tag = props.clickable ? "button" : "span";

      return (
        <Tag
          ref={elementRef}
          id={iconId}
          class={[iconClasses.value, props.class]}
          style={iconStyles.value}
          role={props.clickable ? "button" : "img"}
          aria-label={props.title || props.description}
          aria-hidden={!props.title && !props.description}
          tabindex={props.clickable && !props.disabled ? 0 : -1}
          onClick={handleClick}
          onDblclick={handleDblClick}
          onMouseenter={handleMouseEnter}
          onMouseleave={handleMouseLeave}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props.attrs}
        >
          {loading.value && renderLoadingState()}
          {error.value && renderErrorState()}
          {!loading.value && !error.value && !loaded.value && renderPlaceholder()}
          {!loading.value && !error.value && loaded.value && (slots.default?.() || renderSVGIcon())}
          {props.title && <title>{props.title}</title>}
          {props.description && <desc>{props.description}</desc>}
        </Tag>
      );
    };
  },
});
