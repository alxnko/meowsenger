from flask import request, Blueprint
from flask_login import current_user, login_required
from meowsenger.models import Chat, User, Message
from meowsenger.users.routes import user_to_dict
from meowsenger import db

messages = Blueprint('messages', __name__)


def mark_as_read(messages):
    if messages:
        for i in range(1, len(messages) + 1):
            if current_user in messages[-i].unread_by:
                messages[-i].unread_by.remove(current_user)
            else:
                break
    db.session.add(current_user)
    db.session.commit()


def message_to_dict(message: Message):
    return {
        "id": message.id,
        "author": user_to_dict(message.author),
        "text": message.text,
        "deleted": message.is_deleted,
        "sendTime": message.send_time,
        "isSystem": message.is_system,
        "unread": current_user in message.unread_by,
    }


def messages_to_arr(messages):
    return [message_to_dict(msg) for msg in messages]


@messages.route("/api/m/get_new", methods=["POST"])
@login_required
def get_new():
    data = request.json
    chat_id = data["id"]
    last = data["last"]
    chat = Chat.query.get(chat_id)
    if current_user in chat.users:
        messages = Message.query.filter(
            Message.chat_id == chat_id, Message.id > last).all()
        if messages:
            mark_as_read(messages)
            return {"status": True, "messages": messages_to_arr(messages)}
        return {"status": False}
    return {"status": False, "reason": "not in chat"}


@messages.route("/api/m/send", methods=["POST"])
@login_required
def send_msg():
    data = request.json
    chat_id = data["id"]
    chat = Chat.query.get(chat_id)
    is_system = data["isSystem"] if "isSystem" in data else False
    if current_user in chat.users:
        text = data["text"]
        message = Message(text=text, user_id=current_user.id,
                          chat_id=chat_id, is_system=is_system)
        for user in chat.users:
            if user != current_user:
                message.unread_by.append(user)
        db.session.add(message)
        db.session.commit()
        chat.last_time = message.send_time
        db.session.add(chat)
        db.session.commit()
        return {"status": True}
    return {"status": False, "reason": "not in chat"}
