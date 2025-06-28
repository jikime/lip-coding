import pytest
import sqlite3
import sys
import os

# 백엔드 디렉토리를 sys.path에 추가합니다
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 데이터베이스 연결 테스트
def test_database_connection():
    try:
        conn = sqlite3.connect("mentor_mentee.db")
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        conn.close()
        assert len(tables) > 0, "데이터베이스에 테이블이 없습니다."
    except Exception as e:
        pytest.fail(f"데이터베이스 연결 실패: {str(e)}")

# 추가적인 테스트를 여기에 작성할 수 있습니다
# def test_user_authentication():
#     ...

# def test_match_request():
#     ...

if __name__ == "__main__":
    pytest.main(["-xvs", __file__])
