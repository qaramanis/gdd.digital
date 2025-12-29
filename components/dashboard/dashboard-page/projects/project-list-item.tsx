import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function ProjectListItem({
  icon: Icon,
  title,
  subtitle,
  badge,
  imageUrl,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  badge?: string;
  imageUrl?: string;
  onClick: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-200 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded flex items-center justify-center overflow-hidden relative">
          {imageUrl ? (
            <Image
              fill
              sizes="40px"
              src={imageUrl}
              alt={title}
              className="object-cover"
              unoptimized
            />
          ) : (
            <Icon className="h-4 w-4" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-accent">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {badge && <Badge variant="secondary">{badge}</Badge>}
        <ArrowRight className="h-4 w-4 text-accent" />
      </div>
    </div>
  );
}
