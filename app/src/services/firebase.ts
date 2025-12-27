import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser,
} from "firebase/auth";
import { db, auth } from "../config/firebase.config";
import {
  User,
  LoginCredentials,
  SignupCredentials,
  Bike,
  BikeCreate,
  Expense,
  ExpenseCreate,
  DashboardStats,
  BrandModelsMap,
  Document,
  DocumentCreate,
} from "../types";
import { BIKE_BRANDS_MODELS, EXPENSE_TYPES, DOCUMENT_TYPES } from "../config/masterData";

class FirebaseService {
  // Helper to convert Firestore timestamp to ISO string
  private timestampToISO(timestamp: any): string {
    if (timestamp?.toDate) {
      return timestamp.toDate().toISOString();
    }
    if (timestamp instanceof Date) {
      return timestamp.toISOString();
    }
    if (typeof timestamp === "string") {
      return timestamp;
    }
    return new Date().toISOString();
  }

  // Helper to convert ISO string to Firestore timestamp
  private isoToTimestamp(isoString: string): Timestamp {
    return Timestamp.fromDate(new Date(isoString));
  }

  // Auth APIs
  async login(credentials: LoginCredentials): Promise<{ access_token: string; token_type: string; user: User }> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      
      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (!userDoc.exists()) {
        console.error("❌ User profile not found in Firestore for uid:", userCredential.user.uid);
        throw new Error("User profile not found");
      }
      
      const userData = userDoc.data();
      const user: User = {
        email: userData.email,
        name: userData.name,
        created_at: this.timestampToISO(userData.created_at),
      };

      // Get the ID token for access_token
      const token = await userCredential.user.getIdToken();
      
      return {
        access_token: token,
        token_type: "Bearer",
        user,
      };
    } catch (error: any) {
      console.error("❌ Login error:", error);
      console.error("Error code:", error?.code);
      console.error("Error message:", error?.message);
      if (error?.code === 'permission-denied') {
        console.error("⚠️  Firestore permission denied! Check security rules.");
      }
      throw error;
    }
  }

  async signup(credentials: SignupCredentials): Promise<{ access_token: string; token_type: string; user: User }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Create user profile in Firestore using uid as document ID
      const userData = {
        email: credentials.email,
        name: credentials.name,
        created_at: Timestamp.now(),
      };
      
      const userRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userRef, userData);
      console.log("✅ User profile created in Firestore:", userCredential.user.uid);

      const user: User = {
        email: credentials.email,
        name: credentials.name,
        created_at: this.timestampToISO(userData.created_at),
      };

      const token = await userCredential.user.getIdToken();
      
      return {
        access_token: token,
        token_type: "Bearer",
        user,
      };
    } catch (error: any) {
      console.error("❌ Signup error:", error);
      console.error("Error code:", error?.code);
      console.error("Error message:", error?.message);
      if (error?.code === 'permission-denied') {
        console.error("⚠️  Firestore permission denied! Check security rules.");
      }
      throw error;
    }
  }

  async updateName(name: string): Promise<User> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Update user profile in Firestore
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, { name });

    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    
    return {
      email: userData!.email,
      name: userData!.name,
      created_at: this.timestampToISO(userData!.created_at),
    };
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error("User not authenticated");
    }

    // Reauthenticate user
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPassword
    );
    await reauthenticateWithCredential(currentUser, credential);

    // Update password
    await updatePassword(currentUser, newPassword);

    return { message: "Password updated successfully" };
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  // Google Sign-In
  async signInWithGoogle(idToken: string): Promise<{ access_token: string; token_type: string; user: User }> {
    try {
      // For OAuth ID token, we only need idToken
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      
      // Check if user profile exists in Firestore
      let userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      
      if (!userDoc.exists()) {
        // Create user profile if it doesn't exist
        const userData = {
          email: userCredential.user.email || "",
          name: userCredential.user.displayName || userCredential.user.email?.split("@")[0] || "User",
          created_at: Timestamp.now(),
        };
        
        const userRef = doc(db, "users", userCredential.user.uid);
        await setDoc(userRef, userData);
        console.log("✅ Google user profile created in Firestore:", userCredential.user.uid);
        
        userDoc = await getDoc(userRef);
      }
      
      const userData = userDoc.data();
      const user: User = {
        email: userData!.email,
        name: userData!.name,
        created_at: this.timestampToISO(userData!.created_at),
      };

      const token = await userCredential.user.getIdToken();
      
      return {
        access_token: token,
        token_type: "Bearer",
        user,
      };
    } catch (error: any) {
      console.error("❌ Google Sign-In error:", error);
      console.error("Error code:", error?.code);
      console.error("Error message:", error?.message);
      throw error;
    }
  }

  // Bike APIs
  async getBikes(): Promise<Bike[]> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    try {
      const bikesRef = collection(db, "bikes");
      // Note: This requires a composite index: user_id (ASC) + created_at (DESC)
      // Firebase will prompt to create it when the query runs, or create it manually in Firebase Console
      const q = query(
        bikesRef, 
        where("user_id", "==", currentUser.uid), 
        orderBy("created_at", "desc")
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        user_id: doc.data().user_id,
        brand: doc.data().brand || undefined,
        model: doc.data().model,
        registration: doc.data().registration || undefined,
        image_url: doc.data().image_url || undefined,
        created_at: this.timestampToISO(doc.data().created_at),
      }));
    } catch (error: any) {
      console.error("❌ Error getting bikes:", error);
      console.error("Error code:", error?.code);
      console.error("Error message:", error?.message);
      if (error?.code === 'permission-denied') {
        console.error("⚠️  Firestore permission denied! Check security rules.");
      } else if (error?.code === 'failed-precondition') {
        console.error("⚠️  Missing Firestore index! Create the composite index in Firebase Console.");
      }
      throw error;
    }
  }

  async createBike(bike: BikeCreate): Promise<Bike> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const bikeData = {
      user_id: currentUser.uid,
      brand: bike.brand || null,
      model: bike.model,
      registration: bike.registration || null,
      image_url: bike.image_url || null,
      created_at: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, "bikes"), bikeData);
    
    return {
      id: docRef.id,
      user_id: bikeData.user_id,
      brand: bikeData.brand || undefined,
      model: bikeData.model,
      registration: bikeData.registration || undefined,
      image_url: bikeData.image_url || undefined,
      created_at: this.timestampToISO(bikeData.created_at),
    };
  }

  async updateBike(id: string, bike: Partial<BikeCreate>): Promise<Bike> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const bikeRef = doc(db, "bikes", id);
    const bikeDoc = await getDoc(bikeRef);
    
    if (!bikeDoc.exists()) {
      throw new Error("Bike not found");
    }
    
    if (bikeDoc.data().user_id !== currentUser.uid) {
      throw new Error("Unauthorized");
    }

    const updateData: any = {};
    if (bike.brand !== undefined) updateData.brand = bike.brand || null;
    if (bike.model !== undefined) updateData.model = bike.model;
    if (bike.registration !== undefined) updateData.registration = bike.registration || null;
    if (bike.image_url !== undefined) updateData.image_url = bike.image_url || null;

    await updateDoc(bikeRef, updateData);
    
    const updatedDoc = await getDoc(bikeRef);
    const data = updatedDoc.data();
    
    return {
      id: updatedDoc.id,
      user_id: data!.user_id,
      brand: data!.brand || undefined,
      model: data!.model,
      registration: data!.registration || undefined,
      image_url: data!.image_url || undefined,
      created_at: this.timestampToISO(data!.created_at),
    };
  }

  async deleteBike(id: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const bikeRef = doc(db, "bikes", id);
    const bikeDoc = await getDoc(bikeRef);
    
    if (!bikeDoc.exists()) {
      throw new Error("Bike not found");
    }
    
    if (bikeDoc.data().user_id !== currentUser.uid) {
      throw new Error("Unauthorized");
    }

    // Delete all associated expenses
    const expensesRef = collection(db, "expenses");
    const expensesQuery = query(expensesRef, where("bike_id", "==", id));
    const expensesSnapshot = await getDocs(expensesQuery);
    
    const batch = writeBatch(db);
    expensesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // Delete all associated documents
    const documentsRef = collection(db, "documents");
    const documentsQuery = query(documentsRef, where("bike_id", "==", id));
    const documentsSnapshot = await getDocs(documentsQuery);
    
    documentsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // Delete the bike
    batch.delete(bikeRef);
    
    await batch.commit();
  }

  // Expense APIs
  async getExpenses(filters?: {
    bike_id?: string;
    type?: string;
    search?: string;
  }): Promise<Expense[]> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    try {
      const expensesRef = collection(db, "expenses");
      let q;
      
      if (filters?.bike_id) {
        // Query with bike_id filter - order by date only (requires composite index)
        q = query(
          expensesRef,
          where("user_id", "==", currentUser.uid),
          where("bike_id", "==", filters.bike_id),
          orderBy("date", "desc")
        );
      } else {
        // Query without bike_id filter - order by date only
        q = query(
          expensesRef,
          where("user_id", "==", currentUser.uid),
          orderBy("date", "desc")
        );
      }

      const snapshot = await getDocs(q);
    let expenses = snapshot.docs.map((doc) => ({
      id: doc.id,
      user_id: doc.data().user_id,
      bike_id: doc.data().bike_id,
      type: doc.data().type,
      amount: doc.data().amount,
      date: this.timestampToISO(doc.data().date),
      odometer: doc.data().odometer || undefined,
      notes: doc.data().notes || undefined,
      litres: doc.data().litres || undefined,
      is_full_tank: doc.data().is_full_tank || undefined,
      price_per_litre: doc.data().price_per_litre || undefined,
      created_at: this.timestampToISO(doc.data().created_at),
    }));

    // Sort by date then created_at (client-side for better control)
    expenses.sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Apply filters that can't be done in Firestore query
    if (filters?.type) {
      expenses = expenses.filter((e) => e.type === filters.type);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      expenses = expenses.filter(
        (e) =>
          e.notes?.toLowerCase().includes(searchLower) ||
          e.type.toLowerCase().includes(searchLower)
      );
    }

      return expenses;
    } catch (error: any) {
      console.error("❌ Error getting expenses:", error);
      console.error("Error code:", error?.code);
      console.error("Error message:", error?.message);
      if (error?.code === 'permission-denied') {
        console.error("⚠️  Firestore permission denied! Check security rules.");
      } else if (error?.code === 'failed-precondition') {
        console.error("⚠️  Missing Firestore index! Create the composite index in Firebase Console.");
      }
      throw error;
    }
  }

  async createExpense(expense: ExpenseCreate): Promise<Expense> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const expenseData = {
      user_id: currentUser.uid,
      bike_id: expense.bike_id,
      type: expense.type,
      amount: expense.amount,
      date: this.isoToTimestamp(expense.date),
      odometer: expense.odometer || null,
      notes: expense.notes || null,
      litres: expense.litres || null,
      is_full_tank: expense.is_full_tank || null,
      price_per_litre: expense.price_per_litre || null,
      created_at: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, "expenses"), expenseData);
    
    return {
      id: docRef.id,
      user_id: expenseData.user_id,
      bike_id: expenseData.bike_id,
      type: expenseData.type,
      amount: expenseData.amount,
      date: this.timestampToISO(expenseData.date),
      odometer: expenseData.odometer || undefined,
      notes: expenseData.notes || undefined,
      litres: expenseData.litres || undefined,
      is_full_tank: expenseData.is_full_tank || undefined,
      price_per_litre: expenseData.price_per_litre || undefined,
      created_at: this.timestampToISO(expenseData.created_at),
    };
  }

  async updateExpense(id: string, expense: Partial<ExpenseCreate>): Promise<Expense> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const expenseRef = doc(db, "expenses", id);
    const expenseDoc = await getDoc(expenseRef);
    
    if (!expenseDoc.exists()) {
      throw new Error("Expense not found");
    }
    
    if (expenseDoc.data().user_id !== currentUser.uid) {
      throw new Error("Unauthorized");
    }

    const updateData: any = {};
    if (expense.bike_id !== undefined) updateData.bike_id = expense.bike_id;
    if (expense.type !== undefined) updateData.type = expense.type;
    if (expense.amount !== undefined) updateData.amount = expense.amount;
    if (expense.date !== undefined) updateData.date = this.isoToTimestamp(expense.date);
    if (expense.odometer !== undefined) updateData.odometer = expense.odometer || null;
    if (expense.notes !== undefined) updateData.notes = expense.notes || null;
    if (expense.litres !== undefined) updateData.litres = expense.litres || null;
    if (expense.is_full_tank !== undefined) updateData.is_full_tank = expense.is_full_tank || null;
    if (expense.price_per_litre !== undefined) updateData.price_per_litre = expense.price_per_litre || null;

    await updateDoc(expenseRef, updateData);
    
    const updatedDoc = await getDoc(expenseRef);
    const data = updatedDoc.data();
    
    return {
      id: updatedDoc.id,
      user_id: data!.user_id,
      bike_id: data!.bike_id,
      type: data!.type,
      amount: data!.amount,
      date: this.timestampToISO(data!.date),
      odometer: data!.odometer || undefined,
      notes: data!.notes || undefined,
      litres: data!.litres || undefined,
      is_full_tank: data!.is_full_tank || undefined,
      price_per_litre: data!.price_per_litre || undefined,
      created_at: this.timestampToISO(data!.created_at),
    };
  }

  async deleteExpense(id: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const expenseRef = doc(db, "expenses", id);
    const expenseDoc = await getDoc(expenseRef);
    
    if (!expenseDoc.exists()) {
      throw new Error("Expense not found");
    }
    
    if (expenseDoc.data().user_id !== currentUser.uid) {
      throw new Error("Unauthorized");
    }

    await deleteDoc(expenseRef);
  }

  // Dashboard API
  async getDashboardStats(): Promise<DashboardStats> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Get all expenses
    const expenses = await this.getExpenses();
    
    // Get all bikes
    const bikes = await this.getBikes();

    // Calculate stats
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    const categoryBreakdown: Record<string, number> = {};
    expenses.forEach((expense) => {
      categoryBreakdown[expense.type] = (categoryBreakdown[expense.type] || 0) + expense.amount;
    });

    // Get recent expenses (last 5)
    const recentExpenses = expenses.slice(0, 5);

    return {
      total_expenses: totalExpenses,
      category_breakdown: categoryBreakdown,
      recent_expenses: recentExpenses,
      total_bikes: bikes.length,
    };
  }

  // Master Data APIs
  async getBikeBrands(): Promise<string[]> {
    return Object.keys(BIKE_BRANDS_MODELS);
  }

  async getBikeModels(): Promise<string[]> {
    return Object.values(BIKE_BRANDS_MODELS).flat();
  }

  async getBrandsWithModels(): Promise<BrandModelsMap> {
    return BIKE_BRANDS_MODELS;
  }

  async getExpenseTypes(): Promise<string[]> {
    return EXPENSE_TYPES;
  }

  // Document APIs
  async uploadDocument(document: DocumentCreate): Promise<Document> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Validate document type
    if (!DOCUMENT_TYPES.includes(document.document_type)) {
      throw new Error(`Invalid document type. Must be one of: ${DOCUMENT_TYPES.join(", ")}`);
    }

    // Validate file name
    if (!document.file_name.toLowerCase().endsWith('.pdf')) {
      throw new Error("Only PDF files are allowed");
    }

    // Validate file URL
    if (!document.file_url || !document.file_url.startsWith('http')) {
      throw new Error("Invalid file URL");
    }

    const documentData = {
      user_id: currentUser.uid,
      bike_id: document.bike_id,
      document_type: document.document_type,
      custom_name: document.custom_name || null,
      file_url: document.file_url,
      public_id: document.public_id,
      file_name: document.file_name,
      file_size: document.file_size,
      created_at: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, "documents"), documentData);
    
    return {
      id: docRef.id,
      user_id: documentData.user_id,
      bike_id: documentData.bike_id,
      document_type: documentData.document_type,
      custom_name: documentData.custom_name || undefined,
      file_url: documentData.file_url,
      public_id: documentData.public_id,
      file_name: documentData.file_name,
      file_size: documentData.file_size,
      created_at: this.timestampToISO(documentData.created_at),
    };
  }

  async getDocumentsByBike(bikeId: string): Promise<Document[]> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const documentsRef = collection(db, "documents");
    // Note: This requires a composite index: user_id (ASC) + bike_id (ASC) + created_at (DESC)
    // Firebase will prompt to create it when the query runs, or create it manually in Firebase Console
    const q = query(
      documentsRef,
      where("user_id", "==", currentUser.uid),
      where("bike_id", "==", bikeId),
      orderBy("created_at", "desc")
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        user_id: data.user_id,
        bike_id: data.bike_id,
        document_type: data.document_type,
        custom_name: data.custom_name || undefined,
        file_url: data.file_url,
        public_id: data.public_id,
        file_name: data.file_name,
        file_size: data.file_size,
        created_at: this.timestampToISO(data.created_at),
      };
    });
  }

  async getDocument(documentId: string): Promise<Document> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const documentRef = doc(db, "documents", documentId);
    const documentDoc = await getDoc(documentRef);
    
    if (!documentDoc.exists()) {
      throw new Error("Document not found");
    }
    
    const data = documentDoc.data();
    if (data.user_id !== currentUser.uid) {
      throw new Error("Unauthorized");
    }

    return {
      id: documentDoc.id,
      user_id: data.user_id,
      bike_id: data.bike_id,
      document_type: data.document_type,
      custom_name: data.custom_name || undefined,
      file_url: data.file_url,
      public_id: data.public_id,
      file_name: data.file_name,
      file_size: data.file_size,
      created_at: this.timestampToISO(data.created_at),
    };
  }

  async getDocumentDownloadUrl(documentId: string): Promise<string> {
    const document = await this.getDocument(documentId);
    return document.file_url;
  }

  async deleteDocument(documentId: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const documentRef = doc(db, "documents", documentId);
    const documentDoc = await getDoc(documentRef);
    
    if (!documentDoc.exists()) {
      throw new Error("Document not found");
    }
    
    if (documentDoc.data().user_id !== currentUser.uid) {
      throw new Error("Unauthorized");
    }

    await deleteDoc(documentRef);
  }

  async getDocumentTypes(): Promise<string[]> {
    return DOCUMENT_TYPES;
  }
}

export default new FirebaseService();

