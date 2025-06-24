import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import Button from "../src/Button";

describe("Button", () => {
  it("should render correctly", () => {
    const wrapper = mount(Button);
    expect(wrapper.find(".xh-button").exists()).toBe(true);
  });

  it("should match snapshot", () => {
    const wrapper = mount(Button);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it("should render with different types", () => {
    const types = ["default", "primary", "success", "warning", "error"] as const;
    types.forEach(type => {
      const wrapper = mount(Button, { props: { type } });
      expect(wrapper.classes()).toContain(`xh-button--${type}`);
    });
  });

  it("should render with different sizes", () => {
    const sizes = ["small", "medium", "large"] as const;
    sizes.forEach(size => {
      const wrapper = mount(Button, { props: { size } });
      expect(wrapper.classes()).toContain(`xh-button--${size}`);
    });
  });

  it("should render with different shapes", () => {
    const shapes = ["square", "round", "circle"] as const;
    shapes.forEach(shape => {
      const wrapper = mount(Button, { props: { shape } });
      expect(wrapper.classes()).toContain(`xh-button--${shape}`);
    });
  });

  it("should handle disabled state", () => {
    const wrapper = mount(Button, { props: { disabled: true } });
    expect(wrapper.attributes("disabled")).toBeDefined();
    expect(wrapper.classes()).toContain("is-disabled");
  });

  it("should handle loading state", () => {
    const wrapper = mount(Button, { props: { loading: true } });
    expect(wrapper.find(".xh-button__loading").exists()).toBe(true);
    expect(wrapper.classes()).toContain("is-loading");
  });

  it("should emit click event", async () => {
    const wrapper = mount(Button);
    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toBeTruthy();
  });

  it("should not emit click event when disabled", async () => {
    const wrapper = mount(Button, { props: { disabled: true } });
    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toBeFalsy();
  });

  it("should not emit click event when loading", async () => {
    const wrapper = mount(Button, { props: { loading: true } });
    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toBeFalsy();
  });

  it("should render default slot", () => {
    const wrapper = mount(Button, {
      slots: {
        default: "Button Text",
      },
    });
    expect(wrapper.text()).toBe("Button Text");
  });

  it("should render prefix and suffix slots", () => {
    const wrapper = mount(Button, {
      slots: {
        prefix: "Prefix",
        default: "Button Text",
        suffix: "Suffix",
      },
    });
    expect(wrapper.text()).toBe("PrefixButton TextSuffix");
  });

  it("should expose instance methods", () => {
    const wrapper = mount(Button);
    const vm = wrapper.vm as any;

    expect(vm.getState).toBeDefined();
    expect(vm.reset).toBeDefined();
    expect(vm.setLoading).toBeDefined();
    expect(vm.setDisabled).toBeDefined();
  });
});
