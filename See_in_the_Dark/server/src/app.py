from flask import Flask, render_template, request
from urllib.parse import urlparse
from bot import visit
import json

app = Flask(__name__)

with open("posts.json", "r", encoding="utf-8") as f:
    posts = json.load(f)


@app.context_processor
def inject_settings():
    theme = request.cookies.get("theme", "light")
    return dict(theme=theme)


@app.route("/")
def index():
    return render_template("index.html", posts=posts)


@app.route("/blog/<slug>")
def post(slug):
    post = posts.get(slug)
    if not post:
        return "Post not found", 404

    return render_template("post.html", post=post)


@app.route("/search")
def search():
    query = request.args.get("q", "")
    filtered_posts = {
        slug: post
        for slug, post in posts.items()
        if query.lower() in post["title"].lower()
        or query.lower() in post["content"].lower()
    }
    return render_template("search.html", posts=filtered_posts, query=query)


@app.route("/report", methods=["GET", "POST"])
def report():
    if request.method == "GET":
        return render_template("report.html")
    elif request.method == "POST":
        data = request.json

        try:
            theme = data["theme"]
            url = data["pageUrl"]
        except KeyError:
            return {"error": "Missing data."}, 400

        try:
            parsed_url = urlparse(url)
        except Exception:
            return {"error": "Invalid URL."}, 400
        if parsed_url.scheme not in ["http", "https"]:
            return {"error": "Invalid scheme."}, 400
        if parsed_url.hostname not in ["127.0.0.1", "localhost"]:
            return {"error": "Report that bug to them, not me."}, 401
        if parsed_url.port != 2000:
            return {"error": "Hacking attempt!!"}, 400

        try:
            visit(theme, url)
            return {
                "message": "Admin has seen your report. Thanks for your contribution."
            }
        except:
            return {"error": "Something went wrong. Try again later"}, 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=2000)
