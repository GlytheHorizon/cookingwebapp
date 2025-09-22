'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteRecipe } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

interface RecipeControlsProps {
  recipeId: string;
  creatorId: string;
}

export function RecipeControls({ recipeId, creatorId }: RecipeControlsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const isCreator = user && user.uid === creatorId;

  if (!isCreator) {
    return null;
  }

  const handleEdit = () => {
    router.push(`/recipes/edit/${recipeId}`);
  };

  const handleDelete = async () => {
    const result = await deleteRecipe(recipeId);
    if (result.success) {
      toast({ title: 'Success', description: 'Recipe deleted successfully.' });
      router.push('/');
      router.refresh();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={handleEdit}>
        <Pencil className="mr-2 h-4 w-4" />
        I-edit
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            I-delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sigurado ka ba?</AlertDialogTitle>
            <AlertDialogDescription>
              Ang aksyon na ito ay hindi na mababawi. Permanenteng mabubura ang recipe na ito at lahat ng komento nito.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Kanselahin</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Oo, I-delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
