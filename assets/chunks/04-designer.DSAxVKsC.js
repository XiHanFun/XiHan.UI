const n=`<!-- 调音台 | 配方是纯数据：调参、试听、把代码复制进项目，中间没有任何音频文件 -->
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
    <label style="display: flex; align-items: center; gap: 8px">
      <span style="width: 76px">起始 <output for="sound-designer-from">880</output>Hz</span>
      <input id="sound-designer-from" name="from" type="range" min="80" max="2400" step="10" value="880" />
    </label>
    <label style="display: flex; align-items: center; gap: 8px">
      <span style="width: 76px">终止 <output for="sound-designer-to">1320</output>Hz</span>
      <input id="sound-designer-to" name="to" type="range" min="80" max="2400" step="10" value="1320" />
    </label>
    <label style="display: flex; align-items: center; gap: 8px">
      <span style="width: 76px">起音 <output for="sound-designer-attack">5</output>ms</span>
      <input id="sound-designer-attack" name="attack" type="range" min="1" max="80" step="1" value="5" />
    </label>
    <label style="display: flex; align-items: center; gap: 8px">
      <span style="width: 76px">衰减 <output for="sound-designer-decay">180</output>ms</span>
      <input id="sound-designer-decay" name="decay" type="range" min="20" max="900" step="10" value="180" />
    </label>
    <label style="display: flex; align-items: center; gap: 8px">
      <span style="width: 76px">峰值 <output for="sound-designer-peak">0.3</output></span>
      <input id="sound-designer-peak" name="peak" type="range" min="0.05" max="0.6" step="0.05" value="0.3" />
    </label>
    <label style="display: flex; align-items: center; gap: 8px">
      <span style="width: 76px">空间 <output for="sound-designer-space">0.15</output></span>
      <input id="sound-designer-space" name="space" type="range" min="0" max="0.6" step="0.05" value="0.15" />
    </label>
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
      border-radius: 8px;
      background: var(--vp-c-bg-soft);
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

  // 每个滑块按自己的 name 写回同名参数，读数跟着滑块走
  const params = { wave: "triangle" };
  for (const slider of root.querySelectorAll("input[type=range]")) {
    params[slider.name] = Number(slider.value);
    slider.addEventListener("input", () => {
      params[slider.name] = Number(slider.value);
      root.querySelector(\`output[for="\${slider.id}"]\`).textContent = slider.value;
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
`;export{n as default};
