from fastapi import *
from fastapi.responses import FileResponse
from routers import attractions ,	Login ,booking ,pay
from fastapi.staticfiles import StaticFiles


app=FastAPI()
app.include_router(attractions.router)
app.include_router(Login.router)
app.include_router(booking.router)
app.include_router(pay.router)

app.mount("/static", StaticFiles(directory="static"), name="static")

# Static Pages (Never Modify Code in this Block)
@app.get("/", include_in_schema=False)
async def index(request: Request):
	return FileResponse("./static/html/index.html", media_type="text/html")
@app.get("/attraction/{id}", include_in_schema=False)
async def attraction(request: Request, id: int):
	return FileResponse("./static/html/attraction.html", media_type="text/html")
@app.get("/booking", include_in_schema=False)
async def booking(request: Request):
	return FileResponse("./static/html/booking.html", media_type="text/html")
@app.get("/thankyou", include_in_schema=False)
async def thankyou(request: Request):
	return FileResponse("./static/html/thankyou.html", media_type="text/html")