# Backend Setup Guide

## Prerequisites

- Python 3.7 or above installed
- A virtual environment configured in the `backend` directory

## Setup Steps

1. **Open Terminal and Navigate to the Backend Directory**
   - If you're not already in the `backend` directory, run the following command:
     ```bash
     cd backend
     ```
2. **create virtual environment**
   - create a virtual environment if you don't have one installed:
     ```bash
     python -m venv env
     ```

3. **Activate the Virtual Environment**
   - Activate the virtual environment using the following command (Windows):
     ```bash
     .\env\Scripts\activate
     ```
   - For macOS/Linux, use:
     ```bash
     source env/bin/activate
     ```

4. **Install Dependencies**
   - Install the required Python packages by running:
     ```bash
     pip install -r requirements.txt
     ```
5. **Add the frebase_cred.json by creating a folder named secrets**
   - This is required to access firestore from the backend

6. **Run the Application**
   - Start the backend server with hot-reloading enabled:
     ```bash
     python -m uvicorn app.main:app --reload
     ```
# Frontend Setup Guide

1. **Open Terminal and Navigate to the Frontend Directory**
   - If you're not already in the `frontend` directory, run the following command:
     ```bash
     cd frontend
     ```
2. **Install Dependencies**
   - Install the required npm packages by running:
     ```bash
     npm install react@18.2.0 react-dom@18.2.0
     ```
      - If you come accross any error try, :
     ```bash
     npm install --force
     ```
3. **Run the Application**
   - Start the frontendd development server:
     ```bash
     npm run dev
     ```
