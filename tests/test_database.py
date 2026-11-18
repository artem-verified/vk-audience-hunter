import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import database


class DatabaseTests(unittest.TestCase):
    def test_search_history_round_trip(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            test_db = Path(temp_dir) / "test.sqlite3"
            with patch.object(database, "DB_PATH", test_db):
                database.init_db()
                database.save_search(
                    "детская одежда",
                    2,
                    "demo",
                    [{"id": 1, "name": "Тестовое сообщество"}],
                )
                rows = database.get_recent_searches(5)

            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0]["query"], "детская одежда")
            self.assertEqual(rows[0]["total"], 2)
            self.assertEqual(rows[0]["mode"], "demo")
            self.assertTrue(rows[0]["created_at"])


if __name__ == "__main__":
    unittest.main()
