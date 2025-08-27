import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Megaphone,
  Users,
  Building,
  Upload,
  GraduationCap,
  Bug,
} from "lucide-react";

export default function AdminDashboard() {
  const sections = [
    {
      title: "Announcements",
      description: "Create, edit, and manage announcements",
      icon: Megaphone,
      href: "/announcements",
      color: "text-blue-600",
    },
    {
      title: "User Management",
      description: "Manage users, colleges, and programmes",
      icon: Users,
      href: "/users",
      color: "text-green-600",
    },
    {
      title: "Colleges",
      description: "Manage colleges and their information",
      icon: Building,
      href: "/colleges",
      color: "text-purple-600",
    },
    {
      title: "Programmes",
      description: "Manage academic programmes across colleges",
      icon: GraduationCap,
      href: "/programmes",
      color: "text-indigo-600",
    },
    {
      title: "File Upload",
      description: "Upload files to Firebase Storage",
      icon: Upload,
      href: "/upload",
      color: "text-orange-600",
    },
    {
      title: "Debug Console",
      description: "Debug and inspect application data",
      icon: Bug,
      href: "/debug",
      color: "text-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Firebase Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Choose a section to manage your application
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card
                key={section.href}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <IconComponent className={`h-6 w-6 ${section.color}`} />
                    {section.title}
                  </CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={section.href}>
                    <Button className="w-full">Go to {section.title}</Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Quick Stats</h2>
          <p className="text-muted-foreground">
            Navigate to each section to view detailed statistics and manage your
            data.
          </p>
        </div>
      </div>
    </div>
  );
}
