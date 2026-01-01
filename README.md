# Tech Blog Workspace

技術ブログ記事の執筆・校正するためのワークスペースです。

## 概要

このプロジェクトは、技術ブログの記事を効率的に執筆し、textlint を使用して文章の品質を保つためのワークスペースです。

## 構成

```
techblog_workspace/
├── blog_content/           # 公開用のブログ記事
│   └── blog.md
├── packages/               # モノレポ構成の検証用パッケージ
│   ├── package-a/          # 個別パッケージ例
│   └── package-b/          # 個別パッケージ例
├── .kiro/                  # Kiro設定ファイル
│   ├── hooks/              # エージェントフック
│   ├── settings/           # MCP設定など
│   └── steering/           # ステアリングファイル
│       └── blog-evaluation.md
├── .vscode/                # VSCode設定
│   └── settings.json
├── node_modules/           # 依存関係
├── .gitignore
├── .textlintrc.json        # textlint設定
├── biome.json              # Biome設定（TypeScript用）
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md
```

## 利用パッケージ、拡張ツール

### NPMパッケージ
- @biomejs/biome - TypeScript/JavaScript のリンター・フォーマッター
- markdownlint-cli2 - Markdown 構造チェック
- textlint - 日本語文章校正
  - textlint-rule-preset-ja-spacing - 日本語の文字間スペースルール
  - textlint-rule-preset-ja-technical-writing - 技術文書向けの日本語ルール
  - textlint-rule-preset-japanese - 日本語の基本ルール
  - textlint-rule-prh - 表記ゆれの統一
  - textlint-rule-spellcheck-tech-word - 技術用語のスペルチェック

### VSCode拡張機能（推奨）
- Biome - TypeScript/JavaScript のリント・フォーマット
- Code Spell Checker - 英単語のスペルチェック

### Kiro Steering File
- [ブログ記事評価プロンプト v2.2](https://gist.github.com/nwiizo/c75043438866100452fd249e536341d4) - ブログ記事の品質評価基準

### Kiro Agent Hooks
- Markdown Lint on Save - Markdownファイル編集時の自動文章校正

## 機能

### 文章の校正

```bash
# ブログ記事チェック（構造 + 文章）
pnpm lint

# ブログ記事修正（構造 + 文章）
pnpm lint:fix
```

### コードの校正

```bash
# TypeScriptコードチェック（フォーマット + リント）
pnpm code:check

# TypeScriptコード修正（フォーマット + リント）
pnpm code:fix
```

## セットアップ

```bash
# 依存関係のインストール
pnpm install

# 文章チェックの実行
pnpm lint

# 文章の自動修正
pnpm lint:fix
```