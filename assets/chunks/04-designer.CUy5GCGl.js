var e=`<!-- 调音台 | 配方是纯数据：调参、试听、把代码复制进项目，中间没有任何音频文件 -->
<div id="sound-designer" style="display: flex; flex-direction: column; gap: 16px; width: 100%">
  <xh-radio-group id="sound-designer-wave" default-value="triangle" name="sound-wave">
    <div data-xh-part="root">
      <span data-xh-part="label">波形</span>
      <div data-xh-part="item" value="sine">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">sine</span>
      </div>
      <div data-xh-part="item" value="triangle">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">triangle</span>
      </div>
      <div data-xh-part="item" value="square">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">square</span>
      </div>
      <div data-xh-part="item" value="sawtooth">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">sawtooth</span>
      </div>
    </div>
  </xh-radio-group>

  <div
    style="
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 10px 20px;
    "
  >
    <xh-slider data-param="from" default-value="880" min="80" max="2400" step="10">
      <div data-xh-part="root">
        <label data-xh-part="label">起始 <span data-value>880</span>Hz</label>
        <div data-xh-part="control">
          <div data-xh-part="track"><div data-xh-part="range"></div></div>
          <div data-xh-part="thumb"></div>
        </div>
      </div>
    </xh-slider>
    <xh-slider data-param="to" default-value="1320" min="80" max="2400" step="10">
      <div data-xh-part="root">
        <label data-xh-part="label">终止 <span data-value>1320</span>Hz</label>
        <div data-xh-part="control">
          <div data-xh-part="track"><div data-xh-part="range"></div></div>
          <div data-xh-part="thumb"></div>
        </div>
      </div>
    </xh-slider>
    <xh-slider data-param="attack" default-value="5" min="1" max="80" step="1">
      <div data-xh-part="root">
        <label data-xh-part="label">起音 <span data-value>5</span>ms</label>
        <div data-xh-part="control">
          <div data-xh-part="track"><div data-xh-part="range"></div></div>
          <div data-xh-part="thumb"></div>
        </div>
      </div>
    </xh-slider>
    <xh-slider data-param="decay" default-value="180" min="20" max="900" step="10">
      <div data-xh-part="root">
        <label data-xh-part="label">衰减 <span data-value>180</span>ms</label>
        <div data-xh-part="control">
          <div data-xh-part="track"><div data-xh-part="range"></div></div>
          <div data-xh-part="thumb"></div>
        </div>
      </div>
    </xh-slider>
    <xh-slider data-param="peak" default-value="0.3" min="0.05" max="0.6" step="0.05">
      <div data-xh-part="root">
        <label data-xh-part="label">峰值 <span data-value>0.3</span></label>
        <div data-xh-part="control">
          <div data-xh-part="track"><div data-xh-part="range"></div></div>
          <div data-xh-part="thumb"></div>
        </div>
      </div>
    </xh-slider>
    <xh-slider data-param="space" default-value="0.15" min="0" max="0.6" step="0.05">
      <div data-xh-part="root">
        <label data-xh-part="label">空间 <span data-value>0.15</span></label>
        <div data-xh-part="control">
          <div data-xh-part="track"><div data-xh-part="range"></div></div>
          <div data-xh-part="thumb"></div>
        </div>
      </div>
    </xh-slider>
  </div>

  <div>
    <xh-button id="sound-designer-play" variant="solid">
      <button data-xh-part="root">试听</button>
    </xh-button>
  </div>

  <pre
    id="sound-designer-code"
    data-xh-scroll
    style="
      margin: 0;
      padding: 12px 14px;
      border-radius: var(--xh-shape-surface);
      background: var(--xh-bg-subtle);
      font-size: 12px;
      line-height: 1.6;
      overflow-x: auto;
    "
  ></pre>
</div>

<script type="module">
  import { createSoundPlayer, glide, strike } from "@xihan-ui/sound";

  const root = document.getElementById("sound-designer");
  const player = createSoundPlayer();

  // 每个滑块按自己的 data-param 写回同名参数，标签里的读数跟着滑块走；滑块的值恒为数组，单滑块只有一项
  const params = { wave: "triangle" };
  for (const slider of root.querySelectorAll("xh-slider")) {
    const key = slider.dataset.param;
    const text = slider.querySelector("[data-value]");
    params[key] = Number(slider.getAttribute("default-value"));
    slider.addEventListener("value-change", (event) => {
      params[key] = event.detail.value[0];
      text.textContent = params[key];
      render();
    });
  }
  document.getElementById("sound-designer-wave").addEventListener("value-change", (event) => {
    params.wave = event.detail.value;
    render();
  });

  const seconds = () => Math.max(0.01, params.decay / 1000);

  // 配方是纯数据：试听播的与下面那段代码是同一组数
  function spec() {
    return {
      layers: [
        {
          kind: "oscillator",
          wave: params.wave,
          frequency: glide(params.from, params.to, seconds()),
          gain: strike(params.peak, params.attack / 1000, seconds()),
        },
      ],
      space: params.space,
    };
  }

  function render() {
    document.getElementById("sound-designer-code").textContent = \`sound.play({
  layers: [
    {
      kind: 'oscillator',
      wave: '\${params.wave}',
      frequency: glide(\${params.from}, \${params.to}, \${seconds().toFixed(3)}),
      gain: strike(\${params.peak}, \${(params.attack / 1000).toFixed(3)}, \${seconds().toFixed(3)}),
    },
  ],
  space: \${params.space},
})\`;
  }
  render();

  document.getElementById("sound-designer-play").addEventListener("click", () => player.play(spec()));
<\/script>
`;export{e as default};