from fastapi import *
from fastapi.responses import JSONResponse
from database.DB import mysql_pool
from mysql.connector import Error 
import json

router = APIRouter()

@router.get("/api/attractions")
async def get_attractions(page: int = Query(0, ge=0), keyword: str = Query(None)):
	conn = None
	cursor = None
	try:
		conn = mysql_pool.get_connection()
		cursor = conn.cursor(dictionary=True)
		
		page_size = 12
		cursor.execute("SELECT COUNT(*) AS total_rows FROM attractions")
		total_rows = cursor.fetchone()
		max_page = total_rows["total_rows"] // page_size
	
		if page > max_page:
			return JSONResponse({"error": True, "message": "超過最大頁數"}, status_code=400)
		
		limit_data = page * 12

		if keyword:
			cursor.execute("""
			SELECT COUNT(*) AS total_rows 
			FROM attractions a
			LEFT JOIN mrt m ON a.id = m.attraction_id
			WHERE a.name LIKE %s OR m.mrt LIKE %s;
			""", ('%' + keyword + '%', '%' + keyword + '%'))
			total_rows = cursor.fetchone()

			max_page = total_rows["total_rows"] // page_size

			if page > max_page:
				return JSONResponse({"error": True, "message": "超過最大頁數"}, status_code=400)

			select_query = """
				SELECT a.id, a.name, a.category, a.description, a.address, a.transport, m.mrt, a.lat, a.lng, a.images
				FROM attractions a
				LEFT JOIN mrt m ON a.id = m.attraction_id
				WHERE a.name LIKE %s OR m.mrt LIKE %s
				LIMIT 12 OFFSET %s;
				"""
			cursor.execute(select_query, ('%' + keyword + '%', '%' + keyword + '%', limit_data))
		else:
			select_query = """
				SELECT a.id, a.name, a.category, a.description, a.address, a.transport, m.mrt, a.lat, a.lng, a.images
				FROM attractions a
				LEFT JOIN mrt m ON a.id = m.attraction_id
				LIMIT 12 OFFSET %s
			"""
			cursor.execute(select_query, (limit_data,))

		res = cursor.fetchall()
		
		for attraction in res:
				attraction["images"] = json.loads(attraction["images"])

		is_full_page = len(res) == 12
		nextpage = page + 1 if is_full_page else None

		return JSONResponse({"nextPage": nextpage, "data": res}, status_code=200)

	except Error as e: 
		return JSONResponse({"error": True, "message": f"資料庫錯誤: {str(e)}"}, status_code=500)

	except Exception as e: 
		return JSONResponse({"error": True, "message": "伺服器內部錯誤"}, status_code=500)

	finally:
		if cursor:
			cursor.close()
		if conn:
			conn.close()

@router.get("/api/attraction/{id}")
async def get_attraction_by_id(id: int = Path(..., ge=1)):  
	""" 根據 attractionId 查詢特定景點資訊 """
	conn = None
	cursor = None
	try:
		# 取得資料庫連線
		conn = mysql_pool.get_connection()
		cursor = conn.cursor(dictionary=True)

			# 執行 SQL 查詢
		query = """
				SELECT a.id, a.name, a.category, a.description, a.address, a.transport, m.mrt, a.lat, a.lng, a.images
				FROM attractions a
				LEFT JOIN mrt m ON a.id = m.attraction_id
				WHERE a.id = %s
		"""
		cursor.execute(query, (id,))
		result = cursor.fetchone()

		if not result:
			return JSONResponse({"error": True, "message": "景點不存在"}, status_code=400)
		
		#修正輸出為list
		result["images"] = json.loads(result["images"])
		
		return JSONResponse({"data": result}, status_code=200)

	except Error as e:  # 捕獲 MySQL 錯誤
		return JSONResponse({"error": True, "message": f"資料庫錯誤: {str(e)}"}, status_code=500)

	except Exception as e:  # 捕獲其他未知錯誤
		return JSONResponse({"error": True, "message": "伺服器內部錯誤"}, status_code=500)

	finally:
		if cursor:
			cursor.close()
		if conn:
			conn.close()

@router.get("/api/mrts")
async def get_mrt_attractions():
	try:
		conn = mysql_pool.get_connection()
		cursor = conn.cursor(dictionary=True)

		# 查詢每個捷運站的景點數量並按數量排序
		cursor.execute("""
				SELECT m.mrt, COUNT(a.id) AS attraction_count
				FROM mrt m
				JOIN attractions a ON m.attraction_id = a.id
				GROUP BY m.mrt
				ORDER BY attraction_count DESC;
		""")
		
		# 獲取結果
		mrt_attractions = cursor.fetchall()
		mrt_names = [attraction["mrt"] for attraction in mrt_attractions if attraction["mrt"] is not None]

		return JSONResponse({"data": mrt_names}, status_code=200)

	except Exception as e:
		return JSONResponse({"error": True, "message": str(e)}, status_code=500)

	finally:
		if cursor:
			cursor.close()
		if conn:
			conn.close()