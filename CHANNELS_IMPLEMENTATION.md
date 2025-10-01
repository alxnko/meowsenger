# Channels Feature Implementation

## Overview
This implementation adds Telegram-like channels to Meowsenger. Channels allow admins to broadcast messages to subscribers, and only admins can post.

## Backend Changes

### Database Model (`backend/meowsenger/models.py`)
Added two new fields to the `Chat` model:
- `is_channel`: Boolean field to identify channels
- `is_public`: Boolean field to control public/private visibility

### New API Endpoints (`backend/meowsenger/channels/routes.py`)

#### Channel Management
- `POST /api/ch/create_channel` - Create a new channel
  - Parameters: `name`, `description` (optional), `isPublic` (optional, default: true)
  - Returns: `status`, `id`, `secret`

- `POST /api/ch/get_channels` - Get list of user's subscribed channels
  - Returns: `status`, `data` (array of channel blocks)

- `POST /api/ch/get` - Get channel details and messages
  - Parameters: `from` (channel ID)
  - Returns: `status`, `channel`, `messages`, `last`

#### Subscription Management
- `POST /api/ch/join` - Subscribe to a channel
  - Parameters: `id` (channel ID)
  - Returns: `status`

- `POST /api/ch/leave` - Unsubscribe from a channel
  - Parameters: `from` (channel ID)
  - Returns: `status`

#### Posting & Moderation
- `POST /api/ch/post` - Post message to channel (admin only)
  - Parameters: `id`, `text`, `replyTo` (optional), `isForwarded` (optional)
  - Returns: `status`

- `POST /api/ch/add_admin` - Add channel admin (owner only)
  - Parameters: `from` (channel ID), `username`
  - Returns: `status`

- `POST /api/ch/remove_admin` - Remove channel admin (owner only)
  - Parameters: `from` (channel ID), `username`
  - Returns: `status`

- `POST /api/ch/save_settings` - Update channel settings (admin only)
  - Parameters: `id`, `name` (optional), `description` (optional), `isPublic` (optional)
  - Returns: `status`

### Modified Endpoints

#### Messages (`backend/meowsenger/messages/routes.py`)
- Updated `POST /api/m/send` to check channel permissions:
  - Only admins can post to channels
  - Returns error if non-admin tries to post to a channel

#### Chats (`backend/meowsenger/chats/routes.py`)
- Updated `chat_to_dict()` to include `isChannel` field
- Updated `chat_to_block_dict()` to:
  - Include `isChannel` field
  - Set type to "ch" for channels
  - Handle channel-specific display logic

## Frontend Changes

### New Pages

#### Channels List (`frontend/src/pages/channels/Channels.jsx`)
- Displays list of subscribed channels
- "New Channel" button to create channels
- Channel creation form with:
  - Channel name input
  - Description textarea
  - Public/private toggle
- Uses `ChatList` component to display channels

#### Channel View (`frontend/src/pages/channels/Channel.jsx`)
- Individual channel view page
- Features:
  - Message display (read-only for subscribers)
  - Message input for admins
  - Admin panel for settings
  - Subscriber list for admins
  - Leave channel button for non-admins
  - Reply and forward functionality
  - Channel info in menu

### Routing Updates (`frontend/src/App.jsx`)
- Added routes:
  - `/channels` → Channels list page
  - `/channel/:channelId` → Individual channel view

### Navigation Updates (`frontend/src/assets/blocks/Menu/Menu.jsx`)
- Added channels button (campaign icon) in main menu
- Appears next to chats button when user is authenticated

### Component Updates

#### ChatBlock (`frontend/src/assets/blocks/Chats/ChatBlock.jsx`)
- Updated to handle channel links
- Added "ch." prefix for channels
- Handles channel routing to `/channel/:id`
- Updated author display logic for channels

## Feature Capabilities

### For All Users
- View list of subscribed channels
- Create new channels (becomes admin/owner)
- Subscribe to public channels
- Unsubscribe from channels
- View channel messages
- Reply to channel messages (as admin)
- Forward channel messages
- Receive notifications for new channel posts

### For Channel Admins
- Post messages to channel
- Edit channel name and description
- View subscriber list
- Delete own messages

### For Channel Owners (First Admin)
- All admin capabilities
- Add/remove other admins
- Change channel settings

## Database Migration Notes

When deploying, the database will need to be updated with:
```python
# Add new columns to Chat table
is_channel = db.Column(db.Boolean, default=False)
is_public = db.Column(db.Boolean, default=True)
```

If using Flask-Migrate:
```bash
flask db migrate -m "Add channels support"
flask db upgrade
```

## Testing Checklist

### Backend Tests
- [ ] Create channel endpoint
- [ ] Join/leave channel endpoints
- [ ] Post to channel (admin only)
- [ ] Get channel info and messages
- [ ] Add/remove admins (owner only)
- [ ] Channel settings update
- [ ] Permissions enforcement (non-admins cannot post)

### Frontend Tests
- [ ] Navigate to channels page
- [ ] Create new channel
- [ ] View channel list
- [ ] Open individual channel
- [ ] Post message as admin
- [ ] Try to post as non-admin (should be blocked)
- [ ] Leave channel
- [ ] Rejoin channel
- [ ] Admin panel functionality
- [ ] Channel appears in main chat list with "ch." prefix

### Integration Tests
- [ ] Channel messages appear in real-time
- [ ] Notifications work for channel posts
- [ ] Message forwarding from channels
- [ ] Reply functionality in channels
- [ ] Admin controls work correctly
- [ ] Owner-only controls restricted properly

## Known Limitations

1. No invite links for private channels (can be added later)
2. No member removal by admins (only leave functionality)
3. No channel deletion endpoint (should be added)
4. No reactions/comments on channel posts (can be added later)
5. Channel discovery for public channels not implemented

## Future Enhancements

1. Channel search/discovery for public channels
2. Invite links for private channels
3. Member kick/ban functionality
4. Channel deletion
5. Post reactions
6. Post comments/discussions
7. Channel analytics (views, engagement)
8. Pinned posts
9. Channel categories/tags
10. Scheduled posts
