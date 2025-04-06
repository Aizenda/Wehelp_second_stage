from fastapi import *
from fastapi.responses import JSONResponse
from database.DB import mysql_pool
from mysql.connector.errors import IntegrityError, Error
import jwt ,bcrypt ,os
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

def hash_password(password: str) -> str:
	salt = bcrypt.gensalt(rounds=5)
	hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
	return hashed.decode('utf-8')

def check_password(stored_hash: str, password: str) -> bool:
	if isinstance(stored_hash, str):
		stored_hash = stored_hash.encode('utf-8')
	return bcrypt.checkpw(password.encode('utf-8'), stored_hash)

@router.post("/api/user")
async def register(request: RegisterRequest):
	print(request)
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
	
		hashed_password = hash_password(password)

		register_query = """
		INSERT INTO user (name, email, password)
		VALUES (%s, %s, %s)
		"""    
		cursor.execute(register_query, (name, email, hashed_password))
		conn.commit()

		return JSONResponse({"ok":True} ,status_code=200)
	
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

		key = os.getenv("JWT_key")

		signin_query = """
		SELECT id, name, email, password FROM user
		WHERE email = %s
		"""
		cursor.execute(signin_query, (email,))
		user_req = cursor.fetchone()
	
		if not user_req:
			return  JSONResponse({"error":True, "message":"帳號不存在，請註冊!"} ,status_code=400)
	
		
		if not check_password(user_req[3], password):
			
			return JSONResponse({"error":True, "message":"帳號或密碼錯誤"} ,status_code=400)

		payload = {
				"data": {
						"id": user_req[0],
						"name": user_req[1],
						"email": user_req[2]
				},
				"exp": datetime.now() + timedelta(days=7)
		}
		encode = jwt.encode(payload, key, algorithm="HS256")
		return JSONResponse({"token": encode})
        
	except Error as e:
		return JSONResponse({"error": True, "message": f"資料庫錯誤: {str(e)}"} ,status_code=500)
	
	except Exception as e:
		return JSONResponse({"error":True, "message":"伺服器內部錯誤"} ,status_code=500)
	
	finally:
		cursor.close()
		conn.close()

