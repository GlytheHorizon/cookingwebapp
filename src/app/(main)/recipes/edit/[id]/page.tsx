'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/constants';
import type { Recipe } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { RecipeForm } from '@/components/recipe-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditRecipePage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        router.replace('/auth');
        return;
    }

    const fetchRecipe = async () => {
      try {
        const recipeDoc = await getDoc(doc(db, COLLECTIONS.RECIPES, params.id));
        if (recipeDoc.exists()) {
          const recipeData = { id: recipeDoc.id, ...recipeDoc.data() } as Recipe;
          if (recipeData.ginawaNi !== user.uid) {
              setError("Access Denied: You are not the creator of this recipe.");
              setTimeout(() => router.replace('/'), 3000);
          } else {
              setRecipe(recipeData);
          }
        } else {
          setError("Recipe not found.");
        }
      } catch (e) {
        setError("Failed to fetch recipe.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [params.id, user, authLoading, router]);

  if (loading || authLoading) {
    return (
        <div className="container mx-auto max-w-3xl p-8">
            <Skeleton className="h-16 w-1/2 mb-4" />
            <Skeleton className="h-10 w-full mb-8" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  if (error) {
    return <div className="container mx-auto p-8 text-center text-destructive">{error}</div>;
  }

  return recipe ? <RecipeForm recipe={recipe} /> : null;
}
