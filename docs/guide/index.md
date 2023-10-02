---
nav:
  title: 指南
  order: -1
group:
  title: Schema
  order: 0
---

```json5
{
  "devDependencies": {
    "@types/node": "^20.8.10",
    "ts-node": "^10.9.1",
    "rollup-plugin-typescript2": "^0.36.0",
    "tslib": "^2.6.2",
    "typescript": "^5.2.2",
    "@formily/core": "^2.2.0",
    "@formily/template": "^1.0.0-alpha.21",
    "dumi": "^2.2.14",
    "eslint": "8.49.0",
    "@antfu/eslint-config": "0.43.1",

    /* react */
    "@types/react": "^18.2.35",
    "@types/react-dom": "^18.2.14 ",
    "react-dom": "^18.2.0",
    "react-is": "^18.2.0",
    "react": "^18.2.0",
    "@formily/react": "^2.2.0",
    "antd": "^5.11.0",
    "@ant-design/icons": "^5.0.0",
    "@formily/antd-v5": "^1.1.7",
    // "@odinlin/formily-antd": "workspace:*",

    /* vue */
    "vue": "^3.3.0",
    "@formily/vue": "^2.2.0",
    "ant-design-vue": "^4.0.6 ",
    "@ant-design/icons-vue": "^7.0.1",
    "@formily/antdv": "^2.0.1-beta.3"
    // "@odinlin/formily-antdv": "workspace:*"
  }
}
```

```ts
// x-index	UI 展示顺序
// x-display	UI 展示
// x-content	字段内容，用来传入某个组件的子节点
// x-visible	字段显示隐藏
// x-hidden	字段 UI 隐藏(保留数据)
// x-data	扩展属性
```
