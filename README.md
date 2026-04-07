# 🛡 Sentinel

> 서비스 로그 기반 장애 감지 및 성능 모니터링 시스템

---

## 🎯 프로젝트 배경

Jennifer, WaTap 같은 상용 APM 툴은 강력하지만 비용이 발생함.
비용 부담 없이 사용 가능한 나만의 모니터링 시스템을 직접 구축하고,
대용량 로그 처리 및 장애 감지 시스템 설계 경험을 쌓는 것을 목표로 시작

---

## 🛠 Tech Stack

### Backend
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Spring Data JPA](https://img.shields.io/badge/Spring_Data_JPA-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Java](https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### Planned
![Kafka](https://img.shields.io/badge/Apache_Kafka-231F20?style=for-the-badge&logo=apachekafka&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-FF4438?style=for-the-badge&logo=redis&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonwebservices&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 🔑 주요 기능

| 기능 | 설명 |
|------|------|
| 로그 수집 | POST /api/logs, LogEvent 엔티티 저장 |
| 전체 로그 조회 | Pageable 적용, createdAt 기준 내림차순 정렬 |
| 에러 로그 조회 | level = ERROR 필터링, 서비스명 / 키워드 / 날짜 조건 |
| 느린 로그 조회 | responseTimeMs 임계값 기준 조회 |
| 통계 조회 | 전체 수, 에러 수, 평균 응답시간 집계 |

---

## 🏗 시스템 구조
```
현재
Client (React) → Backend (Spring Boot) → Database (PostgreSQL)

목표
Client (React) → Backend (Spring Boot) → Kafka → Consumer → DB
                                                         ↓
                                                   Cache (Redis)
```
---
## 📈 개발 단계

| 단계 | 내용 | 상태 |
|------|------|------|
| 1단계 | 로그 수집 / 조회 / 에러·느린 로그 분류 / 필터링 / 페이징 / 대시보드 UI | 🔥 진행중 |
| 2단계 | 서버 사이드 페이징 / DB 인덱스 / 쿼리 최적화 / N+1 방지 | 🔥 진행중 |
| 3단계 | API 구조 정리 / DTO 분리 / Service 계층 분리 | ⬜ 예정 |
| 4단계 | Kafka 도입 / 로그 저장 비동기화 | ⬜ 예정 |
| 5단계 | Redis 캐싱 | ⬜ 예정 |
| 6단계 | 실시간 차트 / 에러율 그래프 / 알림 | ⬜ 예정 |
| 7단계 | AWS EC2 / RDS / Docker 배포 | ⬜ 예정 |

---

## 📁 프로젝트 구조
```
sentinel/
├─ backend/   # Spring Boot
└─ frontend/  # React (Vite)
```

---

## 👨‍💻 개발자

- Lim JeaHwan