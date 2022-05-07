import os

from dotenv import load_dotenv
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

sql = """
    CREATE TABLE dogs
    (
      id              INT unsigned NOT NULL AUTO_INCREMENT,
      name            VARCHAR(150) NOT NULL,
      owner           VARCHAR(150) NOT NULL,
      birth           DATE NOT NULL,
      PRIMARY KEY     (id)
    );
    """

engine.execute(sql)
