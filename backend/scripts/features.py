#!/usr/bin/env python3
"""
Feature Engineering Module for Forecasting System
Generates and manages external regressors for improved forecast accuracy

Features Generated:
- Temporal: semester_week, day_of_week, is_weekend, is_exam_period
- Spatial: hostel_zone
- Business: merchant_id, category_id, price
- Holidays: holiday_flag
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional


class SemesterCalendar:
    """Manages semester weeks and exam periods"""

    def __init__(self, semester_start: str = '2024-01-15', weeks_per_semester: int = 13):
        """
        Initialize semester calendar

        Args:
            semester_start: Start date of semester (YYYY-MM-DD)
            weeks_per_semester: Number of weeks in semester (typically 13)
        """
        self.semester_start = pd.to_datetime(semester_start)
        self.weeks_per_semester = weeks_per_semester
        self.semester_end = self.semester_start + timedelta(weeks=weeks_per_semester)
        self.exam_start = self.semester_end
        self.exam_end = self.semester_end + timedelta(weeks=2)

    def get_semester_week(self, date) -> int:
        """Get week number within semester (1-13), 0 if out of semester"""
        if not isinstance(date, pd.Timestamp):
            date = pd.Timestamp(date)

        if date < self.semester_start or date > self.semester_end:
            return 0

        days_since_start = (date - self.semester_start).days
        week = (days_since_start // 7) + 1
        return min(week, self.weeks_per_semester)

    def is_exam_period(self, date) -> int:
        """Check if date falls within exam period"""
        if not isinstance(date, pd.Timestamp):
            date = pd.Timestamp(date)
        return 1 if self.exam_start <= date <= self.exam_end else 0

    def is_semester_active(self, date) -> int:
        """Check if date is during active semester"""
        if not isinstance(date, pd.Timestamp):
            date = pd.Timestamp(date)
        return 1 if self.semester_start <= date <= self.semester_end else 0


class FeatureGenerator:
    """Generate comprehensive feature sets for forecasting"""

    def __init__(self, campus_holidays: Optional[List[str]] = None):
        """
        Initialize feature generator

        Args:
            campus_holidays: List of holiday dates (YYYY-MM-DD format)
        """
        self.semester_calendar = SemesterCalendar()
        self.campus_holidays = set(
            pd.to_datetime(h).strftime('%Y-%m-%d') for h in (campus_holidays or [])
        )

    def generate_temporal_features(self, date) -> Dict[str, int]:
        """
        Generate temporal features for a given date

        Returns:
            Dict with keys: day_of_week, is_weekend, semester_week, is_exam_period
        """
        # Convert to pandas Timestamp if needed
        if not isinstance(date, pd.Timestamp):
            date = pd.Timestamp(date)

        return {
            'day_of_week': date.dayofweek,  # 0=Monday, 6=Sunday
            'is_weekend': 1 if date.dayofweek >= 5 else 0,
            'semester_week': self.semester_calendar.get_semester_week(date),
            'is_exam_period': self.semester_calendar.is_exam_period(date)
        }

    def generate_spatial_features(self, hostel_zone: Optional[str] = None) -> Dict[str, str]:
        """
        Generate spatial features

        Args:
            hostel_zone: Zone name (e.g., 'north', 'south', 'east', 'west', 'center')

        Returns:
            Dict with hostel_zone encoded
        """
        zones = {'north': 1, 'south': 2, 'east': 3, 'west': 4, 'center': 5}
        encoded_zone = zones.get(hostel_zone, 0) if hostel_zone else 0

        return {
            'hostel_zone': hostel_zone or 'unknown',
            'hostel_zone_encoded': encoded_zone
        }

    def generate_business_features(
        self,
        merchant_id: Optional[int] = None,
        category_id: Optional[int] = None,
        price: Optional[float] = None
    ) -> Dict:
        """
        Generate business context features

        Returns:
            Dict with merchant_id, category_id, price
        """
        return {
            'merchant_id': merchant_id or 0,
            'category_id': category_id or 0,
            'price': price or 0.0
        }

    def generate_holiday_features(self, date) -> Dict[str, int]:
        """
        Check if date is a holiday

        Returns:
            Dict with holiday_flag
        """
        if not isinstance(date, pd.Timestamp):
            date = pd.Timestamp(date)

        date_str = date.strftime('%Y-%m-%d')
        is_holiday = 1 if date_str in self.campus_holidays else 0

        # Also check for national holidays (rough approximation)
        month_day = date.strftime('%m-%d')
        national_holidays = [
            '01-01',  # New Year
            '05-20',  # National Day
            '12-25',  # Christmas
        ]
        if month_day in national_holidays:
            is_holiday = 1

        return {
            'holiday_flag': is_holiday
        }

    def generate_all_features(
        self,
        date: pd.Timestamp,
        hostel_zone: Optional[str] = None,
        merchant_id: Optional[int] = None,
        category_id: Optional[int] = None,
        price: Optional[float] = None
    ) -> Dict:
        """
        Generate all features for a given date and business context

        Returns:
            Dict with all features combined
        """
        features = {}

        # Temporal features
        features.update(self.generate_temporal_features(date))

        # Spatial features
        features.update(self.generate_spatial_features(hostel_zone))

        # Business features
        features.update(self.generate_business_features(merchant_id, category_id, price))

        # Holiday features
        features.update(self.generate_holiday_features(date))

        return features


class BulkFeatureGenerator:
    """Generate features for multiple dates and entities"""

    def __init__(self, campus_holidays: Optional[List[str]] = None):
        """Initialize with feature generator"""
        self.gen = FeatureGenerator(campus_holidays)

    def generate_date_range_features(
        self,
        start_date: str,
        end_date: str,
        merchant_id: Optional[int] = None,
        category_id: Optional[int] = None,
        hostel_zone: Optional[str] = None,
        price: Optional[float] = None
    ) -> Dict[str, Dict[str, int]]:
        """
        Generate features for a date range

        Args:
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            merchant_id: Optional merchant ID
            category_id: Optional category ID
            hostel_zone: Optional hostel zone
            price: Optional price

        Returns:
            Dict indexed by date string with features for each date
        """
        start = pd.to_datetime(start_date)
        end = pd.to_datetime(end_date)

        features = {}
        current = start

        while current <= end:
            date_str = current.strftime('%Y-%m-%d')
            features[date_str] = self.gen.generate_all_features(
                current,
                hostel_zone=hostel_zone,
                merchant_id=merchant_id,
                category_id=category_id,
                price=price
            )
            current += timedelta(days=1)

        return features

    def generate_merchant_features(
        self,
        merchant_id: int,
        start_date: str,
        end_date: str,
        category_id: Optional[int] = None,
        hostel_zone: Optional[str] = None,
        base_price: Optional[float] = None
    ) -> Dict[str, Dict[str, int]]:
        """
        Generate features for a specific merchant

        Args:
            merchant_id: Merchant ID
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            category_id: Optional category ID
            hostel_zone: Optional hostel zone
            base_price: Optional base price

        Returns:
            Dict with features for merchant over date range
        """
        return self.generate_date_range_features(
            start_date, end_date, merchant_id, category_id, hostel_zone, base_price
        )

    def generate_features_for_forecast(
        self,
        merchant_id: int,
        periods: int = 14,
        category_id: Optional[int] = None,
        hostel_zone: Optional[str] = None,
        base_price: Optional[float] = None
    ) -> Dict[str, Dict[str, int]]:
        """
        Generate features for future forecast periods

        Args:
            merchant_id: Merchant ID
            periods: Number of days to forecast
            category_id: Optional category ID
            hostel_zone: Optional hostel zone
            base_price: Optional base price

        Returns:
            Dict with features for future periods
        """
        today = datetime.now().date()
        start_date = (pd.Timestamp(today) + timedelta(days=1)).strftime('%Y-%m-%d')
        end_date = (pd.Timestamp(today) + timedelta(days=periods)).strftime('%Y-%m-%d')

        return self.generate_merchant_features(
            merchant_id, start_date, end_date, category_id, hostel_zone, base_price
        )


class FeatureNormalizer:
    """Normalize features for model consumption"""

    @staticmethod
    def normalize_features(
        features: Dict[str, Dict],
        feature_columns: List[str]
    ) -> Tuple[np.ndarray, Dict]:
        """
        Normalize feature matrix for ML models

        Args:
            features: Dict of features indexed by date
            feature_columns: List of feature column names to extract

        Returns:
            Tuple of (normalized_array, normalization_params)
        """
        # Extract features into array
        data = []
        for date_str in sorted(features.keys()):
            row = [features[date_str].get(col, 0) for col in feature_columns]
            data.append(row)

        X = np.array(data, dtype=np.float32)

        # Calculate normalization parameters
        means = np.mean(X, axis=0)
        stds = np.std(X, axis=0)
        stds = np.where(stds == 0, 1, stds)  # Avoid division by zero

        # Normalize
        X_norm = (X - means) / stds

        return X_norm, {
            'means': means.tolist(),
            'stds': stds.tolist(),
            'feature_columns': feature_columns
        }

    @staticmethod
    def denormalize_features(
        X_norm: np.ndarray,
        normalization_params: Dict
    ) -> np.ndarray:
        """
        Denormalize features

        Args:
            X_norm: Normalized feature array
            normalization_params: Normalization parameters from normalize_features

        Returns:
            Denormalized array
        """
        means = np.array(normalization_params['means'])
        stds = np.array(normalization_params['stds'])

        return X_norm * stds + means


# Example usage functions
def generate_features_for_forecast_request(
    merchant_id: int,
    category_id: Optional[int] = None,
    hostel_zone: Optional[str] = None,
    price: Optional[float] = None,
    periods: int = 14,
    campus_holidays: Optional[List[str]] = None
) -> Dict[str, Dict[str, int]]:
    """
    Generate features for a forecast request

    Args:
        merchant_id: Merchant ID
        category_id: Optional category ID
        hostel_zone: Optional hostel zone
        price: Optional price
        periods: Number of days to forecast
        campus_holidays: Optional list of campus holiday dates

    Returns:
        Dict with features ready for forecasting
    """
    bulk_gen = BulkFeatureGenerator(campus_holidays)
    return bulk_gen.generate_features_for_forecast(
        merchant_id=merchant_id,
        periods=periods,
        category_id=category_id,
        hostel_zone=hostel_zone,
        base_price=price
    )


def generate_historical_features(
    start_date: str,
    end_date: str,
    merchant_id: int,
    category_id: Optional[int] = None,
    hostel_zone: Optional[str] = None,
    price: Optional[float] = None,
    campus_holidays: Optional[List[str]] = None
) -> Dict[str, Dict[str, int]]:
    """
    Generate features for historical data

    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        merchant_id: Merchant ID
        category_id: Optional category ID
        hostel_zone: Optional hostel zone
        price: Optional price
        campus_holidays: Optional list of campus holiday dates

    Returns:
        Dict with historical features
    """
    bulk_gen = BulkFeatureGenerator(campus_holidays)
    return bulk_gen.generate_merchant_features(
        merchant_id=merchant_id,
        start_date=start_date,
        end_date=end_date,
        category_id=category_id,
        hostel_zone=hostel_zone,
        base_price=price
    )


if __name__ == '__main__':
    # Handle both direct calls and stdin input
    import json
    import sys

    # Try to read from stdin first (Node.js integration)
    try:
        input_str = sys.stdin.read()
        if input_str:
            input_data = json.loads(input_str)
            mode = input_data.get('mode', 'forecast')

            try:
                if mode == 'forecast':
                    # Generate features for forecast period
                    features = generate_features_for_forecast_request(
                        merchant_id=input_data.get('merchant_id'),
                        category_id=input_data.get('category_id'),
                        hostel_zone=input_data.get('hostel_zone'),
                        price=input_data.get('base_price'),
                        periods=input_data.get('periods', 14),
                        campus_holidays=input_data.get('campus_holidays', [])
                    )
                elif mode == 'historical':
                    # Generate features for historical period
                    features = generate_historical_features(
                        start_date=input_data.get('start_date'),
                        end_date=input_data.get('end_date'),
                        merchant_id=input_data.get('merchant_id'),
                        category_id=input_data.get('category_id'),
                        hostel_zone=input_data.get('hostel_zone'),
                        price=input_data.get('base_price'),
                        campus_holidays=input_data.get('campus_holidays', [])
                    )
                else:
                    raise ValueError(f"Unknown mode: {mode}")

                # Return success response
                result = {
                    'success': True,
                    'features': features,
                    'count': len(features),
                    'mode': mode
                }
                print(json.dumps(result, default=str))
            except Exception as e:
                error_result = {
                    'success': False,
                    'error': str(e),
                    'mode': mode
                }
                print(json.dumps(error_result, default=str))
                sys.exit(1)
        else:
            # No stdin input - run test example
            features = generate_features_for_forecast_request(
                merchant_id=42,
                category_id=7,
                hostel_zone='north',
                price=15000.0,
                periods=14,
                campus_holidays=['2024-01-25', '2024-02-14']
            )
            print(json.dumps(features, indent=2, default=str))
    except Exception as e:
        error_result = {
            'success': False,
            'error': str(e)
        }
        print(json.dumps(error_result, default=str))
        sys.exit(1)
