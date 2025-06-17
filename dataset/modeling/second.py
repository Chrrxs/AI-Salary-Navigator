import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.preprocessing import StandardScaler
import joblib
import warnings
warnings.filterwarnings('ignore')

# ============================================================================
# LOAD PREPARED DATA AND SPLIT
# ============================================================================

def load_and_split_data():
    """Load prepared data and create train/test splits"""
    
    print("\nLOADING AND SPLITTING DATA")
    print("-" * 40)
    
    # Load prepared datasets
    X = pd.read_csv('X_features_for_modeling.csv')
    y = pd.read_csv('y_target_for_modeling.csv')['salary_usd']  # Extract series
    
    print(f"Features loaded: {X.shape}")
    print(f"Target loaded: {y.shape}")
    
    # Display feature names
    print(f"FEATURES IN MODEL ({len(X.columns)}):")
    for i, col in enumerate(X.columns, 1):
        print(f"   {i:2d}. {col}")
    
    # Train/validation/test split (70/15/15)
    X_temp, X_test, y_temp, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42, stratify=None
    )
    
    X_train, X_val, y_train, y_val = train_test_split(
        X_temp, y_temp, test_size=0.176, random_state=42  # 0.176 * 0.85 ≈ 0.15
    )
    
    print(f"DATA SPLITS:")
    print(f"   Training set:   {X_train.shape[0]:,} samples ({X_train.shape[0]/len(X)*100:.1f}%)")
    print(f"   Validation set: {X_val.shape[0]:,} samples ({X_val.shape[0]/len(X)*100:.1f}%)")
    print(f"   Test set:       {X_test.shape[0]:,} samples ({X_test.shape[0]/len(X)*100:.1f}%)")
    
    # Basic statistics by split
    print(f"SALARY STATISTICS BY SPLIT:")
    splits = [('Train', y_train), ('Validation', y_val), ('Test', y_test)]
    for name, y_split in splits:
        print(f"   {name:10s}: Mean=${y_split.mean():,.0f}, Std=${y_split.std():,.0f}")
    
    return X_train, X_val, X_test, y_train, y_val, y_test

# ============================================================================
# BUILD BASELINE LINEAR REGRESSION MODEL
# ============================================================================

def build_linear_regression(X_train, y_train, X_val, y_val):
    """Build and evaluate Linear Regression baseline model"""
    
    print(f"\nLINEAR REGRESSION BASELINE MODEL")
    print("-" * 40)
    
    # Scale features for linear regression
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    
    # Build model
    lr_model = LinearRegression()
    lr_model.fit(X_train_scaled, y_train)
    
    # Make predictions
    y_train_pred = lr_model.predict(X_train_scaled)
    y_val_pred = lr_model.predict(X_val_scaled)
    
    # Calculate metrics
    train_r2 = r2_score(y_train, y_train_pred)
    val_r2 = r2_score(y_val, y_val_pred)
    train_mae = mean_absolute_error(y_train, y_train_pred)
    val_mae = mean_absolute_error(y_val, y_val_pred)
    train_rmse = np.sqrt(mean_squared_error(y_train, y_train_pred))
    val_rmse = np.sqrt(mean_squared_error(y_val, y_val_pred))
    
    print(f"LINEAR REGRESSION PERFORMANCE:")
    print(f"   Training R²:      {train_r2:.4f}")
    print(f"   Validation R²:    {val_r2:.4f}")
    print(f"   Training MAE:     ${train_mae:,.0f}")
    print(f"   Validation MAE:   ${val_mae:,.0f}")
    print(f"   Training RMSE:    ${train_rmse:,.0f}")
    print(f"   Validation RMSE:  ${val_rmse:,.0f}")
    
    # Feature importance (coefficients)
    feature_importance = pd.DataFrame({
        'feature': X_train.columns,
        'coefficient': lr_model.coef_,
        'abs_coefficient': np.abs(lr_model.coef_)
    }).sort_values('abs_coefficient', ascending=False)
    
    print(f"TOP 10 MOST IMPORTANT FEATURES (Linear Regression):")
    for i, row in feature_importance.head(10).iterrows():
        impact = "+" if row['coefficient'] > 0 else "-"
        print(f"   {impact} {row['feature']:<25}: {row['coefficient']:>8.0f}")
    
    # Cross-validation
    cv_scores = cross_val_score(lr_model, X_train_scaled, y_train, cv=5, scoring='r2')
    print(f"5-Fold Cross-Validation R²: {cv_scores.mean():.4f} (±{cv_scores.std()*2:.4f})")
    
    lr_results = {
        'model': lr_model,
        'scaler': scaler,
        'train_r2': train_r2,
        'val_r2': val_r2,
        'train_mae': train_mae,
        'val_mae': val_mae,
        'cv_r2_mean': cv_scores.mean(),
        'cv_r2_std': cv_scores.std(),
        'feature_importance': feature_importance
    }
    
    return lr_results

# ============================================================================
# BUILD RANDOM FOREST MODEL
# ============================================================================

def build_random_forest(X_train, y_train, X_val, y_val):
    """Build and tune Random Forest model"""
    
    print("RANDOM FOREST ADVANCED MODEL")
    print("-" * 40)
    
    # Initial Random Forest with default parameters
    print("Building initial Random Forest...")
    rf_model = RandomForestRegressor(
        n_estimators=100,
        random_state=42,
        n_jobs=-1
    )
    
    rf_model.fit(X_train, y_train)
    
    # Make predictions
    y_train_pred = rf_model.predict(X_train)
    y_val_pred = rf_model.predict(X_val)
    
    # Calculate metrics
    train_r2 = r2_score(y_train, y_train_pred)
    val_r2 = r2_score(y_val, y_val_pred)
    train_mae = mean_absolute_error(y_train, y_train_pred)
    val_mae = mean_absolute_error(y_val, y_val_pred)
    train_rmse = np.sqrt(mean_squared_error(y_train, y_train_pred))
    val_rmse = np.sqrt(mean_squared_error(y_val, y_val_pred))
    
    print(f"RANDOM FOREST PERFORMANCE (Initial):")
    print(f"   Training R²:      {train_r2:.4f}")
    print(f"   Validation R²:    {val_r2:.4f}")
    print(f"   Training MAE:     ${train_mae:,.0f}")
    print(f"   Validation MAE:   ${val_mae:,.0f}")
    print(f"   Training RMSE:    ${train_rmse:,.0f}")
    print(f"   Validation RMSE:  ${val_rmse:,.0f}")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': X_train.columns,
        'importance': rf_model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("TOP 10 MOST IMPORTANT FEATURES (Random Forest):")
    for i, row in feature_importance.head(10).iterrows():
        print(f"   {row['feature']:<25}: {row['importance']:.4f}")
    
    # Hyperparameter tuning (simplified for speed)
    print("HYPERPARAMETER TUNING:")
    param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [10, 20, None],
        'min_samples_split': [2, 5],
        'min_samples_leaf': [1, 2]
    }
    
    # Use a smaller sample for grid search to speed up
    sample_size = min(5000, len(X_train))
    sample_indices = np.random.choice(len(X_train), sample_size, replace=False)
    X_train_sample = X_train.iloc[sample_indices]
    y_train_sample = y_train.iloc[sample_indices]
    
    print(f"Running grid search on {sample_size:,} samples...")
    grid_search = GridSearchCV(
        RandomForestRegressor(random_state=42, n_jobs=-1),
        param_grid,
        cv=3,
        scoring='r2',
        n_jobs=-1,
        verbose=0
    )
    
    grid_search.fit(X_train_sample, y_train_sample)
    
    print(f"Best parameters: {grid_search.best_params_}")
    print(f"Best CV score: {grid_search.best_score_:.4f}")
    
    # Train final model with best parameters on full dataset
    print(f"\nTraining final model with best parameters...")
    best_rf_model = RandomForestRegressor(
        **grid_search.best_params_,
        random_state=42,
        n_jobs=-1
    )
    
    best_rf_model.fit(X_train, y_train)
    
    # Final evaluation
    y_train_pred_final = best_rf_model.predict(X_train)
    y_val_pred_final = best_rf_model.predict(X_val)
    
    final_train_r2 = r2_score(y_train, y_train_pred_final)
    final_val_r2 = r2_score(y_val, y_val_pred_final)
    final_train_mae = mean_absolute_error(y_train, y_train_pred_final)
    final_val_mae = mean_absolute_error(y_val, y_val_pred_final)
    
    print(f"RANDOM FOREST PERFORMANCE (Tuned):")
    print(f"   Training R²:      {final_train_r2:.4f}")
    print(f"   Validation R²:    {final_val_r2:.4f}")
    print(f"   Training MAE:     ${final_train_mae:,.0f}")
    print(f"   Validation MAE:   ${final_val_mae:,.0f}")
    
    # Cross-validation on final model
    cv_scores = cross_val_score(best_rf_model, X_train, y_train, cv=5, scoring='r2')
    print(f"5-Fold Cross-Validation R²: {cv_scores.mean():.4f} (±{cv_scores.std()*2:.4f})")
    
    rf_results = {
        'model': best_rf_model,
        'train_r2': final_train_r2,
        'val_r2': final_val_r2,
        'train_mae': final_train_mae,
        'val_mae': final_val_mae,
        'cv_r2_mean': cv_scores.mean(),
        'cv_r2_std': cv_scores.std(),
        'best_params': grid_search.best_params_,
        'feature_importance': pd.DataFrame({
            'feature': X_train.columns,
            'importance': best_rf_model.feature_importances_
        }).sort_values('importance', ascending=False)
    }
    
    return rf_results

# ============================================================================
# MODEL COMPARISON AND SELECTION
# ============================================================================

def compare_models(lr_results, rf_results, X_test, y_test):
    """Compare models and select the best one"""
    
    print("MODEL COMPARISON AND SELECTION")
    print("-" * 40)
    
    # Test both models on test set
    print("Evaluating models on test set...")
    
    # Linear Regression test performance
    X_test_scaled = lr_results['scaler'].transform(X_test)
    lr_test_pred = lr_results['model'].predict(X_test_scaled)
    lr_test_r2 = r2_score(y_test, lr_test_pred)
    lr_test_mae = mean_absolute_error(y_test, lr_test_pred)
    
    # Random Forest test performance
    rf_test_pred = rf_results['model'].predict(X_test)
    rf_test_r2 = r2_score(y_test, rf_test_pred)
    rf_test_mae = mean_absolute_error(y_test, rf_test_pred)
    
    # Comparison table
    comparison_df = pd.DataFrame({
        'Metric': ['Training R²', 'Validation R²', 'Test R²', 'Training MAE', 'Validation MAE', 'Test MAE', 'CV R² Mean'],
        'Linear Regression': [
            f"{lr_results['train_r2']:.4f}",
            f"{lr_results['val_r2']:.4f}",
            f"{lr_test_r2:.4f}",
            f"${lr_results['train_mae']:,.0f}",
            f"${lr_results['val_mae']:,.0f}",
            f"${lr_test_mae:,.0f}",
            f"{lr_results['cv_r2_mean']:.4f}"
        ],
        'Random Forest': [
            f"{rf_results['train_r2']:.4f}",
            f"{rf_results['val_r2']:.4f}",
            f"{rf_test_r2:.4f}",
            f"${rf_results['train_mae']:,.0f}",
            f"${rf_results['val_mae']:,.0f}",
            f"${rf_test_mae:,.0f}",
            f"{rf_results['cv_r2_mean']:.4f}"
        ]
    })
    
    print("MODEL COMPARISON:")
    print(comparison_df.to_string(index=False))
    
    # Select best model based on validation R²
    if rf_results['val_r2'] > lr_results['val_r2']:
        best_model_name = "Random Forest"
        best_model = rf_results['model']
        best_scaler = None  # RF doesn't need scaling
        best_test_r2 = rf_test_r2
        best_test_mae = rf_test_mae
    else:
        best_model_name = "Linear Regression"
        best_model = lr_results['model']
        best_scaler = lr_results['scaler']
        best_test_r2 = lr_test_r2
        best_test_mae = lr_test_mae
    
    print(f"BEST MODEL: {best_model_name}")
    print(f"   Test R²:  {best_test_r2:.4f}")
    print(f"   Test MAE: ${best_test_mae:,.0f}")
    
    # Save best model
    joblib.dump(best_model, f'best_salary_prediction_model.pkl')
    if best_scaler:
        joblib.dump(best_scaler, f'feature_scaler.pkl')
    
    print(f"MODEL SAVED:")
    print(f"   best_salary_prediction_model.pkl")
    if best_scaler:
        print(f"   feature_scaler.pkl")
    
    return {
        'best_model_name': best_model_name,
        'best_model': best_model,
        'best_scaler': best_scaler,
        'test_r2': best_test_r2,
        'test_mae': best_test_mae,
        'lr_results': lr_results,
        'rf_results': rf_results,
        'comparison_df': comparison_df
    }

# ============================================================================
# CREATE PREDICTION FUNCTION FOR DASHBOARD
# ============================================================================

print("Starting model building pipeline...")

# Load and split data
X_train, X_val, X_test, y_train, y_val, y_test = load_and_split_data()

# Build Linear Regression
lr_results = build_linear_regression(X_train, y_train, X_val, y_val)

# Build Random Forest
rf_results = build_random_forest(X_train, y_train, X_val, y_val)

# Compare and select best model
model_results = compare_models(lr_results, rf_results, X_test, y_test)

print("MODEL BUILDING COMPLETE!")
print(f"Best model: {model_results['best_model_name']}")
print(f"Test R² Score: {model_results['test_r2']:.4f}")
print(f"Test MAE: ${model_results['test_mae']:,.0f}")