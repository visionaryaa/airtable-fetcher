import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludedWords: string[];
  onConfirm: (words: string[]) => void;
}

const FilterDialog = ({ open, onOpenChange, excludedWords, onConfirm }: FilterDialogProps) => {
  const [words, setWords] = useState<string[]>(excludedWords);
  const [newWord, setNewWord] = useState("");

  const handleAddWord = () => {
    if (newWord && !words.includes(newWord)) {
      setWords([...words, newWord]);
      setNewWord("");
    }
  };

  const handleRemoveWord = (wordToRemove: string) => {
    setWords(words.filter(word => word !== wordToRemove));
  };

  const handleConfirm = () => {
    onConfirm(words);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1f2e] text-white">
        <DialogHeader>
          <DialogTitle>Filtrer les mots</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Input
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Ajouter un mot à exclure"
              className="bg-[#2a2f3d] border-gray-700"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddWord();
                }
              }}
            />
            <Button onClick={handleAddWord} className="bg-blue-600 hover:bg-blue-700">
              Ajouter
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {words.map((word) => (
              <div
                key={word}
                className="flex items-center gap-1 bg-[#2a2f3d] px-2 py-1 rounded"
              >
                <span>{word}</span>
                <button
                  onClick={() => handleRemoveWord(word)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700">
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;