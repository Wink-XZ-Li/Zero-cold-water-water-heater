# Quickstart: ST1 Pro 首页核心（001）

**Date**: 2026-08-12

## 前置

1. 安装依赖：`yarn`（仓库已含 lockfile）
2. 涂鸦 MiniApp IDE 打开本项目；配置虚拟设备绑定产品 `a3cbezgki7lkl8rr`（或导入 Debugfile）
3. Figma MCP：完成 `mcp_auth` 后可拉取设计（fileKey `vkmMZjILzrheBxPiXO8kF4`，入口 node `55:241`）
4. 将产品描述文件拷入仓库：`docs/product/Debugfile_ST1_Pro.json`（实现任务中执行）

## 常用命令

```bash
yarn start          # 等价 npx ray start --target tuya
yarn build          # ray build --target tuya
yarn lint           # eslint src
```

## 建议实现顺序

1. Schema + `devices/index.ts` 对齐 ST1 Pro  
2. i18n（模式/工作状态/故障/占位文案）  
3. DP 工具（scale/range/enum/bitmap）  
4. 首页主控组件绑定（开关→模式→温度→状态→故障）  
5. Figma token 落地样式  
6. 零冷水入口 + 占位页路由  
7. 虚拟设备联调与截图对照  

## 验收对照

见 [spec.md](./spec.md) Success Criteria 与 [contracts/ui-dp-bindings.md](./contracts/ui-dp-bindings.md)。

## 下一步

运行 `/speckit.tasks` 生成可执行任务列表后再开始改代码。
