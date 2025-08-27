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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bug, Search, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DebugPage() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [debugData, setDebugData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchColleges();
  }, []);

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

  const handleDebugCollege = async () => {
    if (!selectedCollege) {
      toast({
        title: "Error",
        description: "Please select a college to debug",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/debug/college/${selectedCollege}`);

      if (response.ok) {
        const data = await response.json();
        setDebugData(data);
        toast({
          title: "Debug Complete",
          description: "College data retrieved successfully",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Debug Failed",
          description: errorData.error || "Failed to debug college",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error debugging college:", error);
      toast({
        title: "Error",
        description: "An error occurred during debugging",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderDebugData = (data: any, depth = 0) => {
    if (data === null || data === undefined) {
      return <span className="text-muted-foreground">null</span>;
    }

    if (
      typeof data === "string" ||
      typeof data === "number" ||
      typeof data === "boolean"
    ) {
      return <span className="text-green-600">{JSON.stringify(data)}</span>;
    }

    if (Array.isArray(data)) {
      return (
        <div className={`ml-${depth * 4}`}>
          <span className="text-blue-600">[</span>
          {data.map((item, index) => (
            <div key={index} className="ml-4">
              <span className="text-muted-foreground">{index}:</span>{" "}
              {renderDebugData(item, depth + 1)}
              {index < data.length - 1 && (
                <span className="text-blue-600">,</span>
              )}
            </div>
          ))}
          <span className="text-blue-600">]</span>
        </div>
      );
    }

    if (typeof data === "object") {
      return (
        <div className={`ml-${depth * 4}`}>
          <span className="text-blue-600">{"{"}</span>
          {Object.entries(data).map(([key, value], index, array) => (
            <div key={key} className="ml-4">
              <span className="text-purple-600">"{key}"</span>:{" "}
              {renderDebugData(value, depth + 1)}
              {index < array.length - 1 && (
                <span className="text-blue-600">,</span>
              )}
            </div>
          ))}
          <span className="text-blue-600">{"}"}</span>
        </div>
      );
    }

    return <span>{JSON.stringify(data)}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Debug Console</h1>
          <p className="text-muted-foreground mt-2">
            Debug and inspect application data
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                College Debug
              </CardTitle>
              <CardDescription>
                Debug college data and related information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="college-select">Select College</Label>
                  <Select
                    value={selectedCollege}
                    onValueChange={setSelectedCollege}
                  >
                    <SelectTrigger id="college-select">
                      <SelectValue placeholder="Choose a college to debug" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map((college) => (
                        <SelectItem key={college.id} value={college.id}>
                          {college.name} ({college.abbrv})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleDebugCollege}
                  disabled={isLoading || !selectedCollege}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Debug College
                </Button>
              </div>

              {debugData && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Debug Results</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        Status: {debugData.exists ? "Found" : "Not Found"}
                      </Badge>
                      {debugData.programmesCount !== undefined && (
                        <Badge variant="secondary">
                          Programmes: {debugData.programmesCount}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 p-4 rounded-lg overflow-auto">
                      <pre className="text-sm font-mono">
                        {renderDebugData(debugData)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {debugData === null && (
                <div className="text-center py-8 text-muted-foreground">
                  Select a college and click "Debug College" to see debug
                  information
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common debugging and testing actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Test Toast",
                      description: "This is a test notification",
                    });
                  }}
                >
                  Test Toast Notification
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log("Debug: Current colleges state:", colleges);
                    console.log("Debug: Current debug data:", debugData);
                    toast({
                      title: "Console Log",
                      description: "Check browser console for debug info",
                    });
                  }}
                >
                  Log to Console
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDebugData(null);
                    toast({
                      title: "Cleared",
                      description: "Debug data cleared",
                    });
                  }}
                >
                  Clear Debug Data
                </Button>
                <Button variant="outline" onClick={fetchColleges}>
                  Refresh Colleges
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
