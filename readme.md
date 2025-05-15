# Elevance

Elevance is an intelligent virtual career advisor platform designed to help users elevate their skills and advance their careers. It combines AI-driven insights, personalized recommendations, and a collaborative community to provide a comprehensive learning and growth experience.

## Features

- **Personalized Career Assessments**: Analyze user skills and interests to provide tailored career recommendations.
- **AI-Driven Insights**: Get recommendations for courses, career paths, and market trends.
- **NFT Skill Badges**: Earn blockchain-based badges for verified achievements.
- **Resume & Interview Tips**: Generate personalized tips to enhance job applications.
- **Certificate Verification**: Validate certifications using image processing.

## Tech Stack

- **Frontend**: React, Next.js, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, Python (Flask), Clerk Authentication
- **AI/ML**: Natural Language Processing (NLP), AI-driven recommendation engines
- **Blockchain**: NFT badge generation
- **Database**: MongoDB
- **APIs**: Job market analysis, course recommendations

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MILANBHADARKA/elevance.git
   cd elevance
   ```

2. Install dependencies:
   ```bash
   cd website
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the website folder root directory.
   - Add the following variables:
    ```env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

    CLERK_SECRET_KEY=

    GEMINI_KEY=
    GROQ_API_KEY=

    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=

    MONGODB_URI=
    
    EMAIL_USER=
    EMAIL_PASS=
    ```

4. Run the next.js development server:
   ```bash
   npm run dev
   ```

5. Open the app in your browser:
   ```
   http://localhost:3000
   ```

6. Navigate to the Python backend directory:
   ```bash
   #in a new terminal
   cd python-backend
   ```

7. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

8. Activate the virtual environment:
   ```bash
   venv\Scripts\activate    

    #or for Linux/MacOS
    source venv/bin/activate 
   ```

9. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

10. Run the Python backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

11. Access the backend API:
   ```
   http://localhost:8000
   ```

## Project Structure

```
elevance/
├── website/                     # Frontend application
│   ├── public/                 # Static assets
│   ├── .env                    # Environment variables
│   ├── src/
│   │   ├── app/                 # Next.js pages and layouts
│   │   ├── components/          # Reusable React components
│   │   ├── providers/           # Context and theme providers
│   │   ├── styles/              # Global styles
│   │   ├── lib/                 # Utility functions
│   ├── package.json             # Frontend dependencies
│   └── ...existing code...
├── python-backend/              # Backend application
│   ├── main.py                  # Python backend entry point
│   ├── requirements.txt         # Python dependencies
│   └── ...existing code...
├── flowchart.dio                # System architecture flowchart
├── readme.md                    # Project documentation
└── ...existing code...
```

## How It Works

1. **User Registration**: Users sign up and provide their details, including resumes and skill assessments.
2. **AI Processing**: The system analyzes user data using AI/ML models to generate insights.
3. **Recommendations**: Users receive personalized career paths, course suggestions, and job market insights.
4. **Community Collaboration**: Users can connect with mentors and peers for guidance.
5. **Achievements**: Earn NFT badges and validate certifications to showcase skills.

## Contributing

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

## Credits

This project was built by:
- [Milan Bhadarka](https://github.com/MILANBHADARKA)
- [Devan Chauhan](https://github.com/Devan019)
- [Surydeep Gohil](https://github.com/Suryadeep36)
- [Manil Modi](https://github.com/ManilModi)

It was developed under the **Tic-Tech-Toi'25 Hackathon**.

Elevate your skills. Advance your career. 🚀
