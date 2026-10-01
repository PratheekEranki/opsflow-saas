package com.opsflow.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {
    public static final String TOPIC_AUDIT_EVENTS = "opsflow.audit.events";
    public static final String TOPIC_NOTIFICATIONS = "opsflow.notifications";
    public static final String TOPIC_TICKET_EVENTS = "opsflow.ticket.events";

    @Bean
    public NewTopic auditEventsTopic() {
        return TopicBuilder.name(TOPIC_AUDIT_EVENTS).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic notificationsTopic() {
        return TopicBuilder.name(TOPIC_NOTIFICATIONS).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic ticketEventsTopic() {
        return TopicBuilder.name(TOPIC_TICKET_EVENTS).partitions(3).replicas(1).build();
    }
}
