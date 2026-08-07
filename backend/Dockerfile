# Build Stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first (cache layer)
RUN mvn dependency:go-offline

COPY src ./src
# Build the application, skip tests during Docker build
RUN mvn clean package -DskipTests

# Run Stage — use slim JRE image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Render assigns a dynamic port via the PORT environment variable
# Spring Boot reads server.port from this env var
EXPOSE 8081

# Pass PORT env var to Spring Boot so it listens on the correct port
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8081}"]
