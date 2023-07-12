import path from 'path';
import fs from 'fs-extra';

export async function createOrOverwriteSnippets(cwd = process.cwd()) {
  const vscodeSnippetsDir = path.join(cwd, '.vscode');
  const originSnippetsDir = path.join(cwd, 'snippets');
  const snippets: Record<string, unknown> = {};
  // 读取originSnippetsDir目录下的所有文件
  const files = await fs.readdir(originSnippetsDir);
  // 遍历所有文件
  for (const file of files) {
    try {
      const data = await require(path.join(originSnippetsDir, file));
      // 如果没有body字段，则跳过
      if (data.body === undefined) {
        continue;
      }

      const snippetBody = convertSnippetBody(data.body());

      snippets[data.prefix] = {
        scope: 'javascript,typescript',
        prefix: data.prefix,
        body: snippetBody,
        description: data.description,
      };
    } catch (error) {
      /* empty */
    }
  }

  if (Object.keys(snippets).length === 0) {
    console.log('No snippets found.');
    return;
  }

  // 将 snippetsList 写入 VSCode 的 snippets 文件中
  const snippetsFilePath = path.join(vscodeSnippetsDir, 'kiwi.code-snippets');
  await fs.ensureDir(vscodeSnippetsDir);
  await fs.writeJson(snippetsFilePath, snippets, { spaces: 2 });

  console.log('Snippets created or overwritten successfully.');
}

function convertSnippetBody(snippetBody: string) {
  const lines = snippetBody.trim().split('\n');
  return lines.map((line) => line.trim());
}
