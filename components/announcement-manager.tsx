"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Edit, Plus, Upload, X, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Announcement, AnnouncementFormData } from "@/lib/types";

export function AnnouncementManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<AnnouncementFormData>({
    authorId: "",
    authorName: "",
    collegeAbbrv: "",
    collegeId: "",
    collegeName: "",
    roles: "",
    body: "",
    department: "",
    title: "",
    visibility: "",
    imageUrls: [],
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchUsers();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements");
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch announcements",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  const handleAuthorSelect = (authorId: string) => {
    const selectedUser = users.find((user) => user.id === authorId);
    if (selectedUser) {
      setFormData({
        ...formData,
        authorId: selectedUser.id,
        authorName: selectedUser.name,
        collegeId: selectedUser.college.id,
        collegeAbbrv: selectedUser.college.abbrv,
        collegeName: selectedUser.college.name,
      });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length !== files.length) {
      toast({
        title: "Warning",
        description: "Only image files are allowed",
        variant: "destructive",
      });
    }

    setSelectedImages((prev) => [...prev, ...imageFiles]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeUploadedImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls?.filter((_, i) => i !== index) || [],
    }));
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) return [];

    setUploadingImages(true);
    try {
      const formData = new FormData();
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload images");
      }

      const { imageUrls } = await response.json();
      setSelectedImages([]);
      return imageUrls;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
      return [];
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Upload new images if any
      const newImageUrls = await uploadImages();
      const allImageUrls = [...(formData.imageUrls || []), ...newImageUrls];

      const url = editingId
        ? `/api/announcements/${editingId}`
        : "/api/announcements";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageUrls: allImageUrls,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Announcement ${
            editingId ? "updated" : "created"
          } successfully`,
        });
        resetForm();
        fetchAnnouncements();
      } else {
        throw new Error("Failed to save announcement");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save announcement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      authorId: announcement.author.id,
      authorName: announcement.author.name,
      collegeAbbrv: announcement.author.college.abbrv,
      collegeId: announcement.author.college.id,
      collegeName: announcement.author.college.name,
      roles: announcement.author.roles.join(", "),
      body: announcement.body,
      department: announcement.department,
      title: announcement.title,
      visibility: announcement.visibility.join(", "),
      imageUrls: announcement.imageUrls || [],
    });
    setEditingId(announcement.id!);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Announcement deleted successfully",
        });
        fetchAnnouncements();
      } else {
        throw new Error("Failed to delete announcement");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      authorId: "",
      authorName: "",
      collegeAbbrv: "",
      collegeId: "",
      collegeName: "",
      roles: "",
      body: "",
      department: "",
      title: "",
      visibility: "",
      imageUrls: [],
    });
    setSelectedImages([]);
    setEditingId(null);
    setShowForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Announcements</h2>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Announcement
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit" : "Create"} Announcement</CardTitle>
            <CardDescription>
              Fill in the details for the announcement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  rows={4}
                  required
                />
              </div>

              {/* Image Upload Section */}
              <div>
                <Label htmlFor="images">Images (optional)</Label>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Select Images
                    </Button>
                    {selectedImages.length > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {selectedImages.length} image(s) selected
                      </span>
                    )}
                  </div>

                  {/* Preview selected images */}
                  {selectedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                            {image.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Preview existing images when editing */}
                  {formData.imageUrls && formData.imageUrls.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Existing Images
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        {formData.imageUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Existing ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeUploadedImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Select
                    value={formData.authorId}
                    onValueChange={handleAuthorSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an author" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.college.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* {formData.authorId && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Selected Author
                    </Label>
                    <p className="text-sm">{formData.authorName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      College
                    </Label>
                    <p className="text-sm">
                      {formData.collegeName} ({formData.collegeAbbrv})
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      College ID
                    </Label>
                    <p className="text-sm">{formData.collegeId}</p>
                  </div>
                </div>
              )} */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roles">Roles (comma-separated)</Label>
                  <Input
                    id="roles"
                    value={formData.roles}
                    onChange={(e) =>
                      setFormData({ ...formData, roles: e.target.value })
                    }
                    placeholder="admin, moderator, user"
                  />
                </div>
                <div>
                  <Label htmlFor="visibility">
                    Visibility (comma-separated)
                  </Label>
                  <Input
                    id="visibility"
                    value={formData.visibility}
                    onChange={(e) =>
                      setFormData({ ...formData, visibility: e.target.value })
                    }
                    placeholder="public, private, internal"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading || uploadingImages}>
                  {uploadingImages
                    ? "Uploading images..."
                    : isLoading
                    ? "Saving..."
                    : editingId
                    ? "Update"
                    : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {announcements &&
          announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {announcement.title}
                    </CardTitle>
                    {announcement.author && (
                      <CardDescription>
                        {announcement.department} • {announcement.author.name} (
                        {announcement.author.college.name})
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(announcement)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(announcement.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {announcement.body}
                </p>

                {/* Display images if any */}
                {announcement.imageUrls &&
                  announcement.imageUrls.length > 0 && (
                    <div className="mb-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {announcement.imageUrls.map((url, index) => {
                          if (url !== "") {
                            return (
                              <div key={index} className="relative">
                                <img
                                  src={url}
                                  alt={`Announcement image ${index + 1}`}
                                  className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => window.open(url, "_blank")}
                                />
                                <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1 py-0.5 rounded flex items-center gap-1">
                                  <Image className="h-3 w-3" />
                                  {index + 1}
                                </div>
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>
                  )}

                <div className="flex flex-wrap gap-2 mb-2">
                  {announcement.author &&
                    announcement.author.roles &&
                    announcement.author.roles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {announcement.visibility &&
                    announcement.visibility.map((vis) => (
                      <Badge key={vis} variant="outline">
                        {vis}
                      </Badge>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Created: {new Date(announcement.createdAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
