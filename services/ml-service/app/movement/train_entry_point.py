#!/usr/bin/env python3
"""Documented, runnable training entry point for tcn_model.py/stgcn_model.py.

No trained checkpoint exists anywhere in this repository, and this script has
never been run against real labeled movement data (this sandbox has none) -
it exists so the training code PATH is real and reviewable, not so a
checkpoint can currently be produced. Running it against a real dataset is a
Phase 4+ activity (requires labeled clinical movement data).

Usage:
    python3 -m app.movement.train_entry_point --dataset-path /path/to/labeled_windows.jsonl \
        --model tcn --epochs 10 --checkpoint-out /path/to/checkpoint.pt

Expected dataset format (JSON Lines), one labeled window per line:
    {"features": [[...NUM_CHANNELS floats...], ...T rows...], "label": "descend"}
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import torch
from torch import nn
from torch.utils.data import DataLoader, Dataset

from app.movement.joint_graph import NUM_CHANNELS
from app.movement.movement_window_service import PHASE_LABELS
from app.movement.stgcn_model import STGCNPhaseClassifier
from app.movement.tcn_model import TCNPhaseClassifier


class LabeledWindowDataset(Dataset):
    def __init__(self, dataset_path: Path) -> None:
        self.rows: list[dict] = []
        with dataset_path.open() as f:
            for line in f:
                line = line.strip()
                if line:
                    self.rows.append(json.loads(line))

    def __len__(self) -> int:
        return len(self.rows)

    def __getitem__(self, index: int) -> tuple[torch.Tensor, int]:
        row = self.rows[index]
        features = torch.tensor(row["features"], dtype=torch.float32).transpose(0, 1)  # [NUM_CHANNELS, T]
        label = PHASE_LABELS.index(row["label"])
        return features, label


def build_model(name: str) -> nn.Module:
    if name == "tcn":
        return TCNPhaseClassifier(num_classes=len(PHASE_LABELS), num_channels=NUM_CHANNELS)
    if name == "st-gcn":
        return STGCNPhaseClassifier(num_classes=len(PHASE_LABELS), num_channels=NUM_CHANNELS)
    raise ValueError(f"Unknown model '{name}' - expected 'tcn' or 'st-gcn'.")


def train(dataset_path: Path, model_name: str, epochs: int, checkpoint_out: Path, batch_size: int = 8) -> None:
    dataset = LabeledWindowDataset(dataset_path)
    if len(dataset) == 0:
        raise ValueError(f"No labeled windows found in {dataset_path}")

    loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
    model = build_model(model_name)
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    loss_fn = nn.CrossEntropyLoss()

    model.train()
    for epoch in range(epochs):
        total_loss = 0.0
        for features, labels in loader:
            optimizer.zero_grad()
            logits = model(features)
            loss = loss_fn(logits, labels)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        print(f"epoch {epoch + 1}/{epochs}: loss={total_loss / len(loader):.4f}")

    checkpoint_out.parent.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), checkpoint_out)
    print(f"Saved checkpoint to {checkpoint_out}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset-path", type=Path, required=True)
    parser.add_argument("--model", choices=["tcn", "st-gcn"], default="tcn")
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--checkpoint-out", type=Path, required=True)
    parser.add_argument("--batch-size", type=int, default=8)
    args = parser.parse_args()

    train(args.dataset_path, args.model, args.epochs, args.checkpoint_out, args.batch_size)


if __name__ == "__main__":
    sys.exit(main())
