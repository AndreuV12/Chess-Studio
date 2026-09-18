type BoardControlsProps = {
  canGoBack?: boolean;
  canGoForward?: boolean;
  onFirst: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLast: () => void;
};

export default function BoardControls({ canGoBack = false, canGoForward = false, onFirst, onPrevious, onNext, onLast }: BoardControlsProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      <button type="button" disabled={!canGoBack} onClick={onFirst}>
        |&lt;
      </button>
      <button type="button" disabled={!canGoBack} onClick={onPrevious}>
        &lt;
      </button>
      <button type="button" disabled={!canGoForward} onClick={onNext}>
        &gt;
      </button>
      <button type="button" disabled={!canGoForward} onClick={onLast}>
        &gt;|
      </button>
    </div>
  );
}
