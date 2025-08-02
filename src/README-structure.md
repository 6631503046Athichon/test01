# โครงสร้างไฟล์ HTML ที่จัดระเบียบแล้ว

## 📂 โครงสร้างโฟลเดอร์

```
src/
├── pages/                  # 📄 ไฟล์ HTML ทั้งหมด
│   ├── index.html         # 🏠 หน้า Dashboard หลัก  
│   ├── product-detail.html # 🛍️ หน้ารายละเอียดสินค้า
│   ├── my-designs.html    # 🎨 หน้าดีไซน์ของฉัน
│   ├── cart.html          # 🛒 หน้าตะกร้าสินค้า
│   ├── profile.html       # 👤 หน้าโปรไฟล์
│   ├── earnings.html      # 💰 หน้าประวัติรายได้
│   ├── upload.html        # ⬆️ หน้าอัปโหลดดีไซน์
│   └── payment-success.html # ✅ หน้าชำระเงินสำเร็จ
├── shared/                 # 🔗 Components ที่ใช้ร่วมกัน
│   ├── navigation.html    # Navigation bar template
│   └── header.html        # Header component template
├── styles/                 # 🎨 ไฟล์ CSS
│   └── main.css          # CSS หลักทั้งหมด
├── scripts/               # ⚡ ไฟล์ JavaScript  
│   └── app.js            # JavaScript หลักทั้งหมด
├── assets/                # 📁 รูปภาพและทรัพยากร
└── components/            # 🧩 Components อนาคต (ว่าง)
```

## 🔗 การนำทางระหว่างหน้า

### หน้าหลัก
- **index.html** - หน้า Dashboard (จุดเริ่มต้น)

### การเชื่อมต่อ
- Dashboard → Product Detail
- Dashboard → Cart  
- Dashboard → My Designs
- Dashboard → Profile
- Dashboard → Upload
- Dashboard → Earnings

### Links ที่อัปเดตแล้ว
- CSS: `../styles/main.css`
- JS: `../scripts/app.js`
- Navigation: relative paths ในโฟลเดอร์เดียวกัน

## 🚀 วิธีใช้งาน

1. เปิดไฟล์ `pages/index.html` ในเบราว์เซอร์
2. หรือใช้ local server:
   ```bash
   # ตั้งรูทที่ src/pages/
   cd src/pages
   python -m http.server 8000
   ```

## ✨ ข้อดีของโครงสร้างใหม่

1. **จัดระเบียบดี**: แยกไฟล์ตามประเภทชัดเจน
2. **ง่ายต่อการบำรุงรักษา**: แก้ไขไฟล์หน้าเดียวไม่กระทบหน้าอื่น
3. **ประสิทธิภาพดี**: โหลดเฉพาะหน้าที่ต้องการ
4. **SEO-friendly**: แต่ละหน้ามี URL เฉพาะ
5. **ทำงานร่วมกันง่าย**: แก้ไขหน้าต่างกันพร้อมกันได้
6. **รองรับการขยาย**: พร้อมสำหรับ components และ features ใหม่

## 🎯 หน้าที่พร้อมใช้งาน

- ✅ Dashboard (index.html)
- ✅ Product Detail  
- ✅ My Designs
- ✅ Shopping Cart
- ✅ User Profile
- ✅ Earnings History
- ✅ Upload Design
- ✅ Payment Success

ทุกหน้าพร้อมใช้งานและเชื่อมต่อกันแล้ว! 🎉