"use client";

import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const results: string[] = [];

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          results.push(
            data.url || data.downloadURL || `${file.name} uploaded successfully`
          );
        } else {
          results.push(`Failed to upload ${file.name}`);
        }
      }

      setUploadResults(results);
      setSelectedFiles([]);

      toast({
        title: "Upload completed",
        description: `${results.length} files processed`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">File Upload</h1>
          <p className="text-muted-foreground mt-2">
            Upload files to Firebase Storage
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Files
              </CardTitle>
              <CardDescription>
                Select and upload files to Firebase Storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="file-upload">Select Files</Label>
                <Input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="mt-2"
                />
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Selected Files</h3>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {file.type.startsWith("image/") ? (
                            <ImageIcon className="h-5 w-5 text-blue-500" />
                          ) : (
                            <File className="h-5 w-5 text-gray-500" />
                          )}
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={uploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading
                      ? "Uploading..."
                      : `Upload ${selectedFiles.length} Files`}
                  </Button>
                </div>
              )}

              {uploadResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Upload Results</h3>
                  <div className="space-y-2">
                    {uploadResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg bg-muted/50"
                      >
                        <p className="text-sm">{result}</p>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setUploadResults([])}
                  >
                    Clear Results
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
