from flask import redirect, request, Blueprint
from flask_login import login_user, current_user, logout_user, login_required
from meowsenger.models import Chat, User, Message
# from meowsenger.main.routes import mark_as_read
from meowsenger import db, bcrypt

users = Blueprint('users', __name__)


def user_to_dict(user: User):
    return {
        "id": user.id,
        "username": user.username,
        "rank": user.rank,
        "image_file": user.image_file,
    }


@users.route("/api/u/get_current_user")
def get_current_user():
    return user_to_dict(current_user) if current_user.is_authenticated else {"error": "notAuth"}


@users.route("/api/u/register", methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if (len(username) < 3 or len(password) < 8):
        return {"status": False, "reason": "len"}, 403
    u = User.query.filter_by(username=username).first()
    if u:
        return {"status": False, "reason": "username"}, 422
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(username=username, password=hashed_password)
    db.session.add(user)
    db.session.commit()
    login_user(user, remember=True)
    return {"status": True}


@users.route("/api/u/login", methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
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


@users.route("/api/u/has_user/<username>", methods=['GET'])
def hasUser(username):
    user = User.query.filter_by(username=username).first()
    return {"status": True} if user else {"status": False}
