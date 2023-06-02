#!/bin/sh

BUCKET_NAME=s3-local
STATEMACHINE_NAME=statemachine-test

# LocalStack
docker compose down
docker compose up -d
echo "waiting for the start of LocalStack"
sleep 3

# バケットの作成
python3 ./s3/create_bucket.py $BUCKET_NAME

# ファイルの配置
python3 ./s3/deploy_file.py $BUCKET_NAME


# ステートマシンの作成
python3 ./step_functions/create_statemachine.py $STATEMACHINE_NAME
