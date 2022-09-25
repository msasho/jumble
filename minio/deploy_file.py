import os
import sys

import boto3

BUCKET_NAME = sys.argv[1]

SOURCE_PATH = './test_data/'
TARGET_PATH = 'test'

s3 = boto3.resource(
    service_name='s3',
    endpoint_url='http://localhost:9000',
    aws_access_key_id='localid',
    aws_secret_access_key='localpassword',
    region_name='')
bucket = s3.Bucket(BUCKET_NAME)

def main():
    list_file_name =  os.listdir(SOURCE_PATH)
    for file in list_file_name:
        bucket.upload_file(f'{SOURCE_PATH}/{file}', f'{TARGET_PATH}/{file}')

if __name__ == '__main__':
   main()
   