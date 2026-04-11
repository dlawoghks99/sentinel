# 빌드 스테이지
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /app
COPY . .
RUN chmod +x gradlew && ./gradlew build -x test

# 실행 스테이지
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /app/build/libs/sentinel-backend-1.0.0.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]