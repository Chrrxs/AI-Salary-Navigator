import pandas as pd
import numpy as np
import json
import os
import logging

logger = logging.getLogger(__name__)

class SalaryPredictionPreprocessor:
    """Preprocessing pipeline that ensures feature compatibility with trained model"""
    
    def __init__(self):
        # Load expected feature names from the saved feature_names.json
        self.expected_features = self._load_expected_features()
        
        # Define mappings for categorical encoding (must match training)
        self.experience_level_mapping = {
            'Entry Level': 1,
            'Mid Level': 2, 
            'Senior Level': 3,
            'Executive': 4
        }
        
        self.company_size_mapping = {
            'Small': 1,
            'Medium': 2,
            'Large': 3,
            'Enterprise': 4
        }
        
        self.remote_mapping = {
            'On-site': 0,
            'Hybrid': 1,
            'Remote': 2
        }
        
        # Location salary premiums (must match training data)
        self.location_premiums = {
            'United States': 1.5,
            'Denmark': 1.3,
            'Canada': 1.2,
            'United Kingdom': 1.15,
            'Germany': 1.1,
            'France': 1.05,
            'Sweden': 1.0,
            'Singapore': 0.95,
            'Israel': 0.9,
            'Austria': 0.85,
            'China': 0.4,
            'India': 0.3,
            'Other': 0.8
        }
        
        # Expected countries for one-hot encoding
        self.countries = ['Austria', 'Canada', 'China', 'Denmark', 'France', 
                         'Germany', 'India', 'Israel', 'Other', 'Singapore', 'Sweden']
        
        # Expected job categories for one-hot encoding  
        self.job_categories = ['Data Analyst', 'Data Engineer', 'Data Scientist', 
                              'ML Engineer', 'Management', 'Other']
        
        logger.info(f"Preprocessor initialized with {len(self.expected_features)} expected features")
    
    def _load_expected_features(self):
        """Load expected feature names from saved file"""
        try:
            # Try multiple possible paths for feature_names.json
            possible_paths = [
                'feature_names.json',
                'models/feature_names.json',
                os.path.join(os.path.dirname(__file__), '..', 'feature_names.json'),
                os.path.join(os.path.dirname(__file__), '..', 'models', 'feature_names.json')
            ]
            
            for path in possible_paths:
                if os.path.exists(path):
                    with open(path, 'r') as f:
                        features = json.load(f)
                    logger.info(f"Loaded {len(features)} expected features from {path}")
                    return features
            
            # Fallback to hardcoded expected features if file not found
            logger.warning("feature_names.json not found, using hardcoded feature list")
            return [
                "years_experience_capped",
                "experience_level_encoded", 
                "company_size_encoded",
                "remote_category",
                "skills_count",
                "benefits_score_normalized",
                "job_desc_log",
                "location_salary_premium",
                "country_grouped_Austria",
                "country_grouped_Canada", 
                "country_grouped_China",
                "country_grouped_Denmark",
                "country_grouped_France",
                "country_grouped_Germany",
                "country_grouped_India",
                "country_grouped_Israel",
                "country_grouped_Other",
                "country_grouped_Singapore",
                "country_grouped_Sweden",
                "job_category_Data Analyst",
                "job_category_Data Engineer",
                "job_category_Data Scientist", 
                "job_category_ML Engineer",
                "job_category_Management",
                "job_category_Other"
            ]
        except Exception as e:
            logger.error(f"Error loading expected features: {e}")
            raise
    
    def preprocess_input(self, input_data):
        """
        Preprocess user input to match trained model's feature expectations
        
        Args:
            input_data (dict): Raw user input from frontend
            
        Returns:
            pd.DataFrame: Preprocessed features ready for model prediction
        """
        try:
            logger.info(f"Preprocessing input: {input_data}")
            
            # Create base features
            features = {}
            
            # 1. Years experience (capped at reasonable max)
            years_exp = min(input_data.get('yearsExperience', 0), 25)
            features['years_experience_capped'] = years_exp
            
            # 2. Experience level encoding
            exp_level = input_data.get('experienceLevel', 'Entry Level')
            features['experience_level_encoded'] = self.experience_level_mapping.get(exp_level, 1)
            
            # 3. Company size encoding  
            company_size = input_data.get('companySize', 'Medium')
            features['company_size_encoded'] = self.company_size_mapping.get(company_size, 2)
            
            # 4. Remote work category
            remote_ratio = input_data.get('remoteRatio', 0)
            if remote_ratio == 0:
                features['remote_category'] = 0  # On-site
            elif remote_ratio < 100:
                features['remote_category'] = 1  # Hybrid
            else:
                features['remote_category'] = 2  # Remote
            
            # 5. Skills count
            skills = input_data.get('requiredSkills', [])
            features['skills_count'] = len(skills) if skills else 0
            
            # 6. Benefits score (normalized)
            benefits = input_data.get('benefits', [])
            # Simple benefits scoring: each benefit adds value
            benefits_score = len(benefits) if benefits else 0
            features['benefits_score_normalized'] = min(benefits_score / 10.0, 1.0)  # Normalize to 0-1
            
            # 7. Job description length (log transformed)
            job_desc = input_data.get('jobDescription', '')
            desc_length = len(job_desc.split()) if job_desc else 10
            features['job_desc_log'] = np.log1p(desc_length)
            
            # 8. Location salary premium
            location = input_data.get('companyLocation', 'Other')
            features['location_salary_premium'] = self.location_premiums.get(location, 0.8)
            
            # 9. Country one-hot encoding
            for country in self.countries:
                features[f'country_grouped_{country}'] = 1 if location == country else 0
            
            # 10. Job category one-hot encoding
            job_title = input_data.get('jobTitle', 'Other')
            # Map job title to category
            job_category = self._map_job_title_to_category(job_title)
            
            for category in self.job_categories:
                features[f'job_category_{category}'] = 1 if job_category == category else 0
            
            # Create DataFrame with exact feature order
            feature_df = pd.DataFrame([features])
            
            # Ensure we have all expected features in the right order
            feature_df = self._ensure_feature_order(feature_df)
            
            logger.info(f"Preprocessed features shape: {feature_df.shape}")
            logger.info(f"Feature columns: {list(feature_df.columns)}")
            
            return feature_df
            
        except Exception as e:
            logger.error(f"Preprocessing error: {str(e)}")
            raise
    
    def _map_job_title_to_category(self, job_title):
        """Map job title to standardized category"""
        job_title_lower = job_title.lower()
        
        if any(term in job_title_lower for term in ['data scientist', 'scientist']):
            return 'Data Scientist'
        elif any(term in job_title_lower for term in ['data engineer', 'engineer']):
            return 'Data Engineer'  
        elif any(term in job_title_lower for term in ['data analyst', 'analyst']):
            return 'Data Analyst'
        elif any(term in job_title_lower for term in ['ml engineer', 'machine learning', 'mlops']):
            return 'ML Engineer'
        elif any(term in job_title_lower for term in ['manager', 'director', 'head', 'lead']):
            return 'Management'
        else:
            return 'Other'
    
    def _ensure_feature_order(self, feature_df):
        """Ensure features are in the exact order expected by the model"""
        
        # Add any missing features with default values
        for feature in self.expected_features:
            if feature not in feature_df.columns:
                feature_df[feature] = 0
                logger.warning(f"Added missing feature '{feature}' with default value 0")
        
        # Remove any unexpected features
        unexpected_features = [col for col in feature_df.columns if col not in self.expected_features]
        if unexpected_features:
            logger.warning(f"Removing unexpected features: {unexpected_features}")
            feature_df = feature_df.drop(columns=unexpected_features)
        
        # Reorder to match expected order exactly
        feature_df = feature_df[self.expected_features]
        
        # Verify final shape
        assert feature_df.shape[1] == len(self.expected_features), \
            f"Feature count mismatch: got {feature_df.shape[1]}, expected {len(self.expected_features)}"
        
        logger.info(f"Final feature order verified: {feature_df.shape[1]} features")
        return feature_df

# Create global preprocessor instance
preprocessor = SalaryPredictionPreprocessor()