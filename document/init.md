# 项目初始化流程

## 项目结构

- src
  - module
    - main
    - test

## 环境搭建

- 集成 ts
  - yarn add typescript --dev
    - 下载依赖
  - npx tsc --init
    - 生成 `tsconfig` 文件
  - yarn add jest @types/jest --dev
    - 然后 tsconfig.json 更改 types 属性 kk
    - `types: ['jest']`
- 允许使用 any

  - noImplicitAny:flase

- 集成 babel

  - `yarn add --dev babel-jest @babel/core @babel/preset-env`
    - 具体查看 babel.config.js 的配置操作
  - 还需要配置 `yarn add --dev @babel/preset-typescript`
    - 这样编译之后 就可以使用 typescript 进行后续的操作

- jest 命令

  - 通过 jest 命令开始测试
    - 可以指定文件名称

- ts config
  - lib 属性
    - "lib": ["DOM", "ES6"]
    - 就可以使用 浏览器的一些属性
      - 类似 proxy 等

## rollup 打包环境安装

### 安装 rollup

```
yarn add rollup@2.57.0 --dev
```

- yarn 的下载 一样需要 sudo 进行处理

### 额外的一些插件

- `sudo yarn add @rollup/plugin-typescript@8.2.5 --dev`
- `sudo yarn add tslib@2.3.1 --dev`
  - 处理 ts 的编译
