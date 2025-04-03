from fastapi import *
from fastapi.responses import JSONResponse
from database.DB import mysql_pool
from mysql.connector.errors import IntegrityError, Error
import jwt
import os
from datetime import datetime, timedelta
from pydantic import BaseModel

router = APIRouter()
conn = None
cursor = None

class SignInRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
		name:str
		email: str
		password:str

@router.post("/api/user")
async def register(request: RegisterRequest):
	name = request.name
	email = request.email
	password = request.password

	try:
		conn = mysql_pool.get_connection()
		cursor = conn.cursor()

		check_email_query = "SELECT email FROM user WHERE email = %s"
		cursor.execute(check_email_query, (email,))
		existing_email = cursor.fetchone()
		
		if existing_email:
				return JSONResponse({"error": True, "message": "信箱重複"}, status_code=400)

		register_query = """
		INSERT INTO user (name, email, password)
		VALUES (%s, %s, %s)
		"""	
		cursor.execute(register_query, (name, email, password))
		conn.commit()

		return JSONResponse({"ok":True})
	
	except IntegrityError:
		return JSONResponse({"error": True, "message": "信箱重複"}, status_code=400)

	except Error as e:
		return JSONResponse({"error": True, "message": f"資料庫錯誤: {str(e)}"} ,status_code=500)
	
	except Exception as e:
		return JSONResponse({"error":True, "message":"伺服器內部錯誤"} ,status_code=500)
	
	finally:
		cursor.close()
		conn.close()

@router.get("/api/user/auth")
async def get_member_data(request: Request):

	try:	
		conn = mysql_pool.get_connection()
		cursor = conn.cursor()
		key = os.getenv("JWT_key")
		
		token_headers = request.headers.get("Authorization")
		if not token_headers or not token_headers.startswith("Bearer"):
				return JSONResponse({"data": None}, status_code=401)
	
		token = token_headers.split("Bearer")[1] 
		decode_token = jwt.decode(token, key, algorithms="HS256")
		decode_token_data = decode_token.get("data")

		id = decode_token_data.get("id")
		name = decode_token_data.get("name")
		email = decode_token_data.get("email")
		
		return JSONResponse({"data":{
			"id":id,
			"name":name,
			"email":email}
			},
			status_code=200)
	
	except  jwt.ExpiredSignatureError:
		return JSONResponse({"data": None}, status_code=401)
	
	except jwt.InvalidTokenError:
		return JSONResponse({"data": None}, status_code=401)
	
	except Error as e:
		return JSONResponse({"error": True, "message": f"資料庫錯誤: {str(e)}"} ,status_code=500)
	
	except Exception as e:
		return JSONResponse({"error":True, "message":"伺服器內部錯誤"} ,status_code=500)
	
	finally:
		cursor.close()
		conn.close()

@router.put("/api/user/auth")
async def signin(request: SignInRequest):
	
	try:
		conn = mysql_pool.get_connection()
		cursor = conn.cursor()
		email = request.email
		password = request.password

		key = os.getenv("JWT_KEY")
		signin_query = """
		SELECT * FROM user
		WHERE email = %s AND password = %s
		"""
		cursor.execute(signin_query, (email, password ))
		user_req= cursor.fetchone()
	
		if not user_req:
			return JSONResponse({"error":True, "message":"帳號或密碼錯誤"} ,status_code=400)
		
	
		
		payload = {
			"data":{
			"id":user_req[0],
			"name":user_req[1],
			"email":user_req[2]},
			"exp":datetime.now() + timedelta(days=7)
			}
		encode = jwt.encode(payload, key, algorithm="HS256")
		print(encode)
		return JSONResponse({"token":encode})
		
	except Error as e:
		return JSONResponse({"error": True, "message": f"資料庫錯誤: {str(e)}"} ,status_code=500)
	
	except Exception as e:
		return JSONResponse({"error":True, "message":"伺服器內部錯誤"} ,status_code=500)
	
	finally:
		cursor.close()
		conn.close()

