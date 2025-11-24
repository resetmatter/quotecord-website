# Bot API Integration Guide

This guide explains how to update the DisQuote bot to integrate with the QuoteCord website APIs for premium features and meme gallery storage.

## Configuration

### Environment Variables

Add these to your bot's `.env` file:

```env
# Website API Configuration
WEBSITE_API_URL=https://your-website-url.com
BOT_API_KEY=your-api-key-here
```

The `BOT_API_KEY` must match the key configured in the website's environment.

---

## API Client Setup

Create a new file `src/api/websiteApi.js`:

```javascript
const axios = require('axios');

const apiClient = axios.create({
  baseURL: process.env.WEBSITE_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.BOT_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

/**
 * Get user's subscription tier and feature access
 * @param {string} discordId - User's Discord ID
 * @returns {Promise<Object>} User tier info and features
 */
async function getUserTier(discordId) {
  try {
    const response = await apiClient.get(`/api/bot/users/${discordId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user tier:', error.message);
    // Return free tier as fallback
    return {
      discordId,
      tier: 'free',
      isPremium: false,
      hasAccount: false,
      features: {
        animatedGifs: false,
        preview: false,
        multiMessage: false,
        avatarChoice: false,
        presets: false,
        noWatermark: false,
        galleryStorage: true,
        maxGallerySize: 50
      }
    };
  }
}

/**
 * Check if user can use a specific premium feature
 * @param {string} discordId - User's Discord ID
 * @param {string} feature - Feature name (animatedGifs, preview, multiMessage, avatarChoice, presets, noWatermark)
 * @returns {Promise<Object>} { allowed: boolean, reason?: string }
 */
async function checkFeatureAccess(discordId, feature) {
  try {
    const response = await apiClient.post(`/api/bot/users/${discordId}`, { feature });
    return response.data;
  } catch (error) {
    console.error('Failed to check feature access:', error.message);
    return { allowed: false, reason: 'Unable to verify feature access' };
  }
}

/**
 * Upload a generated meme to the user's gallery
 * @param {Object} memeData - Meme data to upload
 * @returns {Promise<Object>} Upload result with public URL
 */
async function uploadMeme(memeData) {
  try {
    const response = await apiClient.post('/api/bot/memes', memeData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      // Storage quota exceeded
      return {
        success: false,
        error: error.response.data.error,
        message: error.response.data.message
      };
    }
    console.error('Failed to upload meme:', error.message);
    return { success: false, error: 'Failed to upload meme' };
  }
}

/**
 * Get user's meme count and quota info
 * @param {string} discordId - User's Discord ID
 * @returns {Promise<Object>} Meme count and quota info
 */
async function getMemeStats(discordId) {
  try {
    const response = await apiClient.get(`/api/bot/memes?discordId=${discordId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch meme stats:', error.message);
    return null;
  }
}

module.exports = {
  getUserTier,
  checkFeatureAccess,
  uploadMeme,
  getMemeStats
};
```

---

## Integration Points

### 1. Check Premium Status on Quote Creation

In `src/commands/createQuote.js`, after the user right-clicks a message:

```javascript
const { getUserTier } = require('../api/websiteApi');

// Around line 183-200, after getting message author info
const userTier = await getUserTier(interaction.user.id);

// Store in selection for later use
selection.userTier = userTier;
selection.isPremium = userTier.isPremium;
```

### 2. Gate Premium Features

#### Avatar Selection (around line 106-117)
Only show avatar selection buttons for premium users:

```javascript
// Build action row with buttons
const buttons = [];

// Only add avatar buttons if user is premium
if (selection.isPremium && selection.hasGuildAccess) {
  buttons.push(
    new ButtonBuilder()
      .setCustomId(`avatarserver_${selectionKey}`)
      .setLabel('Server Avatar')
      .setStyle(selection.avatarType === 'server' ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`avatardefault_${selectionKey}`)
      .setLabel('Default Avatar')
      .setStyle(selection.avatarType === 'default' ? ButtonStyle.Primary : ButtonStyle.Secondary)
  );
}
```

#### Multi-Message Quotes (around line 899-981)
Check before allowing additional messages:

```javascript
const { checkFeatureAccess } = require('../api/websiteApi');

// In the addmessage button handler
if (selection.messages.length >= 1) {
  const access = await checkFeatureAccess(interaction.user.id, 'multiMessage');
  if (!access.allowed) {
    return interaction.reply({
      content: `❌ ${access.reason}`,
      flags: MessageFlags.Ephemeral
    });
  }
}
```

#### Animated GIFs (around line 997-1050)
Check before generating animated GIF:

```javascript
const { checkFeatureAccess } = require('../api/websiteApi');

// Before calling generateAnimatedGIF
if (isAnimatedAvatar) {
  const access = await checkFeatureAccess(interaction.user.id, 'animatedGifs');
  if (!access.allowed) {
    return interaction.reply({
      content: `❌ ${access.reason}\n\nA static image will be generated instead.`,
      flags: MessageFlags.Ephemeral
    });
    // Fall back to static generation
  }
}
```

#### Preview Feature
Check before showing preview:

```javascript
// In preview button handler
const access = await checkFeatureAccess(interaction.user.id, 'preview');
if (!access.allowed) {
  return interaction.reply({
    content: `❌ ${access.reason}`,
    flags: MessageFlags.Ephemeral
  });
}
```

### 3. Remove Watermark for Premium Users

In `src/generators/quoteRenderer.js` or template files, check premium status:

```javascript
// Pass isPremium to the render function
const options = {
  // ... other options
  showWatermark: !selection.isPremium
};

// In template render function
if (options.showWatermark) {
  // Draw watermark/ad text
  ctx.fillText(adConfig.text, x, y);
}
```

### 4. Upload Meme to Gallery After Generation

In `src/commands/createQuote.js`, after successful quote generation (around line 1212-1222):

```javascript
const { uploadMeme } = require('../api/websiteApi');

// After the quote is generated and posted
const imageBuffer = await quoteRenderer.generate(renderOptions);

// Upload to gallery if user has an account
if (selection.userTier?.hasAccount) {
  const uploadResult = await uploadMeme({
    discordId: interaction.user.id,
    imageData: imageBuffer.toString('base64'),
    mimeType: isAnimated ? 'image/gif' : `image/${format}`,
    template: selection.template,
    font: selection.font,
    theme: selection.background,
    orientation: selection.orientation,
    animated: isAnimated,
    quoteText: selection.messages.map(m => m.content).join('\n'),
    authorName: selection.messageAuthor.displayName,
    guildId: selection.guildId
  });

  if (!uploadResult.success && uploadResult.message) {
    // Optionally notify user about storage quota
    console.log('Meme upload failed:', uploadResult.message);
  }
}
```

---

## API Reference

### GET /api/bot/users/[discordId]

Get user's subscription tier and feature access.

**Response:**
```json
{
  "discordId": "123456789",
  "tier": "premium",
  "status": "active",
  "hasAccount": true,
  "isPremium": true,
  "currentPeriodEnd": "2025-01-15T00:00:00Z",
  "features": {
    "animatedGifs": true,
    "preview": true,
    "multiMessage": true,
    "avatarChoice": true,
    "presets": true,
    "noWatermark": true,
    "galleryStorage": true,
    "maxGallerySize": 1000
  },
  "memeCount": 42
}
```

### POST /api/bot/users/[discordId]

Check if user can use a specific feature.

**Request:**
```json
{
  "feature": "animatedGifs"
}
```

**Response:**
```json
{
  "feature": "animatedGifs",
  "allowed": true,
  "reason": null
}
```

Or if not allowed:
```json
{
  "feature": "animatedGifs",
  "allowed": false,
  "reason": "Animated GIFs is a Premium feature. Upgrade at quotecord.com/dashboard/billing"
}
```

### POST /api/bot/memes

Upload a meme to user's gallery.

**Request:**
```json
{
  "discordId": "123456789",
  "imageData": "base64-encoded-image-data",
  "mimeType": "image/png",
  "template": "classic",
  "font": "Inter",
  "theme": "dark",
  "orientation": "landscape",
  "animated": false,
  "quoteText": "This is the quote text",
  "authorName": "Username",
  "guildId": "987654321"
}
```

**Response (success):**
```json
{
  "success": true,
  "meme": {
    "id": "uuid",
    "publicUrl": "https://...",
    "fileName": "123456789/1234567890.png",
    "fileSize": 12345,
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

**Response (quota exceeded):**
```json
{
  "error": "Storage quota exceeded",
  "message": "You've reached the free tier limit of 50 memes. Upgrade to Premium for up to 1000 memes."
}
```

### GET /api/bot/memes?discordId=[id]

Get user's meme count and quota info.

**Response:**
```json
{
  "discordId": "123456789",
  "memeCount": 42,
  "maxMemes": 1000,
  "hasAccount": true,
  "quotaRemaining": 958
}
```

---

## Feature Matrix

| Feature | Free | Premium |
|---------|------|---------|
| Quote Generation | ✅ Unlimited | ✅ Unlimited |
| All Templates | ✅ | ✅ |
| All Fonts | ✅ | ✅ |
| Both Themes | ✅ | ✅ |
| Static Images | ✅ | ✅ |
| Animated GIFs | ❌ | ✅ |
| Preview | ❌ | ✅ |
| Avatar Selection | ❌ | ✅ |
| Multi-Message (up to 5) | ❌ | ✅ |
| Save Presets | ❌ | ✅ |
| No Watermark | ❌ | ✅ |
| Gallery Storage | 50 memes | 1000 memes |

---

## Error Handling

Always wrap API calls in try-catch and provide fallbacks:

```javascript
try {
  const userTier = await getUserTier(discordId);
  // Use tier info
} catch (error) {
  console.error('API error:', error);
  // Fall back to free tier behavior
  const userTier = { isPremium: false, features: { /* free defaults */ } };
}
```

The bot should remain functional even if the website API is unavailable - just default to free tier behavior.

---

## Testing

1. Set up environment variables
2. Test with a free user (no account on website)
3. Test with a free user (has account but free tier)
4. Test with a premium user
5. Test API failures (website down) - should fall back gracefully
