import path from 'path';

/**
 * Resolves a sequence of paths or path segments into an absolute path.
 * @param {string} _path - The first path segment.
 * @param {string} _file - The second path segment.
 * @return {string} - The resolved absolute path.
 */
export const resolvePath = (_path: string, _file: string) =>
  path.resolve(_path, _file);

/**
 * Extracts a part of the filename that matches a specific pattern.
 * @param {string} filename - The filename to extract the part from.
 * @return {string|null} - The extracted part of the filename, or null if there is no match.
 */
export function extractPart(filename: string) {
  const matched = filename.match(/lime\.(.*?)\.(?:yaml|cjs|js)/);
  return matched ? matched[1] : null;
}
