import {config} from './config.js';
import {calculate} from './profit.js';
let state;
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
 el.value=value ?? ''; el.addEventListener('input',()=>{change(el.value===''?null:el.valueAsNumber); render();});
 wrap.append(el); return wrap;
}
function init(){
 state=structuredClone(config);
 const form=document.querySelector('#assumptions'); form.replaceChildren();
 for(const [key,label,scale,min,step] of fields)
   form.append(input(label,state.assumptions[key]*scale,v=>state.assumptions[key]=v===null?NaN:v/scale,min,step));
 form.onsubmit=e=>e.preventDefault();
 const products=document.querySelector('#products'); products.replaceChildren();
 state.products.forEach(p=>{
   const card=document.createElement('article'); const title=document.createElement('h3');title.textContent=p.name;card.append(title);
   card.append(input('Giá vốn/chiếc',p.baseCost,v=>p.baseCost=v===null?NaN:v));
   p.prices.forEach((v,i)=>card.append(input(i===0?'Giá lẻ':'Combo '+(i+1),v,x=>p.prices[i]=x)));
   products.append(card);
 });
 render();
}
function render(){
 const body=document.querySelector('#results'),error=document.querySelector('#error');body.replaceChildren();error.textContent='';
 try{
  const rows=[];
  for(const p of state.products) for(let i=0;i<3;i++){
   const r=calculate({baseCost:p.baseCost,price:p.prices[i],quantity:i+1},state.assumptions);
   const values=r?[p.name,i===0?'Lẻ':'Combo '+(i+1),money(p.prices[i]),money(r.contribution),money(r.netProfit),(r.netMargin*100).toFixed(1)+'%',money(r.monthlyProfit),r.breakEvenOrders===null?'Không thể hòa vốn':r.breakEvenOrders,money(r.breakEvenPrice)]:[p.name,'Gói '+(i+1),'Chưa nhập giá','—','—','—','—','—','—'];
   const tr=document.createElement('tr');
   if(r && r.netProfit<0) tr.className='loss';
   values.forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);}); rows.push(tr);
  }
  body.append(...rows);
 }catch(e){error.textContent=e.message;}
}
document.querySelector('#reset').onclick=init;
init();
