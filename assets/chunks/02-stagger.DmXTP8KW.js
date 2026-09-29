const t=`<!-- 错开起播 | 一组元素依次进场，起点可以从头、从尾或从中间；文字拆开即为一组元素 -->
<div style="display: flex; flex-direction: column; gap: 16px; width: 100%">
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 20px">
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
    <label style="display: flex; align-items: center; gap: 8px">
      <span id="animations-stagger-gap-text">间隔 60ms</span>
      <input id="animations-stagger-gap" type="range" min="0" max="200" step="10" value="60" />
    </label>
  </div>

  <div style="display: flex; gap: 8px">
    <xh-button id="animations-stagger-play-list" size="sm">
      <button data-xh-part="root">播列表</button>
    </xh-button>
    <xh-button id="animations-stagger-play-title" size="sm" variant="outline">
      <button data-xh-part="root">播标题</button>
    </xh-button>
  </div>

  <h3 id="animations-stagger-title" style="margin: 0; font-size: 24px">曦寒 UI 动画层</h3>

  <div id="animations-stagger-list" style="display: flex; flex-wrap: wrap; gap: 8px">
    <div style="display: grid; place-items: center; width: 48px; height: 48px; border-radius: 10px; background: var(--vp-c-brand-soft); font-weight: 600">1</div>
    <div style="display: grid; place-items: center; width: 48px; height: 48px; border-radius: 10px; background: var(--vp-c-brand-soft); font-weight: 600">2</div>
    <div style="display: grid; place-items: center; width: 48px; height: 48px; border-radius: 10px; background: var(--vp-c-brand-soft); font-weight: 600">3</div>
    <div style="display: grid; place-items: center; width: 48px; height: 48px; border-radius: 10px; background: var(--vp-c-brand-soft); font-weight: 600">4</div>
    <div style="display: grid; place-items: center; width: 48px; height: 48px; border-radius: 10px; background: var(--vp-c-brand-soft); font-weight: 600">5</div>
    <div style="display: grid; place-items: center; width: 48px; height: 48px; border-radius: 10px; background: var(--vp-c-brand-soft); font-weight: 600">6</div>
    <div style="display: grid; place-items: center; width: 48px; height: 48px; border-radius: 10px; background: var(--vp-c-brand-soft); font-weight: 600">7</div>
    <div style="display: grid; place-items: center; width: 48px; height: 48px; border-radius: 10px; background: var(--vp-c-brand-soft); font-weight: 600">8</div>
  </div>
</div>

<script type="module">
  import { createMotionPlayer, splitText } from "@xihan-ui/animations";

  const motion = createMotionPlayer();
  const gap = document.getElementById("animations-stagger-gap");
  const list = document.getElementById("animations-stagger-list");
  const title = document.getElementById("animations-stagger-title");

  // 起点跟着单选组走：非受控，记下最近一次选中的值
  let from = "first";
  document.getElementById("animations-stagger-from").addEventListener("value-change", (event) => {
    from = event.detail.value;
  });
  gap.addEventListener("input", () => {
    document.getElementById("animations-stagger-gap-text").textContent = \`间隔 \${gap.value}ms\`;
  });

  document.getElementById("animations-stagger-play-list").addEventListener("click", () => {
    void motion.playAll([...list.children], "rise", {
      stagger: Number(gap.value),
      from,
    });
  });

  document.getElementById("animations-stagger-play-title").addEventListener("click", async () => {
    const { parts, restore } = splitText(title);
    await motion.playAll(parts, "fade-up", { stagger: 30 });
    restore();
  });
<\/script>
`;export{t as default};
