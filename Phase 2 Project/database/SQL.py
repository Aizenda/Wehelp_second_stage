import os, json, re
from  DB import mysql_pool  

# 創建資料表
def create_attractions_table(cursor):
    create_table_query = """
    CREATE TABLE IF NOT EXISTS attractions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        address VARCHAR(255) NOT NULL,
        transport TEXT NOT NULL,
        lat FLOAT NOT NULL,
        lng FLOAT NOT NULL,
        images TEXT NOT NULL
    );
    """
    cursor.execute(create_table_query)

def create_mtr_table(cursor):
    create_table_query = """
    CREATE TABLE IF NOT EXISTS mrt (
        id INT PRIMARY KEY AUTO_INCREMENT,
        mrt VARCHAR(50),
        attraction_id INT NOT NULL,
        FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE
    );
    """
    cursor.execute(create_table_query)

def create_user_table(cursor):
    create_table_query = """
    CREATE TABLE IF NOT EXISTS user (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
    );
    """
    cursor.execute(create_table_query)

def create_cart_table(cursor):
    create_table_query = """
    CREATE TABLE IF NOT EXISTS shopping_cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    time VARCHAR(25) NOT NULL,
    price INT NOT NULL,
    attractionId INT NOT NULL,
    userId INT NOT NULL,
    FOREIGN KEY (attractionId) REFERENCES attractions(id),
    FOREIGN KEY (userId) REFERENCES user(id),
    UNIQUE (userId)
    );
    """
    cursor.execute(create_table_query)

def create_pay(cursor):
    create_table_query = """
    CREATE TABLE IF NOT EXISTS payment_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pay_time DATETIME,
    status INT NOT NULL
    );
    """
    cursor.execute(create_table_query)

def create_orders(cursor):
    create_table_query = """
    CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    date DATE NOT NULL,
    time VARCHAR(25) NOT NULL,
    price INT NOT NULL,
    attractionId INT NOT NULL,
    userId INT NOT NULL,
    paymentId INT NOT NULL,
    FOREIGN KEY (attractionId) REFERENCES attractions(id),
    FOREIGN KEY (userId) REFERENCES user(id),
    FOREIGN KEY (paymentId) REFERENCES payment_status(id)
    );
    """
    cursor.execute(create_table_query)

def alter_user_table_add_phone(cursor):
    alter_query = """
    ALTER TABLE user
    ADD COLUMN phone VARCHAR(20);
    """
    cursor.execute(alter_query)
    
# 讀取 JSON 資料
def load_attractions_data(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)["result"]["results"]
    return data

# 處理圖片鏈接
def extract_images(file_data):
    pattern = r"https://.*?\.(?:[Jj][Pp][Gg]|[Pp][Nn][Gg])"
    return json.dumps(re.findall(pattern, file_data), ensure_ascii=False)

# 插入景點資料
def insert_attractions_data(cursor, data):
    insert_query = """
    INSERT INTO attractions (id, name, category, description, address, transport, lat, lng, images)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    ON DUPLICATE KEY UPDATE 
        name=VALUES(name), category=VALUES(category), description=VALUES(description),
        address=VALUES(address), transport=VALUES(transport),
        lat=VALUES(lat), lng=VALUES(lng), images=VALUES(images);
    """
    
    values = []
    for attraction in data:
        attraction_id = int(attraction["_id"])
        name = attraction["name"]
        category = "其他" if attraction["CAT"] == "其　　他" else attraction["CAT"]
        description = attraction["description"]
        address = attraction["address"]
        transport = attraction["direction"]
        lat = float(attraction["latitude"])
        lng = float(attraction["longitude"])
        images = extract_images(attraction["file"])  # 提取圖片鏈接並轉換為 JSON 格式

        values.append((attraction_id, name, category, description, address, transport, lat, lng, images))

    # 批量插入資料
    cursor.executemany(insert_query, values)

def insert_mrt_table(cursor, data):
    mrt_data = []
    for attraction in data:
        mrt = attraction["MRT"]
        attraction_id = int(attraction["_id"])
        
        mrt_data.append((mrt, attraction_id))

    insert_query = """
    INSERT INTO mrt (mrt, attraction_id)
    VALUES (%s, %s)
    ON DUPLICATE KEY UPDATE 
        mrt = VALUES(mrt);
    """
    cursor.executemany(insert_query, mrt_data)



## 主要執行區域
if __name__ == "__main__":
    # 使用 MySQL 連線池來獲取資料庫連線
    conn = mysql_pool.get_connection()
    cursor = conn.cursor()

    # 創建表格（如果不存在）
    create_attractions_table(cursor)
    create_mtr_table(cursor)
    create_user_table(cursor)
    create_cart_table(cursor)
    create_pay(cursor)
    create_orders(cursor)
    alter_user_table_add_phone(cursor)

    # 讀取資料
    current_folder = os.path.dirname(os.path.abspath(__file__))
    parent_folder = os.path.dirname(current_folder)
    target_folder = os.path.join(parent_folder, "data", "taipei-attractions.json")
    data = load_attractions_data(target_folder)

    # 插入資料
    # insert_attractions_data(cursor, data)
    # insert_mrt_table(cursor, data)
    
    # 提交變更並關閉連接
    conn.commit()
    cursor.close()
    conn.close() 