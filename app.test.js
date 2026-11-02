import test from 'node:test';
import assert from 'node:assert/strict';
import {config} from './config.js';
import {calculate} from './profit.js';

// Minimal DOM harness: execute the real app and dispatch its input/reset handlers.
class Element {
 constructor(tag) { this.tag=tag; this.children=[]; this.attrs={}; this.listeners={}; this.validity={badInput:false}; this.textContent=''; }
 append(...nodes) { this.children.push(...nodes); }
 replaceChildren(...nodes) { this.children=[...nodes]; }
 setAttribute(k,v) { this.attrs[k]=v; }
 setCustomValidity(message) { this.validationMessage=message; }
 addEventListener(k,fn) { this.listeners[k]=fn; }
 querySelector(tag) { return this.children.find(n=>n.tag===tag); }
 enter(value,badInput=false) {
  this.value=value; this.valueAsNumber=value===''?NaN:Number(value);
  this.validity.badInput=badInput; this.listeners.input();
 }
}
const nodes=Object.fromEntries(['assumptions','products','results','error','reset'].map(id=>['#'+id,new Element('div')]));
globalThis.document={createElement:tag=>new Element(tag),querySelector:id=>nodes[id]};
await import('./app.js');
const reset=()=>nodes['#reset'].onclick();
const field=n=>nodes['#products'].children[n].children[4];
const input=n=>field(n).querySelector('input');
const hint=n=>field(n).querySelector('small');
const row=n=>nodes['#results'].children[n*3+2];
const money=v=>new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(v);

test('all six Combo 3 start empty with linked guidance and no calculated results',()=>{
 reset();
 assert.equal(nodes['#results'].children.length,18);
 for(let n=0;n<6;n++){
  assert.equal(config.products[n].prices[2],null);
  assert.equal(input(n).value,'');
  assert.match(hint(n).textContent,/Chưa nhập giá Combo 3/);
  assert.match(hint(n).textContent,/không tự dùng giá lịch sử/);
  assert.equal(input(n).attrs['aria-describedby'],hint(n).id);
  assert.equal(input(n).attrs['aria-invalid'],'false');
  assert.equal(row(n).children[1].textContent,'Combo 3');
  assert.deepEqual(row(n).children.slice(3).map(c=>c.textContent),Array(6).fill('—'));
 }
});

test('valid user price calculates all six SKUs using unchanged formula; clearing removes stale results',()=>{
 reset();
 for(let n=0;n<6;n++){
  input(n).enter('650123');
  const r=calculate({baseCost:config.products[n].baseCost,quantity:3,price:650123},config.assumptions);
  assert.equal(row(n).children[3].textContent,money(r.contribution));
  assert.equal(row(n).children[4].textContent,money(r.netProfit));
  assert.equal(hint(n).textContent,'');
  assert.equal(input(n).validationMessage,'');
  input(n).enter('');
  assert.match(row(n).children[2].textContent,/Chưa nhập giá/);
  assert.equal(row(n).children[4].textContent,'—');
 }
});

test('zero, negative, nonfinite and browser badInput are errors isolated to their row; valid input recovers',()=>{
 for(const [value,badInput] of [['0',false],['-1',false],['Infinity',false],['NaN',false],['',true]]){
  reset();
  const other=nodes['#results'].children[0].children.map(c=>c.textContent);
  input(0).enter(value,badInput);
  assert.equal(input(0).attrs['aria-invalid'],'true');
  assert.match(input(0).validationMessage,/số hữu hạn lớn hơn 0/);
  assert.equal(hint(0).textContent,input(0).validationMessage);
  assert.equal(row(0).children[2].textContent,hint(0).textContent);
  assert.equal(row(0).children[4].textContent,'—');
  assert.equal(nodes['#results'].children.length,18);
  assert.deepEqual(nodes['#results'].children[0].children.map(c=>c.textContent),other);
  assert.equal(nodes['#error'].textContent,'');
  input(0).enter('650000');
  assert.equal(input(0).attrs['aria-invalid'],'false');
  assert.equal(input(0).validationMessage,'');
  assert.equal(row(0).children[3].textContent,money(128500));
 }
});

test('reset clears entered prices and validation errors without mutating defaults',()=>{
 reset(); input(0).enter('650000'); input(1).enter('-1'); reset();
 for(let n=0;n<6;n++){
  assert.equal(input(n).value,'');
  assert.equal(input(n).attrs['aria-invalid'],'false');
  assert.equal(input(n).validationMessage,'');
  assert.match(hint(n).textContent,/Chưa nhập giá Combo 3/);
  assert.equal(config.products[n].prices[2],null);
 }
});
