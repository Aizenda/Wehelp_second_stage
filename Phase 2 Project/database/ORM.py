import DB
class Model:
	def __init__(self):
		self.tablename = self.__class__.__name__.lower()
		self.colums = []
	
	# select * from tables;
	@classmethod
	def select(cls, query, params=(), fetch_one = True):
		try:
			cnx = DB.mysql_pool.get_connection()
		except:
			pass

# if __name__ == "__main__":
# 	result = Model.find("SELECT 1")
