from mysql.connector import pooling, Error

class MySQLPool:
    """封裝 MySQL 連線池，統一錯誤處理"""
    
    def __init__(self):
        try:
            self.pool = pooling.MySQLConnectionPool(
                pool_name="mypool",
                pool_size=5,  # 連線池大小
                user='root',
                password='root',
                host='127.0.0.1',
                database='website'
            )
        except Error as err:
            print(f"資料庫連線池初始化失敗: {err}")
            self.pool = None  # 避免連線池初始化失敗時出錯

    def get_connection(self):
        """從連線池獲取連線，並處理錯誤"""
        if self.pool is None:
            raise Exception("資料庫連線池未初始化")
        try:
            return self.pool.get_connection()
        except Error as err:
            raise Exception(f"資料庫連線錯誤: {err}")

# 創建一個全域的連線池實例
mysql_pool = MySQLPool()