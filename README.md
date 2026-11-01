# GUGEE — Máy tính lợi nhuận
Ứng dụng HTML/CSS/JavaScript thuần, không cần cài thư viện, không có backend dữ liệu.

## Chạy
Cài Node.js 18 trở lên, sau đó:
```sh
git clone https://github.com/traolongbaoloc88-art/5555.git
cd 5555
npm start
```
Mở http://localhost:3000. Kiểm tra: `npm test`.
Không mở trực tiếp file HTML bằng file:// vì trình duyệt dùng ES modules.

## Cấu trúc
- `config.js`: giá và giả định độc lập với phép tính.
- `profit.js`: hàm tính thuần, kiểm tra đầu vào.
- `index.html`, `app.js`, `style.css`: giao diện nhập và bảng 18 phương án.
- `server.js`: máy chủ tĩnh local, chỉ phục vụ file ứng dụng.
- `profit.test.js`: kiểm tra công thức, combo, hòa vốn và dữ liệu lỗi.
- `package.json`: lệnh chạy và kiểm tra, không dependencies.

## Nguồn giả định
Giá vốn theo ngữ cảnh 29/09/2026; giá bán mới theo thông báo 11/10/2026,
lót lông theo cập nhật riêng gần nhất. Đơn vị VND.

| SKU | Vốn/chiếc | Lẻ | Combo 2 |
|---|---:|---:|---:|
| Short | 90.000 | 249.000 | 449.000 |
| Ngố | 105.000 | 275.000 | 485.000 |
| Lửng | 140.000 | 365.000 | 630.000 |
| Dài/Tregging | 150.000 | 395.000 | 720.000 |
| Lót lông | 180.000 | 450.000 | 785.000 |
| Loe | 165.000 | 415.000 | 750.000 |

Combo 3 chưa có giá cập nhật: để null, người dùng nhập trong giao diện; không tự dùng giá lịch sử.
Tăng vốn mặc định 10.000/chiếc (có thể nhập 15.000); ads mặc định 25% (có thể nhập 20–35%).
VAT 8% là giả định chi phí đầu vào cộng vào vốn sau tăng, không khấu trừ; không phải phép tính thuế đầu ra hay nghĩa vụ thuế.
Nếu vốn đã gồm VAT hoặc đã gồm khoản tăng, đặt tỷ lệ/khoản tăng tương ứng về 0 để tránh tính hai lần.
Ship shop chịu 30.000, đóng gói 2.000, COD 3.000 mỗi đơn, cả lẻ và combo.
Chi phí cố định 5.000.000/tháng; giả định ban đầu 100 đơn/tháng, có thể sửa.

## Công thức
- Vốn đơn = (vốn/chiếc + tăng vốn) × (1 + VAT) × số chiếc.
- Ads = giá bán cả đơn × tỷ lệ ads.
- Lãi góp = giá bán − vốn đơn − ads − ship − đóng gói − COD.
- Lãi sau phân bổ/đơn = lãi góp − chi phí cố định / số đơn tháng.
- Biên sau phân bổ = lãi sau phân bổ / giá bán × 100%.
- Lãi tháng = lãi góp × số đơn tháng − chi phí cố định.
- Đơn hòa vốn = ceil(chi phí cố định / lãi góp); không thể hòa vốn nếu lãi góp âm, hoặc bằng 0 và vẫn có cố định.
- Giá hòa vốn = (vốn đơn + phí đơn + phân bổ cố định) / (1 − tỷ lệ ads).

Mỗi dòng là một kịch bản bán riêng SKU/gói đó trong toàn bộ tháng; không cộng các dòng.
Combo cùng một SKU. Không làm tròn trung gian; chỉ làm tròn hiển thị tiền.
Chưa tính hoàn hàng, chiết khấu khác, thuế doanh thu hay cơ cấu đơn hỗn hợp.
Dữ liệu sửa trên UI chỉ ở bộ nhớ; tải lại sẽ về cấu hình. Không gửi dữ liệu ra ngoài.
