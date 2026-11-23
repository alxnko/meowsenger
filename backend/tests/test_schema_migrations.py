import os
import sqlite3
import tempfile
import unittest

from sqlalchemy import create_engine, inspect, text

from meowsenger.schema_migrations import (
    rollback_chat_schema_upgrade,
    run_chat_schema_upgrade,
)


class ChatSchemaMigrationTests(unittest.TestCase):
    def test_upgrade_and_rollback_chat_columns(self):
        fd, db_path = tempfile.mkstemp(suffix=".db")
        os.close(fd)
        try:
            connection = sqlite3.connect(db_path)
            cursor = connection.cursor()
            cursor.execute(
                """
                CREATE TABLE chat (
                    id INTEGER PRIMARY KEY,
                    is_group BOOLEAN,
                    name VARCHAR(20),
                    description TEXT,
                    is_verified BOOLEAN,
                    secret VARCHAR(64),
                    last_time DATETIME NOT NULL
                )
                """
            )
            cursor.execute("CREATE TABLE admin_chat (user_id INTEGER, chat_id INTEGER)")
            cursor.execute("CREATE TABLE user_chat (user_id INTEGER, chat_id INTEGER)")
            cursor.execute(
                """
                INSERT INTO chat (id, is_group, name, description, is_verified, secret, last_time)
                VALUES (1, 0, 'ch', 'desc', 0, 's', CURRENT_TIMESTAMP)
                """
            )
            cursor.execute("INSERT INTO admin_chat (user_id, chat_id) VALUES (11, 1)")
            connection.commit()
            connection.close()

            engine = create_engine(f"sqlite:///{db_path}")
            run_chat_schema_upgrade(engine)

            upgraded_columns = {col["name"] for col in inspect(engine).get_columns("chat")}
            self.assertIn("is_channel", upgraded_columns)
            self.assertIn("is_public", upgraded_columns)
            self.assertIn("owner_id", upgraded_columns)

            with engine.connect() as conn:
                owner = conn.execute(
                    text("SELECT owner_id FROM chat WHERE id = 1")
                )
                owner_id = owner.scalar_one()
                self.assertEqual(owner_id, 11)

            rollback_chat_schema_upgrade(engine)

            rolled_back_columns = {col["name"] for col in inspect(engine).get_columns("chat")}
            self.assertNotIn("is_channel", rolled_back_columns)
            self.assertNotIn("is_public", rolled_back_columns)
            self.assertNotIn("owner_id", rolled_back_columns)
        finally:
            if os.path.exists(db_path):
                os.remove(db_path)


if __name__ == "__main__":
    unittest.main()
