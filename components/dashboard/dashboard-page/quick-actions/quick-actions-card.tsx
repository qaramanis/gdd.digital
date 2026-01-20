import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Gamepad2, FileText, GalleryVerticalEnd, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QuickActionsCard() {
  const router = useRouter();

  const actions = [
    { icon: Gamepad2, label: "New Game", path: "/new-game" },
    { icon: FileText, label: "New Note", path: "/notes/new" },
    { icon: GalleryVerticalEnd, label: "View Games", path: "/games" },
    { icon: Zap, label: "Scene Viewer", path: "/playground" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map(({ icon: Icon, label, path }) => (
            <Button
              key={path}
              variant="outline"
              className="h-16 flex-col gap-1 text-xs"
              onClick={() => router.push(path)}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
