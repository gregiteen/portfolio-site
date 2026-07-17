import { execFile } from 'node:child_process';
import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const MAILBOX_RE = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
const HASH_RE = /^\{[A-Z0-9-]{2,32}\}[A-Za-z0-9./$=+_-]{20,512}$/;

export function validateMailboxPassword(email, password) {
  if (typeof email !== 'string' || !MAILBOX_RE.test(email) || email.length > 254) {
    throw new Error('Invalid mailbox address');
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 256) {
    throw new Error('Password must be between 8 and 256 characters');
  }
  if (/[\u0000-\u001f\u007f]/.test(password)) {
    throw new Error('Password cannot contain control characters');
  }
}

export function parseMailcowConfig(raw) {
  const values = {};
  for (const sourceLine of String(raw || '').split(/\r?\n/)) {
    const line = sourceLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }
  return values;
}

export function updateEnvAssignment(raw, key, value) {
  if (!/^[A-Z][A-Z0-9_]*$/.test(key)) throw new Error('Invalid environment key');
  const line = `${key}=${JSON.stringify(String(value))}`;
  const input = String(raw || '');
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  if (pattern.test(input)) return input.replace(pattern, line);
  return `${input.replace(/\s*$/, '')}\n${line}\n`;
}

export async function retryMailcowCommand(run, { attempts = 3, delayMs = 400 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
  throw lastError;
}

export async function setMailcowMailboxPassword({
  email,
  password,
  mailcowRoot = '/opt/mailcow-dockerized',
  readFileImpl = readFile,
  runCommand = (file, args, options) => execFileAsync(file, args, options),
}) {
  validateMailboxPassword(email, password);
  const config = parseMailcowConfig(await readFileImpl(`${mailcowRoot}/mailcow.conf`, 'utf8'));
  const dbUser = config.DBUSER;
  const dbPass = config.DBPASS;
  const dbName = config.DBNAME;
  const scheme = config.MAILCOW_PASS_SCHEME || 'BLF-CRYPT';
  if (!dbUser || !dbPass || !dbName) throw new Error('Mailcow database configuration is incomplete');
  if (!/^[A-Z0-9-]{2,32}$/.test(scheme)) throw new Error('Mailcow password scheme is invalid');

  const commandOptions = { cwd: mailcowRoot, encoding: 'utf8', timeout: 30_000, maxBuffer: 1024 * 1024 };
  const hashResult = await retryMailcowCommand(() => runCommand('docker', [
    'compose', 'exec', '-T', 'dovecot-mailcow',
    'doveadm', 'pw', '-s', scheme, '-p', password,
  ], commandOptions));
  const hash = String(hashResult?.stdout || '').trim();
  if (!HASH_RE.test(hash)) throw new Error('Mailcow returned an invalid password hash');

  const sql = `UPDATE mailbox SET password='${hash}' WHERE username='${email}' LIMIT 1; SELECT ROW_COUNT();`;
  const updateResult = await retryMailcowCommand(() => runCommand('docker', [
    'compose', 'exec', '-T', 'mysql-mailcow',
    'mysql', `--user=${dbUser}`, `--password=${dbPass}`, dbName,
    '--batch', '--skip-column-names', '--execute', sql,
  ], commandOptions));
  const changed = String(updateResult?.stdout || '').trim().split(/\s+/).pop();
  if (changed !== '1') throw new Error('Mailbox password update did not affect exactly one account');
  return { scheme };
}

export async function persistAppMailboxPassword(envPath, password) {
  validateMailboxPassword('sales@gregiteen.xyz', password);
  const current = await readFile(envPath, 'utf8');
  const next = updateEnvAssignment(current, 'IMAP_PASS', password);
  const tempPath = `${envPath}.tmp-${process.pid}-${Date.now()}`;
  try {
    await writeFile(tempPath, next, { encoding: 'utf8', mode: 0o600 });
    await rename(tempPath, envPath);
  } finally {
    await rm(tempPath, { force: true }).catch(() => {});
  }
}
