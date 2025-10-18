import { useEffect, useCallback } from "react";
import { toast } from "sonner";

interface UseClipboardPasteOptions {
  onPaste: (file: File) => void;
  enabled?: boolean;
  acceptedFormats?: string[];
}

/**
 * Hook to handle clipboard paste events for images
 * Allows users to paste images directly from clipboard (Cmd/Ctrl+V)
 */
export function useClipboardPaste({
  onPaste,
  enabled = true,
  acceptedFormats = ["image/png", "image/jpeg", "image/webp"],
}: UseClipboardPasteOptions) {
  const handlePaste = useCallback(
    async (event: ClipboardEvent) => {
      if (!enabled) return;

      // Ignore paste events when user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const items = event.clipboardData?.items;
      if (!items) return;

      // Find the first image item in clipboard
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.type.startsWith("image/")) {
          // Check if format is accepted
          if (!acceptedFormats.includes(item.type)) {
            toast.error(
              `Unsupported image format: ${item.type}. Please use PNG, JPG, or WEBP.`
            );
            return;
          }

          const blob = item.getAsFile();
          if (blob) {
            // Create a proper File object with a name
            const file = new File(
              [blob],
              `pasted-image-${Date.now()}.${item.type.split("/")[1]}`,
              { type: item.type }
            );

            event.preventDefault();
            onPaste(file);
            toast.success("Image pasted from clipboard");
            return;
          }
        }
      }
    },
    [enabled, onPaste, acceptedFormats]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [enabled, handlePaste]);
}
