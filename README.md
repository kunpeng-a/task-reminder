# 任务提醒 · Task Reminder

> 常驻系统托盘、后台持续计时的桌面提醒应用 —— 到点用**全屏遮罩**强提醒，不怕错过。

一个作者自用的 Windows 桌面提醒工具：周期喝水、久坐起身、定时开会、每日吃药……到点弹出置顶半透明全屏遮罩 + 提示音，必须手动"知道了"才消失。基于 Electron + React + TypeScript。

## ✨ 功能特性

- **三种提醒类型**
  - 🔁 **周期提醒**：每 N 分钟一次。启用即从满间隔计时，关闭清零、重新开启重新计时，遮罩关掉后才进入下一轮。
  - ⏰ **定时提醒**：指定日期时间一次性触发，触发后自动标记"已过期"。
  - 📅 **每日提醒**：每天固定的多个 `HH:mm` 时间点。
- **全屏遮罩提醒**：置顶半透明全屏窗口，显示任务名 / 内容 / 当前时间 + 倒计时进度条；支持"一直显示"模式（不自动关闭，必须手动确认）。
- **提示音**：内置叮咚 / 水滴 / 木鱼 / 静音；**全局默认与每个任务都能单独设置**，每任务还可选自定义音频文件。
- **自定义壁纸**：每个任务可选本地图片作为遮罩背景。
- **两级覆盖配置**：每个任务的遮罩配置（自动关闭 / 倒计时秒数 / 背景图）与音效留空时回退到全局默认。
- **常驻可靠**：最小化到系统托盘、右键暂停 / 恢复全部、开机自启、单实例锁；系统唤醒后补弹、稍后提醒（snooze）、前台独占全屏时不打扰。
- **本地持久化**：任务与设置存为本地 JSON（electron-store），重启自动恢复调度，不遗漏提醒。

## 🛠 技术栈

Electron · React 19 · TypeScript · Vite（electron-vite）· electron-store · vitest · electron-builder

UI 不依赖组件库，按高保真设计稿（`Prototype/`，设计系统 "Neutral Modern"）手搓还原。

## 🚀 快速开始

```bash
npm install        # 安装依赖
npm run dev        # 开发模式（热更新 + 启动 Electron 窗口）
npm test           # 单元测试（调度核心 computeNextTrigger）
npm run build      # 类型检查 + 打包到 out/
npm run build:win  # 打 Windows 安装包（dist/task-reminder-<版本>-setup.exe）
```

> 国内若首次 `npm install` 没下到 Electron 二进制（`npm run dev` 报 `Electron uninstall`），用镜像补下载：
> `cd node_modules/electron && ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" node install.js`

直接使用：下载 / 打包出 `task-reminder-<版本>-setup.exe`，双击安装即可，桌面会生成"任务提醒"快捷方式。

## 📁 项目结构

```
src/
├── main/       # 主进程：scheduler / notification / tray / store / autostart / ipc
├── preload/    # 预加载：contextBridge 暴露 window.api
├── renderer/   # 渲染进程：pages(TaskList/TaskEdit/Settings/Mask) + 样式
└── shared/     # 共享：types / compute-next-trigger(+test) / defaults
Prototype/      # 高保真静态设计原型（视觉来源）
```

## 📖 更多

- 更新日志：[`CHANGELOG.md`](./CHANGELOG.md)
- 设计原型：[`Prototype/`](./Prototype/)（高保真静态设计稿，视觉来源）

## 说明

作者自用的简单工具，定位是"够用、可靠、不折腾"，未做工程级加固（无 E2E、无勿扰时段、暂不支持移动端）。欢迎自取自改。
