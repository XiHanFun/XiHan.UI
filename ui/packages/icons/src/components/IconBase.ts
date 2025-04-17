import { generateId, assert, escapeHtml } from "@xihan-ui/utils";
import { defineComponent, h, ref, computed, reactive, toRefs, onMounted, onUpdated } from "vue";
import type { ObjType, IconTypeCustomized } from "./type";

type IconsTypeCustom = {
  [key: string]: IconTypeCustomized;
};

const icons: IconsTypeCustom = {};

/**
 * 注册图标
 * @param data - 图标数据
 */
const register = (data: IconTypeCustomized): void => {
  const { name, paths = [], d, polygons = [], points } = data;

  if (d) paths.push({ d });
  if (points) polygons.push({ points });

  icons[name] = Object.assign({}, data, {
    paths,
    polygons,
  });

  if (!icons[name].minX) icons[name].minX = 0;
  if (!icons[name].minY) icons[name].minY = 0;
};

/**
 * 添加图标
 * @param data - 图标数据
 */
export const addIcons = (...data: IconTypeCustomized[]): void => {
  for (const icon of data) register(icon);
};

/**
 * 获取所有图标
 * @returns 所有图标
 */
export const listIcons = (): IconsTypeCustom => {
  return icons;
};

/**
 * 图标基础组件
 */
export const IconBase = defineComponent({
  name: "IconBase",
  props: {
    // 图标名称
    name: {
      type: String,
      required: true,
      validator: (val: string): boolean => {
        assert(
          !val || !(val in icons),
          `无效的属性。属性 "name" 引用了未注册的图标 "${val}"，请确保在使用此图标之前已导入。`,
        );
        return true;
      },
    },
    // 图标标题
    title: String,
    // 图标填充颜色
    fill: String,
    // 图标缩放比例
    scale: {
      type: [Number, String],
      default: 1,
    },
    // 图标动画
    animation: {
      validator: (val: string): boolean => {
        assert(
          ["spin", "spin-pulse", "wrench", "ring", "pulse", "flash", "float"].includes(val),
          "无效的属性。属性 'animation' 应该是一个 'spin'、'spin-pulse'、'wrench'、'ring'、'pulse'、'flash' 或 'float'。",
        );
        return true;
      },
    },
    // 图标悬停
    hover: Boolean,
    // 图标翻转
    flip: {
      validator: (val: string): boolean => {
        assert(
          ["horizontal", "vertical", "both"].includes(val),
          "无效的属性。属性 'flip' 应该是一个 'horizontal'、'vertical' 或 'both'。",
        );
        return true;
      },
    },
    // 图标速度
    speed: {
      validator: (val: string): boolean => {
        assert(val === "fast" || val === "slow", "无效的属性。属性 'speed' 应该是一个 'fast' 或 'slow'。");
        return true;
      },
    },
    // 图标标签
    label: String,
    // 图标反转
    inverse: Boolean,
  },
  setup(props) {
    const children = ref([] as any[]);

    const state = reactive({
      outerScale: 1.2,
      x: null as number | null,
      y: null as number | null,
    });

    const childrenState = reactive({
      width: 0,
      height: 0,
    });

    const normalizedScale = computed(() => {
      const scale = Number(props.scale);
      assert(isNaN(scale) || scale <= 0, "无效的属性。属性 'scale' 应该是一个大于 0 的数字。");
      return scale * state.outerScale;
    });

    const klass = computed(() => {
      const classes = {
        "xh-icon": true,
        "xh-icon-inverse": props.inverse,
        "xh-icon-flip-horizontal": props.flip === "horizontal",
        "xh-icon-flip-vertical": props.flip === "vertical",
        "xh-icon-flip-both": props.flip === "both",
        "xh-icon-spin": props.animation === "spin",
        "xh-icon-spin-pulse": props.animation === "spin-pulse",
        "xh-icon-wrench": props.animation === "wrench",
        "xh-icon-ring": props.animation === "ring",
        "xh-icon-pulse": props.animation === "pulse",
        "xh-icon-flash": props.animation === "flash",
        "xh-icon-float": props.animation === "float",
        "xh-icon-hover": props.hover,
        "xh-icon-fast": props.speed === "fast",
        "xh-icon-slow": props.speed === "slow",
      };
      return classes;
    });

    const icon = computed((): IconTypeCustomized | null => {
      if (props.name) return icons[props.name];
      return null;
    });

    const box = computed((): string => {
      if (icon.value) {
        return `${icon.value.minX} ${icon.value.minY} ${icon.value.width} ${icon.value.height}`;
      }
      return `0 0 ${width.value} ${height.value}`;
    });

    const ratio = computed((): number => {
      if (!icon.value) return 1;

      const { width, height } = icon.value;
      return Math.max(width, height) / 16;
    });

    const width = computed((): number => {
      return childrenState.width || (icon.value && (icon.value.width / ratio.value) * normalizedScale.value) || 0;
    });

    const height = computed((): number => {
      return childrenState.height || (icon.value && (icon.value.height / ratio.value) * normalizedScale.value) || 0;
    });

    const style = computed(() => {
      if (normalizedScale.value === 1) return false;
      return {
        fontSize: normalizedScale.value + "em",
      };
    });

    const raw = computed((): string | null => {
      // 为每个图标 SVG 元素生成唯一的 ID
      if (!icon.value || !icon.value.raw) return null;

      const ids: { [key: string]: string } = {};
      let raw = icon.value.raw;

      raw = raw.replace(/\s(?:xml:)?id=(["']?)([^"')\s]+)\1/g, (match: any, quote: string, id: string) => {
        const uniqueId = generateId("xh-icon-");
        ids[id] = uniqueId;
        return ` id="${uniqueId}"`;
      });
      raw = raw.replace(
        /#(?:([^'")\s]+)|xpointer\(id\((['"]?)([^')]+)\2\)\))/g,
        (match: any, rawId: string, _: string, pointerId: string) => {
          const id = rawId || pointerId;
          if (!id || !ids[id]) return match;
          return `#${ids[id]}`;
        },
      );
      return raw;
    });

    const attribs = computed((): any => {
      if (!icon.value || !icon.value.attr) return {};
      return icon.value.attr;
    });

    const updateStack = () => {
      assert(!props.name && props.name !== null && children.value.length === 0, "无效的属性。属性 'name' 是必需的。");

      if (icon.value) return;

      let width = 0,
        height = 0;

      children.value.forEach((child: any) => {
        child.outerScale = normalizedScale.value;

        width = Math.max(width, child.width);
        height = Math.max(height, child.height);
      });

      childrenState.width = width;
      childrenState.height = height;

      children.value.forEach((child: any) => {
        child.x = (width - child.width) / 2;
        child.y = (height - child.height) / 2;
      });
    };

    onMounted(() => {
      updateStack();
    });

    onUpdated(() => {
      updateStack();
    });

    return {
      ...toRefs(state),
      children,
      icon,
      klass,
      style,
      width,
      height,
      box,
      attribs,
      raw,
    };
  },

  created() {
    const parent = this.$parent as any;
    if (parent && parent.children) parent.children.push(this);
  },

  render() {
    const attrs = Object.assign(
      {
        role: this.$attrs.role || (this.label || this.title ? "img" : null),
        "aria-label": this.label || null,
        "aria-hidden": !(this.label || this.title),
        width: this.width,
        height: this.height,
        viewBox: this.box,
      },
      this.attribs,
    ) as any;

    if ((this.attribs as ObjType).stroke) attrs.stroke = this.fill ? this.fill : "currentColor";
    else attrs.fill = this.fill ? this.fill : "currentColor";

    if (this.x) attrs.x = (this.x as number).toString();
    if (this.y) attrs.y = (this.y as number).toString();

    let options = {
      class: this.klass,
      style: this.style,
    } as any;

    options = Object.assign(options, attrs);

    if (this.raw) {
      const html = this.title ? `<title>${escapeHtml(this.title)}</title>${this.raw}` : this.raw;

      options.innerHTML = html;
    }

    const content = this.title ? [h("title", this.title as string)] : ([] as any[]);

    const svgAttrs = (name: string, value: ObjType, i: number) => {
      return h(name, {
        ...value,
        key: `${name}-${i}`,
      });
    };

    return h(
      "svg",
      options,
      this.raw
        ? undefined
        : content.concat([
            this.$slots.default
              ? this.$slots.default()
              : this.icon
                ? [
                    ...((this.icon as IconTypeCustomized).paths as ObjType[]).map((path: ObjType, i: number) =>
                      svgAttrs("path", path, i),
                    ),
                    ...((this.icon as IconTypeCustomized).polygons as ObjType[]).map((polygon: ObjType, i: number) =>
                      svgAttrs("polygon", polygon, i),
                    ),
                  ]
                : [],
          ]),
    );
  },
});
