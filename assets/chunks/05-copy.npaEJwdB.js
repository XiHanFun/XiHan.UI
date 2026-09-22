import{e as s,C as c}from"./index.Dvd56iNz.js";import{as as p,ar as d,aq as u,an as h,ao as r,d as i,au as f,at as g,av as x}from"./theme.MiIkzu77.js";import{d as m,o as C,b,w as a,E as t,k as e,a as n}from"./framework.DxrHb2fb.js";const l=`export function createStore(reduce: Reducer, initial: State) {
  let state = initial
  return {
    get: () => state,
    dispatch(action: Action) {
      state = reduce(state, action)
    },
  }
}`,v=m({__name:"05-copy",setup(y){return(_,o)=>(C(),b(e(x),{code:l,lang:"typescript",filename:"store.ts",complete:"",style:{"inline-size":"100%"}},{default:a(()=>[t(e(p),null,{default:a(()=>[t(e(d)),t(e(u),{value:l,timeout:1500,style:{"--xh-clipboard-copy-trigger-border":"transparent","--xh-clipboard-copy-trigger-border-hover":"transparent","--xh-clipboard-copy-trigger-bg":"transparent","--xh-clipboard-copy-trigger-h":"var(--xh-control-h-sm)","--xh-clipboard-copy-trigger-px":"var(--xh-control-px-sm)","--xh-clipboard-copy-trigger-font-size":"var(--xh-text-caption-size)"}},{default:a(()=>[t(e(h),null,{default:a(()=>[t(e(r),null,{default:a(()=>[t(e(i),{icon:e(s)},null,8,["icon"]),o[0]||(o[0]=n(" 复制",-1))]),_:1}),t(e(r),{copied:""},{default:a(()=>[t(e(i),{icon:e(c)},null,8,["icon"]),o[1]||(o[1]=n(" 已复制",-1))]),_:1})]),_:1})]),_:1})]),_:1}),t(e(f),null,{default:a(()=>[t(e(g))]),_:1})]),_:1}))}});export{v as default};
