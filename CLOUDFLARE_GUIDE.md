# INZOVATE TALENT ASSESSMENT PORTAL – CLOUDFLARE CONFIGURATION GUIDE

Organization: **INZOVATE TECHNOLOGIES PRIVATE LIMITED**  
Target Domain: `assessment.inzovate-technologies.com`  

---

## 1. DNS Records Setup

Log in to the Cloudflare Dashboard:
1. Navigate to your zone: `inzovate-technologies.com`.
2. Under **DNS > Records**, add an `A` record:
   - **Type**: `A`
   - **Name**: `assessment`
   - **IPv4 Address**: `<YOUR_HOSTINGER_VPS_IP>`
   - **Proxy Status**: `Proxied (Orange Cloud ON)`
   - **TTL**: `Auto`

---

## 2. SSL/TLS Encryption Mode

1. Navigate to **SSL/TLS > Overview**.
2. Select **Full (Strict)** encryption mode.
3. Under **SSL/TLS > Origin Server**:
   - Click **Create Certificate**.
   - Set Key Type: `RSA (2048)` or `ECDSA`.
   - Hostnames: `inzovate-technologies.com`, `*.inzovate-technologies.com`.
   - Validity: `15 years`.
   - Save the certificate `.pem` and private `.key` to `/etc/ssl/certs/` and `/etc/ssl/private/` on your Hostinger VPS.

---

## 3. WebSockets & Network Settings

Crucial for real-time Socket.IO exam proctoring and live monitoring:
1. Navigate to **Network**.
2. Ensure **WebSockets** is toggled **ON**.
3. Enable **gRPC** and **HTTP/3 (with QUIC)** for low-latency transmission.
4. Set **Maximum Upload Size** to `100 MB` (Enterprise plan) or standard `50 MB` on Pro plan.

---

## 4. Security Rules & Anti-DDoS

1. Navigate to **Security > WAF > Custom Rules**:
   - Create Rule: `Allow Exam API Traffic`.
   - Action: `Skip Security Checks` for endpoint `/api/exam/save-answer` and WebSocket paths to avoid false CAPTCHA challenges during active assessments.
2. Under **Security > Bots**:
   - Keep Bot Fight Mode configured to protect against automated scraping of candidate registration forms.
   - Whitelist the college campus static IP ranges if campus drives are conducted through dedicated institutional gateways.

---

## 5. Page Rules / Cache Rules

1. **Static Assets Caching**:
   - URL: `assessment.inzovate-technologies.com/assets/*`
   - Setting: **Cache Level: Cache Everything**, **Edge Cache TTL: 1 month**.
2. **Dynamic API Bypass**:
   - URL: `assessment.inzovate-technologies.com/api/*`
   - Setting: **Cache Level: Bypass**.
