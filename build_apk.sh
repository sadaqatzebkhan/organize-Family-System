#!/bin/bash
set -e

export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
export PATH="$JAVA_HOME/bin:$PATH"

echo "=== Starting Real Android APK Build ==="

BUILD_DIR="/tmp/apk_builder"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/src/com/mazidkhail/familyarchive"
mkdir -p "$BUILD_DIR/res/layout"
mkdir -p "$BUILD_DIR/res/values"
mkdir -p "$BUILD_DIR/res/mipmap-hdpi"
mkdir -p "$BUILD_DIR/res/mipmap-mdpi"
mkdir -p "$BUILD_DIR/res/mipmap-xhdpi"
mkdir -p "$BUILD_DIR/res/mipmap-xxhdpi"
mkdir -p "$BUILD_DIR/res/mipmap-xxxhdpi"
mkdir -p "$BUILD_DIR/res/xml"
mkdir -p "$BUILD_DIR/bin"
mkdir -p "$BUILD_DIR/gen"

# 1. Generate Crisp App Icon for All Densities
convert -size 512x512 xc:"#1a1a1a" \
  -fill "#c2410c" -draw "roundrectangle 30,30 482,482 60,60" \
  -fill "#fcfaf7" -pointsize 130 -gravity center -annotate +0-20 "MK" \
  -fill "#fde047" -pointsize 36 -gravity center -annotate +0+90 "FAMILY ARCHIVE" \
  "$BUILD_DIR/icon512.png"

convert "$BUILD_DIR/icon512.png" -resize 48x48 "$BUILD_DIR/res/mipmap-mdpi/ic_launcher.png"
convert "$BUILD_DIR/icon512.png" -resize 72x72 "$BUILD_DIR/res/mipmap-hdpi/ic_launcher.png"
convert "$BUILD_DIR/icon512.png" -resize 96x96 "$BUILD_DIR/res/mipmap-xhdpi/ic_launcher.png"
convert "$BUILD_DIR/icon512.png" -resize 144x144 "$BUILD_DIR/res/mipmap-xxhdpi/ic_launcher.png"
convert "$BUILD_DIR/icon512.png" -resize 192x192 "$BUILD_DIR/res/mipmap-xxxhdpi/ic_launcher.png"

# Update web app icon as well
cp "$BUILD_DIR/icon512.png" "public/app_icon.png"
cp "$BUILD_DIR/icon512.png" "public/developer_sadaqat.jpg" 2>/dev/null || true

# 2. Android Manifest
cat << 'EOF' > "$BUILD_DIR/AndroidManifest.xml"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.mazidkhail.familyarchive"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="33" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:hardwareAccelerated="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:theme="@style/AppTheme">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

# 3. Resources
cat << 'EOF' > "$BUILD_DIR/res/values/strings.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Mazid Khail Archive</string>
</resources>
EOF

cat << 'EOF' > "$BUILD_DIR/res/values/styles.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:statusBarColor">#1a1a1a</item>
        <item name="android:navigationBarColor">#1a1a1a</item>
        <item name="android:windowBackground">#fcfaf7</item>
    </style>
</resources>
EOF

cat << 'EOF' > "$BUILD_DIR/res/layout/activity_main.xml"
<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#fcfaf7">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

    <ProgressBar
        android:id="@+id/progressBar"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="center"
        android:indeterminate="true" />
</FrameLayout>
EOF

# 4. Java Activity Source
cat << 'EOF' > "$BUILD_DIR/src/com/mazidkhail/familyarchive/MainActivity.java"
package com.mazidkhail.familyarchive;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.Toast;

public class MainActivity extends Activity {
    private WebView webView;
    private ProgressBar progressBar;
    private static final String APP_URL = "https://ais-pre-x2we7do72ndb63elibgcz7-117321917077.asia-east1.run.app";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        progressBar = findViewById(R.id.progressBar);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUserAgentString(settings.getUserAgentString() + " MazidKhailApp/1.0");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                if (progressBar != null) progressBar.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (progressBar != null) progressBar.setVisibility(View.GONE);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    return false;
                }
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                } catch (Exception e) {
                    return true;
                }
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress == 100 && progressBar != null) {
                    progressBar.setVisibility(View.GONE);
                }
            }
        });

        webView.loadUrl(APP_URL);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
EOF

# 5. Check and Obtain android.jar and d8 / dx
mkdir -p "$BUILD_DIR/tools"
ANDROID_JAR="$BUILD_DIR/tools/android.jar"

if [ ! -f "$ANDROID_JAR" ]; then
  echo "Fetching android.jar..."
  wget -q -O "$ANDROID_JAR" "https://raw.githubusercontent.com/Sable/android-platforms/master/android-30/android.jar" || \
  wget -q -O "$ANDROID_JAR" "https://github.com/Sable/android-platforms/raw/master/android-28/android.jar"
fi

if [ ! -f "$ANDROID_JAR" ] || [ ! -s "$ANDROID_JAR" ]; then
  echo "Error: android.jar could not be downloaded."
  exit 1
fi

# 6. Package resources with aapt
echo "Generating R.java and packaging resources..."
aapt package -f -m \
  -J "$BUILD_DIR/gen" \
  -M "$BUILD_DIR/AndroidManifest.xml" \
  -S "$BUILD_DIR/res" \
  -I "$ANDROID_JAR"

# 7. Compile Java sources with javac
echo "Compiling Java sources..."
javac -d "$BUILD_DIR/bin" \
  -classpath "$ANDROID_JAR:$BUILD_DIR/gen" \
  -source 1.8 -target 1.8 \
  "$BUILD_DIR/gen/com/mazidkhail/familyarchive/R.java" \
  "$BUILD_DIR/src/com/mazidkhail/familyarchive/MainActivity.java"

# 8. Convert to classes.dex using d8 or dx
echo "Generating classes.dex..."
# Check for d8 or dx or download minimal d8
if command -v d8 >/dev/null 2>&1; then
  d8 --output "$BUILD_DIR/bin" "$BUILD_DIR/bin/com/mazidkhail/familyarchive/"*.class --lib "$ANDROID_JAR"
elif command -v dx >/dev/null 2>&1; then
  dx --dex --output="$BUILD_DIR/bin/classes.dex" "$BUILD_DIR/bin"
else
  # Fetch r8.jar / d8.jar
  wget -q -O "$BUILD_DIR/tools/r8.jar" "https://storage.googleapis.com/r8-releases/raw/3.3.75/r8.jar" || true
  if [ -f "$BUILD_DIR/tools/r8.jar" ]; then
    java -cp "$BUILD_DIR/tools/r8.jar" com.android.tools.r8.D8 --output "$BUILD_DIR/bin" "$BUILD_DIR/bin/com/mazidkhail/familyarchive/"*.class --lib "$ANDROID_JAR" --min-api 21
  fi
fi

# 9. Create unaligned APK
echo "Packaging APK..."
aapt package -f \
  -M "$BUILD_DIR/AndroidManifest.xml" \
  -S "$BUILD_DIR/res" \
  -I "$ANDROID_JAR" \
  -F "$BUILD_DIR/bin/unaligned.apk"

# Add classes.dex into the APK
cd "$BUILD_DIR/bin"
aapt add unaligned.apk classes.dex
cd -

# 10. Align APK
echo "Aligning APK..."
zipalign -f -p 4 "$BUILD_DIR/bin/unaligned.apk" "$BUILD_DIR/bin/aligned.apk"

# 11. Generate Keystore and Sign APK
echo "Signing APK..."
KEYSTORE="$BUILD_DIR/release.jks"
keytool -genkey -v -keystore "$KEYSTORE" -alias release -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=Sadaqat Zeb, OU=Family Archive, O=Mazid Khail, L=Swat, ST=KPK, C=PK" \
  -storepass mazidkhail123 -keypass mazidkhail123

apksigner sign --ks "$KEYSTORE" --ks-pass pass:mazidkhail123 --out "$BUILD_DIR/Mazid_Khail_Family_Archive.apk" "$BUILD_DIR/bin/aligned.apk"

# Verify signature
apksigner verify "$BUILD_DIR/Mazid_Khail_Family_Archive.apk"

# 12. Copy to public directory for direct download!
mkdir -p public
cp "$BUILD_DIR/Mazid_Khail_Family_Archive.apk" "public/Mazid_Khail_Family_Archive.apk"
cp "$BUILD_DIR/Mazid_Khail_Family_Archive.apk" "public/Khan_Family_Archive.apk"

echo "=== SUCCESS: Real Signed APK Created in public/Mazid_Khail_Family_Archive.apk ==="
ls -lh public/Mazid_Khail_Family_Archive.apk
