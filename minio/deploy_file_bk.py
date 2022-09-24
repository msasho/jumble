import os
import sys
import shutil

BUCKET_NAME = sys.argv[1]

def main():
    path_dir = "./test_data"
    shutil.copytree(f'{path_dir}', f'./minio_data/{BUCKET_NAME}')

if __name__ == '__main__':
   main()
        