'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';

import type { Recipe, RecipeCategory } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { getCategories, createRecipe, updateRecipe } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AddNewCategoryDialog } from './add-new-category-dialog';
import { Separator } from './ui/separator';

const recipeSchema = z.object({
  pamagat: z.string().min(3, { message: 'Ang pamagat ay dapat may kahit 3 letra.' }),
  kategorya: z.string().min(1, { message: 'Pumili ng kategorya.' }),
  sangkap: z.array(z.object({ value: z.string().min(1, 'Hindi maaaring blanko ang sangkap.') })).min(1, 'Magdagdag ng kahit isang sangkap.'),
  hakbang: z.array(z.object({ value: z.string().min(1, 'Hindi maaaring blanko ang hakbang.') })).min(1, 'Magdagdag ng kahit isang hakbang.'),
});

type RecipeFormValues = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  recipe?: Recipe;
}

export function RecipeForm({ recipe }: RecipeFormProps) {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: recipe
      ? {
          pamagat: recipe.pamagat,
          kategorya: recipe.kategorya,
          sangkap: recipe.sangkap.map((s) => ({ value: s })),
          hakbang: recipe.hakbang.map((h) => ({ value: h })),
        }
      : {
          pamagat: '',
          kategorya: '',
          sangkap: [{ value: '' }],
          hakbang: [{ value: '' }],
        },
  });

  const { fields: sangkapFields, append: appendSangkap, remove: removeSangkap } = useFieldArray({
    control: form.control,
    name: 'sangkap',
  });

  const { fields: hakbangFields, append: appendHakbang, remove: removeHakbang } = useFieldArray({
    control: form.control,
    name: 'hakbang',
  });

  useEffect(() => {
    async function fetchCategories() {
      setIsCategoriesLoading(true);
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
      setIsCategoriesLoading(false);
    }
    fetchCategories();
  }, []);

  const handleCategoryAdded = (newCategory: string) => {
    const newCat = { id: newCategory.toLowerCase(), name: newCategory };
    setCategories(prev => [...prev, newCat].sort((a,b) => a.name.localeCompare(b.name)));
    form.setValue('kategorya', newCategory);
  };

  const onSubmit = async (data: RecipeFormValues) => {
    if (!user || !userProfile) {
      toast({ variant: 'destructive', title: 'Error', description: 'Kailangan mong mag-login.' });
      return;
    }
    
    setIsLoading(true);
    const recipeData = {
      pamagat: data.pamagat,
      kategorya: data.kategorya,
      sangkap: data.sangkap.map(s => s.value),
      hakbang: data.hakbang.map(h => h.value),
      ginawaNi: user.uid,
      ginawaNiPangalan: userProfile.pangalan,
    };

    const result = recipe
      ? await updateRecipe(recipe.id, recipeData)
      : await createRecipe(recipeData);

    if (result.success) {
      toast({ title: 'Success!', description: `Recipe ${recipe ? 'updated' : 'created'} successfully.` });
      router.push('/');
      router.refresh();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{recipe ? 'I-edit ang Recipe' : 'Gumawa ng Bagong Recipe'}</CardTitle>
          <CardDescription>Punan ang mga detalye ng iyong recipe.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="pamagat">Pamagat ng Recipe</Label>
              <Input id="pamagat" {...form.register('pamagat')} />
              {form.formState.errors.pamagat && <p className="text-sm text-destructive">{form.formState.errors.pamagat.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Kategorya</Label>
               <Controller
                control={form.control}
                name="kategorya"
                render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger disabled={isCategoriesLoading}>
                            <SelectValue placeholder={isCategoriesLoading ? "Nagllo-load..." : "Pumili ng kategorya"} />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
               />
              <AddNewCategoryDialog onCategoryAdded={handleCategoryAdded} />
              {form.formState.errors.kategorya && <p className="text-sm text-destructive">{form.formState.errors.kategorya.message}</p>}
            </div>
            
            <Separator />

            <div>
              <Label className="text-lg font-medium">Mga Sangkap</Label>
              <div className="mt-2 space-y-4">
                {sangkapFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input {...form.register(`sangkap.${index}.value`)} placeholder={`Sangkap #${index + 1}`} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSangkap(index)} disabled={sangkapFields.length <= 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendSangkap({ value: '' })}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Magdagdag ng Sangkap
                </Button>
                 {form.formState.errors.sangkap && <p className="text-sm text-destructive">{form.formState.errors.sangkap.message || form.formState.errors.sangkap.root?.message}</p>}
              </div>
            </div>
            
            <Separator />

            <div>
              <Label className="text-lg font-medium">Mga Hakbang sa Pagluto</Label>
               <div className="mt-2 space-y-4">
                {hakbangFields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <span className="mt-2 font-bold">{index + 1}.</span>
                    <Textarea {...form.register(`hakbang.${index}.value`)} placeholder={`Hakbang #${index + 1}`} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeHakbang(index)} disabled={hakbangFields.length <= 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => appendHakbang({ value: '' })}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Magdagdag ng Hakbang
                </Button>
                 {form.formState.errors.hakbang && <p className="text-sm text-destructive">{form.formState.errors.hakbang.message || form.formState.errors.hakbang.root?.message}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {recipe ? 'I-update ang Recipe' : 'I-save ang Recipe'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
