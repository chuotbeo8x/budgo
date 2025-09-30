# 🐳 Budgo + Ghost Docker Deployment

Deploy Budgo app cùng với Ghost CMS trên VPS sử dụng Docker.

## 📋 Yêu cầu

- VPS với Docker và Docker Compose
- Domain name (ví dụ: `your-domain.com`)
- SSL certificate (Let's Encrypt)
- Firebase project đã setup

## 🚀 Hướng dẫn Deploy

### 1. Clone Repository
```bash
git clone https://github.com/chuotbeo8x/budgo.git
cd budgo
```

### 2. Cấu hình Environment
```bash
# Copy template
cp env.docker .env

# Chỉnh sửa với thông tin của bạn
nano .env
```

### 3. Cấu hình SSL
```bash
# Tạo thư mục SSL
mkdir ssl

# Copy SSL certificates vào thư mục ssl/
# cert.pem và key.pem
```

### 4. Deploy
```bash
# Chạy script deploy
./deploy.sh

# Hoặc manual
docker-compose up -d
```

## 🌐 Cấu trúc Services

| Service | Port | URL | Mô tả |
|---------|------|-----|-------|
| **Budgo** | 3000 | `https://your-domain.com` | Main app (Firestore) |
| **Ghost** | 2368 | `https://blog.your-domain.com` | Blog CMS (SQLite) |
| **Nginx** | 80/443 | - | Reverse proxy |

## 🔧 Quản lý Services

### Xem logs
```bash
# Tất cả services
docker-compose logs -f

# Chỉ Budgo
docker-compose logs -f budgo

# Chỉ Ghost
docker-compose logs -f ghost
```

### Restart services
```bash
# Restart tất cả
docker-compose restart

# Restart chỉ Budgo
docker-compose restart budgo
```

### Update app
```bash
# Pull latest code
git pull

# Rebuild và restart
docker-compose up -d --build
```

## 📊 Monitoring

### Kiểm tra status
```bash
docker-compose ps
```

### Resource usage
```bash
docker stats
```

### Backup data
```bash
# Backup Ghost content (SQLite)
docker-compose exec ghost tar -czf /tmp/ghost-backup.tar.gz /var/lib/ghost/content
docker cp ghost:/tmp/ghost-backup.tar.gz ./ghost-backup.tar.gz

# Firestore backup (via Firebase Console hoặc CLI)
# Không cần backup database cho Budgo vì dùng Firestore
```

## 🔒 Security

### Firewall
```bash
# Mở ports cần thiết
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

### SSL với Let's Encrypt
```bash
# Cài Certbot
sudo apt install certbot

# Tạo certificate
sudo certbot certonly --standalone -d your-domain.com -d blog.your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
```

## 🚨 Troubleshooting

### Port conflicts
```bash
# Kiểm tra ports đang sử dụng
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### Container không start
```bash
# Xem logs chi tiết
docker-compose logs budgo
docker-compose logs ghost
```

### Firestore connection issues
```bash
# Kiểm tra Firebase connection
docker-compose exec budgo node -e "
const admin = require('firebase-admin');
console.log('Firebase Admin initialized:', !!admin.apps.length);
"

# Kiểm tra Ghost SQLite
docker-compose exec ghost ls -la /var/lib/ghost/content/data/
```

## 📈 Performance

### Nginx caching
- Static files: 1 year cache
- API routes: Rate limiting
- Gzip compression enabled

### Resource limits
```yaml
# Thêm vào docker-compose.yml
deploy:
  resources:
    limits:
      memory: 512M
    reservations:
      memory: 256M
```

## 🔄 Auto Update

### Cron job cho auto update
```bash
# Tạo script update
cat > update.sh << 'EOF'
#!/bin/bash
cd /path/to/budgo
git pull
docker-compose up -d --build
EOF

chmod +x update.sh

# Thêm vào crontab (chạy mỗi ngày lúc 2AM)
echo "0 2 * * * /path/to/budgo/update.sh" | crontab -
```

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs: `docker-compose logs -f`
2. Kiểm tra status: `docker-compose ps`
3. Restart services: `docker-compose restart`
4. Check firewall và ports
