const t=`<!-- 内容懒挂载 | lazyMount 让内容第一次展开时才挂载，之后收起只隐藏；再加 unmountOnExit 即只在展开期间存在，收起动画播完就卸载，里面输入的内容再展开时已清空 -->
<!-- 自定义元素的内容写在 content 里的 <template> 中：解析时不实例化，第一次展开才克隆出来，卸载后再展开重新克隆 -->
<div style="width: 100%; max-width: 420px; display: grid; gap: 12px">
  <xh-collapsible lazy-mount>
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        第一次展开才挂载
        <span data-xh-part="indicator"></span>
      </button>
      <div data-xh-part="content">
        <template>
          <xh-text-field placeholder="输入后收起再展开，内容还在">
            <div data-xh-part="root">
              <label data-xh-part="label">备注</label>
              <div data-xh-part="control">
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-text-field>
        </template>
      </div>
    </div>
  </xh-collapsible>

  <xh-collapsible lazy-mount unmount-on-exit>
    <div data-xh-part="root">
      <button data-xh-part="trigger">
        只在展开期间存在
        <span data-xh-part="indicator"></span>
      </button>
      <div data-xh-part="content">
        <template>
          <xh-text-field placeholder="输入后收起再展开，内容已清空">
            <div data-xh-part="root">
              <label data-xh-part="label">草稿</label>
              <div data-xh-part="control">
                <input data-xh-part="input" />
              </div>
            </div>
          </xh-text-field>
        </template>
      </div>
    </div>
  </xh-collapsible>
</div>
`;export{t as default};
