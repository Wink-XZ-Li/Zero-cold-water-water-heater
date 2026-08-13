# Implementation Plan: 能耗报告曲线与统计

**Branch**: `004-energy-charts` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-energy-charts/spec.md`

## Summary

在 003 已交付的 `energy-report` 页面壳上接通真实统计：用水/用气与日/周/月/年可交互；数据来自涂鸦设备统计 API（FR-008 **方案 A**），可视化优先 `@ray-js/stat-charts`；对照 Ardot `55:1044` 去掉「尚未开放」误导横幅，补齐加载/空/失败态。不改 002 定时与 003 瀑布浴主路径。

## Technical Context

**Language/Version**: TypeScript ^4.4.3（严格模式，禁止无必要 `any`）

**Primary Dependencies**: `@ray-js/ray` ^1.7.55、`@ray-js/smart-ui` ^2.7.2（NavBar）、`@ray-js/panel-sdk` ^1.14.1；**新增** `@ray-js/stat-charts`、`dayjs`；统计 API 经 StatCharts 或 `@ray-js/ray` 的 `getStatisticsRang*`

**Storage**: 无本地业务库；序列来自云端统计；页面本地 state 仅 UI 选择（metric/period/anchor）

**Testing**: 涂鸦 MiniApp IDE + 虚拟/真实设备统计；ESLint；`ray build --target tuya`；对照 Ardot `55:1044` 截图

**Target Platform**: 涂鸦智能生活 App ≥4.5.0；单设备面板

**Project Type**: 涂鸦 Ray 面板小程序（`panel-app`）

**Performance Goals**: 正常网络下进入报告页 ≤5s 显示图表或空态（SC-001）；快速切换不卡死（SC-002）

**Constraints**: 禁止伪造曲线；只读统计 DP id 24/25；不写 DP；复用 001 token；中文 commit；Ardot 设计例外同 001–003

**Scale/Scope**: 单页增强（`energy-report`）+ 可选小型 hook/工具；无新路由

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. SDM 工程 | ✅ PASS | 统计目标 DP 已在 `schema.ts`（24/25）；只读，不经 actions 下发 |
| II. 设计驱动 | ✅ PASS* | 权威帧 `55:1044`；工具 Ardot（既定例外） |
| III. Skill 优先 | ✅ PASS | StatCharts + 统计 API；参考 Softener / Gas-Boiler curve |
| IV. 读取优先 | ✅ PASS | 先读壳页与参考仓再改 |
| V. Ray & SmartUI | ✅ PASS | NavBar + View/Text/ScrollView；Charts 按 Skill |
| VI. DP 安全 | ✅ PASS | 仅统计读；不改 002/003 写路径 |
| Git 中文提交 | ✅ PASS | subject/body 中文 |

\* 宪章原文以 Figma 为权威；本仓以 Ardot `714289030938546` 作设计源，属项目既定例外。

**Gate Result**: ALL PASS — Phase 0/1 已完成（见 `research.md`、`data-model.md`、`contracts/`、`quickstart.md`）

**Post-design re-check**: 合约仅扩展报告页只读统计；无宪章违规；Complexity Tracking 为空。

## Project Structure

### Documentation (this feature)

```text
specs/004-energy-charts/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── energy-report-stats.md
│   └── statistics-api.md
├── checklists/requirements.md
├── HANDOFF.md
└── tasks.md             # /speckit.tasks 产出
```

### Source Code (repository root)

```text
src/
├── pages/energy-report/
│   ├── index.tsx              # 启用交互 + StatCharts + 状态
│   ├── index.module.less      # 对齐 55:1044 / 001 tokens
│   ├── index.config.ts
│   └── hooks/
│       └── useEnergyAnchor.ts # 可选：日周月年锚点与标签
├── i18n/strings.ts            # 加载/空/失败等文案；去掉误导横幅依赖
└── package.json               # +stat-charts +dayjs
```

**Structure Decision**: 保持 Ray 单仓；在现有 `energy-report` 页内增强，不新建第二入口；日期逻辑可抽 hook，图表优先内联 StatCharts 以降低样板。

## Complexity Tracking

> 无 Constitution 违规需额外论证。
