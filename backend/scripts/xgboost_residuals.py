#!/usr/bin/env python3
"""
Layer 2: XGBoost Residual Correction
Trains an XGBoost model to predict residuals from Layer 1 (Prophet forecasts).
This improves forecast accuracy by learning systematic biases in Prophet predictions.

Input (stdin):
{
  "sales_data": [{"date": "2025-06-12", "quantity": 100, "revenue": 5000}, ...],
  "layer1_predictions": [{"yhat": 120, "yhat_lower": 100, "yhat_upper": 140, ...}, ...],
  "regressors": {"2025-12-09": {"day_of_week": 2, ...}, ...},
  "historical_residuals": [{"date": "2025-06-12", "residual": -20}, ...]
}

Output (stdout):
{
  "success": true,
  "residual_corrections": [
    {"date": "2025-12-09", "actual_quantity": 150, "layer1_yhat": 140, "residual_correction": 15, "corrected_yhat": 155},
    ...
  ],
  "model_stats": {
    "rmse": 45.23,
    "mae": 28.15,
    "r2": 0.72
  },
  "feature_importance": {
    "day_of_week": 0.25,
    "is_exam_period": 0.18,
    ...
  }
}
"""

import sys
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

try:
    from xgboost import XGBRegressor
    from sklearn.preprocessing import StandardScaler
    from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
except ImportError:
    print(json.dumps({
        "success": False,
        "error": "Required libraries not installed. Run: pip install xgboost scikit-learn"
    }))
    sys.exit(1)


class ResidualCorrectionModel:
    """XGBoost model for predicting and correcting forecast residuals"""

    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = []
        self.rmse = None
        self.mae = None
        self.r2 = None
        self.feature_importance = {}

    def _to_numeric(self, value):
        """
        Convert value to numeric, handling strings and None values.
        Returns 0 for non-numeric strings.
        """
        if value is None:
            return 0

        if isinstance(value, (int, float, np.integer, np.floating)):
            return float(value)

        if isinstance(value, str):
            try:
                return float(value)
            except ValueError:
                # Non-numeric string, return 0
                return 0

        # For other types, try conversion
        try:
            return float(value)
        except (ValueError, TypeError):
            return 0

    def prepare_features(self, regressors, date_list):
        """
        Prepare feature matrix from regressors and dates.

        Args:
            regressors: Dict with date keys and feature dicts
            date_list: List of date strings to align features

        Returns:
            numpy array of shape (n_samples, n_features)
        """
        features_list = []
        available_dates = []

        for date in date_list:
            date_str = date if isinstance(date, str) else date.strftime('%Y-%m-%d')

            # Try exact match first, then try to find any available date as fallback
            regressor = None
            if date_str in regressors:
                regressor = regressors[date_str]
            elif regressors:
                # Fallback: use first available regressor (for dates without specific regressors)
                regressor = list(regressors.values())[0]

            if regressor:
                # Extract features in consistent order with numeric conversion
                try:
                    feature_row = [
                        self._to_numeric(regressor.get('day_of_week', 0)),
                        self._to_numeric(regressor.get('is_weekend', 0)),
                        self._to_numeric(regressor.get('semester_week', 0)),
                        self._to_numeric(regressor.get('is_exam_period', 0)),
                        self._to_numeric(regressor.get('hostel_zone', 0)),
                        self._to_numeric(regressor.get('merchant_id', 0)),
                        self._to_numeric(regressor.get('category_id', 0)),
                        self._to_numeric(regressor.get('price', 0)),
                        self._to_numeric(regressor.get('holiday_flag', 0)),
                        self._to_numeric(regressor.get('feature_10', 0)),  # Placeholder for 10th feature
                    ]

                    features_list.append(feature_row)
                    available_dates.append(date_str)
                except (ValueError, TypeError):
                    # Skip rows with bad features
                    continue

        if not features_list:
            raise ValueError("No matching regressors found for dates")

        self.feature_names = [
            'day_of_week', 'is_weekend', 'semester_week', 'is_exam_period',
            'hostel_zone', 'merchant_id', 'category_id', 'price', 'holiday_flag', 'feature_10'
        ]

        return np.array(features_list), available_dates

    def compute_residuals(self, actual_values, predicted_values):
        """
        Compute residuals as (actual - predicted).

        Args:
            actual_values: Array of actual sales quantities
            predicted_values: Array of Layer 1 predictions (yhat)

        Returns:
            Array of residuals
        """
        residuals = np.array(actual_values) - np.array(predicted_values)
        return residuals

    def train(self, historical_dates, historical_quantities, historical_layer1_yhats, regressors):
        """
        Train XGBoost model on historical residuals.

        Args:
            historical_dates: List of historical date strings
            historical_quantities: List of actual quantities
            historical_layer1_yhats: List of Layer 1 predictions
            regressors: Dict of regressors by date

        Returns:
            bool - Training success
        """
        try:
            # Prepare features - this handles date matching internally
            X, aligned_dates = self.prepare_features(regressors, historical_dates)

            if len(aligned_dates) == 0:
                raise ValueError("No aligned dates found between regressors and historical data")

            # Build mapping of aligned dates to their indices in historical data
            aligned_indices = []
            valid_aligned_dates = []

            for aligned_date in aligned_dates:
                # Try to find this date in historical_dates
                found = False
                for i, hist_date in enumerate(historical_dates):
                    # Handle both string and date comparisons
                    hist_str = hist_date if isinstance(hist_date, str) else str(hist_date)
                    aligned_str = aligned_date if isinstance(aligned_date, str) else str(aligned_date)

                    if hist_str == aligned_str:
                        aligned_indices.append(i)
                        valid_aligned_dates.append(aligned_date)
                        found = True
                        break

                if not found:
                    # Try fuzzy matching (first 10 chars)
                    for i, hist_date in enumerate(historical_dates):
                        hist_str = (hist_date if isinstance(hist_date, str) else str(hist_date))[:10]
                        aligned_str = (aligned_date if isinstance(aligned_date, str) else str(aligned_date))[:10]

                        if hist_str == aligned_str:
                            aligned_indices.append(i)
                            valid_aligned_dates.append(aligned_date)
                            break

            if len(aligned_indices) == 0:
                # Fallback: use all available data if we can't align by date
                aligned_indices = list(range(min(len(historical_dates), len(aligned_dates))))
                valid_aligned_dates = historical_dates[:len(aligned_indices)]

            # Extract aligned data - ensure we don't go out of bounds
            y_actual = np.array([historical_quantities[i] if i < len(historical_quantities) else historical_quantities[-1] for i in aligned_indices])
            y_pred = np.array([historical_layer1_yhats[i] if i < len(historical_layer1_yhats) else historical_layer1_yhats[-1] for i in aligned_indices])

            # Ensure arrays have same length
            if len(y_actual) != len(y_pred) or len(y_actual) != len(X):
                # Trim to smallest length
                min_len = min(len(y_actual), len(y_pred), len(X))
                y_actual = y_actual[:min_len]
                y_pred = y_pred[:min_len]
                X = X[:min_len]

            # Compute residuals (what we want to predict)
            residuals = self.compute_residuals(y_actual, y_pred)

            # Scale features
            X_scaled = self.scaler.fit_transform(X)

            # Train XGBoost with minimal samples check
            if len(X_scaled) < 10:
                # Too few samples, use simpler model
                n_estimators = max(10, len(X_scaled) // 2)
            else:
                n_estimators = 100

            self.model = XGBRegressor(
                n_estimators=n_estimators,
                max_depth=3,  # Reduce depth to avoid overfitting with small datasets
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                verbosity=0
            )

            self.model.fit(X_scaled, residuals, verbose=False)

            # Evaluate on training set
            y_pred_residuals = self.model.predict(X_scaled)

            self.rmse = np.sqrt(mean_squared_error(residuals, y_pred_residuals))
            self.mae = mean_absolute_error(residuals, y_pred_residuals)
            self.r2 = r2_score(residuals, y_pred_residuals)

            # Extract feature importance
            importances = self.model.feature_importances_
            for name, importance in zip(self.feature_names, importances):
                self.feature_importance[name] = float(importance)

            return True

        except Exception as e:
            raise Exception(f"Failed to train residual model: {str(e)}")

    def predict(self, dates, regressors):
        """
        Predict residual corrections for future dates.

        Args:
            dates: List of forecast date strings
            regressors: Dict of regressors by date

        Returns:
            Tuple of (predicted_residuals, available_dates)
        """
        if self.model is None:
            raise Exception("Model not trained yet")

        X, available_dates = self.prepare_features(regressors, dates)
        X_scaled = self.scaler.transform(X)

        residual_corrections = self.model.predict(X_scaled)

        return residual_corrections, available_dates


def main():
    """Main entry point for residual correction"""
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())

        # Extract data
        sales_data = input_data.get('sales_data', [])
        layer1_predictions = input_data.get('layer1_predictions', [])
        regressors = input_data.get('regressors', {})
        forecast_dates = input_data.get('forecast_dates', [])

        if not sales_data or not layer1_predictions or not regressors:
            return {
                "success": False,
                "error": "Missing required input: sales_data, layer1_predictions, regressors"
            }

        # Initialize model
        model = ResidualCorrectionModel()

        # Prepare historical data
        historical_dates = [item['date'] for item in sales_data]
        historical_quantities = [item['quantity'] for item in sales_data]
        historical_layer1_yhats = [pred['yhat'] for pred in layer1_predictions]

        # Train model on historical data
        model.train(
            historical_dates,
            historical_quantities,
            historical_layer1_yhats,
            regressors
        )

        # Make predictions for forecast period
        if not forecast_dates:
            # If no forecast dates provided, use last 14 days of historical data as test
            last_date = datetime.strptime(historical_dates[-1], '%Y-%m-%d')
            forecast_dates = [
                (last_date + timedelta(days=i+1)).strftime('%Y-%m-%d')
                for i in range(14)
            ]

        residual_corrections, aligned_dates = model.predict(forecast_dates, regressors)

        # Build response with corrected predictions
        residual_corrections_response = []
        for i, date in enumerate(aligned_dates):
            correction = residual_corrections[i]

            # Find corresponding Layer 1 prediction
            layer1_yhat = None
            if date in [d['date'] for d in layer1_predictions]:
                pred_idx = [d['date'] for d in layer1_predictions].index(date)
                layer1_yhat = layer1_predictions[pred_idx]['yhat']

            corrected_yhat = (layer1_yhat + correction) if layer1_yhat else None

            residual_corrections_response.append({
                "date": date,
                "layer1_yhat": float(layer1_yhat) if layer1_yhat else None,
                "residual_correction": float(correction),
                "corrected_yhat": float(corrected_yhat) if corrected_yhat else None
            })

        return {
            "success": True,
            "residual_corrections": residual_corrections_response,
            "model_stats": {
                "rmse": float(model.rmse),
                "mae": float(model.mae),
                "r2": float(model.r2)
            },
            "feature_importance": {
                name: float(importance) for name, importance in model.feature_importance.items()
            }
        }

    except Exception as error:
        return {
            "success": False,
            "error": str(error)
        }


if __name__ == '__main__':
    result = main()
    print(json.dumps(result))
