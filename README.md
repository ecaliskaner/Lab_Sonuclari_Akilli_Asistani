# Lab SonuÃ§larÄ± AkÄ±llÄ± Asistan (Lab Results Smart Assistant)

Bu proje, bir hastanede laboratuvar cihazlarÄ±ndan gelen test sonuÃ§larÄ±nÄ± iÅŸleyen, doÄŸrulayan, hekimlerin gÃ¶rÃ¼ntÃ¼lemesine sunan ve yapay zeka destekli (Ollama) klinik yorum ve Ã¶n analiz saÄŸlayan modern bir web uygulamasÄ±dÄ±r.

---

## Mimari YapÄ± ve AkÄ±ÅŸ DiyagramÄ±

Sistemin bileÅŸenleri arasÄ±ndaki veri akÄ±ÅŸÄ±nÄ± gÃ¶steren mimari ÅŸema aÅŸaÄŸÄ±dadÄ±r:

```mermaid
graph TD
    subgraph MOCK_DEVICE ["Cihaz SimÃ¼lasyonu"]
        MD[mock-lab-service:8081]
    end

    subgraph BACKEND ["Spring Boot Backend:8080"]
        PS[Polling Service]
        AE[Abnormality Evaluator]
        SEC[Spring Security & JWT]
        RSA[RSA Key Provider]
        LLM[LLM Proxy Layer]
    end

    subgraph DB ["PostgreSQL:5432"]
        PG[(Database)]
    end

    subgraph FRONTEND ["Vite React Frontend:3000"]
        UI[React Dashboard]
        CR[Web Crypto RSA]
        ZS[Zustand State]
    end

    subgraph AI ["Ollama / LM Studio:11434"]
        OL[Configurable Ollama Model]
    end

    %% Data Flows
    MD -- "1. HTTP Poll (JSON)" --> PS
    PS -- "2. Validation & Evaluation" --> AE
    PS -- "3. Save Result" --> PG
    UI -- "4. GET Public Key" --> RSA
    UI -- "5. Encrypted Login" --> SEC
    SEC -- "6. Authenticate" --> PG
    UI -- "7. Fetch Results (JWT)" --> SEC
    SEC --> PG
    UI -- "8. Request AI Analysis" --> LLM
    LLM -- "9. Generate Prompt" --> OL
    OL -- "10. Return Clinical Interpretation" --> LLM
    LLM -- "11. Serve Evaluation" --> UI
```

---

## HÄ±zlÄ± BaÅŸlangÄ±Ã§ (Docker Compose ile Kurulum)

### Gereksinimler
- BilgisayarÄ±nÄ±zda **Docker** ve **Docker Compose** kurulu olmalÄ±dÄ±r.
- Yapay zeka yorumlarÄ± iÃ§in lokalde **Ollama** yÃ¼klÃ¼ olmalÄ± ve `.env` iÃ§indeki `OLLAMA_MODEL` deÄŸerine karÅŸÄ±lÄ±k gelen model indirilmiÅŸ olmalÄ±dÄ±r. VarsayÄ±lan tercih `qwen2.5:14b` olarak ayarlanmÄ±ÅŸtÄ±r.

### AdÄ±m AdÄ±m Kurulum

1. **Repoyu KlonlayÄ±n veya Proje Dizinine Gidin:**
   ```bash
   cd lab-assistant
   ```

2. **Ã‡evre DeÄŸiÅŸkenlerini AyarlayÄ±n:**
   `.env.example` dosyasÄ±nÄ± `.env` olarak kopyalayÄ±n:
   ```bash
   cp .env.example .env
   ```
   *(Windows iÃ§in `copy .env.example .env`)*

3. **Ollama Modelini HazÄ±rlayÄ±n:**
   BilgisayarÄ±nÄ±zda Ollama'nÄ±n Ã§alÄ±ÅŸtÄ±ÄŸÄ±ndan ve `OLLAMA_MODEL` deÄŸerindeki modelin kurulu olduÄŸundan emin olun:
   ```bash
   ollama pull qwen2.5:14b
   ```
   EÄŸer bilgisayarÄ±nÄ±zdaki model adÄ± farklÄ±ysa `.env` iÃ§inde Ã¶rneÄŸin `OLLAMA_MODEL=qwen:14b` olarak deÄŸiÅŸtirebilirsiniz.

4. **Sistemi BaÅŸlatÄ±n:**
   Docker Compose ile tÃ¼m mikroservisleri ve veritabanÄ±nÄ± ayaÄŸa kaldÄ±rÄ±n:
   ```bash
   docker compose up --build
   ```

5. **Uygulamaya EriÅŸin:**
   - **Frontend (React Web ArayÃ¼zÃ¼):** `http://localhost:3000`
   - **Spring Boot Backend (REST API):** `http://localhost:8080`
   - **Mock Lab Cihaz Servisi:** `http://localhost:8081`
   - **API DÃ¶kÃ¼mantasyonu (Swagger UI):** `http://localhost:8080/swagger-ui/index.html`

---

## VarsayÄ±lan Test KullanÄ±cÄ±larÄ±

VeritabanÄ± otomatik olarak aÅŸaÄŸÄ±daki kullanÄ±cÄ±lar ve BCrypt ÅŸifreleriyle tohumlanÄ±r (seeding):

| Rol | E-posta (Login) | Åifre | AÃ§Ä±klama |
|---|---|---|---|
| **Hekim (DOCTOR)** | `dr.aydin@hastane.com` | `Doctor123!` | SonuÃ§ listesi ve detaylarÄ±nÄ± gÃ¶rÃ¼r, AI analizi ister. |
| **Hekim (DOCTOR)** | `dr.kaya@hastane.com` | `Doctor123!` | SonuÃ§ listesi ve detaylarÄ±nÄ± gÃ¶rÃ¼r, AI analizi ister. |
| **YÃ¶netici (ADMIN)** | `admin@hastane.com` | `Admin123!` | TÃ¼m hekim yetkilerine ek olarak Audit Log sekmesine eriÅŸebilir. |

---

## Teknik Kararlar ve Tercih GerekÃ§eleri

### 1. Neden Åifre AktarÄ±mÄ±nda RSA Åifrelemesi KullandÄ±k?
Ã–dev yÃ¶nergesindeki *"encryption ile login olacaÄŸÄ± frontend"* maddesi uyarÄ±nca, sadece standart SSL/TLS (HTTPS) gÃ¼venliÄŸi ile yetinilmeyip uygulama katmanÄ±nda asimetrik ÅŸifreleme uygulanmÄ±ÅŸtÄ±r.
- **NasÄ±l Ã‡alÄ±ÅŸÄ±r:** Backend her aÃ§Ä±lÄ±ÅŸta 2048-bit RSA anahtar Ã§ifti Ã¼retir. Ä°stemci giriÅŸ ekranÄ±nda backend'den Public Key PEM string'ini (`GET /api/auth/public-key`) Ã§eker. Åifreyi native **Web Crypto API** ile RSA-OAEP (SHA-256) algoritmalarÄ± kullanarak tarayÄ±cÄ±da ÅŸifreler ve Base64 string olarak iletir. Backend ise Private Key ile bu ÅŸifreyi Ã§Ã¶zÃ¼p BCrypt eÅŸleÅŸtirmesini doÄŸrular.
- **KazancÄ±:** GeliÅŸtirme veya yerel test ortamÄ±nda HTTP Ã¼zerinden baÄŸlantÄ± kurulsa dahi hekim ÅŸifreleri aÄŸda asla aÃ§Ä±k metin (plain text) olarak dolaÅŸmaz.

### 2. Neden Polling MekanizmasÄ± Tercih Edildi?
Laboratuvar cihazlarÄ± genellikle batch mantÄ±ÄŸÄ±yla Ã§alÄ±ÅŸÄ±r ve saniyede yÃ¼zlerce anlÄ±k veri basmak yerine test tamamlandÄ±kÃ§a (Ã¶rneÄŸin 30 saniyede bir) kuyruÄŸa veri yazar.
- **Karar:** WebSocket/Server-Sent Events (SSE) gibi sÃ¼rekli aÃ§Ä±k tutulan TCP baÄŸlantÄ±larÄ± klinik terminallerde gereksiz kaynak tÃ¼ketimine yol aÃ§abilir. 30 saniyelik veritabanÄ± polling mekanizmasÄ±, hem aÄŸ yÃ¼kÃ¼nÃ¼ minimumda tutmakta hem de veri tutarlÄ±lÄ±ÄŸÄ±nÄ± garantilemektedir.

### 3. Neden LLM Proxy KatmanÄ±nÄ± Backend'de KurguladÄ±k?
Yapay zeka (Ollama) Ã§aÄŸrÄ±larÄ± doÄŸrudan frontend Ã¼zerinden de tetiklenebilirdi. Ancak backend entegrasyonu ÅŸu avantajlarÄ± saÄŸlamaktadÄ±r:
- **GÃ¼venlik:** Yapay zekaya giden promptlar backend tarafÄ±nda kontrol edilir. Hekim adÄ±, ÅŸifre veya hastanÄ±n kiÅŸisel verileri (KVKK/GDPR uyumluluÄŸu iÃ§in) prompta eklenmez; sadece anonim hasta referansÄ± (`patientRef`), yaÅŸ ve cinsiyet gÃ¶nderilir.
- **Loglama:** Her AI sorgusu backend denetim gÃ¼nlÃ¼ÄŸÃ¼ne (`AuditLog`) correlation request ID ile kaydedilir.

### 4. Neden LLM YanÄ±tlarÄ±nÄ± VeritabanÄ±nda Kaydetmiyoruz?
- **Karar:** AI yorumlarÄ± kalÄ±cÄ± veritabanÄ±nda saklanmaz, hekim her yorum istediÄŸinde canlÄ± olarak Ã¼retilir.
- **GerekÃ§e:** Klinik bulgularda "taze yorum" (fresh interpretation) Ã¶nceliklidir. AI modelleri gÃ¼ncellendikÃ§e veya lokal hekim ayarlarÄ± deÄŸiÅŸtikÃ§e eski/hatalÄ± yorumlarÄ±n cache'den gelmesi Ã¶nlenmiÅŸ olur.

### 5. Neden Zustand Tercih Edildi?
- **Karar:** React Global State iÃ§in Zustand kullanÄ±lmÄ±ÅŸtÄ±r.
- **GerekÃ§e:** Redux Toolkit kÃ¼Ã§Ã¼k ve orta Ã¶lÃ§ekli projeler iÃ§in aÅŸÄ±rÄ± karmaÅŸÄ±ktÄ±r (overkill). Zustand ise in-memory durum yÃ¶netimini minimal kodla saÄŸlar. GÃ¼venlik gerekÃ§esiyle tokenlar `localStorage` yerine Zustand in-memory state'inde tutulur; tarayÄ±cÄ± yenilendiÄŸinde oturumun dÃ¼ÅŸmesi bilinÃ§li bir kÄ±sÄ±ttÄ±r.

### 6. Neden MapStruct Tercih Edildi?
- **GerekÃ§e:** Entity'leri elle DTO'lara dÃ¶nÃ¼ÅŸtÃ¼rmek hata yapmaya mÃ¼saittir. MapStruct derleme zamanÄ±nda tip-gÃ¼venli (type-safe) kod Ã¼reterek dÃ¶nÃ¼ÅŸÃ¼m performansÄ±nÄ± artÄ±rÄ±r ve kod kalitesini korur.

---

## YapÄ±lmayanlar, BilinÃ§li KÄ±sÄ±tlar ve Limitasyonlar

| Konu | SÄ±nÄ±rlama / BilinÃ§li Karar | GerekÃ§e |
|---|---|---|
| **HTTPS/TLS** | Proje HTTP Ã¼zerinden Ã§alÄ±ÅŸmaktadÄ±r. | GeliÅŸtirme ortamÄ± kurulumunu kolaylaÅŸtÄ±rmak iÃ§in. Ãœretim ortamÄ±nda (Production) Nginx Ã¶nÃ¼nde TLS sonlandÄ±rÄ±lmasÄ± planlanmaktadÄ±r. |
| **LLM YanÄ±t Cache** | AI analizleri DB'ye kaydedilmemektedir. | Hekimin her zaman Ollama'nÄ±n gÃ¼ncel durumu ve model aÄŸÄ±rlÄ±klarÄ±na gÃ¶re taze klinik yorum almasÄ±nÄ± saÄŸlamak iÃ§in. |
| **JWT LocalStorage** | Tokenlar tarayÄ±cÄ± diskine yazÄ±lmaz. | XSS saldÄ±rÄ±larÄ±na karÅŸÄ± korunmak iÃ§in in-memory tutulur. Sayfa refresh edildiÄŸinde kullanÄ±cÄ±nÄ±n tekrar giriÅŸ yapmasÄ± gerekir (Klinik terminal gÃ¼venliÄŸi). |
| **WebSocket** | AnlÄ±k push yerine 30 saniyede bir poll edilir. | Klinik ortamda anlÄ±k veri akÄ±ÅŸÄ± hekim ekranlarÄ±nda dikkat daÄŸÄ±nÄ±klÄ±ÄŸÄ± yaratabilir; 30s periyodik yenileme yeterlidir. |
| **E2E Test** | Cypress/Playwright entegrasyonu kurulmamÄ±ÅŸtÄ±r. | Test kapsama sÃ¼reci; Spring Boot Unit/Integration testleri ve Vitest + React Testing Library + JSDOM sanity testleriyle sÄ±nÄ±rlandÄ±rÄ±lmÄ±ÅŸtÄ±r. |

---

## Testlerin KoÅŸulmasÄ± (CI/CD ve Docker Entegrasyonu)

### 1. Docker Build AÅŸamasÄ±nda Testler (Otomatik)
Projede testlerin pipeline veya build sÄ±rasÄ±nda bypass edilmemesi saÄŸlanmÄ±ÅŸtÄ±r. `backend/Dockerfile` iÃ§erisinde `mvn clean package` komutu Ã§alÄ±ÅŸÄ±rken tÃ¼m JUnit testleri (Abnormality Evaluator, LLM Prompt, Polling, Controller ve Security Integration testleri) otomatik olarak koÅŸulur.
*   **Test VeritabanÄ±:** Testlerin Postgres baÄŸÄ±mlÄ±lÄ±ÄŸÄ±nÄ± kaldÄ±rmak ve izole Ã§alÄ±ÅŸabilmesini saÄŸlamak iÃ§in test scope'unda **in-memory H2 Database** yapÄ±landÄ±rÄ±lmÄ±ÅŸ ve Flyway testler sÄ±rasÄ±nda devre dÄ±ÅŸÄ± bÄ±rakÄ±lmÄ±ÅŸtÄ±r.

### 2. Frontend Testleri (Vitest)
React istemcisinin temel render sanity durumlarÄ±nÄ± kontrol etmek iÃ§in Vitest, React Testing Library ve JSDOM test ortamÄ± kurulmuÅŸtur.
*   **Ã‡alÄ±ÅŸtÄ±rma:** `frontend` dizininde `npm run test` komutuyla testleri koÅŸturabilirsiniz:
    ```bash
    cd frontend
    npm run test
    ```

---

## YÃ¶netici Denetim Ä°zleri (Admin Audit Logs) Senaryo Ã–rneÄŸi

Sistemde gerÃ§ekleÅŸtirilen tÃ¼m veri okuma, analiz isteme, giriÅŸ yapma ve veri yazma eylemleri `AuditLog` katmanÄ±nda denetlenir. Bir sistem yÃ¶neticisi (`admin@hastane.com`) bu loglarÄ± ÅŸu senaryoda inceler:

1.  **GiriÅŸ:** YÃ¶netici admin hesabÄ±yla sisteme girer ve sol taraftaki **Audit LoglarÄ±** menÃ¼sÃ¼ne tÄ±klar.
2.  **Sorgu ve Filtreleme:** Arama kutusuna `VIEW_RESULT` yazarak veya hekim bazlÄ± filtre uygulayarak `dr.aydin@hastane.com` kullanÄ±cÄ±sÄ±nÄ±n eylemlerine odaklanÄ±r.
3.  **Ä°nceleme:**
    *   Hekimin hangi hasta detaylarÄ±nÄ± incelediÄŸini (`action: VIEW_RESULT`, `patientRef: PT-00042`) doÄŸrular.
    *   Hekimin ne zaman AI analizi talep ettiÄŸini (`action: GENERATE_ANALYSIS`) kontrol eder.
    *   AÄŸ geÃ§idinden gelen `requestId` (talep izleme kimliÄŸi) sayesinde, hekimin yaptÄ±ÄŸÄ± her eylemin veritabanÄ±ndaki log izi ve sunucudaki HTTP istek zinciriyle birebir uyuÅŸtuÄŸunu denetler.

Bu denetim mekanizmasÄ± klinik verilerin izinsiz eriÅŸimini (KVKK/GDPR uyumluluÄŸu) engellemek amacÄ±yla tasarlanmÄ±ÅŸtÄ±r.

---

## Mock Lab CihazÄ± Senaryo Tetikleme YÃ¶nergesi

DeÄŸerlendirici hekimin farklÄ± senaryolarÄ± test edebilmesi iÃ§in `mock-lab-service` Ã¼zerinde Ã¶zel bir override endpoint'i bulunmaktadÄ±r. 

Terminalden aÅŸaÄŸÄ±daki curl komutuyla sÄ±radaki test sonucunu tetikleyebilirsiniz:

```bash
# SÄ±radaki test sonucunu kritik olarak zorla:
curl -X POST http://localhost:8081/api/device/scenario/override \
     -H "Content-Type: application/json" \
     -d '{"scenario": "CRITICAL"}'
```

**KullanÄ±labilir Senaryolar:** `NORMAL`, `ABNORMAL_LOW`, `ABNORMAL_HIGH`, `CRITICAL`, `MALFORMED`, `DEVICE_ERROR`

-   `MALFORMED` tetiklendiÄŸinde; backend bunu `INVALID` status ile DB'ye kaydeder ancak frontend hekim listesine basmaz. Loglarda validation hatasÄ± gÃ¶rÃ¼lebilir.
-   `DEVICE_ERROR` tetiklendiÄŸinde; mock cihaz 503 dÃ¶ner, backend polling servisi hata fÄ±rlatmadan gracefully log atar ve Ã§alÄ±ÅŸmaya devam eder.

---

## Teslim Belgeleri ve Ekran GÃ¶rÃ¼ntÃ¼leri

UygulamanÄ±n kullanÄ±m yÃ¶nergeleri ve ekran gÃ¶rÃ¼ntÃ¼lerine [docs/USER_GUIDE.md](docs/USER_GUIDE.md) dosyasÄ± Ã¼zerinden ve ekran gÃ¶rÃ¼ntÃ¼lerine `docs/screenshots/` klasÃ¶rÃ¼nden eriÅŸebilirsiniz.
