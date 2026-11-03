import test from 'node:test';
import assert from 'node:assert/strict';
import {config} from './config.js';
import {calculate} from './profit.js';

// Minimal DOM double exercises the actual app input handlers and rendered cells.
class Element {
 constructor(tag='div'){this.tag=tag;this.children=[];this.textContent='';this.attrs={};this.value='';this.validity={badInput:false};this.events={};}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=nodes;}
 setAttribute(key,value){this.attrs[key]=value;}
 addEventListener(name,fn){this.events[name]=fn;}
 setCustomValidity(message){this.validationMessage=message;}
 get valueAsNumber(){return this.value===''?NaN:Number(this.value);}
}
test('Combo 3: missing, invalid, valid, cleared and reset through UI',async()=>{
 const nodes=Object.fromEntries(['assumptions','products','results','error','reset'].map(id=>['#'+id,new Element()]));
 const previous=globalThis.document;
 globalThis.document={createElement:tag=>new Element(tag),querySelector:id=>nodes[id]};
 try{
   await import('./app.js');
   const rows=()=>nodes['#results'].children;
   const input=()=>nodes['#products'].children[0].children[4].children.find(el=>el.tag==='input');
   const hint=()=>nodes['#products'].children[0].children[4].children.find(el=>el.tag==='small');
   const enter=(value,badInput=false)=>{input().value=value;input().validity.badInput=badInput;input().events.input();};
   assert.equal(rows().length,18);
   for(let i=2;i<18;i+=3){
     assert.equal(rows()[i].children[1].textContent,'Combo 3');
     assert.match(rows()[i].children[2].textContent,/Chưa nhập giá Combo 3/);
   }
   assert.match(hint().textContent,/không tự dùng giá lịch sử/);
   assert.equal(input().attrs['aria-describedby'],hint().id);
   for(const [value,bad] of [['0',false],['-1',false],['Infinity',false],['',true]]){
     enter(value,bad);
     assert.equal(input().attrs['aria-invalid'],'true');
     assert.match(hint().textContent,/phải là số lớn hơn 0/);
     assert.match(rows()[2].children[2].textContent,/phải là số lớn hơn 0/);
     assert.equal(rows().length,18);
     assert.equal(rows()[0].children[2].textContent,new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(249000));
   }
   enter('650000');
   assert.equal(input().attrs['aria-invalid'],'false');
   assert.equal(input().validationMessage,'');
   assert.match(hint().textContent,/không phải giá cập nhật đã xác nhận/);
   assert.equal(nodes['#error'].textContent,'');
   const expected=calculate({baseCost:90000,quantity:3,price:650000},config.assumptions);
   assert.equal(rows()[2].children[3].textContent,new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(expected.contribution));
   enter('');
   assert.match(rows()[2].children[2].textContent,/Chưa nhập giá Combo 3/);
   assert.equal(input().attrs['aria-invalid'],'false');
   enter('700000');
   nodes['#reset'].onclick();
   assert.equal(input().value,'');
   assert.match(rows()[2].children[2].textContent,/Chưa nhập giá Combo 3/);
   assert.ok(config.products.every(p=>p.prices[2]===null));
 }finally{globalThis.document=previous;}
});
