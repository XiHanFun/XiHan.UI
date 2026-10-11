var e=`<!-- 错开起播 | 一组元素依次进场，起点可以从头、从尾或从中间；文字拆开即为一组元素 -->
<div style="display: flex; flex-direction: column; gap: var(--xh-space-4); width: 100%">
  <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: var(--xh-space-5)">
    <xh-radio-group id="animations-stagger-from" default-value="first" name="stagger-from">
      <div data-xh-part="root">
        <span data-xh-part="label">起点</span>
        <div data-xh-part="item" value="first">
          <input data-xh-part="hidden-input" />
          <span data-xh-part="indicator"></span>
          <span data-xh-part="item-text">从头</span>
        </div>
        <div data-xh-part="item" value="last">
          <input data-xh-part="hidden-input" />
          <span data-xh-part="indicator"></span>
          <span data-xh-part="item-text">从尾</span>
        </div>
        <div data-xh-part="item" value="center">
          <input data-xh-part="hidden-input" />
          <span data-xh-part="indicator"></span>
          <span data-xh-part="item-text">从中间</span>
        </div>
      </div>
    </xh-radio-group>
    <xh-slider id="animations-stagger-gap" default-value="60" min="0" max="200" step="10">
      <div data-xh-part="root" style="inline-size: var(--xh-control-w)">
        <label data-xh-part="label">
          间隔 <span id="animations-stagger-gap-text">60</span>ms
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
  </div>

  <div style="display: flex; gap: var(--xh-space-2)">
    <xh-button id="animations-stagger-play-list" size="sm">
      <button data-xh-part="root">播列表</button>
    </xh-button>
    <xh-button id="animations-stagger-play-title" size="sm" variant="outline">
      <button data-xh-part="root">播标题</button>
    </xh-button>
  </div>

  <h3 id="animations-stagger-title" style="margin: 0; font-size: var(--xh-font-size-2xl)">曦寒 UI 动画层</h3>

  <div id="animations-stagger-list" style="display: flex; flex-wrap: wrap; gap: var(--xh-space-2)">
    <div style="display: grid; place-items: center; width: calc(2 * var(--xh-space-6)); height: calc(2 * var(--xh-space-6)); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); font-weight: var(--xh-font-weight-semibold)">1</div>
    <div style="display: grid; place-items: center; width: calc(2 * var(--xh-space-6)); height: calc(2 * var(--xh-space-6)); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); font-weight: var(--xh-font-weight-semibold)">2</div>
    <div style="display: grid; place-items: center; width: calc(2 * var(--xh-space-6)); height: calc(2 * var(--xh-space-6)); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); font-weight: var(--xh-font-weight-semibold)">3</div>
    <div style="display: grid; place-items: center; width: calc(2 * var(--xh-space-6)); height: calc(2 * var(--xh-space-6)); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); font-weight: var(--xh-font-weight-semibold)">4</div>
    <div style="display: grid; place-items: center; width: calc(2 * var(--xh-space-6)); height: calc(2 * var(--xh-space-6)); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); font-weight: var(--xh-font-weight-semibold)">5</div>
    <div style="display: grid; place-items: center; width: calc(2 * var(--xh-space-6)); height: calc(2 * var(--xh-space-6)); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); font-weight: var(--xh-font-weight-semibold)">6</div>
    <div style="display: grid; place-items: center; width: calc(2 * var(--xh-space-6)); height: calc(2 * var(--xh-space-6)); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); font-weight: var(--xh-font-weight-semibold)">7</div>
    <div style="display: grid; place-items: center; width: calc(2 * var(--xh-space-6)); height: calc(2 * var(--xh-space-6)); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); font-weight: var(--xh-font-weight-semibold)">8</div>
  </div>
</div>

<script type="module">
  import { createMotionPlayer, splitText } from "@xihan-ui/animations";

  const motion = createMotionPlayer();
  const list = document.getElementById("animations-stagger-list");
  const title = document.getElementById("animations-stagger-title");

  // 起点跟着单选组走：非受控，记下最近一次选中的值
  let from = "first";
  document.getElementById("animations-stagger-from").addEventListener("value-change", (event) => {
    from = event.detail.value;
  });
  // 间隔跟着滑块走：值恒为数组，单滑块取第一项
  let gap = 60;
  document.getElementById("animations-stagger-gap").addEventListener("value-change", (event) => {
    gap = event.detail.value[0];
    document.getElementById("animations-stagger-gap-text").textContent = gap;
  });

  document.getElementById("animations-stagger-play-list").addEventListener("click", () => {
    void motion.playAll([...list.children], "rise", {
      stagger: gap,
      from,
    });
  });

  document.getElementById("animations-stagger-play-title").addEventListener("click", async () => {
    const { parts, restore } = splitText(title);
    await motion.playAll(parts, "fade-up", { stagger: 30 });
    restore();
  });
<\/script>
`;export{e as default};