# Build stage — use Java 21 (compatible with Java 11 bytecode)
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN sed -i 's/\r//' mvnw && chmod +x mvnw && ./mvnw dependency:go-offline -q
COPY src ./src
RUN ./mvnw package -DskipTests -q

# Runtime stage — lightweight Java 21 JRE
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
RUN addgroup -S opsflow && adduser -S opsflow -G opsflow
COPY --from=builder /app/target/*.jar app.jar
RUN chown opsflow:opsflow app.jar
USER opsflow
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
