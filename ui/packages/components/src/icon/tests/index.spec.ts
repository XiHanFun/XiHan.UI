import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import Icon from "../src/Icon";

describe("Icon", () => {
  it("should render correctly", () => {
    const wrapper = mount(Icon);
    expect(wrapper.find(".xh-icon").exists()).toBe(true);
  });

  it("should match snapshot", () => {
    const wrapper = mount(Icon);
    expect(wrapper.html()).toMatchSnapshot();
  });
});
