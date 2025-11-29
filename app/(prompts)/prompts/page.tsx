"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

interface Prompt {
  id: string;
  title: string;
  content: string;
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("prompts");
    if (saved) {
      setPrompts(JSON.parse(saved));
    }
  }, []);

  function savePrompts(newPrompts: Prompt[]) {
    localStorage.setItem("prompts", JSON.stringify(newPrompts));
    setPrompts(newPrompts);
  }

  function handleCreate() {
    if (!title || !content) return;

    // Use crypto.randomUUID if available, otherwise fallback to timestamp + random
    const id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const newPrompt: Prompt = {
      id,
      title,
      content,
    };

    savePrompts([...prompts, newPrompt]);
    setTitle("");
    setContent("");
  }

  function handleDelete(id: string) {
    savePrompts(prompts.filter((p) => p.id !== id));
  }

  function handleEdit(prompt: Prompt) {
    setEditingPrompt(prompt);
    setTitle(prompt.title);
    setContent(prompt.content);
  }

  function handleUpdate() {
    if (!editingPrompt || !title || !content) return;

    savePrompts(
      prompts.map((p) =>
        p.id === editingPrompt.id ? { ...p, title, content } : p
      )
    );
    setEditingPrompt(null);
    setTitle("");
    setContent("");
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Prompts</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {editingPrompt ? "Edit Prompt" : "Create New Prompt"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={editingPrompt ? handleUpdate : handleCreate}>
              {editingPrompt ? "Update" : "Create"}
            </Button>
            {editingPrompt && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingPrompt(null);
                  setTitle("");
                  setContent("");
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {prompts.map((prompt) => (
          <Card key={prompt.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{prompt.title}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(prompt)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(prompt.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">
                {prompt.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

