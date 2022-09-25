BUCKET_NAME=$1
REGION=${2:ap-northeast-1}

# バケットを作成する
aws s3api create-bucket --bucket ${BUCKET_NAME} --region ap-northeast-1 --create-bucket-configuration LocationConstraint=ap-northeast-1

# バージョニングを有効化する
aws s3api put-bucket-versioning --bucket ${BUCKET_NAME} --versioning-configuration Status=Enabled
# バージョニングが有効になっていることを確認する
aws s3api get-bucket-versioning --bucket ${BUCKET_NAME}

# パブリックアクセスブロックを有効化する
aws s3api put-public-access-block --bucket ${BUCKET_NAME} --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
# パブリックアクセスブロックが有効化になっていることを確認する
aws s3api get-public-access-block --bucket ${BUCKET_NAME}

# デフォルトの暗号化を有効化する(SSE-S3)
aws s3api put-bucket-encryption --bucket ${BUCKET_NAME} --server-side-encryption-configuration '{"Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]}'
# 暗号化設定を確認する
aws s3api get-bucket-encryption --bucket ${BUCKET_NAME}