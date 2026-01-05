"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Loader2,
  FolderOpen,
  FileText,
  FileJson,
  FileCode,
  File,
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

type FileFormat = "txt" | "md" | "html" | "json";

interface SubSectionData {
  title: string;
  content: string;
}

interface SectionData {
  title: string;
  sectionType: string;
  subSections: SubSectionData[];
}

interface ExportSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSection: SectionData;
  availableSections?: SectionData[];
}

const FILE_FORMATS: { value: FileFormat; label: string; icon: typeof FileText }[] = [
  { value: "txt", label: ".txt", icon: FileText },
  { value: "md", label: ".md", icon: FileCode },
  { value: "html", label: ".html", icon: File },
  { value: "json", label: ".json", icon: FileJson },
];

function stripHtmlTags(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

function htmlToMarkdown(html: string): string {
  let markdown = html;

  // Convert paragraphs to double newlines
  markdown = markdown.replace(/<p[^>]*>/gi, "");
  markdown = markdown.replace(/<\/p>/gi, "\n\n");

  // Convert line breaks
  markdown = markdown.replace(/<br\s*\/?>/gi, "\n");

  // Convert bold
  markdown = markdown.replace(/<(strong|b)[^>]*>/gi, "**");
  markdown = markdown.replace(/<\/(strong|b)>/gi, "**");

  // Convert italic
  markdown = markdown.replace(/<(em|i)[^>]*>/gi, "_");
  markdown = markdown.replace(/<\/(em|i)>/gi, "_");

  // Convert unordered lists
  markdown = markdown.replace(/<ul[^>]*>/gi, "");
  markdown = markdown.replace(/<\/ul>/gi, "\n");
  markdown = markdown.replace(/<li[^>]*>/gi, "- ");
  markdown = markdown.replace(/<\/li>/gi, "\n");

  // Convert ordered lists
  markdown = markdown.replace(/<ol[^>]*>/gi, "");
  markdown = markdown.replace(/<\/ol>/gi, "\n");

  // Strip remaining HTML tags
  markdown = markdown.replace(/<[^>]+>/g, "");

  // Clean up extra whitespace
  markdown = markdown.replace(/\n{3,}/g, "\n\n").trim();

  return markdown;
}

function formatSubSection(
  subSection: SubSectionData,
  format: FileFormat
): string {
  const { title, content } = subSection;

  if (!content.trim()) return "";

  switch (format) {
    case "txt": {
      const plainContent = stripHtmlTags(content);
      return `${title}\n${"-".repeat(title.length)}\n${plainContent}`;
    }
    case "md": {
      const mdContent = htmlToMarkdown(content);
      return `### ${title}\n\n${mdContent}`;
    }
    case "html": {
      return `<h3>${title}</h3>\n${content}`;
    }
    default:
      return `${title}\n${stripHtmlTags(content)}`;
  }
}

function formatContent(
  sections: SectionData[],
  format: FileFormat
): string {
  if (format === "json") {
    return JSON.stringify(
      sections.map((s) => ({
        title: s.title,
        sectionType: s.sectionType,
        subSections: s.subSections.map((sub) => ({
          title: sub.title,
          content: sub.content,
        })),
      })),
      null,
      2
    );
  }

  const formattedSections = sections.map((section) => {
    const formattedSubSections = section.subSections
      .map((sub) => formatSubSection(sub, format))
      .filter(Boolean)
      .join(format === "html" ? "\n\n" : "\n\n");

    if (format === "md") {
      return `## ${section.title}\n\n${formattedSubSections}`;
    } else if (format === "html") {
      return `<h2>${section.title}</h2>\n${formattedSubSections}`;
    } else {
      return `${section.title}\n${"=".repeat(section.title.length)}\n\n${formattedSubSections}`;
    }
  });

  if (format === "html") {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GDD Export</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    h2 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; margin-top: 2rem; }
    h3 { color: #555; margin-top: 1.5rem; }
  </style>
</head>
<body>
${formattedSections.join("\n\n")}
</body>
</html>`;
  }

  return formattedSections.join("\n\n---\n\n");
}

export function ExportSectionModal({
  isOpen,
  onClose,
  currentSection,
  availableSections = [],
}: ExportSectionModalProps) {
  const [fileName, setFileName] = useState(
    currentSection.title.toLowerCase().replace(/\s+/g, "-")
  );
  const [fileFormat, setFileFormat] = useState<FileFormat>("txt");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    new Set([currentSection.sectionType])
  );
  const [saveLocation, setSaveLocation] = useState<string>("Downloads");

  const allSections = useMemo(
    () => [currentSection, ...availableSections],
    [currentSection, availableSections]
  );

  const allSelected = useMemo(
    () => selectedSections.size === allSections.length,
    [selectedSections.size, allSections.length]
  );

  // Reset state when modal opens
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      } else {
        setFileName(currentSection.title.toLowerCase().replace(/\s+/g, "-"));
        setFileFormat("txt");
        setSelectedSections(new Set([currentSection.sectionType]));
        setSaveLocation("Downloads");
      }
    },
    [onClose, currentSection]
  );

  // Toggle section selection
  const toggleSection = useCallback((sectionType: string) => {
    setSelectedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionType)) {
        // Don't allow deselecting if it's the last one
        if (newSet.size > 1) {
          newSet.delete(sectionType);
        }
      } else {
        newSet.add(sectionType);
      }
      return newSet;
    });
  }, []);

  // Toggle all sections
  const toggleAllSections = useCallback(() => {
    if (allSelected) {
      // Deselect all except current section
      setSelectedSections(new Set([currentSection.sectionType]));
    } else {
      // Select all sections
      setSelectedSections(new Set(allSections.map((s) => s.sectionType)));
    }
  }, [allSelected, allSections, currentSection.sectionType]);

  // Get sections to export
  const sectionsToExport = useMemo(() => {
    return allSections.filter((s) => selectedSections.has(s.sectionType));
  }, [allSections, selectedSections]);

  // Determine modal title
  const modalTitle = useMemo(() => {
    if (selectedSections.size > 1) {
      return "Exporting multiple sections";
    }
    return `Exporting ${currentSection.title} section`;
  }, [selectedSections.size, currentSection.title]);

  // Choose save location using File System Access API
  const chooseSaveLocation = useCallback(async () => {
    if ("showDirectoryPicker" in window) {
      try {
        const dirHandle = await (window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker();
        setSaveLocation(dirHandle.name);
        return dirHandle;
      } catch (error) {
        // User cancelled or API not supported
        if ((error as Error).name !== "AbortError") {
          console.error("Error selecting directory:", error);
        }
        return null;
      }
    } else {
      toast.info("Your browser doesn't support directory selection. File will download to your default location.");
      return null;
    }
  }, []);

  // Export file
  const handleExport = useCallback(async () => {
    if (!fileName.trim()) {
      toast.error("Please enter a file name");
      return;
    }

    setIsExporting(true);

    try {
      const content = formatContent(sectionsToExport, fileFormat);
      const fullFileName = `${fileName.trim()}.${fileFormat}`;

      // Try to use File System Access API for save picker
      if ("showSaveFilePicker" in window) {
        try {
          const mimeTypes: Record<FileFormat, string> = {
            txt: "text/plain",
            md: "text/markdown",
            html: "text/html",
            json: "application/json",
          };

          const fileHandle = await (window as unknown as {
            showSaveFilePicker: (options: {
              suggestedName: string;
              types: Array<{
                description: string;
                accept: Record<string, string[]>;
              }>;
            }) => Promise<FileSystemFileHandle>;
          }).showSaveFilePicker({
            suggestedName: fullFileName,
            types: [
              {
                description: `${fileFormat.toUpperCase()} file`,
                accept: { [mimeTypes[fileFormat]]: [`.${fileFormat}`] },
              },
            ],
          });

          const writable = await fileHandle.createWritable();
          await writable.write(content);
          await writable.close();

          toast.success(`Exported ${fullFileName} successfully`);
          onClose();
          return;
        } catch (error) {
          // User cancelled or API failed, fall back to download
          if ((error as Error).name === "AbortError") {
            setIsExporting(false);
            return;
          }
        }
      }

      // Fallback: use traditional download
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fullFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${fullFileName} successfully`);
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export file");
    } finally {
      setIsExporting(false);
    }
  }, [fileName, fileFormat, sectionsToExport, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File name and format row */}
          <div className="space-y-2">
            <Label htmlFor="fileName">File name</Label>
            <div className="flex items-center gap-2">
              <Input
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter file name"
                className="flex-1"
              />
              <Select
                value={fileFormat}
                onValueChange={(value) => setFileFormat(value as FileFormat)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILE_FORMATS.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      <div className="flex items-center gap-2">
                        <format.icon className="h-3 w-3" />
                        {format.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Export multiple sections option */}
          {availableSections.length > 0 && (
            <div className="space-y-3">
              <Label>Sections to export</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {/* Export all sections option */}
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Checkbox
                    id="export-all-sections"
                    checked={allSelected}
                    onCheckedChange={toggleAllSections}
                  />
                  <Label
                    htmlFor="export-all-sections"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Export all sections
                  </Label>
                </div>

                {/* Individual sections */}
                {allSections.map((section) => (
                  <div
                    key={section.sectionType}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      id={section.sectionType}
                      checked={selectedSections.has(section.sectionType)}
                      onCheckedChange={() =>
                        toggleSection(section.sectionType)
                      }
                      disabled={
                        selectedSections.has(section.sectionType) &&
                        selectedSections.size === 1
                      }
                    />
                    <Label
                      htmlFor={section.sectionType}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {section.title}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save location */}
          <div className="space-y-2">
            <Label>Save location</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2 text-left font-normal"
              onClick={chooseSaveLocation}
            >
              <FolderOpen className="h-4 w-4 shrink-0" />
              <span className="truncate">{saveLocation}</span>
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
