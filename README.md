# min_vue3

> 用于深入学习 vue3， 理解 vue3 的核心逻辑

## 技术栈

- typescript
- jest
- rollup
- babel

## 实现模块

### reactive

> 实现自己的响应式, 支持现有的 demo 运行

- reactive 的实现
- ref 的实现
- readonly 的实现
- computed 的实现
- 实现了测试覆盖

### runtime-core

- 实现初始化 props
- 支持基本的组件类型
- 支持 element 类型
- 通过 setup 获取 props 和 context
- 支持 component emit
- 支持 proxy
- 实现 nextTick
- 实现 getCurrentInstance

### compailer-core

- 实现解析 插值
- 解析 element
- 解析 text

### runtime-dom

- 支持 custom renderer
