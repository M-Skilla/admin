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
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { College } from "@/lib/types";

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    abbrv: "",
  });

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/colleges");
      if (response.ok) {
        const data = await response.json();
        setColleges(data);
      }
    } catch (error) {
      console.error("Error fetching colleges:", error);
      toast({
        title: "Error",
        description: "Failed to fetch colleges",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const url = editingId ? `/api/colleges/${editingId}` : "/api/colleges";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `College ${
            editingId ? "updated" : "created"
          } successfully`,
        });
        fetchColleges();
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: "", abbrv: "" });
      }
    } catch (error) {
      console.error("Error saving college:", error);
      toast({
        title: "Error",
        description: "Failed to save college",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (college: College & { id: string }) => {
    setEditingId(college.id);
    setFormData({
      name: college.name,
      abbrv: college.abbrv,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/colleges/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "College deleted successfully",
        });
        fetchColleges();
      }
    } catch (error) {
      console.error("Error deleting college:", error);
      toast({
        title: "Error",
        description: "Failed to delete college",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Colleges Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage colleges and their information
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Colleges
                  </CardTitle>
                  <CardDescription>Manage college information</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setShowForm(!showForm);
                    setEditingId(null);
                    setFormData({ name: "", abbrv: "" });
                  }}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add College
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showForm && (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 mb-6 p-4 border rounded-lg"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">College Name</Label>
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
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                      {editingId ? "Update" : "Create"} College
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setFormData({ name: "", abbrv: "" });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {colleges.map((college: College & { id: string }) => (
                  <div
                    key={college.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">{college.name}</h3>
                      <Badge variant="secondary">{college.abbrv}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(college)}
                        disabled={isLoading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(college.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {colleges.length === 0 && !isLoading && (
                <p className="text-center text-muted-foreground py-8">
                  No colleges found. Add your first college to get started.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
