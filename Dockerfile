FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# gunicorn listens on PORT (default 8080); Caddy proxies to it (see deploy/).
EXPOSE 8080
CMD gunicorn --bind 0.0.0.0:${PORT:-8080} --workers 2 --threads 4 --timeout 60 app:app
