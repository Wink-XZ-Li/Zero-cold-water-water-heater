# Handoff: 005 下一阶段（待开规格）

**Date**: 2026-08-13  
**基线分支**: `004-energy-charts` @ `dec73cc`  
**仓库**: Zero-cold-water water heater（伊莱克斯 ST1 Pro / Pro_Key `a3cbezgki7lkl8rr`）

## 001–004 已交付

| Feature | 内容 | 状态 |
|---------|------|------|
| **001** | 首页主控 + 故障横幅 + 零冷水入口 | 已实现 |
| **002** | 零冷水成对云定时 | 手测通过 |
| **003** | 瀑布浴（`turbo`）+ 能耗报告入口/壳 | 已实现 |
| **004** | 能耗报告真实统计（StatCharts + 统计 API） | 已实现并 commit `dec73cc` |

## 设计权威（延续例外）

- Ardot file `714289030938546`，方案修改页 `55:241`
- 工具：Ardot MCP（宪章 Figma 条款的项目既定例外，同 001–004）
- Token：`docs/design/home-tokens.md` / CSS 变量；禁止米家品牌色

## 005 候选范围（须先澄清再 `/speckit.specify`）

原路线图止于 004。建议在下列中 **选一**（或用户指定组合）：

| 选项 | 建议 short-name | 内容 | 风险 |
|------|-----------------|------|------|
| **A** | `pro-params` | 003 未做的专业参数：变升 `var_cap`、浴缸流量 `bath_flow_set`、回水温差 `zc_return_diff`、点动 `zero_cold_jog_switch`、保温时长 `once_zero_cold_keep_time`、浴缸加热完成提醒 `bath_heat_done_alert` | 「方案修改」页 **无** 对应帧；须补设计或批准信息架构例外 |
| **B** | `ux-polish` | 体验/视觉打磨：模式图标 SVG、`ui-diff` 清零、故障文案/交互、NavBar/间距一致性、001–004 残留 | 设计有部分依据；偏横切 |
| **C** | `status-extra` | 火焰/水流状态、进水温度等只读展示（若产品需要） | 001 曾明确首页可不挂载；需设计确认 |

**推荐默认**：**A**（补齐物模型专业参数）若产品要可调能力；若优先「看起来完整」则 **B**。

## Skill / 参考

- Skill：`tuya-ray-panel-dev`
- 图表参考（已用于 004）：`/Users/fgt/TuYaMiniProject/miniapp-1/src/components/chart-card`
- 本仓：`src/pages/home`、`src/pages/energy-report`、`src/devices/schema.ts`

## 新会话开场白（复制即用）

见下方「提示词」或 `CODEBUDDY.md` SPECKIT 段。
