# Auto-Logout Functionality Guide

## What's Implemented

Your debt tracker app now has automatic logout functionality that logs users out after 2 minutes of inactivity when the browser tab or browser is closed.

## How It Works

### 1. **Timestamp Tracking**
- The app continuously tracks the last active time in `localStorage` as `lastActiveTime`
- This timestamp is updated when:
  - User logs in
  - User returns to the tab (tab becomes visible)
  - Browser window gains focus

### 2. **Event Listeners**
The following browser events are monitored:

- **`visibilitychange`**: Detects when tab is hidden/shown
- **`beforeunload`**: Captures when page is being closed/refreshed
- **`focus`**: Detects when browser window gains focus

### 3. **Auto-Logout Logic**
- When the user returns to the tab or browser window gains focus
- App calculates time difference between now and `lastActiveTime`
- If more than 2 minutes (120,000ms) have passed → automatic logout
- User is redirected to login page with a notification message

### 4. **Auto-Logout Notification**
- Shows red notification: "⏰ Session expired due to inactivity for more than 2 minutes"
- Notification automatically disappears after 5 seconds
- Styled with red gradient background to indicate logout

## Testing the Feature

### Test Case 1: Close and Reopen Tab
1. Log into the app
2. Close the browser tab completely
3. Wait 2+ minutes
4. Open a new tab and navigate to the app
5. **Expected**: You should see the red logout notification and be logged out

### Test Case 2: Close Browser Entirely  
1. Log into the app
2. Close the entire browser
3. Wait 2+ minutes
4. Reopen browser and navigate to the app
5. **Expected**: You should see the red logout notification and be logged out

### Test Case 3: Quick Return (Under 2 minutes)
1. Log into the app
2. Close tab/browser
3. Wait only 1 minute
4. Return to the app
5. **Expected**: You should still be logged in

### Test Case 4: Switch Between Tabs
1. Log into the app
2. Open another tab and browse elsewhere for 2+ minutes
3. Return to the debt tracker tab
4. **Expected**: You should see the red logout notification and be logged out

## Console Logging

When auto-logout occurs, you'll see a console message:
```
Auto-logout: Session expired after X seconds
```

## Technical Implementation

The functionality is implemented in `/client/src/App.jsx` with:
- `useEffect` hook that manages event listeners
- localStorage to persist timestamps across page reloads
- Cleanup of event listeners when component unmounts
- Integration with existing logout functionality

## Configuration

To change the timeout duration, modify this line in `App.jsx`:
```javascript
if (timePassed > 120000) { // Change 120000 to desired milliseconds (current: 2 minutes)
```

## Browser Compatibility

This feature works in all modern browsers that support:
- `visibilitychange` API
- `localStorage` 
- Standard window events

The implementation gracefully handles cases where these APIs might not be available.