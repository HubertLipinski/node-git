import { expect } from 'chai';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execPromise = promisify(exec);

describe('Command parameters', () => {
  const cliPath = path.join(__dirname, '../dist/index.js');

  it('should show usage for "help" command', async () => {
    const { stdout } = await execPromise(`node ${cliPath} help`);
    expect(stdout.trim()).to.include('Usage');
  });

  it('should show unknown command message for invalid command', async () => {
    const { stdout } = await execPromise(`node ${cliPath} not_existing`);
    expect(stdout.trim()).to.equal('Unknown command: not_existing');
  });
});