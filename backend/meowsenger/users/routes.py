from flask import request, Blueprint
from flask_login import login_user, current_user, logout_user, login_required
from meowsenger.models import User
from meowsenger import db, bcrypt

users = Blueprint("users", __name__)


def user_to_dict(user: User):
    return {
        "id": user.id,
        "username": user.username,
        "rank": user.rank,
        "desc": user.description,
        "isAdmin": user.is_admin,
        "isVerified": user.is_verified,
        "isTester": user.is_tester,
        "imageFile": user.image_file,
    }


@users.route("/api/u/get_current_user")
def get_current_user():
    return user_to_dict(current_user) if current_user.is_authenticated else {"error": "notAuth"}


@users.route("/api/u/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    if (len(username) < 3 or len(password) < 8):
        return {"status": False, "reason": "len"}, 403
    u = User.query.filter_by(username=username).first()
    if u:
        return {"status": False, "reason": "username"}, 422
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(username=username, password=hashed_password)
    db.session.add(user)
    db.session.commit()
    login_user(user, remember=True)
    return {"status": True}


@users.route("/api/u/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password, password):
        login_user(user, remember=True)
        return {"status": True}
    return {"status": False}, 401


@users.route("/api/u/logout")
def logout():
    if current_user:
        logout_user()
        return {"status": True}
    return {"status": False}


@users.route("/api/u/has_user/<username>", methods=["GET"])
def hasUser(username):
    user = User.query.filter_by(username=username).first()
    return {"status": True} if user else {"status": False}


@users.route("/api/u/get_user/<username>", methods=["GET"])
@login_required
def getUser(username):
    user = User.query.filter_by(username=username).first()
    return {"status": True, "user": user_to_dict(user)} if user else {"status": False}


@users.route("/api/u/save_settings", methods=["POST"])
@login_required
def saveSettings():
    data = request.get_json()
    user = User.query.filter_by(username=current_user.username).first()
    if "description" in data:
        user.description = data["description"]
    db.session.add(user)
    db.session.commit()
    return {"status": True}


@users.route("/api/u/admin_edit", methods=["POST"])
def adminEdit():
    if current_user.is_admin or current_user.username == "alxnko":
        data = request.get_json()
        user = User.query.get(data['id'])
        if data['action'] == "verify":
            user.is_verified = not user.is_verified
        if data["action"] == "tester":
            user.is_tester = not user.is_tester
        if data["action"] == "admin":
            user.is_admin = not user.is_admin
        db.session.add(user)
        db.session.commit()
        return {"status": False}
    return {"status": False}
