# 技術ブログワークスペース

技術ブログ記事の執筆・校正とコード検証のためのワークスペースです。

## 使い方

### 新しいブログ記事の開始

1. このフォルダ全体をコピーして新しいディレクトリを作成
2. セットアップスクリプトを実行

```bash
pnpm setup-blog "blog-name"
```

例:
```bash
pnpm setup-blog "aws-lambda-tips"
```

3. `blog_content/blog.md` を編集してブログを書く

### 利用可能なコマンド

```bash
# Markdownのlint
pnpm lint

# Markdownのlint（自動修正）
pnpm lint:fix

# コードのlint
pnpm code:lint

# コードのlint（自動修正）
pnpm code:fix

# CDKデプロイ
pnpm cdk:deploy

# CDKスタック削除
pnpm cdk:destroy
```

## 構成

- `blog_content/` - ブログ記事のMarkdownファイル
- `packages/cdk/` - AWS CDKプロジェクト（サンプルコード用）
- `.vscode/` - VSCode設定
- `.kiro/` - Kiro設定とフック

## 注意事項

- セットアップスクリプトは以下を自動更新します：
  - ルート `package.json` の name と description
  - CDK プロジェクトの `packages/cdk/package.json` の name
  - Kiro Hook の workspaceFolderName