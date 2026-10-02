# Build stage — use Java 21 (compatible with Java 11 bytecode)
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
# Install Maven (avoids broken mvnw wrapper script)
RUN apk add --no-cache maven
COPY pom.xml ./
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

# Runtime stage — lightweight Java 21 JRE
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
RUN addgroup -S opsflow && adduser -S opsflow -G opsflow
COPY --from=builder /app/target/*.jar app.jar
RUN chown opsflow:opsflow app.jar
USER opsflow
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
