// Re-export Firebase service as API service to maintain compatibility
// All API calls now go through Firebase instead of the backend
import firebaseService from "./firebase";

// Re-export all methods from Firebase service
export default firebaseService;
