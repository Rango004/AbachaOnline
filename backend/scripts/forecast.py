#!/usr/bin/env python3
"""
Hybrid Ensemble Forecasting System for Sales Prediction
Adapts forecast method based on available historical data:
- Phase 1 (<14 days): Simple 3-day moving average
- Phase 2 (14-45 days): ETS weighted ensemble (can use Prophet if available)
- Phase 3 (45+ days): Full ensemble with multiple models + external regressors

EXTERNAL REGRESSORS SUPPORTED:
- Temporal: semester_week, is_weekend, day_of_week, is_exam_period
- Spatial: hostel_zone
- Business: merchant_id, category_id, price
- Holidays: holiday_flag
"""

import json
import sys
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import warnings
from typing import Dict, List, Optional, Tuple

# Optional Prophet support
PROPHET_AVAILABLE = False
try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
except ImportError:
    pass

# ETS support
try:
    from statsmodels.tsa.holtwinters import ExponentialSmoothing
    STATSMODELS_AVAILABLE = True
except ImportError:
    STATSMODELS_AVAILABLE = False

# XGBoost support
try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False

warnings.filterwarnings('ignore')


class AbachaForecastEnsemble:
    """Adaptive ensemble forecasting system with external regressors support"""

    def __init__(self, sales_data, events=None, periods=14, interval_width=0.8, regressors=None):
        """
        Initialize ensemble with sales data and external regressors

        Args:
            sales_data: List of {date, quantity} dicts
            events: List of holiday/event dicts
            periods: Number of days to forecast
            interval_width: Confidence interval width (0.8 = 80%)
            regressors: Dict of external features by date
                {
                    '2024-01-15': {
                        'day_of_week': 1,
                        'is_weekend': 0,
                        'semester_week': 5,
                        'is_exam_period': 0,
                        'hostel_zone': 'north',
                        'merchant_id': 42,
                        'category_id': 7,
                        'price': 15000.0,
                        'holiday_flag': 0
                    }
                }
        """
        self.raw_data = sales_data
        self.events = events or []
        self.periods = periods
        self.interval_width = interval_width
        self.regressors = regressors or {}
        self.df = None
        self.phase = None
        self.regressor_features = []  # List of available regressor names
        self.prepare_data()

    def prepare_data(self):
        """Prepare and validate sales data with external regressors"""
        if not self.raw_data:
            self.df = None
            return

        df = pd.DataFrame(self.raw_data)
        df['ds'] = pd.to_datetime(df['date'])
        df['y'] = pd.to_numeric(df['quantity'], errors='coerce')

        # Add external regressors if available
        if self.regressors:
            self._add_regressors(df)

        # Remove NaN values
        df = df.dropna(subset=['y'])

        if len(df) == 0:
            self.df = None
            return

        # Remove outliers using IQR method
        Q1 = df['y'].quantile(0.25)
        Q3 = df['y'].quantile(0.75)
        IQR = Q3 - Q1

        if IQR > 0:
            df = df[(df['y'] >= Q1 - 1.5 * IQR) & (df['y'] <= Q3 + 1.5 * IQR)]

        # Backfill missing recent dates with zeros to ensure forecast starts from today
        last_date = df['ds'].max()
        today = pd.Timestamp.now().normalize()

        if last_date < today - timedelta(days=1):
            # Add missing dates with zero quantity to bring data up to yesterday
            missing_dates = pd.date_range(start=last_date + timedelta(days=1),
                                         end=today - timedelta(days=1),
                                         freq='D')

            if len(missing_dates) > 0:
                missing_df = pd.DataFrame({
                    'ds': missing_dates,
                    'y': 0,  # Use 0 for missing recent days (no sales)
                    'date_str': missing_dates.strftime('%Y-%m-%d')
                })
                df = pd.concat([df, missing_df], ignore_index=True)

        # Keep date string for regressor lookup
        df['date_str'] = df['ds'].dt.strftime('%Y-%m-%d')
        self.df = df.sort_values('ds').reset_index(drop=True)

    def _add_regressors(self, df):
        """Add external regressors to dataframe"""
        try:
            # Extract regressor columns
            regressor_data = {}

            for date_str, features in self.regressors.items():
                regressor_data[pd.to_datetime(date_str)] = features

            # Create regressor dataframe
            regressor_df = pd.DataFrame.from_dict(
                regressor_data, orient='index'
            )
            regressor_df.index.name = 'ds'
            regressor_df = regressor_df.reset_index()

            # Merge with main dataframe
            df_merged = df.merge(regressor_df, on='ds', how='left')

            # Track available regressors
            self.regressor_features = list(features.keys()) if features else []

            # Update df in place
            for col in df_merged.columns:
                if col not in df.columns:
                    df[col] = df_merged[col]

        except Exception as e:
            print(f"Warning: Failed to add regressors: {str(e)}", file=sys.stderr)
            # Continue without regressors

    def _encode_categorical_regressors(self, df):
        """Encode categorical regressors for XGBoost"""
        if 'hostel_zone' in df.columns:
            zone_mapping = {'north': 1, 'south': 2, 'east': 3, 'west': 4, 'center': 5}
            df['hostel_zone_encoded'] = df['hostel_zone'].map(zone_mapping).fillna(0)

        return df

    def _get_regressor_columns(self):
        """Get list of regressor columns to use"""
        if not self.df or not self.regressor_features:
            return []

        available_cols = self.df.columns.tolist()
        numeric_regressors = [
            'day_of_week', 'is_weekend', 'semester_week', 'is_exam_period',
            'merchant_id', 'category_id', 'price', 'holiday_flag'
        ]

        return [col for col in numeric_regressors if col in available_cols]

    def determine_phase(self):
        """Determine which forecasting phase to use based on data availability"""
        if self.df is None or len(self.df) == 0:
            return 'insufficient'

        n_points = len(self.df)

        if n_points < 14:
            self.phase = 'phase1'  # Moving average
        elif n_points < 45:
            self.phase = 'phase2'  # ETS + optional Prophet
        else:
            self.phase = 'phase3'  # Full ensemble

        return self.phase

    def forecast_phase1(self):
        """
        Phase 1: Simple 3-day moving average for <14 days of data
        Fallback method for minimal data
        """
        last_date = self.df['ds'].iloc[-1]
        last_values = self.df['y'].tail(3).values

        if len(last_values) < 3:
            # If less than 3 days, use average or last value
            avg_value = self.df['y'].mean() if len(self.df) > 0 else 0
        else:
            avg_value = last_values.mean()

        forecast_data = []
        for i in range(1, self.periods + 1):
            forecast_date = last_date + timedelta(days=i)
            # Add some minimal trend
            trend_factor = 1.0 + (0.02 * (i / self.periods))
            yhat = max(0, avg_value * trend_factor)

            forecast_data.append({
                'ds': forecast_date.strftime('%Y-%m-%d'),
                'yhat': yhat,
                'yhat_lower': max(0, yhat * 0.7),
                'yhat_upper': yhat * 1.3
            })

        return forecast_data, 'moving_average', 0.0

    def forecast_phase2(self):
        """
        Phase 2: ETS or Prophet for 14-45 days of data
        Weighted ensemble: Prophet (60%) + ETS (40%) if both available
        """
        # Try Prophet if available
        prophet_forecast = None
        if PROPHET_AVAILABLE:
            try:
                prophet_forecast = self._run_prophet()
            except:
                pass

        # Try ETS
        ets_forecast = None
        if STATSMODELS_AVAILABLE:
            try:
                ets_forecast = self._run_ets()
            except:
                pass

        # Decide what to use
        if prophet_forecast is None and ets_forecast is None:
            # Fall back to moving average
            return self.forecast_phase1()

        if prophet_forecast is None:
            return ets_forecast, 'ets_only', 0.0

        if ets_forecast is None:
            return prophet_forecast, 'prophet_only', 0.0

        # Combine forecasts: 60% prophet, 40% ETS
        combined = []
        for i in range(len(prophet_forecast)):
            p_forecast = prophet_forecast[i]
            e_forecast = ets_forecast[i]

            combined_yhat = (0.6 * p_forecast['yhat'] + 0.4 * e_forecast['yhat'])
            combined_lower = (0.6 * p_forecast['yhat_lower'] + 0.4 * e_forecast['yhat_lower'])
            combined_upper = (0.6 * p_forecast['yhat_upper'] + 0.4 * e_forecast['yhat_upper'])

            combined.append({
                'ds': p_forecast['ds'],
                'yhat': max(0, combined_yhat),
                'yhat_lower': max(0, combined_lower),
                'yhat_upper': combined_upper
            })

        return combined, 'prophet_ets_ensemble', 0.0

    def forecast_phase3(self):
        """
        Phase 3: Full ensemble for 45+ days of data
        Weighted ensemble: Prophet (50%) + XGBoost (30%) + ETS (20%)
        """
        # Try Prophet if available
        prophet_forecast = None
        if PROPHET_AVAILABLE:
            try:
                prophet_forecast = self._run_prophet()
            except:
                pass

        # If Prophet failed, try ETS + XGBoost
        if prophet_forecast is None:
            return self.forecast_phase2()

        # Initialize with prophet
        combined = [dict(f) for f in prophet_forecast]

        # Add ETS if available
        if STATSMODELS_AVAILABLE:
            try:
                ets_forecast = self._run_ets()
                if ets_forecast:
                    for i in range(len(combined)):
                        combined[i]['yhat'] = (0.5 * combined[i]['yhat'] + 0.25 * ets_forecast[i]['yhat'])
                        combined[i]['yhat_lower'] = (0.5 * combined[i]['yhat_lower'] + 0.25 * ets_forecast[i]['yhat_lower'])
                        combined[i]['yhat_upper'] = (0.5 * combined[i]['yhat_upper'] + 0.25 * ets_forecast[i]['yhat_upper'])
            except:
                pass

        # Add XGBoost if available
        if XGBOOST_AVAILABLE:
            try:
                xgb_forecast = self._run_xgboost()
                if xgb_forecast:
                    xgb_weight = 0.3 if STATSMODELS_AVAILABLE else 0.2
                    for i in range(len(combined)):
                        combined[i]['yhat'] = (combined[i]['yhat'] * (1 - xgb_weight) + xgb_weight * xgb_forecast[i]['yhat'])
                        combined[i]['yhat_lower'] = (combined[i]['yhat_lower'] * (1 - xgb_weight) + xgb_weight * xgb_forecast[i]['yhat_lower'])
                        combined[i]['yhat_upper'] = (combined[i]['yhat_upper'] * (1 - xgb_weight) + xgb_weight * xgb_forecast[i]['yhat_upper'])
            except:
                pass

        # Ensure non-negative values
        for forecast in combined:
            forecast['yhat'] = max(0, forecast['yhat'])
            forecast['yhat_lower'] = max(0, forecast['yhat_lower'])

        return combined, 'full_ensemble', 0.0

    def _run_prophet(self):
        """Run Prophet forecasting with external regressors support"""
        if not PROPHET_AVAILABLE:
            return None

        try:
            holidays_df = self._create_holidays_dataframe()

            # Prepare regressor columns
            regressor_cols = self._get_regressor_columns()

            model = Prophet(
                daily_seasonality=False,
                yearly_seasonality=len(self.df) > 365,
                weekly_seasonality=len(self.df) > 14,
                seasonality_mode='additive',
                seasonality_prior_scale=10,
                seasonality_strong_prior=10,
                changepoint_prior_scale=0.05,
                interval_width=self.interval_width,
                holidays=holidays_df
            )

            # Add external regressors
            for col in regressor_cols:
                try:
                    model.add_regressor(col)
                except:
                    pass  # Skip if regressor fails

            # Prepare dataframe for Prophet
            df_prophet = self.df[['ds', 'y'] + regressor_cols].copy()
            df_prophet = df_prophet.dropna()

            model.fit(df_prophet)

            # Create future dataframe with regressors
            future = model.make_future_dataframe(periods=self.periods)

            # Forward fill regressors for future periods
            if regressor_cols:
                for col in regressor_cols:
                    if col in df_prophet.columns:
                        last_value = df_prophet[col].iloc[-1]
                        future.loc[future['ds'] > df_prophet['ds'].max(), col] = last_value

            forecast = model.predict(future)

            forecast_data = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(self.periods).copy()
            forecast_data['ds'] = forecast_data['ds'].dt.strftime('%Y-%m-%d')

            return forecast_data.to_dict('records')

        except Exception as e:
            print(f"Prophet forecast failed: {str(e)}", file=sys.stderr)
            return None

    def _run_ets(self):
        """Run Exponential Triple Smoothing"""
        if not STATSMODELS_AVAILABLE:
            return None

        try:
            if len(self.df) < 4:
                return None

            # Fit ETS model
            model = ExponentialSmoothing(
                self.df['y'],
                trend='add' if len(self.df) > 12 else None,
                seasonal=None,
                initialization_method='estimated'
            )
            fitted_model = model.fit()

            # Generate forecast
            forecast = fitted_model.forecast(steps=self.periods)

            last_date = self.df['ds'].iloc[-1]
            forecast_data = []

            for i in range(self.periods):
                forecast_date = last_date + timedelta(days=i + 1)
                yhat = max(0, forecast.iloc[i])

                forecast_data.append({
                    'ds': forecast_date.strftime('%Y-%m-%d'),
                    'yhat': yhat,
                    'yhat_lower': max(0, yhat * 0.8),
                    'yhat_upper': yhat * 1.2
                })

            return forecast_data

        except Exception as e:
            print(f"ETS forecast failed: {str(e)}", file=sys.stderr)
            return None

    def _run_xgboost(self):
        """Run XGBoost on residuals with external regressors support"""
        if not XGBOOST_AVAILABLE or not STATSMODELS_AVAILABLE:
            return None

        try:
            if len(self.df) < 20:
                return None

            # Get ETS baseline forecast for training data
            ets_model = ExponentialSmoothing(
                self.df['y'],
                trend='add' if len(self.df) > 12 else None,
                seasonal=None,
                initialization_method='estimated'
            )
            ets_fitted = ets_model.fit()
            ets_pred = ets_fitted.predict(start=0, end=len(self.df) - 1)

            residuals = self.df['y'].values - ets_pred.values

            # Get external regressors
            regressor_cols = self._get_regressor_columns()

            # Create features for XGBoost (with external regressors)
            features = []
            for i in range(len(residuals)):
                base_features = []

                if i < 3:
                    base_features = [residuals[i], 0, 0, i % 7]
                elif i < 7:
                    base_features = [
                        residuals[i],
                        np.mean(residuals[max(0, i-3):i]),
                        0,
                        i % 7
                    ]
                else:
                    base_features = [
                        residuals[i],
                        np.mean(residuals[i-7:i]),
                        np.std(residuals[i-7:i]),
                        i % 7
                    ]

                # Add external regressors
                if regressor_cols:
                    for col in regressor_cols:
                        if col in self.df.columns:
                            val = self.df[col].iloc[i]
                            base_features.append(val if pd.notna(val) else 0)

                features.append(base_features)

            X_train = np.array(features[:-1])
            y_train = residuals[1:]

            if len(X_train) < 5:
                return None

            # Train XGBoost with external regressors
            model = xgb.XGBRegressor(
                n_estimators=100,
                max_depth=4,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                verbose=0
            )
            model.fit(X_train, y_train)

            # Get ETS forecast for future periods
            ets_future_forecast = ets_model.get_forecast(steps=self.periods)

            # Forecast residuals and add to ETS forecast
            last_residual = residuals[-1]
            residual_forecast = []

            for i in range(self.periods):
                base_features = [
                    last_residual,
                    np.mean(residuals[-7:]) if len(residuals) >= 7 else 0,
                    np.std(residuals[-7:]) if len(residuals) >= 7 else 0,
                    i % 7
                ]

                # Add external regressors for future periods
                if regressor_cols:
                    for col in regressor_cols:
                        if col in self.df.columns:
                            # Use last known value or average
                            val = self.df[col].iloc[-1]
                            base_features.append(val if pd.notna(val) else 0)

                feature = np.array([base_features])
                residual_pred = model.predict(feature)[0]
                residual_forecast.append(residual_pred)
                last_residual = residual_pred

            # Combine with ETS forecast
            last_date = self.df['ds'].iloc[-1]
            forecast_data = []

            ets_fcast = ets_future_forecast.predicted_mean.values
            ets_conf_int = ets_future_forecast.conf_int(alpha=1 - self.interval_width).values

            for i in range(self.periods):
                forecast_date = last_date + timedelta(days=i + 1)
                yhat = max(0, ets_fcast[i] + residual_forecast[i])

                forecast_data.append({
                    'ds': forecast_date.strftime('%Y-%m-%d'),
                    'yhat': yhat,
                    'yhat_lower': max(0, ets_conf_int[i, 0]),
                    'yhat_upper': ets_conf_int[i, 1]
                })

            return forecast_data

        except Exception as e:
            print(f"XGBoost forecast failed: {str(e)}", file=sys.stderr)
            return None

    def _create_holidays_dataframe(self):
        """Create holidays DataFrame for Prophet"""
        if not self.events or not PROPHET_AVAILABLE:
            return None

        holidays_list = []
        for event in self.events:
            holidays_list.append({
                'holiday': event.get('name', 'Event'),
                'ds': pd.to_datetime(event['date']),
                'lower_window': -event.get('days_before', 0),
                'upper_window': event.get('days_after', 0)
            })

        return pd.DataFrame(holidays_list) if holidays_list else None

    def run(self):
        """Run the ensemble forecasting pipeline"""
        phase = self.determine_phase()

        if phase == 'insufficient':
            return {
                'success': False,
                'error': 'Insufficient data for forecasting (need at least 1 data point)',
                'data_points': 0
            }

        if phase == 'phase1':
            forecast_data, method, mape = self.forecast_phase1()
        elif phase == 'phase2':
            result = self.forecast_phase2()
            if result[0] is None:
                return {
                    'success': False,
                    'error': 'Forecast generation failed',
                    'data_points': len(self.df)
                }
            forecast_data, method, mape = result
        else:  # phase3
            result = self.forecast_phase3()
            if result[0] is None:
                return {
                    'success': False,
                    'error': 'Forecast generation failed',
                    'data_points': len(self.df)
                }
            forecast_data, method, mape = result

        # Calculate trend
        if len(forecast_data) >= 14:
            first_week = np.mean([float(f['yhat']) for f in forecast_data[:7]])
            second_week = np.mean([float(f['yhat']) for f in forecast_data[7:14]])
            trend = 'increasing' if second_week > first_week * 1.05 else ('decreasing' if second_week < first_week * 0.95 else 'stable')
        else:
            trend = 'stable'

        return {
            'success': True,
            'forecast': forecast_data,
            'trend': trend,
            'mape': round(mape, 2),
            'periods': self.periods,
            'confidence_level': f'{int(self.interval_width * 100)}%',
            'data_points_used': len(self.df) if self.df is not None else 0,
            'forecast_method': method,
            'phase': phase,
            'last_update': datetime.now().isoformat()
        }


def run_forecast(sales_data, events=None, periods=14, interval_width=0.8, regressors=None):
    """
    Main forecasting function using hybrid ensemble with external regressors

    Args:
        sales_data: List of {date, quantity} dicts
        events: List of {date, name, impact_factor, days_before, days_after} dicts
        periods: Number of days to forecast (default: 14 days)
        interval_width: Confidence interval width (0.8 = 80%, 0.95 = 95%)
        regressors: Dict of external features indexed by date string (YYYY-MM-DD)
            Example:
            {
                '2024-01-15': {
                    'day_of_week': 1,
                    'is_weekend': 0,
                    'semester_week': 5,
                    'is_exam_period': 0,
                    'hostel_zone': 'north',
                    'merchant_id': 42,
                    'category_id': 7,
                    'price': 15000.0,
                    'holiday_flag': 0
                }
            }

    Returns:
        JSON with forecast data, confidence intervals, and metadata
    """
    try:
        ensemble = AbachaForecastEnsemble(
            sales_data, events, periods, interval_width, regressors
        )
        result = ensemble.run()

        # Add regressor info to result
        if regressors:
            result['regressors_used'] = list(
                regressors.get(list(regressors.keys())[0], {}).keys()
                if regressors else []
            )

        return result

    except Exception as e:
        return {
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }


if __name__ == '__main__':
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())

        sales_data = input_data.get('sales_data', [])
        events = input_data.get('events', [])
        periods = input_data.get('periods', 14)
        interval_width = input_data.get('interval_width', 0.8)
        regressors = input_data.get('regressors', None)

        # Run forecast with external regressors
        result = run_forecast(sales_data, events, periods, interval_width, regressors)

        # Output result as JSON
        print(json.dumps(result, indent=2))

    except json.JSONDecodeError as e:
        print(json.dumps({
            'success': False,
            'error': f'Invalid JSON input: {str(e)}'
        }))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }))
        sys.exit(1)
