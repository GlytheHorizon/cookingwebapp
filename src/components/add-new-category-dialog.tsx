'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addCategory, generateCategorySuggestion } from '@/lib/actions';
import { Loader2 } from 'lucide-react';

interface AddNewCategoryDialogProps {
  onCategoryAdded: (newCategory: string) => void;
}

export function AddNewCategoryDialog({ onCategoryAdded }: AddNewCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!categoryName.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a category name idea.' });
      return;
    }
    setIsLoading(true);
    const result = await generateCategorySuggestion(categoryName);
    if (result.success && result.suggestion) {
      setSuggestion(result.suggestion);
      toast({ title: 'Suggestion Generated!', description: 'AI has suggested a category name for you.' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsLoading(false);
  };

  const handleAddCategory = async () => {
    const categoryToAdd = suggestion || categoryName;
    if (!categoryToAdd.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Category name cannot be empty.' });
      return;
    }
    setIsLoading(true);
    const result = await addCategory(categoryToAdd);
    if (result.success && result.name) {
      toast({ title: 'Success!', description: `Category "${result.name}" added.` });
      onCategoryAdded(result.name);
      setOpen(false);
      setCategoryName('');
      setSuggestion('');
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Magdagdag ng Bagong Kategorya
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Magdagdag ng Bagong Kategorya</DialogTitle>
          <DialogDescription>
            Mag-type ng ideya para sa kategorya, at tutulungan ka ng AI na gumawa ng standard na pangalan.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category-name" className="text-right">
              Ideya
            </Label>
            <Input
              id="category-name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="col-span-3"
              placeholder="e.g. Pang-umagahan"
            />
          </div>
          <Button onClick={handleGenerate} disabled={isLoading} variant="secondary">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gumawa ng Suggestion
          </Button>
          {suggestion && (
            <div className="rounded-md border bg-muted p-3 text-center">
              <p className="text-sm text-muted-foreground">Suggested Category:</p>
              <p className="font-bold text-lg">{suggestion}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleAddCategory} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Idagdag ang Kategorya
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
