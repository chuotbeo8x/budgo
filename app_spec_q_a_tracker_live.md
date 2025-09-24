# App Spec – Q&A Tracker (Live)

> This is your living brief. I’ll fill it in as you answer.

---

## 0) Project Snapshot
- **Working name:** _TBD_
- **One‑line pitch:** _TBD_
- **Primary audience:** _TBD_
- **Platforms:** [ ] Web  [ ] Android  [ ] iOS  [ ] Desktop
- **Languages:** [x] Vietnamese  [x] English  [ ] Other: _TBD_
- **Monetization:** [ ] Free  [ ] One‑time  [ ] Subscription  [ ] Ads  [ ] In‑app purchases  [ ] Other: _TBD_

---

## 1) Goals & Users
- **Problem to solve (top 3):**
  1. Xây dựng hệ thống quản lý nhóm
  2. Quản lý chuyến đi
  3. Quản lý & chia sẻ chi phí
- **User personas:**
  - Persona A: Người dùng có tài khoản Google (dùng để đăng nhập và quản lý hồ sơ)
  - Persona B: _TBD_
- **Success metrics (MVP):**
  - Số lượng user đăng nhập
  - Số nhóm được tạo
  - Số chuyến đi được quản lý
  - Số giao dịch/chi phí được ghi lại và chia sẻ thành công


---

## 2) MVP Scope (Must-have v1)
- **Core features:**
  - [x] Tạo nhóm
    - Bất kỳ user nào cũng có quyền tạo nhóm
    - Nhóm có 3 loại:
      1. **Public**: ai cũng có thể vào
      2. **Close**: ai cũng nhìn thấy nhóm và chuyến đi, nhưng phải xin vào mới tham gia
      3. **Kín**: ẩn hoàn toàn, chỉ thành viên biết
    - Trường thông tin khi tạo nhóm: Tên nhóm, Mô tả, Cover (link ảnh)
  - [x] Tạo chuyến đi
    - Bất kỳ user nào cũng có thể tạo
    - Có thể chọn chuyến đi **thuộc nhóm** hoặc **cá nhân**
    - Trường thông tin khi tạo: Tên, Ngày bắt đầu/kết thúc, Điểm đến, Mô tả, Ảnh cover, **Đơn vị tiền tệ (hỗ trợ: VND, USD; mặc định VND)**, Chi phí dự kiến mỗi người
    - Có phân loại chuyến đi (ví dụ: du lịch, công việc, khác)
    - Thành phần chính của một chuyến đi bao gồm:
      - Danh sách **Thành viên**
      - Danh sách **Chi phí**
      - **Tạm ứng/Hoàn trả** giữa các thành viên
- [x] Quản lý chuyến đi cá nhân hoặc trong nhóm
    - Người tạo có thể chỉnh sửa hoặc xoá chuyến đi
    - Thành viên khác chỉ có quyền xem
  - [x] Thêm thành viên vào chuyến đi
    - Người tạo có thể mời hoặc thêm thành viên để quản lý danh sách tham gia
    - Danh sách thành viên dùng để xác định đối tượng chia chi phí
- [x] Ghi nhận và chia chi phí trong chuyến đi cho từng thành viên
    - Bất kỳ thành viên nào cũng có thể tạo chi phí
    - Thành viên chỉ được sửa khoản chi của chính mình
    - Chỉ người tạo chuyến đi mới có quyền xoá chi phí
    - Trường thông tin khoản chi: Số tiền, Mô tả, Người trả (người tạo chuyến đi có thể chọn bất kỳ, thành viên chỉ chọn bản thân)
    - Cách chia: hỗ trợ chia đều hoặc **chia theo trọng số**; nếu muốn bỏ một thành viên khỏi khoản chi → set weight = 0 hoặc exclude → các thành viên còn lại chia đều/tỷ lệ
- **Nice-to-have (can postpone):**
  - [ ] _TBD_
  - [ ] _TBD_



### Trip Structure (details)
- **Thành viên:**
  - Danh sách thành viên do **người tạo chuyến đi** thêm/mời; dùng làm cơ sở chia chi phí
  - Vai trò: [Người tạo], [Thành viên]
  - Cách thêm thành viên:
    1. Tìm trong hệ thống và thêm vào
    2. Chọn nhóm và lựa chọn thành viên trong nhóm
    3. Nhập thành viên ảo (tự tạo theo tên, không cần tài khoản)
- **Chi phí**:**
  - Bất kỳ thành viên nào cũng **tạo** khoản chi; chỉ sửa **khoản của mình**; chỉ **người tạo chuyến** đi được **xoá**
  - Trường: Số tiền, Mô tả, Người trả, Phương thức chia (đều / theo tỷ lệ)
- **Tạm ứng / Hoàn trả:**
  - Quyền nhập tạm ứng: chỉ **người tạo chuyến đi** (quản lý) có thể nhập tạm ứng cho thành viên
  - Quy tắc quyết toán: hỗ trợ **chia đều** và **chia theo tỷ lệ**; có thể loại bỏ thành viên không tham gia khoản chi
  - Gợi ý hoàn trả: hệ thống tự động tính toán công nợ, tối ưu giao dịch (netting) với số liệu **chính xác nhất có thể**
  - Tiền tệ: quy ước **đơn vị tiền tệ** khi tạo chuyến đi; tất cả chi phí/tạm ứng dùng cùng đơn vị
  - Xuất quyết toán: có thể xuất **CSV/PDF** và có bước **chốt chuyến đi** để khoá sửa dữ liệu


---

## 3) User Journeys / Flows
- **Entry:** Đăng nhập bằng Google, sau đó tạo tài khoản trong hệ thống
- **Auth method(s):** [x] Google  [ ] Email/Password  [ ] Phone/OTP  [ ] Apple  [ ] Guest
- **Happy-path flow (theo nhóm):**
  1. User đăng nhập Google → tạo tài khoản
  2. Tạo nhóm (Public/Close/Kín)
  3. Mời/thêm thành viên vào nhóm
  4. Tạo chuyến đi thuộc nhóm (nhập thông tin + chọn tiền tệ)
  5. Thêm thành viên chuyến đi (từ hệ thống, nhóm, hoặc thành viên ảo)
  6. Thành viên ghi chi phí, nhập tạm ứng
  7. Hệ thống tính công nợ, đề xuất hoàn trả
  8. Xuất báo cáo (CSV/PDF), chốt chuyến
- **Happy-path flow (cá nhân):**
  1. User đăng nhập Google → tạo tài khoản
  2. Tạo chuyến đi cá nhân
  3. Thêm chi phí, tạm ứng
  4. Quyết toán và chốt chuyến
- **Edge cases & recovery:**
  - Nếu thành viên rời nhóm hoặc rời chuyến đi → vẫn lưu lại tên trong lịch sử để tra cứu
  - _Other cases: TBD_


---

## 4) Data & Privacy
- **Entities & fields (draft v0.1):**
  | Entity | Key Fields | Notes / Visibility |
  |---|---|---|
  | **User** | id, googleUid, name, email, avatar, createdAt | Private profile (per user)
  | **Group** | id, name, description, coverUrl, type(public/close/secret), ownerId, createdAt | Visible tuỳ loại nhóm
  | **GroupMember** | id, groupId, userId, role(owner/member), joinedAt, leftAt | Lưu `leftAt` để tra cứu lịch sử
  | **Trip** | id, groupId(optional), name, startDate, endDate, destination, description, coverUrl, currency(VND/USD), costPerPersonPlanned, category, ownerId, createdAt, closedAt, paymentStatus(manual: paid/unpaid), statsCache(totalAdvance,totalExpense,computedAt) | Publicity = theo nhóm/cá nhân
  | **TripMember** | id, tripId, userId or ghostName, role(creator/member), joinedAt, leftAt, optionalEmail | Hỗ trợ **thành viên ảo** qua `ghostName`; MVP = chỉ tên, về sau có thể nhập email tùy chọn và hệ thống sẽ **gợi ý đồng bộ** với user thật (không auto-merge)
  | **Expense** | id, tripId, payerId, amount, description, splitMethod(equal/weight), weightMap(memberId→weight), exclusions(memberIds[]), createdBy, createdAt, deletedAt | Thành viên chỉ sửa **khoản của mình**, xoá chỉ bởi **người tạo trip**
  | **Advance** | id, tripId, memberId, amount, note, createdAt | Tạm ứng/ứng trước
  | **Settlement** | id, tripId, fromMemberId, toMemberId, amount, computedAt, rounded | Đề xuất chuyển tiền (netting)
  | **Attachment** | id, entityId, entityType(expense/advance), fileUrl | **ĐỂ SAU** – Không bật ở MVP (bỏ ảnh hoá đơn)
  | **AuditLog** | id, entityType, entityId, action, actorId, at | Nhật ký thay đổi (tuỳ chọn)

- **Data sharing:**
  - Trip cá nhân: chỉ chủ sở hữu xem/ghi
  - Trip trong nhóm: theo quyền nhóm; **thành viên** xem; **người tạo trip** chỉnh sửa/xoá
  - Thành viên rời nhóm/trip: giữ tên trong lịch sử (`leftAt`), tránh mất ngữ cảnh chi phí

- **Retention & export:**
  - Cho phép **xuất CSV/PDF** quyết toán; hỗ trợ **chốt trip** để khóa sửa
  - **PDF gồm:** tiêu đề chuyến, thông tin chung (thời gian/điểm đến/tiền tệ), danh sách thành viên, bảng **tạm ứng**, bảng **chi phí** (theo ngày & theo người trả), **bảng công nợ** và **đề xuất hoàn trả (netting)**, phần **xác nhận/ký**
  - **Xoá khoản chi:** **xoá hẳn** (không soft-delete); không khôi phục sau khi xoá

- **Privacy notes:**** minimal PII (name, email, avatar). Không công khai dữ liệu cá nhân ngoài phạm vi nhóm/trip.



### Trip Quick Stats Card
- Hiển thị cho từng thành viên trong chuyến đi:
  - **Tên**
  - **Đã tạm ứng** (tổng số tiền đã ứng trước)
  - **Đã chi** (tổng chi phí đã ghi nhận)
  - **Tổng kết**: trạng thái thanh toán (Đã thanh toán / Chưa thanh toán)
    - Trạng thái này được quản lý thủ công bởi người tạo chuyến đi
    - Hệ thống lưu lại lựa chọn để tham chiếu sau



#### Quick Stats Card (trong trang chi tiết chuyến đi)
- **Hiển thị:** Tên chuyến, **Tổng tạm ứng**, **Tổng đã chi**, **Trạng thái thanh toán**
- **Trạng thái thanh toán:** quản lý **thủ công** (paid/unpaid); lưu lại người thao tác & thời điểm
- **Cập nhật số liệu:** dựa trên chi phí & tạm ứng hiện có; có thể cache (`statsCache.computedAt`) để tối ưu hiệu năng



#### Ghost Member Linking (gợi ý đồng bộ, không auto)
- **MVP:** Thành viên ảo chỉ có **tên** (`ghostName`), **không auto-merge**.
- **Nâng cấp (đề xuất):** Cho phép nhập **email (tùy chọn)** cho thành viên ảo.
  - Khi có user đăng ký bằng email trùng → **gợi ý đồng bộ** (không tự động):
    1) Thông báo cho user thật: "Bạn có muốn nhận lịch sử từ thành viên ảo [Tên X] không?"
    2) Nếu **xác nhận**, hệ thống gộp: chuyển `ghostName` → `userId`, giữ lại **bản ghi gốc** để có thể **khôi phục**.
    3) Có thể yêu cầu **xác minh email** trước khi cho phép gộp.
- **Lợi ích:** giảm trùng lặp, vẫn kiểm soát rủi ro.
- **Ràng buộc:** chỉ thực hiện khi có **xác nhận của người dùng**; log vào **AuditLog**.


#### Data Handling Decisions
- **Ảnh hoá đơn:** Bỏ ở MVP (đưa vào bản sau nếu cần).
- **Xoá khoản chi:** Thực hiện **xoá hẳn**, không giữ soft-delete.
- **Tỷ lệ chia:** Nhập theo **trọng số** (ví dụ 1–5), hệ thống tự quy đổi về %.
- **Quyền nhóm:** Chỉ có **Owner** và **Member**, không có Moderator.
- **PDF quyết toán:** Bao gồm đầy đủ thông tin: tiêu đề chuyến, danh sách thành viên, chi phí theo ngày/người, tạm ứng, bảng công nợ, đề xuất chuyển tiền, chữ ký/xác nhận.


---

## 6) Tech & Architecture
- **Frontend:** Next.js (React, TypeScript, TailwindCSS, shadcn/ui)
- **Backend:** Firebase (Auth, Firestore, Functions)
- **Storage:** Firestore (data), Firebase Storage (tùy chọn sau cho file/ảnh)
- **Infra/Deploy:** Vercel (hosting frontend), Firebase (backend services)
- **Integrations:**
  - Google Login (Firebase Auth)
  - PDF export (serverless function)
  - (TBD) Payment/Bank integration sau này

- **Notes:**
  - Tập trung vào **MVP đơn giản**: Next.js app + Firebase backend.
  - Triển khai CI/CD qua Vercel.
  - Dùng Firestore security rules để kiểm soát truy cập (user chỉ xem/sửa đúng dữ liệu liên quan).


---

## 6) Tech & Architecture (draft)
- **Frontend:** Next.js (App Router, TypeScript), Tailwind, shadcn/ui
- **Auth:** Firebase Auth (Google sign-in only in MVP)
- **Backend/Data:** Firebase (Firestore, 1 project cho cả dev/prod; có thể prefix collection cho môi trường nếu cần)
- **Security Rules:**
  - Owner của Trip/Group có thể edit/delete
  - Member có thể read
  - Member có thể write khoản chi của chính mình
- **Functions:** Không dùng Cloud Functions trong MVP; logic netting công nợ và PDF chạy bằng Next.js server actions
- **Storage:** MVP không bật upload ảnh hoá đơn
- **Infra/Deploy:** Vercel (web), Firebase project single env
- **Validation:** Zod (schema form & payload)
- **i18n:** Vi/En (simple JSON dictionaries)
- **Time & Currency:** Asia/Bangkok (UTC+7), VND/USD per trip
- **Analytics:** Firebase Analytics (ưu tiên), cơ bản event: create_trip, add_expense, close_trip

### High-level architecture
- Next.js (client & server actions) ↔ Firebase Auth
- Next.js server actions ↔ Firestore (Trips, Expenses, Advances, …)
- Server-side HTML→PDF cho quyết toán

### Non-functional
- **Performance:** paginate lists (chi phí), cache `statsCache` cho Trip
- **Security:** Firestore Rules như trên
- **Observability:** theo dõi qua Firebase Analytics, log cơ bản


---

## Firestore Collection Schema (draft)

### users
```json
{
  id: string,            // Firestore uid
  googleUid: string,     // Firebase Auth uid
  name: string,
  email: string,
  avatar: string,
  username: string,      // slug thân thiện, user đặt 1 lần duy nhất
  createdAt: Timestamp
}
```json
{
  id: string,            // Firestore uid
  googleUid: string,     // Firebase Auth uid
  name: string,
  email: string,
  avatar: string,
  createdAt: Timestamp
}
```

### groups
```json
{
  id: string,
  name: string,
  description: string,
  coverUrl: string,
  type: "public" | "close" | "secret",
  ownerId: string,
  slug: string,          // slug thân thiện cho URL, duy nhất trong hệ thống
  createdAt: Timestamp
}
```json
{
  id: string,
  name: string,
  description: string,
  coverUrl: string,
  type: "public" | "close" | "secret",
  ownerId: string,
  createdAt: Timestamp
}
```

### groupMembers
```json
{
  id: string,
  groupId: string,
  userId: string,
  role: "owner" | "member",
  joinedAt: Timestamp,
  leftAt?: Timestamp
}
```

### trips
```json
{
  id: string,
  groupId?: string,      // null nếu là trip cá nhân
  name: string,
  startDate: Date,
  endDate: Date,
  destination: string,
  description: string,
  coverUrl: string,
  currency: "VND" | "USD",
  costPerPersonPlanned: number,
  category: string,      // du lịch / công việc / khác
  ownerId: string,
  slug: string,          // slug thân thiện cho URL, duy nhất trong group
  createdAt: Timestamp,
  closedAt?: Timestamp,
  paymentStatus: "paid" | "unpaid",
  statsCache: {
    totalAdvance: number,
    totalExpense: number,
    computedAt: Timestamp
  }
}
```json
{
  id: string,
  groupId?: string,      // null nếu là trip cá nhân
  name: string,
  startDate: Date,
  endDate: Date,
  destination: string,
  description: string,
  coverUrl: string,
  currency: "VND" | "USD",
  costPerPersonPlanned: number,
  category: string,      // du lịch / công việc / khác
  ownerId: string,
  createdAt: Timestamp,
  closedAt?: Timestamp,
  paymentStatus: "paid" | "unpaid",
  statsCache: {
    totalAdvance: number,
    totalExpense: number,
    computedAt: Timestamp
  }
}
```

### tripMembers
```json
{
  id: string,
  tripId: string,
  userId?: string,       // nếu là thành viên thật
  ghostName?: string,    // nếu là thành viên ảo
  role: "creator" | "member",
  joinedAt: Timestamp,
  leftAt?: Timestamp
}
```

### expenses
```json
{
  id: string,
  tripId: string,
  payerId: string,
  amount: number,
  description: string,
  splitMethod: "equal" | "weight",
  weightMap?: { memberId: string, weight: number }[],
  createdBy: string,
  createdAt: Timestamp
}
```

### advances
```json
{
  id: string,
  tripId: string,
  memberId: string,
  amount: number,
  note?: string,
  createdAt: Timestamp
}
```

### settlements
```json
{
  id: string,
  tripId: string,
  fromMemberId: string,
  toMemberId: string,
  amount: number,
  computedAt: Timestamp,
  rounded: boolean
}
```

### auditLogs (optional)
```json
{
  id: string,
  entityType: string,  // expense / advance / trip / group
  entityId: string,
  action: string,      // create / update / delete / close / merge
  actorId: string,
  at: Timestamp
}
```


---

## 7) Admin & Ops
- **Admin portal:**
  - MVP: chưa cần portal riêng, chỉ quản trị qua Firestore Console
  - Post-MVP: cân nhắc dashboard web đơn giản cho admin hệ thống
- **Roles & permissions:**
  - **Owner (nhóm/trip):** tạo, chỉnh sửa, xoá
  - **Member:** xem, thêm chi phí của mình, tham gia quyết toán
  - Không có Moderator trong MVP
- **Analytics & logs:**
  - Sử dụng Firebase Analytics để theo dõi sự kiện chính (create_trip, add_expense, close_trip)
  - AuditLog collection (tùy chọn) lưu thay đổi quan trọng: xoá chi phí, chốt chuyến, đồng bộ thành viên ảo
- **Ops notes:**
  - Quản trị viên hệ thống có quyền xem dữ liệu toàn cục qua Firestore Console
  - Có thể bật export định kỳ (CSV) để backup ngoài Firebase


---

## 7) Admin & Ops (draft)
- **Admin portal:** Không tách riêng; dùng ngay trong app (Owner quản trị nhóm/trip)
- **Quản trị nhóm:**
  - Owner có thể chỉnh sửa nhóm, xoá nhóm
  - Với nhóm **Close**: có hàng chờ duyệt; Owner duyệt mới join
- **Quản trị trip:**
  - Owner (người tạo) có thể chỉnh sửa/xoá/chốt trip; thêm/bớt thành viên; quản lý tạm ứng/chi phí
  - Khi xoá trip/group: hiển thị **cảnh báo confirm** trước khi xoá (xoá vĩnh viễn, không khôi phục)
- **Roles & permissions:**
  - **Owner**: full quyền trên thực thể mình sở hữu (Group/Trip)
  - **Member**: read; tạo/sửa chi phí của chính mình; không xoá chi phí, không xoá trip
- **Analytics:** Firebase Analytics (sự kiện: login, create_group, create_trip, add_member, add_expense, add_advance, close_trip, export_pdf)
- **Monitoring/Logging:**
  - Ghi nhật ký cơ bản (`auditLogs`) cho thao tác: create/update/delete expense, close trip
  - Thông báo (notification):
    - In-app notification list (không email/push ở MVP)
    - Khi có yêu cầu join nhóm (Close)
    - Khi được thêm vào trip
    - Khi trip được chốt
  - Lỗi client → gửi console + tuỳ chọn Sentry (để sau)
- **Ops:**
  - Backup: Firestore auto; xuất CSV/PDF thủ công theo trip
  - Giới hạn dữ liệu: không hard limit, chỉ cảnh báo khi số lượng bản ghi quá lớn (VD >1000 expense/trip)
  - Quy trình hỗ trợ: chưa có dashboard CS; xử lý thủ công qua DB khi cần


---

## 8) Security & Compliance (draft)
- **Auth & session rules:**
  - Firebase Auth (Google only in MVP)
  - Session quản lý bởi Firebase; refresh token tự động
- **Access control model:**
  - Firestore Security Rules:
    - **Owner** của Group/Trip: full quyền edit/delete
    - **Member**: read
    - **Member** chỉ write khoản chi của chính mình
    - Không ai ngoài thành viên được đọc dữ liệu Group/Trip
- **PII handling:**
  - Lưu trữ tối thiểu: name, email, avatar
  - Email không public; chỉ dùng cho login và mapping
  - Thành viên ảo chỉ lưu tên (và email optional về sau)
- **Data sharing:**
  - Group Public: ai cũng có thể join (nhưng phải login)
  - Group Close: visible, join qua duyệt
  - Group Kín: không hiển thị công khai
- **Backups:**
  - Firestore auto backup (daily)
  - Xuất CSV/PDF để lưu cục bộ nếu cần
- **Compliance:**
  - MVP: chưa cần chuẩn chính thức (GDPR, ISO) nhưng thiết kế data theo hướng **data minimization**
  - Log xoá/sửa lưu ở `auditLogs` (traceability)


---

## 8) Security & Compliance (draft)
- **Auth & Session**
  - Firebase Auth (Google only in MVP), session theo Firebase SDK
  - Bắt buộc email verified từ Google
  - Sign‑out & revoke tokens theo chuẩn Firebase
- **Access Control (RBAC đơn giản)**
  - **Group**: owner full quyền; member read; với nhóm Close: join qua duyệt
  - **Trip**: owner full quyền; member read; member chỉ tạo/sửa **expense của mình**; xoá expense chỉ owner
  - **TripMember (ghost)**: chỉ owner thêm/sửa/xoá; không quyền login
- **Firestore Security Rules (nguyên tắc)**
  - Chỉ cho phép truy cập tài liệu khi `request.auth.uid != null`
  - Kiểm tra quyền theo `ownerId`/membership (GroupMember/TripMember)
  - Ràng buộc dữ liệu: `trip.currency ∈ {VND, USD}`, `splitMethod ∈ {equal, weight}`
  - Prevent mass reads: giới hạn truy vấn theo `tripId`, `groupId`
- **PII & Privacy**
  - Lưu tối thiểu: name, email, avatar; không lưu dữ liệu nhạy cảm khác
  - Thành viên ảo chỉ lưu **tên**; nếu dùng email (bản sau) → **gợi ý đồng bộ** có xác nhận
- **Audit & Logs**
  - Ghi audit cho thao tác nhạy cảm: create/update/delete expense, close trip
  - Lưu `actorId`, timestamp; hỗ trợ khôi phục bằng chứng khi tranh chấp
- **Backups & Export**
  - Firestore auto backup theo project; cho phép export CSV/PDF theo trip
  - Chốt trip khoá sửa dữ liệu nghiệp vụ (vẫn có thể đọc/xuất)
- **Operational Security**
  - Env secrets trong `.env` (Vercel) — không commit
  - Rate‑limit hành động nhạy cảm (server actions) để chống spam (MVP: throttle đơn giản)
  - Hiển thị cảnh báo trước khi xoá trip/group (xoá vĩnh viễn)


---

## 9) Monetization & Pricing
- **MVP:** Free only (tất cả tính năng cơ bản đều miễn phí)
- **Định hướng sau:** Freemium (Subscription)
  - Free tier: nhóm nhỏ, số trip hạn chế, báo cáo cơ bản
  - Premium tier: nhóm lớn hơn, xuất báo cáo nâng cao (CSV/PDF chi tiết), đa tiền tệ, thống kê chuyên sâu, dung lượng lưu trữ lâu dài, phân quyền nâng cao
- **Các mô hình khác (có thể cân nhắc sau):**
  - One-time unlock: mua trọn đời
  - In-app add-ons: mua tính năng riêng lẻ
  - Ads: không khuyến nghị (ảnh hưởng trải nghiệm)


---

## 10) Roadmap

### MVP (4–6 tuần)
- Auth Google + tạo tài khoản user
- Quản lý nhóm (Public/Close/Secret)
- Quản lý chuyến đi (cá nhân/nhóm)
- Thêm thành viên (thật/ảo) vào chuyến đi
- Ghi nhận chi phí (chia đều/trọng số)
- Tạm ứng & tính công nợ cơ bản (netting)
- Xuất báo cáo CSV/PDF
- Quick Stats Card trong trang trip
- Firestore Security Rules (owner/member)
- Firebase Analytics cơ bản

### Post-MVP (6–12 tuần)
- Notification UI (join request, added to trip, trip closed)
- AuditLogs UI (hiển thị lịch sử thay đổi)
- Nâng cấp báo cáo PDF (layout chuyên nghiệp, biểu đồ)
- Đa tiền tệ (nếu cần)
- Admin mini-dashboard (quản lý nhóm/trip nhanh)
- Cải thiện UX (tìm kiếm, filter, paginate chi phí)

### Later bets (>12 tuần)
- Gợi ý đồng bộ thành viên ảo ↔ user (email optional)
- Tích hợp thanh toán (nạp tiền/hoàn tiền tự động)
- Premium features (theo freemium model)
- Mobile app (React Native / Flutter)
- AI assistant: gợi ý chia chi phí, phân tích chi tiêu


---

## 11) Open Questions (parking lot)
- **PDF layout:** muốn chốt cụ thể layout ngay (theo 3 trang: Info, Expenses, Settlement) hay để MVP làm đơn giản?
- **Notification UX:** in-app notification list gồm: popup nhỏ (toast), badge icon, và trang riêng để xem toàn bộ; hỗ trợ trạng thái đã đọc/chưa đọc
- **Expense limit warning:** cảnh báo khi số expense/trip vượt 500
- **Audit log visibility:** chỉ Owner xem được lịch sử thay đổi
- **Ghost member merge:** khi bật email optional sau này → chỉ confirm trong app (không OTP), vì chưa dự kiến dùng email


---

## 12) MVP Technical Backlog (draft)

### Auth & User
- [ ] Tích hợp Firebase Auth (Google sign-in)
- [ ] Flow tạo tài khoản sau login (name, avatar)
- [ ] **Username slug**: form đặt 1 lần, kiểm tra trùng/định dạng, lưu `username`

### Groups
- [ ] Tạo nhóm (Public/Close/Secret)
- [ ] Join group (Public: auto, Close: request/duyệt, Secret: invite only)
- [ ] Quản lý thành viên (Owner duyệt/kick)
- [ ] **Group slug**: sinh/nhập slug, kiểm tra duy nhất, không đổi sau khi tạo

### Trips
- [ ] Tạo trip (cá nhân/nhóm), nhập thông tin (name, date, destination, currency VND/USD, cost plan)
- [ ] **Trip slug**: sinh/nhập slug, duy nhất trong group, không đổi sau khi tạo
- [ ] Thêm thành viên (search user, chọn từ group, hoặc ghost member)
- [ ] Quick Stats Card (advance, expense, paymentStatus manual)
- [ ] Chốt trip (lock, export)

### Expenses
- [ ] Tạo expense (amount, description, payer)
- [ ] Chia đều hoặc trọng số, cho phép exclude member (weight=0)
- [ ] Sửa expense (chỉ của mình)
- [ ] Xoá expense (chỉ owner)

### Advances
- [ ] Nhập tạm ứng (chỉ owner)
- [ ] Tính công nợ (netting server action)

### Settlements
- [ ] Tính toán đề xuất hoàn trả
- [ ] Xuất báo cáo CSV/PDF (server-side render)

### Notifications
- [ ] In-app notification: toast + badge icon
- [ ] Trang notification list (read/unread)

### Admin/Ops
- [ ] Firestore Security Rules (owner/member)
- [ ] Firebase Analytics: events (login, create_group, create_trip, add_expense, add_advance, close_trip, export_pdf)
- [ ] Audit log (basic)

### Infra
- [ ] Slug generation & validation (username, group.slug, trip.slug) — unique, đặt một lần duy nhất
- [ ] Deploy Next.js on Vercel
- [ ] Configure Firebase project (single env)
- [ ] Env secrets in .env.local


---

## Executive Summary
- **Mục tiêu:** Xây dựng app quản lý nhóm → chuyến đi → chi phí, đơn giản cho bạn bè/nhóm sử dụng, ưu tiên Google login.
- **User:** Đăng nhập Google, tạo tài khoản 1 lần (username slug). Chủ yếu là nhóm bạn, gia đình, team nhỏ.
- **MVP Scope:**
  - Nhóm (Public/Close/Secret)
  - Trip (cá nhân/nhóm, thành viên thật/ảo)
  - Chi phí (chia đều/trọng số, exclude member)
  - Tạm ứng/hoàn trả, Quick Stats
  - Quyết toán CSV/PDF
  - Notification in-app (toast, badge, list read/unread)
- **Tech:** Next.js + Tailwind + shadcn/ui, Firebase Auth (Google), Firestore (1 project), deploy Vercel, PDF server-side.
- **Security:** Owner/Member RBAC, audit log cơ bản (chỉ owner xem), cảnh báo khi expense >500/trip, confirm khi xoá.
- **Monetization:** MVP free, định hướng Freemium (subscription, premium features).
- **Roadmap:** 4–6 tuần (MVP core), 6–12 tuần (notifications UI, audit log UI, PDF nâng cao), >12 tuần (premium, mobile, AI).

---

## Firestore Security Rules (skeleton draft)
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users: mỗi user chỉ đọc/ghi hồ sơ của mình
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Groups
    match /groups/{groupId} {
      allow read: if resource.data.type == 'public' ||
                    (exists(/databases/$(database)/documents/groupMembers/$(request.auth.uid + '_' + groupId)));
      allow write: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
    }

    // Group Members
    match /groupMembers/{docId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.role == 'owner';
    }

    // Trips
    match /trips/{tripId} {
      allow read: if request.auth != null && (
        resource.data.groupId == null ||
        exists(/databases/$(database)/documents/tripMembers/$(request.auth.uid + '_' + tripId))
      );
      allow write: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
    }

    // Trip Members
    match /tripMembers/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }

    // Expenses
    match /expenses/{expenseId} {
      allow read: if request.auth != null &&
        exists(/databases/$(database)/documents/tripMembers/$(request.auth.uid + '_' + resource.data.tripId));
      allow create: if request.auth != null && request.resource.data.createdBy == request.auth.uid;
      allow update: if request.auth != null && resource.data.createdBy == request.auth.uid;
      allow delete: if request.auth != null &&
        exists(/databases/$(database)/documents/trips/$(resource.data.tripId)) &&
        get(/databases/$(database)/documents/trips/$(resource.data.tripId)).data.ownerId == request.auth.uid;
    }

    // Advances
    match /advances/{advanceId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
        get(/databases/$(database)/documents/trips/$(request.resource.data.tripId)).data.ownerId == request.auth.uid;
    }

    // Settlements (read only)
    match /settlements/{settlementId} {
      allow read: if request.auth != null;
    }

    // Audit Logs (owner only)
    match /auditLogs/{logId} {
      allow read: if request.auth != null &&
        get(/databases/$(database)/documents/trips/$(resource.data.entityId)).data.ownerId == request.auth.uid;
      allow write: if false; // chỉ server ghi
    }
  }
}
```


---

## Executive Summary
- **Purpose:** Ứng dụng quản lý **nhóm → chuyến đi → chi phí** với đăng nhập Google, tập trung vào ghi nhận chi phí, tạm ứng và quyết toán minh bạch.
- **Users:** Người dùng có tài khoản Google; hỗ trợ **thành viên ảo** (chỉ tên) cho MVP.
- **MVP Scope:** Tạo/duyệt nhóm (Public/Close/Secret), tạo trip (cá nhân/nhóm, VND/USD), thêm thành viên (user/nhóm/ảo), chi phí (chia đều/trọng số, exclude), tạm ứng, netting công nợ, xuất CSV/PDF, quick stats card, notification in‑app, audit logs cơ bản.
- **Data Model:** Firestore với các collection: users, groups, groupMembers, trips, tripMembers, expenses, advances, settlements, auditLogs; hỗ trợ **slug** (username/group/trip).
- **Tech:** Next.js + Tailwind + shadcn/ui; Firebase Auth; Firestore (1 project); server actions cho netting & PDF; i18n VI/EN; Firebase Analytics.
- **Security:** RBAC đơn giản (Owner/Member), rules kiểm tra owner/membership, PII tối thiểu, confirm trước khi xoá, audit logs chỉ Owner xem.
- **Monetization:** MVP free; định hướng freemium (subscription) sau.
- **Roadmap:** MVP 4–6 tuần; Post‑MVP 6–12 tuần; Later: freemium, mobile, AI assistant.

---

## Firestore Security Rules (skeleton)
```rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthed() { return request.auth != null; }
    function uid() { return request.auth.uid; }

    // Helpers
    function isOwner(data) { return data.ownerId == uid(); }
    function isGroupMember(groupId) {
      return exists(/databases/$(database)/documents/groupMembers/
        $(groupId + "_" + uid()));
    }
    function isTripMember(tripId) {
      return exists(/databases/$(database)/documents/tripMembers/
        $(tripId + "_" + uid()));
    }

    // USERS (self profile)
    match /users/{userId} {
      allow read: if isAuthed();
      allow create: if isAuthed() && userId == uid();
      allow update: if isAuthed() && userId == uid() &&
        // username (slug) chỉ đặt 1 lần
        (resource.data.username == null || request.resource.data.username == resource.data.username);
      allow delete: if false; // không xoá user qua app
    }

    // GROUPS
    match /groups/{groupId} {
      allow read: if isAuthed(); // lọc theo type ở app
      allow create: if isAuthed() && request.resource.data.ownerId == uid();
      allow update, delete: if isAuthed() && isOwner(resource.data) &&
        // không cho đổi slug sau khi tạo
        request.resource.data.slug == resource.data.slug;
    }

    // GROUP MEMBERS (document id đề xuất: `${groupId}_${userId}`)
    match /groupMembers/{docId} {
      allow read: if isAuthed();
      // join/leave: owner duyệt với nhóm Close được xử lý ở app; rules chỉ ràng buộc tính nhất quán
      allow create, update, delete: if isAuthed();
    }

    // TRIPS
    match /trips/{tripId} {
      allow read: if isAuthed() && (resource.data.groupId == null
        ? resource.data.ownerId == uid() // trip cá nhân chỉ owner đọc
        : isGroupMember(resource.data.groupId));
      allow create: if isAuthed() && request.resource.data.ownerId == uid() &&
        request.resource.data.currency in ['VND','USD'] &&
        request.resource.data.splitMethod == null; // không có ở trip
      allow update, delete: if isAuthed() && isOwner(resource.data) &&
        // khoá slug sau khi tạo
        request.resource.data.slug == resource.data.slug;
    }

    // TRIP MEMBERS (document id đề xuất: `${tripId}_${memberId}` hoặc `${tripId}_ghost_${hash}`)
    match /tripMembers/{docId} {
      allow read: if isAuthed();
      allow create, update, delete: if isAuthed(); // kiểm soát nghiệp vụ ở server action
    }

    // EXPENSES
    match /expenses/{expenseId} {
      allow read: if isAuthed() && isTripMember(resource.data.tripId);
      allow create: if isAuthed() && isTripMember(request.resource.data.tripId) &&
        request.resource.data.splitMethod in ['equal','weight'];
      // chỉ cho chỉnh sửa expense do chính mình tạo
      allow update: if isAuthed() && resource.data.createdBy == uid();
      // chỉ owner trip được xoá
      allow delete: if isAuthed() &&
        exists(/databases/$(database)/documents/trips/$(resource.data.tripId)) &&
        get(/databases/$(database)/documents/trips/$(resource.data.tripId)).data.ownerId == uid();
    }

    // ADVANCES (tạm ứng) – chỉ owner trip nhập
    match /advances/{advanceId} {
      allow read: if isAuthed() && isTripMember(resource.data.tripId);
      allow create, update, delete: if isAuthed() &&
        exists(/databases/$(database)/documents/trips/$(request.resource.data.tripId)) &&
        get(/databases/$(database)/documents/trips/$(request.resource.data.tripId)).data.ownerId == uid();
    }

    // SETTLEMENTS (đề xuất hoàn trả) – server action tạo
    match /settlements/{settlementId} {
      allow read: if isAuthed() && isTripMember(resource.data.tripId);
      allow create, update, delete: if isAuthed() &&
        exists(/databases/$(database)/documents/trips/$(request.resource.data.tripId)) &&
        get(/databases/$(database)/documents/trips/$(request.resource.data.tripId)).data.ownerId == uid();
    }

    // AUDIT LOGS – chỉ owner trip xem
    match /auditLogs/{logId} {
      allow read: if isAuthed() &&
        exists(/databases/$(database)/documents/trips/$(resource.data.entityId)) &&
        get(/databases/$(database)/documents/trips/$(resource.data.entityId)).data.ownerId == uid();
      allow write: if isAuthed(); // ghi log bởi server action
    }
  }
}
```

**Ghi chú:**
- Không thể kiểm tra **duy nhất** của `slug` bằng rules; enforce ở server action (transaction) + index.
- Nhiều ràng buộc nghiệp vụ (duyệt nhóm Close, mapping exclusions/weights) nên xử lý ở **server actions** trước khi ghi DB.
- ID gợi ý cho `groupMembers`/`tripMembers` là **composite** để rules tra cứu nhanh.


---

## 13) System Functions (overview)

### Core (MVP) – P0
1) **Auth & Account**
   - Google Sign‑in, tạo tài khoản nội bộ (username slug 1 lần)
   - Hồ sơ người dùng (name, avatar), đổi ngôn ngữ & đơn vị mặc định (VI/EN, VND)
2) **Groups**
   - Tạo nhóm (Public/Close/Secret), duyệt join cho Close, quản lý thành viên (Owner/Member)
   - Group slug (duy nhất toàn hệ thống)
3) **Trips**
   - Tạo trip cá nhân/thuộc nhóm (VND/USD), trip slug (duy nhất trong group)
   - Quick Stats Card (tạm ứng, chi phí, trạng thái thanh toán thủ công)
   - Chốt trip (lock, export)
4) **Members (trip)**
   - Thêm từ hệ thống, từ nhóm, hoặc **thành viên ảo** (tên)
   - Gợi ý đồng bộ thành viên ảo ↔ user (không auto, confirm trong app — *post‑MVP*)
5) **Expenses**
   - Tạo/sửa khoản chi (chỉ sửa của mình), xoá bởi Owner trip
   - Chia đều hoặc **theo trọng số**; exclude thành viên (weight=0)
6) **Advances**
   - Nhập tạm ứng (chỉ Owner), hiển thị theo thành viên
7) **Settlements**
   - Tính công nợ (netting) bằng server action, tạo đề xuất hoàn trả
   - Xuất báo cáo CSV/PDF (server‑side)

### Supporting – P1
8) **Notifications (in‑app)**
   - Toast + badge + trang danh sách; trạng thái **đã đọc/chưa đọc**
9) **Security & Rules**
   - RBAC: Owner/Member; Firestore Rules theo owner/membership
   - Audit log cơ bản (Owner xem), cảnh báo trước khi xoá trip/group
10) **Analytics**
   - Firebase Analytics (sự kiện chính: login, create_group, create_trip, add_expense/advance, close_trip, export_pdf)
11) **Search & Filter**
   - Tìm user, group, trip; filter chi phí theo ngày, người trả, loại chia
12) **Internationalization & Currency**
   - i18n (VI/EN), tiền tệ theo trip (VND/USD)
13) **Performance & Caching**
   - Pagination danh sách chi phí, `statsCache` cho trip
14) **Observability**
   - Console error + (tùy chọn) Sentry sau này
15) **Operations**
   - Backup theo Firestore; export thủ công; cảnh báo khi > **500 expense/trip**

### Post‑MVP / Future – P2
16) **Attachments (Bill photos)**
   - Upload hóa đơn cho expense/advance
17) **Premium/Freemium**
   - Tính năng nâng cao: báo cáo chuyên sâu, đa tiền tệ từng khoản, role nâng cao
18) **Mobile app** (RN/Flutter), **AI assistant** (gợi ý chia chi)


---

## 14) Priority Tagging (P0/P1/P2)
- **P0 (Must‑have for MVP)**: Auth & Account, Groups, Trips, Trip Members, Expenses, Advances, Settlements (netting + CSV/PDF), Notifications (in‑app: toast/badge/list), Security & Rules, Analytics (Firebase basic), i18n (VI/EN) & currency (VND/USD per trip), Performance (pagination + statsCache), Operations (backup, warn >500 expenses), Deploy (Vercel + Firebase).
- **P1 (Should‑have, ngay sau MVP)**: Search & Filter (user/group/trip; filter expenses), Audit Logs **UI** (log backend đã có), Notifications UX polish, PDF layout nâng cao.
- **P2 (Nice‑to‑have / Later)**: Bill photo attachments, Freemium features, Mobile app (RN/Flutter), AI assistant.

---

## 15) Forms & Validation (Zod schemas)

### 15.1 Create Account (username slug 1 lần)
**Form fields**: `name`, `avatarUrl?`, `username`
```ts
import { z } from "zod";

export const UsernameSlug = z.string()
  .min(2).max(30)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, "Lowercase letters, numbers, hyphens; no leading/trailing hyphen; no double hyphen")
  .transform(s => s.toLowerCase());

export const CreateAccountSchema = z.object({
  name: z.string().min(1),
  avatarUrl: z.string().url().optional(),
  username: UsernameSlug,
});
```
**Server invariants**: `username` **duy nhất** toàn hệ thống; chỉ đặt **1 lần**.

### 15.2 Create Group
**Form fields**: `name`, `description?`, `coverUrl?`, `type`, `slug`
```ts
export const GroupType = z.enum(["public","close","secret"]);
export const Slug = UsernameSlug; // dùng chung quy tắc slug

export const CreateGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().max(2000).optional(),
  coverUrl: z.string().url().optional(),
  type: GroupType,
  slug: Slug,
});
```
**Server invariants**: `slug` **duy nhất** toàn hệ thống.

### 15.3 Create Trip
**Form fields**: `name`, `startDate`, `endDate`, `destination?`, `description?`, `coverUrl?`, `currency`, `costPerPersonPlanned?`, `category?`, `slug`, `groupId?`
```ts
export const Currency = z.enum(["VND","USD"]);

export const CreateTripSchema = z.object({
  name: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  destination: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
  coverUrl: z.string().url().optional(),
  currency: Currency,
  costPerPersonPlanned: z.number().nonnegative().optional(),
  category: z.string().max(120).optional(),
  slug: Slug,
  groupId: z.string().optional(),
}).refine(v => v.endDate >= v.startDate, {
  message: "endDate must be on/after startDate",
  path: ["endDate"],
});
```
**Server invariants**: `slug` **duy nhất trong group** (hoặc global nếu trip cá nhân); người tạo phải là owner của group (nếu có `groupId`).

### 15.4 Add Trip Member
**Form fields**: (một trong) `userId` **hoặc** `ghostName`
```ts
export const AddTripMemberSchema = z.object({
  tripId: z.string(),
  userId: z.string().optional(),
  ghostName: z.string().min(1).optional(),
}).refine(v => !!v.userId || !!v.ghostName, {
  message: "Provide userId or ghostName",
});
```
**Server invariants**: chỉ **owner trip** được thêm/xoá; nếu `userId` → verify user tồn tại; nếu `ghostName` → tạo record ảo.

### 15.5 Add Expense
**Form fields**: `tripId`, `amount`, `description?`, `payerId`, `splitMethod`, `weightMap?`, `exclusions?`
```ts
export const SplitMethod = z.enum(["equal","weight"]);

export const WeightEntry = z.object({
  memberId: z.string(),
  weight: z.number().min(0), // 0 = exclude theo weight
});

export const AddExpenseSchema = z.object({
  tripId: z.string(),
  amount: z.number().positive(),
  description: z.string().max(2000).optional(),
  payerId: z.string(),
  splitMethod: SplitMethod,
  weightMap: z.array(WeightEntry).optional(),
  exclusions: z.array(z.string()).optional(),
}).superRefine((v, ctx) => {
  if (v.splitMethod === "weight") {
    if (!v.weightMap || v.weightMap.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "weightMap required for weight split" });
    } else if (v.weightMap.every(w => w.weight === 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "At least one member must have weight > 0" });
    }
  }
});
```
**Server invariants**: `payerId` và tất cả `memberId` phải thuộc `tripMembers`; nếu `splitMethod = equal` → áp dụng cho **tập thành viên đã loại trừ** (exclusions + weight=0).

### 15.6 Add Advance
**Form fields**: `tripId`, `memberId`, `amount`, `note?`
```ts
export const AddAdvanceSchema = z.object({
  tripId: z.string(),
  memberId: z.string(),
  amount: z.number().positive(),
  note: z.string().max(1000).optional(),
});
```
**Server invariants**: chỉ **owner trip** được nhập/sửa/xoá; `memberId` thuộc `tripMembers`.

### 15.7 Close Trip & Export
**Form fields**: `tripId`, `rounding?` (boolean)
```ts
export const CloseTripSchema = z.object({
  tripId: z.string(),
  rounding: z.boolean().default(false),
});
```
**Server invariants**: sau khi chốt → khoá ghi chi phí/tạm ứng; vẫn cho đọc/xuất.


---

## 16) Development Process (Specify → Plan → Tasks → Implement)

### 1) Specify — *Mô tả cái gì & tại sao* (phi‑kỹ thuật)
- **Mục tiêu:** Chốt bài toán, phạm vi, tiêu chí thành công, ràng buộc nghiệp vụ.
- **Đầu vào:** Bối cảnh, pain points, user stories, luồng nghiệp vụ.
- **Đầu ra (artefacts):**
  - Problem statement & Success metrics
  - User stories & Acceptance criteria (phi kỹ thuật)
  - Scope (Must/Should/Could), Out‑of‑scope
- **Tiêu chí hoàn tất (Exit):** Mọi stakeholder hiểu cùng một phạm vi; không bàn kỹ thuật ở bước này.

### 2) Plan — *Chọn kỹ thuật & nguyên tắc thực thi*
- **Mục tiêu:** Quyết định stack, kiến trúc, security, data model, giới hạn.
- **Đầu vào:** Artefacts từ Specify.
- **Đầu ra:**
  - Tech choices (Next.js, Firebase, Vercel…)
  - Kiến trúc (module, flow, route, schema), Security rules
  - Non‑functional: hiệu năng, logging, analytics, i18n, rollout
  - Definition of Ready (DoR) cho từng hạng mục
- **Exit:** Rủi ro chính đã được ghi nhận/mitigate; mock route/schema ổn định.

### 3) Tasks — *Bóc tách nhiệm vụ nhỏ, kiểm tra được*
- **Mục tiêu:** Chuyển Plan → backlog các việc nhỏ, độc lập, có thể review.
- **Quy tắc tạo task:**
  - Mỗi task có **Mục tiêu**, **Ước lượng**, **Điều kiện chấp nhận (AC)**, **Test case nhanh**
  - Ưu tiên P0/P1; tránh phụ thuộc vòng tròn
- **Đầu ra:**
  - Sprint backlog (P0/P1)
  - Checklist kiểm thử & Definition of Done (DoD)
- **Exit:** Tất cả task đều có AC rõ ràng; có đường thực thi & kiểm thử.

### 4) Implement — *Thực thi & review liên tục*
- **Mục tiêu:** Coding agent thực thi; bạn review & điều chỉnh.
- **Cách chạy:**
  - Theo **nhịp commit ngắn** (PR nhỏ), CI build preview
  - Bạn review theo **AC/DoD**; mình sửa nhanh theo feedback
- **Đầu ra:**
  - Mã đã merge, preview link, log thay đổi
  - Nhật ký quyết định (Decision log) cập nhật
- **Exit:** Tất cả AC đạt; không nợ kỹ thuật blocker; đã cập nhật tài liệu.

### Chuẩn quy trình kèm theo
- **Definition of Ready (DoR):** Task có mô tả, AC, phụ thuộc, mock UI/route (nếu có), rủi ro.
- **Definition of Done (DoD):** Pass AC, code review OK, build preview OK, analytics event log, cập nhật docs.
- **Nhịp review:** Daily check‑in ngắn; cuối sprint: demo + retro.
- **Quản trị nhánh:** `main` (prod), `dev` (integrate), feature branches.
- **Chất lượng:** ESLint/Prettier, type‑safe, smoke tests cho server actions quan trọng.


---

## 16.a) Process Templates (Copy‑paste)

### TEMPLATE — Specify (non‑tech)
**Problem**: <mô tả ngắn vấn đề>
**Why now**: <vì sao cần làm>
**Audience**: <ai dùng>
**Goals**: <3 mục tiêu định lượng/ngắn>
**Non‑Goals**: <ngoài phạm vi>
**User stories**:
- As a <role>, I want <action> so that <benefit>.
**Acceptance (non‑tech)**:
- <điều kiện kết quả người dùng nhìn thấy>

### TEMPLATE — Plan (tech)
**Stack**: <Next.js, Firebase…>
**Architecture**: <module, route, data flow>
**Data model**: <collections/fields>
**Security**: <RBAC, rules>
**NFR**: <perf, i18n, analytics>
**Risks & Mitigation**: <rủi ro chính>
**Definition of Ready (DoR)**: <điều kiện để tạo task>

### TEMPLATE — Task (granular)
**ID/Title**: <P0‑XX — tên ngắn>
**Goal**: <1 câu>
**Acceptance Criteria (AC)**:
- [ ] AC1 …
- [ ] AC2 …
**Test Steps**:
1) … 2) … 3) …
**Notes/Dependencies**: <nếu có>
**Definition of Done (DoD)**:
- [ ] AC pass
- [ ] Code reviewed
- [ ] Preview OK
- [ ] Analytics event (nếu có)
- [ ] Docs updated

### TEMPLATE — Implement (runbook)
**Branch**: feature/<id‑slug>
**Commits**: nhỏ, mô tả rõ
**PR checklist**:
- [ ] Pass AC & DoD
- [ ] Không leak secret
- [ ] Lighthouse ≥ 90 (page chính)
- [ ] Security rules đã cập nhật
- [ ] Screenshots/GIF

---

## 17) P0 Backlog — Tasks with AC & Tests

### 17.1 Auth & Account
**P0‑01 — Google Sign‑in**
- **Goal:** Đăng nhập bằng Google, tạo session Firebase.
- **AC:**
  - [ ] Nút “Continue with Google” hiển thị ở trang /login
  - [ ] Đăng nhập thành công chuyển về /onboarding nếu chưa có tài khoản nội bộ
  - [ ] Lỗi login hiển thị toast
- **Test:** 1) Click login → Google popup; 2) Chọn tài khoản; 3) Về app có `uid` hợp lệ; 4) Logout hoạt động.

**P0‑02 — Create account (username slug 1 lần)**
- **Goal:** Sau login lần đầu, thu thập `name`, `username` (slug), avatar mặc định từ Google.
- **AC:**
  - [ ] Form validate `username` theo schema & check trùng (server action)
  - [ ] Lưu `users/{uid}` với `username`
  - [ ] Không cho đổi `username` lần 2
- **Test:** 1) Nhập slug hợp lệ → tạo OK; 2) Nhập slug trùng → báo lỗi; 3) Reload vẫn có tài khoản.

### 17.2 Groups
**P0‑03 — Create Group (Public/Close/Secret + slug)**
- **Goal:** Tạo nhóm với type & slug duy nhất.
- **AC:**
  - [ ] Form validate (name, type, slug)
  - [ ] Lưu `groups` và `groupMembers` (owner)
  - [ ] URL `/g/{groupSlug}` mở được trang nhóm
- **Test:** Tạo đủ 3 loại; slug trùng → lỗi; owner thấy nút quản trị.

**P0‑04 — Join Group (Public auto, Close request/duyệt)**
- **Goal:** Cơ chế tham gia nhóm theo type.
- **AC:**
  - [ ] Public: nút Join → vào ngay, tạo `groupMembers`
  - [ ] Close: nút Request → owner thấy notification và Approve/Reject
  - [ ] Secret: chỉ join qua invite (ẩn khỏi list)
- **Test:** Dùng 2 tài khoản: A tạo nhóm Close, B request → A approve → B thành member.

### 17.3 Trips
**P0‑05 — Create Trip (Personal/Group, currency VND/USD + slug)**
- **Goal:** Tạo chuyến đi với tiền tệ & slug (unique in group).
- **AC:**
  - [ ] Form validate & lưu `trips`
  - [ ] Chọn group hoặc để trống (trip cá nhân)
  - [ ] URL `/t/{groupSlug?}/{tripSlug}` hoạt động
- **Test:** Tạo trip cá nhân & thuộc nhóm; slug trùng trong group → báo lỗi.

**P0‑06 — Add Trip Members (user search / from group / ghost)**
- **Goal:** Quản lý danh sách thành viên tham gia.
- **AC:**
  - [ ] Search user & add; pick từ group; add ghost (tên)
  - [ ] Danh sách hiển thị role (creator/member)
- **Test:** Thêm đủ 3 cách; rời trip vẫn giữ tên trong lịch sử.

**P0‑07 — Quick Stats Card**
- **Goal:** Hiển thị tổng tạm ứng, tổng chi, trạng thái thanh toán.
- **AC:**
  - [ ] Tự tổng hợp số liệu từ expenses/advances
  - [ ] Toggle trạng thái paid/unpaid (lưu lại actor & time)
- **Test:** Thêm 2 advance + 3 expense → số liệu cập nhật đúng.

### 17.4 Expenses & Advances
**P0‑08 — Add Expense (equal/weight, exclusions)**
- **Goal:** Ghi khoản chi với chia đều/ trọng số & loại trừ thành viên.
- **AC:**
  - [ ] Validate amount > 0; payer là thành viên trip
  - [ ] equal: chia đều trừ người exclude/weight=0
  - [ ] weight: cần >=1 member weight>0
  - [ ] Member chỉ sửa khoản của mình; owner xoá
- **Test:**
  1) Trip 4 người: equal exclude 1 → 3 người chia 1:1
  2) weight: [2,1,1,0] → tổng 4 phần
  3) Non‑member payer → bị chặn.

**P0‑09 — Add Advance (owner‑only)**
- **Goal:** Nhập tạm ứng theo thành viên.
- **AC:**
  - [ ] Chỉ owner tạo/sửa/xoá
  - [ ] Hiển thị tổng tạm ứng theo người
- **Test:** Tài khoản member thử tạo → bị chặn.

### 17.5 Settlements & Export
**P0‑10 — Compute Settlement (netting)**
- **Goal:** Tính công nợ & đề xuất “ai trả ai”.
- **AC:**
  - [ ] Thuật toán netting chạy server action, cho kết quả tối thiểu giao dịch
  - [ ] Tuỳ chọn làm tròn (off mặc định)
- **Test:** Bộ dữ liệu chuẩn → đối chiếu kết quả mong đợi.

**P0‑11 — Export CSV/PDF (server‑side)**
- **Goal:** Xuất báo cáo quyết toán.
- **AC:**
  - [ ] Tạo file CSV & PDF tải về từ trang trip
  - [ ] Nội dung: info trip, members, advances, expenses, settlements
- **Test:** Xuất file & mở được; số liệu khớp UI.

**P0‑12 — Close Trip (lock)**
- **Goal:** Chốt chuyến, khoá ghi.
- **AC:**
  - [ ] Sau khi chốt: không thêm/sửa/xoá expense/advance
  - [ ] Vẫn cho export & xem lịch sử
- **Test:** Chốt → thử thêm expense → bị chặn.

### 17.6 Notifications (in‑app)
**P0‑13 — Toast & Badge**
- **Goal:** Hiển thị thông báo nhỏ & đếm số chưa đọc.
- **AC:**
  - [ ] Có toast khi sự kiện (join request, added to trip, trip closed)
  - [ ] Badge cập nhật real‑time (hoặc poll)
- **Test:** Bắn sự kiện giả → thấy toast & badge.

**P0‑14 — Notification List (read/unread)**
- **Goal:** Trang tổng hợp thông báo.
- **AC:**
  - [ ] Mark all/read single; phân trang
- **Test:** Tạo 10+ thông báo → phân trang ok.

### 17.7 Security, Analytics, Infra
**P0‑15 — Firestore Rules (owner/member)**
- **Goal:** Áp dụng rules skeleton.
- **AC:**
  - [ ] Member không xoá được expense
  - [ ] Non‑member không đọc được trip nhóm
- **Test:** Dùng 2 tài khoản kiểm tra chéo.

**P0‑16 — Firebase Analytics (events)**
- **Goal:** Gửi event cơ bản.
- **AC:** events: login, create_group, create_trip, add_expense, add_advance, close_trip, export_pdf
- **Test:** Kiểm tra events trong DebugView.

**P0‑17 — Deploy Vercel + Env**
- **Goal:** App chạy trên preview & production, env an toàn.
- **AC:**
  - [ ] `.env.local` dev; Vercel secrets cho prod
  - [ ] Previews build OK, không leak key
- **Test:** Mở preview URL, thử các flow chính.

