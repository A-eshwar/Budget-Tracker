# Build Stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first (cache them)
RUN mvn dependency:go-offline

COPY src ./src
# Build the application
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Render assigns a dynamic port via the PORT environment variable
ENV PORT=8081
EXPOSE $PORT

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
