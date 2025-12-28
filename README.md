# Tech Blog Workspace

技術ブログ記事の執筆・校正を行うためのワークスペースです。

## 概要

このプロジェクトは、技術ブログの記事を効率的に執筆し、textlintを使用して文章の品質を保つためのワークスペースです。

ブログ記事評価基準として[ブログ記事評価プロンプト v2.2](https://gist.github.com/nwiizo/c75043438866100452fd249e536341d4)をKiroのSteering Fileに設定しています。

## 構成

- `blog_content/` - 公開用のブログ記事
- `experiments/` - 検証用のコードや実験的な内容

## 機能

### 文章の校正

```bash
# 文章をチェック
pnpm lint:text

# 自動修正
pnpm lint:text:fix
```

### textlintルール

以下のルールが適用されています：

- **preset-ja-technical-writing**: 技術文書向けの日本語ルール
  - 文の長さ: 最大100文字
  - 読点の数: 最大3個
  - 難しい単語のチェック: 無効
- **preset-japanese**: 日本語の基本ルール
- **spellcheck-tech-word**: 技術用語のスペルチェック

### 主なチェック項目

- 助詞の重複
- 弱い表現（「思います」など）
- 文末の句点
- 文の長さ
- 技術用語のスペル

## 開発環境

- Node.js
- pnpm
- textlint

## セットアップ

```bash
# 依存関係のインストール
pnpm install

# 文章チェックの実行
pnpm lint:text
```

### 推奨ツール

このプロジェクトを効率的に使用するために、以下のツールの使用を推奨します：

- **Prettier**: Markdownの自動フォーマット（Kiroの拡張機能から「Prettier」を検索してインストール）
- **Code Spell Checker**: 英単語のスペルチェック（Kiroの拡張機能から「Code Spell Checker」を検索してインストール）
- **textlint**: 日本語文章校正（既にプロジェクトに組み込み済み）
