export interface DiagramTemplate {
  id: string
  name: string
  description: string
  code: string
}

export const DIAGRAM_TEMPLATES: DiagramTemplate[] = [
  {
    id: 'sequence',
    name: 'Sequence Diagram',
    description: 'Alur interaksi login dan autentikasi token antara pengguna, frontend, backend API, dan database.',
    code: `@startuml
autonumber
skinparam style strictuml
skinparam BoxPadding 10
skinparam ParticipantPadding 10

actor "Pengguna" as User
box "Aplikasi Web" #LightBlue
  participant "Frontend (SPA)" as FE
end box
box "Layanan Backend" #LightGreen
  participant "API Gateway" as Gateway
  participant "Auth Service" as Auth
  database "PostgreSQL" as DB
end box

User -> FE : Masukkan email & password
activate FE

FE -> Gateway : POST /api/v1/auth/login
activate Gateway

Gateway -> Auth : Verifikasi Kredensial
activate Auth

Auth -> DB : SELECT * FROM users WHERE email = ?
activate DB
DB --> Auth : Data user & hashed password
deactivate DB

Auth -> Auth : Cocokkan Hash Password (bcrypt)
alt Password Cocok
  Auth -> Auth : Generate JWT Access & Refresh Token
  Auth --> Gateway : 200 OK (JWT Token + Profil)
  Gateway --> FE : 200 OK (Set-Cookie / Bearer Token)
  FE --> User : Arahkan ke Dashboard
else Password Salah
  Auth --> Gateway : 401 Unauthorized
  deactivate Auth
  Gateway --> FE : 401 Unauthorized
  deactivate Gateway
  FE --> User : Tampilkan pesan "Email atau password salah"
  deactivate FE
end
@enduml`
  },
  {
    id: 'class',
    name: 'Class Diagram',
    description: 'Struktur kelas sistem e-commerce mencakup pengguna, pesanan, produk, dan pembayaran.',
    code: `@startuml
skinparam classAttributeIconSize 0

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
}

abstract class User {
  # id: String
  # name: String
  # email: String
  + login(): Boolean
  + logout(): Void
}

class Customer {
  - shippingAddress: String
  - phoneNumber: String
  + placeOrder(cart: Cart): Order
  + viewHistory(): List<Order>
}

class Admin {
  - roleLevel: Integer
  + updateProduct(product: Product): Void
  + viewSalesReport(): Report
}

class Order {
  - orderId: String
  - orderDate: DateTime
  - totalAmount: Double
  - status: OrderStatus
  + calculateTotal(): Double
  + updateStatus(newStatus: OrderStatus): Void
}

class OrderItem {
  - quantity: Integer
  - unitPrice: Double
  + getSubtotal(): Double
}

class Product {
  - sku: String
  - name: String
  - price: Double
  - stock: Integer
  + checkAvailability(qty: Integer): Boolean
  + reduceStock(qty: Integer): Void
}

interface PaymentMethod {
  + pay(amount: Double): Boolean
}

class CreditCardPayment implements PaymentMethod {
  - cardNumber: String
  - cvv: String
  + pay(amount: Double): Boolean
}

class EWalletPayment implements PaymentMethod {
  - providerName: String
  - walletPhone: String
  + pay(amount: Double): Boolean
}

User <|-- Customer
User <|-- Admin
Customer "1" *-- "0..*" Order : menempatkan
Order "1" *-- "1..*" OrderItem : terdiri dari
OrderItem "0..*" --> "1" Product : merujuk ke
Order --> "1" PaymentMethod : diproses oleh
Order --> OrderStatus
@enduml`
  },
  {
    id: 'usecase',
    name: 'Use Case Diagram',
    description: 'Diagram Use Case untuk sistem manajemen perpustakaan digital.',
    code: `@startuml
left to right direction
skinparam packageStyle rectangle

actor "Anggota" as Member
actor "Pustakawan" as Librarian
actor "Sistem Pembayaran Eksternal" as PaymentSystem

rectangle "Sistem Perpustakaan Digital" {
  usecase "Cari Katalog Buku" as UC_Search
  usecase "Pinjam Buku" as UC_Borrow
  usecase "Kembalikan Buku" as UC_Return
  usecase "Bayar Denda Keterlambatan" as UC_PayFine
  usecase "Kelola Data Buku" as UC_ManageBooks
  usecase "Verifikasi Keanggotaan" as UC_VerifyMember
  usecase "Generate Laporan Peminjaman" as UC_Report
}

Member --> UC_Search
Member --> UC_Borrow
Member --> UC_Return
Member --> UC_PayFine

Librarian --> UC_ManageBooks
Librarian --> UC_Report
Librarian --> UC_VerifyMember

UC_Borrow ..> UC_VerifyMember : <<include>>
UC_Return ..> UC_PayFine : <<extend>> (Jika terlambat)
UC_PayFine --> PaymentSystem
@enduml`
  },
  {
    id: 'activity',
    name: 'Activity Diagram',
    description: 'Alur proses checkout belanja daring mulai dari validasi keranjang hingga pengiriman.',
    code: `@startuml
start
:Pengguna menekan tombol Checkout;
:Validasi isi keranjang belanja;

if (Keranjang Kosong?) then (ya)
  :Tampilkan pesan peringatan;
  stop
else (tidak)
  :Pilih Alamat Pengiriman;
  :Hitung Ongkos Kirim;
  :Pilih Metode Pembayaran;
  
  fork
    :Kunci stok produk sementara;
  fork again
    :Buat tagihan pembayaran (Invoice);
  end fork
  
  :Menunggu Pembayaran dari Pengguna;
  
  if (Pembayaran Berhasil?) then (ya)
    :Perbarui status pesanan menjadi "PAID";
    :Kirim konfirmasi lewat Email & WhatsApp;
    :Kirim pesanan ke gudang untuk pengemasan;
    :Paket diserahkan ke kurir ekspedisi;
    :Perbarui status menjadi "SHIPPED";
  else (waktu habis / gagal)
    :Batalkan pesanan;
    :Kembalikan kuota stok produk;
    :Kirim notifikasi pembatalan;
  endif
  
  stop
endif
@enduml`
  },
  {
    id: 'er',
    name: 'ER Diagram (Entity Relationship)',
    description: 'Model Entity-Relationship skema basis data e-commerce relasional.',
    code: `@startuml
!define Table(name,desc) class name as "desc" << (T,#FFAAAA) >>
hide methods
hide stereotypes
skinparam roundcorner 5
skinparam linetype ortho

entity "customers" as customers {
  * **id** : INT [PK]
  --
  * email : VARCHAR(255) [UNIQUE]
  * password_hash : VARCHAR(255)
  * full_name : VARCHAR(100)
  phone_number : VARCHAR(20)
  created_at : TIMESTAMP
}

entity "orders" as orders {
  * **id** : INT [PK]
  --
  * customer_id : INT [FK]
  * order_number : VARCHAR(50) [UNIQUE]
  * total_amount : DECIMAL(12,2)
  * status : VARCHAR(30)
  created_at : TIMESTAMP
}

entity "order_items" as order_items {
  * **id** : INT [PK]
  --
  * order_id : INT [FK]
  * product_id : INT [FK]
  * quantity : INT
  * unit_price : DECIMAL(12,2)
}

entity "products" as products {
  * **id** : INT [PK]
  --
  * category_id : INT [FK]
  * sku : VARCHAR(50) [UNIQUE]
  * name : VARCHAR(150)
  * price : DECIMAL(12,2)
  * stock_qty : INT
  is_active : BOOLEAN
}

entity "categories" as categories {
  * **id** : INT [PK]
  --
  * name : VARCHAR(100)
  slug : VARCHAR(100) [UNIQUE]
  parent_id : INT [FK]
}

customers ||--o{ orders : "menempatkan"
orders ||--|{ order_items : "memuat"
products ||--o{ order_items : "dibeli dalam"
categories ||--o{ products : "mengelompokkan"
categories ||--o{ categories : "sub-kategori"
@enduml`
  },
  {
    id: 'lrs',
    name: 'Logical Record Structure (LRS)',
    description: 'Struktur Rekaman Logis relasi basis data akademik mahasiswa, mata kuliah, dan KRS.',
    code: `@startuml
skinparam roundcorner 8
skinparam class {
  BackgroundColor LightYellow
  ArrowColor DarkBlue
  BorderColor Navy
}

class MAHASISWA {
  * **NIM** [PK] : VARCHAR(15)
  --
  nama_lengkap : VARCHAR(100)
  jurusan : VARCHAR(50)
  angkatan : CHAR(4)
  alamat : TEXT
}

class DOSEN {
  * **NIDN** [PK] : VARCHAR(15)
  --
  nama_dosen : VARCHAR(100)
  gelar : VARCHAR(30)
  email : VARCHAR(100)
}

class MATA_KULIAH {
  * **KODE_MK** [PK] : VARCHAR(10)
  --
  nama_mk : VARCHAR(100)
  sks : INT
  semester : INT
  * NIDN_PENGAMPU [FK] : VARCHAR(15)
}

class KRS_DETAIL {
  * **ID_KRS** [PK] : INT
  --
  * NIM [FK] : VARCHAR(15)
  * KODE_MK [FK] : VARCHAR(10)
  tahun_ajaran : VARCHAR(9)
  nilai_angka : DECIMAL(4,2)
  nilai_huruf : CHAR(2)
}

MAHASISWA "1" -- "M" KRS_DETAIL : Mengambil >
MATA_KULIAH "1" -- "M" KRS_DETAIL : Diambil dalam >
DOSEN "1" -- "M" MATA_KULIAH : Mengampu >
@enduml`
  }
]
