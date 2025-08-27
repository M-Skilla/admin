"use client";

import React, { useState, useEffect } from "react";
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
import { Trash2, Edit, Plus, GraduationCap, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { College, Programme } from "@/lib/types";

export default function ProgrammesPage() {
  const [programmes, setProgrammes] = useState<
    (Programme & { id: string; collegeId: string })[]
  >([]);
  const [colleges, setColleges] = useState<(College & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    abbrv: "",
    description: "",
    duration: "",
    collegeId: "",
  });

  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    if (colleges.length > 0) {
      fetchAllProgrammes();
    }
  }, [colleges]);

  const fetchColleges = async () => {
    try {
      const response = await fetch("/api/colleges");
      if (response.ok) {
        const data = await response.json();
        setColleges(data);
      }
    } catch (error) {
      console.error("Error fetching colleges:", error);
    }
  };

  const fetchAllProgrammes = async () => {
    try {
      setIsLoading(true);
      const allProgrammes: (Programme & { id: string; collegeId: string })[] =
        [];

      for (const college of colleges) {
        const response = await fetch(`/api/colleges/${college.id}/programmes`);
        if (response.ok) {
          const data = await response.json();
          allProgrammes.push(...data);
        }
      }

      setProgrammes(allProgrammes);
    } catch (error) {
      console.error("Error fetching programmes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch programmes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProgrammesForCollege = async (collegeId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/colleges/${collegeId}/programmes`);
      if (response.ok) {
        const data = await response.json();
        setProgrammes(data);
      }
    } catch (error) {
      console.error("Error fetching programmes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch programmes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.collegeId) {
      toast({
        title: "Error",
        description: "Please select a college",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const url = editingId
        ? `/api/colleges/${formData.collegeId}/programmes/${editingId}`
        : `/api/colleges/${formData.collegeId}/programmes`;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          abbrv: formData.abbrv,
          description: formData.description,
          duration: formData.duration,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Programme ${
            editingId ? "updated" : "created"
          } successfully`,
        });

        if (selectedCollegeId) {
          fetchProgrammesForCollege(selectedCollegeId);
        } else {
          fetchAllProgrammes();
        }

        setShowForm(false);
        setEditingId(null);
        setFormData({
          name: "",
          abbrv: "",
          description: "",
          duration: "",
          collegeId: "",
        });
      }
    } catch (error) {
      console.error("Error saving programme:", error);
      toast({
        title: "Error",
        description: "Failed to save programme",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (
    programme: Programme & { id: string; collegeId: string }
  ) => {
    setEditingId(programme.id);
    setFormData({
      name: programme.name || "",
      abbrv: programme.abbrv || "",
      description: programme.description || "",
      duration: programme.duration || "",
      collegeId: programme.collegeId,
    });
    setShowForm(true);
  };

  const handleDelete = async (
    programme: Programme & { id: string; collegeId: string }
  ) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/colleges/${programme.collegeId}/programmes/${programme.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Programme deleted successfully",
        });

        if (selectedCollegeId) {
          fetchProgrammesForCollege(selectedCollegeId);
        } else {
          fetchAllProgrammes();
        }
      }
    } catch (error) {
      console.error("Error deleting programme:", error);
      toast({
        title: "Error",
        description: "Failed to delete programme",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollegeFilter = (collegeId: string) => {
    setSelectedCollegeId(collegeId);
    if (collegeId === "all") {
      fetchAllProgrammes();
    } else {
      fetchProgrammesForCollege(collegeId);
    }
  };

  const getCollegeName = (collegeId: string) => {
    const college = colleges.find((c) => c.id === collegeId);
    return college ? college.name : "Unknown College";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Programmes Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage academic programmes across colleges
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Programmes
                  </CardTitle>
                  <CardDescription>Manage academic programmes</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={selectedCollegeId}
                    onValueChange={handleCollegeFilter}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by college" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Colleges</SelectItem>
                      {colleges.map((college) => (
                        <SelectItem key={college.id} value={college.id}>
                          {college.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => {
                      setShowForm(!showForm);
                      setEditingId(null);
                      setFormData({
                        name: "",
                        abbrv: "",
                        description: "",
                        duration: "",
                        collegeId: "",
                      });
                    }}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Programme
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {showForm && (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 mb-6 p-4 border rounded-lg"
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="name">Programme Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="abbrv">Abbreviation</Label>
                      <Input
                        id="abbrv"
                        value={formData.abbrv}
                        onChange={(e) =>
                          setFormData({ ...formData, abbrv: e.target.value })
                        }
                        placeholder="e.g., CS, EE"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({ ...formData, duration: e.target.value })
                        }
                        placeholder="e.g., 4 years"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="college">College</Label>
                    <Select
                      value={formData.collegeId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, collegeId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a college" />
                      </SelectTrigger>
                      <SelectContent>
                        {colleges.map((college) => (
                          <SelectItem key={college.id} value={college.id}>
                            {college.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                      {editingId ? "Update" : "Create"} Programme
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setFormData({
                          name: "",
                          abbrv: "",
                          description: "",
                          duration: "",
                          collegeId: "",
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {programmes.map((programme) => (
                  <div
                    key={`${programme.collegeId}-${programme.id}`}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{programme.name}</h3>
                        {programme.abbrv && (
                          <Badge variant="default">{programme.abbrv}</Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Building className="h-3 w-3" />
                          {getCollegeName(programme.collegeId)}
                        </Badge>
                        {programme.duration && (
                          <Badge variant="secondary">
                            {programme.duration}
                          </Badge>
                        )}
                      </div>
                      {programme.description && (
                        <p className="text-sm text-muted-foreground">
                          {programme.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(programme)}
                        disabled={isLoading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(programme)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {programmes.length === 0 && !isLoading && (
                <p className="text-center text-muted-foreground py-8">
                  No programmes found. Add your first programme to get started.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
