from edge_agent.events import (
    envelope_from_vapix,
    parse_axis_event_payload,
    stable_event_id,
    vapix_event_key,
)


def test_parse_axis_event_xml():
    xml = """
    <event>
      <topic>tns1:RuleEngine/Motion</topic>
      <utcTime>2026-05-28T12:00:00Z</utcTime>
    </event>
    """
    events = parse_axis_event_payload(xml)
    assert len(events) == 1
    assert "motion" in events[0].title.lower()


def test_stable_event_id_is_deterministic():
    key = vapix_event_key("cam-a", "motion", "2026-05-28T12:00:00Z")
    assert stable_event_id(key) == stable_event_id(key)


def test_envelope_from_vapix():
    event = parse_axis_event_payload(
        "<event><topic>vehicle</topic><utcTime>2026-05-28T12:00:00Z</utcTime></event>"
    )[0]
    envelope = envelope_from_vapix(event, "cam-a", "Driveway", "edge-1")
    assert envelope["event_type"] == "vapix.received"
    assert envelope["source"]["camera_id"] == "cam-a"
    assert envelope["payload"]["camera_name"] == "Driveway"
