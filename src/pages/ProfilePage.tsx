import { User, Heart, Clock, Settings, ChevronRight, Film, Eye, CloudDownload, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import DailyChallenge from "@/components/DailyChallenge";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { useUser, logoutUser } from "@/hooks/useUserStore";
import { useLikedVideos } from "@/hooks/useLikedVideos";
import { useMyList } from "@/hooks/useMyList";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import { toast } from "@/components/ui/sonner";
import ContentCard from "@/components/ContentCard";
import logoImg from "/logo.png";

const ProfilePage = () => {
  const { canInstall, isInstalled, install } = useInstallPrompt();
  const user = useUser();
  const likedVideos = useLikedVideos();
  const myList = useMyList();
  const continueWatching = useContinueWatching();

  const stats = [
    { label: "Watched", value: continueWatching.length, icon: Eye },
    { label: "Watchlist", value: myList.length, icon: Film },
    { label: "Liked", value: likedVideos.length, icon: Heart },
  ];

  const menuItems = [
    { icon: Heart, label: "My List", desc: `${myList.length} saved`, to: "/my-list" },
    { icon: Heart, label: "Liked Videos", desc: `${likedVideos.length} liked`, to: "/liked" },
    { icon: CloudDownload, label: "Downloads", desc: "Watch offline anytime", to: "/my-downloads" },
    { icon: Clock, label: "Continue Watching", desc: "Pick up where you left off", to: "/home" },
    { icon: Settings, label: "Settings", desc: "Playback, quality & more", to: "/settings" },
  ];

  return (
    <AppLayout>
      <SEO title="Profile – BingBloom" description="Your BingBloom profile — watch history, liked content, watchlist and account settings." />
      <div className="max-w-3xl mx-auto px-5 py-6">
        <div className="bg-gradient-to-br from-primary/10 via-card to-card rounded-2xl p-6 mb-6 border border-border/50">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full gradient-bb flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              {user ? (
                <>
                  <h1 className="text-xl font-bold text-foreground">{user.firstName} {user.lastName}</h1>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-foreground">Guest User</h1>
                  <p className="text-xs text-muted-foreground mb-2">Create a free account</p>
                  <Link to="/register" className="inline-flex gradient-bb text-primary-foreground text-xs font-medium px-4 py-2 rounded-xl">
                    Sign Up Free
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-6 mt-5 pt-5 border-t border-border/50">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Icon className="w-3 h-3 text-primary" />
                  <span className="text-lg font-bold text-foreground">{value}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {continueWatching.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-primary" /> Watch History
            </h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {continueWatching.slice(0, 8).map((e) => (
                <ContentCard key={e.video.id} video={e.video} progress={e.progress} variant="wide" />
              ))}
            </div>
          </div>
        )}
        <DailyChallenge />


        <div className="space-y-1.5 mb-6">
          {menuItems.map(({ icon: Icon, label, desc, to }) => {
            const Wrapper = to ? Link : "button" as any;
            const wrapperProps = to ? { to } : {};
            return (
              <Wrapper key={label} {...wrapperProps} className="w-full flex items-center gap-3 p-3 bg-card rounded-xl hover:bg-secondary transition-colors border border-border/30">
                <Icon className="w-4 h-4 text-primary" />
                <div className="flex-1 text-left">
                  <p className="text-xs font-medium text-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{desc}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Wrapper>
            );
          })}

          <a
            href="mailto:hello.bingbloom@gmail.com"
            className="w-full flex items-center gap-3 p-3 bg-card rounded-xl hover:bg-secondary transition-colors border border-border/30"
          >
            <Mail className="w-4 h-4 text-primary" />
            <div className="flex-1 text-left">
              <p className="text-xs font-medium text-foreground">Contact Us</p>
              <p className="text-[10px] text-muted-foreground">hello.bingbloom@gmail.com</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </a>
        </div>

        <div className="p-4 bg-gradient-to-r from-primary/10 to-card rounded-xl border border-border/50">
          <div className="flex items-start gap-3">
            <img src={logoImg} alt="BB" className="w-10 h-10 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground mb-0.5">
                {isInstalled ? "✅ App Installed!" : "Install BingBloom"}
              </p>
              <p className="text-[10px] text-muted-foreground mb-2">
                {isInstalled ? "You're using the installed version." : "Add to home screen for fast access."}
              </p>
              {canInstall && (
                <button onClick={install} className="gradient-bb text-primary-foreground text-[11px] font-medium px-4 py-2 rounded-lg">
                  Install Now
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-6">
          BingBloom v1.0 · Stream. Discover. Bloom. 🌸
        </p>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
