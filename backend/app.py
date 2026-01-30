from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
CORS(app)

# -------------------
# DATABASE CONFIG
# -------------------
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///data.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# -------------------
# MODELS
# -------------------

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    home_state = db.Column(db.String(50))
    grade = db.Column(db.String(20))
    board = db.Column(db.String(50))
    category = db.Column(db.String(50))

    created_at = db.Column(db.DateTime, server_default=db.func.now())


class Signal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    question_id = db.Column(db.Integer, nullable=False)
    selected_option = db.Column(db.String(255))
    confidence = db.Column(db.Integer)
    time_spent_ms = db.Column(db.Integer)
    order_index = db.Column(db.Integer)
    skipped = db.Column(db.Boolean, default=False)

# -------------------
# ROUTES
# -------------------

@app.route("/ping")
def ping():
    return jsonify({"message": "Backend is working"})

# ---- USERS ----

@app.route("/api/users/email/<email>")
def get_user_by_email(email):
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "grade": user.grade,
        "board": user.board
    })

@app.route("/api/users", methods=["POST"])
def create_or_update_user():
    data = request.json

    user = User.query.filter_by(email=data["email"]).first()

    if not user:
        user = User(email=data["email"], name=data["name"])
        db.session.add(user)

    user.name = data["name"]
    user.home_state = data.get("homeState")
    user.grade = data.get("grade")
    user.board = data.get("board")
    user.category = data.get("category")

    db.session.commit()

    return jsonify({
        "id": user.id,
        "email": user.email,
        "name": user.name
    })

# ---- SIGNALS ----

@app.route("/api/signals/batch", methods=["POST"])
def save_signals_batch():
    signals = request.json

    if not signals or not isinstance(signals, list):
        return jsonify({"error": "Invalid payload"}), 400

    for s in signals:
        if not s.get("userId"):
            return jsonify({"error": "userId missing"}), 400

        signal = Signal(
            user_id=s["userId"],
            question_id=s["questionId"],
            selected_option=s["selectedOption"],
            confidence=s["confidence"],
            time_spent_ms=s["timeSpentMs"],
            order_index=s["orderIndex"],
            skipped=s.get("skipped", False)
        )
        db.session.add(signal)

    db.session.commit()
    return jsonify({"message": "Signals saved successfully"})


@app.route("/api/signals/user/<int:user_id>")
def get_signals_for_user(user_id):
    signals = Signal.query.filter_by(user_id=user_id).order_by(Signal.order_index).all()

    return jsonify([
        {
            "questionId": s.question_id,
            "selectedOption": s.selected_option,
            "confidence": s.confidence,
            "timeSpentMs": s.time_spent_ms,
            "orderIndex": s.order_index,
            "skipped": s.skipped
        }
        for s in signals
    ])

# -------------------
# APP START
# -------------------

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)

with app.app_context():
    db.create_all()

