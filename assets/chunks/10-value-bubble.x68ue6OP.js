const n=`<!-- 拖动时的值气泡 | thumb 自己是定位上下文，气泡挂在它上方就跟着走位；dragging 决定露不露面，气泡里的文字由作者的格式化函数产出 -->
<xh-slider
  id="slider-budget"
  default-value="1800"
  min="0"
  max="5000"
  step="50"
  name="budget"
>
  <div data-xh-part="root" style="inline-size: 320px; --xh-slider-gap: 32px">
    <label data-xh-part="label">
      预算上限：<span id="slider-budget-label">¥1,800</span>
    </label>
    <div data-xh-part="control">
      <div data-xh-part="track">
        <div data-xh-part="range"></div>
      </div>
      <div data-xh-part="thumb">
        <span
          id="slider-budget-bubble"
          style="
            display: none;
            position: absolute;
            inset-block-end: 100%;
            inset-inline-start: 50%;
            transform: translateX(-50%);
            margin-block-end: 8px;
            padding: 2px 8px;
            border-radius: var(--xh-shape-control);
            background: var(--xh-bg-brand);
            color: var(--xh-fg-on-brand);
            font-size: 11px;
            line-height: 18px;
            white-space: nowrap;
            pointer-events: none;
          "
          >¥1,800</span
        >
        <input data-xh-part="hidden-input" />
      </div>
    </div>
  </div>
</xh-slider>

<script type="module">
  const slider = document.getElementById("slider-budget");
  const thumb = slider.querySelector('[data-xh-part="thumb"]');
  const bubble = document.getElementById("slider-budget-bubble");
  const label = document.getElementById("slider-budget-label");

  const money = (value) => \`¥\${value.toLocaleString("zh-CN")}\`;

  // 读屏走 aria-valuetext，与可见气泡各念各的同一个值
  slider.getValueText = ({ value }) => money(value);

  slider.addEventListener("value-change", (event) => {
    const text = money(event.detail.value[0]);
    label.textContent = text;
    bubble.textContent = text;
  });

  // 拖动态写在拇指上，气泡照它露不露面
  new MutationObserver(() => {
    bubble.style.display = thumb.hasAttribute("data-dragging") ? "" : "none";
  }).observe(thumb, { attributes: true, attributeFilter: ["data-dragging"] });
<\/script>
`;export{n as default};
