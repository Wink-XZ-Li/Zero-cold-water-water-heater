# UI 差异记录（SC-005）

**日期**: 2026-08-12

## 阻塞

Figma MCP 鉴权成功后，本会话仍无法调用 `get_design_context` / `get_screenshot`（工具列表仅见 `mcp_auth`）。因此未能做像素级对照。

## 当前实现

- 使用主题 CSS 变量的卡片式首页布局（可运行、结构覆盖规格主区块）
- **非**最终视觉稿；待 Figma 工具可用后按 `home-tokens.md` 覆盖

## 待办

1. 恢复 Figma 设计工具后拉取 node `55:241` 及首页帧  
2. 更新 `src/styles/index.less` / 各组件 module.less  
3. 将本文件差异项清零  
