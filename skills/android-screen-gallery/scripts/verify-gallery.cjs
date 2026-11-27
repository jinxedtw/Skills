const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = process.argv[2];
assert(root, 'Pass the generated grallery folder');
const page = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const data = page.match(/<script id="screens" type="application\/json">([\s\S]*?)<\/script>/)[1];
const records = JSON.parse(data);
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'screenshots', 'manifest.json'), 'utf8'));
const metadata = JSON.parse(fs.readFileSync(path.join(root, 'metadata.json'), 'utf8'));
assert.equal(records.length, manifest.length);
assert.equal(records.length, metadata.count);
assert.equal(path.basename(path.resolve(root)), metadata.folderName);
assert(metadata.folderName.endsWith('-grallery'));
assert(fs.statSync(path.join(root, 'contact-sheet.jpg')).size > 0, 'Generate the contact sheet first');
assert(fs.statSync(path.join(root, '使用说明.txt')).size > 0);
assert(records.length > 0);
for (const record of records) {
  assert(!/[/\\]/.test(record.file));
  const bytes = fs.readFileSync(path.join(root, 'screenshots', record.file));
  assert.equal(record.src, 'data:image/png;base64,' + bytes.toString('base64'));
  assert(bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
  assert.equal(record.width, bytes.readUInt32BE(16));
  assert.equal(record.height, bytes.readUInt32BE(20));
}
function element() {
  return {
    children: [], attrs: {}, textContent: '', open: false,
    append(...items) { this.children.push(...items); },
    replaceChildren(...items) { this.children = items; },
    setAttribute(k, v) { this.attrs[k] = v; },
    showModal() { this.open = true; },
    close() { this.open = false; this.onclose?.(); }, focus() {},
  };
}
const elements = {};
const document = {
  querySelector(selector) { return elements[selector] ??= element(); },
  createElement() { return element(); },
  addEventListener() {},
};
document.querySelector('#screens').textContent = data;
const script = [...page.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].at(-1)[1];
vm.runInNewContext(script, { document });
assert.equal(elements['#grid'].children.length, records.length);
const categoryButton = elements['#filters'].children[1];
categoryButton.onclick();
assert.equal(elements['#grid'].children.length, records.filter(r => r.category === categoryButton.textContent).length);
elements['#filters'].children[0].onclick();
elements['#search'].oninput({ target: { value: records[0].title } });
assert(elements['#grid'].children.length > 0);
elements['#grid'].children[0].children[0].onclick();
assert.equal(elements['#lightbox'].open, true);
assert(elements['#large'].src.startsWith('data:image/png;base64,'));
elements['#next'].onclick();
elements['#previous'].onclick();
elements['#close'].onclick();
assert.equal(elements['#lightbox'].open, false);
elements['#search'].oninput({ target: { value: 'no-such-page-8492' } });
assert.equal(elements['#grid'].children.length, 0);
assert.equal(elements['#empty'].hidden, false);
console.log(`Verified ${records.length} embedded originals, gallery rendering, category filters, search and lightbox handlers.`);
