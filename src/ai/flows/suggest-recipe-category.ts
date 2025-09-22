'use server';

/**
 * @fileOverview Suggests a recipe category based on user input using generative AI.
 *
 * - suggestRecipeCategory - A function that suggests a recipe category.
 * - SuggestRecipeCategoryInput - The input type for the suggestRecipeCategory function.
 * - SuggestRecipeCategoryOutput - The return type for the suggestRecipeCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipeCategoryInputSchema = z.object({
  recipeName: z
    .string()
    .describe('The name of the recipe for which a category is needed.'),
  ingredients: z
    .string()
    .describe('A list of the ingredients included in the recipe.'),
});
export type SuggestRecipeCategoryInput = z.infer<
  typeof SuggestRecipeCategoryInputSchema
>;

const SuggestRecipeCategoryOutputSchema = z.object({
  suggestedCategory: z
    .string()
    .describe('The suggested recipe category based on the recipe name.'),
});
export type SuggestRecipeCategoryOutput = z.infer<
  typeof SuggestRecipeCategoryOutputSchema
>;

export async function suggestRecipeCategory(
  input: SuggestRecipeCategoryInput
): Promise<SuggestRecipeCategoryOutput> {
  return suggestRecipeCategoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipeCategoryPrompt',
  input: {schema: SuggestRecipeCategoryInputSchema},
  output: {schema: SuggestRecipeCategoryOutputSchema},
  prompt: `You are a helpful assistant that suggests a recipe category based on the recipe name and ingredients.

The user is creating a recipe with the following name: {{{recipeName}}}. The ingredients are: {{{ingredients}}}.

Suggest a category for this recipe.  Make sure the category is related to food or cooking, is not vulgar, and is a general, common category name, and not too specific (e.g. instead of \"Adobo sa Gata\", return \"Ulam\").  Respond in Tagalog.
`,
});

const suggestRecipeCategoryFlow = ai.defineFlow(
  {
    name: 'suggestRecipeCategoryFlow',
    inputSchema: SuggestRecipeCategoryInputSchema,
    outputSchema: SuggestRecipeCategoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
