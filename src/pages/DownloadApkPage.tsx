import { Download, ShieldCheck, Smartphone, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";

const DownloadApkPage = () => (
  <AppLayout>
    <SEO title="Download BingBloom APK" description="Download the BingBloom Android APK for direct installation on your device." />

    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-16">
      <div className="rounded-3xl border border-border/60 bg-card/90 p-6 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-primary/15 p-3 text-primary">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">BingBloom Android APK</p>
            <p className="text-xs text-muted-foreground">Direct installer for supported Android devices</p>
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Download the latest BingBloom APK</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Install BingBloom directly on Android without the Play Store. The APK is signed for release and includes the latest streaming experience, offline support, and download features.
        </p>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border/50 bg-background/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">app-release.apk</p>
            <p className="text-xs text-muted-foreground">Updated with each release build</p>
          </div>
          <a
            href="/downloads/app-release.apk"
            download
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Download className="h-4 w-4" />
            Download APK
          </a>
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-600">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>Install from Settings &gt; Security &gt; Unknown sources if your device blocks APK installs.</span>
        </div>

        <div className="mt-6 text-sm text-muted-foreground">
          <Link to="/install" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
            Open the install guide <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  </AppLayout>
);

export default DownloadApkPage;
