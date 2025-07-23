export const BASE_URL = "https://ai-powered-interview-preparation-app.onrender.com";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register", //Signup
    LOGIN: "/api/auth/login", //Authenicate user and return jwt token
    GET_PROFILE: "/api/auth/profile", //get logged-in user details
  },

  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image", //upload profile image
  },

  AI: {
    GENERATE_QUESTIONS: "/api/ai/generate-questions", //generate interview questions and answers using Gemini
    GENERATE_EXPLANATION: "/api/ai/generate-explanation", //generate concept explanation using Gemini
  },
  SESSION: {
    CREATE: "/api/sessions/create", //create a new interview session with questions
    GET_ALL: "/api/sessions/my-sessions", //get all user sessions
    GET_ONE: (id) => `/api/sessions/${id}`, //get session details with questions
    DELETE: (id) => `/api/sessions/${id}`, //delete a session
  },
  QUESTION: {
    ADD_TO_SESSION: "/api/questions/add", //Add more questions to a session
    PIN: (id) => `/api/questions/${id}/pin`, //pin or unpin a question,
    UPDATE_NOTE: (id) => `/api/questions/${id}/note`, //update question note
  },
};