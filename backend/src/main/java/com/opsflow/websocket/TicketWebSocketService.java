package com.opsflow.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastTicketUpdate(UUID orgId, UUID projectId, String eventType, Object payload) {
        Map<String, Object> message = Map.of(
                "eventType", eventType,
                "projectId", projectId.toString(),
                "payload", payload
        );
        // Broadcast to all org members watching this project
        messagingTemplate.convertAndSend(
                "/topic/org/" + orgId + "/project/" + projectId + "/tickets",
                message
        );
    }
}
