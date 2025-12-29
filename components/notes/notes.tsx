"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchUserNotes } from "@/lib/actions/notes-actions";
import { NotesCard } from "./notes-card";
import { NotesSearch } from "./notes-search";
import { ActiveFilters } from "./active-filters";
import { EmptyNotesState } from "./empty-notes";
import { Note } from "@/types/notes";
import { useUser } from "@/providers/user-context";

export default function NotesPage() {
  const router = useRouter();
  const { userId, loading: userLoading } = useUser();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  // Redirect to sign-in if no user after loading completes
  useEffect(() => {
    if (!userLoading && !userId) {
      router.push("/sign-in");
    }
  }, [userLoading, userId, router]);

  useEffect(() => {
    async function fetchNotes() {
      if (!userId || userLoading) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const notesData = await fetchUserNotes(userId);

        setNotes(notesData as Note[]);
      } catch (err) {
        console.error("Error fetching notes:", err);
        setError("Failed to load notes. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchNotes();
  }, [userId, userLoading]);

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const handleSave = (id: string) => {
    setNotes(
      notes.map((note) =>
        note.id === id
          ? { ...note, title: editTitle, content: editContent }
          : note,
      ),
    );
    setEditingId(null);
  };

  const handleDiscard = () => {
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleAddNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: "New Note",
      content: "Add your content here...",
      createdAt: new Date().toISOString(),
      tags: [],
      game: null,
    };
    setNotes([newNote, ...notes]);
    setEditingId(newNote.id);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
  };

  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags || [])));
  const allGames = Array.from(
    new Set(notes.map((note) => note.game).filter(Boolean) as string[]),
  );

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchTerm === "" ||
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.game && note.game.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTag =
      selectedTag === null || (note.tags && note.tags.includes(selectedTag));

    const matchesGame = selectedGame === null || note.game === selectedGame;

    return matchesSearch && matchesTag && matchesGame;
  });

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4 pt-0">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4">
        <p className="text-lg text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 pt-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Notes</h1>
          <p className="text-accent">Keep track of your notes</p>
        </div>

        <Button onClick={handleAddNote}>
          <Plus className="mr-2 size-4" />
          New Note
        </Button>
      </div>

      <NotesSearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedGame={selectedGame}
        setSelectedGame={setSelectedGame}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        allGames={allGames}
        allTags={allTags}
      />

      {(selectedGame || selectedTag) && (
        <ActiveFilters
          selectedGame={selectedGame}
          selectedTag={selectedTag}
          setSelectedGame={setSelectedGame}
          setSelectedTag={setSelectedTag}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <NotesCard
            key={note.id}
            note={note}
            isEditing={editingId === note.id}
            editTitle={editTitle}
            editContent={editContent}
            setEditTitle={setEditTitle}
            setEditContent={setEditContent}
            onEdit={() => handleEdit(note)}
            onSave={() => handleSave(note.id)}
            onDelete={() => handleDelete(note.id)}
            onDiscard={handleDiscard} // Add this line
            setSelectedGame={setSelectedGame}
            setSelectedTag={setSelectedTag}
          />
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <EmptyNotesState
          onClearFilters={() => {
            setSearchTerm("");
            setSelectedTag(null);
            setSelectedGame(null);
          }}
        />
      )}
    </div>
  );
}
