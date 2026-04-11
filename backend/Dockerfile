FROM openjdk:21-jdk-slim
WORKDIR /app
COPY build/libs/sentinel-backend-1.0.0.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
