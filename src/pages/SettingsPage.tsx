import { ArrowLeft, Bell, Moon, Globe, Shield, Wifi, Play, Eye, Clock, Volume2, Subtitles, Smartphone, Lock, Info, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import SEO from "@/components/SEO";
import { useSettings, AppSettings } from "@/hooks/useSettings";

interface SettingToggleProps {
  icon: React.ElementType;
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

const SettingToggle = ({ icon: Icon, label, description, value, onChange }: SettingToggleProps) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/30">
    <Icon className="w-4 h-4 text-primary flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground">{description}</p>
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${value ? "gradient-bb" : "bg-secondary border border-border"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${value ? "left-5 bg-primary-foreground" : "left-0.5 bg-muted-foreground"}`} />
    </button>
  </div>
);

interface SettingSelectProps {
  icon: React.ElementType;
  label: string;
  description: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}

const SettingSelect = ({ icon: Icon, label, description, value, options, onChange }: SettingSelectProps) => (
  <div className="p-3 rounded-xl bg-card border border-border/30">
    <div className="flex items-center gap-3 mb-2">
      <Icon className="w-4 h-4 text-primary flex-shrink-0" />
      <div className="flex-1">
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </div>
    </div>
    <div className="flex gap-1.5 flex-wrap ml-7">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
            value === opt ? "gradient-bb text-primary-foreground" : "bg-secondary text-muted-foreground border border-border hover:bg-secondary/80"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const SettingsPage = () => {
  const { settings, update } = useSettings();

  const set = <K extends keyof AppSettings>(key: K, label: string) => (val: AppSettings[K]) => {
    update(key, val);
    toast.success(`${label} ${typeof val === "boolean" ? (val ? "enabled" : "disabled") : `set to ${val}`}`);
  };

  const clearCache = () => {
    if ('caches' in window) { caches.keys().then(names => names.forEach(n => caches.delete(n))); }
    localStorage.removeItem("continue_watching");
    toast.success("Cache cleared");
  };

  return (
    <AppLayout>
      <SEO title="Settings – MovieNoir" description="Manage your MovieNoir preferences — playback, notifications, privacy and account settings." />
      <div className="max-w-2xl mx-auto px-5 py-5">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/profile" className="p-2 rounded-lg hover:bg-secondary"><ArrowLeft className="w-5 h-5 text-foreground" /></Link>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
        </div>

        <div className="space-y-1.5">
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest px-1 pt-1 mb-2">Playback</p>
          <SettingToggle icon={Play} label="Autoplay Next" description="Automatically play the next video" value={settings.autoplay} onChange={set("autoplay", "Autoplay")} />
          <SettingToggle icon={Subtitles} label="Subtitles" description="Show subtitles when available" value={settings.subtitles} onChange={set("subtitles", "Subtitles")} />
          <SettingToggle icon={Eye} label="Auto Skip Intro" description="Skip openings automatically" value={settings.autoSkipIntro} onChange={set("autoSkipIntro", "Auto skip intro")} />
          <SettingToggle icon={Play} label="Background Play" description="Continue audio in background" value={settings.backgroundPlay} onChange={set("backgroundPlay", "Background play")} />
          <SettingToggle icon={Smartphone} label="Picture-in-Picture" description="Mini player when navigating" value={settings.pipMode} onChange={set("pipMode", "PiP")} />
          <SettingToggle icon={Lock} label="Screen Lock" description="Lock controls in fullscreen" value={settings.screenLock} onChange={set("screenLock", "Screen lock")} />
          <SettingSelect icon={Volume2} label="Playback Speed" description="Default speed" value={settings.playbackSpeed} options={["0.5x", "0.75x", "1x", "1.25x", "1.5x", "2x"]} onChange={set("playbackSpeed", "Playback speed")} />
          <SettingSelect icon={Eye} label="Video Quality" description="Default quality" value={settings.videoQuality} options={["Auto", "360p", "480p", "720p", "1080p"]} onChange={set("videoQuality", "Video quality")} />

          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest px-1 pt-6 mb-2">General</p>
          <SettingToggle icon={Bell} label="Notifications" description="Get notified about new content" value={settings.notifications} onChange={set("notifications", "Notifications")} />
          <SettingToggle icon={Moon} label="Dark Mode" description="Use dark theme" value={settings.darkMode} onChange={set("darkMode", "Dark mode")} />
          <SettingToggle icon={Wifi} label="Data Saver" description="Reduce data usage" value={settings.dataSaver} onChange={set("dataSaver", "Data saver")} />
          <SettingToggle icon={Clock} label="Watch History" description="Save viewing history" value={settings.history} onChange={set("history", "History")} />
          <SettingToggle icon={Shield} label="Parental Controls" description="Restrict mature content" value={settings.parentalControl} onChange={set("parentalControl", "Parental controls")} />
          <SettingSelect icon={Globe} label="Language" description="Display language" value={settings.language} options={["English", "Spanish", "French", "German", "Japanese", "Korean"]} onChange={set("language", "Language")} />

          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest px-1 pt-6 mb-2">Storage</p>
          <button onClick={clearCache} className="w-full flex items-center gap-3 p-3 rounded-xl bg-card hover:bg-destructive/10 transition-colors border border-border/30">
            <Trash2 className="w-4 h-4 text-destructive" />
            <div className="text-left">
              <p className="text-xs font-medium text-foreground">Clear Cache</p>
              <p className="text-[10px] text-muted-foreground">Free up storage</p>
            </div>
          </button>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-card mt-4 border border-border/30">
            <Info className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium text-foreground">MovieNoir v1.0</p>
              <p className="text-[10px] text-muted-foreground">Stream. Discover. Bloom. 🌸</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
