# Research: 005 体验与视觉打磨

**Date**: 2026-08-13  
**Branch**: `005-ux-polish`

## 1. 模式图标实现方式

**Decision**: 引入 `@ray-js/svg`（及 `htm` / `preact` / `preact-render-to-string`），为四模式提供独立 Svg 路径组件；选中/未选中通过 circle/glyph `fill` 切换。路径从 Ardot 模式区矢量 `export_nodes`（format=svg）提炼。公共 npm 对 `@ray-js/*` 可能 403，本机可从参考仓 `cat-litter-box-tuya-panel2` 同步 `node_modules`。

**Rationale**: Skill 与本地参考仓均用 `@ray-js/svg`；文字占位是 `ui-diff` 首项；PNG 无法随选中态换色。

**Alternatives considered**:
- iconfont：需另建字体管线，过重
- 静态 PNG：选中态需双套图，难跟 token
- 继续文字 mark：否决（本 feature 目标）

## 2. 故障横幅点击行为

**Decision**: 保留设计文案「点击查看处理方案」与可点暗示；点击使用 SmartUI `DialogInstance.alert`（首页挂载 `<Dialog id="smart-dialog" />`）展示当前全部故障码/可读说明列表；**不**新建故障手册路由。警示图标改为矢量（对齐 `55:781`）。

**Rationale**: 设计稿明确「点击查看处理方案」；001 否决百科页；就地摘要满足 FR-004 且消除假导航；与 002 定时页 Dialog 模式一致。

**Alternatives considered**:
- 去掉箭头与 hint、完全不可点：与稿文案冲突
- 跳转占位页：制造更多空壳，否决
- `showModal`：本仓优先复用 SmartUI DialogInstance

## 3. NavBar 与间距

**Decision**: 继续使用 SmartUI `NavBar`（平台例外，写入 ui-diff 为已接受）；统一内容区水平 padding `32rpx`、主卡片垂直 `gap: 32rpx`（与首页 `home/index.module.less` `.content` 对齐）。子页仅改样式，不改定时/图表逻辑。

**Rationale**: 设计稿无 App 顶栏，但面板框架需要返回/标题；001 已保留 NavBar。间距不一致是横切残留。

**Alternatives considered**:
- 隐藏 NavBar 做沉浸式：破坏子页返回可达性，否决
- 每页自定义顶栏：偏离 SmartUI 惯例，否决

## 4. ui-diff 清零策略

**Decision**: 重写 `docs/design/ui-diff.md` 分区为「已对齐 / 已接受例外」；关闭过时项（瀑布浴/能耗「首包不出」）；开放项归零。

**Rationale**: SC-004 以文档可验收。

## 5. 范围边界

**Decision**: 严格 B；A/C 不实现；002/004 主路径只允许样式级触及。

**Rationale**: 用户明确选 B；HANDOFF 要求单范围。
