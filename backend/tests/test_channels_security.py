import os
import unittest

os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ.setdefault("SQLALCHEMY_DATABASE_URI", "sqlite:////tmp/meowsenger_test.db")

from meowsenger import bcrypt, create_app, db
from meowsenger.models import Chat, User


class ChannelSecurityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.app.config.update(TESTING=True)
        cls.client = cls.app.test_client()

    def setUp(self):
        with self.app.app_context():
            db.drop_all()
            db.create_all()

    def _create_user(self, username):
        with self.app.app_context():
            hashed_password = bcrypt.generate_password_hash("password123").decode("utf-8")
            user = User(username=username)
            user.password = hashed_password
            db.session.add(user)
            db.session.commit()
            return user.id

    def _login(self, username):
        response = self.client.post(
            "/api/u/login",
            json={"username": username, "password": "password123"},
        )
        self.assertEqual(response.status_code, 200)

    def _logout(self):
        self.client.get("/api/u/logout")

    def test_private_channel_rejects_guessed_id_without_secret(self):
        owner_id = self._create_user("owner")
        outsider_id = self._create_user("outsider")

        with self.app.app_context():
            owner = User.query.get(owner_id)
            outsider = User.query.get(outsider_id)
            channel = Chat(
                name="private",
                is_channel=True,
                is_public=False,
                owner_id=owner.id,
                secret="private-secret",
            )
            channel.users.append(owner)
            channel.admins.append(owner)
            db.session.add(channel)
            db.session.commit()
            channel_id = channel.id
            self.assertNotIn(outsider, channel.users)

        self._login("outsider")
        join_response = self.client.post("/api/ch/join", json={"id": channel_id})
        self.assertEqual(join_response.status_code, 403)
        self.assertFalse(join_response.get_json()["status"])

        read_response = self.client.post("/api/ch/get", json={"from": channel_id})
        self.assertEqual(read_response.status_code, 200)
        self.assertEqual(read_response.get_json()["reason"], "not subscribed")
        self._logout()

    def test_owner_cannot_leave_channel(self):
        owner_id = self._create_user("owner2")

        with self.app.app_context():
            owner = User.query.get(owner_id)
            channel = Chat(
                name="owned",
                is_channel=True,
                is_public=True,
                owner_id=owner.id,
            )
            channel.users.append(owner)
            channel.admins.append(owner)
            db.session.add(channel)
            db.session.commit()
            channel_id = channel.id

        self._login("owner2")
        leave_response = self.client.post("/api/ch/leave", json={"from": channel_id})
        self.assertEqual(leave_response.status_code, 200)
        payload = leave_response.get_json()
        self.assertFalse(payload["status"])
        self.assertEqual(payload["reason"], "transfer owner first")
        self._logout()


if __name__ == "__main__":
    unittest.main()
