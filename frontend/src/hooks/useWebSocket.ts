import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuthStore } from '../store/authStore'

interface UseWebSocketOptions {
  onTicketUpdate?: (data: unknown) => void
  onNotification?: (data: unknown) => void
  projectId?: string
}

export function useWebSocket({ onTicketUpdate, onNotification, projectId }: UseWebSocketOptions) {
  const clientRef = useRef<Client | null>(null)
  const { accessToken, user, organization } = useAuthStore()

  const connect = useCallback(() => {
    if (!accessToken || !user || !organization) return

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: { Authorization: `Bearer ${accessToken}` },
      reconnectDelay: 5000,
      onConnect: () => {
        // Subscribe to personal notifications
        client.subscribe(`/user/${user.id}/queue/notifications`, (msg) => {
          onNotification?.(JSON.parse(msg.body))
        })

        // Subscribe to project ticket updates
        if (projectId && organization.id) {
          client.subscribe(
            `/topic/org/${organization.id}/project/${projectId}/tickets`,
            (msg) => onTicketUpdate?.(JSON.parse(msg.body))
          )
        }
      },
      onStompError: (frame) => console.error('WebSocket error:', frame),
    })

    client.activate()
    clientRef.current = client
  }, [accessToken, user, organization, projectId, onTicketUpdate, onNotification])

  useEffect(() => {
    connect()
    return () => { clientRef.current?.deactivate() }
  }, [connect])
}
