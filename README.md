# Thiệp cưới online Khắc Tuấn & Duyên Anh

Trang thiệp cưới online được xây dựng theo phong cách warm luxury, tối ưu cho desktop và mobile.

## Cấu trúc thư mục

- `wedding-invitation/index.html` – trang chính
- `wedding-invitation/wedding-invitation.css` – giao diện
- `wedding-invitation/wedding-invitation.js` – logic đếm ngược, RSVP, nhạc
- `wedding-invitation/ordinary-clip.mp3` – nhạc nền cắt từ bài hát
- `wedding-invitation/Alex Warren - Ordinary (Official Video).mp4` – file nguồn gốc

## Mở local

1. Vào thư mục gốc của repo
2. Mở `wedding-invitation/index.html` trực tiếp trong trình duyệt
3. Hoặc chạy local server:

```bash
python -m http.server 8000
```

Sau đó truy cập:

```text
http://localhost:8000/wedding-invitation/index.html
```

## Nội dung chính

- Hero section với tên cặp đôi và lời mời
- Thông tin gia đình nhà trai / nhà gái
- Lịch trình lễ nạp tài và lễ thành hôn
- Countdown đến ngày cưới
- Gallery ảnh và form RSVP
- Nhạc nền tự động phát khi mở trang
