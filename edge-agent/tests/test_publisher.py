from edge_agent.publisher import MqttPublisher


def test_publish_envelope_no_client(monkeypatch):
    monkeypatch.setattr("edge_agent.publisher.mqtt", None)
    publisher = MqttPublisher("127.0.0.1", 1883, "smart-vms/events")
    publisher.publish_envelope(
        {
            "schema_version": "1.0",
            "event_id": "evt-1",
            "event_type": "detection.created",
            "occurred_at": "2026-05-28T12:00:00Z",
            "source": {"camera_id": "cam-a"},
            "payload": {},
        }
    )
