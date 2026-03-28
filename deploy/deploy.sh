#!/bin/bash
# =============================================================
# UU AI Satış Sözlüğü — Güncelleme/Deploy Scripti
# Her yeni versiyon için çalıştırın.
# Kullanım: sudo bash deploy.sh
# =============================================================
set -e

DEPLOY_DIR="/var/www/umitunker"
BRANCH="master"

echo "=== Deploy Başlıyor ==="

# 1. Kodu güncelle
echo "[1/4] Kod güncelleniyor..."
cd $DEPLOY_DIR
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# 2. Python bağımlılıklarını güncelle (yeni paket varsa)
echo "[2/4] Python bağımlılıkları güncelleniyor..."
source venv/bin/activate
pip install -r backend/requirements.txt -q

# 3. Frontend build
echo "[3/4] Frontend build alınıyor..."
cd $DEPLOY_DIR/frontend
yarn install --silent
yarn build
rm -rf $DEPLOY_DIR/uuai/*
cp -r build/* $DEPLOY_DIR/uuai/

# 4. Backend servisi yeniden başlat
echo "[4/4] Backend yeniden başlatılıyor..."
systemctl restart uuai-backend

echo ""
echo "=== Deploy tamamlandı! ==="
echo "Uygulama: http://umitunker.com/uuai"
systemctl status uuai-backend --no-pager
