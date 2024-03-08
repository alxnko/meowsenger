from flask import request, Blueprint
from flask_login import current_user, login_required
from meowsenger.models import Chat, User, Message
# from meowsenger.main.routes import mark_as_read
from meowsenger import db
from datetime import datetime
import time

messages = Blueprint('messages', __name__)


def message_to_dict(message: Message):
    return {
        "id": message.id,
        "author": message.author,
        "text": message.text,
        "deleted": message.is_deleted,
        "sendTime": message.send_time,
        "unread": current_user in message.unread_by,
    }
