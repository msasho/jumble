import os
import sys

import boto3

BUCKET_NAME = sys.argv[1]


source_path = './test_data/'
target_path = 'test'


s3 = boto3.resource(
    service_name='s3', 
    endpoint_url='http://localhost:9000',
    aws_access_key_id='localid',
    aws_secret_access_key='localpassword',
    region_name='')
bucket = s3.Bucket(BUCKET_NAME)

def main():
    path_dir = './test_data/'
    list_file_name =  os.listdir(path_dir)
    for file in list_file_name:
        bucket.upload_file(f'{path_dir}/{file}', f'{target_path}/{file}')

if __name__ == '__main__':
   main()
        