const fs = require('node:fs');
const path = require('node:path');

function main() {
  const args = {};
  const allowed = new Set(['screens', 'output', 'app-name', 'date', 'device', 'language', 'exclusions', 'overwrite']);
  for (let i = 2; i < process.argv.length; i++) {
    const key = process.argv[i].replace(/^--/, '');
    if (!allowed.has(key) || !process.argv[i].startsWith('--')) throw Error(`Unknown argument: ${process.argv[i]}`);
    if (key === 'overwrite') args[key] = true;
    else {
      const value = process.argv[++i];
      if (!value || value.startsWith('--')) throw Error(`Missing value: --${key}`);
      args[key] = value;
    }
  }
  for (const key of ['screens', 'output', 'app-name', 'date', 'device', 'language', 'exclusions']) {
    if (!args[key]?.trim()) throw Error(`Required: --${key}`);
  }
  const appName = args['app-name'].trim();
  const safeName = appName.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/[. ]+$/g, '_');
  if (!safeName || safeName === '.' || safeName === '..') throw Error('Invalid app name');
  const input = path.resolve(args.screens);
  const output = path.resolve(args.output, `${safeName}-grallery`);
  if (fs.existsSync(output) && !args.overwrite) throw Error(`Output already exists; ask the user how to handle it: ${output}`);
  const raw = JSON.parse(fs.readFileSync(path.join(input, 'manifest.json'), 'utf8').replace(/^\uFEFF/, ''));
  if (!Array.isArray(raw) || !raw.length) throw Error('manifest.json must be a nonempty array');
  const names = new Set();
  const prepared = raw.map((record, i) => {
    const file = record.file;
    if (typeof file !== 'string' || /[/\\]/.test(file) || !file.toLowerCase().endsWith('.png') || file !== path.basename(file)) throw Error(`Invalid PNG filename: ${file}`);
    if (names.has(file.toLowerCase())) throw Error(`Duplicate filename: ${file}`);
    names.add(file.toLowerCase());
    for (const key of ['title', 'category']) if (typeof record[key] !== 'string' || !record[key].trim()) throw Error(`Missing ${key}: ${file}`);
    const source = path.join(input, file);
    if (fs.lstatSync(source).isSymbolicLink()) throw Error(`Screenshot must not be a symbolic link: ${file}`);
    const bytes = fs.readFileSync(source);
    if (bytes.length < 24 || !bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) || bytes.toString('ascii', 12, 16) !== 'IHDR') throw Error(`Invalid PNG: ${file}`);
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
    if (!width || !height) throw Error(`Invalid dimensions: ${file}`);
    const clean = { file, title: record.title, category: record.category, note: String(record.note || ''), width, height };
    return { bytes, clean, embedded: { ...clean, number: String(i + 1).padStart(2, '0'), src: 'data:image/png;base64,' + bytes.toString('base64') } };
  });
  const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const json = JSON.stringify(prepared.map(p => p.embedded)).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  const template = fs.readFileSync(path.join(__dirname, '../assets/gallery.html'), 'utf8');
  const replacements = {
    '__APP_NAME__': escapeHtml(appName), '__DATE__': escapeHtml(args.date),
    '__DEVICE__': escapeHtml(args.device), '__LANGUAGE__': escapeHtml(args.language),
    '__EXCLUSIONS__': escapeHtml(args.exclusions), '__DATA_JSON__': json,
  };
  const page = template.replace(/__APP_NAME__|__DATE__|__DEVICE__|__LANGUAGE__|__EXCLUSIONS__|__DATA_JSON__/g, key => replacements[key]);
  const originals = path.join(output, 'screenshots');
  fs.mkdirSync(originals, { recursive: true });
  for (const item of prepared) fs.writeFileSync(path.join(originals, item.clean.file), item.bytes);
  const metadata = { appName, folderName: path.basename(output), date: args.date, device: args.device, language: args.language, exclusions: args.exclusions, count: prepared.length };
  fs.writeFileSync(path.join(originals, 'manifest.json'), JSON.stringify(prepared.map(p => p.clean), null, 2) + '\n');
  fs.writeFileSync(path.join(output, 'metadata.json'), JSON.stringify(metadata, null, 2) + '\n');
  fs.writeFileSync(path.join(output, 'index.html'), page);
  fs.writeFileSync(path.join(output, '使用说明.txt'), `${appName} 页面截图图册\n日期：${args.date}\n设备：${args.device}\n界面语言：${args.language}\n共 ${prepared.length} 张真实截图。\n\n打开 index.html 离线浏览，可分类、搜索、放大并使用左右方向键翻页。图片已内嵌，可单独复制 HTML。\nscreenshots 保存原始 PNG 与页面清单。contact-sheet.jpg 为截图总览，单独运行总览脚本生成。\n\n范围与限制：${args.exclusions}\n`);
  console.log(JSON.stringify({ output, count: prepared.length, renamedFolder: safeName !== appName }, null, 2));
}
try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
