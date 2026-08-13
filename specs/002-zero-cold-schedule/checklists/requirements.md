# 规格质量清单：零冷水定时（002）

**Purpose**: 在进入 `/speckit.plan` 前核对规格完整性  
**Created**: 2026-08-13  
**Feature**: [spec.md](../spec.md)

## 内容完整

- [x] 用户故事已按 P1/P2 划分且可独立测试
- [x] 验收场景覆盖列表 / 新增 / 编辑 / 删除
- [x] 边界：半组失败、离线、跨日、孤儿 Timer
- [x] 成功标准可度量（SC-001–004）

## 需求清晰

- [x] FR 标明 dpid 104 ↔ `zc_always_on` 与成对 aliasName 模型
- [x] 明确不用 `openTimerPage` 主路径
- [x] Out of Scope 与 003/004 切开
- [x] 首页入口「零冷水预热」= 定时 已写明

## 用户确认（2026-08-13）

- [x] 规格正文批准进入 `/speckit.plan`
- [x] `isAppPush` 默认 `false`
- [x] 删除 MUST 二次确认
