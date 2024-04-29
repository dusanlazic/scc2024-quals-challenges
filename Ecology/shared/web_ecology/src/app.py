from flask import Flask, request, jsonify, send_from_directory
from urllib.parse import urlparse
import requests

app = Flask(__name__)


@app.route("/")
def index():
    return send_from_directory("views", "index.html")


@app.route("/sendFlag")
def sendFlag():
    destination = request.args.get("destination")

    if not destination:
        return {"error": "Destination is required."}, 400

    try:
        parsed_url = urlparse(destination)
    except Exception:
        return {"error": "Invalid destination."}, 400
    if parsed_url.scheme not in ["http", "https"]:
        return {"error": "Invalid scheme."}, 400
    if parsed_url.hostname not in ["127.0.0.1", "localhost"]:
        return {"error": "You can't send the flag to the outside world."}, 401
    if parsed_url.port in [5000, 8000]:
        return {
            "error": "Invalid service. You can't send the flag back to the same service."
        }, 400

    response = requests.get(f"http://localhost:8000/{request.full_path}")

    if response.status_code == 200:
        return {"message": f"The flag will be sent to {destination}."}
    else:
        return {"error": "Failed to send flag."}, 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
