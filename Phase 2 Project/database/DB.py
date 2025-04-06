from mysql.connector import pooling, Error
import os
from dotenv import load_dotenv
load_dotenv()

class DatabaseConnectionError(Exception):
    pass

class MySQLPool:
    def __init__(self):
        try:
            self.pool = pooling.MySQLConnectionPool(
                pool_name="mypool",
                pool_size=5,
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD"),  
                host=os.getenv("DB_HOST"),
                database=os.getenv("DB_NAME")
            )
        except Error as err:
            print(f"資料庫連線池初始化失敗: {err}")
            self.pool = None  
            raise DatabaseConnectionError(f"資料庫初始化錯誤: {err}")

    def get_connection(self):
        if self.pool is None:
            raise DatabaseConnectionError("資料庫連線池未初始化")

        try:
            conn = self.pool.get_connection()  # 嘗試取得資料庫連線
            if conn.is_connected() == False:  # 如果連線不可用，拋出錯誤
                raise DatabaseConnectionError("資料庫連線失敗")
            return conn
        except Error as err:
            raise DatabaseConnectionError(f"資料庫連線錯誤: {err}")

mysql_pool = MySQLPool()