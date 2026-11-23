# Testing the Channels Feature

## Prerequisites

Before testing, ensure you have:
1. Backend dependencies installed: `pip install -r backend/requirements.txt`
2. Frontend dependencies installed: `cd frontend && npm install`
3. Database initialized (the new `is_channel` and `is_public` columns will be added automatically)

## Starting the Application

### Backend
```bash
cd backend
python run.py
```
The Flask backend should start on `http://localhost:5000`

### Frontend
```bash
cd frontend
npm run dev
```
The React frontend should start on `http://localhost:5173`

## Test Scenarios

### Test 1: Creating a Channel

**Steps:**
1. Log in to the application
2. Click the megaphone/campaign icon in the bottom menu
3. Click "New Channel"
4. Enter channel details:
   - Name: "Test Channel"
   - Description: "This is a test channel"
   - Check "Public"
5. Click "OK"

**Expected Result:**
- Redirected to the new channel view
- Channel appears in your channels list
- You are the owner/admin

**API Endpoint Tested:** `POST /api/ch/create_channel`

### Test 2: Posting to Channel (as Admin)

**Steps:**
1. Open your test channel
2. Type a message in the input box
3. Press Enter or click Send

**Expected Result:**
- Message appears in the channel
- Message is encrypted
- All subscribers receive notification

**API Endpoint Tested:** `POST /api/ch/post`

### Test 3: Viewing Channel List

**Steps:**
1. Navigate to Channels page
2. Observe the list of channels

**Expected Result:**
- All subscribed channels appear
- Channels show "ch." prefix
- Last message preview is visible
- Unread indicator appears if applicable

**API Endpoint Tested:** `POST /api/ch/get_channels`

### Test 4: Viewing Channel (as Subscriber)

**Steps:**
1. Create a second user account
2. Have admin add them to the channel (via join endpoint)
3. Log in as second user
4. Navigate to Channels
5. Open the test channel

**Expected Result:**
- Can view all messages
- Cannot post (input disabled or shows "Only admins can post")
- Can see "Leave Channel" button
- Can reply and forward messages

**API Endpoint Tested:** `POST /api/ch/get`

### Test 5: Leave Channel

**Steps:**
1. As a non-admin subscriber
2. Open channel
3. Click menu icon
4. Click "Leave Channel"

**Expected Result:**
- Redirected to channels list
- Channel no longer appears in list
- System message created in channel

**API Endpoint Tested:** `POST /api/ch/leave`

### Test 6: Join Channel

**Steps:**
1. Use API or database to rejoin channel
2. Navigate to channels list

**Expected Result:**
- Channel appears in list again
- Can view messages
- System message created

**API Endpoint Tested:** `POST /api/ch/join`

### Test 7: Channel Settings (Admin)

**Steps:**
1. As channel owner/admin
2. Open channel
3. Click menu icon
4. Click "Settings"
5. Change channel name to "Updated Test Channel"
6. Change description
7. Click "OK"

**Expected Result:**
- Settings saved
- Channel name updates in UI
- System message created
- Changes reflected immediately

**API Endpoint Tested:** `POST /api/ch/save_settings`

### Test 8: Add Admin

**Steps:**
1. As channel owner
2. Open channel
3. Click menu icon
4. Click "Subscribers"
5. Find a subscriber
6. Click promote/add admin button

**Expected Result:**
- User becomes admin
- User can now post to channel
- System message created
- Admin list updated

**API Endpoint Tested:** `POST /api/ch/add_admin`

### Test 9: Remove Admin

**Steps:**
1. As channel owner
2. Open channel
3. Click menu icon
4. Click "Subscribers"
5. Find an admin (not owner)
6. Click demote/remove admin button

**Expected Result:**
- User loses admin privileges
- User can no longer post
- System message created
- Admin list updated

**API Endpoint Tested:** `POST /api/ch/remove_admin`

### Test 10: Permission Enforcement

**Steps:**
1. Log in as non-admin subscriber
2. Try to access admin-only endpoints directly via API

**Expected Result:**
- POST to channel: Denied
- Add admin: Denied
- Remove admin: Denied
- Save settings: Denied
- Appropriate error messages returned

**API Endpoints Tested:** All admin-restricted endpoints

### Test 11: Message Forwarding

**Steps:**
1. In a channel, long-press or right-click a message
2. Select "Forward"
3. Choose a chat or group to forward to
4. Confirm

**Expected Result:**
- Message forwarded to selected chat
- Message marked as forwarded
- Forwarded message appears in destination

**API Endpoint Tested:** `POST /api/m/send` with `isForwarded: true`

### Test 12: Message Reply

**Steps:**
1. In a channel (as admin)
2. Long-press or right-click a message
3. Select "Reply"
4. Type response
5. Send

**Expected Result:**
- Reply linked to original message
- Reply indicator shows original message
- Reply appears in channel

**API Endpoint Tested:** `POST /api/ch/post` with `replyTo`

### Test 13: Notifications

**Steps:**
1. Enable notifications in browser
2. Have another user post to a channel you're subscribed to
3. Check for notification

**Expected Result:**
- Push notification received
- Notification shows channel name, poster, and message preview
- Clicking notification opens channel

**Integration:** Existing notification system with channels

### Test 14: Channel in Main Chat List

**Steps:**
1. Navigate to main Chats page
2. Look for channels in the list

**Expected Result:**
- Channels appear with "ch." prefix
- Mixed with regular chats and groups
- Sorted by last activity
- Unread indicators work

**API Endpoint Tested:** `POST /api/c/get_chats` (returns mixed list)

### Test 15: Multi-User Channel

**Steps:**
1. Create channel with User A
2. Add User B as subscriber
3. Add User C as subscriber
4. Add User B as admin
5. Post messages from User A and User B
6. View as User C

**Expected Result:**
- All users see all messages
- Only admins (A and B) can post
- User C sees read-only view
- Notifications sent to all

**Integration:** Full channel workflow

## Automated Testing

To add automated tests, create test files in `backend/tests/` following this pattern:

```python
# test_channels.py
import pytest
from meowsenger import create_app, db
from meowsenger.models import User, Chat, Message

@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

def test_create_channel(app, client):
    # Test channel creation
    pass

def test_channel_permissions(app, client):
    # Test permission enforcement
    pass

# Add more tests...
```

## Performance Testing

Test with:
- 10 channels
- 100 subscribers per channel
- 1000 messages per channel

Monitor:
- Page load times
- Message delivery speed
- Notification latency
- Database query performance

## Security Testing

Verify:
- Non-admins cannot post to channels
- Non-owners cannot add/remove admins
- Proper authentication on all endpoints
- XSS protection in channel names/messages
- SQL injection protection

## Browser Compatibility

Test on:
- Chrome/Chromium
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Android)

## Known Issues to Watch For

1. Race conditions with rapid message posting
2. Notification delivery on multiple tabs
3. Memory leaks with long channel message lists
4. Scroll position on new messages
5. Proper cleanup when leaving channel
6. Permission checks after admin changes

## Reporting Issues

When reporting issues, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/environment details
5. Console errors (if any)
6. Network requests (from browser dev tools)
