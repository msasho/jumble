import os
import sys

import boto3

BUCKET_NAME = sys.argv[1]
REGION_NAME = 'ap-northeast-1'

SOURCE_PATH = './test_data/'
TARGET_PATH = 'test'


s3 = boto3.resource(
        service_name = 's3',
        endpoint_url='http://localhost:4566',
        region_name=REGION_NAME,
        )
bucket = s3.Bucket(BUCKET_NAME)

def main():
    list_file_name =  os.listdir(SOURCE_PATH)
    for file in list_file_name:
        bucket.upload_file(f'{SOURCE_PATH}/{file}', f'{TARGET_PATH}/{file}')

if __name__ == '__main__':
   main()
