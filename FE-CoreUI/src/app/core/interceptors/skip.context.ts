import { HttpContext, HttpContextToken } from '@angular/common/http';

// Define the token. Default value is false.
export const BYPASS_REFRESH_LOGIC = new HttpContextToken<boolean>(() => false);

// Helper function to easily create the context
export function skipRefreshLogic() {
  return new HttpContext().set(BYPASS_REFRESH_LOGIC, true);
}
