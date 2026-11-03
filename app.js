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
function input(label,value,change,min=0,step=1000,comboId=null) {
 const wrap=document.createElement('label'); wrap.textContent=label;
 const el=document.createElement('input'); el.type='number'; el.min=min; el.step=step;
 el.value=value ?? '';
 let hint;
 if(comboId){
   hint=document.createElement('small'); hint.id=comboId;
   hint.setAttribute('aria-live','polite');
   el.setAttribute('aria-describedby',comboId); el.min=1; el.step='any';
 }
 const update=()=>{
   const v=el.validity.badInput?NaN:el.value===''?null:el.valueAsNumber;
   if(hint){
     const invalid=v!==null && (!Number.isFinite(v)||v<=0);
     el.setAttribute('aria-invalid',String(invalid));
     hint.textContent=invalid?'Giá Combo 3 phải là số lớn hơn 0 (đồng).':v===null?'Chưa có giá Combo 3 cập nhật. Nhập tổng giá 3 chiếc (đồng) để tính; không tự dùng giá lịch sử.':'Đang tính theo giá Combo 3 bạn nhập; đây không phải giá cập nhật đã xác nhận.';
     el.setCustomValidity(invalid?'Giá Combo 3 phải là số lớn hơn 0 (đồng).':'');
   }
   change(v);
 };
 el.addEventListener('input',()=>{update(); render();});
 if(hint){update();wrap.append(hint);}
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
   p.prices.forEach((v,i)=>card.append(input(i===0?'Giá lẻ':'Combo '+(i+1),v,x=>p.prices[i]=x,0,1000,i===2?'combo3-'+p.id:null)));
   products.append(card);
 });
 render();
}
function render(){
 const body=document.querySelector('#results'),error=document.querySelector('#error');body.replaceChildren();error.textContent='';
 try{
  const rows=[];
  for(const p of state.products) for(let i=0;i<3;i++){
   const label=i===0?'Lẻ':'Combo '+(i+1);
   let r=null, message=i===2?'Chưa nhập giá Combo 3 — nhập tổng giá 3 chiếc để tính':'Chưa nhập giá';
   try{
     r=calculate({baseCost:p.baseCost,price:p.prices[i],quantity:i+1},state.assumptions);
   }catch(e){
     message=i===2 && (!Number.isFinite(p.prices[i]) || p.prices[i]<=0)?'Giá Combo 3 phải là số lớn hơn 0 (đồng).':e.message;
     error.textContent='Có dữ liệu không hợp lệ. Xem thông báo tại từng dòng.';
   }
   const values=r?[p.name,label,money(p.prices[i]),money(r.contribution),money(r.netProfit),(r.netMargin*100).toFixed(1)+'%',money(r.monthlyProfit),r.breakEvenOrders===null?'Không thể hòa vốn':r.breakEvenOrders,money(r.breakEvenPrice)]:[p.name,label,message,'—','—','—','—','—','—'];
   const tr=document.createElement('tr');
   if(r && r.netProfit<0) tr.className='loss';
   values.forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);}); rows.push(tr);
  }
  body.append(...rows);
 }catch(e){error.textContent=e.message;}
}
document.querySelector('#reset').onclick=init;
init();
