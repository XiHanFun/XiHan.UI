const n=`<!-- 图标由作者塞 | 库不带插画资产，图标位收任意内容：字形、图标组件、手写的内联 svg 都行 -->
<div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px">
  <!-- 一个字形 -->
  <xh-result status="success" size="sm">
    <div data-xh-part="root" style="inline-size: 200px">
      <span data-xh-part="icon"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5L9.5 18L20 6"/></svg></span>
      <p data-xh-part="title">字形</p>
      <p data-xh-part="description">字号跟着图标框走。</p>
    </div>
  </xh-result>

  <!-- 一枚图标元素，不写 tone，颜色从结果的语气色继承下来 -->
  <xh-result status="success" size="sm">
    <div data-xh-part="root" style="inline-size: 200px">
      <span data-xh-part="icon">
        <xh-icon id="result-icon-check" size="lg">
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
      <p data-xh-part="title">图标组件</p>
      <p data-xh-part="description">记录传给图标元素，颜色继承下来。</p>
    </div>
  </xh-result>

  <!-- 手写内联 svg，同样取 currentColor -->
  <xh-result status="success" size="sm">
    <div data-xh-part="root" style="inline-size: 200px">
      <span data-xh-part="icon">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M4 12.5L9 17.5L20 6.5" />
        </svg>
      </span>
      <p data-xh-part="title">内联 svg</p>
      <p data-xh-part="description">自己写的图形也照样收。</p>
    </div>
  </xh-result>
</div>

<script type="module">
  // 图标记录是对象，只走 property
  document.getElementById("result-icon-check").icon = {
    name: "check-circle",
    viewBox: "0 0 24 24",
    attrs: {
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    nodes: [
      { tag: "circle", attrs: { cx: "12", cy: "12", r: "9" } },
      { tag: "path", attrs: { d: "M8 12.5L11 15.5L16 9" } },
    ],
  };
<\/script>
`;export{n as default};
