var e=`<!-- 内容懒挂载 | 条目多、内容重时 lazyMount 让每个条目第一次展开才挂载内容；再加 unmountOnExit 即只有展开着的条目挂着内容 -->
<!-- 自定义元素的面板内容写在 <template> 中：解析时不实例化，第一次展开才克隆出来 -->
<div style="width: 100%; max-width: 420px">
  <xh-accordion collapsible lazy-mount unmount-on-exit>
    <div data-xh-part="root">
      <div data-xh-part="item" value="q1">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>第 1 季度报告</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">
          <template>第 1 季度的明细在第一次展开时才渲染，收起动画播完即卸载。</template>
        </div>
      </div>
      <div data-xh-part="item" value="q2">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>第 2 季度报告</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">
          <template>第 2 季度的明细在第一次展开时才渲染，收起动画播完即卸载。</template>
        </div>
      </div>
      <div data-xh-part="item" value="q3">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>第 3 季度报告</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">
          <template>第 3 季度的明细在第一次展开时才渲染，收起动画播完即卸载。</template>
        </div>
      </div>
      <div data-xh-part="item" value="q4">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>第 4 季度报告</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">
          <template>第 4 季度的明细在第一次展开时才渲染，收起动画播完即卸载。</template>
        </div>
      </div>
      <div data-xh-part="item" value="q5">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>第 5 季度报告</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">
          <template>第 5 季度的明细在第一次展开时才渲染，收起动画播完即卸载。</template>
        </div>
      </div>
      <div data-xh-part="item" value="q6">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>第 6 季度报告</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">
          <template>第 6 季度的明细在第一次展开时才渲染，收起动画播完即卸载。</template>
        </div>
      </div>
    </div>
  </xh-accordion>
</div>
`;export{e as default};