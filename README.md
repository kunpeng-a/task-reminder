# 任务提醒 · Task Reminder

常驻系统托盘、后台持续计时的桌面提醒应用（作者自用版）。Electron + React + TypeScript + Vite + electron-store。

三类提醒（周期 / 定时 / 每日）+ 全屏遮罩提醒（倒计时进度条、提示音、自定义壁纸）+ 开机自启 + 单实例锁。需求见 `PRD.md`，开发指引见 `CLAUDE.md`，更新日志见 `CHANGELOG.md`。

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
