import { mount } from "@vue/test-utils";
import { h } from "vue";
import { describe, expect, it } from "vitest";
import Button from "../src/Button";
import ButtonGroup from "../src/ButtonGroup";

describe("Button.tsx", () => {
  // 基础渲染测试
  it("renders button correctly", () => {
    const wrapper = mount(Button, {
      slots: {
        default: "按钮",
      },
    });
    expect(wrapper.text()).toBe("按钮");
    expect(wrapper.classes()).toContain("xh-button");
  });

  // 按钮类型测试
  it("renders different types", () => {
    const types = ["primary", "success", "warning", "danger"] as const;
    types.forEach((type) => {
      const wrapper = mount(Button, { props: { type } });
      expect(wrapper.classes()).toContain(`xh-button--${type}`);
    });
  });

  // 按钮尺寸测试
  it("renders different sizes", () => {
    const sizes = ["small", "medium", "large"] as const;
    sizes.forEach((size) => {
      const wrapper = mount(Button, { props: { size } });
      expect(wrapper.classes()).toContain(`xh-button--${size}`);
    });
  });

  // 禁用状态测试
  it("disabled state works", async () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
    });
    expect(wrapper.classes()).toContain("is-disabled");
    expect(wrapper.attributes("disabled")).toBeDefined();
  });

  // 加载状态测试
  it("loading state works", () => {
    const wrapper = mount(Button, {
      props: { loading: true },
    });
    expect(wrapper.classes()).toContain("is-loading");
    expect(wrapper.find(".xh-button__loading-icon").exists()).toBe(true);
    expect(wrapper.attributes("disabled")).toBeDefined();
  });

  // 点击事件测试
  it("emits click event when not disabled or loading", async () => {
    const wrapper = mount(Button);
    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toBeTruthy();
  });

  it("does not emit click event when disabled", async () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
    });
    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toBeFalsy();
  });
});

describe("ButtonGroup.tsx", () => {
  // 按钮组基础渲染测试
  it("renders button group correctly", () => {
    const wrapper = mount(ButtonGroup, {
      slots: {
        default: [
          h(Button, {}, { default: () => "按钮1" }),
          h(Button, {}, { default: () => "按钮2" }),
        ],
      },
    });
    expect(wrapper.classes()).toContain("xh-button-group");
    expect(wrapper.findAll(".xh-button")).toHaveLength(2);
  });

  // 按钮组尺寸传递测试
  it("passes size prop to child buttons", () => {
    const wrapper = mount(ButtonGroup, {
      props: { size: "small" },
      slots: {
        default: h(Button),
      },
    });
    expect(wrapper.find(".xh-button").classes()).toContain("xh-button--small");
  });
});
