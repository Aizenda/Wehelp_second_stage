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
        mrt VARCHAR(50),
        lat FLOAT NOT NULL,
        lng FLOAT NOT NULL,
        images TEXT NOT NULL
    );
    """
    cursor.execute(create_table_query)

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
    INSERT INTO attractions (id, name, category, description, address, transport, mrt, lat, lng, images)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    ON DUPLICATE KEY UPDATE 
        name=VALUES(name), category=VALUES(category), description=VALUES(description),
        address=VALUES(address), transport=VALUES(transport), mrt=VALUES(mrt),
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
        mrt = attraction["MRT"]
        lat = float(attraction["latitude"])
        lng = float(attraction["longitude"])
        images = extract_images(attraction["file"])  # 提取圖片鏈接並轉換為 JSON 格式

        values.append((attraction_id, name, category, description, address, transport, mrt, lat, lng, images))

    # 批量插入資料
    cursor.executemany(insert_query, values)

## 主要執行區域
if __name__ == "__main__":
    # 使用 MySQL 連線池來獲取資料庫連線
    conn = mysql_pool.get_connection()
    cursor = conn.cursor()

    # 創建表格（如果不存在）
    create_attractions_table(cursor)

    # 讀取資料
    current_folder = os.path.dirname(os.path.abspath(__file__))
    target_folder = os.path.join(current_folder, "data/taipei-attractions.json")
    data = load_attractions_data(target_folder)

    # 插入資料
    insert_attractions_data(cursor, data)

    # 提交變更並關閉連接
    conn.commit()
    cursor.close()
    conn.close() 