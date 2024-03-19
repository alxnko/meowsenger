from flask import request, Blueprint
from flask_login import current_user, login_required
from meowsenger.models import Chat, User, Message, Update
from meowsenger.users.routes import user_to_dict
from meowsenger import db
from datetime import datetime
import time

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
        "isDeleted": message.is_deleted,
        "isForwarded": message.is_forwarded,
        "isEdited": message.is_edited,
        "sendTime": message.send_time,
        "isSystem": message.is_system,
        "unread": current_user in message.unread_by,
        "replyTo": message_to_dict(Message.query.get(message.reply_to)) if message.reply_to else None
    }


def messages_to_arr(messages):
    if messages:
        return [message_to_dict(msg) for msg in messages if not msg.is_deleted]


def updates_to_arr(updates):
    if updates:
        return [message_to_dict(Message.query.get(upd.message_id)) for upd in updates]
        # out = []
        # for upd in updates:
        #     message = Message.query.get(upd.message_id)
        #     if not message.is_deleted:
        #         out.append(message_to_dict(message))
        #     else:
        #         out.append({"id": message.id, "isDeleted": True})
        # return out


@messages.route("/api/m/get_new", methods=["POST"])
@login_required
def get_new():
    data = request.json
    chat_id = data["id"]
    last = data["last"]
    chat = Chat.query.get(chat_id)
    if current_user in chat.users:
        messages = Message.query.filter(
            Message.chat_id == chat_id, Message.send_time > datetime.fromtimestamp(last)).all()
        updates = Update.query.filter(
            Update.chat_id == chat_id, Update.time > datetime.fromtimestamp(last)).all()
        if messages or updates:
            mark_as_read(messages)
            last = time.mktime(chat.last_time.timetuple())
            return {"status": True, "messages": messages_to_arr(messages),
                    "updates": updates_to_arr(updates), "last": last}
        return {"status": False}
    return {"status": False, "reason": "not in chat"}


@messages.route("/api/m/send", methods=["POST"])
@login_required
def send_msg():
    data = request.json
    chat_id = data["id"]
    chat = Chat.query.get(chat_id)
    is_system = data["isSystem"] if "isSystem" in data else False
    reply_to = data["replyTo"] if "replyTo" in data else None
    is_forwarded = data["isForwarded"] if "isForwarded" in data else None
    if current_user in chat.users:
        text = data["text"]
        message = Message(text=text, user_id=current_user.id, reply_to=reply_to, is_forwarded=is_forwarded,
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


@messages.route("/api/m/delete", methods=["POST"])
@login_required
def delete_msg():
    data = request.json
    m_id = data["id"]
    message = Message.query.get(m_id)
    if message.author == current_user:
        message.is_deleted = True
        db.session.add(message)
        update = Update(chat_id=message.chat.id, message_id=m_id)
        db.session.add(update)
        db.session.commit()
        chat = Chat.query.get(message.chat_id)
        chat.last_time = update.time
        db.session.add(chat)
        db.session.commit()
        return {"status": True}
    return {"status": False}


@messages.route("/api/m/edit", methods=["POST"])
@login_required
def edit_msg():
    data = request.json
    m_id = data["id"]
    message = Message.query.get(m_id)
    if message.author == current_user:
        message.is_edited = True
        message.text = data["text"]
        db.session.add(message)
        update = Update(chat_id=message.chat.id, message_id=m_id)
        db.session.add(update)
        db.session.commit()
        chat = Chat.query.get(message.chat_id)
        chat.last_time = update.time
        db.session.add(chat)
        db.session.commit()
        return {"status": True}
    return {"status": False}
