#!/usr/bin/env node

const fs = require('fs');

function main() {
  const blogName = process.argv[2];
  
  if (!blogName) {
    console.error('使用方法: pnpm setup-blog <blog-name>');
    console.error('例: pnpm setup-blog aws-lambda-tips');
    process.exit(1);
  }

  // kebab-caseに変換
  const kebabName = blogName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')   // 非英数字をハイフンに
    .replace(/-+/g, '-')           // 連続するハイフンを1つに
    .replace(/^-+|-+$/g, '');      // 先頭・末尾のハイフンを削除
  const workspaceName = `${kebabName}-blog`;
  
  console.log(`ブログワークスペースをセットアップ中: ${workspaceName}`);

  try {
    // 1. ルートpackage.jsonを更新
    updateRootPackageJson(workspaceName, kebabName);
    
    // 2. CDK package.jsonを更新
    updateCdkPackageJson(kebabName);
    
    // 3. Kiro Hookを更新
    updateKiroHook(workspaceName);
    
    console.log('✅ セットアップ完了!');
    console.log(`ワークスペース名: ${workspaceName}`);
    console.log('blog_content/blog.md を編集してブログを書き始めてください。');
    
  } catch (error) {
    console.error('❌ セットアップ中にエラーが発生しました:', error.message);
    process.exit(1);
  }
}

function updateRootPackageJson(workspaceName, kebabName) {
  const packagePath = 'package.json';
  
  let packageJson;
  try {
    packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  } catch (error) {
    throw new Error(`${packagePath} の読み込みに失敗しました: ${error.message}`);
  }
  
  packageJson.name = workspaceName;
  packageJson.description = `${kebabName}に関する技術ブログ記事の執筆・校正とコード検証のためのワークスペース`;
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ ${packagePath} を更新しました`);
}

function updateCdkPackageJson(kebabName) {
  const cdkPackagePath = 'packages/cdk/package.json';
  
  if (fs.existsSync(cdkPackagePath)) {
    let cdkPackageJson;
    try {
      cdkPackageJson = JSON.parse(fs.readFileSync(cdkPackagePath, 'utf8'));
    } catch (error) {
      throw new Error(`${cdkPackagePath} の読み込みに失敗しました: ${error.message}`);
    }
    
    cdkPackageJson.name = `${kebabName}-cdk`;
    
    fs.writeFileSync(cdkPackagePath, JSON.stringify(cdkPackageJson, null, 2) + '\n');
    console.log(`✅ ${cdkPackagePath} を更新しました`);
  }
}

function updateKiroHook(workspaceName) {
  const hookPath = '.kiro/hooks/agent-completion-sound.kiro.hook';
  
  if (fs.existsSync(hookPath)) {
    let hookJson;
    try {
      hookJson = JSON.parse(fs.readFileSync(hookPath, 'utf8'));
    } catch (error) {
      throw new Error(`${hookPath} の読み込みに失敗しました: ${error.message}`);
    }
    
    hookJson.workspaceFolderName = workspaceName;
    
    fs.writeFileSync(hookPath, JSON.stringify(hookJson, null, 2) + '\n');
    console.log(`✅ ${hookPath} を更新しました`);
  }
}

main();