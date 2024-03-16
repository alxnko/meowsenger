from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_migrate import Migrate
from meowsenger.config import Config

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
login_manager = LoginManager()
login_manager.login_view = 'users.login'
login_manager.login_message_category = 'info'


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    from meowsenger.chats.routes import chats
    from meowsenger.users.routes import users
    from meowsenger.messages.routes import messages

    app.register_blueprint(chats)
    app.register_blueprint(users)
    app.register_blueprint(messages)

    with app.app_context():
        db.create_all()

    return app
