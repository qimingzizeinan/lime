import colors from 'colors';
import { success, error, info } from '@/utils/colors';

test('success function should log green message', () => {
  const mockLog = jest.spyOn(console, 'log');
  success('test');
  expect(mockLog).toHaveBeenCalledWith(colors.green('✅ test'));
  mockLog.mockRestore();
});

test('error function should log red message', () => {
  const mockLog = jest.spyOn(console, 'log');
  error('test');
  expect(mockLog).toHaveBeenCalledWith(colors.red('❌ test'));
  mockLog.mockRestore();
});

test('info function should log black message', () => {
  const mockLog = jest.spyOn(console, 'log');
  info('test');
  expect(mockLog).toHaveBeenCalledWith(colors.black('📣 test'));
  mockLog.mockRestore();
});
