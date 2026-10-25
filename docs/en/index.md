---
layout: home
title: XiHan.UI
titleTemplate: A fast, lightweight, framework-agnostic component library

hero:
  name: XiHan.UI
  text: A framework-agnostic component library
  tagline: A fast, lightweight, carefully built headless UI library that runs on any framework.
  image:
    src: /images/logo.png
    alt: XiHan.UI
  actions:
    - theme: brand
      text: Quick start
      link: /en/quickstart

    - theme: alt
      text: Introduction
      link: /en/introduction

    - theme: alt
      text: Components
      link: /en/components/

features:
  - title: Headless core
    icon: 🧠
    details: Anatomy, state machines and accessibility logic live in a framework-agnostic core. Adapters only write attributes onto host elements; they never reimplement behavior.
    link: /en/introduction
    linkText: "Read the introduction"

  - title: One behavior, three hosts
    icon: 🔁
    details: Vue components, React components and custom elements run the same state machine and the same connect. A cross-adapter conformance suite compares the normalized DOM frame by frame.
    link: /en/quickstart
    linkText: "See the three ways"

  - title: Accessibility is a criterion
    icon: ♿
    details: Every component has a machine-readable keyboard specification that doubles as the test denominator; a suite that misses one row fails. Scans run in real Chromium.
    link: /en/guide/a11y
    linkText: "Read about the keyboard specs"

  - title: Styling decoupled from logic
    icon: 🎨
    details: Skins only select data-scope / data-part and state attributes, never frameworks or class names. Tokens are generated from DTCG sources as CSS variables; replacing the whole skin needs no JS change.
    link: /en/guide/theme
    linkText: "Read about tokens and theming"

  - title: Small dependency surface
    icon: 📦
    details: No library package has a third-party runtime dependency. Date arithmetic, overlay positioning, syntax highlighting, virtual scrolling, the Web Components reactive base class and streaming Markdown are all built in-house.
    link: /en/installation
    linkText: "Install"

  - title: AI chat core
    icon: 🤖
    details: SSE reading, protocol normalization, parts reduction and the conversation store live in a DOM-free core; rendering is left to the message feed, log, prompt input, code view and streaming Markdown.
    link: /en/components/
    linkText: "Browse the components"
---
