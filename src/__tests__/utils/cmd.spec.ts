import { spawn } from 'child_process';
import { runCommand } from '@/utils/cmd';

jest.mock('child_process');

describe('runCommand', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should run a shell command and resolve when the command exits with code 0', async () => {
    // Mock the spawn function to return a child process with exit code 0
    const mockChild = {
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'exit') {
          callback(0);
        }
      }),
      stdout: {
        on: jest.fn(),
      },
      stderr: {
        on: jest.fn(),
      },
    };
    (spawn as jest.Mock).mockReturnValue(mockChild);

    // Call the function
    await runCommand('echo hello');

    // Assert that spawn is called with the correct arguments
    expect(spawn).toHaveBeenCalledWith('echo hello', { shell: true });

    // Assert that the child process events are set up correctly
    expect(mockChild.stdout.on).toHaveBeenCalled();
    expect(mockChild.stderr.on).toHaveBeenCalled();

    // Assert that the on('exit') callback is called with code 0
    expect(mockChild.on).toHaveBeenCalledWith('exit', expect.any(Function));
  });

  it('should run a shell command and reject when the command exits with a non-zero code', async () => {
    // Mock the spawn function to return a child process with exit code 1
    const mockChild = {
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'exit') {
          callback(1);
        }
      }),
      stdout: {
        on: jest.fn(),
      },
      stderr: {
        on: jest.fn(),
      },
    };
    (spawn as jest.Mock).mockReturnValue(mockChild);


    // Call the function and assert that it rejects with an error
    await expect(runCommand('invalid command')).rejects.toThrowError(
      'Command "invalid command" exited with non-zero status code: 1'
    );

    // Assert that spawn is called with the correct arguments
    expect(spawn).toHaveBeenCalledWith('invalid command', { shell: true });

    // Assert that the child process events are set up correctly
    expect(mockChild.stdout.on).toHaveBeenCalled();
    expect(mockChild.stderr.on).toHaveBeenCalled();

    // Assert that the on('exit') callback is called with code 1
    expect(mockChild.on).toHaveBeenCalledWith('exit', expect.any(Function));

  });
});

