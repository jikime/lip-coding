from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import uvicorn
import jwt
import hashlib
import sqlite3
import json
from datetime import datetime, timedelta
from typing import Optional, List
import secrets
import base64
from pydantic import BaseModel, EmailStr

# JWT 설정
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 1

app = FastAPI(
    title="Mentor-Mentee Matching API",
    description="멘토-멘티 매칭 서비스 API",
    version="1.0.0",
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # 프론트엔드 서버
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

security = HTTPBearer()


# 데이터베이스 초기화
def init_db():
    conn = sqlite3.connect("mentor_mentee.db")
    cursor = conn.cursor()

    # Users 테이블
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT,
            role TEXT CHECK(role IN ('mentor', 'mentee')) NOT NULL,
            bio TEXT,
            profile_image BLOB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """
    )

    # Mentors 테이블
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS mentors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            skills TEXT,
            experience_years INTEGER DEFAULT 0,
            rating REAL DEFAULT 0.0,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """
    )

    # Mentees 테이블
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS mentees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            interests TEXT,
            goals TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """
    )

    # Match Requests 테이블
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS match_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mentor_id INTEGER,
            mentee_id INTEGER,
            message TEXT,
            status TEXT CHECK(status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (mentor_id) REFERENCES mentors (id),
            FOREIGN KEY (mentee_id) REFERENCES mentees (id)
        )
    """
    )

    conn.commit()
    conn.close()


# Pydantic 모델들
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    experience_years: Optional[int] = None
    interests: Optional[str] = None
    goals: Optional[str] = None


class MatchRequestCreate(BaseModel):
    mentorId: int
    menteeId: int
    message: str  # 유틸리티 함수들


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)

    # RFC 7519 클레임 추가
    to_encode.update(
        {
            "iss": "mentor-mentee-app",  # issuer
            "sub": str(data.get("user_id")),  # subject
            "aud": "mentor-mentee-frontend",  # audience
            "exp": expire,  # expiration time
            "nbf": datetime.utcnow(),  # not before
            "iat": datetime.utcnow(),  # issued at
            "jti": secrets.token_hex(16),  # JWT ID
        }
    )

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"verify_aud": False},  # audience 검증 비활성화
        )
        user_id: int = int(payload.get("sub"))
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_db():
    conn = sqlite3.connect("mentor_mentee.db")
    conn.row_factory = sqlite3.Row
    return conn


# API 엔드포인트들
@app.on_event("startup")
async def startup_event():
    init_db()


@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <html>
        <head>
            <title>Mentor-Mentee API</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                h1 {
                    color: #2c3e50;
                    border-bottom: 2px solid #3498db;
                    padding-bottom: 10px;
                }
                h2 {
                    color: #3498db;
                }
                .endpoint {
                    background-color: #f8f9fa;
                    border-left: 4px solid #3498db;
                    padding: 10px;
                    margin: 10px 0;
                }
                .docs-links {
                    display: flex;
                    gap: 20px;
                    margin-top: 20px;
                }
                .docs-links a {
                    background-color: #3498db;
                    color: white;
                    padding: 10px 15px;
                    text-decoration: none;
                    border-radius: 4px;
                }
                .docs-links a:hover {
                    background-color: #2980b9;
                }
            </style>
        </head>
        <body>
            <h1>멘토-멘티 매칭 API</h1>
            <p>이 API는 멘토와 멘티 간의 매칭을 지원하기 위한 서비스를 제공합니다.</p>
            
            <h2>주요 엔드포인트</h2>
            <div class="endpoint">
                <strong>POST /api/signup</strong> - 새 사용자 등록 (멘토 또는 멘티)
            </div>
            <div class="endpoint">
                <strong>POST /api/login</strong> - 사용자 로그인 및 JWT 토큰 발급
            </div>
            <div class="endpoint">
                <strong>GET /api/me</strong> - 현재 인증된 사용자 정보 조회
            </div>
            <div class="endpoint">
                <strong>GET /api/mentors</strong> - 멘토 목록 조회
            </div>
            <div class="endpoint">
                <strong>POST /api/match-requests</strong> - 매칭 요청 생성
            </div>
            
            <h2>API 문서</h2>
            <div class="docs-links">
                <a href="/docs">Swagger UI</a>
                <a href="/redoc">ReDoc</a>
                <a href="/openapi.json">OpenAPI JSON</a>
            </div>
            
            <h2>서버 상태</h2>
            <p>✅ 데이터베이스 연결됨</p>
            <p>✅ API 서비스 실행 중</p>
        </body>
    </html>
    """


@app.post("/api/signup", status_code=201)
async def signup(user: UserCreate):
    conn = get_db()
    cursor = conn.cursor()

    # 이메일 중복 확인
    cursor.execute("SELECT id FROM users WHERE email = ?", (user.email,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Email already registered")

    # 사용자 생성
    password_hash = hash_password(user.password)
    cursor.execute(
        "INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)",
        (user.email, password_hash, user.name, user.role),
    )
    user_id = cursor.lastrowid

    # 역할별 프로필 생성
    if user.role == "mentor":
        cursor.execute("INSERT INTO mentors (user_id) VALUES (?)", (user_id,))
    else:
        cursor.execute("INSERT INTO mentees (user_id) VALUES (?)", (user_id,))

    conn.commit()
    conn.close()

    return {"message": "User created successfully"}


@app.post("/api/login")
async def login(user: UserLogin):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id, password_hash, name, role FROM users WHERE email = ?", (user.email,)
    )
    db_user = cursor.fetchone()

    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        {
            "user_id": db_user["id"],
            "email": user.email,
            "name": db_user["name"],
            "role": db_user["role"],
        }
    )

    conn.close()
    return {"token": access_token}


@app.get("/api/me")
async def get_current_user(current_user_id: int = Depends(verify_token)):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT u.id, u.email, u.name, u.role, u.bio, u.profile_image,
               m.skills, m.experience_years, m.rating,
               me.interests, me.goals
        FROM users u
        LEFT JOIN mentors m ON u.id = m.user_id
        LEFT JOIN mentees me ON u.id = me.user_id
        WHERE u.id = ?
    """,
        (current_user_id,),
    )

    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    conn.close()

    profile_image_url = f"/images/{user['role']}/{user['id']}"

    if user["role"] == "mentor":
        return {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "profile": {
                "name": user["name"],
                "bio": user["bio"],
                "imageUrl": profile_image_url,
                "skills": user["skills"].split(",") if user["skills"] else [],
            },
        }
    else:
        return {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "profile": {
                "name": user["name"],
                "bio": user["bio"],
                "imageUrl": profile_image_url,
            },
        }


@app.get("/api/mentors")
async def get_mentors(
    skill: Optional[str] = None,
    order_by: Optional[str] = None,
    current_user_id: int = Depends(verify_token),
):
    conn = get_db()
    cursor = conn.cursor()

    # 멘티 권한 확인
    cursor.execute("SELECT role FROM users WHERE id = ?", (current_user_id,))
    user = cursor.fetchone()
    if not user or user["role"] != "mentee":
        raise HTTPException(
            status_code=401, detail="Only mentees can access mentor list"
        )

    query = """
        SELECT u.id, u.name, u.email, u.bio, m.skills, m.experience_years, m.rating
        FROM users u
        JOIN mentors m ON u.id = m.user_id
        WHERE u.role = 'mentor'
    """
    params = []

    if skill:
        query += " AND m.skills LIKE ?"
        params.append(f"%{skill}%")

    if order_by == "skill":
        query += " ORDER BY m.skills ASC"
    elif order_by == "name":
        query += " ORDER BY u.name ASC"
    else:
        query += " ORDER BY u.id ASC"

    cursor.execute(query, params)
    mentors = cursor.fetchall()

    conn.close()

    return [
        {
            "id": mentor["id"],
            "email": mentor["email"],
            "role": "mentor",
            "profile": {
                "name": mentor["name"],
                "bio": mentor["bio"],
                "imageUrl": f"/images/mentor/{mentor['id']}",
                "skills": mentor["skills"].split(",") if mentor["skills"] else [],
            },
        }
        for mentor in mentors
    ]


@app.post("/api/match-requests")
async def create_match_request(
    request: MatchRequestCreate, current_user_id: int = Depends(verify_token)
):
    conn = get_db()
    cursor = conn.cursor()

    # 멘티 확인
    cursor.execute("SELECT id FROM mentees WHERE user_id = ?", (current_user_id,))
    mentee = cursor.fetchone()
    if not mentee:
        raise HTTPException(status_code=401, detail="Only mentees can create requests")

    # 중복 요청 확인 (pending 상태인 요청이 있는지 확인)
    cursor.execute(
        """
        SELECT id FROM match_requests 
        WHERE mentee_id = ? AND status = 'pending'
    """,
        (mentee["id"],),
    )
    if cursor.fetchone():
        raise HTTPException(
            status_code=400, detail="You already have a pending request"
        )

    # 멘토 확인
    cursor.execute("SELECT id FROM mentors WHERE user_id = ?", (request.mentorId,))
    mentor = cursor.fetchone()
    if not mentor:
        raise HTTPException(status_code=400, detail="Mentor not found")

    # 요청 생성
    cursor.execute(
        """
        INSERT INTO match_requests (mentor_id, mentee_id, message)
        VALUES (?, ?, ?)
    """,
        (mentor["id"], mentee["id"], request.message),
    )

    request_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "id": request_id,
        "mentorId": request.mentorId,
        "menteeId": request.menteeId,
        "message": request.message,
        "status": "pending",
    }


@app.get("/api/match-requests/received/{user_id}")
async def get_received_requests(
    user_id: int, current_user_id: int = Depends(verify_token)
):
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT mr.id, mr.message, mr.status, mr.created_at,
               mu.name as mentee_name, mu.email as mentee_email,
               me.interests
        FROM match_requests mr
        JOIN mentors m ON mr.mentor_id = m.id
        JOIN mentees me ON mr.mentee_id = me.id
        JOIN users mu ON me.user_id = mu.id
        WHERE m.user_id = ?
        ORDER BY mr.created_at DESC
    """,
        (user_id,),
    )

    requests = cursor.fetchall()
    conn.close()

    return [
        {
            "id": req["id"],
            "message": req["message"],
            "status": req["status"],
            "created_at": req["created_at"],
            "mentee": {
                "user": {"name": req["mentee_name"], "email": req["mentee_email"]},
                "interests": req["interests"],
            },
        }
        for req in requests
    ]


@app.get("/api/match-requests/sent/{user_id}")
async def get_sent_requests(user_id: int, current_user_id: int = Depends(verify_token)):
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT mr.id, mr.message, mr.status, mr.created_at,
               mu.name as mentor_name, mu.email as mentor_email,
               m.skills, m.experience_years
        FROM match_requests mr
        JOIN mentees me ON mr.mentee_id = me.id
        JOIN mentors m ON mr.mentor_id = m.id
        JOIN users mu ON m.user_id = mu.id
        WHERE me.user_id = ?
        ORDER BY mr.created_at DESC
    """,
        (user_id,),
    )

    requests = cursor.fetchall()
    conn.close()

    return [
        {
            "id": req["id"],
            "message": req["message"],
            "status": req["status"],
            "created_at": req["created_at"],
            "mentor": {
                "user": {"name": req["mentor_name"], "email": req["mentor_email"]},
                "skills": req["skills"],
                "experience_years": req["experience_years"],
            },
        }
        for req in requests
    ]


# 이 함수는 이제 사용하지 않음, accept와 reject로 대체됨
@app.put("/api/match-requests/{request_id}/status")
async def update_request_status(
    request_id: int, status: str, current_user_id: int = Depends(verify_token)
):
    if status not in ["accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    conn = get_db()
    cursor = conn.cursor()

    # 요청 확인 및 멘토 권한 확인
    cursor.execute(
        """
        SELECT mr.id, m.user_id
        FROM match_requests mr
        JOIN mentors m ON mr.mentor_id = m.id
        WHERE mr.id = ?
    """,
        (request_id,),
    )

    request_data = cursor.fetchone()
    if not request_data:
        raise HTTPException(status_code=404, detail="Request not found")

    if request_data["user_id"] != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # 상태 업데이트
    cursor.execute(
        """
        UPDATE match_requests SET status = ? WHERE id = ?
    """,
        (status, request_id),
    )

    conn.commit()
    conn.close()

    return {"message": f"Request {status} successfully"}


@app.get("/images/{role}/{user_id}")
async def get_profile_image(
    role: str, user_id: int, current_user_id: int = Depends(verify_token)
):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT profile_image FROM users WHERE id = ? AND role = ?", (user_id, role)
    )
    user = cursor.fetchone()

    if not user:
        # 기본 이미지 반환
        if role == "mentor":
            return {"url": "https://placehold.co/500x500.jpg?text=MENTOR"}
        else:
            return {"url": "https://placehold.co/500x500.jpg?text=MENTEE"}

    if user["profile_image"]:
        return {
            "url": f"data:image/jpeg;base64,{base64.b64encode(user['profile_image']).decode()}"
        }
    else:
        # 기본 이미지 반환
        if role == "mentor":
            return {"url": "https://placehold.co/500x500.jpg?text=MENTOR"}
        else:
            return {"url": "https://placehold.co/500x500.jpg?text=MENTEE"}


@app.put("/api/profile")
async def update_profile(
    profile_data: dict, current_user_id: int = Depends(verify_token)
):
    conn = get_db()
    cursor = conn.cursor()

    # 사용자 확인
    cursor.execute("SELECT role FROM users WHERE id = ?", (current_user_id,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 기본 정보 업데이트
    cursor.execute(
        """
        UPDATE users SET name = ?, bio = ? WHERE id = ?
    """,
        (profile_data.get("name"), profile_data.get("bio"), current_user_id),
    )

    # 이미지 업데이트 (있는 경우)
    if "image" in profile_data and profile_data["image"]:
        try:
            image_data = base64.b64decode(profile_data["image"])
            cursor.execute(
                "UPDATE users SET profile_image = ? WHERE id = ?",
                (image_data, current_user_id),
            )
        except:
            pass

    # 역할별 정보 업데이트
    if user["role"] == "mentor" and "skills" in profile_data:
        skills_str = (
            ",".join(profile_data["skills"])
            if isinstance(profile_data["skills"], list)
            else profile_data["skills"]
        )
        cursor.execute(
            "UPDATE mentors SET skills = ? WHERE user_id = ?",
            (skills_str, current_user_id),
        )

    conn.commit()
    conn.close()

    # 업데이트된 정보 반환
    return await get_current_user(current_user_id)


@app.get("/api/match-requests/incoming")
async def get_incoming_requests(current_user_id: int = Depends(verify_token)):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT mr.id, mr.message, mr.status, mr.created_at,
               m.id as mentor_id, me.id as mentee_id
        FROM match_requests mr
        JOIN mentors m ON mr.mentor_id = m.id
        JOIN mentees me ON mr.mentee_id = me.id
        WHERE m.user_id = ?
        ORDER BY mr.created_at DESC
    """,
        (current_user_id,),
    )

    requests = cursor.fetchall()
    conn.close()

    return [
        {
            "id": req["id"],
            "mentorId": req["mentor_id"],
            "menteeId": req["mentee_id"],
            "message": req["message"],
            "status": req["status"],
        }
        for req in requests
    ]


@app.get("/api/match-requests/outgoing")
async def get_outgoing_requests(current_user_id: int = Depends(verify_token)):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT mr.id, mr.message, mr.status, mr.created_at,
               m.id as mentor_id, me.id as mentee_id
        FROM match_requests mr
        JOIN mentees me ON mr.mentee_id = me.id
        JOIN mentors m ON mr.mentor_id = m.id
        WHERE me.user_id = ?
        ORDER BY mr.created_at DESC
    """,
        (current_user_id,),
    )

    requests = cursor.fetchall()
    conn.close()

    return [
        {
            "id": req["id"],
            "mentorId": req["mentor_id"],
            "menteeId": req["mentee_id"],
            "status": req["status"],
        }
        for req in requests
    ]


@app.put("/api/match-requests/{request_id}/accept")
async def accept_request(request_id: int, current_user_id: int = Depends(verify_token)):
    conn = get_db()
    cursor = conn.cursor()

    # 요청 확인 및 멘토 권한 확인
    cursor.execute(
        """
        SELECT mr.id, mr.message, m.id as mentor_id, me.id as mentee_id, m.user_id
        FROM match_requests mr
        JOIN mentors m ON mr.mentor_id = m.id
        JOIN mentees me ON mr.mentee_id = me.id
        WHERE mr.id = ?
    """,
        (request_id,),
    )

    request_data = cursor.fetchone()
    if not request_data:
        raise HTTPException(status_code=404, detail="Request not found")

    if request_data["user_id"] != current_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # 상태 업데이트
    cursor.execute(
        "UPDATE match_requests SET status = 'accepted' WHERE id = ?", (request_id,)
    )
    conn.commit()
    conn.close()

    return {
        "id": request_data["id"],
        "mentorId": request_data["mentor_id"],
        "menteeId": request_data["mentee_id"],
        "message": request_data["message"],
        "status": "accepted",
    }


@app.put("/api/match-requests/{request_id}/reject")
async def reject_request(request_id: int, current_user_id: int = Depends(verify_token)):
    conn = get_db()
    cursor = conn.cursor()

    # 요청 확인 및 멘토 권한 확인
    cursor.execute(
        """
        SELECT mr.id, mr.message, m.id as mentor_id, me.id as mentee_id, m.user_id
        FROM match_requests mr
        JOIN mentors m ON mr.mentor_id = m.id
        JOIN mentees me ON mr.mentee_id = me.id
        WHERE mr.id = ?
    """,
        (request_id,),
    )

    request_data = cursor.fetchone()
    if not request_data:
        raise HTTPException(status_code=404, detail="Request not found")

    if request_data["user_id"] != current_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # 상태 업데이트
    cursor.execute(
        "UPDATE match_requests SET status = 'rejected' WHERE id = ?", (request_id,)
    )
    conn.commit()
    conn.close()

    return {
        "id": request_data["id"],
        "mentorId": request_data["mentor_id"],
        "menteeId": request_data["mentee_id"],
        "message": request_data["message"],
        "status": "rejected",
    }


@app.delete("/api/match-requests/{request_id}")
async def delete_request(request_id: int, current_user_id: int = Depends(verify_token)):
    conn = get_db()
    cursor = conn.cursor()

    # 요청 확인 및 멘티 권한 확인
    cursor.execute(
        """
        SELECT mr.id, mr.message, m.id as mentor_id, me.id as mentee_id, me.user_id
        FROM match_requests mr
        JOIN mentors m ON mr.mentor_id = m.id
        JOIN mentees me ON mr.mentee_id = me.id
        WHERE mr.id = ?
    """,
        (request_id,),
    )

    request_data = cursor.fetchone()
    if not request_data:
        raise HTTPException(status_code=404, detail="Request not found")

    if request_data["user_id"] != current_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # 상태 업데이트
    cursor.execute(
        "UPDATE match_requests SET status = 'cancelled' WHERE id = ?", (request_id,)
    )
    conn.commit()
    conn.close()

    return {
        "id": request_data["id"],
        "mentorId": request_data["mentor_id"],
        "menteeId": request_data["mentee_id"],
        "message": request_data["message"],
        "status": "cancelled",
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
