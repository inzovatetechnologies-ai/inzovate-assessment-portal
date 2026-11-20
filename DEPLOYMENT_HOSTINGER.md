# INZOVATE TALENT ASSESSMENT PORTAL – HOSTINGER DEPLOYMENT GUIDE

Organization: **INZOVATE TECHNOLOGIES PRIVATE LIMITED**  
Target Domain: `assessment.inzovate-technologies.com`  
Architecture: Hostinger VPS / Node.js Application Hosting + Cloudflare CDN + MongoDB Atlas  

---

## 1. Hosting Tier Recommendation

For campus recruitment drives with hundreds of concurrent candidates streaming live webcam snapshots and submitting real-time test heartbeats:
- **Recommended Hostinger Plan**: **Hostinger KVM 2 or KVM 4 VPS (Ubuntu 22.04 / 24.04 LTS)**.
- **Why Hostinger VPS?**
  - Persistent Node.js v20+ runtime with PM2 process supervision.
  - Full WebSocket / Socket.IO support without connection cutoff limits.
  - Reverse Proxy via Nginx with TLS termination.
  - Dedicated CPU and RAM for concurrent proctoring analysis.
  - No execution time limits or background process throttling.

---

## 2. Server Provisioning Steps (Hostinger VPS)

### Step 2.1: Server Setup & Dependencies
```bash
# SSH into Hostinger VPS
ssh root@your-hostinger-vps-ip

# Update repositories & install essentials
apt update && apt upgrade -y
apt install -y curl git ufw nginx htop

# Install Node.js v20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify versions
node -v   # v20.x or v22.x
npm -v    # v10.x+

# Install PM2 Process Manager globally
npm install -g pm2
```

### Step 2.2: Deploy Application Source
```bash
# Create application root directory
mkdir -p /var/www/inzovate-assessment-portal
cd /var/www/inzovate-assessment-portal

# Clone repository or upload source
git clone https://github.com/inzovate/talent-assessment-portal.git .

# Install Backend Dependencies
cd backend
npm install --production

# Install Frontend Dependencies & Build Static Assets
cd ../frontend
npm install
npm run build
```

---

## 3. Production Environment Configuration

Create `/var/www/inzovate-assessment-portal/backend/.env`:
```ini
PORT=5000
NODE_ENV=production
JWT_SECRET=inzovate-prod-jwt-secure-256bit-entropy-key
JWT_EXPIRES_IN=24h
MONGODB_URI=mongodb+srv://inzovate_admin:<DB_PASSWORD>@inzovate-cluster.mongodb.net/talent_assessment?retryWrites=true&w=majority
FRONTEND_URL=https://assessment.inzovate-technologies.com
S3_STORAGE_BUCKET=inzovate-proctoring-vault
S3_ACCESS_KEY_ID=<YOUR_S3_KEY>
S3_SECRET_ACCESS_KEY=<YOUR_S3_SECRET>
S3_REGION=ap-south-1
```

---

## 4. PM2 Process Supervision

Create `/var/www/inzovate-assessment-portal/ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'inzovate-portal',
      script: './backend/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};
```

Launch with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 5. Nginx Reverse Proxy & WebSocket Configuration

Create `/etc/nginx/sites-available/inzovate-assessment`:
```nginx
server {
    listen 80;
    server_name assessment.inzovate-technologies.com;

    # Redirect HTTP to HTTPS (or let Cloudflare handle SSL)
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name assessment.inzovate-technologies.com;

    # SSL Certificates (Cloudflare Origin Certificate or Let's Encrypt)
    ssl_certificate /etc/ssl/certs/inzovate-cloudflare-origin.pem;
    ssl_certificate_key /etc/ssl/private/inzovate-cloudflare-origin.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Client body limit for photo and snapshot uploads
    client_max_body_size 50M;

    # Static Frontend Assets Caching
    location /assets/ {
        alias /var/www/inzovate-assessment-portal/frontend/dist/assets/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # API & Full-Stack Node Application Proxy
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;

        # WebSocket / Socket.IO Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeout settings for long-lived CBT exam connections
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
```

Enable site and restart Nginx:
```bash
ln -s /etc/nginx/sites-available/inzovate-assessment /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx
```
