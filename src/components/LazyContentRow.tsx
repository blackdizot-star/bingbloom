import { useRef, useState, useEffect } from "react";
import ContentRow from "./ContentRow";
import { useKenyaContent } from "@/hooks/useKenyaContent";

type LayoutType = "scroll" | "grid" | "featured" | "list" | "wide" | "poster";

const LazyContentRow = ({ title, query, layout = "scroll" }: { title: string; query: string; layout?: LayoutType }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { data, isLoading } = useKenyaContent(query, visible);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {visible ? (
        <ContentRow title={title} items={data} isLoading={isLoading} layout={layout} />
      ) : (
        <div className="h-44" />
      )}
    </div>
  );
};

export default LazyContentRow;
