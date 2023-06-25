import { resolvePath, extractPart } from '@/utils/path';

describe('resolvePath', () => {
  test('returns the correct absolute path', () => {
    const result = resolvePath('/home/user', 'file.txt');
    expect(result).toBe('/home/user/file.txt');
  });

  test('returns the correct absolute path for nested paths', () => {
    const result = resolvePath('/home/user', 'subfolder/file.txt');
    expect(result).toBe('/home/user/subfolder/file.txt');
  });
});

describe('extractPart', () => {
  test('returns the extracted part of the filename when a match is found', () => {
    const result = extractPart('lime.test.yaml');
    expect(result).toBe('test');
  });

  test('returns null when no match is found', () => {
    const result = extractPart('other.filename.yaml');
    expect(result).toBeNull();
  });
});
