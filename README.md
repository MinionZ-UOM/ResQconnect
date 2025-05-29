# Backend Setup Guide

## Prerequisites

- Python 3.7 or above installed
- A virtual environment configured in the `backend` directory

## Setup Steps

1.  **Open Terminal and Navigate to the Backend Directory**
    -   If you're not already in the `backend` directory, run the following command:
        ```bash
        cd backend
        ```
2.  **Add Environment Variables**

    Create a `.env` file in the `backend` directory and define the following environment variables:

    ```env
    GOOGLE_APPLICATION_CREDENTIALS=app/secrets/firebase_cred.json
    GOOGLE_APPLICATION_CREDENTIALS_MCP=secrets/firebase_cred.json
    GROQ_API_KEY=your_api_key
    LANGFUSE_SECRET_KEY=""
    LANGFUSE_PUBLIC_KEY=""
    LANGFUSE_HOST=""
    ```
3.  **Create Virtual Environment**
    -   Create a virtual environment if you don't have one installed:
        ```bash
        python -m venv env
        ```

4.  **Activate the Virtual Environment**
    -   Activate the virtual environment using the following command (Windows):
        ```bash
        .\env\Scripts\activate
        ```
    -   For macOS/Linux, use:
        ```bash
        source env/bin/activate
        ```

5.  **Install Dependencies**
    -   Install the required Python packages by running:
        ```bash
        pip install -r requirements.txt
        ```
6.  **Create a folder named `secrets` inside the `app` folder and place the `firebase_cred.json` file inside it.**
    -   This is required to access Firestore from the backend.

7.  **Run the Application**
    -   Start the backend server with hot-reloading enabled:
        ```bash
        python -m uvicorn app.main:app --reload
        ```

---

## Setting up Celery with Redis

This project uses [Celery](https://docs.celeryq.dev/en/stable/) for asynchronous task processing and [Redis](https://redis.io/) as the message broker.

### Environment Variables

Before running the worker, set the following environment variables in your **terminal session**.

```powershell
$env:GROQ_API_KEY         = "your-groq-api-key-here"
$env:LANGFUSE_SECRET_KEY  = "your-langfuse-secret-key-here"
$env:LANGFUSE_PUBLIC_KEY  = "your-langfuse-public-key-here"
$env:LANGFUSE_HOST        = "https://your-langfuse-host-url"
```

**Note that you need to be inside the backend directory and your virtual environment should be activated.**
Then start the Celery worker:

```powershell
celery -A app.celery_config.celery_app worker --loglevel=info --pool=solo
```

---

## Setting up MCP Servers

### 1. DB Server

To set up and run the DB server:

-   If not already in the `backend` directory, navigate there:
    ```bash
    cd backend
    ```
-   Activate your virtual environment:
    ```bash
    .\env\Scripts\activate
    ```
-   Then navigate to the DB server directory:
    ```bash
    cd app/chatbot/mcp_servers/db
    ```
-   Before running the server, add the same `secrets` folder containing `firebase_creds.json` file that we used above, inside the `db` folder. path should be `app/chatbot/mcp_servers/db/secrets`
-   Finally, run the server:
    ```bash
    python server.py
    ```

### 2. RAG Server

To set up and run the RAG server:

-   If not already in the `backend` directory, navigate there:
    ```bash
    cd backend
    ```
-   Activate your virtual environment:
    ```bash
    .\env\Scripts\activate
    ```
-   Then navigate to the RAG server directory:
    ```bash
    cd app/chatbot/mcp_servers/rag
    ```
-   Finally, run the server:
    ```bash
    python server.py
    ```

---

# Frontend Setup Guide

1.  **Open Terminal and Navigate to the Frontend Directory**
    -   If you're not already in the `frontend` directory, run the following command:
        ```bash
        cd frontend
        ```
2.  **Install Dependencies**
    -   Install the required npm packages by running:
        ```bash
        npm install react@18.2.0 react-dom@18.2.0
        ```
    -   If you come across any error, try:
        ```bash
        npm install --force
        ```
3.  **Run the Application**
    -   Start the frontend development server:
        ```bash
        npm run dev
        ```
4.  **Add Environment Variables**

    Create a `.env.local` file in the `frontend` directory and define the following environment variables:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
    NEXT_PUBLIC_API=http://localhost:8000
    ```
