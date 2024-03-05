from datetime import datetime, timedelta
# from itsdangerous import TimedJSONWebSignatureSerializer as Serializer
from flask import redirect, flash, url_for
from meowsenger import db, login_manager
from flask_login import UserMixin


@login_manager.user_loader
def load_user(user_id):
    try:
        msgs = Message.query.filter(
            Message.send_time <= datetime.now() - timedelta(days=14))
        for msg in msgs:
            db.session.delete(msg)
        db.session.commit()
    except:
        pass
    try:
        return User.query.get(int(user_id))
    except:
        return None


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    image_file = db.Column(db.String(20), nullable=False,
                           default='default')
    rank = db.Column(db.String(20))
    password = db.Column(db.String(60), nullable=False)
    messages = db.relationship('Message', backref='author', lazy=True)
    reg_time = db.Column(db.DateTime, nullable=False,
                         default=datetime.now)
    chats = db.relationship("Chat", secondary='user_chat',
                            lazy='subquery', back_populates="users")
    unread = db.relationship("Message", secondary='user_message',
                             lazy='subquery', back_populates="unreadby")

    def __repr__(self):
        return f"User('{self.username}', '{self.email}', '{self.image_file}')"


class Chat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    isGroup = db.Column(db.Boolean, default=False)
    name = db.Column(db.String(20))
    messages = db.relationship('Message', backref='chat', lazy=True)
    users = db.relationship("User", secondary='user_chat',
                            lazy='subquery', back_populates="chats")
    last_time = db.Column(db.DateTime, nullable=False,
                          default=datetime.now)


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    deleted = db.Column(db.Boolean, default=False, nullable=False)
    send_time = db.Column(db.DateTime, nullable=False,
                          default=datetime.now)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    chat_id = db.Column(db.Integer, db.ForeignKey('chat.id'), nullable=False)
    # reply_to = db.Column(db.Integer, db.ForeignKey('message.id'))
    unreadby = db.relationship("User", secondary='user_message',
                               lazy='subquery', back_populates="unread")


user_chat = db.Table(
    'user_chat',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('chat_id', db.Integer, db.ForeignKey('chat.id'))
)

user_message = db.Table(
    'user_message',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('msg_id', db.Integer, db.ForeignKey('message.id')),
)
