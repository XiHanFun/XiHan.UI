const e=`<!-- 离散档位 | 可选值不必是等距数值：让滑块在档位下标上走，宿主再把下标映射回自己的取值表，键盘与拖动都只落在档位上 -->
<div style="inline-size: 320px; display: grid; gap: 12px">
  <xh-slider
    id="slider-levels"
    default-value="2"
    min="0"
    max="5"
    step="1"
    large-step="1"
  >
    <div data-xh-part="root">
      <label data-xh-part="label">
        每页 <span id="slider-levels-current">10</span> 条
      </label>
      <div data-xh-part="control">
        <div data-xh-part="track">
          <div data-xh-part="range"></div>
        </div>
        <div data-xh-part="thumb">
          <input data-xh-part="hidden-input" />
        </div>
      </div>
    </div>
  </xh-slider>

  <span style="font-size: 12px; color: var(--xh-fg-muted)">
    可选：1 / 5 / 10 / 50 / 100 / 500
  </span>
</div>

<script type="module">
  // 滑块走的是档位下标，取值表由宿主自己映射回来
  const levels = [1, 5, 10, 50, 100, 500];
  const slider = document.getElementById("slider-levels");
  const current = document.getElementById("slider-levels-current");

  slider.getValueText = ({ value }) => \`每页 \${levels[value]} 条\`;

  slider.addEventListener("value-change", (event) => {
    current.textContent = levels[event.detail.value[0]];
  });
<\/script>
`;export{e as default};
