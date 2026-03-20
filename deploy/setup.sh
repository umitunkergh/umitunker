#!/bin/bash
# =============================================================
# UU AI Satış Sözlüğü — İlk Kurulum Scripti
# Sadece bir kez çalıştırın!
# Kullanım: sudo bash setup.sh
# =============================================================
set -e

REPO_URL="https://github.com/umitunkergh/umitunker.git"
DEPLOY_DIR="/var/www/umitunker"
BRANCH="master"

echo "=== UU AI Satış Sözlüğü Kurulum Başlıyor ==="

# 1. Sistem paketleri
echo "[1/8] Sistem paketleri güncelleniyor..."
apt-get update -qq
apt-get install -y -qq nginx python3 python3-pip python3-venv nodejs npm git curl

# Node.js 20 ve Yarn kurulumu
if ! command -v yarn &> /dev/null; then
    echo "Yarn kuruluyor..."
    npm install -g yarn
fi

# 2. Dizinleri oluştur
echo "[2/8] Dizinler oluşturuluyor..."
mkdir -p $DEPLOY_DIR
mkdir -p $DEPLOY_DIR/uuai

# 3. Repo'yu klonla
echo "[3/8] Kod repository klonlanıyor..."
if [ -d "$DEPLOY_DIR/.git" ]; then
    echo "Repo zaten mevcut, güncelleniyor..."
    cd $DEPLOY_DIR
    git fetch origin
    git checkout $BRANCH
    git pull origin $BRANCH
else
    git clone -b $BRANCH $REPO_URL $DEPLOY_DIR
    cd $DEPLOY_DIR
fi

# 4. Python sanal ortam ve bağımlılıklar
echo "[4/8] Python bağımlılıkları kuruluyor..."
cd $DEPLOY_DIR
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip -q
pip install -r backend/requirements.txt -q

# 5. Backend .env dosyası
echo "[5/8] Backend .env dosyası kontrol ediliyor..."
if [ ! -f "$DEPLOY_DIR/backend/.env" ]; then
    echo "UYARI: $DEPLOY_DIR/backend/.env dosyası bulunamadı!"
    echo "Lütfen aşağıdaki içerikle bu dosyayı oluşturun:"
    echo "---"
    cat $DEPLOY_DIR/backend/.env.example
    echo "---"
    echo "Dosyayı oluşturduktan sonra bu scripti tekrar çalıştırın."
    exit 1
fi

# 6. Frontend build
echo "[6/8] Frontend build alınıyor..."
cd $DEPLOY_DIR/frontend
yarn install --silent
yarn build
cp -r build/* $DEPLOY_DIR/uuai/

# 7. Nginx yapılandırması
echo "[7/8] Nginx yapılandırılıyor..."
cp $DEPLOY_DIR/deploy/nginx.conf /etc/nginx/sites-available/umitunker
ln -sf /etc/nginx/sites-available/umitunker /etc/nginx/sites-enabled/umitunker
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# 8. Systemd servis
echo "[8/8] Systemd servisi kuruluyor..."
cp $DEPLOY_DIR/deploy/uuai-backend.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable uuai-backend
systemctl restart uuai-backend

echo ""
echo "=== Kurulum tamamlandı! ==="
echo "Uygulama: http://umitunker.com/uuai"
echo "Backend durum: systemctl status uuai-backend"
echo "Nginx durum: systemctl status nginx"
echo ""
echo "SSL için (önerilen):"
echo "  apt-get install certbot python3-certbot-nginx"
echo "  certbot --nginx -d umitunker.com -d www.umitunker.com"
