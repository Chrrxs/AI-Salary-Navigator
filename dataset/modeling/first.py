import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import warnings
warnings.filterwarnings('ignore')

# ============================================================================
# DATA EXPLORATION FOR PREDICTION
# ============================================================================

def explore_prediction_data(df):
    """Explore data specifically for prediction modeling"""
    
    print("PREDICTION DATA EXPLORATION")
    print("-" * 40)
    
    # Target variable analysis
    print("TARGET VARIABLE (salary_usd) ANALYSIS:")
    print(f"   Salary range: ${df['salary_usd'].min():,} - ${df['salary_usd'].max():,}")
    print(f"   Average salary: ${df['salary_usd'].mean():,.0f}")
    print(f"   Median salary: ${df['salary_usd'].median():,.0f}")
    print(f"   Standard deviation: ${df['salary_usd'].std():,.0f}")
    print(f"   Missing values: {df['salary_usd'].isnull().sum()}")
    
    # Check for outliers
    q1 = df['salary_usd'].quantile(0.25)
    q3 = df['salary_usd'].quantile(0.75)
    iqr = q3 - q1
    outlier_threshold_low = q1 - 1.5 * iqr
    outlier_threshold_high = q3 + 1.5 * iqr
    outliers = df[(df['salary_usd'] < outlier_threshold_low) | (df['salary_usd'] > outlier_threshold_high)]
    print(f"   Potential outliers: {len(outliers)} ({len(outliers)/len(df)*100:.1f}%)")
    
    # Feature availability check
    print(f"FEATURE AVAILABILITY CHECK:")
    prediction_features = {
        'years_experience': 'Years of Experience',
        'experience_level': 'Experience Level', 
        'company_location': 'Company Location',
        'company_size': 'Company Size',
        'remote_ratio': 'Remote Work Ratio',
        'job_title': 'Job Title',
        'required_skills': 'Required Skills',
        'industry': 'Industry',
        'employment_type': 'Employment Type',
        'benefits_score': 'Benefits Score',
        'job_description_length': 'Job Description Length'
    }
    
    feature_quality = {}
    for col, name in prediction_features.items():
        if col in df.columns:
            missing_pct = df[col].isnull().sum() / len(df) * 100
            unique_vals = df[col].nunique() if df[col].dtype == 'object' else 'continuous'
            feature_quality[col] = {
                'name': name,
                'missing_pct': missing_pct,
                'unique_vals': unique_vals,
                'usable': missing_pct < 30  # Arbitrary threshold
            }
            status = "✅" if missing_pct < 30 else "⚠️" if missing_pct < 50 else "❌"
            print(f"{status} {name}: {missing_pct:.1f}% missing, {unique_vals} unique values")
        else:
            print(f"{name}: Not found in dataset")
    
    return feature_quality

# ============================================================================
# FEATURE ENGINEERING FOR PREDICTION
# ============================================================================

def engineer_prediction_features(df):
    """Engineer features specifically for salary prediction"""
    
    print("FEATURE ENGINEERING")
    print("-" * 40)
    
    # Create a copy for feature engineering
    df_pred = df.copy()
    
    # 1. Experience Features
    print("1. Engineering Experience Features...")
    
    # Experience level encoding (ordinal)
    experience_mapping = {
        'Entry-level': 1, 'EN': 1, 'Junior': 1, 'Jr': 1,
        'Mid-level': 2, 'MI': 2, 'Intermediate': 2,
        'Senior-level': 3, 'SE': 3, 'Senior': 3, 'Sr': 3,
        'Executive-level': 4, 'EX': 4, 'Lead': 4, 'Principal': 4, 'Director': 4
    }
    
    def encode_experience_level(level):
        if pd.isna(level):
            return 2  # Default to mid-level
        level_str = str(level).strip()
        for key, value in experience_mapping.items():
            if key.lower() in level_str.lower():
                return value
        return 2  # Default fallback
    
    df_pred['experience_level_encoded'] = df_pred['experience_level'].apply(encode_experience_level)
    
    # Years experience (handle outliers)
    df_pred['years_experience_capped'] = df_pred['years_experience'].clip(0, 25)  # Cap at 25 years
    
    # Experience consistency check
    df_pred['exp_salary_ratio'] = df_pred['salary_usd'] / (df_pred['years_experience_capped'] + 1)
    
    print(f"Experience level encoded (1-4 scale)")
    print(f"Years experience capped at 25")
    print(f"Experience-salary ratio calculated")
    
    # 2. Location Features
    print("2. Engineering Location Features...")
    
    # Extract country from location (assuming format like "US", "Germany", etc.)
    df_pred['country'] = df_pred['company_location'].str.strip()
    
    # Encode top countries, group others
    top_countries = df_pred['country'].value_counts().head(10).index.tolist()
    df_pred['country_grouped'] = df_pred['country'].apply(
        lambda x: x if x in top_countries else 'Other'
    )
    
    # Location salary premium (compared to median)
    location_salary_median = df_pred.groupby('country_grouped')['salary_usd'].median()
    overall_median = df_pred['salary_usd'].median()
    df_pred['location_salary_premium'] = df_pred['country_grouped'].map(
        lambda x: (location_salary_median.get(x, overall_median) - overall_median) / overall_median
    )
    
    print(f"Countries grouped (top 10 + Other)")
    print(f"Location salary premium calculated")
    
    # 3. Company Features
    print("3. Engineering Company Features...")
    
    # Company size encoding (ordinal)
    size_mapping = {
        'S': 1, 'Small': 1, 'Startup': 1,
        'M': 2, 'Medium': 2, 'Mid-size': 2,
        'L': 3, 'Large': 3, 'Big': 3,
        'XL': 4, 'Enterprise': 4, 'Multinational': 4
    }
    
    def encode_company_size(size):
        if pd.isna(size):
            return 2  # Default to medium
        size_str = str(size).strip()
        for key, value in size_mapping.items():
            if key.lower() in size_str.lower():
                return value
        return 2  # Default fallback
    
    df_pred['company_size_encoded'] = df_pred['company_size'].apply(encode_company_size)
    
    print(f"Company size encoded (1-4 scale)")
    
    # 4. Job Title Features
    print("4. Engineering Job Title Features...")
    
    # Extract job categories from titles
    def categorize_job_title(title):
        if pd.isna(title):
            return 'Other'
        title_lower = str(title).lower()
        
        if any(word in title_lower for word in ['data scientist', 'scientist']):
            return 'Data Scientist'
        elif any(word in title_lower for word in ['machine learning', 'ml engineer', 'ai engineer']):
            return 'ML Engineer'
        elif any(word in title_lower for word in ['data engineer', 'engineer']):
            return 'Data Engineer'
        elif any(word in title_lower for word in ['analyst', 'analysis']):
            return 'Data Analyst'
        elif any(word in title_lower for word in ['manager', 'director', 'lead', 'head']):
            return 'Management'
        elif any(word in title_lower for word in ['research', 'researcher']):
            return 'Research'
        else:
            return 'Other'
    
    df_pred['job_category'] = df_pred['job_title'].apply(categorize_job_title)
    
    print("Job titles categorized into 7 groups")
    
    # 5. Skills Features
    print("5. Engineering Skills Features...")
    
    if 'required_skills' in df_pred.columns:
        # Count number of skills
        df_pred['skills_count'] = df_pred['required_skills'].fillna('').apply(
            lambda x: len([s.strip() for s in str(x).split(',') if s.strip()]) if str(x) != 'nan' else 0
        )
        
        # Extract key skills (binary features for top skills)
        all_skills = []
        for skills_str in df_pred['required_skills'].fillna(''):
            if str(skills_str) != 'nan':
                skills = [s.strip().lower() for s in str(skills_str).split(',')]
                all_skills.extend(skills)
        
        # Top 10 skills
        skill_counts = pd.Series(all_skills).value_counts()
        top_skills = skill_counts.head(10).index.tolist()
        
        for skill in top_skills:
            df_pred[f'skill_{skill.replace(" ", "_")}'] = df_pred['required_skills'].fillna('').apply(
                lambda x: 1 if skill in str(x).lower() else 0
            )
        
        print("Skills count calculated")
        print("Top 10 skills encoded as binary features")
    else:
        df_pred['skills_count'] = 0
        print("Required skills column not found")
    
    # 6. Remote Work Features
    print("6. Engineering Remote Work Features...")
    
    # Remote work categories
    def categorize_remote(ratio):
        if pd.isna(ratio):
            return 1  # Default to hybrid
        elif ratio == 0:
            return 0  # On-site
        elif ratio < 50:
            return 1  # Hybrid
        elif ratio < 100:
            return 2  # Mostly remote
        else:
            return 3  # Fully remote
    
    df_pred['remote_category'] = df_pred['remote_ratio'].apply(categorize_remote)
    
    print(f"Remote work categorized (0-3 scale)")
    
    # 7. Benefits and Description Features
    print("7. Engineering Additional Features...")
    
    # Benefits score (normalize if exists)
    if 'benefits_score' in df_pred.columns and df_pred['benefits_score'].notna().sum() > 0:
        df_pred['benefits_score_normalized'] = (
            df_pred['benefits_score'] - df_pred['benefits_score'].min()
        ) / (df_pred['benefits_score'].max() - df_pred['benefits_score'].min())
        print("Benefits score normalized")
    else:
        df_pred['benefits_score_normalized'] = 0.5  # Default to middle
        print("Benefits score not available, using default")
    
    # Job description length (log transform)
    if 'job_description_length' in df_pred.columns:
        df_pred['job_desc_log'] = np.log(df_pred['job_description_length'] + 1)
        print("Job description length log-transformed")
    else:
        df_pred['job_desc_log'] = 0
        print("Job description length not available")
    
    # Summary of engineered features
    print("FEATURE ENGINEERING SUMMARY:")
    engineered_features = [
        'experience_level_encoded', 'years_experience_capped', 'exp_salary_ratio',
        'country_grouped', 'location_salary_premium', 'company_size_encoded',
        'job_category', 'skills_count', 'remote_category', 'benefits_score_normalized',
        'job_desc_log'
    ]
    
    for feature in engineered_features:
        if feature in df_pred.columns:
            print(f"{feature}")
        else:
            print(f"{feature} - creation failed")
    
    return df_pred, engineered_features

# ============================================================================
# PREPARE FINAL DATASET FOR MODELING
# ============================================================================

def prepare_modeling_dataset(df_pred):
    """Prepare final dataset for modeling"""
    
    print(f"MODELING DATASET PREPARATION")
    print("-" * 40)
    
    # Define features for modeling
    numerical_features = [
        'years_experience_capped',
        'experience_level_encoded',
        'company_size_encoded', 
        'remote_category',
        'skills_count',
        'benefits_score_normalized',
        'job_desc_log',
        'location_salary_premium'
    ]
    
    categorical_features = [
        'country_grouped',
        'job_category'
    ]
    
    # Check feature availability
    available_numerical = [f for f in numerical_features if f in df_pred.columns]
    available_categorical = [f for f in categorical_features if f in df_pred.columns]
    
    print(f"Available numerical features: {len(available_numerical)}")
    for f in available_numerical:
        print(f"{f}")
    
    print(f"\nAvailable categorical features: {len(available_categorical)}")
    for f in available_categorical:
        print(f"{f}")
    
    # Create modeling dataset
    modeling_df = df_pred[available_numerical + available_categorical + ['salary_usd']].copy()
    
    # Handle missing values
    print("HANDLING MISSING VALUES:")
    for col in available_numerical:
        missing_count = modeling_df[col].isnull().sum()
        if missing_count > 0:
            fill_value = modeling_df[col].median()
            modeling_df[col].fillna(fill_value, inplace=True)
            print(f"   Filled {missing_count} missing values in {col} with {fill_value}")
    
    for col in available_categorical:
        missing_count = modeling_df[col].isnull().sum()
        if missing_count > 0:
            fill_value = modeling_df[col].mode()[0] if not modeling_df[col].mode().empty else 'Unknown'
            modeling_df[col].fillna(fill_value, inplace=True)
            print(f"   Filled {missing_count} missing values in {col} with '{fill_value}'")
    
    # One-hot encode categorical variables
    print("ENCODING CATEGORICAL VARIABLES:")
    encoded_df = pd.get_dummies(modeling_df, columns=available_categorical, prefix=available_categorical)
    
    print(f"   Original dataset shape: {modeling_df.shape}")
    print(f"   Encoded dataset shape: {encoded_df.shape}")
    print(f"   Added {encoded_df.shape[1] - modeling_df.shape[1]} dummy variables")
    
    # Separate features and target
    feature_columns = [col for col in encoded_df.columns if col != 'salary_usd']
    X = encoded_df[feature_columns]
    y = encoded_df['salary_usd']
    
    print("FINAL MODELING DATASET:")
    print(f"   Features (X): {X.shape}")
    print(f"   Target (y): {y.shape}")
    print(f"   Missing values in X: {X.isnull().sum().sum()}")
    print(f"   Missing values in y: {y.isnull().sum()}")
    
    return X, y, feature_columns

# ============================================================================
# EXECUTION: RUN THE PIPELINE
# ============================================================================

# Load your cleaned dataset
print("Loading cleaned dataset...")
df = pd.read_csv('../ai_jobs_data_cleaned.csv')
print(f"Dataset loaded: {df.shape[0]:,} rows, {df.shape[1]} columns")

# Run the complete pipeline
feature_quality = explore_prediction_data(df)
df_engineered, engineered_features = engineer_prediction_features(df)
X, y, feature_columns = prepare_modeling_dataset(df_engineered)

print("DATA PREPARATION COMPLETE!")

# Save prepared data for modeling
X.to_csv('X_features_for_modeling.csv', index=False)
y.to_csv('y_target_for_modeling.csv', index=False)
print("Prepared datasets saved:")
print(f"   X_features_for_modeling.csv ({X.shape})")
print(f"   y_target_for_modeling.csv ({y.shape})")