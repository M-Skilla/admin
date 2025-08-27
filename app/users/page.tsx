import { UserManager } from "@/components/user-manager";

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            User Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage users, colleges, and programmes
          </p>
        </div>
        <UserManager />
      </div>
    </div>
  );
}
