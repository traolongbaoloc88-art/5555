import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate} from './profit.js';
import {config} from './config.js';
const a=config.assumptions;
test('short lẻ: VAT trên vốn sau tăng, phí mỗi đơn, phân bổ cố định',()=>{
 const r=calculate({baseCost:90000,price:249000,quantity:1},a);
 assert.equal(r.goodsCost,108000);assert.equal(r.adCost,62250);
 assert.equal(r.contribution,43750);assert.equal(r.netProfit,-6250);
 assert.equal(r.monthlyProfit,-625000);assert.equal(r.breakEvenOrders,115);
 assert.equal(r.netMargin,-6250/249000);
});
test('combo 2 và 3 chỉ tính phí đơn một lần',()=>{
 for(const [quantity,price,expected] of [[2,449000,85750],[3,650000,128500]]){
 const r=calculate({baseCost:90000,price,quantity},a);assert.equal(r.contribution,expected);assert.equal(r.orderFees,35000);
 }
});
test('giá hòa vốn cho lợi nhuận bằng 0; số đơn làm tròn lên',()=>{
 const args={baseCost:150000,price:720000,quantity:2};
 const r=calculate(args,a);
 assert.ok(Math.abs(calculate({...args,price:r.breakEvenPrice},a).netProfit)<1e-8);
 assert.ok(r.breakEvenOrders*r.contribution>=a.fixedMonthly);
 assert.ok((r.breakEvenOrders-1)*r.contribution<a.fixedMonthly);
});
test('tăng vốn 15k và ads 35%',()=>{
 const r=calculate({baseCost:90000,price:249000,quantity:1},{...a,costIncrease:15000,adRate:0.35});
 assert.ok(Math.abs(r.contribution-13450)<1e-8);
});
test('thiếu giá, lỗ và đầu vào không hợp lệ',()=>{
 const v={baseCost:90000,price:100000,quantity:1};
 assert.equal(calculate({...v,price:null},a),null);
 assert.equal(calculate(v,a).breakEvenOrders,null);
 for(const overrides of [{monthlyOrders:0},{adRate:1},{shipping:-1},{vatRate:NaN}])
 assert.throws(()=>calculate(v,{...a,...overrides}));
 assert.throws(()=>calculate({...v,price:0},a));
});
test('6 SKU x 3 gói và vốn mặc định',()=>{
 assert.equal(config.products.length,6);
 for(const p of config.products) for(let i=0;i<3;i++){
 const r=calculate({baseCost:p.baseCost,price:p.prices[i],quantity:i+1},a);
 assert.equal(r===null,i===2);
 }
});
