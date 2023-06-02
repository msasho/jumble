import os

from dotenv import load_dotenv
import pandas as pd
from pandas.core.frame import DataFrame
import pymysql

# load environment variables
load_dotenv()

# connection parameters
host = os.environ.get('host')
user = os.environ.get('user')
password = os.environ.get('password')
database = os.environ.get('database')
port = os.environ.get('port')

# connect to database
connection = pymysql.connect(
    host=host,
    user=user,
    password=password,
    db=database,
)

def executemany_sql(sql: str, records: list[list], commit: bool = True):
    with connection.cursor() as cursor:
        print(sql)
        cursor.executemany(sql, records)
        if commit:
            connection.commit()

def insert_multiple_rows(df: DataFrame, table: str) -> None:
        columns = ','.join(df.columns)
        values=','.join(['%s' for i in range(len(df.columns))])
        update_condition = ",".join([f"{column}=VALUES({column})" for column in df.columns])
        sql = f"INSERT INTO {table} ({columns:}) VALUES ({values:}) ON DUPLICATE KEY UPDATE {update_condition};"
        print(sql)
        try:
            executemany_sql(sql, df.values.tolist())
        except Exception as e:
            print(f"An Exception occured during batch insert: {e}")
            for _, row in df.iterrows():
                try:
                    executemany_sql(sql, [row.tolist()], False)
                except Exception as e:
                    print(f"An Exception occured during sigle insert: {e}")
                    print(f"record info: {row}")
                    raise
            connection.commit()