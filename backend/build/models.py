from datetime import datetime, timedelta
from meowsenger import db, login_manager
from flask_login import UserMixin
import secrets


@login_manager.user_loader
def load_user(user_id):
    try:
        msgs = Message.query.filter(
            Message.send_time <= datetime.now() - timedelta(days=14))
        for msg in msgs:
            db.session.delete(msg)
        msgs = Message.query.filter(
            Message.is_deleted == True,
            Message.send_time <= datetime.now() - timedelta(days=1))
        for msg in msgs:
            db.session.delete(msg)
        upds = Update.query.filter(
            Update.time <= datetime.now() - timedelta(hours=2))
        for upd in upds:
            db.session.delete(upd)
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
    description = db.Column(db.String(20), default="default")
    image_file = db.Column(db.String(20), nullable=False, default='default')
    rank = db.Column(db.String(20))
    is_tester = db.Column(db.Boolean, default=False)
    is_verified = db.Column(db.Boolean, default=False)
    is_admin = db.Column(db.Boolean, default=False)
    password = db.Column(db.String(60), nullable=False)
    messages = db.relationship('Message', backref='author', lazy=True)
    reg_time = db.Column(db.DateTime, nullable=False, default=datetime.now)
    chats = db.relationship("Chat", secondary='user_chat',
                            lazy='subquery', back_populates="users")
    manage = db.relationship("Chat", secondary='admin_chat',
                             lazy='subquery', back_populates="admins")
    unread = db.relationship("Message", secondary='user_message',
                             lazy='subquery', back_populates="unread_by")

    def __repr__(self):
        return f"User('{self.username}', '{self.email}', '{self.image_file}')"


class Chat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    is_group = db.Column(db.Boolean, default=False)
    name = db.Column(db.String(20))
    messages = db.relationship('Message', backref='chat', lazy=True)
    updates = db.relationship('Update', backref='chat', lazy=True)
    description = db.Column(db.Text, default="meowsenger group")
    users = db.relationship("User", secondary='user_chat',
                            lazy='subquery', back_populates="chats")
    admins = db.relationship("User", secondary='admin_chat',
                             lazy='subquery', back_populates="manage")
    is_verified = db.Column(db.Boolean, default=False)
    secret = db.Column(db.String(64), default=secrets.token_hex(16))
    last_time = db.Column(db.DateTime, nullable=False, default=datetime.now)


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    is_deleted = db.Column(db.Boolean, default=False)
    is_edited = db.Column(db.Boolean, default=False)
    is_system = db.Column(db.Boolean, default=False)
    send_time = db.Column(db.DateTime, nullable=False, default=datetime.now)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    chat_id = db.Column(db.Integer, db.ForeignKey('chat.id'), nullable=False)
    reply_to = db.Column(db.Integer, db.ForeignKey('message.id'))
    is_forwarded = db.Column(db.Boolean, default=False)
    unread_by = db.relationship("User", secondary='user_message',
                                lazy='subquery', back_populates="unread")


class Update(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.Integer, db.ForeignKey('chat.id'), nullable=False)
    message_id = db.Column(db.Integer, db.ForeignKey(
        'message.id'), nullable=False)
    time = db.Column(db.DateTime, nullable=False, default=datetime.now)


user_chat = db.Table(
    'user_chat',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('chat_id', db.Integer, db.ForeignKey('chat.id'))
)

admin_chat = db.Table(
    'admin_chat',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('chat_id', db.Integer, db.ForeignKey('chat.id'))
)

user_message = db.Table(
    'user_message',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('msg_id', db.Integer, db.ForeignKey('message.id')),
)
