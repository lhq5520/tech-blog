import { type BlogFormData } from "../types";

interface DraftRestoreBannerProps {
  draft: BlogFormData;
  lastSavedTime: Date | null;
  onRestore: () => void;
  onDiscard: () => void;
}

const DraftRestoreBanner = ({
  draft,
  lastSavedTime,
  onRestore,
  onDiscard,
}: DraftRestoreBannerProps) => {
  const formatTime = (date: Date | null): string => {
    if (!date) return "";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "刚刚 / Just now";
    if (minutes < 60) return `${minutes} 分钟前 / ${minutes} min ago`;
    if (hours < 24) return `${hours} 小时前 / ${hours} hr ago`;
    if (days < 7) return `${days} 天前 / ${days} days ago`;
    
    return new Intl.DateTimeFormat("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const draftTitle = draft.title || "无标题 / Untitled";
  const draftPreview = draft.subtitle || draft.content?.substring(0, 50) || "";

  return (
    <div
      className="alert alert-warning alert-dismissible fade show position-fixed bottom-0 start-0 end-0 m-0 rounded-0 border-top border-warning"
      style={{
        zIndex: 1050,
        boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
        borderRadius: "0",
      }}
      role="alert"
    >
      <div className="container d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3 flex-grow-1">
          <div>
            <svg
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 16 16"
              className="text-warning"
            >
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
            </svg>
          </div>
          <div className="flex-grow-1">
            <strong className="d-block mb-1">
              检测到未保存的草稿 / Unsaved draft detected
            </strong>
            <div className="small text-muted">
              <div>
                <strong>标题 / Title:</strong> {draftTitle}
              </div>
              {draftPreview && (
                <div className="text-truncate" style={{ maxWidth: "400px" }}>
                  {draftPreview}...
                </div>
              )}
              {lastSavedTime && (
                <div>
                  <strong>最后保存 / Last saved:</strong> {formatTime(lastSavedTime)}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <button
            type="button"
            className="btn btn-sm btn-warning"
            onClick={onRestore}
          >
            恢复 / Restore
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onDiscard}
          >
            丢弃 / Discard
          </button>
          <button
            type="button"
            className="btn-close"
            onClick={onDiscard}
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  );
};

export default DraftRestoreBanner;
