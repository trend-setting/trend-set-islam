import { useRef } from "react";

const RichTextEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}> = ({ value, onChange, disabled }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newValue = value.slice(0, start) + text + value.slice(end);
    onChange(newValue);

    // Restore focus and update cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          className="px-1 rounded bg-light text-primary font-semibold"
          onClick={() => insertAtCursor("**bold text**")}
          disabled={disabled}
        >
          B
        </button>

        <button
          type="button"
          className="px-1 rounded bg-light text-primary font-semibold"
          onClick={() => insertAtCursor("<br>")}
          disabled={disabled}
        >
          Space
        </button>
      </div>
      <textarea
        ref={textareaRef}
        id="rich-textarea"
        className="w-full p-3 border rounded-lg border-black mt-3 mb-4 bg-primary focus:ring-black focus:border-black"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your answer here..."
        disabled={disabled}
      />
    </div>
  );
};

export default RichTextEditor;
