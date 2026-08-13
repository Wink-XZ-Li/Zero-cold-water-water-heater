# Quickstart: 002 零冷水定时

## 开发

1. 分支：`002-zero-cold-schedule`
2. `npm start`（`ray start --target tuya`）
3. IDE 绑定 Pro_Key `a3cbezgki7lkl8rr`，真机/虚拟设备需支持云定时

## 手测路径

1. 首页 → 「零冷水预热」→ 定时列表（非占位文案）
2. 「+」新增：选重复日、开始/结束时间，`isAppPush` 默认关 → 保存 → 列表出现一行
3. 点击行编辑时间 → 保存 → 列表更新
4. 开关行：两侧 Timer status 一致
5. 左滑/删除 → 二次确认 → 列表移除
6. （可选）断网保存：应失败提示且无半组

## 构建门禁

```bash
npm run lint
npm run build
```

## 参考

- 规格：`specs/002-zero-cold-schedule/spec.md`
- 米家截图：Ardot 节点 `57:4`（编辑）、`57:5`（列表）
- API：https://developer.tuya.com/cn/miniapp/develop/ray/api/timer/base
