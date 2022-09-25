import sys

import boto3

BUCKET_NAME = sys.argv[1]
REGION_NAME = 'ap-northeast-1'

s3 = boto3.resource(
        service_name = 's3',
        endpoint_url='http://localhost:4566',
        region_name=REGION_NAME,
        )

def main():
    bucket = s3.create_bucket(
        Bucket=BUCKET_NAME, 
        CreateBucketConfiguration={'LocationConstraint': REGION_NAME}
        )

if __name__ == '__main__':
   main()
