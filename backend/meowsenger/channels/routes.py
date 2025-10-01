from flask import request, Blueprint
from flask_login import current_user, login_required
from meowsenger.models import Chat, User, Message
from meowsenger.chats.routes import mark_as_read, chat_to_dict, chat_to_block_dict
from meowsenger.messages.routes import messages_to_arr_from
from meowsenger.notifications.routes import send_notification_to_chat_users
from meowsenger.users.routes import user_to_dict
from meowsenger import db
import time

channels = Blueprint('channels', __name__)


def channel_to_dict(channel: Chat):
    """Convert a channel to dictionary format"""
    return {
        "id": channel.id,
        "name": channel.name,
        "desc": channel.description,
        "secret": channel.secret,
        "isVerified": channel.is_verified,
        "isPublic": channel.is_public,
        "users": [user_to_dict(i) for i in channel.users] if channel.users else [],
        "admins": [i.username for i in channel.admins] if channel.admins else [],
        "isChannel": True,
        "memberCount": len(channel.users) if channel.users else 0,
        "lastUpdate": channel.last_time,
        "isUnread": (current_user in channel.messages[-1].unread_by) if channel.messages else False,
    }


def channel_to_block_dict(channel: Chat):
    """Convert a channel to block dictionary format for list view"""
    from meowsenger.chats.routes import get_last_message
    last_message = get_last_message(channel.id)
    return {
        "id": channel.id,
        "name": channel.name,
        "secret": channel.secret,
        "isVerified": channel.is_verified,
        "lastMessage":
            {"text": last_message.text,
             "author": last_message.author.username,
             "isSystem": last_message.is_system}
            if last_message else
            {"text": "no messages",
             "author": ""},
        "url": channel.id,
        "type": "ch",
        "isChannel": True,
        "memberCount": len(channel.users) if channel.users else 0,
        "lastUpdate": channel.last_time,
        "isUnread": (current_user in channel.messages[-1].unread_by) if channel.messages else False,
    }


@channels.route("/api/ch/create_channel", methods=["POST"])
@login_required
def createChannel():
    """Create a new channel"""
    data = request.json
    channel = Chat(
        name=data["name"],
        is_channel=True,
        is_public=data.get("isPublic", True),
        description=data.get("description", "meowsenger channel")
    )
    channel.admins.append(current_user)
    channel.users.append(current_user)
    db.session.add(channel)
    db.session.commit()
    return {"status": True, "id": channel.id, "secret": channel.secret}


@channels.route("/api/ch/get_channels", methods=["POST"])
@login_required
def getChannels():
    """Get list of channels the user is subscribed to"""
    user_channels = [chat for chat in current_user.chats if chat.is_channel]
    if user_channels:
        user_channels.sort(key=lambda channel: channel.last_time, reverse=True)
    return {"status": True, "data": [channel_to_block_dict(ch) for ch in user_channels]}


@channels.route("/api/ch/get", methods=["POST"])
@login_required
def getChannel():
    """Get channel details and messages"""
    data = request.json
    channel = Chat.query.get(data['from'])
    if channel and channel.is_channel:
        if current_user in channel.users:
            mark_as_read(channel)
            last = time.mktime(channel.last_time.timetuple())
            return {"status": True, "channel": channel_to_dict(channel), "messages": messages_to_arr_from(channel.id), "last": last}
        else:
            return {"status": False, "reason": "not subscribed"}
    return {"status": False}, 404


@channels.route("/api/ch/join", methods=["POST"])
@login_required
def joinChannel():
    """Join/subscribe to a channel"""
    data = request.json
    channel = Chat.query.get(data['id'])
    if channel and channel.is_channel:
        if current_user not in channel.users:
            channel.users.append(current_user)
            # Create system message for new subscriber
            msg = Message(
                text=f"{current_user.username} joined the channel",
                user_id=current_user.id,
                chat_id=channel.id,
                is_system=True
            )
            db.session.add(msg)
            db.session.commit()
            channel.last_time = msg.send_time
            db.session.add(channel)
            db.session.commit()
            return {"status": True}
        return {"status": False, "reason": "already subscribed"}
    return {"status": False}, 404


@channels.route("/api/ch/leave", methods=["POST"])
@login_required
def leaveChannel():
    """Leave/unsubscribe from a channel"""
    data = request.json
    channel = Chat.query.get(data['from'])
    if channel and channel.is_channel and current_user in channel.users:
        channel.users.remove(current_user)
        # If user was admin, remove admin status too
        if current_user in channel.admins:
            channel.admins.remove(current_user)
        msg = Message(
            text=f"{current_user.username} left the channel",
            user_id=current_user.id,
            chat_id=channel.id,
            is_system=True
        )
        db.session.add(msg)
        db.session.commit()
        channel.last_time = msg.send_time
        db.session.add(channel)
        db.session.commit()
        return {"status": True}
    return {"status": False}


@channels.route("/api/ch/post", methods=["POST"])
@login_required
def postToChannel():
    """Post a message to channel (admin only)"""
    data = request.json
    channel_id = data["id"]
    channel = Chat.query.get(channel_id)
    
    if not channel or not channel.is_channel:
        return {"status": False, "reason": "not a channel"}
    
    if current_user not in channel.admins:
        return {"status": False, "reason": "not admin"}
    
    if current_user not in channel.users:
        return {"status": False, "reason": "not subscribed"}
    
    text = data["text"]
    reply_to = data.get("replyTo")
    is_forwarded = data.get("isForwarded", False)
    
    message = Message(
        text=text,
        user_id=current_user.id,
        reply_to=reply_to,
        is_forwarded=is_forwarded,
        chat_id=channel_id,
        is_system=False
    )
    
    # Mark as unread for all subscribers except sender
    for user in channel.users:
        if user != current_user:
            message.unread_by.append(user)
    
    db.session.add(message)
    db.session.commit()
    
    channel.last_time = message.send_time
    db.session.add(channel)
    db.session.commit()
    
    # Send notifications to subscribers
    send_notification_to_chat_users(
        channel,
        f"({channel.name}){current_user.username}:{text}:{channel.secret}:{channel.id}"
    )
    
    return {"status": True}


@channels.route("/api/ch/add_admin", methods=["POST"])
@login_required
def addChannelAdmin():
    """Add admin to channel (owner/first admin only)"""
    data = request.json
    channel = Chat.query.get(data['from'])
    if channel and channel.is_channel:
        user = User.query.filter_by(username=data['username']).first()
        if user and user in channel.users:
            # Only the first admin (owner) can add other admins
            if current_user == channel.admins[0]:
                if user not in channel.admins:
                    channel.admins.append(user)
                    msg = Message(
                        text=f"{current_user.username} gave admin rights to {user.username}",
                        user_id=current_user.id,
                        chat_id=channel.id,
                        is_system=True
                    )
                    db.session.add(msg)
                    db.session.commit()
                    channel.last_time = msg.send_time
                    db.session.add(channel)
                    db.session.commit()
                    return {"status": True}
                return {"status": False, "reason": "already admin"}
            return {"status": False, "reason": "not owner"}
        return {"status": False, "reason": "user not in channel"}
    return {"status": False}, 404


@channels.route("/api/ch/remove_admin", methods=["POST"])
@login_required
def removeChannelAdmin():
    """Remove admin from channel (owner/first admin only)"""
    data = request.json
    channel = Chat.query.get(data['from'])
    if channel and channel.is_channel:
        user = User.query.filter_by(username=data['username']).first()
        if user and user in channel.admins:
            # Only the first admin (owner) can remove other admins
            # Cannot remove the owner
            if current_user == channel.admins[0] and user != channel.admins[0]:
                channel.admins.remove(user)
                msg = Message(
                    text=f"{current_user.username} removed admin rights from {user.username}",
                    user_id=current_user.id,
                    chat_id=channel.id,
                    is_system=True
                )
                db.session.add(msg)
                db.session.commit()
                channel.last_time = msg.send_time
                db.session.add(channel)
                db.session.commit()
                return {"status": True}
            return {"status": False, "reason": "not owner or trying to remove owner"}
        return {"status": False, "reason": "user not admin"}
    return {"status": False}, 404


@channels.route("/api/ch/save_settings", methods=["POST"])
@login_required
def saveChannelSettings():
    """Save channel settings (admin only)"""
    data = request.get_json()
    channel = Chat.query.get(data["id"])
    
    if not channel or not channel.is_channel:
        return {"status": False, "reason": "not a channel"}
    
    if current_user not in channel.admins:
        return {"status": False, "reason": "not admin"}
    
    if "name" in data:
        channel.name = data["name"]
    if "description" in data:
        channel.description = data["description"]
    if "isPublic" in data:
        channel.is_public = data["isPublic"]
    
    msg = Message(
        text="Channel settings updated",
        user_id=current_user.id,
        chat_id=channel.id,
        is_system=True
    )
    db.session.add(msg)
    db.session.commit()
    channel.last_time = msg.send_time
    db.session.add(channel)
    db.session.commit()
    return {"status": True}
