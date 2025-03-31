from fastapi import *
from fastapi.responses import JSONResponse
from database.DB import mysql_pool
from mysql.connector import Error 

router = APIRouter()
conn = None
cursor = None

@router.post("/api/user")
async def register():

	try:
		conn = mysql_pool.get_connection()
		cursor = conn.cursor()
		register_query = """
		SELECT name ,email ,password FROM 
		"""	

	except:
		pass
	finally:
		conn.close()
		cursor.close()