from flask import request, Blueprint
from flask_login import current_user, login_required
from meowsenger.models import Chat, User, Message
from meowsenger.messages.routes import messages_to_arr_from
from meowsenger.users.routes import user_to_dict
from meowsenger import db, bcrypt
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
    db.session.commit()


def mark_as_not_read(chat, msg):
    for user in chat.users:
        msg.unread_by.append(user)
    db.session.add(chat)
    db.session.commit()


def get_last_message(chat_id):
    return Message.query.filter(Message.chat_id == chat_id, Message.is_deleted == False).order_by(Message.id.desc()).first()


def chat_to_block_dict(chat: Chat):
    name = chat.name if chat.is_group else current_user.username if len(chat.users) == 1 else [
        i for i in chat.users if i.username != current_user.username][0].username
    user = None if chat.is_group else User.query.filter_by(
        username=name).first()
    last_message = get_last_message(chat.id)
    return {
        "id": chat.id,
        "name": name,
        "secret": chat.secret,
        "isVerified": chat.is_verified if chat.is_group else user.is_verified,
        "isAdmin": True if user and user.is_admin else False,
        "isTester": True if user and user.is_tester else False,
        "lastMessage":
            {"text": last_message.text,
             "author": last_message.author.username,
             "isSystem": last_message.is_system}
            if last_message else
            {"text": "no messages",
             "author": "", },
        "url": chat.id if chat.is_group else name,
        "type": "g" if chat.is_group else "u",
        "isGroup": chat.is_group,
        "lastUpdate": chat.last_time,
        "isUnread": (current_user in chat.messages[-1].unread_by) if chat.messages else False,
    }


def chat_to_dict(chat: Chat):
    name = chat.name if chat.is_group else current_user.username if len(chat.users) == 1 else [
        i for i in chat.users if i.username != current_user.username][0].username
    user = None if chat.is_group else User.query.filter_by(
        username=name).first()
    return {
        "id": chat.id,
        "name": name,
        "desc": chat.description,
        "secret": chat.secret,
        "isVerified": chat.is_verified if chat.is_group else user.is_verified,
        "isAdmin": True if user and user.is_admin else False,
        "isTester": True if user and user.is_tester else False,
        "users": ([user_to_dict(i) for i in chat.users] if chat.is_group else [user_to_dict(i) for i in chat.users if i.username != current_user.username]) if len(chat.users) != 1 else [{"username": current_user.username}],
        "admins": [i.username for i in chat.admins] if chat.is_group else [],
        "isGroup": chat.is_group,
        "lastUpdate": chat.last_time,
        "isUnread": (current_user in chat.messages[-1].unread_by) if chat.messages else False,
    }


def remove_group(chat):
    chat.users.clear()
    chat.admins.clear()
    for msg in chat.messages:
        db.session.delete(msg)
    db.session.delete(chat)


@chats.route("/api/c/get_chats", methods=["POST"])
@login_required
def getChats():
    data = request.json
    chats = current_user.chats
    if chats:
        chats.sort(
            key=lambda chat: chat.last_time, reverse=True)
    if len(chats) < data['chats']:
        return {'status': True, "data": []}
    if chats and (len(chats) != data['chats'] or chats[0].last_time != datetime.utcfromtimestamp(data['lastUpdate'])):
        return {"status": True, "data": [chat_to_block_dict(chat) for chat in chats], "time": time.mktime(chats[0].last_time.timetuple())}
    return {"status": False}


@chats.route("/api/c/get_chat", methods=["POST"])
@login_required
def getChat():
    data = request.json
    user = User.query.filter_by(username=data['from']).first()
    if user:
        if user == current_user:
            for chat in current_user.chats:
                if not chat.is_group and len(chat.users) == 1:
                    last = time.mktime(chat.last_time.timetuple())
                    return {"status": True, "chat": chat_to_dict(chat), "messages": messages_to_arr_from(chat.id), "last": last}
            chat = Chat()
            chat.users.append(user)
            db.session.add(chat)
            db.session.commit()
            mark_as_read(chat)
            db.session.commit()
            last = time.mktime(chat.last_time.timetuple())
            return {"status": True, "chat": chat_to_dict(chat), "messages": [], "last": last}
        else:
            for chat in current_user.chats:
                if not chat.is_group and user in chat.users:
                    mark_as_read(chat)
                    last = time.mktime(chat.last_time.timetuple())
                    return {"status": True, "chat": chat_to_dict(chat), "messages": messages_to_arr_from(chat.id), "last": last}
            chat = Chat()
            chat.users.append(user)
            chat.users.append(current_user)
            db.session.add(chat)
            db.session.commit()
            last = time.mktime(chat.last_time.timetuple())
            return {"status": True, "chat": chat_to_dict(chat), "messages": [], "last": last}
    return {"status": False}, 404


@chats.route("/api/c/create_group", methods=["POST"])
@login_required
def createGroup():
    data = request.json
    chat = Chat(name=data["name"], is_group=True)
    chat.users.append(current_user)
    chat.admins.append(current_user)
    db.session.add(chat)
    db.session.commit()
    return {"status": True, "id": chat.id, "secret": chat.secret}


@chats.route("/api/c/remove_group", methods=["POST"])
@login_required
def removeGroup():
    data = request.json
    chat = Chat.query.get(data['from'])
    if current_user in chat.admins:
        if bcrypt.check_password_hash(current_user.password, data['password']):
            remove_group(chat)
            db.session.commit()
            return {"status": True}
    return {"status": False}


@chats.route("/api/c/leave_group", methods=["POST"])
@login_required
def leaveGroup():
    data = request.json
    chat = Chat.query.get(data['from'])
    if current_user in chat.users:
        chat.users.remove(current_user)
        if len(chat.users) == 0:
            remove_group(chat)
        else:
            msg = Message(
                text=data['message'], user_id=current_user.id, chat_id=chat.id, is_system=True)
            db.session.add(msg)
            db.session.add(chat)
        db.session.commit()
        return {"status": True}
    return {"status": False}


@chats.route("/api/c/get_group", methods=["POST"])
@login_required
def getGroup():
    data = request.json
    chat = Chat.query.get(data['from'])
    if chat:
        if chat.is_group and current_user in chat.users:
            mark_as_read(chat)
            last = time.mktime(chat.last_time.timetuple())
            return {"status": True, "chat": chat_to_dict(chat), "messages": messages_to_arr_from(chat.id), "last": last}
        else:
            return {"status": False}
    return {"status": False}, 404


@chats.route("/api/c/add_member", methods=["POST"])
@login_required
def addMember():
    data = request.json
    chat = Chat.query.get(data['from'])
    if chat:
        user = User.query.filter_by(username=data['username']).first()
        if user:
            if chat.is_group and current_user in chat.admins:
                chat.users.append(user)
                msg = Message(
                    text=data['message'], user_id=current_user.id, chat_id=chat.id, is_system=True)
                db.session.add(msg)
                db.session.commit()
                chat.last_time = msg.send_time
                db.session.add(chat)
                db.session.commit()
                return {"status": True}
            else:
                return {"status": False}
        return {"status": False}
    return {"status": False}, 404


@chats.route("/api/c/remove_member", methods=["POST"])
@login_required
def removeMember():
    data = request.json
    chat = Chat.query.get(data['from'])
    if chat:
        user = User.query.filter_by(username=data['username']).first()
        if user:
            if chat.is_group and current_user in chat.admins and user in chat.users:
                chat.users.remove(user)
                msg = Message(
                    text=data['message'], user_id=current_user.id, chat_id=chat.id, is_system=True)
                db.session.add(msg)
                db.session.commit()
                chat.last_time = msg.send_time
                db.session.add(chat)
                db.session.commit()
                return {"status": True}
            else:
                return {"status": False}
        return {"status": False}
    return {"status": False}, 404


@chats.route("/api/c/add_admin", methods=["POST"])
@login_required
def addAdmin():
    data = request.json
    chat = Chat.query.get(data['from'])
    if chat:
        user = User.query.filter_by(username=data['username']).first()
        if user:
            if chat.is_group and current_user == chat.admins[0]:
                chat.admins.append(user)
                msg = Message(
                    text=data['message'], user_id=current_user.id, chat_id=chat.id, is_system=True)
                db.session.add(msg)
                db.session.commit()
                chat.last_time = msg.send_time
                db.session.add(chat)
                db.session.commit()
                return {"status": True}
            else:
                return {"status": False}
        return {"status": False}
    return {"status": False}, 404


@chats.route("/api/c/remove_admin", methods=["POST"])
@login_required
def removeAdmin():
    data = request.json
    chat = Chat.query.get(data['from'])
    if chat:
        user = User.query.filter_by(username=data['username']).first()
        if user:
            if chat.is_group and current_user == chat.admins[0]:
                chat.admins.remove(user)
                msg = Message(
                    text=data['message'], user_id=current_user.id, chat_id=chat.id, is_system=True)
                db.session.add(msg)
                db.session.commit()
                chat.last_time = msg.send_time
                db.session.add(chat)
                db.session.commit()
                return {"status": True}
            else:
                return {"status": False}
        return {"status": False}
    return {"status": False}, 404


@chats.route("/api/c/save_settings", methods=["POST"])
@login_required
def saveSettings():
    data = request.get_json()
    chat = Chat.query.get(data["id"])
    print(data)
    if "name" in data:
        chat.name = data["description"]
    if "description" in data:
        chat.description = data["description"]
    msg = Message(
        text=data['message'], user_id=current_user.id, chat_id=chat.id, is_system=True)
    db.session.add(msg)
    db.session.commit()
    chat.last_time = msg.send_time
    db.session.add(chat)
    db.session.commit()
    return {"status": True}
