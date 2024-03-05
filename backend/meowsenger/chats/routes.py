from flask import render_template, url_for, flash, redirect, request, Blueprint, jsonify
from flask_login import login_user, current_user, logout_user, login_required
from meowsenger.models import Chat, User, Message
# from meowsenger.main.routes import mark_as_read
from meowsenger import db, bcrypt
from datetime import datetime
import time

chats = Blueprint('chats', __name__)


def chat_to_dict(chat: Chat):
    name = chat.name if chat.isGroup else [
        i for i in chat.users if i.username != current_user.username][0].username
    return {
        "id": chat.id,
        "name": name,
        "lastMessage":
            {"text": chat.messages[-1].text,
             "author": chat.messages[-1].author.username}
            if chat.messages else
            {"text": "no messages",
             "author": "", },
        "url": chat.id if chat.isGroup else name,
        "isGroup": chat.isGroup,
        "lastUpdate": chat.last_time,
        "isUnread": current_user in chat.messages[-1].unreadby if chat.messages else False,
    }


@chats.route("/api/c/get_chats", methods=["POST"])
def getChats():
    data = request.json
    chats = current_user.chats
    if chats:
        chats.sort(
            key=lambda chat: chat.last_time, reverse=True)
    print(chats[0].last_time, datetime.utcfromtimestamp(data['lastUpdate']))
    if chats[0].last_time > datetime.utcfromtimestamp(data['lastUpdate']):
        return {'status': True, 'data': [chat_to_dict(chat) for chat in chats], "time": time.mktime(chats[0].last_time.timetuple())}
    return {"status": False}
