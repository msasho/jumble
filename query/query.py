import glob
import os

from dotenv import load_dotenv
import pymysql

load_dotenv()

def get_connection():
    connection = pymysql.connect(
        user = os.environ.get('user'),
        password = os.environ.get('password'),
        host = os.environ.get('host'),
        port = int(os.environ.get('port')),
        database = os.environ.get('database'),
        charset = 'utf8mb4',
        cursorclass = pymysql.cursors.DictCursor,
        )
    return connection

def get_query(query_file_path):
    with open(query_file_path, 'r', encoding='utf-8') as f:
        query = f.read()
    return query


with get_connection() as connection:
    with connection.cursor() as cursor:
        query_file_paths = glob.glob('sql/*.sql')
        for query_file_path in query_file_paths:
            query = get_query(query_file_path)
            cursor.execute(query)
            rows = cursor.fetchall()
            
            with open(f'./results/{os.path.splitext(os.path.basename(query_file_path))[0]}.csv', 'w') as f:
                for row in rows:
                    csv = ''
                    for value in row.values():
                        csv = csv + str(value) + ','
                    f.write(csv[:-1] + '\n')