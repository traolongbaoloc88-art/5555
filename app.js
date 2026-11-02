import {config} from './config.js';
import {calculate} from './profit.js';
let state;
const priceInputs = new Map();
const priceStatus = price => price === null ? 'missing' :
 Number.isFinite(price) && price > 0 ? 'valid' : 'invalid';
const money = v => new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(v);
const fields = [
 ['costIncrease','Tăng vốn/chiếc (10–15 nghìn)',1,0,1000],
 ['vatRate','VAT đầu vào (%)',100,0,1],
 ['adRate','Quảng cáo (%), thường 20–35',100,0,1],
 ['shipping','Ship/đơn',1,0,1000],['packaging','Đóng gói/đơn',1,0,1000],
 ['cod','COD/đơn',1,0,1000],['fixedMonthly','Cố định/tháng',1,0,100000],
 ['monthlyOrders','Số đơn dự kiến/tháng',1,1,1]
];
function input(label,value,change,min=0,step=1000) {
 const wrap=document.createElement('label'); wrap.textContent=label;
 const el=document.createElement('input'); el.type='number'; el.min=min; el.step=step;
 el.value=value ?? ''; el.addEventListener('input',()=>{change(el.validity.badInput?NaN:el.value===''?null:el.valueAsNumber); render();});
 wrap.append(el); return wrap;
}
function init(){
 state=structuredClone(config);
 priceInputs.clear();
 const form=document.querySelector('#assumptions'); form.replaceChildren();
 for(const [key,label,scale,min,step] of fields)
   form.append(input(label,state.assumptions[key]*scale,v=>state.assumptions[key]=v===null?NaN:v/scale,min,step));
 form.onsubmit=e=>e.preventDefault();
 const products=document.querySelector('#products'); products.replaceChildren();
 state.products.forEach(p=>{
   const card=document.createElement('article'); const title=document.createElement('h3');title.textContent=p.name;card.append(title);
   card.append(input('Giá vốn/chiếc',p.baseCost,v=>p.baseCost=v===null?NaN:v));
   p.prices.forEach((v,i)=>{
     const label=i===0?'Giá lẻ':'Combo '+(i+1);
     const wrap=input(label,v,x=>p.prices[i]=x,0,'any');
     const el=wrap.querySelector('input');
     const hint=document.createElement('small');
     hint.id='price-'+p.id+'-'+i+'-hint';
     hint.setAttribute('aria-live','polite');
     el.setAttribute('aria-describedby',hint.id);
     el.setAttribute('aria-label',p.name+' — '+label+' (đồng/cả gói)');
     el.placeholder='Nhập giá cả gói (đồng)';
     wrap.append(hint);
     priceInputs.set(p.id+'-'+i,{el,hint});
     card.append(wrap);
   });
   products.append(card);
 });
 render();
}
function render(){
 const body=document.querySelector('#results'),error=document.querySelector('#error');body.replaceChildren();error.textContent='';
 try{
  const rows=[];
  for(const p of state.products) for(let i=0;i<3;i++){
   const status=priceStatus(p.prices[i]);
   const label=i===0?'Lẻ':'Combo '+(i+1);
   const message=status==='missing'
     ? 'Chưa nhập giá '+label+' — nhập giá cả gói để tính; không tự dùng giá lịch sử.'
     : status==='invalid' ? 'Giá '+label+' phải là số hữu hạn lớn hơn 0 (đồng/cả gói).' : '';
   const {el,hint}=priceInputs.get(p.id+'-'+i);
   hint.textContent=message;
   hint.className=status==='invalid'?'price-error':'price-hint';
   el.setAttribute('aria-invalid',String(status==='invalid'));
   el.setCustomValidity(status==='invalid'?message:'');
   const r=status==='valid'?calculate({baseCost:p.baseCost,price:p.prices[i],quantity:i+1},state.assumptions):null;
   const values=r?[p.name,i===0?'Lẻ':'Combo '+(i+1),money(p.prices[i]),money(r.contribution),money(r.netProfit),(r.netMargin*100).toFixed(1)+'%',money(r.monthlyProfit),r.breakEvenOrders===null?'Không thể hòa vốn':r.breakEvenOrders,money(r.breakEvenPrice)]:[p.name,label,message,'—','—','—','—','—','—'];
   const tr=document.createElement('tr');
   if(r && r.netProfit<0) tr.className='loss';
   values.forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);}); rows.push(tr);
  }
  body.append(...rows);
 }catch(e){error.textContent=e.message;}
}
document.querySelector('#reset').onclick=init;
init();

