#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const ROOT = __dirname;
const SOURCE_COMMIT = '56259e4ed3da7093c29ade0595784cf3396d6eec';
const SOURCE_URL = `https://codeload.github.com/tokovps/vpsnew55/tar.gz/${SOURCE_COMMIT}`;
const PATCH_XZ_SHA256 = 'a5ef600b6d10ae981c1c5e2e2f0fa3c2ca41410b827029e18cf1ee0aaaaf0766';
const PATCH_SHA256 = 'f251ec86b06b11ba0854b30fb1d7045797dc4718caf8e07b1b6522dca4bcc6a5';
const PATCH_PARTS = [
  path.join(ROOT, '.github', 'import', 'patch-xz.part-00'),
  path.join(ROOT, '.github', 'import', 'patch-xz.part-01'),
];

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || ROOT,
    env: process.env,
    stdio: 'inherit',
    shell: false,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`);
  }
}

function download(url, destination, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('Too many redirects while downloading source'));
    const request = https.get(url, {
      headers: { 'User-Agent': 'vpsnew56-bootstrap/1.0' },
    }, (response) => {
      const status = Number(response.statusCode || 0);
      if (status >= 300 && status < 400 && response.headers.location) {
        response.resume();
        const nextUrl = new URL(response.headers.location, url).toString();
        return resolve(download(nextUrl, destination, redirects + 1));
      }
      if (status !== 200) {
        response.resume();
        return reject(new Error(`Source download failed with HTTP ${status}`));
      }
      const output = fs.createWriteStream(destination, { mode: 0o600 });
      response.pipe(output);
      output.on('finish', () => output.close(resolve));
      output.on('error', reject);
    });
    request.setTimeout(60_000, () => request.destroy(new Error('Source download timed out')));
    request.on('error', reject);
  });
}

function isMaterialized() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    return pkg.name === 'telegram-vps-rdp-store' && fs.existsSync(path.join(ROOT, 'src', 'app.js'));
  } catch (_) {
    return false;
  }
}

function reconstructPatch(tempDir) {
  for (const part of PATCH_PARTS) {
    if (!fs.existsSync(part)) throw new Error(`Missing source revision part: ${path.relative(ROOT, part)}`);
  }
  const encoded = PATCH_PARTS.map((part) => fs.readFileSync(part, 'utf8').trim()).join('');
  const patchXz = path.join(tempDir, 'vpsnew56.patch.xz');
  const patchFile = path.join(tempDir, 'vpsnew56.patch');
  fs.writeFileSync(patchXz, Buffer.from(encoded, 'base64'), { mode: 0o600 });
  if (sha256(patchXz) !== PATCH_XZ_SHA256) throw new Error('Compressed revision checksum mismatch');
  const result = spawnSync('xz', ['--decompress', '--stdout', patchXz], { encoding: null });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`xz failed with exit code ${result.status}`);
  fs.writeFileSync(patchFile, result.stdout, { mode: 0o600 });
  if (sha256(patchFile) !== PATCH_SHA256) throw new Error('Revision checksum mismatch');
  return patchFile;
}

async function materialize() {
  if (isMaterialized()) return;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vpsnew56-'));
  try {
    const archive = path.join(tempDir, 'source.tar.gz');
    console.log(`Materializing VPSNEW56 from locked source commit ${SOURCE_COMMIT}...`);
    await download(SOURCE_URL, archive);
    run('tar', ['-xzf', archive, '-C', tempDir]);
    const sourceDir = fs.readdirSync(tempDir)
      .map((name) => path.join(tempDir, name))
      .find((candidate) => fs.existsSync(path.join(candidate, 'package.json')));
    if (!sourceDir) throw new Error('Downloaded source archive has no project root');

    const patchFile = reconstructPatch(tempDir);
    run('git', ['apply', '--check', patchFile], { cwd: sourceDir });
    run('git', ['apply', patchFile], { cwd: sourceDir });

    fs.cpSync(sourceDir, ROOT, { recursive: true, force: true, errorOnExist: false });
    if (!isMaterialized()) throw new Error('Materialized source validation failed');
    console.log('VPSNEW56 source materialized successfully.');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function installDependencies() {
  run('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund']);
  run(process.execPath, ['scripts/render-preflight.js']);
}

async function main() {
  const mode = process.argv[2] || '--install';
  await materialize();
  if (mode === '--install' || mode === '--build') {
    installDependencies();
    return;
  }
  if (mode === '--start') {
    if (!fs.existsSync(path.join(ROOT, 'node_modules', 'telegraf'))) installDependencies();
    run(process.execPath, ['src/app.js']);
    return;
  }
  throw new Error(`Unknown bootstrap mode: ${mode}`);
}

main().catch((error) => {
  console.error(`[VPSNEW56 bootstrap] ${error.stack || error.message || error}`);
  process.exit(1);
});
