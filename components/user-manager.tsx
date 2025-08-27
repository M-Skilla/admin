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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trash2,
  Edit,
  Plus,
  Users,
  Building,
  GraduationCap,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type {
  College,
  Programme,
  User,
  CollegeFormData,
  ProgrammeFormData,
  UserFormData,
} from "@/lib/types";

export function UserManager() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [programmes, setProgrammes] = useState<
    (Programme & { id: string; collegeId: string })[]
  >([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(
    null
  );
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Form states
  const [showCollegeForm, setShowCollegeForm] = useState(false);
  const [showProgrammeForm, setShowProgrammeForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);

  const [collegeFormData, setCollegeFormData] = useState<CollegeFormData>({
    abbrv: "",
    name: "",
  });

  const [programmeFormData, setProgrammeFormData] = useState<ProgrammeFormData>(
    {
      abbrv: "",
      name: "",
      years: 3,
      collegeId: "",
    }
  );

  const [userFormData, setUserFormData] = useState<UserFormData>({
    collegeId: "",
    programmeId: "",
    endDate: "",
    fullName: "",
    regNo: "",
    roles: "",
    startDate: "",
    profilePicUrl: "",
  });

  useEffect(() => {
    fetchColleges();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (colleges.length > 0) {
      fetchAllProgrammes();
    }
  }, [colleges]);

  const fetchColleges = async () => {
    try {
      const response = await fetch("/api/colleges");
      const data = await response.json();
      setColleges(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch colleges",
        variant: "destructive",
      });
    }
  };

  const fetchAllProgrammes = async () => {
    try {
      const allProgrammes: (Programme & { id: string; collegeId: string })[] =
        [];

      for (const college of colleges) {
        console.log(`Fetching programmes for college: ${college.id}`);
        try {
          const response = await fetch(
            `/api/colleges/${college.id}/programmes`
          );
          if (response.ok) {
            const data = await response.json();
            console.log(`Programmes for ${college.name}:`, data);
            allProgrammes.push(...data);
          } else {
            const errorData = await response.text();
            console.error(
              `Failed to fetch programmes for college ${college.id}:`,
              response.status,
              errorData
            );
          }
        } catch (fetchError) {
          console.error(
            `Network error fetching programmes for college ${college.id}:`,
            fetchError
          );
        }
      }

      console.log("All programmes:", allProgrammes);
      setProgrammes(allProgrammes);
    } catch (error) {
      console.error("Error in fetchAllProgrammes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch programmes",
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

  // Image handling functions
  const handleProfileImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedProfileImage(file);
    } else {
      toast({
        title: "Warning",
        description: "Please select a valid image file",
        variant: "destructive",
      });
    }
  };

  const removeProfileImage = () => {
    setSelectedProfileImage(null);
    setUserFormData((prev) => ({ ...prev, profilePicUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadProfileImage = async () => {
    if (!selectedProfileImage) return "";

    setUploadingProfileImage(true);
    try {
      const formData = new FormData();
      formData.append("images", selectedProfileImage);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload profile image");
      }

      const { imageUrls } = await response.json();
      setSelectedProfileImage(null);
      return imageUrls[0] || "";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload profile image",
        variant: "destructive",
      });
      return "";
    } finally {
      setUploadingProfileImage(false);
    }
  };

  // College operations
  const handleCollegeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/colleges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(collegeFormData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "College created successfully",
        });
        setCollegeFormData({ abbrv: "", name: "" });
        setShowCollegeForm(false);
        fetchColleges();
      } else {
        throw new Error("Failed to create college");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create college",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCollege = async (id: string) => {
    if (
      !confirm(
        "Are you sure? This will also delete all programmes in this college."
      )
    )
      return;

    try {
      const response = await fetch(`/api/colleges/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "College deleted successfully",
        });
        fetchColleges();
        fetchAllProgrammes();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete college",
        variant: "destructive",
      });
    }
  };

  // Programme operations
  const handleProgrammeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/colleges/${programmeFormData.collegeId}/programmes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(programmeFormData),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Programme created successfully",
        });
        setProgrammeFormData({ abbrv: "", name: "", years: 3, collegeId: "" });
        setShowProgrammeForm(false);
        fetchAllProgrammes();
      } else {
        throw new Error("Failed to create programme");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create programme",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProgramme = async (
    collegeId: string,
    programmeId: string
  ) => {
    if (!confirm("Are you sure you want to delete this programme?")) return;

    try {
      const response = await fetch(
        `/api/colleges/${collegeId}/programmes/${programmeId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Programme deleted successfully",
        });
        fetchAllProgrammes();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete programme",
        variant: "destructive",
      });
    }
  };

  // User operations
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Upload profile image first if selected
      const profileImageUrl = await uploadProfileImage();

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userFormData,
          profilePicUrl: profileImageUrl || userFormData.profilePicUrl,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User created successfully",
        });
        setUserFormData({
          collegeId: "",
          programmeId: "",
          endDate: "",
          fullName: "",
          regNo: "",
          roles: "",
          startDate: "",
          profilePicUrl: "",
        });
        setSelectedProfileImage(null);
        setShowUserForm(false);
        fetchUsers();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        throw new Error("Failed to create user");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCollegeProgrammes = (collegeId: string) => {
    const collegeProgrammes = programmes.filter(
      (p) => p.collegeId === collegeId
    );
    console.log(
      `Getting programmes for college ${collegeId}:`,
      collegeProgrammes
    );
    return collegeProgrammes;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">User Management</h2>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Users</h3>
        <Button
          onClick={() => setShowUserForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {showUserForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
            <CardDescription>Add a new user to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={userFormData.fullName}
                    onChange={(e) =>
                      setUserFormData({
                        ...userFormData,
                        fullName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="regNo">Registration Number</Label>
                  <Input
                    id="regNo"
                    value={userFormData.regNo}
                    onChange={(e) =>
                      setUserFormData({
                        ...userFormData,
                        regNo: e.target.value,
                      })
                    }
                    placeholder="T24-03-00000"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="college">College</Label>
                  <Select
                    value={userFormData.collegeId}
                    onValueChange={(value) =>
                      setUserFormData({
                        ...userFormData,
                        collegeId: value,
                        programmeId: "",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a college" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map((college) => (
                        <SelectItem key={college.id} value={college.id!}>
                          {college.name} ({college.abbrv})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="programme">Programme</Label>
                  <Select
                    value={userFormData.programmeId}
                    onValueChange={(value) =>
                      setUserFormData({
                        ...userFormData,
                        programmeId: value,
                      })
                    }
                    disabled={!userFormData.collegeId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a programme" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCollegeProgrammes(userFormData.collegeId).map(
                        (programme) => (
                          <SelectItem key={programme.id} value={programme.id}>
                            {programme.name} ({programme.abbrv})
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={userFormData.startDate}
                    onChange={(e) =>
                      setUserFormData({
                        ...userFormData,
                        startDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={userFormData.endDate}
                    onChange={(e) =>
                      setUserFormData({
                        ...userFormData,
                        endDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="profilePic">Profile Picture</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      id="profilePic"
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Choose Image
                    </Button>
                    {selectedProfileImage && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeProfileImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {selectedProfileImage && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <ImageIcon className="h-4 w-4" />
                      <span className="text-sm">
                        {selectedProfileImage.name}
                      </span>
                    </div>
                  )}
                  {userFormData.profilePicUrl && !selectedProfileImage && (
                    <div className="flex items-center gap-2">
                      <img
                        src={userFormData.profilePicUrl}
                        alt="Current profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <span className="text-sm text-muted-foreground">
                        Current profile picture
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="roles">Roles (comma-separated)</Label>
                <Input
                  id="roles"
                  value={userFormData.roles}
                  onChange={(e) =>
                    setUserFormData({
                      ...userFormData,
                      roles: e.target.value,
                    })
                  }
                  placeholder="student, governor"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Creating this user will automatically
                  generate an authentication account with:
                </p>
                <ul className="text-sm text-blue-700 mt-1 ml-4 list-disc">
                  <li>
                    Email:{" "}
                    {userFormData.regNo
                      ? `${userFormData.regNo}@college.edu`
                      : "RegNo@college.edu"}
                  </li>
                  <li>Password: campus</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create User"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUserForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  {user.profilePicUrl ? (
                    <img
                      src={user.profilePicUrl}
                      alt={user.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <h4 className="font-semibold">{user.fullName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {user.regNo} • {user.college.name} ({user.college.abbrv})
                    </p>
                    {user.programme && (
                      <p className="text-sm text-muted-foreground">
                        {user.programme.name} ({user.programme.abbrv}) -{" "}
                        {user.programme.years} years
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} variant="secondary">
                          {role}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.startDate).toLocaleDateString()} -{" "}
                      {new Date(user.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
