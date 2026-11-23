from sqlalchemy import inspect, text


def _chat_columns(bind):
    inspector = inspect(bind)
    return {column["name"] for column in inspector.get_columns("chat")}


def run_chat_schema_upgrade(bind):
    inspector = inspect(bind)
    if "chat" not in inspector.get_table_names():
        return

    with bind.begin() as connection:
        columns = _chat_columns(bind)

        if "is_channel" not in columns:
            connection.execute(
                text("ALTER TABLE chat ADD COLUMN is_channel BOOLEAN NOT NULL DEFAULT 0")
            )

        if "is_public" not in columns:
            connection.execute(
                text("ALTER TABLE chat ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT 1")
            )

        if "owner_id" not in columns:
            connection.execute(
                text("ALTER TABLE chat ADD COLUMN owner_id INTEGER")
            )

        connection.execute(
            text(
                """
                UPDATE chat
                SET owner_id = (
                    SELECT ac.user_id
                    FROM admin_chat ac
                    WHERE ac.chat_id = chat.id
                    ORDER BY ac.user_id ASC
                    LIMIT 1
                )
                WHERE owner_id IS NULL
                """
            )
        )

        connection.execute(
            text(
                """
                INSERT INTO admin_chat (user_id, chat_id)
                SELECT chat.owner_id, chat.id
                FROM chat
                WHERE chat.owner_id IS NOT NULL
                  AND NOT EXISTS (
                    SELECT 1
                    FROM admin_chat ac
                    WHERE ac.user_id = chat.owner_id
                      AND ac.chat_id = chat.id
                  )
                """
            )
        )

        connection.execute(
            text(
                """
                INSERT INTO user_chat (user_id, chat_id)
                SELECT chat.owner_id, chat.id
                FROM chat
                WHERE chat.owner_id IS NOT NULL
                  AND NOT EXISTS (
                    SELECT 1
                    FROM user_chat uc
                    WHERE uc.user_id = chat.owner_id
                      AND uc.chat_id = chat.id
                  )
                """
            )
        )


def rollback_chat_schema_upgrade(bind):
    inspector = inspect(bind)
    if "chat" not in inspector.get_table_names():
        return

    columns = _chat_columns(bind)
    if not {"is_channel", "is_public", "owner_id"}.intersection(columns):
        return

    if bind.dialect.name == "sqlite":
        with bind.begin() as connection:
            connection.execute(text("PRAGMA foreign_keys=OFF"))
            connection.execute(
                text(
                    """
                    CREATE TABLE chat_backup (
                        id INTEGER NOT NULL PRIMARY KEY,
                        is_group BOOLEAN,
                        name VARCHAR(20),
                        description TEXT,
                        is_verified BOOLEAN,
                        secret VARCHAR(64),
                        last_time DATETIME NOT NULL
                    )
                    """
                )
            )
            connection.execute(
                text(
                    """
                    INSERT INTO chat_backup
                    (id, is_group, name, description, is_verified, secret, last_time)
                    SELECT id, is_group, name, description, is_verified, secret, last_time
                    FROM chat
                    """
                )
            )
            connection.execute(text("DROP TABLE chat"))
            connection.execute(text("ALTER TABLE chat_backup RENAME TO chat"))
            connection.execute(text("PRAGMA foreign_keys=ON"))
        return

    with bind.begin() as connection:
        for column_name in ("owner_id", "is_public", "is_channel"):
            if column_name in columns:
                connection.execute(text(f"ALTER TABLE chat DROP COLUMN {column_name}"))
