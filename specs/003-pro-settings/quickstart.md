# Quickstart: 003 瀑布浴与能耗报告壳

## 开发

1. 分支：`003-pro-settings`
2. `npm start`（`ray start --target tuya`）
3. IDE 绑定 Pro_Key `a3cbezgki7lkl8rr`

## 手测路径

1. 首页在零冷水下方看到「瀑布浴」与「能耗报告」
2. 开机在线：拨动瀑布浴，虚拟设备 `turbo` 与 UI 一致
3. 关机或离线：拨动无效或有提示，无假成功
4. 点「能耗报告」→ 页面壳（空图表 + 说明）→ 返回首页
5. 对照 Ardot `55:864`/`55:954`/`55:1044` 信息结构（SC-004）

## 构建门禁

```bash
npm run lint
npm run build
```

## 参考

- 规格：`specs/003-pro-settings/spec.md`
- 计划：`specs/003-pro-settings/plan.md`
- 设计：Ardot `55:864`、`55:954`、`55:1044`
