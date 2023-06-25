import * as fs from 'fs-extra';
import * as path from 'path';
import {
  checkDirectory,
  checkFileExists,
  copyDirectory,
  copyFile,
} from '@/utils/file';

// 创建一个临时目录用于测试
const tempDir = path.join(__dirname, 'temp');
const sourceDirectory = path.join(__dirname, 'source-directory');

// 在执行测试之前创建临时目录
beforeAll(() => {
  fs.mkdirSync(tempDir);
  fs.mkdirSync(sourceDirectory);
});

// 在执行测试后删除临时目录
afterAll(() => {
  fs.removeSync(tempDir);
  fs.removeSync(sourceDirectory);
});

// 测试 checkDirectory 函数
describe('checkDirectory', () => {
  it('should return true if the directory exists', async () => {
    const result = await checkDirectory(tempDir);
    expect(result).toBe(true);
  });

  it('should return false if the directory does not exist', async () => {
    const result = await checkDirectory('/non-existing-directory');
    expect(result).toBe(false);
  });
});

// 测试 checkFileExists 函数
describe('checkFileExists', () => {
  it('should return true if the file exists', () => {
    const result = checkFileExists(__dirname, 'file.spec.ts');
    expect(result).toBe(true);
  });

  it('should return false if the file does not exist', () => {
    const result = checkFileExists(__dirname, 'non-existing-file');
    expect(result).toBe(false);
  });
});

// 测试 copyDirectory 函数
describe('copyDirectory', () => {
  it('should copy a directory to another location', async () => {
    const srcDir = sourceDirectory;
    const destDir = path.join(tempDir, 'destination-directory');

    await copyDirectory(srcDir, destDir);
    const result = fs.existsSync(destDir);
    expect(result).toBe(true);
  });
});

// 测试 copyFile 函数
describe('copyFile', () => {
  it('should copy a file to another location', async () => {
    const srcFile = path.join(__dirname, 'file.spec.ts');
    const destFile = path.join(tempDir, 'file.spec.ts');

    await copyFile(srcFile, destFile);
    const result = fs.existsSync(destFile);
    expect(result).toBe(true);
  });
});
