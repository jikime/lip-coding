#!/usr/bin/env python3
"""
테스트용 멘토와 멘티 계정을 생성하는 스크립트
"""

import sqlite3
import hashlib
from datetime import datetime

def hash_password(password: str) -> str:
    """main.py와 동일한 해싱 방법"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_test_accounts():
    """멘토와 멘티 테스트 계정 생성"""
    
    # 데이터베이스 연결
    conn = sqlite3.connect('mentor_mentee.db')
    cursor = conn.cursor()
    
    # 테스트 계정 데이터
    mentor_data = {
        'email': 'mentor@test.com',
        'password': 'mentor123',  # 평문 비밀번호
        'name': 'John Mentor',
        'role': 'mentor',
        'bio': 'Experienced software engineer with 10+ years in full-stack development. Passionate about helping junior developers grow their skills.'
    }
    
    mentee_data = {
        'email': 'mentee@test.com', 
        'password': 'mentee123',  # 평문 비밀번호
        'name': 'Jane Mentee',
        'role': 'mentee',
        'bio': 'Computer science student looking to learn web development and gain industry experience.'
    }
    
    try:
        # 기존 테스트 계정 삭제 (있다면)
        cursor.execute("DELETE FROM users WHERE email IN (?, ?)", 
                      (mentor_data['email'], mentee_data['email']))
        
        # 멘토 계정 생성
        mentor_password_hash = hash_password(mentor_data['password'])
        cursor.execute("""
            INSERT INTO users (email, password_hash, name, role, bio)
            VALUES (?, ?, ?, ?, ?)
        """, (
            mentor_data['email'],
            mentor_password_hash,
            mentor_data['name'],
            mentor_data['role'],
            mentor_data['bio']
        ))
        
        mentor_id = cursor.lastrowid
        print(f"✅ 멘토 계정 생성됨: {mentor_data['email']} (ID: {mentor_id})")
        
        # 멘토 프로필 추가 정보 생성
        cursor.execute("""
            INSERT INTO mentors (user_id, skills, experience_years, rating)
            VALUES (?, ?, ?, ?)
        """, (
            mentor_id,
            'Python,JavaScript,React,Node.js,FastAPI',
            10,
            4.8
        ))
        
        # 멘티 계정 생성
        mentee_password_hash = hash_password(mentee_data['password'])
        cursor.execute("""
            INSERT INTO users (email, password_hash, name, role, bio)
            VALUES (?, ?, ?, ?, ?)
        """, (
            mentee_data['email'],
            mentee_password_hash,
            mentee_data['name'],
            mentee_data['role'],
            mentee_data['bio']
        ))
        
        mentee_id = cursor.lastrowid
        print(f"✅ 멘티 계정 생성됨: {mentee_data['email']} (ID: {mentee_id})")
        
        # 멘티 프로필 추가 정보 생성
        cursor.execute("""
            INSERT INTO mentees (user_id, interests, goals)
            VALUES (?, ?, ?)
        """, (
            mentee_id,
            'Web Development,Python Programming,Career Guidance',
            'Learn full-stack development, Build portfolio projects, Get industry mentorship'
        ))
        
        # 변경사항 저장
        conn.commit()
        
        print("\n🎉 테스트 계정이 성공적으로 생성되었습니다!")
        print("\n로그인 정보:")
        print("=" * 50)
        print("멘토 계정:")
        print(f"  이메일: {mentor_data['email']}")
        print(f"  비밀번호: {mentor_data['password']}")
        print(f"  이름: {mentor_data['name']}")
        print("\n멘티 계정:")
        print(f"  이메일: {mentee_data['email']}")
        print(f"  비밀번호: {mentee_data['password']}")
        print(f"  이름: {mentee_data['name']}")
        print("=" * 50)
        
        # 생성된 계정 확인
        cursor.execute("SELECT id, email, name, role FROM users WHERE email IN (?, ?)",
                      (mentor_data['email'], mentee_data['email']))
        accounts = cursor.fetchall()
        
        print(f"\n데이터베이스 확인:")
        for account in accounts:
            print(f"  ID: {account[0]}, Email: {account[1]}, Name: {account[2]}, Role: {account[3]}")
            
    except sqlite3.Error as e:
        print(f"❌ 데이터베이스 오류: {e}")
        conn.rollback()
    except Exception as e:
        print(f"❌ 오류: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    create_test_accounts()