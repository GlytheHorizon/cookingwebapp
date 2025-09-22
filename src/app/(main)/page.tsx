
import { Suspense } from 'react';
import Link from 'next/link';
import { UtensilsCrossed, BookOpen } from 'lucide-react';
import type { Recipe, RecipeCategory } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RecipeCard } from '@/components/recipe-card';
import { Timestamp } from 'firebase/firestore';

async function getHomePageData() {
  // Mock data to prevent Firestore errors
  const categories: RecipeCategory[] = [
    { id: '1', name: 'Panghimagas' },
    { id: '2', name: 'Ulam' },
    { id: '3', name: 'Meryenda' },
    { id: '4', name: 'Inumin' },
  ];
  const recipes: Recipe[] = [
    { id: '1', pamagat: 'Sample Recipe 1', kategorya: 'Ulam', ginawaNi: '1', ginawaNiPangalan: 'Mama', sangkap: [], hakbang: [], petsaGawa: Timestamp.now().toDate().toISOString() },
    { id: '2', pamagat: 'Sample Recipe 2', kategorya: 'Panghimagas', ginawaNi: '1', ginawaNiPangalan: 'Mama', sangkap: [], hakbang: [], petsaGawa: Timestamp.now().toDate().toISOString() },
  ];
  
  return { categories, recipes };
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
  const { categories, recipes } = await getHomePageData();
  
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
                {categories.length === 0 ? (
                    <p className='text-muted-foreground'>Wala pang mga kategorya.</p>
                ) : (
                    <CategoryList categories={categories} />
                )}
            </Suspense>
        </div>

        <div>
            <h2 className="mb-4 flex items-center text-2xl font-bold">
                <UtensilsCrossed className="mr-3 h-6 w-6" />
                Mga Bagong Recipe
            </h2>
            <Suspense fallback={<RecentRecipesSkeleton />}>
                 {recipes.length === 0 ? (
                    <p className='text-muted-foreground'>Wala pang mga recipe. Maging una sa pag-post!</p>
                ) : (
                    <RecentRecipes recipes={recipes} />
                )}
            </Suspense>
        </div>
      </div>
    </div>
  );
}
