# 1. Force the architecture required by Zoho Catalyst
FROM --platform=linux/amd64 python:3.11-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy dependencies and install them safely
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copy the rest of your backend code
COPY . .

# 5. Start the server using our safe Python script
CMD ["python", "run.py"]