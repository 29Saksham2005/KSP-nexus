backend:
	cd backend && uvicorn app.main:app --reload

frontend:
	cd frontend && npm run dev

lint:
	echo "Lint commands will be added later"

format:
	echo "Format commands will be added later"