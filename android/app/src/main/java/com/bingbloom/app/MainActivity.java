package com.bingbloom.app;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		try {
			// Access the Capacitor WebView and enable settings needed for third-party iframe ads.
			// Capacitor may expose different WebView wrapper types; handle common cases.
			WebView webView = null;
			Object capWebView = this.bridge.getWebView();

			if (capWebView instanceof WebView) {
				webView = (WebView) capWebView;
			} else {
				try {
					java.lang.reflect.Method m = capWebView.getClass().getMethod("getView");
					Object inner = m.invoke(capWebView);
					if (inner instanceof WebView) {
						webView = (WebView) inner;
					}
				} catch (Exception ignored) {
				}
			}

			if (webView != null) {
				WebSettings webSettings = webView.getSettings();
				webSettings.setJavaScriptEnabled(true);
				webSettings.setDomStorageEnabled(true);
				webSettings.setDatabaseEnabled(true);
				webSettings.setAllowFileAccess(true);
				webSettings.setAllowContentAccess(true);
				webSettings.setAllowUniversalAccessFromFileURLs(true);
				webSettings.setAllowFileAccessFromFileURLs(true);
				webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
				webSettings.setSupportZoom(false);
				webSettings.setBuiltInZoomControls(false);
				webSettings.setLoadWithOverviewMode(true);
				webSettings.setUseWideViewPort(true);
				webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);

				if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
					webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
					CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
				}
			}
		} catch (Exception e) {
			// If something goes wrong, don't crash the app during startup.
			e.printStackTrace();
		}
	}
}
