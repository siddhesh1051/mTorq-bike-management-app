import { Mixpanel } from 'mixpanel-react-native';
import { EXPO_PUBLIC_MIXPANEL_TOKEN } from '@env';

/**
 * Analytics Service
 * Centralized analytics tracking using Mixpanel
 * Tracks user actions, screen views, and user properties
 */

class AnalyticsService {
  private mixpanel: Mixpanel | null = null;
  private isInitialized = false;

  /**
   * Initialize Mixpanel SDK
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      const token = EXPO_PUBLIC_MIXPANEL_TOKEN || 'YOUR_MIXPANEL_TOKEN_HERE';
      
      if (token === 'YOUR_MIXPANEL_TOKEN_HERE') {
        console.warn('⚠️  Mixpanel token not configured. Analytics disabled.');
        console.warn('📝 Add EXPO_PUBLIC_MIXPANEL_TOKEN to your .env file');
        return;
      }

      this.mixpanel = new Mixpanel(token, true); // true = track automatic events
      await this.mixpanel.init();
      this.isInitialized = true;
      console.log('✅ Mixpanel Analytics initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Mixpanel:', error);
    }
  }

  /**
   * Identify user with unique ID and properties
   */
  async identifyUser(userId: string, properties?: Record<string, any>) {
    if (!this.mixpanel || !this.isInitialized) return;

    try {
      await this.mixpanel.identify(userId);
      
      if (properties) {
        await this.mixpanel.getPeople().set(properties);
      }
      
      console.log('👤 User identified:', userId);
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }

  /**
   * Set user properties
   */
  async setUserProperties(properties: Record<string, any>) {
    if (!this.mixpanel || !this.isInitialized) return;

    try {
      await this.mixpanel.getPeople().set(properties);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  /**
   * Increment a user property
   */
  async incrementUserProperty(property: string, by: number = 1) {
    if (!this.mixpanel || !this.isInitialized) return;

    try {
      await this.mixpanel.getPeople().increment(property, by);
    } catch (error) {
      console.error('Failed to increment user property:', error);
    }
  }

  /**
   * Track a custom event
   */
  async track(eventName: string, properties?: Record<string, any>) {
    if (!this.mixpanel || !this.isInitialized) return;

    try {
      await this.mixpanel.track(eventName, properties);
      console.log('📊 Event tracked:', eventName, properties);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Track screen view
   */
  async trackScreenView(screenName: string, properties?: Record<string, any>) {
    await this.track('Screen View', {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Reset user identity (on logout)
   */
  async reset() {
    if (!this.mixpanel || !this.isInitialized) return;

    try {
      await this.mixpanel.reset();
      console.log('🔄 Analytics reset');
    } catch (error) {
      console.error('Failed to reset analytics:', error);
    }
  }

  // ===== AUTHENTICATION EVENTS =====

  async trackSignup(method: 'email' | 'google', email: string) {
    await this.track('Signup', {
      method,
      email,
    });
  }

  async trackLogin(method: 'email' | 'google', email: string) {
    await this.track('Login', {
      method,
      email,
    });
  }

  async trackLogout() {
    await this.track('Logout');
  }

  // ===== BIKE EVENTS =====

  async trackBikeAdded(bikeData: {
    brand: string;
    model: string;
    has_registration: boolean;
    has_image: boolean;
  }) {
    await this.track('Bike Added', bikeData);
    await this.incrementUserProperty('total_bikes');
  }

  async trackBikeEdited(bikeId: string, changes: string[]) {
    await this.track('Bike Edited', {
      bike_id: bikeId,
      fields_changed: changes,
    });
  }

  async trackBikeDeleted(bikeId: string, brand: string, model: string) {
    await this.track('Bike Deleted', {
      bike_id: bikeId,
      brand,
      model,
    });
    await this.incrementUserProperty('total_bikes', -1);
  }

  async trackBikeViewed(bikeId: string, brand: string, model: string) {
    await this.track('Bike Detail Viewed', {
      bike_id: bikeId,
      brand,
      model,
    });
  }

  // ===== EXPENSE EVENTS =====

  async trackExpenseAdded(expenseData: {
    type: string;
    amount: number;
    bike_id: string;
    has_odometer: boolean;
    has_notes: boolean;
    is_fuel: boolean;
    has_fuel_details?: boolean;
    is_full_tank?: boolean;
  }) {
    await this.track('Expense Added', expenseData);
    await this.incrementUserProperty('total_expenses');
    await this.incrementUserProperty(`total_${expenseData.type.toLowerCase()}_expenses`);
  }

  async trackExpenseEdited(expenseId: string, type: string, changes: string[]) {
    await this.track('Expense Edited', {
      expense_id: expenseId,
      type,
      fields_changed: changes,
    });
  }

  async trackExpenseDeleted(expenseId: string, type: string, amount: number) {
    await this.track('Expense Deleted', {
      expense_id: expenseId,
      type,
      amount,
    });
    await this.incrementUserProperty('total_expenses', -1);
  }

  async trackExpenseViewed(expenseId: string, type: string) {
    await this.track('Expense Viewed', {
      expense_id: expenseId,
      type,
    });
  }

  async trackExpenseFiltered(filters: {
    bike_id?: string;
    type?: string;
    search?: string;
  }) {
    await this.track('Expenses Filtered', filters);
  }

  async trackExpenseSearched(query: string, resultsCount: number) {
    await this.track('Expenses Searched', {
      query,
      results_count: resultsCount,
    });
  }

  // ===== VAULT/DOCUMENT EVENTS =====

  async trackDocumentUploaded(documentData: {
    type: string;
    bike_id: string;
    file_type: string;
    file_size?: number;
  }) {
    await this.track('Document Uploaded', documentData);
    await this.incrementUserProperty('total_documents');
  }

  async trackDocumentViewed(documentType: string, bikeId: string) {
    await this.track('Document Viewed', {
      type: documentType,
      bike_id: bikeId,
    });
  }

  async trackDocumentDownloaded(documentType: string, bikeId: string) {
    await this.track('Document Downloaded', {
      type: documentType,
      bike_id: bikeId,
    });
  }

  async trackDocumentDeleted(documentType: string, bikeId: string) {
    await this.track('Document Deleted', {
      type: documentType,
      bike_id: bikeId,
    });
    await this.incrementUserProperty('total_documents', -1);
  }

  // ===== ANALYTICS SCREEN EVENTS =====

  async trackChartViewed(chartType: string, filters?: Record<string, any>) {
    await this.track('Chart Viewed', {
      chart_type: chartType,
      ...filters,
    });
  }

  async trackChartFilterChanged(chartType: string, filterName: string, filterValue: any) {
    await this.track('Chart Filter Changed', {
      chart_type: chartType,
      filter_name: filterName,
      filter_value: filterValue,
    });
  }

  async trackInsightViewed(insightType: string) {
    await this.track('Insight Viewed', {
      insight_type: insightType,
    });
  }

  // ===== SETTINGS EVENTS =====

  async trackProfileUpdated(fields: string[]) {
    await this.track('Profile Updated', {
      fields_changed: fields,
    });
  }

  async trackPasswordChanged() {
    await this.track('Password Changed');
  }

  async trackPreferenceChanged(preference: string, value: any) {
    await this.track('Preference Changed', {
      preference,
      value,
    });
  }

  // ===== DASHBOARD EVENTS =====

  async trackQuickActionUsed(action: string) {
    await this.track('Quick Action Used', {
      action,
    });
  }

  async trackStatCardClicked(statType: string) {
    await this.track('Stat Card Clicked', {
      stat_type: statType,
    });
  }

  // ===== APP LIFECYCLE EVENTS =====

  async trackAppOpened() {
    await this.track('App Opened');
  }

  async trackAppBackgrounded() {
    await this.track('App Backgrounded');
  }

  // ===== ERROR TRACKING =====

  async trackError(error: Error, context?: Record<string, any>) {
    await this.track('Error Occurred', {
      error_message: error.message,
      error_name: error.name,
      error_stack: error.stack,
      ...context,
    });
  }
}

// Export singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;
