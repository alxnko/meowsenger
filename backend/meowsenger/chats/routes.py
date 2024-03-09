from flask import request, Blueprint
from flask_login import current_user, login_required
from meowsenger.models import Chat, User, Message
from meowsenger.messages.routes import message_to_dict
from meowsenger import db
from datetime import datetime
import time

chats = Blueprint('chats', __name__)


def mark_as_read(chat):
    for i in range(1, len(chat.messages) + 1):
        if current_user in chat.messages[-i].unread_by:
            chat.messages[-i].unread_by.remove(current_user)
        else:
            break
    db.session.add(chat)


def mark_as_not_read(chat, msg):
    for user in chat.users:
        msg.unread_by.append(user)


def messages_to_arr(chat, frm=1, to=50):
    if frm == 1:
        return [message_to_dict(msg) for msg in chat.messages[-to:]]
    else:
        return [message_to_dict(msg) for msg in chat.messages[-to:-frm]]


def chat_to_block_dict(chat: Chat):
    name = chat.name if chat.is_group else current_user.username if len(chat.users) == 1 else [
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
        "url": chat.id if chat.is_group else name,
        "isGroup": chat.is_group,
        "lastUpdate": chat.last_time,
        "isUnread": (current_user in chat.messages[-1].unread_by) if chat.messages else False,
    }


def chat_to_dict(chat: Chat):
    name = chat.name if chat.is_group else current_user.username if len(chat.users) == 1 else [
        i for i in chat.users if i.username != current_user.username][0].username
    return {
        "id": chat.id,
        "name": name,
        "users": [{"username": i.username} for i in chat.users if i.username != current_user.username] if len(chat.users) != 1 else [{"username": current_user.username}],
        "isGroup": chat.is_group,
        "lastUpdate": chat.last_time,
        "isUnread": (current_user in chat.messages[-1].unread_by) if chat.messages else False,
    }


@chats.route("/api/c/get_chats", methods=["POST"])
@login_required
def getChats():
    data = request.json
    chats = current_user.chats
    if chats:
        chats.sort(
            key=lambda chat: chat.last_time, reverse=True)
    if chats and chats[0].last_time > datetime.utcfromtimestamp(data['lastUpdate']):
        return {"status": True, "data": [chat_to_block_dict(chat) for chat in chats], "time": time.mktime(chats[0].last_time.timetuple())}
    return {"status": False}


@chats.route("/api/c/get_chat/", methods=["POST"])
@login_required
def getChat():
    data = request.json
    user = User.query.filter_by(username=data['from']).first()
    if user:
        if user == current_user:
            for chat in current_user.chats:
                if not chat.is_group and len(chat.users) == 1:
                    return {"status": True, "chat": chat_to_dict(chat), "messages": messages_to_arr(chat)}
            chat = Chat()
            chat.users.append(user)
            db.session.add(chat)
            db.session.commit()
            mark_as_read(chat)
            db.session.commit()
            return {"status": True, "chat": chat_to_dict(chat), "messages": messages_to_arr(chat)}
        else:
            for chat in current_user.chats:
                if not chat.is_group and user in chat.users:
                    return {"status": True, "chat": chat_to_dict(chat), "messages": []}
            chat = Chat()
            chat.users.append(user)
            chat.users.append(current_user)
            db.session.add(chat)
            db.session.commit()
            mark_as_read(chat)
            db.session.commit()
            return {"status": True, "chat": chat_to_dict(chat), "messages": messages_to_arr(chat)}
    return {"status": False}, 404
