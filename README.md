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
5. **Add the frebase_cred.json after by creating a folder named secrets**
   - This is required to access firestore from the backend

6. **Run the Application**
   - Start the backend server with hot-reloading enabled:
     ```bash
     python -m uvicorn app.main:app --reload
     ```
