#!/usr/bin/env python3
"""
Layer 3: Context Rules Engine
Applies business logic and contextual rules to adjust forecasts based on
known patterns, events, and academic calendar.

Input (stdin):
{
  "layer2_predictions": [{"date": "2025-12-09", "corrected_yhat": 155}, ...],
  "regressors": {"2025-12-09": {"is_exam_period": 1, "semester_week": 8, ...}, ...},
  "base_quantity": 100,
  "merchant_id": 3
}

Output (stdout):
{
  "success": true,
  "context_adjustments": [
    {
      "date": "2025-12-09",
      "layer2_yhat": 155,
      "contexts": ["exam_period", "weekday", "high_demand_zone"],
      "adjustment_factor": 1.25,
      "rule_adjustments": [{"rule": "exam_boost", "impact": 0.20}, ...],
      "final_yhat": 193.75
    },
    ...
  ],
  "rule_statistics": {
    "exam_period_count": 2,
    "weekend_count": 1,
    "special_event_count": 0
  }
}
"""

import sys
import json
import numpy as np
from datetime import datetime, timedelta


class ContextRulesEngine:
    """Apply business logic and context rules to forecast adjustments"""

    def __init__(self):
        # Rule definitions with multiplicative factors
        self.exam_period_boost = 1.25      # 25% increase during exams
        self.weekend_reduction = 0.85      # 15% reduction on weekends
        self.holiday_reduction = 0.70      # 30% reduction on holidays
        self.high_demand_zone_boost = 1.15 # 15% increase in high-demand zones
        self.payday_boost = 1.18            # 18% increase on paydays (22nd-25th)
        self.semester_start_boost = 1.12   # 12% increase at semester start
        self.semester_end_reduction = 0.90 # 10% reduction at semester end

    def get_contexts(self, regressor):
        """
        Extract context flags from regressor data.

        Args:
            regressor: Dict with regressor values for a date

        Returns:
            List of context identifiers
        """
        contexts = []

        if regressor.get('is_exam_period', 0) == 1:
            contexts.append('exam_period')

        if regressor.get('is_weekend', 0) == 1:
            contexts.append('weekend')

        if regressor.get('holiday_flag', 0) == 1:
            contexts.append('holiday')

        # Infer high-demand zone (hostel_zone > median)
        zone_value = regressor.get('hostel_zone', 0)
        try:
            zone_value = int(zone_value) if isinstance(zone_value, str) else zone_value
            if zone_value > 2:
                contexts.append('high_demand_zone')
        except (ValueError, TypeError):
            pass

        # Check for payday (22-25 of month)
        try:
            day_of_month = regressor.get('day_of_month', 0)
            if 22 <= day_of_month <= 25:
                contexts.append('payday')
        except:
            pass

        # Semester milestones
        semester_week = regressor.get('semester_week', 0)
        if semester_week == 1:
            contexts.append('semester_start')
        elif semester_week >= 13:
            contexts.append('semester_end')

        return contexts

    def calculate_adjustment_factor(self, contexts):
        """
        Calculate multiplicative adjustment factor based on contexts.
        Uses multiplicative (not additive) combination to avoid extreme values.

        Args:
            contexts: List of context identifiers

        Returns:
            float - Adjustment factor (1.0 = no change)
        """
        adjustment_factor = 1.0
        rule_adjustments = []

        for context in contexts:
            if context == 'exam_period':
                rule_adjustments.append({
                    "rule": "exam_boost",
                    "impact": self.exam_period_boost - 1.0
                })
                adjustment_factor *= self.exam_period_boost

            elif context == 'weekend':
                rule_adjustments.append({
                    "rule": "weekend_reduction",
                    "impact": self.weekend_reduction - 1.0
                })
                adjustment_factor *= self.weekend_reduction

            elif context == 'holiday':
                rule_adjustments.append({
                    "rule": "holiday_reduction",
                    "impact": self.holiday_reduction - 1.0
                })
                adjustment_factor *= self.holiday_reduction

            elif context == 'high_demand_zone':
                rule_adjustments.append({
                    "rule": "high_demand_boost",
                    "impact": self.high_demand_zone_boost - 1.0
                })
                adjustment_factor *= self.high_demand_zone_boost

            elif context == 'payday':
                rule_adjustments.append({
                    "rule": "payday_boost",
                    "impact": self.payday_boost - 1.0
                })
                adjustment_factor *= self.payday_boost

            elif context == 'semester_start':
                rule_adjustments.append({
                    "rule": "semester_start_boost",
                    "impact": self.semester_start_boost - 1.0
                })
                adjustment_factor *= self.semester_start_boost

            elif context == 'semester_end':
                rule_adjustments.append({
                    "rule": "semester_end_reduction",
                    "impact": self.semester_end_reduction - 1.0
                })
                adjustment_factor *= self.semester_end_reduction

        # Cap adjustment to prevent extreme values
        adjustment_factor = max(0.5, min(adjustment_factor, 2.0))

        return adjustment_factor, rule_adjustments

    def apply_rules(self, layer2_predictions, regressors):
        """
        Apply context rules to Layer 2 predictions.

        Args:
            layer2_predictions: List of dicts with date and corrected_yhat
            regressors: Dict of regressors by date

        Returns:
            List of adjusted predictions with context info
        """
        context_adjustments = []
        rule_stats = {
            "exam_period_count": 0,
            "weekend_count": 0,
            "holiday_count": 0,
            "payday_count": 0,
            "semester_milestone_count": 0
        }

        for prediction in layer2_predictions:
            date = prediction['date']
            layer2_yhat = prediction.get('corrected_yhat', prediction.get('yhat', 0))

            # Get regressors for this date
            regressor = regressors.get(date, {})

            # Extract contexts
            contexts = self.get_contexts(regressor)

            # Calculate adjustment
            adjustment_factor, rule_adjustments = self.calculate_adjustment_factor(contexts)

            # Apply adjustment
            final_yhat = layer2_yhat * adjustment_factor

            # Update statistics
            if 'exam_period' in contexts:
                rule_stats['exam_period_count'] += 1
            if 'weekend' in contexts:
                rule_stats['weekend_count'] += 1
            if 'holiday' in contexts:
                rule_stats['holiday_count'] += 1
            if 'payday' in contexts:
                rule_stats['payday_count'] += 1
            if 'semester_start' in contexts or 'semester_end' in contexts:
                rule_stats['semester_milestone_count'] += 1

            context_adjustments.append({
                "date": date,
                "layer2_yhat": float(layer2_yhat),
                "contexts": contexts,
                "adjustment_factor": float(adjustment_factor),
                "rule_adjustments": rule_adjustments,
                "final_yhat": float(final_yhat)
            })

        return context_adjustments, rule_stats


def main():
    """Main entry point for context rules engine"""
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())

        # Extract data
        layer2_predictions = input_data.get('layer2_predictions', [])
        regressors = input_data.get('regressors', {})

        if not layer2_predictions or not regressors:
            return {
                "success": False,
                "error": "Missing required input: layer2_predictions, regressors"
            }

        # Initialize engine
        engine = ContextRulesEngine()

        # Apply rules
        context_adjustments, rule_stats = engine.apply_rules(layer2_predictions, regressors)

        return {
            "success": True,
            "context_adjustments": context_adjustments,
            "rule_statistics": rule_stats
        }

    except Exception as error:
        return {
            "success": False,
            "error": str(error)
        }


if __name__ == '__main__':
    result = main()
    print(json.dumps(result))
