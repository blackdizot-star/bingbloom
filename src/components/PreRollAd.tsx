import VideoAdGate from "@/components/VideoAdGate";

interface Props {
  onFinish: () => void;
  seed?: string;
}

const PreRollAd = ({ onFinish, seed = "player" }: Props) => (
  <VideoAdGate onFinish={onFinish} seed={seed} variant="player" />
);

export default PreRollAd;
