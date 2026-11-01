// Pure calculation; no DOM or configuration dependency.
function nonnegative(value, name) {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(name + ' phải là số không âm');
}
export function calculate({baseCost, price, quantity}, a) {
  nonnegative(baseCost, 'Giá vốn');
  for (const key of ['costIncrease','vatRate','adRate','shipping','packaging','cod','fixedMonthly','monthlyOrders'])
    nonnegative(a[key], key);
  if (a.adRate >= 1 || a.vatRate > 1) throw new RangeError('Tỷ lệ không hợp lệ');
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 3) throw new RangeError('Số lượng phải từ 1–3');
  if (!Number.isInteger(a.monthlyOrders) || a.monthlyOrders < 1) throw new RangeError('Số đơn/tháng phải là số nguyên dương');
  if (price === null) return null;
  nonnegative(price, 'Giá bán');
  if (price === 0) throw new RangeError('Giá bán phải lớn hơn 0');
  const goodsCost = (baseCost + a.costIncrease) * (1 + a.vatRate) * quantity;
  const orderFees = a.shipping + a.packaging + a.cod;
  const adCost = price * a.adRate;
  const contribution = price - goodsCost - orderFees - adCost;
  const allocatedFixed = a.fixedMonthly / a.monthlyOrders;
  const netProfit = contribution - allocatedFixed;
  return { goodsCost, orderFees, adCost, contribution, contributionMargin: contribution / price,
    allocatedFixed, netProfit, netMargin: netProfit / price,
    monthlyProfit: contribution * a.monthlyOrders - a.fixedMonthly,
    breakEvenOrders: contribution > 0 ? Math.ceil(a.fixedMonthly / contribution) : (contribution === 0 && a.fixedMonthly === 0 ? 0 : null),
    breakEvenPrice: (goodsCost + orderFees + allocatedFixed) / (1 - a.adRate) };
}
