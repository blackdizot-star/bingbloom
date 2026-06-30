# iOS Build Setup - Certificate & Signing

## Current Setup
The GitHub Actions workflow is configured with **automatic code signing**.

## What You Need

### Option A: Automatic Signing (Recommended)
1. The workflow will use GitHub-hosted macOS runners which can sign apps automatically
2. No additional setup required - just push to GitHub
3. The app will be signed for ad-hoc distribution

### Option B: Manual Signing (Advanced)
If automatic signing fails, you'll need:

1. **Apple Developer Account** (Free or Paid)
   - Go to https://developer.apple.com
   - Sign in with your Apple ID

2. **Create App ID**
   - Bundle ID: `com.bingbloom.app` (already configured)

3. **Generate Certificates & Provisioning Profile**
   - Export from Xcode or create manually on Apple Developer portal

4. **Add to GitHub Secrets**
   - Settings → Secrets and variables → Actions
   - Add:
     - `APPLE_ID`: Your Apple ID email
     - `APPLE_ID_PASSWORD`: App-specific password from Apple ID settings
     - `TEAM_ID`: Your Apple Developer Team ID
     - (Optional) Certificate + Provisioning Profile as base64

## Next Steps
1. Push the workflow to GitHub
2. Monitor the build logs
3. If it succeeds → Download the .ipa
4. If it fails → We'll set up manual signing with certificates

## Expected Build Time
- First build: 15-20 minutes
- Subsequent builds: 10-15 minutes
