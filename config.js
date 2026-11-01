// VND. Giá bán cập nhật 11/10/2026; vốn cập nhật 29/09/2026.
// Combo 3 chưa có giá mới xác nhận. null = cần nhập, không phải miễn phí.
export const config = {
  assumptions: { costIncrease: 10000, vatRate: 0.08, adRate: 0.25,
    shipping: 30000, packaging: 2000, cod: 3000, fixedMonthly: 5000000, monthlyOrders: 100 },
  products: [
    { id: 'short', name: 'Short', baseCost: 90000, prices: [249000,449000,null] },
    { id: 'ngo', name: 'Ngố', baseCost: 105000, prices: [275000,485000,null] },
    { id: 'lung', name: 'Lửng', baseCost: 140000, prices: [365000,630000,null] },
    { id: 'dai', name: 'Dài / Tregging', baseCost: 150000, prices: [395000,720000,null] },
    { id: 'lot-long', name: 'Lót lông', baseCost: 180000, prices: [450000,785000,null] },
    { id: 'loe', name: 'Loe', baseCost: 165000, prices: [415000,750000,null] }
  ]
};
