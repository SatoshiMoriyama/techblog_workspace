# 変更スコープ宣言

## タスク
企画に基づきAmazon Aurora PostgreSQL Serverless Express Configurationの「やってみた」記事を執筆

## 変更予定
| 種別 | ファイル |
|------|---------|
| 変更 | `blog_content/blog.md` |

## 推定規模
Medium

## 影響範囲
- blog_content/blog.md: テンプレート状態から記事全文へ書き換え（約4000文字、コードブロック除く）
- 記事構成: はじめに → Express Configurationとは？ → やってみた（DB作成・接続） → 制約事項 → DSQLとの比較所感 → 過去記事紹介 → まとめ の7セクション
- スクリーンショットマーカー: 3箇所（Express Configuration作成画面、Available状態、CloudShell接続成功画面）
- 外部リンク: AWS公式ブログ、公式ドキュメント、過去Qiita記事の3件（Qiita埋め込み形式）