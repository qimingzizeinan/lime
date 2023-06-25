import { execSync } from 'child_process';
import * as os from 'os';
import { checkRubyVersion } from '@/utils/check-installed';

describe('checkRubyVersion', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log the Ruby version if installed', () => {
    // Mock the os.platform() function to return 'darwin'
    jest.spyOn(os, 'platform').mockReturnValue('darwin');

    // Mock the execSync function to return a specific Ruby version
    jest
      .spyOn<any, any>(execSync, 'execSync')
      .mockImplementation(() =>
        Buffer.from('ruby 2.7.1p83 (2020-03-31 revision a0c7c23c9c)', 'utf-8')
      );

    // Mock the info function to check if it is called with the correct message
    const infoSpy = jest.spyOn(console, 'info');

    // Call the function
    checkRubyVersion();

    // Assert that the info function is called with the correct message
    expect(infoSpy).toHaveBeenCalledWith('Ruby version: 2.7.1');

    // Restore the original implementations of os.platform() and execSync
    jest.restoreAllMocks();
  });

  it('should log an error if Ruby version is less than 2.0.0', () => {
    // Mock the os.platform() function to return 'win32'
    jest.spyOn(os, 'platform').mockReturnValue('win32');

    // Mock the execSync function to return a specific Ruby version
    jest
      .spyOn<any, any>(execSync, 'execSync')
      .mockImplementation(() =>
        Buffer.from('ruby 1.9.3p551 (2020-03-31 revision a0c7c23c9c)', 'utf-8')
      );

    // Mock the errorMessage function to check if it is called with the correct message
    const errorMessageSpy = jest.spyOn(console, 'error');

    // Call the function
    checkRubyVersion();

    // Assert that the errorMessage function is called with the correct message
    expect(errorMessageSpy).toHaveBeenCalledWith(
      'Ruby version is less than 2.0.0, please upgrade.'
    );

    // Restore the original implementations of os.platform() and execSync
    jest.restoreAllMocks();
  });

  it('should log an error if Ruby is not installed', () => {
    // Mock the os.platform() function to return 'linux' (unsupported platform)
    jest.spyOn(os, 'platform').mockReturnValue('linux');

    // Mock the errorMessage function to check if it is called with the correct message
    const errorMessageSpy = jest.spyOn(console, 'error');

    // Call the function
    checkRubyVersion();

    // Assert that the errorMessage function is called with the correct message
    expect(errorMessageSpy).toHaveBeenCalledWith(
      'Ruby is not supported on this platform.'
    );

    // Restore the original implementation of os.platform()
    jest.restoreAllMocks();
  });
});
