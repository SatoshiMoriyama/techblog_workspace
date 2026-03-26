## 指示書

### テーマ

Amazon Aurora PostgreSQL Serverlessの「数秒でデータベース作成」新機能を実際に試してみる

### 投稿先

Qiita（URLは単独行で貼る形式）

### ターゲット読者

普段AWSでAuroraを使っているユーザー

### 記事の構成

1. Aurora PostgreSQL Serverlessの新機能紹介（数秒でDB作成できるようになった）
2. 実際にDBを作成してみる
3. 接続してみる
4. 制約事項の確認
5. DSQLとの比較についての所感（これがあるならDSQLを無理に使わなくても…という観点）
6. 過去記事の紹介：IAM認証トークンでの接続が共通なので、同じように接続できるという文脈で紹介

### 参考URL

- https://aws.amazon.com/jp/blogs/aws/announcing-amazon-aurora-postgresql-serverless-database-creation-in-seconds/
- https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_GettingStartedAurora.AuroraPostgreSQL.ExpressConfig.html
- https://qiita.com/s_moriyama/items/35600a26f0c83f30a4ee （過去記事。IAM認証トークン接続の共通点として紹介）

### 参考メモ（blog_content/memo.md より）

- 実際に作ってみて、接続してみる。までを試す
- 制約事項はありそう
- これがあるならもうDSQLを無理に使わなくても…って感じは少しする
- 15分ごとのIAMトークンをパスワードに使う

### 記事に含めないこと

- SQLModel / SQLAlchemyベースのサンプルコード組み込みの話

### 優先度

- 高: 記事の構成1〜4（新機能紹介・DB作成・接続・制約事項）— 記事の本体
- 中: 構成5（DSQLとの比較所感）
- 中: 構成6（過去記事のIAM認証トークン接続の共通点としての紹介）