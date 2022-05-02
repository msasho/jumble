import os

from dotenv import load_dotenv
import pandas as pd
import sqlalchemy

# load environment variables
load_dotenv()

# connection parameters
user = os.environ.get('user')
password = os.environ.get('password')
host = os.environ.get('host')
port = os.environ.get('port')
database = os.environ.get('database')
url = f'mysql+pymysql://{user}:{password}@{host}:{port}/{database}'

engine = sqlalchemy.create_engine(url)


df = pd.read_csv('./dogs.csv')
df.to_sql(
    name = 'dogs',
    con = engine,
    schema = 'pets', # 無指定の場合、DBエンジン作成時に指定したDB(スキーマ)が設定される
    if_exists='replace', # 
    index = False,
    chunksize = 10000,
    method = "multi",
    )
    
sql = 'select * from dogs where id = 1'
df = pd.read_sql(
    sql = sql,
    con = engine,
    )
