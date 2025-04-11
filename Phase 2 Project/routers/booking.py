from fastapi import *
from fastapi.responses import JSONResponse
from database.DB import mysql_pool
import os, jwt, mysql.connector, json

router = APIRouter()
conn = None
cursor = None
key = os.getenv("JWT_key")


@router.get("/api/booking")
async def get_booking(request:Request):
	try:
		conn = mysql_pool.get_connection()
		cursor = conn.cursor(dictionary=True)

		token = request.headers.get("Authorization")
		token = token.split("Bearer ")[1]
		if not token:
			return JSONResponse ({"error":True},status_code=403)
		
		decode = jwt.decode(token, key, algorithms="HS256")
		decode_data = decode.get("data")
		user_id = decode_data.get("id")

		query ="""
		SELECT sc.id, sc.date, sc.time, sc.price, sc.attractionId,
					a.name AS attraction_name, a.address AS attraction_address, a.images AS attraction_image,
					u.name AS user_name, u.email AS user_email
		FROM shopping_cart sc
		JOIN attractions a ON sc.attractionId = a.id
		JOIN user u ON sc.userId = u.id
		WHERE sc.userId = %s;
		"""
		cursor.execute(query, (user_id,))
		data = cursor.fetchone()

		if not data :
			return JSONResponse({"data":None})
		
		attraction_id = data.get("attractionId") 
		attraction_name = data.get("attraction_name")
		attraction_address = data.get("attraction_address")
		attraction_image = json.loads(data.get("attraction_image"))[0]
		date = data.get("date").strftime("%Y-%m-%d") if data.get("date") else None
		time = data.get("time")
		price = data.get("price")

		return JSONResponse({
			"data":{
				"attraction":{
					"id":attraction_id,
					"name":attraction_name,
					"address":attraction_address,
					"image":attraction_image
				},
				"date":date,
				"time":time,
				"price":price
			}
		} ,status_code=200)

	except jwt.ExpiredSignatureError:
			return JSONResponse({"error": True, "message": "JWT token has expired."}, status_code=400)
	
	except jwt.InvalidTokenError:
			return JSONResponse({"error": True, "message": "Invalid token."}, status_code=400)
	
	except mysql.connector.Error as db_error:
			return JSONResponse({"error": True, "message": f"資料庫錯誤: {str(db_error)}"}, status_code=500)
	
	except Exception as e:
			return JSONResponse({"error": True, "message": "伺服器內部錯誤: " + str(e)}, status_code=500)
	
	finally:
		conn.close()
		cursor.close()

@router.post("/api/booking")
async def post_booking(request:Request):
	try:
		conn = mysql_pool.get_connection()
		cursor = conn.cursor(dictionary=True)

		req = await request.json()
		attractionId = req.get("attractionId")
		date = req.get("date")
		time = req.get("time")
		price = req.get("price")
		token = req.get("token")

		if time == "上半天":
			time = "早上 9 點到下午 4 點"
		else:
			time = "下午 2 點到晚上 9 點"
			
		if not token:
			return JSONResponse({"error":True} ,status_code=403)

		decode_token = jwt.decode(token, key, algorithms="HS256")

		decode_token_data = decode_token.get("data")
		userid = decode_token_data.get("id")

		insert_query = """
        INSERT INTO shopping_cart (date, time, price, attractionId, userId)
        VALUES (%s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            date = VALUES(date),
            time = VALUES(time),
            price = VALUES(price),
            attractionId = VALUES(attractionId);
    """
		cursor.execute(insert_query, (date, time, price, attractionId, userid))
		conn.commit()

		return JSONResponse({"ok":True})

	except jwt.ExpiredSignatureError:
			return JSONResponse({"error": True, "message": "JWT token has expired."}, status_code=400)
	
	except jwt.InvalidTokenError:
			return JSONResponse({"error": True, "message": "Invalid token."}, status_code=400)
	
	except mysql.connector.Error as db_error:
			return JSONResponse({"error": True, "message": f"資料庫錯誤: {str(db_error)}"}, status_code=500)
	
	except Exception as e:
			return JSONResponse({"error": True, "message": "伺服器內部錯誤: " + str(e)}, status_code=500)

	finally:
		conn.close()
		cursor.close()


@router.delete("/api/booking")
async def delete_booking(request:Request):
	try:
		conn = mysql_pool.get_connection()
		cursor = conn.cursor(dictionary=True)

		token = request.headers.get("Authorization")
		token = token.split("Bearer ")[1]

		if not token:
			return JSONResponse ({"error":True},status_code=403)
		
		decode = jwt.decode(token, key, algorithms="HS256")
		decode_data = decode.get("data")
		user_id = decode_data.get("id")

		delete_query = """
		DELETE FROM shopping_cart
		WHERE userId = %s;
		"""
		cursor.execute(delete_query ,(user_id,))
		conn.commit()

		return JSONResponse({"ok": True})
	
	except jwt.ExpiredSignatureError:
			return JSONResponse({"error": True, "message": "JWT token has expired."}, status_code=400)
	
	except jwt.InvalidTokenError:
			return JSONResponse({"error": True, "message": "Invalid token."}, status_code=400)
	
	except mysql.connector.Error as db_error:
			return JSONResponse({"error": True, "message": f"資料庫錯誤: {str(db_error)}"}, status_code=500)
	
	except Exception as e:
			return JSONResponse({"error": True, "message": "伺服器內部錯誤: " + str(e)}, status_code=500)

	finally:
		conn.close()
		cursor.close()