import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient } from "@tanstack/react-query";
import { LocalNotifications } from "@capacitor/local-notifications";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import OfflineBanner from "@/components/OfflineBanner";
import AdConsent from "@/components/AdConsent";

import MaintenanceNotice from "@/components/MaintenanceNotice";

import HomePage from "./pages/HomePage";
import FollowUsPage from "./pages/FollowUsPage";
import MoviesPage from "./pages/MoviesPage";
import TVPage from "./pages/TVPage";
import SearchPage from "./pages/SearchPage";
import WatchPage from "./pages/WatchPage";
import ShortsPage from "./pages/ShortsPage";
import MovieDetailPage from "./pages/MovieDetailPage";
import TVDetailPage from "./pages/TVDetailPage";
import MovieWatchPage from "./pages/MovieWatchPage";
import TvWatchPage from "./pages/TvWatchPage";
import GenrePage from "./pages/GenrePage";
import PodcastsPage from "./pages/PodcastsPage";
import ProfilePage from "./pages/ProfilePage";
import MyListPage from "./pages/MyListPage";
import LibraryPage from "./pages/LibraryPage";
import LikedVideosPage from "./pages/LikedVideosPage";

import AnimePage from "./pages/AnimePage";
import AnimeDetailPage from "./pages/AnimeDetailPage";
import LiveTVPage from "./pages/LiveTVPage";
import SettingsPage from "./pages/SettingsPage";
import PrivacyPage from "./pages/PrivacyPage";
import AnimationPage from "./pages/AnimationPage";
import DocumentaryPage from "./pages/DocumentaryPage";

import MyDownloadsPage from "./pages/MyDownloadsPage";
import DownloadPage from "./pages/DownloadPage";
import InstallAppPage from "./pages/InstallAppPage";
import DownloadApkPage from "./pages/DownloadApkPage";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";


import FAQ from "./pages/FAQ";
import Investors from "./pages/Investors";
import WaysToWatch from "./pages/WaysToWatch";
import Corporate from "./pages/Corporate";
import LegalNotices from "./pages/LegalNotices";
import Help from "./pages/Help";
import Jobs from "./pages/Jobs";
import Terms from "./pages/Terms";
import OnlyOnMovieNoir from "./pages/OnlyOnMovieNoir";
import Redeem from "./pages/Redeem";
import SpeedTest from "./pages/SpeedTest";
import AdChoices from "./pages/AdChoices";
import MediaCenter from "./pages/MediaCenter";
import GiftCards from "./pages/GiftCards";
import CookiePreferences from "./pages/CookiePreferences";
import LegalGuarantee from "./pages/LegalGuarantee";
import MovieFAQ from "./pages/MovieFAQ";
import FAQsPage from "./pages/FAQsPage";
import BingTvChannel from "./components/BingTvChannel";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30,
      gcTime: 1000 * 60 * 60 * 24 * 7, // keep cached metadata for 7 days (offline)
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
  key: "bingbloom-query-cache",
  throttleTime: 1000,
});

const App = () => {
  useEffect(() => {
    const sendNativeUpdateNotice = async () => {
      const dismissed = window.localStorage.getItem("bingbloom-native-notice-sent");
      if (dismissed) return;

      try {
        await LocalNotifications.createChannel({
          id: "bingbloom-updates",
          name: "MovieNoir updates",
          importance: 5,
          visibility: 1,
        });

        const permission = await LocalNotifications.requestPermissions();
        if (permission.display === "granted") {
          await LocalNotifications.schedule({
            notifications: [
              {
                id: Date.now(),
                title: "MovieNoir update ready",
                body: "Your app now uses the MovieNoir brand everywhere and is ready to open.",
                schedule: { at: new Date(Date.now() + 1000) },
                extra: { source: "native-update" },
              },
            ],
          });
          window.localStorage.setItem("bingbloom-native-notice-sent", "true");
        }
      } catch {
        window.localStorage.setItem("bingbloom-native-notice-sent", "true");
      }
    };

    void sendNativeUpdateNotice();
  }, []);

  return (
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 * 7 }}
  >
    <AdConsent />
    <OfflineBanner />
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MaintenanceNotice />
        
        
        <Routes>
          <Route path="/welcome" element={<Navigate to="/home" replace />} />
          <Route path="/signin" element={<Navigate to="/home" replace />} />
          <Route path="/register" element={<Navigate to="/home" replace />} />
          <Route path="/onboarding/phone" element={<Navigate to="/home" replace />} />
          <Route path="/onboarding/genres" element={<Navigate to="/home" replace />} />
          <Route path="/onboarding/titles" element={<Navigate to="/home" replace />} />
          <Route path="/onboarding/social" element={<Navigate to="/home" replace />} />
          <Route path="/onboarding/done" element={<Navigate to="/home" replace />} />
          <Route path="/onboarding" element={<Navigate to="/home" replace />} />
          <Route path="/onboarding/*" element={<Navigate to="/home" replace />} />

          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/follow-us" element={<FollowUsPage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/tv/:id" element={<TVDetailPage />} />
          <Route path="/watch/movie/:tmdbId" element={<MovieWatchPage />} />
          <Route path="/watch/tv/:tmdbId/:season/:episode" element={<TvWatchPage />} />
          <Route path="/movie/:tmdbId/watch" element={<MovieWatchPage />} />
          <Route path="/genre/:genre" element={<GenrePage />} />
          <Route path="/music" element={<Navigate to="/home" replace />} />
          <Route path="/b-music" element={<Navigate to="/home" replace />} />
          <Route path="/b-apps" element={<Navigate to="/home" replace />} />
          <Route path="/tv" element={<TVPage />} />
          <Route path="/anime" element={<AnimePage />} />
          <Route path="/anime/:id" element={<AnimeDetailPage />} />
          <Route path="/live-tv" element={<LiveTVPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/watch" element={<ShortsPage />} />
          <Route path="/watch/:videoId" element={<WatchPage />} />
          <Route path="/podcasts" element={<PodcastsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-list" element={<MyListPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/liked" element={<LikedVideosPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/animation" element={<AnimationPage />} />
          <Route path="/documentary" element={<DocumentaryPage />} />
          <Route path="/novels" element={<Navigate to="/home" replace />} />
          <Route path="/my-downloads" element={<MyDownloadsPage />} />
          <Route path="/downloads" element={<Navigate to="/my-downloads" replace />} />
          <Route path="/download/:mediaType/:id" element={<DownloadPage />} />
          <Route path="/download/:mediaType/:id/:s/:e" element={<DownloadPage />} />
          <Route path="/install" element={<InstallAppPage />} />
          <Route path="/download-apk" element={<DownloadApkPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/support" element={<Navigate to="/help" replace />} />

          <Route path="/faq" element={<FAQ />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/ways-to-watch" element={<WaysToWatch />} />
          <Route path="/corporate" element={<Corporate />} />
          <Route path="/legal-notices" element={<LegalNotices />} />
          <Route path="/help" element={<Help />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/only-on-bingbloom" element={<OnlyOnMovieNoir />} />
          <Route path="/redeem" element={<Redeem />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/speed-test" element={<SpeedTest />} />
          <Route path="/ad-choices" element={<AdChoices />} />
          <Route path="/media" element={<MediaCenter />} />
          <Route path="/gift-cards" element={<GiftCards />} />
          <Route path="/cookie-preferences" element={<CookiePreferences />} />
          <Route path="/legal-guarantee" element={<LegalGuarantee />} />
          <Route path="/movie-faq" element={<MovieFAQ />} />
          <Route path="/faqs" element={<FAQsPage />} />
          <Route path="/live/bing-tv" element={<BingTvChannel />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>

    </TooltipProvider>
  </PersistQueryClientProvider>
  );
};

export default App;
