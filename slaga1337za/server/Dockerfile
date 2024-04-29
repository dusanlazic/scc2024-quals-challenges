FROM python:3.11-alpine

RUN pip install colorama

WORKDIR /app

COPY src/app.py .

EXPOSE 3735

CMD ["python", "app.py"]
