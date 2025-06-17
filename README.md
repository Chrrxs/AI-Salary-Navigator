# AI Salary Navigator

A comprehensive web application that provides AI professionals with accurate salary predictions and market insights using machine learning. Built as a capstone project for WGU Computer Science program.

![AI Salary Navigator](https://img.shields.io/badge/AI-Salary%20Navigator-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Python](https://img.shields.io/badge/Python-3.9-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

### Core Functionality
- **Salary Prediction**: Get accurate salary estimates based on job title, experience, location, and company size
- **Market Analytics**: Interactive dashboards showing AI job market trends
- **Geographic Analysis**: Choropleth maps displaying salary variations by country
- **Job Market Insights**: Comprehensive analysis of 15,000+ AI job records

### Technical Highlights
- **73% Prediction Accuracy** using ensemble machine learning models
- **Real-time Interactive Visualizations** with 3+ chart types
- **K-Means Clustering** for market segmentation
- **Responsive Design** for desktop and mobile devices

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Visualizations**: Plotly.js, D3.js

### Backend & Data Science
- **API**: Next.js API Routes
- **ML Models**: Scikit-learn (Random Forest, Gradient Boosting)
- **Data Processing**: Pandas, NumPy
- **Analysis**: Python, Jupyter Notebooks

## Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ (for data analysis)
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Chrrxs/AI-Salary-Navigator.git
   cd AI-Salary-Navigator
   ```

2. **Install frontend dependencies**
   ```bash
   cd career-finder
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   ```
   Open http://localhost:3000 in your browser
   ```

## Usage

### Salary Prediction
1. Navigate to the "Predict Salary" tab
2. Fill in the form:
   - Select job title (e.g., ML Engineer)
   - Enter years of experience (0-20)
   - Choose location (20 countries available)
   - Select company size
3. Click "Get Prediction" to see:
   - Predicted salary with confidence interval
   - Salary range (min-max)
   - Model accuracy metrics

### Market Analytics
1. Click "Market Analytics" tab
2. Use filters to explore:
   - Salary distributions by experience level
   - Geographic salary variations
   - Job category breakdowns
   - Remote work trends
3. Export visualizations as PNG or CSV

## API Endpoints

### Prediction Endpoint
```typescript
POST /api/predict

Request Body:
{
  "job_title": "ML Engineer",
  "experience": 5,
  "location": "United States",
  "company_size": "Medium (51-250 employees)",
  "remote_ratio": 50
}

Response:
{
  "predicted_salary": 125000,
  "confidence_interval": {
    "lower": 110000,
    "upper": 140000
  },
  "accuracy": 0.73
}
```

## Data Source

This project uses the **"Global AI Job Market and Salary Trends 2025"** dataset by Bisma Sajjad, available on [Kaggle](https://www.kaggle.com/datasets/bismasajjad/global-ai-job-market-and-salary-trends-2025).

### Dataset Statistics:
- 15,000 job records
- 20 countries covered
- Date range: January 2024 - April 2025
- 12 feature variables

## Screenshots

### Salary Predictor
![Salary Predictor Interface](./screenshots/predictor.png)

### Market Analytics Dashboard
![Analytics Dashboard](./screenshots/analytics.png)

### Geographic Analysis
![Geographic Heatmap](./screenshots/geographic.png)

## Testing

Run the test suite:
```bash
npm run test
```

Run linting:
```bash
npm run lint
```

## Model Performance

- **Algorithm**: Random Forest Regressor
- **R² Score**: 0.73
- **Mean Absolute Error**: $22,519
- **Cross-validation Score**: 0.71 ± 0.03

### Feature Importance:
1. Years of Experience: 68%
2. Location: 18%
3. Company Size: 11%
4. Other Factors: 3%

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Bisma Sajjad** for the comprehensive AI job market dataset
- **WGU** Computer Science program for project guidance
- **Next.js** team for the amazing framework
- **Vercel** for deployment platform

## Contact

**Chris Michael Guzman**  
- GitHub: [@Chrrxs](https://github.com/Chrrxs)
- Project Link: [https://github.com/Chrrxs/AI-Salary-Navigator](https://github.com/Chrrxs/AI-Salary-Navigator)

## Deployment

The application can be deployed on Vercel:

```bash
npm run build
vercel deploy
```

Or use the Vercel Git integration for automatic deployments.

---

**Note**: This project was developed as a capstone project demonstrating full-stack development, data science, and machine learning capabilities.