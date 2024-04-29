FROM python:3.11-slim

RUN apt-get update && apt-get install -y firefox-esr

RUN pip install flask selenium webdriver-manager

WORKDIR /app

COPY src/ .

EXPOSE 2000

CMD ["python", "app.py"]
