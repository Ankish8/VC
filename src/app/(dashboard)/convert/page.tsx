"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { RefreshCw, Sparkles } from "lucide-react";
import { ImageUpload } from "@/components/converter/ImageUpload";
import { ConversionProgress } from "@/components/converter/ConversionProgress";
import { SVGPreview } from "@/components/converter/SVGPreview";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConversionResult } from "@/types";

type WorkflowStage =
  | "idle"
  | "uploading"
  | "processing"
  | "downloading"
  | "completed"
  | "error";

interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
}

interface ConversionError {
  message: string;
  details?: string;
}

export default function ConvertPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [conversion, setConversion] = useState<ConversionResult | null>(null);
  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<ConversionError | null>(null);

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setError(null);

    // Create preview URL
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Auto-start conversion
    await handleConversion(file);
  };

  // Handle file clear
  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadData(null);
    setError(null);
    setWorkflowStage("idle");
    setProgress(0);
  };

  // Handle new conversion (convert another)
  const handleConvertAnother = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadData(null);
    setConversion(null);
    setError(null);
    setWorkflowStage("idle");
    setProgress(0);
  };

  // Upload file to server
  const uploadFile = async (file: File): Promise<UploadResponse> => {
    setWorkflowStage("uploading");
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    // Simulate progress for upload
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const data: UploadResponse = await response.json();
      setProgress(100);

      toast.success("File uploaded successfully");
      return data;
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
  };

  // Convert image to SVG
  const convertToSVG = async (
    uploadData: UploadResponse
  ): Promise<ConversionResult> => {
    setWorkflowStage("processing");
    setProgress(0);

    // Simulate progress for processing
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 90));
    }, 500);

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: uploadData.url,
          filename: uploadData.filename,
          dimensions: uploadData.dimensions,
          fileSize: uploadData.size,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to convert image");
      }

      const data: ConversionResult = await response.json();

      // Simulate downloading stage
      setWorkflowStage("downloading");
      setProgress(95);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProgress(100);

      toast.success("Conversion completed successfully");
      return data;
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
  };

  // Main conversion workflow
  const handleConversion = async (file: File) => {
    try {
      setError(null);

      // Step 1: Upload file
      const uploadResult = await uploadFile(file);
      setUploadData(uploadResult);

      // Step 2: Convert to SVG
      const conversionResult = await convertToSVG(uploadResult);
      setConversion(conversionResult);

      // Step 3: Complete
      setWorkflowStage("completed");
      setProgress(100);
    } catch (error) {
      console.error("Conversion error:", error);

      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";

      setError({
        message: "Conversion failed",
        details: errorMessage,
      });

      setWorkflowStage("error");
      toast.error(errorMessage);
    }
  };

  // Handle SVG download
  const handleDownload = async () => {
    if (!conversion) return;

    try {
      const response = await fetch(conversion.svgUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = conversion.svgFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      toast.success("SVG downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download SVG");
    }
  };

  // Render based on workflow stage
  const isConverting = ["uploading", "processing", "downloading"].includes(
    workflowStage
  );
  const isCompleted = workflowStage === "completed";
  const isError = workflowStage === "error";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Convert to SVG
        </h1>
        <p className="text-muted-foreground">
          Transform your raster images into scalable vector graphics
        </p>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Upload Section */}
        <div className="space-y-6">
          {!isConverting && !isCompleted && (
            <ImageUpload
              onFileSelect={handleFileSelect}
              onClear={handleClear}
              disabled={isConverting}
              selectedFile={selectedFile}
              previewUrl={previewUrl}
              error={error?.details}
            />
          )}

          {isConverting && (
            <ConversionProgress
              stage={
                workflowStage as "uploading" | "processing" | "downloading"
              }
              progress={progress}
              message={
                workflowStage === "uploading"
                  ? "Uploading your image to the server..."
                  : workflowStage === "processing"
                    ? "Converting your image to vector format using AI..."
                    : "Preparing your SVG for download..."
              }
            />
          )}

          {isCompleted && conversion && (
            <div className="space-y-4">
              <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
                <Sparkles className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">
                  Success!
                </AlertTitle>
                <AlertDescription className="text-green-600">
                  Your image has been successfully converted to SVG format.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleConvertAnother}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Convert Another Image
              </Button>
            </div>
          )}

          {isError && error && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error.message}
                  {error.details && (
                    <>
                      <br />
                      <span className="text-xs mt-2 block">
                        {error.details}
                      </span>
                    </>
                  )}
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleConvertAnother}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          )}
        </div>

        {/* Right Column - Preview Section */}
        <div className="space-y-6">
          {isCompleted && conversion ? (
            <SVGPreview
              conversion={conversion}
              originalPreviewUrl={previewUrl || undefined}
              onDownload={handleDownload}
            />
          ) : (
            <div className="hidden lg:flex h-full min-h-[400px] items-center justify-center rounded-xl border-2 border-dashed bg-muted/50">
              <div className="text-center space-y-2 p-6">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Preview Area</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Your converted SVG will appear here once the conversion is
                  complete
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Preview (shown below on small screens) */}
      {isCompleted && conversion && (
        <div className="lg:hidden">
          <SVGPreview
            conversion={conversion}
            originalPreviewUrl={previewUrl || undefined}
            onDownload={handleDownload}
          />
        </div>
      )}
    </div>
  );
}
