const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../frontend/public/js/common.js'), 'utf8').split('// Keep page transitions')[0];
function context(storage) {
  const window = {};
  Object.defineProperty(window, 'localStorage', { get: () => { if (storage instanceof Error) throw storage; return storage; } });
  const ctx = vm.createContext({ window, document: { getElementById: () => true }, console });
  vm.runInContext(source, ctx);
  return (code) => vm.runInContext(code, ctx);
}
test('blocked storage getter supports the full in-tab lifecycle', () => {
 const run = context(new Error('SecurityError'));
 assert.equal(run('localStore.getItem("round")'), null);
 run('writeJson(localStore, "round", {score: 3});');
 assert.equal(run('readJson(localStore, "round", {}).score'), 3);
 run('localStore.removeItem("round")');
 assert.equal(run('localStore.getItem("round")'), null);
});
test('quota failure never resurrects stale values after write or remove', () => {
 const run = context({getItem: () => 'old', setItem: () => {throw Error('QuotaExceededError')}, removeItem: () => {throw Error('blocked')} });
 run('localStore.setItem("round", "new")');
 assert.equal(run('localStore.getItem("round")'), 'new');
 run('localStore.removeItem("round")');
 assert.equal(run('localStore.getItem("round")'), null);
});
test('malformed JSON and invalid score/result records are rejected', () => {
 const run = context({getItem: () => '{broken'});
 assert.equal(run('readJson(localStore, "round", 42)'), 42);
 assert.equal(run('Boolean(isScore(null))'), false);
 assert.equal(run('Boolean(isScore({name:"a", category: {}, total: 1}))'), false);
 assert.equal(run('Boolean(isResult({question:"a", choices:null}))'), false);
});
