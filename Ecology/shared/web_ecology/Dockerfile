FROM python:3.11-alpine

RUN pip install flask requests && apk add --no-cache php supervisor

WORKDIR /app

COPY src/ .

RUN mkdir -p /run
COPY src/supervisord.conf /etc/supervisord/conf.d/supervisord.conf

EXPOSE 5000

CMD ["supervisord", "-c", "/etc/supervisord/conf.d/supervisord.conf"]
