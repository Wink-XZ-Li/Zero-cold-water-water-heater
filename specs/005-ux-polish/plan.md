# Implementation Plan: 体验与视觉打磨

**Branch**: `005-ux-polish` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-ux-polish/spec.md`

## Summary

在 001–004 已交付面板上做 **B 范围**视觉/体验打磨：首页四模式矢量图标对齐 Ardot；故障横幅去掉「假手册」误导并提供就地摘要；统一首页与子页内容边距/间距；收口 `docs/design/ui-diff.md`。不实现 A 专业参数与 C 只读状态；不改写 002 定时与 004 图表主路径。

## Technical Context

**Language/Version**: TypeScript ^4.4.3（严格模式，禁止无必要 `any`）

**Primary Dependencies**: 既有 `@ray-js/ray`、`@ray-js/smart-ui`、`@ray-js/panel-sdk`；**新增** `@ray-js/svg`（模式/故障矢量图标，对齐 Skill 与参考仓）

**Storage**: 无新持久化；仅 UI 展示与就地弹层状态

**Testing**: ESLint；`ray build --target tuya`；Ardot 截图对照；IDE 虚拟设备手测（模式切换、故障有/无、子页返回）

**Target Platform**: 涂鸦智能生活 App ≥4.5.0；单设备面板

**Project Type**: 涂鸦 Ray 面板小程序（`panel-app`）

**Performance Goals**: 图标为本地 SVG 路径，无额外网络；首页交互无回归卡顿

**Constraints**: Ardot `714289030938546` / `55:241` 设计权威（既定例外）；复用 001 token；禁止米家品牌色；中文 commit；不改 002/004 业务主路径

**Scale/Scope**: 横切 UI：`mode-selector`、`fault-banner`、各页 `.module.less` 间距、`ui-diff.md`；可选小型 `mode-icons` / i18n 文案

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. SDM 工程 | ✅ PASS | 不改 schema/写 DP；模式仍 `actions.mode.set`；故障只读 |
| II. 设计驱动 | ✅ PASS* | 对照 `55:788`/`55:711`/`55:781`；工具 Ardot |
| III. Skill 优先 | ✅ PASS | `@ray-js/svg`；参考 cat-litter / Gas-Boiler SVG 用法 |
| IV. 读取优先 | ✅ PASS | 先读 ui-diff、现组件与 Ardot 再改 |
| V. Ray & SmartUI | ✅ PASS | 保留 NavBar；View/Text/Popup 或 showModal |
| VI. DP 安全 | ✅ PASS | 不写 fault；不改定时/统计写读主路径 |
| Git 中文提交 | ✅ PASS | subject/body 中文 |

\* 宪章原文以 Figma 为权威；本仓以 Ardot 作设计源，属项目既定例外。

**Gate Result**: ALL PASS — 进入 Phase 0/1

**Post-design re-check**: 合约仅 UI 展示与间距；Complexity Tracking 为空。

## Project Structure

### Documentation (this feature)

```text
specs/005-ux-polish/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── mode-icons.md
│   ├── fault-banner.md
│   └── page-shell-spacing.md
├── checklists/requirements.md
└── tasks.md             # /speckit.tasks 产出
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── mode-selector/          # 文字 mark → SVG 图标 + 选中色
│   ├── mode-icons/             # 可选：四模式 Svg 路径封装
│   └── fault-banner/           # 图标 + 点击就地摘要（无手册页）
├── pages/
│   ├── home/index.module.less
│   ├── energy-report/index.module.less
│   ├── zero-cold-schedule/
│   └── zero-cold-schedule-edit/
├── i18n/strings.ts             # 故障弹层/多故障文案微调
└── docs/design/ui-diff.md      # 清零开放项
package.json                    # +@ray-js/svg
```

**Structure Decision**: 不新增路由；图标以组件内 `@ray-js/svg` 路径为主（可从 Ardot `export_nodes` SVG 提炼），避免 PNG 资源与主题色无法切换问题。

## Complexity Tracking

> 无 Constitution 违规需额外论证。
