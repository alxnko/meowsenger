from flask import redirect, request, Blueprint, render_template
from flask_login import login_user, current_user, logout_user, login_required
from meowsenger.models import Chat, User, Message
# from meowsenger.main.routes import mark_as_read
from meowsenger import db, bcrypt

main = Blueprint('main', __name__)


@main.route("*")
def main():
    return render_template("index.html")
