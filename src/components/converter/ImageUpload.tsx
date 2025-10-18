"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, ImagePlus, X, AlertCircle, Clipboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IMAGE_CONSTRAINTS } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  onClear: () => void;
  disabled?: boolean;
  selectedFile?: File | null;
  previewUrl?: string | null;
  error?: string | null;
}

export function ImageUpload({
  onFileSelect,
  onClear,
  disabled = false,
  selectedFile,
  previewUrl,
  error,
}: ImageUploadProps) {
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!IMAGE_CONSTRAINTS.ALLOWED_FORMATS.includes(file.type as typeof IMAGE_CONSTRAINTS.ALLOWED_FORMATS[number])) {
      return `Invalid file type. Please upload ${IMAGE_CONSTRAINTS.ALLOWED_EXTENSIONS.join(", ")} files only.`;
    }

    // Check file size
    if (file.size > IMAGE_CONSTRAINTS.MAX_SIZE) {
      const maxSizeMB = IMAGE_CONSTRAINTS.MAX_SIZE / (1024 * 1024);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return `File size (${fileSizeMB}MB) exceeds maximum limit of ${maxSizeMB}MB. Please choose a smaller file.`;
    }

    // Check minimum file size (prevent 0 byte files)
    if (file.size === 0) {
      return `File appears to be empty. Please choose a valid image file.`;
    }

    return null;
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Clear previous validation errors
      setValidationError(null);

      // Handle rejected files first
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        let errorMessage = "File rejected. ";

        if (rejection.errors) {
          const errorCodes = rejection.errors.map((e: any) => e.code);

          if (errorCodes.includes("file-too-large")) {
            const maxSizeMB = IMAGE_CONSTRAINTS.MAX_SIZE / (1024 * 1024);
            errorMessage = `File is too large. Maximum size is ${maxSizeMB}MB.`;
          } else if (errorCodes.includes("file-invalid-type")) {
            errorMessage = `Invalid file type. Please upload ${IMAGE_CONSTRAINTS.ALLOWED_EXTENSIONS.join(", ")} files only.`;
          } else if (errorCodes.includes("too-many-files")) {
            errorMessage = "Please upload only one file at a time.";
          }
        }

        setValidationError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const validationErr = validateFile(file);

        if (validationErr) {
          setValidationError(validationErr);
          toast.error(validationErr);
          return;
        }

        onFileSelect(file);
      }
    },
    [onFileSelect, validateFile]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/png": [".png"],
        "image/jpeg": [".jpg", ".jpeg"],
        "image/webp": [".webp"],
      },
      maxFiles: 1,
      disabled,
      multiple: false,
    });

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (selectedFile && previewUrl) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">Selected Image</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedFile.name}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={onClear}
                disabled={disabled}
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
              <img
                src={previewUrl}
                alt="Preview"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {formatFileSize(selectedFile.size)}
              </Badge>
              <Badge variant="secondary">
                {selectedFile.type.split("/")[1].toUpperCase()}
              </Badge>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200",
          "flex flex-col items-center justify-center min-h-[500px] p-12 text-center",
          "hover:border-primary/50 hover:bg-accent/30",
          isDragActive && "border-primary bg-accent/50 scale-[0.98]",
          isDragReject && "border-destructive bg-destructive/5",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <input {...getInputProps()} />

        <div className="space-y-8">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 ring-8 ring-primary/5">
            {isDragActive ? (
              <Upload className="h-12 w-12 text-primary animate-bounce" />
            ) : (
              <ImagePlus className="h-12 w-12 text-primary" />
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-semibold">
              {isDragActive
                ? "Drop it here"
                : "Choose an image"}
            </h3>
            <p className="text-base text-muted-foreground">
              Drag and drop or click to browse
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="outline" className="font-normal text-xs px-3 py-1">PNG</Badge>
            <Badge variant="outline" className="font-normal text-xs px-3 py-1">JPG</Badge>
            <Badge variant="outline" className="font-normal text-xs px-3 py-1">WEBP</Badge>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Maximum {IMAGE_CONSTRAINTS.MAX_SIZE / (1024 * 1024)}MB</span>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clipboard className="h-3 w-3" />
              <span>or paste (Cmd+V)</span>
            </div>
          </div>
        </div>

        {isDragReject && (
          <Alert variant="destructive" className="mt-8 max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please upload a valid image file
            </AlertDescription>
          </Alert>
        )}
      </div>

      {(error || validationError) && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || validationError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
