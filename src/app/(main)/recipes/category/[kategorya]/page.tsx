import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/constants';
import type { Recipe } from '@/lib/types';
import { RecipeCard } from '@/components/recipe-card';
import { BookOpenText } from 'lucide-react';

async function getRecipesByCategory(categoryName: string) {
  const q = query(collection(db, COLLECTIONS.RECIPES), where('kategorya', '==', categoryName));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
}

export default async function CategoryPage({ params }: { params: { kategorya: string } }) {
  const categoryName = decodeURIComponent(params.kategorya);
  const recipes = await getRecipesByCategory(categoryName);

  return (
    <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl flex items-center">
          <BookOpenText className="mr-4 h-10 w-10"/>
          {categoryName}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Mga recipe sa ilalim ng kategoryang ito.
        </p>
      </div>
      
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-12 text-center">
            <h2 className="text-xl font-semibold">Walang Nahanap na Recipe</h2>
            <p className="mt-2 text-muted-foreground">
                Wala pang nailalagay na recipe para sa kategoryang '{categoryName}'.
            </p>
        </div>
      )}
    </div>
  );
}
