import kagglehub

import numpy as np # linear algebra
import pandas as pd # data processing, CSV file I/O (e.g. pd.read_csv)

# Set display options to show all rows and columns
pd.set_option('display.max_rows', None)
pd.set_option('display.max_columns', None)
pd.set_option('display.width', None)
pd.set_option('display.max_colwidth', None)

path = kagglehub.dataset_download("bismasajjad/global-ai-job-market-and-salary-trends-2025")

print("Path to dataset files:", path)

df = pd.read_csv(path + r"\ai_job_dataset.csv")

# Print basic information about the DataFrame
print("\nDataFrame Info:")
print(df.info())

# Print first few rows with all columns
print("\nFirst 10 rows:")
print(df.head(10))

# Print summary statistics
print("\nSummary Statistics:")
print(df.describe())

# Print column names
print("\nColumn Names:")
print(df.columns.tolist())