from __future__ import annotations

import argparse
import logging
from pathlib import Path

import yaml

from edge_agent.agent import EdgeAgent

LOG = logging.getLogger(__name__)


def main() -> None:
    parser = argparse.ArgumentParser(prog="smart-vms-edge")
    parser.add_argument("--config", required=True, help="Path to config.yaml")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")

    config_path = Path(args.config)
    raw = yaml.safe_load(config_path.read_text(encoding="utf-8"))
    agent = EdgeAgent(raw)
    agent.run()


if __name__ == "__main__":
    main()
