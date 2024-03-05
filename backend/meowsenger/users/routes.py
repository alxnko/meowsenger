from flask import render_template, url_for, flash, redirect, request, Blueprint, jsonify
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


@users.route("/api/u/has_user/<username>", methods=['GET'])
def hasUser(username):
    if current_user.is_authenticated and username == current_user.username:
        return "False"
    user = User.query.filter_by(username=username)
    return "True" if user.first() else "False"
