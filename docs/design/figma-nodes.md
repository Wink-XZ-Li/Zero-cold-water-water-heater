# 设计节点记录（Ardot）

**文件**: 国内伊莱克斯零冷水燃气热水器APP UI方案  
**fileId**: `714289030938546`（原 Figma fileKey `vkmMZjILzrheBxPiXO8kF4`）  
**页面**: `55:241` 方案修改  
**工具**: Ardot MCP（`user-ardot`）

## 首页相关帧

| Frame | ID | 用途 |
|------|-----|------|
| iPhone 13 mini 142 | `55:788` | 首页主控（无故障）— 实现主参考 |
| iPhone 13 mini 140 | `55:711` | 首页 + 故障提醒 |
| iPhone 13 mini 138 / 139 | `55:864` / `55:954` | 展开瀑布浴/能耗入口 — **首包不实现**（T026） |
| iPhone 13 mini 141 | `55:1044` | 能耗报告 — **首包不实现**（004） |

## 关键区块节点

| 区块 | Node | 组件 |
|------|------|------|
| 温度英雄卡 | `55:848` | `status-hero` |
| 故障横幅 | `55:781` | `fault-banner` |
| 开机 | `55:792` | `power-switch` |
| 使用模式 | `55:797–816` | `mode-selector` |
| 卫浴温度 | `55:832` | `temp-control` |
| 零冷水开关 | `55:817` | `zero-cold-entry` toggle |
| 零冷水预热 | `55:824` | `zero-cold-entry` navigate |

## 火焰 / 水流

- 上述首页帧 **无** 独立火焰/水流展示节点
- `flame-flow-status` 组件保留，首页 **不挂载**（符合 FR-007）
