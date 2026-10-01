package com.opsflow.kafka.producer;

import com.opsflow.config.KafkaTopicConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuditEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publish(String action, String entityType, UUID entityId,
                        Object oldValue, Object newValue, UUID actorId, String ipAddress) {
        Map<String, Object> event = new HashMap<>();
        event.put("action", action);
        event.put("entityType", entityType);
        event.put("entityId", entityId != null ? entityId.toString() : null);
        event.put("oldValue", oldValue);
        event.put("newValue", newValue);
        event.put("actorId", actorId != null ? actorId.toString() : null);
        event.put("ipAddress", ipAddress);
        event.put("timestamp", Instant.now().toString());

        kafkaTemplate.send(KafkaTopicConfig.TOPIC_AUDIT_EVENTS,
                        entityId != null ? entityId.toString() : "global", event)
                .addCallback(
                        result -> log.debug("Audit event published: {}", action),
                        ex -> log.error("Failed to publish audit event: {}", ex.getMessage())
                );
    }
}
