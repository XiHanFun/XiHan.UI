import{b as s,C as c}from"./index.C_69q0rj.js";import{b8 as p,b9 as d,b7 as u,b5 as b,b6 as a,o as i,bb as h,bc as f,bd as g}from"./theme.D9gHp_UI.js";import{d as x,o as m,b as C,w as o,E as t,k as e,a as n}from"./framework.BpF7DVZ1.js";const l=`export function createStore(reduce: Reducer, initial: State) {
  let state = initial
  return {
    get: () => state,
    dispatch(action: Action) {
      state = reduce(state, action)
    },
  }
}`,v=x({__name:"05-copy",setup(y){return(_,r)=>(m(),C(e(g),{code:l,lang:"typescript",filename:"store.ts",complete:"",style:{"inline-size":"100%"}},{default:o(()=>[t(e(p),null,{default:o(()=>[t(e(d)),t(e(u),{value:l,timeout:1500,style:{"--xh-clipboard-copy-trigger-border":"transparent","--xh-clipboard-copy-trigger-border-hover":"transparent","--xh-clipboard-copy-trigger-bg":"transparent","--xh-clipboard-copy-trigger-h":"var(--xh-control-h-sm)","--xh-clipboard-copy-trigger-px":"var(--xh-control-px-sm)","--xh-clipboard-copy-trigger-font-size":"var(--xh-text-caption-size)"}},{default:o(()=>[t(e(b),null,{default:o(()=>[t(e(a),null,{default:o(()=>[t(e(i),{icon:e(s)},null,8,["icon"]),r[0]||(r[0]=n(" 复制",-1))]),_:1}),t(e(a),{copied:""},{default:o(()=>[t(e(i),{icon:e(c)},null,8,["icon"]),r[1]||(r[1]=n(" 已复制",-1))]),_:1})]),_:1})]),_:1})]),_:1}),t(e(h),null,{default:o(()=>[t(e(f))]),_:1})]),_:1}))}});export{v as default};
