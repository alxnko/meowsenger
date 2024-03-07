from flask import render_template, url_for, flash, redirect, request, Blueprint, jsonify
from flask_login import login_user, current_user, logout_user, login_required
from meowsenger.models import Chat, User, Message
# from meowsenger.main.routes import mark_as_read
from meowsenger import db, bcrypt
from datetime import datetime
import time

messages = Blueprint('messages', __name__)


def message_to_dict(message: Message):
    return {
        "id": message.id,
        "author": message.author,
        "text": message.text,
        "deleted": message.deleted,
        "sendTime": message.send_time,
        "unread": current_user in message.unreadby,
    }
