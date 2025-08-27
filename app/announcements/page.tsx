import { AnnouncementManager } from "@/components/announcement-manager";

export default function AnnouncementsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Announcements Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Create, edit, and manage announcements
          </p>
        </div>
        <AnnouncementManager />
      </div>
    </div>
  );
}
