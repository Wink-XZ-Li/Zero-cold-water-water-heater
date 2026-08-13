# Research: 003 专业参数（瀑布浴等）

**Date**: 2026-08-13  
**Branch**: `003-pro-settings`

## R1 — 瀑布浴绑定哪个 DP？

- **Decision**: `turbo`（id 34，bool，rw，名称「增压（瀑布浴）」）
- **Rationale**: 与产品描述及设计「瀑布浴」语义一致；schema 已存在，无需扩物模型
- **Alternatives**: 自造本地状态 — 拒绝（违反 SDM / DP 安全）

## R2 — 首页行组件如何组织？

- **Decision**: 新增 `waterfall-bath-entry` 与 `energy-report-entry`，在 `home/index.tsx` 中挂在 `ZeroColdEntry` 之后；样式对齐 `zero-cold-entry` 行卡（圆角白底、图标槽、Switch/箭头）
- **Rationale**: 001/002 已稳定零冷水块；并列组件降低耦合，符合 FR-006
- **Alternatives**: 扩展 `ZeroColdEntry` 内塞瀑布浴/能耗 — 拒绝（职责混杂）；新建整块「更多设置」页 — 无设计帧，拒绝

## R3 — 能耗报告页壳交互深度？

- **Decision**: 静态壳：用水/用气分段外观、日周月年标签、日期行、空图表区、±15% 误差说明、顶部空态提示；分段与周期控件 **禁用或不响应业务逻辑**（可视觉选中默认「用水量」「日」）
- **Rationale**: Q2=B 要求对照 `55:1044` 信息结构但不做真实数据；避免 003 引入 Charts/云统计
- **Alternatives**: 仅文字占位页 — 与用户选择 B 不符；完整 Charts — 属 004

## R4 — 离线/关机禁用策略？

- **Decision**: 复用 `useDeviceOnlineGuard` + 电源状态：与首页其他可控项一致，`disabled={!online || !powerOn}`（或现有 home 的 `disabled` 传参模式）
- **Rationale**: FR-003 / SC-002；与 `ZeroColdEntry` 行为一致
- **Alternatives**: 离线仍可拨开关 — 拒绝（假成功风险）

## R5 — 设计工具权威？

- **Decision**: 继续使用 Ardot 节点 `55:864`/`55:954`/`55:1044`；视觉 token 复用 `docs/design/home-tokens.md`
- **Rationale**: Figma MCP 不可用时的项目既定例外；与 001/002 一致
- **Alternatives**: 等待 Figma MCP — 阻塞交付，拒绝

## Open Items

无未解决 NEEDS CLARIFICATION（规格澄清已闭合）。
