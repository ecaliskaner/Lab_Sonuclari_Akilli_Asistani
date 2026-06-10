# YEKA Lab PortalÄ± - KullanÄ±m ve DeÄŸerlendirme KÄ±lavuzu (USER GUIDE)

Bu kÄ±lavuz, **Lab SonuÃ§larÄ± AkÄ±llÄ± AsistanÄ±** uygulamasÄ±nÄ±n kurulum, kullanÄ±m ve deÄŸerlendirme adÄ±mlarÄ±nÄ± iÃ§ermektedir.

---

## 1. GiriÅŸ ve Oturum AÃ§ma (Authentication)

Uygulama, hekimlerin ve yÃ¶neticilerin gÃ¼venli bir ÅŸekilde giriÅŸ yapabilmesi iÃ§in uygulama katmanÄ±nda **RSA-OAEP 2048-bit** asimetrik ÅŸifreleme kullanÄ±r.

*   **Hekim Yetkisi (DOCTOR):** `dr.aydin@hastane.com` / `Doctor123!`
*   **YÃ¶netici Yetkisi (ADMIN):** `admin@hastane.com` / `Admin123!`

### GiriÅŸ EkranÄ± GÃ¶rÃ¼nÃ¼mÃ¼
AÅŸaÄŸÄ±daki ekran gÃ¶rÃ¼ntÃ¼sÃ¼nde, asimetrik ÅŸifreleme ve kurumsal giriÅŸ formu yer almaktadÄ±r:

![GiriÅŸ EkranÄ±](screenshots/login.png)

*Not: Åifreniz aÄŸ Ã¼zerinden gÃ¶nderilmeden Ã¶nce tarayÄ±cÄ±da RSA public key ile ÅŸifrelenir ve backend tarafÄ±nda private key ile Ã§Ã¶zÃ¼lerek BCrypt doÄŸrulamasÄ± gerÃ§ekleÅŸtirilir.*

---

## 2. Klinik Bulgular Paneli (Dashboard)

BaÅŸarÄ±lÄ± bir ÅŸekilde giriÅŸ yapÄ±ldÄ±ÄŸÄ±nda, sizi modern, Apple-tarzÄ± aÃ§Ä±k temalÄ± **Klinik Bulgular Paneli** karÅŸÄ±lar:

![Klinik Bulgular Paneli](screenshots/dashboard.png)

### Panel BileÅŸenleri:
1.  **Global Ä°statistik KartlarÄ±:**
    *   **Toplam KayÄ±t:** Filtrelere uyan toplam kayÄ±t sayÄ±sÄ±nÄ± gÃ¶sterir.
    *   **Anormal Bulgular:** Filtrelere uyan tÃ¼m sayfalardaki anormal sonuÃ§larÄ±n toplam sayÄ±sÄ±dÄ±r.
    *   **Kritik Bulgular:** Acil mÃ¼dahale gerektiren (Kritik DÃ¼ÅŸÃ¼k/Kritik YÃ¼ksek) sonuÃ§larÄ±n toplam sayÄ±sÄ±dÄ±r.
    *   **Test Tipi SayÄ±sÄ±:** Sistemdeki benzersiz test Ã§eÅŸitliliÄŸidir.
2.  **GeliÅŸmiÅŸ Arama Filtreleri:** Hasta referans numarasÄ±, anormallik seviyesi, test kodu ve tarih aralÄ±ÄŸÄ±na gÃ¶re anlÄ±k sorgulama yapabilirsiniz.
3.  **SonuÃ§ Listesi ve Sayfalama:** SonuÃ§lar tablosunda her bir kaydÄ±n durumunu gÃ¶rebilir, sayfa deÄŸiÅŸtirerek veritabanÄ±nda gezinebilirsiniz.

---

## 3. Mock Cihaz SenaryolarÄ±nÄ± Tetikleme

Sisteme farklÄ± tipte verilerin (normal, anormal, kritik veya hatalÄ±) aktÄ±ÄŸÄ±nÄ± gÃ¶rmek iÃ§in `mock-lab-service` (port `8081`) simÃ¼lasyonunu terminalden yÃ¶nlendirebilirsiniz:

```bash
# SÄ±radaki test sonucunun 'KRÄ°TÄ°K' olmasÄ±nÄ± tetikleme:
curl -X POST http://localhost:8081/api/device/scenario/override \
     -H "Content-Type: application/json" \
     -d '{"scenario": "CRITICAL"}'
```

### KullanÄ±labilir Senaryolar ve DavranÄ±ÅŸlarÄ±:
*   `NORMAL`: Referans aralÄ±klarÄ± iÃ§inde normal bir test deÄŸeri Ã¼retir.
*   `ABNORMAL_LOW` / `ABNORMAL_HIGH`: Referans sÄ±nÄ±rlarÄ±nÄ±n hafif dÄ±ÅŸÄ±nda sonuÃ§ Ã¼retir.
*   `CRITICAL`: Hayati tehlike oluÅŸturabilecek aÅŸÄ±rÄ± dÃ¼ÅŸÃ¼k veya yÃ¼ksek deÄŸer Ã¼retir.
*   `MALFORMED`: Bozuk veri formatÄ± simÃ¼le eder (Ã–rn: GeÃ§ersiz yaÅŸ, negatif referans aralÄ±ÄŸÄ±). Backend bu veriyi yakalar, `INVALID` statÃ¼sÃ¼ ile veri tabanÄ±na yazar ancak paneli kirletmemesi iÃ§in hekim tablosuna yansÄ±tmaz.
*   `DEVICE_ERROR`: CihazÄ±n kapalÄ± olmasÄ± durumudur. Cihaz 503 Service Unavailable dÃ¶ner. Backend polling servisi hata fÄ±rlatmadan gracefully log atarak Ã§alÄ±ÅŸmaya devam eder.

---

## 4. Yapay Zeka (LLM) Analiz Raporu Ä°steme

1.  Bulgular listesinden herhangi bir hastanÄ±n saÄŸ tarafÄ±ndaki **"Ä°ncele >"** butonuna tÄ±klayÄ±n.
2.  AÃ§Ä±lan detay kartÄ±nda, hastanÄ±n deÄŸerinin referans aralÄ±ÄŸÄ±nda nerede olduÄŸunu gÃ¶steren **Klinik Referans Ä°ndikatÃ¶rÃ¼nÃ¼** gÃ¶receksiniz. Farenizi indikatÃ¶rÃ¼n Ã¼zerindeki noktaya getirdiÄŸinizde hastanÄ±n tam deÄŸeri bir mikro animasyon ile belirecektir.

### Analiz Ã–ncesi GÃ¶rÃ¼nÃ¼m
Hekim detay kartÄ±na girdiÄŸinde, saÄŸ kÄ±sÄ±mda YZ Analiz Raporu talep edebileceÄŸi buton yer alÄ±r:

![Detay GÃ¶rÃ¼nÃ¼mÃ¼ ve YZ Talep EkranÄ±](screenshots/detail_pre_analysis.png)

3.  SaÄŸ tarafta yer alan **"Yapay Zeka Analiz Raporu Talep Et"** butonuna basÄ±n.
4.  Lokal GPU'nuzda Ã§alÄ±ÅŸan **Ollama (qwen2.5:14b)** modeli, hastanÄ±n yaÅŸÄ±nÄ±, cinsiyetini ve test deÄŸerlerini analiz ederek saniyeler iÃ§inde **Klinik Ã–zet**, **Ã–n TanÄ± SeÃ§enekleri**, **Ã–nerilen Eylemler** ve aciliyet durumunu hekime raporlar.

### Analiz SonrasÄ± Klinik Rapor
Saniyeler iÃ§inde Ollama modeli tarafÄ±ndan Ã¼retilen klinik deÄŸerlendirme ve Ã¶neriler hekim paneline yansÄ±r:

![Yapay Zeka Klinik Yorum Raporu](screenshots/detail_post_analysis.png)

*Not: EÄŸer Ollama kapalÄ±ysa veya Ã§Ã¶kmÃ¼ÅŸse, sistem hekime hata vermek yerine kural tabanlÄ± bir yedek rapor (Fallback Report) oluÅŸturur ve Ollama servisinin offline olduÄŸunu belirten bir uyarÄ± paneli gÃ¶sterir.*

---

## 5. YÃ¶netici Denetim Ä°zleri (Admin Audit Logs)

Bir `ADMIN` (`admin@hastane.com`) olarak giriÅŸ yaptÄ±ÄŸÄ±nÄ±zda, sol menÃ¼de **Audit LoglarÄ±** seÃ§eneÄŸi belirir. Bu sayfa, sistemde gerÃ§ekleÅŸtirilen her kritik iÅŸlemi ve kimin gerÃ§ekleÅŸtirdiÄŸini loglar.

![YÃ¶netici Denetim Ä°zleri (Audit Logs) EkranÄ±](screenshots/audit_logs.png)

### Ã–rnek Denetim Senaryosu:
Bir denetim uzmanÄ± veya hastane yÃ¶neticisi sisteme sÄ±zma giriÅŸimi veya veri sÄ±zÄ±ntÄ±sÄ± ÅŸÃ¼phesi ile inceleme yapmak istiyor:

1.  **Senaryo:** YÃ¶netici `admin@hastane.com` hesabÄ± ile giriÅŸ yapar ve **Audit LoglarÄ±** sayfasÄ±na tÄ±klar.
2.  **Arama:** Arama Ã§ubuÄŸuna `VIEW_RESULT` yazar veya filtreleri kullanarak belirli bir hekimin (`dr.aydin@hastane.com`) yaptÄ±ÄŸÄ± sorgularÄ± listeler.
3.  **Bulgular:**
    *   `LIST_RESULTS` loglarÄ± ile hekimin hangi filtrelerle arama yaptÄ±ÄŸÄ±nÄ± gÃ¶zlemler.
    *   `VIEW_RESULT` loglarÄ± ile hekimin hangi hastalarÄ±n (Ã–rn: `PT-00042`) detay verilerini incelediÄŸini gÃ¶rÃ¼r.
    *   Loglardaki `requestId` deÄŸeri sayesinde, hekimin bir iÅŸlem yaparken oluÅŸturduÄŸu HTTP request zincirini takip ederek veritabanÄ± sorgularÄ±nÄ± eÅŸleÅŸtirir.
    *   `LOGIN_SUCCESS` veya `LOGIN_FAILURE` loglarÄ± ile yetkisiz giriÅŸ denemelerini veya ÅŸÃ¼pheli IP adreslerini saptar.

Bu sayede hastane yÃ¶netimi, hasta verilerinin gizliliÄŸini (KVKK / GDPR uyumluluÄŸu) tam zamanlÄ± olarak denetleyebilmektedir.
