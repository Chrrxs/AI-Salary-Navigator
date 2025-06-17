import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class PredictionValidationError(Exception):
    """Custom exception for prediction input validation errors"""
    pass

def validate_prediction_input(input_data: Dict[str, Any]) -> None:
    """
    Validate prediction input data with flexible matching
    
    Args:
        input_data: Dictionary containing user input from frontend
        
    Raises:
        PredictionValidationError: If validation fails
    """
    
    # Check if input_data is a dictionary
    if not isinstance(input_data, dict):
        raise PredictionValidationError("Input must be a valid JSON object")
    
    # Required fields
    required_fields = ['jobTitle', 'yearsExperience', 'experienceLevel', 'companyLocation']
    
    for field in required_fields:
        if field not in input_data:
            raise PredictionValidationError(f"Missing required field: {field}")
        
        if input_data[field] is None or input_data[field] == '':
            raise PredictionValidationError(f"Field '{field}' cannot be empty")
    
    # Validate and normalize specific fields
    input_data['experienceLevel'] = _validate_and_normalize_experience_level(input_data.get('experienceLevel'))
    input_data['companySize'] = _validate_and_normalize_company_size(input_data.get('companySize'))
    input_data['companyLocation'] = _validate_and_normalize_location(input_data.get('companyLocation'))
    
    _validate_years_experience(input_data.get('yearsExperience'))
    _validate_remote_ratio(input_data.get('remoteRatio'))
    _validate_skills(input_data.get('requiredSkills', []))
    _validate_benefits(input_data.get('benefits', []))
    _validate_job_description(input_data.get('jobDescription', ''))
    
    logger.info("Input validation passed with normalization")

def _validate_and_normalize_experience_level(level: Any) -> str:
    """Validate and normalize experience level with flexible matching"""
    if not isinstance(level, str):
        raise PredictionValidationError("Experience level must be a string")
    
    # Normalize to lowercase for comparison
    level_lower = level.lower().strip()
    
    # Define mappings for flexible matching
    experience_mappings = {
        # Standard values
        'entry level': 'Entry Level',
        'mid level': 'Mid Level',
        'senior level': 'Senior Level',
        'executive': 'Executive',
        
        # Common variations
        'entry': 'Entry Level',
        'junior': 'Entry Level',
        'beginner': 'Entry Level',
        'entry-level': 'Entry Level',
        '0-2 years': 'Entry Level',
        
        'mid': 'Mid Level',
        'middle': 'Mid Level',
        'intermediate': 'Mid Level',
        'mid-level': 'Mid Level',
        '3-5 years': 'Mid Level',
        
        'senior': 'Senior Level',
        'sr': 'Senior Level',
        'experienced': 'Senior Level',
        'senior-level': 'Senior Level',
        '6-10 years': 'Senior Level',
        
        'exec': 'Executive',
        'lead': 'Executive',
        'director': 'Executive',
        'manager': 'Executive',
        'principal': 'Executive',
        'staff': 'Executive',
        '10+ years': 'Executive'
    }
    
    # Try exact match first
    if level_lower in experience_mappings:
        normalized = experience_mappings[level_lower]
        logger.info(f"Normalized experience level '{level}' to '{normalized}'")
        return normalized
    
    # Try partial matching
    for key, value in experience_mappings.items():
        if key in level_lower or level_lower in key:
            logger.info(f"Partial match: normalized experience level '{level}' to '{value}'")
            return value
    
    # If no match found, raise error with helpful message
    valid_options = list(set(experience_mappings.values()))
    raise PredictionValidationError(
        f"Experience level '{level}' not recognized. "
        f"Valid options: {', '.join(valid_options)}. "
        f"Common variations like 'Entry', 'Mid', 'Senior' are also accepted."
    )

def _validate_and_normalize_company_size(size: Any) -> str:
    """Validate and normalize company size with flexible matching"""
    # Company size is optional, but if provided must be valid
    if size is None:
        return 'Medium'  # Default value
    
    if not isinstance(size, str):
        raise PredictionValidationError("Company size must be a string")
    
    size_lower = size.lower().strip()
    
    # Define mappings for flexible matching
    size_mappings = {
        # Standard values
        'small': 'Small',
        'medium': 'Medium', 
        'large': 'Large',
        'enterprise': 'Enterprise',
        
        # Common variations
        'startup': 'Small',
        'small company': 'Small',
        '1-50': 'Small',
        '1-50 employees': 'Small',
        
        'mid': 'Medium',
        'mid-size': 'Medium',
        'medium company': 'Medium',
        '51-250': 'Medium',
        '51-250 employees': 'Medium',
        
        'big': 'Large',
        'large company': 'Large',
        '251-1000': 'Large',
        '251-1000 employees': 'Large',
        
        'huge': 'Enterprise',
        'corporation': 'Enterprise',
        'enterprise company': 'Enterprise',
        '1000+': 'Enterprise',
        '1000+ employees': 'Enterprise'
    }
    
    if size_lower in size_mappings:
        normalized = size_mappings[size_lower]
        logger.info(f"Normalized company size '{size}' to '{normalized}'")
        return normalized
    
    # Try partial matching
    for key, value in size_mappings.items():
        if key in size_lower:
            logger.info(f"Partial match: normalized company size '{size}' to '{value}'")
            return value
    
    # Default to Medium if no match
    logger.warning(f"Unknown company size '{size}', defaulting to 'Medium'")
    return 'Medium'

def _validate_and_normalize_location(location: Any) -> str:
    """Validate and normalize location with flexible matching"""
    if not isinstance(location, str):
        return 'Other'
    
    location_lower = location.lower().strip()
    
    # Define location mappings for normalization
    location_mappings = {
        # Standard values
        'united states': 'United States',
        'canada': 'Canada',
        'united kingdom': 'United Kingdom',
        'germany': 'Germany',
        'france': 'France',
        'denmark': 'Denmark',
        'sweden': 'Sweden',
        'singapore': 'Singapore',
        'israel': 'Israel',
        'austria': 'Austria',
        'india': 'India',
        'china': 'China',
        'other': 'Other',
        
        # Common variations
        'us': 'United States',
        'usa': 'United States',
        'america': 'United States',
        'united states of america': 'United States',
        
        'ca': 'Canada',
        
        'uk': 'United Kingdom',
        'britain': 'United Kingdom',
        'great britain': 'United Kingdom',
        'england': 'United Kingdom',
        
        'de': 'Germany',
        'deutschland': 'Germany',
        
        'fr': 'France',
        
        'dk': 'Denmark',
        
        'se': 'Sweden',
        
        'sg': 'Singapore',
        
        'il': 'Israel',
        
        'at': 'Austria',
        
        'in': 'India',
        
        'cn': 'China'
    }
    
    if location_lower in location_mappings:
        normalized = location_mappings[location_lower]
        logger.info(f"Normalized location '{location}' to '{normalized}'")
        return normalized
    
    # If no match, default to 'Other'
    logger.info(f"Unknown location '{location}', using 'Other'")
    return 'Other'

def _validate_years_experience(years: Any) -> None:
    """Validate years of experience"""
    if not isinstance(years, (int, float)):
        raise PredictionValidationError("Years of experience must be a number")
    
    if years < 0:
        raise PredictionValidationError("Years of experience cannot be negative")
    
    if years > 50:
        raise PredictionValidationError("Years of experience cannot exceed 50")

def _validate_remote_ratio(ratio: Any) -> None:
    """Validate remote work ratio"""
    # Remote ratio is optional
    if ratio is not None:
        if not isinstance(ratio, (int, float)):
            raise PredictionValidationError("Remote ratio must be a number")
        
        if ratio < 0 or ratio > 100:
            raise PredictionValidationError("Remote ratio must be between 0 and 100")

def _validate_skills(skills: Any) -> None:
    """Validate required skills list"""
    if skills is not None:
        if not isinstance(skills, list):
            raise PredictionValidationError("Required skills must be a list")
        
        if len(skills) > 20:
            raise PredictionValidationError("Cannot specify more than 20 skills")
        
        for skill in skills:
            if not isinstance(skill, str):
                raise PredictionValidationError("Each skill must be a string")
            
            if len(skill.strip()) == 0:
                raise PredictionValidationError("Skills cannot be empty strings")
            
            if len(skill) > 100:
                raise PredictionValidationError("Skill names cannot exceed 100 characters")

def _validate_benefits(benefits: Any) -> None:
    """Validate benefits list"""
    if benefits is not None:
        if not isinstance(benefits, list):
            raise PredictionValidationError("Benefits must be a list")
        
        if len(benefits) > 15:
            raise PredictionValidationError("Cannot specify more than 15 benefits")
        
        for benefit in benefits:
            if not isinstance(benefit, str):
                raise PredictionValidationError("Each benefit must be a string")
            
            if len(benefit.strip()) == 0:
                raise PredictionValidationError("Benefits cannot be empty strings")
            
            if len(benefit) > 100:
                raise PredictionValidationError("Benefit names cannot exceed 100 characters")

def _validate_job_description(description: Any) -> None:
    """Validate job description"""
    if description is not None:
        if not isinstance(description, str):
            raise PredictionValidationError("Job description must be a string")
        
        if len(description) > 10000:
            raise PredictionValidationError("Job description cannot exceed 10,000 characters")