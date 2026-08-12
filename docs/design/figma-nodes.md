# Figma 节点记录

**fileKey**: `vkmMZjILzrheBxPiXO8kF4`  
**入口 URL node**: `55:241`（URL `node-id=55-241`）  
**设计文件**: 国内伊莱克斯零冷水燃气热水器APP-UI方案

## 鉴权与拉取状态（2026-08-12）

- 已执行 Figma MCP `mcp_auth`，鉴权成功。
- 本实现会话中 `get_design_context` / `get_metadata` / `get_screenshot` 工具未就绪（服务器仅暴露 `mcp_auth`），**未能下钻首页帧 token**。
- 首页样式暂用项目主题 CSS 变量（`src/styles/index.less` / `src/variables.less`）落地可运行 UI；像素级对齐待工具可用后补做（见 `docs/design/ui-diff.md`、`home-tokens.md`）。

## 火焰 / 水流

- 组件已实现：`src/components/flame-flow-status/`
- **首页暂不挂载**：待 Figma 确认首页存在对应节点后再接入（符合 FR-007）。
