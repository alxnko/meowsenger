from flask import Blueprint
from flask_login import current_user, login_required
from meowsenger.models import Chat, User

admin = Blueprint('admin', __name__)


def is_admin():
    if current_user.is_admin or current_user.username == "alxnko":
        return True
    return False


@admin.route("/admin/chats", methods=["GET"])
@login_required
def get_chats():
    if not is_admin():
        return {"status": False}
    chats = Chat.query.all()
    chat_list = [{"id": chat.id, "name": chat.name,
                  "is_group": "group" if chat.is_group else "chat",
                  "description": chat.description,
                  "num_messages": len(chat.messages),
                  "num_users": len(chat.users),
                  "num_admins": len(chat.admins) if chat.is_group else 0,
                  "last_time": chat.last_time,
                  "users": [{"id": user.id, "username": user.username}
                            for user in chat.users],
                 "admins": [{"id": admin.id, "username": admin.username}
                            for admin in chat.admins]}
                 for chat in chats]
    html = "<h1>Chats</h1>"
    html += "<table border='1'><tr><th>ID</th><th>Name</th><th>Type</th><th>Description</th><th>Messages</th><th>Users</th><th>Admins</th><th>Last Update</th><th>Users</th></tr>"
    for chat in chats:
        html += "<tr><td>{}</td><td>{}</td><td>{}</td><td>{}</td><td>{}</td><td>{}</td><td>{}</td><td>{}</td><td>{}</td></tr>".format(
            chat.id, chat.name, "group" if chat.is_group else "chat", chat.description,
            len(chat.messages), len(chat.users), len(
                chat.admins) if chat.is_group else "N/A",
            chat.last_time, ", ".join([f"<b>{user.username}</b>" if user in chat.admins else user.username for user in chat.users]))
    html += "</table>"
    return html


@admin.route("/admin/users", methods=["GET"])
@login_required
def get_users():
    if not is_admin():
        return {"status": False}
    users = User.query.all()
    user_list = [{"id": user.id, "username": user.username, "description": user.description,
                  "is_admin": user.is_admin, "is_tester": user.is_tester, "is_verified": user.is_verified,
                  "num_messages": len(user.messages), "num_chats": len(user.chats),
                  "num_groups_managed": len(user.manage), "reg_time": user.reg_time} for user in users]
    html = "<h1>Users</h1>"
    html += "<table border='1'><tr><th>ID</th><th>Username</th><th>Description</th><th>Is Admin</th><th>Is Tester</th><th>Is Verified</th><th>Messages</th><th>Chats</th><th>Groups Managed</th><th>Registration Time</th></tr>"
    for user in users:
        html += "<tr><td>{}</td><td>{}</td><td>{}</td><td>{}</td><td>{}</td><td>{}</td><td>{}</td><td>{}</td><td>{}</td><td>{}</td></tr>".format(
            user.id, user.username, user.description, user.is_admin, user.is_tester, user.is_verified,
            len(user.messages), len(user.chats), len(user.manage), user.reg_time)
    html += "</table>"
    return html
