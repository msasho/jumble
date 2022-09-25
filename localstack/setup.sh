#!/bin/sh

BUCKET_NAME=s3-local

# LocalStack
docker compose down
docker compose up -d
echo "waiting for the start of LocalStack"
sleep 3

# バケットの作成
python3 create_bucket.py $BUCKET_NAME

# ファイルの配置
python3 deploy_file.py $BUCKET_NAME