from flask import request, make_response, send_from_directory, Blueprint
from flask_login import current_user, login_required
from meowsenger.models import Chat, User, Message, Update, Notify
from meowsenger.users.routes import user_to_dict
from meowsenger.config import get_public_notify_key, get_private_notify_key
from meowsenger import db
import json
from pywebpush import webpush, WebPushException

notifications = Blueprint('notifications', __name__)

VAPID_CLAIMS = {
    "sub": "mailto:aleksandrnyrko@gmail.com"
}


def send_web_push(subscription_information, message_body):
    return webpush(
        subscription_info=subscription_information,
        data=message_body,
        vapid_private_key=get_private_notify_key(),
        vapid_claims=VAPID_CLAIMS
    )


def send_notification_to_chat_users(chat: Chat, text: str):
    for user in chat.users:
        if user != current_user:
            if user.notifies:
                for notify in user.notifies:
                    try:
                        send_web_push(json.loads(notify.subscription), text)
                    except WebPushException:
                        db.session.delete(notify)
    db.session.commit()


@notifications.route('/sw.js')
@login_required
def sw():
    response = make_response(
        send_from_directory(directory='static', path='sw.js'))
    response.headers['Content-Type'] = 'application/javascript'
    return response


@notifications.route("/api/n/subscription", methods=["POST"])
@login_required
def subscription():
    data = request.json
    notify = Notify(user_id=current_user.id, subscription=json.dumps(data))
    db.session.add(notify)
    db.session.commit()
    return {"status": True}
