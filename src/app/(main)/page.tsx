
import { Suspense } from 'react';
import Link from 'next/link';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { UtensilsCrossed, BookOpen } from 'lucide-react';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/constants';
import type { Recipe, RecipeCategory } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RecipeCard } from '@/components/recipe-card';

async function getCategories() {
  const categoriesCol = collection(db, COLLECTIONS.CATEGORIES);
  const categorySnapshot = await getDocs(categoriesCol);
  return categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecipeCategory));
}

async function getRecentRecipes() {
  const recipesQuery = query(collection(db, COLLECTIONS.RECIPES), orderBy('petsaGawa', 'desc'), limit(5));
  const recipeSnapshot = await getDocs(recipesQuery);
  return recipeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
}

function CategoryList({ categories }: { categories: RecipeCategory[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {categories.map((category) => (
        <Link key={category.id} href={`/recipes/category/${category.name}`} className="block transition-transform hover:scale-105">
          <Card className="flex h-full flex-col items-center justify-center p-6 text-center">
            <BookOpen className="mb-2 h-8 w-8 text-primary" />
            <p className="font-semibold text-foreground">{category.name}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function RecentRecipes({ recipes }: { recipes: Recipe[] }) {
    return (
        <div className="space-y-4">
            {recipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
        </div>
    );
}

function CategoriesSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="flex h-full flex-col items-center justify-center p-6 text-center">
                    <Skeleton className="mb-2 h-8 w-8 rounded-full" />
                    <Skeleton className="h-6 w-24" />
                </Card>
            ))}
        </div>
    );
}

function RecentRecipesSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="mt-2 h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-1/3" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default async function HomePage() {
  
  return (
    <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          Welcome sa Lutong Bahay Ni Mama!
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Tuklasin ang mga recipe ni Mama at magsimulang magluto.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <h2 className="mb-4 flex items-center text-2xl font-bold">
                <BookOpen className="mr-3 h-6 w-6" />
                Mga Kategorya ng Recipe
            </h2>
            <Suspense fallback={<CategoriesSkeleton />}>
                <CategoryListLoader />
            </Suspense>
        </div>

        <div>
            <h2 className="mb-4 flex items-center text-2xl font-bold">
                <UtensilsCrossed className="mr-3 h-6 w-6" />
                Mga Bagong Recipe
            </h2>
            <Suspense fallback={<RecentRecipesSkeleton />}>
                <RecentRecipesLoader />
            </Suspense>
        </div>
      </div>
    </div>
  );
}

async function CategoryListLoader() {
    const categories = await getCategories();
    if (categories.length === 0) {
        return <p className='text-muted-foreground'>Wala pang mga kategorya.</p>
    }
    return <CategoryList categories={categories} />;
}


async function RecentRecipesLoader() {
    const recipes = await getRecentRecipes();
    if (recipes.length === 0) {
        return <p className='text-muted-foreground'>Wala pang mga recipe. Maging una sa pag-post!</p>
    }
    return <RecentRecipes recipes={recipes} />;
}
