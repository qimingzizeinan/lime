export * from './colors';
export * from './file';
export * from './repo';
export * from './check-installed';
export * from './cmd';
export * from './path';

/**
 * getTime
 * @returns 2020-6-19_00-00-00
 */
export const getTime = function getTime() {
  const _Date = new Date();
  const date = _Date.toJSON().split('T')[0];
  const time = _Date.toTimeString().split(' ')[0].replace(/:/g, '-');
  return `${date}_${time}`;
};
