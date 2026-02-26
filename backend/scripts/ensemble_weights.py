#!/usr/bin/env python3
"""
Layer 4: Adaptive Ensemble Weights
Optimizes weights for combining predictions from Layers 1, 2, and 3.
Uses historical performance to adaptively weight each layer's contribution
based on forecast horizon and product characteristics.

Input (stdin):
{
  "layer1_predictions": [{"date": "2025-12-09", "yhat": 150}, ...],
  "layer2_predictions": [{"date": "2025-12-09", "corrected_yhat": 155}, ...],
  "layer3_predictions": [{"date": "2025-12-09", "final_yhat": 193.75}, ...],
  "actual_values": [{"date": "2025-12-09", "quantity": 145}, ...],
  "product_id": 1,
  "merchant_id": 3,
  "forecast_horizon": "short"  // short (1-3 days), medium (4-7 days), long (8-14 days)
}

Output (stdout):
{
  "success": true,
  "ensemble_predictions": [
    {
      "date": "2025-12-09",
      "layer1_yhat": 150,
      "layer2_yhat": 155,
      "layer3_yhat": 193.75,
      "ensemble_weights": {"layer1": 0.25, "layer2": 0.40, "layer3": 0.35},
      "final_yhat": 159.44
    },
    ...
  ],
  "weight_summary": {
    "horizon": "short",
    "weights": {"layer1": 0.25, "layer2": 0.40, "layer3": 0.35},
    "confidence": 0.78
  },
  "performance_metrics": {
    "mape": 8.5,
    "rmse": 42.3,
    "mae": 28.1
  }
}
"""

import sys
import json
import numpy as np
from datetime import datetime, timedelta


class AdaptiveEnsembleWeights:
    """Optimize and apply adaptive ensemble weights"""

    def __init__(self):
        # Default weights (can be optimized based on historical performance)
        self.default_weights = {
            'short': {   # 1-3 days: Layer 2 (XGBoost) performs best
                'layer1': 0.20,
                'layer2': 0.45,
                'layer3': 0.35
            },
            'medium': {  # 4-7 days: Balanced weights
                'layer1': 0.25,
                'layer2': 0.40,
                'layer3': 0.35
            },
            'long': {    # 8-14 days: Layer 1 (Prophet) more stable
                'layer1': 0.35,
                'layer2': 0.30,
                'layer3': 0.35
            }
        }

        # Performance-based weight adjustments
        self.weight_history = {}

    def classify_horizon(self, date_str, forecast_start_date):
        """
        Classify forecast horizon as short, medium, or long.

        Args:
            date_str: Forecast date string
            forecast_start_date: Start date of forecast period

        Returns:
            str - 'short', 'medium', or 'long'
        """
        try:
            forecast_date = datetime.strptime(date_str, '%Y-%m-%d')
            start_date = datetime.strptime(forecast_start_date, '%Y-%m-%d')
            days_ahead = (forecast_date - start_date).days

            if days_ahead <= 3:
                return 'short'
            elif days_ahead <= 7:
                return 'medium'
            else:
                return 'long'
        except:
            return 'medium'  # Default to medium

    def compute_layer_confidence(self, predictions, actual_values):
        """
        Compute confidence scores for each layer based on prediction accuracy.

        Args:
            predictions: List of predicted values
            actual_values: List of actual values

        Returns:
            float - Confidence score (0-1)
        """
        if len(predictions) == 0 or len(actual_values) == 0:
            return 0.5

        # Calculate MAPE (Mean Absolute Percentage Error)
        mape = 0
        valid_count = 0

        for pred, actual in zip(predictions, actual_values):
            if actual > 0:
                mape += abs(pred - actual) / actual
                valid_count += 1

        if valid_count > 0:
            mape = (mape / valid_count) * 100
            # Convert MAPE to confidence (lower MAPE = higher confidence)
            # 0% MAPE = 1.0 confidence, 50% MAPE = 0.0 confidence
            confidence = max(0, 1 - (mape / 50))
        else:
            confidence = 0.5

        return confidence

    def optimize_weights(self, layer1_preds, layer2_preds, layer3_preds, actual_values, horizon):
        """
        Optimize ensemble weights based on historical performance.

        Args:
            layer1_preds: List of Layer 1 predictions
            layer2_preds: List of Layer 2 predictions
            layer3_preds: List of Layer 3 predictions
            actual_values: List of actual values
            horizon: Forecast horizon ('short', 'medium', 'long')

        Returns:
            Tuple of (weights_dict, confidence_score)
        """
        # Start with default weights for this horizon
        weights = self.default_weights.get(horizon, self.default_weights['medium']).copy()

        # Compute confidence for each layer
        if actual_values and len(actual_values) > 0:
            l1_confidence = self.compute_layer_confidence(layer1_preds, actual_values)
            l2_confidence = self.compute_layer_confidence(layer2_preds, actual_values)
            l3_confidence = self.compute_layer_confidence(layer3_preds, actual_values)

            # Adjust weights based on confidence (performance-based weighting)
            confidence_scores = {
                'layer1': l1_confidence,
                'layer2': l2_confidence,
                'layer3': l3_confidence
            }

            # Normalize confidences to sum to 1
            total_confidence = sum(confidence_scores.values())
            if total_confidence > 0:
                normalized_scores = {k: v / total_confidence for k, v in confidence_scores.items()}

                # Blend default weights (70%) with performance-based weights (30%)
                for layer, default_weight in weights.items():
                    performance_weight = normalized_scores.get(layer, 0.33)
                    weights[layer] = 0.7 * default_weight + 0.3 * performance_weight

            # Overall ensemble confidence (average of layer confidences)
            overall_confidence = np.mean([l1_confidence, l2_confidence, l3_confidence])
        else:
            overall_confidence = 0.5

        # Ensure weights sum to 1
        total_weight = sum(weights.values())
        if total_weight > 0:
            weights = {k: v / total_weight for k, v in weights.items()}

        return weights, overall_confidence

    def combine_predictions(self, layer1_preds, layer2_preds, layer3_preds, weights):
        """
        Combine layer predictions using ensemble weights.

        Args:
            layer1_preds: List/array of Layer 1 predictions
            layer2_preds: List/array of Layer 2 predictions
            layer3_preds: List/array of Layer 3 predictions
            weights: Dict with layer1, layer2, layer3 weights

        Returns:
            List of ensemble predictions
        """
        ensemble_preds = []

        for l1, l2, l3 in zip(layer1_preds, layer2_preds, layer3_preds):
            ensemble_pred = (
                l1 * weights['layer1'] +
                l2 * weights['layer2'] +
                l3 * weights['layer3']
            )
            ensemble_preds.append(ensemble_pred)

        return ensemble_preds

    def apply_ensemble(self, layer1_predictions, layer2_predictions, layer3_predictions,
                      actual_values=None, product_id=None, forecast_horizon='medium'):
        """
        Apply ensemble weighting to combine all layers.

        Args:
            layer1_predictions: List of dicts with 'date' and 'yhat'
            layer2_predictions: List of dicts with 'date' and 'corrected_yhat'
            layer3_predictions: List of dicts with 'date' and 'final_yhat'
            actual_values: List of dicts with 'date' and 'quantity' (optional)
            product_id: Product ID (optional)
            forecast_horizon: 'short', 'medium', or 'long'

        Returns:
            Tuple of (ensemble_results, weight_summary, metrics)
        """
        # Extract prediction values
        l1_values = [p.get('yhat', 0) for p in layer1_predictions]
        l2_values = [p.get('corrected_yhat', p.get('yhat', 0)) for p in layer2_predictions]
        l3_values = [p.get('final_yhat', 0) for p in layer3_predictions]

        # Extract actual values if provided
        actual_vals = None
        if actual_values:
            actual_vals = [v.get('quantity', 0) for v in actual_values]

        # Optimize weights based on historical performance
        weights, confidence = self.optimize_weights(
            l1_values, l2_values, l3_values, actual_vals, forecast_horizon
        )

        # Combine predictions
        ensemble_preds = self.combine_predictions(l1_values, l2_values, l3_values, weights)

        # Build detailed results
        ensemble_results = []
        dates = [p['date'] for p in layer1_predictions]

        for i, date in enumerate(dates):
            ensemble_results.append({
                "date": date,
                "layer1_yhat": float(l1_values[i]),
                "layer2_yhat": float(l2_values[i]),
                "layer3_yhat": float(l3_values[i]),
                "ensemble_weights": {
                    "layer1": float(weights['layer1']),
                    "layer2": float(weights['layer2']),
                    "layer3": float(weights['layer3'])
                },
                "final_yhat": float(ensemble_preds[i])
            })

        # Weight summary
        weight_summary = {
            "product_id": product_id,
            "horizon": forecast_horizon,
            "weights": {
                "layer1": float(weights['layer1']),
                "layer2": float(weights['layer2']),
                "layer3": float(weights['layer3'])
            },
            "confidence": float(confidence)
        }

        # Calculate performance metrics
        metrics = {}
        if actual_vals:
            mape = 0
            rmse = 0
            mae = 0
            valid_count = 0

            for actual, ensemble_pred in zip(actual_vals, ensemble_preds):
                if actual > 0:
                    mape += abs(ensemble_pred - actual) / actual
                    valid_count += 1
                mae += abs(ensemble_pred - actual)
                rmse += (ensemble_pred - actual) ** 2

            if valid_count > 0:
                metrics['mape'] = float((mape / valid_count) * 100)
            if len(actual_vals) > 0:
                metrics['mae'] = float(mae / len(actual_vals))
                metrics['rmse'] = float(np.sqrt(rmse / len(actual_vals)))

        return ensemble_results, weight_summary, metrics


def main():
    """Main entry point for ensemble weighting"""
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())

        # Extract data
        layer1_predictions = input_data.get('layer1_predictions', [])
        layer2_predictions = input_data.get('layer2_predictions', [])
        layer3_predictions = input_data.get('layer3_predictions', [])
        actual_values = input_data.get('actual_values', None)
        product_id = input_data.get('product_id', None)
        forecast_horizon = input_data.get('forecast_horizon', 'medium')

        if not layer1_predictions or not layer2_predictions or not layer3_predictions:
            return {
                "success": False,
                "error": "Missing required input: layer1_predictions, layer2_predictions, layer3_predictions"
            }

        # Initialize ensemble
        ensemble = AdaptiveEnsembleWeights()

        # Apply ensemble
        ensemble_results, weight_summary, metrics = ensemble.apply_ensemble(
            layer1_predictions,
            layer2_predictions,
            layer3_predictions,
            actual_values,
            product_id,
            forecast_horizon
        )

        return {
            "success": True,
            "ensemble_predictions": ensemble_results,
            "weight_summary": weight_summary,
            "performance_metrics": metrics
        }

    except Exception as error:
        return {
            "success": False,
            "error": str(error)
        }


if __name__ == '__main__':
    result = main()
    print(json.dumps(result))
