from fastapi import *
from fastapi.responses import JSONResponse
from database.DB import mysql_pool
from mysql.connector.errors import Error
import jwt,os,random,string,httpx
from datetime import datetime

router = APIRouter()
conn = None
cursor = None
key = os.getenv("JWT_key")

def generate_bank_transaction_id(max_length):
	now = datetime.now().strftime("%Y%m%d%H%M%S")
	rand_length = max_length - len("TXN") - len(now) 
	rand_digits = ''.join(random.choices(string.digits, k=rand_length))
	return f"TXN{now}{rand_digits}"


@router.post("/api/orders")
async def pay(request:Request):
	body = await request.json()
	token = body.get("order").get("token")
	conn = mysql_pool.get_connection()
	cursor = conn.cursor()

	if not token :
		return JSONResponse({"error":True}, status_code=403)
	
	try:
		decode_token = jwt.decode(token, key, algorithms="HS256")
		userId = decode_token.get("data").get("id")
		prime = body.get("prime")
		price = body.get("order").get("price")
		contact = body.get("order").get("contact")
		phone = contact.get("phone")
		name = contact.get("name")
		email = contact.get("email")
		partner_key = os.getenv("Partner_Key")
		details = "taipeidaytrip_tour"
		order_number = generate_bank_transaction_id(25)
		attraction_id = int(body.get("order").get("trip").get("attraction").get("id"))
		date = body.get("order").get("trip").get("date")
		time = body.get("order").get("trip").get("time")


		url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
		headers = {
			"Content-Type":"application/json",
			"x-api-key":partner_key
		}
		tappay_request={
			"prime":prime,
			"partner_key":partner_key,
			"merchant_id":"jash0818_CTBC",
			"amount":price,
			"currency":"TWD",
			"order_number":order_number,
			"bank_transaction_id":generate_bank_transaction_id(19),
			"details":details,
			"cardholder":{
				"phone_number":phone,
				"name":name,
				"email":email
			} 
		}

		async with httpx.AsyncClient() as client:
			res = await client.post(url,json=tappay_request,headers=headers)
			res = res.json()
			status = res.get("status")
		if status != 0 :
			pay_query = """
			INSERT INTO payment_status (status)
			VALUES (%s)
			;
			"""
			cursor.execute(pay_query, (status,))
			payment_id = cursor.lastrowid
			conn.commit()
			return JSONResponse({'error':True, "message": "付款失敗：" + res.get("msg", "")} , status_code= 400)
		
		pay_time = int(res.get("transaction_time_millis"))
		pay_time = datetime.fromtimestamp(pay_time / 1000)
		pay_time = pay_time.strftime("%Y-%m-%d %H:%M:%S")

		pay_query = """
		INSERT INTO payment_status (pay_time,status)
		VALUES (%s,%s)
		;
		"""
		cursor.execute(pay_query, (pay_time, status))
		payment_id = cursor.lastrowid
		conn.commit()

		update_phone_query = """
		UPDATE user
		SET phone = %s
		WHERE id = %s
		;
		"""
		cursor.execute(update_phone_query, (phone, userId))
		conn.commit()

		orders_query = """
		INSERT INTO orders (order_number, date, time, price, attractionId, userId, paymentId)
		VALUES (%s, %s, %s, %s, %s, %s, %s);
		"""
		cursor.execute(orders_query, (order_number, date, time, price, attraction_id, userId, payment_id))
		conn.commit()

		delete_shopping_cart  = """
		DELETE FROM shopping_cart
		WHERE userId = %s;
		"""	
		cursor.execute(delete_shopping_cart, (userId,))
		conn.commit()

		return JSONResponse({"data":{
				"number":order_number,
				"payment":{
					"status":status,
					"message":"付款成功"
				}
			}
		})

	except  jwt.ExpiredSignatureError as e:
		return JSONResponse({"error": True}, status_code=401)
	
	except jwt.InvalidTokenError as e:
		return JSONResponse({"error": True}, status_code=401)
	
	except Error as e:
		print(e)
		return JSONResponse({"error": True, "message": f"資料庫錯誤: {str(e)}"} ,status_code=500)
	
	except Exception as e:
		print(e)
		return JSONResponse({"error":True, "message":"伺服器內部錯誤"} ,status_code=500)
	
	finally:
		cursor.close()
		conn.close()

@router.get("/api/order/{orderNumber}")
async def get_order_number(orderNumber):
    conn = mysql_pool.get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
        SELECT 
        o.order_number,
        o.date,
        o.time,
        o.price,
        u.name AS user_name,
        u.email AS user_email,
        u.phone AS user_phone,
        a.id AS attraction_id,
        a.name AS attraction_name,
        a.address AS attraction_address,
        a.images AS attraction_images,
        p.status AS payment_status,
        p.pay_time
        FROM orders o
        JOIN user u ON o.userId = u.id
        JOIN attractions a ON o.attractionId = a.id
        JOIN payment_status p ON o.paymentId = p.id
        WHERE o.order_number = %s
        AND p.status = %s;
        """
        cursor.execute(query, (orderNumber, 0))

        result = cursor.fetchone()
        data = {
			"data": {
				"number": result['order_number'],
				"price": result['price'],
				"trip": {
					"attraction": {
						"id": result['attraction_id'],
						"name": result['attraction_name'],
						"address": result['attraction_address'],
						"image": result['attraction_images'].split(',')[0]
					},
					"date": str(result['date']),
					"time": 'afternoon' if result['time'] == '下半天' else 'morning'  # 假設 '下半天' 對應 'afternoon'
				},
				"contact": {
					"name": result['user_name'].strip(),
					"email": result['user_email'],
					"phone": result['user_phone']
				},
				"status": result['payment_status']
				}
			}
        return JSONResponse({
                "data": data
            })
    except Error as e:
        return JSONResponse({"error": True, "message": f"資料庫錯誤: {str(e)}"}, status_code=500)

    except Exception as e:
        return JSONResponse({"error": True, "message": "伺服器內部錯誤"}, status_code=500)

    finally:
        conn.close()
        cursor.close()
