import json
from pathlib import Path


BASELINE_RESULTS = {
    "accuracy": 0.9392,
    "weighted_f1": 0.9388,
    "macro_f1": 0.9405,
}

FINE_TUNED_RESULTS = {
    "accuracy": 0.9809,
    "weighted_f1": 0.9809,
    "macro_f1": 0.9815,
}


reports_dir = Path("outputs/reports")
reports_dir.mkdir(
    parents=True,
    exist_ok=True,
)

comparison = {
    "baseline": BASELINE_RESULTS,
    "fine_tuned": FINE_TUNED_RESULTS,
}

with open(
    reports_dir / "model_comparison.json",
    "w",
) as file:

    json.dump(
        comparison,
        file,
        indent=4,
    )

markdown = f"""# Model Comparison

| Metric | Baseline | Fine-Tuned |
|--------|---------:|-----------:|
| Accuracy | {BASELINE_RESULTS['accuracy']:.4f} | {FINE_TUNED_RESULTS['accuracy']:.4f} |
| Weighted F1 | {BASELINE_RESULTS['weighted_f1']:.4f} | {FINE_TUNED_RESULTS['weighted_f1']:.4f} |
| Macro F1 | {BASELINE_RESULTS['macro_f1']:.4f} | {FINE_TUNED_RESULTS['macro_f1']:.4f} |
"""

with open(
    reports_dir / "model_comparison.md",
    "w",
) as file:

    file.write(markdown)

print("Model comparison reports generated successfully!")