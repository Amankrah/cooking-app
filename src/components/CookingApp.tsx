"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, ChefHat, Leaf, Zap, Award, ArrowLeft, X, Utensils, Clock } from "lucide-react"

type Screen = "input" | "method" | "results" | "details"
type CookingMethod = "boil" | "steam" | "fry" | "bake" | "microwave" | "raw"

interface Ingredient {
  name: string
  icon: string
  selectedMethod?: CookingMethod
}

interface Recipe {
  name: string
  cuisine: string
  icon: string
  ingredients: Ingredient[]
  description: string
}

const foodItems = [
  { name: "Broccoli", icon: "🥦" },
  { name: "Chicken Breast", icon: "🍗" },
  { name: "Potato", icon: "🥔" },
  { name: "Salmon", icon: "🐟" },
  { name: "Carrots", icon: "🥕" },
  { name: "Rice", icon: "🍚" },
  { name: "Onions", icon: "🧅" },
  { name: "Bell Peppers", icon: "🫑" },
  { name: "Tomatoes", icon: "🍅" },
  { name: "Garlic", icon: "🧄" },
  { name: "Ginger", icon: "🫚" },
  { name: "Plantain", icon: "🍌" },
  { name: "Yam", icon: "🍠" },
  { name: "Beef", icon: "🥩" },
  { name: "Fish", icon: "🐠" },
]

const sampleRecipes: Recipe[] = [
  {
    name: "Jollof Rice with Grilled Chicken",
    cuisine: "Ghanaian",
    icon: "🇬🇭",
    description: "Traditional West African one-pot rice dish with aromatic spices and tender chicken",
    ingredients: [
      { name: "Rice", icon: "🍚" },
      { name: "Chicken Breast", icon: "🍗" },
      { name: "Tomatoes", icon: "🍅" },
      { name: "Onions", icon: "🧅" },
      { name: "Bell Peppers", icon: "🫑" },
      { name: "Garlic", icon: "🧄" },
    ],
  },
  {
    name: "Maple Glazed Salmon with Roasted Vegetables",
    cuisine: "Canadian",
    icon: "🇨🇦",
    description: "Pan-seared salmon with maple glaze served with seasonal roasted root vegetables",
    ingredients: [
      { name: "Salmon", icon: "🐟" },
      { name: "Potato", icon: "🥔" },
      { name: "Carrots", icon: "🥕" },
      { name: "Broccoli", icon: "🥦" },
      { name: "Onions", icon: "🧅" },
    ],
  },
]

const cookingMethods = [
  { id: "boil" as CookingMethod, name: "Boil", icon: "🫧", time: 15 },
  { id: "steam" as CookingMethod, name: "Steam", icon: "💨", time: 12 },
  { id: "fry" as CookingMethod, name: "Fry", icon: "🍳", time: 8 },
  { id: "bake" as CookingMethod, name: "Bake", icon: "🔥", time: 25 },
  { id: "microwave" as CookingMethod, name: "Microwave", icon: "📱", time: 5 },
  { id: "raw" as CookingMethod, name: "Raw", icon: "🥗", time: 0 },
]

const methodData = {
  boil: { nutrition: 50, carbon: 180, water: 1000, energy: 250 },
  steam: { nutrition: 90, carbon: 150, water: 500, energy: 200 },
  fry: { nutrition: 60, carbon: 450, water: 50, energy: 900 },
  bake: { nutrition: 70, carbon: 400, water: 0, energy: 800 },
  microwave: { nutrition: 75, carbon: 120, water: 0, energy: 180 },
  raw: { nutrition: 100, carbon: 0, water: 0, energy: 0 },
}

export default function CookingApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("input")
  const [cookingSelection, setCookingSelection] = useState<"single" | "recipe">("single")
  const [selectedFood, setSelectedFood] = useState("")
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [customIngredients, setCustomIngredients] = useState<Ingredient[]>([])
  const [selectedMethods, setSelectedMethods] = useState<CookingMethod[]>([])
  const [finalMealMethod, setFinalMealMethod] = useState<CookingMethod | null>(null)
  const [prioritySlider, setPrioritySlider] = useState([50])
  const [searchQuery, setSearchQuery] = useState("")
  const [comparisonMethods, setComparisonMethods] = useState<CookingMethod[]>([])

  const filteredFoods = foodItems.filter((food) => food.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const addCustomIngredient = (foodName: string) => {
    const food = foodItems.find((f) => f.name === foodName)
    if (food && !customIngredients.find((ing) => ing.name === food.name)) {
      setCustomIngredients((prev) => [...prev, { name: food.name, icon: food.icon }])
      setSearchQuery("")
    }
  }

  const removeCustomIngredient = (ingredientName: string) => {
    setCustomIngredients((prev) => prev.filter((ing) => ing.name !== ingredientName))
  }

  const updateIngredientMethod = (ingredientName: string, method: CookingMethod) => {
    if (selectedRecipe) {
      setSelectedRecipe((prev) =>
        prev
          ? {
              ...prev,
              ingredients: prev.ingredients.map((ing) =>
                ing.name === ingredientName ? { ...ing, selectedMethod: method } : ing,
              ),
            }
          : null,
      )
    } else {
      setCustomIngredients((prev) =>
        prev.map((ing) => (ing.name === ingredientName ? { ...ing, selectedMethod: method } : ing)),
      )
    }
  }

  const getCurrentIngredients = (): Ingredient[] => {
    if (cookingSelection === "single" && selectedFood) {
      const food = foodItems.find((f) => f.name === selectedFood)
      return food ? [{ name: food.name, icon: food.icon }] : []
    }
    return selectedRecipe ? selectedRecipe.ingredients : customIngredients
  }

  const getBestMethod = (): CookingMethod => {
    const methodsToEvaluate = comparisonMethods.length > 0 ? comparisonMethods : selectedMethods
    if (methodsToEvaluate.length === 0) return "steam"

    const priority = prioritySlider[0] / 100

    let bestMethod = methodsToEvaluate[0]
    let bestScore = 0

    methodsToEvaluate.forEach((method) => {
      const data = methodData[method]
      const nutritionScore = data.nutrition / 100
      const envScore = 1 - data.carbon / 500
      const score = nutritionScore * (1 - priority) + envScore * priority

      if (score > bestScore) {
        bestScore = score
        bestMethod = method
      }
    })

    return bestMethod
  }

  const renderInputScreen = () => (
    <div className="min-h-screen bg-background p-6 flex flex-col">
      <div className="text-center mb-8">
        <ChefHat className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold text-foreground mb-2">What would you like to cook?</h1>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={cookingSelection === "single" ? "default" : "outline"}
          onClick={() => setCookingSelection("single")}
          className="flex-1"
        >
          Single Food
        </Button>
        <Button
          variant={cookingSelection === "recipe" ? "default" : "outline"}
          onClick={() => setCookingSelection("recipe")}
          className="flex-1"
        >
          Recipe/Meal
        </Button>
      </div>

      {cookingSelection === "single" ? (
        <>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for a food item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg py-6"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {filteredFoods.map((food) => (
              <Card
                key={food.name}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedFood === food.name ? "ring-2 ring-primary bg-card" : "hover:bg-card"
                }`}
                onClick={() => setSelectedFood(food.name)}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-2">{food.icon}</div>
                  <p className="font-medium text-card-foreground">{food.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            onClick={() => setCurrentScreen("method")}
            disabled={!selectedFood}
            className="w-full py-6 text-lg"
            size="lg"
          >
            Next
          </Button>
        </>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Utensils className="w-5 h-5" />
              Sample Recipes
            </h2>
            <div className="space-y-3">
              {sampleRecipes.map((recipe) => (
                <Card
                  key={recipe.name}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedRecipe?.name === recipe.name ? "ring-2 ring-primary bg-card" : "hover:bg-card"
                  }`}
                  onClick={() => {
                    setSelectedRecipe(recipe)
                    setCustomIngredients([])
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{recipe.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-card-foreground">{recipe.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{recipe.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {recipe.ingredients.slice(0, 4).map((ing) => (
                            <Badge key={ing.name} variant="secondary" className="text-xs">
                              {ing.icon} {ing.name}
                            </Badge>
                          ))}
                          {recipe.ingredients.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{recipe.ingredients.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Or Build Your Own Meal</h2>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Add ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && searchQuery) {
                    const matchedFood = filteredFoods[0]
                    if (matchedFood) {
                      addCustomIngredient(matchedFood.name)
                    }
                  }
                }}
              />
            </div>

            {searchQuery && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {filteredFoods.slice(0, 6).map((food) => (
                  <Button
                    key={food.name}
                    variant="outline"
                    size="sm"
                    onClick={() => addCustomIngredient(food.name)}
                    className="justify-start"
                  >
                    <span className="mr-2">{food.icon}</span>
                    {food.name}
                  </Button>
                ))}
              </div>
            )}

            {customIngredients.length > 0 && (
              <div className="space-y-2 mb-4">
                <h3 className="text-sm font-medium">Your Ingredients:</h3>
                <div className="flex flex-wrap gap-2">
                  {customIngredients.map((ingredient) => (
                    <Badge key={ingredient.name} variant="default" className="flex items-center gap-1">
                      <span>{ingredient.icon}</span>
                      {ingredient.name}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeCustomIngredient(ingredient.name)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={() => setCurrentScreen("method")}
            disabled={!selectedRecipe && customIngredients.length === 0}
            className="w-full py-6 text-lg"
            size="lg"
          >
            Next
          </Button>
        </>
      )}
    </div>
  )

  const renderMethodScreen = () => {
    const ingredients = getCurrentIngredients()

    return (
      <div className="min-h-screen bg-background p-6 flex flex-col">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => setCurrentScreen("input")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground ml-4">How do you want to cook it?</h1>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            {cookingSelection === "single" ? (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{foodItems.find((f) => f.name === selectedFood)?.icon}</span>
                <span className="font-medium text-card-foreground">{selectedFood}</span>
              </div>
            ) : (
              <div>
                <h3 className="font-medium text-card-foreground mb-3">
                  {selectedRecipe ? selectedRecipe.name : "Custom Meal"}
                </h3>
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Individual Ingredient Preparation:</h4>
                  {ingredients.map((ingredient) => (
                    <div key={ingredient.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{ingredient.icon}</span>
                        <div>
                          <span className="font-medium block">{ingredient.name}</span>
                          {ingredient.selectedMethod && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {cookingMethods.find((m) => m.id === ingredient.selectedMethod)?.time || 0} min
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {cookingMethods.map((method) => (
                          <Button
                            key={method.id}
                            size="sm"
                            variant={ingredient.selectedMethod === method.id ? "default" : "outline"}
                            onClick={() => updateIngredientMethod(ingredient.name, method.id)}
                            className="text-xs px-2 py-1 flex flex-col h-auto"
                          >
                            <span>{method.icon}</span>
                            <span className="text-[10px]">{method.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    Final Meal Cooking Method:
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    How will you cook the complete meal after combining all ingredients?
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {cookingMethods
                      .filter((m) => m.id !== "raw")
                      .map((method) => (
                        <Button
                          key={method.id}
                          size="sm"
                          variant={finalMealMethod === method.id ? "default" : "outline"}
                          onClick={() => setFinalMealMethod(method.id)}
                          className="flex flex-col h-auto py-2"
                        >
                          <span className="text-lg">{method.icon}</span>
                          <span className="text-xs">{method.name}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-2 h-2" />
                            {method.time}m
                          </span>
                        </Button>
                      ))}
                  </div>
                  {finalMealMethod && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Total cooking time: {cookingMethods.find((m) => m.id === finalMealMethod)?.time} minutes
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {cookingSelection === "single" && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {cookingMethods
              .filter((m) => m.id !== "raw")
              .map((method) => (
                <Button
                  key={method.id}
                  variant={selectedMethods.includes(method.id) ? "default" : "outline"}
                  className="h-24 flex flex-col gap-1"
                  onClick={() => {
                    setSelectedMethods((prev) =>
                      prev.includes(method.id) ? prev.filter((m) => m !== method.id) : [...prev, method.id],
                    )
                  }}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <span className="text-sm">{method.name}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {method.time} min
                  </span>
                </Button>
              ))}
          </div>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Your Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍎</span>
                <span className="text-sm font-medium">Maximize Nutrition</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Minimize Environmental Impact</span>
                <span className="text-2xl">🌍</span>
              </div>
            </div>
            <Slider value={prioritySlider} onValueChange={setPrioritySlider} max={100} step={1} className="w-full" />
            <div className="text-center mt-2 text-sm text-muted-foreground">
              {prioritySlider[0] < 30 ? "Nutrition Focus" : prioritySlider[0] > 70 ? "Environment Focus" : "Balanced"}
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={() => setCurrentScreen("results")}
          disabled={
            cookingSelection === "single"
              ? selectedMethods.length === 0
              : ingredients.some((ing) => !ing.selectedMethod) || !finalMealMethod
          }
          className="w-full py-6 text-lg"
          size="lg"
        >
          See Recommendations
        </Button>
      </div>
    )
  }

  const renderResultsScreen = () => {
    const ingredients = getCurrentIngredients()
    const bestMethod = getBestMethod()
    const bestMethodData = methodData[bestMethod]
    const bestMethodName = cookingMethods.find((m) => m.id === bestMethod)?.name || "Steam"

    const availableMethodsForComparison = cookingMethods.filter((m) => m.id !== "raw")

    const getTotalCookingTime = () => {
      if (cookingSelection === "single") {
        return cookingMethods.find((m) => m.id === bestMethod)?.time || 0
      }

      const individualTimes = ingredients.map((ing) => {
        const method = ing.selectedMethod === "raw" ? null : ing.selectedMethod
        return method ? cookingMethods.find((m) => m.id === method)?.time || 0 : 0
      })

      const maxIndividualTime = Math.max(...individualTimes, 0)
      const finalTime = finalMealMethod ? cookingMethods.find((m) => m.id === finalMealMethod)?.time || 0 : 0

      return maxIndividualTime + finalTime
    }

    const getIngredientMethodComparison = (ingredient: Ingredient) => {
      const availableMethods = cookingMethods.filter((m) => m.id !== "raw")
      return availableMethods.map((method) => ({
        method: method.id,
        name: method.name,
        icon: method.icon,
        time: method.time,
        nutrition: methodData[method.id].nutrition,
        carbon: methodData[method.id].carbon,
        isSelected: ingredient.selectedMethod === method.id,
      }))
    }

    const getMealMethodComparison = () => {
      const availableMethods = cookingMethods.filter((m) => m.id !== "raw")
      return availableMethods.map((method) => {
        // Calculate combined impact for all ingredients with this final method
        let totalNutrition = 0
        let totalCarbon = 0

        ingredients.forEach((ingredient) => {
          const individualMethod = ingredient.selectedMethod || "steam"
          let combinedNutrition = methodData[individualMethod].nutrition
          let combinedCarbon = methodData[individualMethod].carbon

          if (individualMethod !== "raw") {
            combinedNutrition = Math.max(combinedNutrition * 0.85, 40)
            combinedCarbon += methodData[method.id].carbon * 0.3
          } else {
            combinedNutrition = methodData[method.id].nutrition
            combinedCarbon = methodData[method.id].carbon * 0.5
          }

          totalNutrition += combinedNutrition
          totalCarbon += combinedCarbon
        })

        return {
          method: method.id,
          name: method.name,
          icon: method.icon,
          time: method.time,
          avgNutrition: totalNutrition / ingredients.length,
          totalCarbon: totalCarbon,
          isSelected: finalMealMethod === method.id,
        }
      })
    }

    return (
      <div className="min-h-screen bg-background p-6 flex flex-col">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => setCurrentScreen("method")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground ml-4">Recommendations</h1>
        </div>

        <Card className="mb-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-primary-foreground/90" />
            <h2 className="text-2xl font-bold mb-2">🏆 Best Choice: {bestMethodName}</h2>
            <div className="text-primary-foreground/90 mb-3">
              {cookingSelection === "single"
                ? `Perfect for ${selectedFood} based on your preferences`
                : `Optimal final cooking method for your meal`}
            </div>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <span>🍎</span>
                <span>{bestMethodData.nutrition}% nutrition</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🌍</span>
                <span>{bestMethodData.carbon}g CO2</span>
              </div>
              <div className="flex items-center gap-1 bg-primary-foreground/20 px-2 py-1 rounded">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{getTotalCookingTime()} min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              Select Methods to Compare
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Choose which cooking methods you'd like to compare for detailed analysis:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {availableMethodsForComparison.map((method) => (
                <div key={method.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={method.id}
                    checked={comparisonMethods.includes(method.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setComparisonMethods((prev) => [...prev, method.id])
                      } else {
                        setComparisonMethods((prev) => prev.filter((m) => m !== method.id))
                      }
                    }}
                  />
                  <label
                    htmlFor={method.id}
                    className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    <span>{method.icon}</span>
                    {method.name}
                    <span className="text-xs text-muted-foreground">({method.time}m)</span>
                  </label>
                </div>
              ))}
            </div>
            {comparisonMethods.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Select at least one method to see detailed comparisons below.
              </p>
            )}
          </CardContent>
        </Card>

        {comparisonMethods.length > 0 && (
          <>
            {cookingSelection === "recipe" && (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-chart-2" />
                      Compare Individual Ingredient Methods
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {ingredients.map((ingredient) => (
                        <div key={ingredient.name} className="border rounded-lg p-3">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <span>{ingredient.icon}</span>
                            {ingredient.name}
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {comparisonMethods.map((methodId) => {
                              const method = cookingMethods.find((m) => m.id === methodId)!
                              const isSelected = ingredient.selectedMethod === methodId
                              return (
                                <div
                                  key={methodId}
                                  className={`flex items-center justify-between p-2 rounded text-sm ${
                                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{method.icon}</span>
                                    <span className="font-medium">{method.name}</span>
                                    <span className="text-xs opacity-75">({method.time}m)</span>
                                  </div>
                                  <div className="flex gap-3 text-xs">
                                    <span>🍎 {methodData[methodId].nutrition}%</span>
                                    <span>🌍 {methodData[methodId].carbon}g</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChefHat className="w-5 h-5 text-chart-3" />
                      Compare Final Meal Cooking Methods
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {comparisonMethods.map((methodId) => {
                        const method = cookingMethods.find((m) => m.id === methodId)!
                        const isSelected = finalMealMethod === methodId

                        // Calculate combined impact for all ingredients with this final method
                        let totalNutrition = 0
                        let totalCarbon = 0

                        ingredients.forEach((ingredient) => {
                          const individualMethod = ingredient.selectedMethod || "steam"
                          let combinedNutrition = methodData[individualMethod].nutrition
                          let combinedCarbon = methodData[individualMethod].carbon

                          if (individualMethod !== "raw") {
                            combinedNutrition = Math.max(combinedNutrition * 0.85, 40)
                            combinedCarbon += methodData[methodId].carbon * 0.3
                          } else {
                            combinedNutrition = methodData[methodId].nutrition
                            combinedCarbon = methodData[methodId].carbon * 0.5
                          }

                          totalNutrition += combinedNutrition
                          totalCarbon += combinedCarbon
                        })

                        return (
                          <div
                            key={methodId}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{method.icon}</span>
                              <div>
                                <span className="font-medium">{method.name}</span>
                                <div className="text-xs opacity-75">Final cooking: {method.time} min</div>
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              <div>🍎 Avg: {Math.round(totalNutrition / ingredients.length)}%</div>
                              <div>🌍 Total: {Math.round(totalCarbon)}g</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      * Comparison shows combined impact of individual prep + final cooking method
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            <div className="space-y-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-chart-1" />
                    Vitamin C Retention (%) - Selected Methods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cookingSelection === "single"
                      ? comparisonMethods.map((methodId) => {
                          const method = cookingMethods.find((m) => m.id === methodId)!
                          const nutrition = methodData[methodId].nutrition
                          return (
                            <div key={methodId} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  <span>{method.icon}</span>
                                  {selectedFood} ({method.name})
                                </span>
                                <span className="font-medium">{nutrition}%</span>
                              </div>
                              <Progress value={nutrition} className="h-2" />
                            </div>
                          )
                        })
                      : ingredients.map((ingredient) => {
                          const individualMethod = ingredient.selectedMethod || bestMethod
                          const finalMethod = cookingSelection === "recipe" ? finalMealMethod : null

                          let combinedNutrition = methodData[individualMethod].nutrition
                          if (finalMethod && individualMethod !== "raw") {
                            combinedNutrition = Math.max(combinedNutrition * 0.85, 40)
                          } else if (finalMethod && individualMethod === "raw") {
                            combinedNutrition = methodData[finalMethod].nutrition
                          }

                          const individualMethodName =
                            cookingMethods.find((m) => m.id === individualMethod)?.name || individualMethod
                          const finalMethodName = finalMethod
                            ? cookingMethods.find((m) => m.id === finalMethod)?.name
                            : null

                          return (
                            <div key={ingredient.name} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>
                                  {ingredient.name} ({individualMethodName}
                                  {finalMethodName && individualMethod !== "raw" && ` + ${finalMethodName}`}
                                  {finalMethodName && individualMethod === "raw" && ` → ${finalMethodName}`})
                                </span>
                                <span className="font-medium">{Math.round(combinedNutrition)}%</span>
                              </div>
                              <Progress value={combinedNutrition} className="h-2" />
                            </div>
                          )
                        })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-chart-5" />
                    Carbon Footprint (g CO2e) - Selected Methods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cookingSelection === "single"
                      ? comparisonMethods.map((methodId) => {
                          const method = cookingMethods.find((m) => m.id === methodId)!
                          const carbon = methodData[methodId].carbon
                          const percentage = (carbon / 500) * 100
                          return (
                            <div key={methodId} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  <span>{method.icon}</span>
                                  {selectedFood} ({method.name})
                                </span>
                                <span className="font-medium">{carbon}g</span>
                              </div>
                              <Progress value={Math.min(percentage, 100)} className="h-2" />
                            </div>
                          )
                        })
                      : ingredients.map((ingredient) => {
                          const individualMethod = ingredient.selectedMethod || bestMethod
                          const finalMethod = cookingSelection === "recipe" ? finalMealMethod : null

                          let combinedCarbon = methodData[individualMethod].carbon
                          if (finalMethod && individualMethod !== "raw") {
                            combinedCarbon += methodData[finalMethod].carbon * 0.3
                          } else if (finalMethod && individualMethod === "raw") {
                            combinedCarbon = methodData[finalMethod].carbon * 0.5
                          }

                          const individualMethodName =
                            cookingMethods.find((m) => m.id === individualMethod)?.name || individualMethod
                          const finalMethodName = finalMethod
                            ? cookingMethods.find((m) => m.id === finalMethod)?.name
                            : null
                          const percentage = (combinedCarbon / 500) * 100

                          return (
                            <div key={ingredient.name} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>
                                  {ingredient.name} ({individualMethodName}
                                  {finalMethodName && individualMethod !== "raw" && ` + ${finalMethodName}`}
                                  {finalMethodName && individualMethod === "raw" && ` → ${finalMethodName}`})
                                </span>
                                <span className="font-medium">{Math.round(combinedCarbon)}g</span>
                              </div>
                              <Progress value={Math.min(percentage, 100)} className="h-2" />
                            </div>
                          )
                        })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <Button 
          onClick={() => setCurrentScreen("details")}
          variant="outline" 
          className="w-full py-6 text-lg bg-transparent"
        >
          See Detailed Analysis
        </Button>
      </div>
    )
  }

  const renderDetailsScreen = () => {
    const ingredients = getCurrentIngredients()
    const bestMethod = getBestMethod()
    const bestMethodData = methodData[bestMethod]
    const bestMethodName = cookingMethods.find((m) => m.id === bestMethod)?.name || "Steam"

    const getTotalCookingTime = () => {
      if (cookingSelection === "single") {
        return cookingMethods.find((m) => m.id === bestMethod)?.time || 0
      }

      const individualTimes = ingredients.map((ing) => {
        const method = ing.selectedMethod === "raw" ? null : ing.selectedMethod
        return method ? cookingMethods.find((m) => m.id === method)?.time || 0 : 0
      })

      const maxIndividualTime = Math.max(...individualTimes, 0)
      const finalTime = finalMealMethod ? cookingMethods.find((m) => m.id === finalMealMethod)?.time || 0 : 0

      return maxIndividualTime + finalTime
    }

    const allMethods = cookingMethods.filter((m) => m.id !== "raw")

    return (
      <div className="min-h-screen bg-background p-6 flex flex-col">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => setCurrentScreen("results")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground ml-4">
            {cookingSelection === "single" ? "Detailed Food Analysis" : "Detailed Meal Analysis"}
          </h1>
        </div>

        {cookingSelection === "single" ? (
          // SINGLE FOOD ANALYSIS
          <div className="space-y-8">
            {/* Selected Food Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-3xl">{foodItems.find((f) => f.name === selectedFood)?.icon}</span>
                  <div>
                    <div>{selectedFood}</div>
                    <div className="text-sm font-normal text-muted-foreground">
                      Recommended method: {bestMethodName}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Complete Method Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5" />
                  Complete Cooking Method Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Nutrition Chart */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-chart-1" />
                      Vitamin C Retention (%)
                    </h3>
                    <div className="space-y-3">
                      {allMethods.map((method) => {
                        const nutrition = methodData[method.id].nutrition
                        const isRecommended = method.id === bestMethod
                        return (
                          <div key={method.id} className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="flex items-center gap-2">
                                <span>{method.icon}</span>
                                {method.name}
                                {isRecommended && (
                                  <Badge variant="default" className="text-xs">Recommended</Badge>
                                )}
                              </span>
                              <span className="font-medium">{nutrition}%</span>
                            </div>
                            <Progress value={nutrition} className={`h-3 ${isRecommended ? 'bg-primary/20' : ''}`} />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Carbon Footprint Chart */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-chart-5" />
                      Carbon Footprint (g CO2e)
                    </h3>
                    <div className="space-y-3">
                      {allMethods.map((method) => {
                        const carbon = methodData[method.id].carbon
                        const percentage = (carbon / 500) * 100
                        const isRecommended = method.id === bestMethod
                        return (
                          <div key={method.id} className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="flex items-center gap-2">
                                <span>{method.icon}</span>
                                {method.name}
                                {isRecommended && (
                                  <Badge variant="default" className="text-xs">Recommended</Badge>
                                )}
                              </span>
                              <span className="font-medium">{carbon}g</span>
                            </div>
                            <Progress value={Math.min(percentage, 100)} className={`h-3 ${isRecommended ? 'bg-primary/20' : ''}`} />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Time Analysis */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-chart-3" />
                      Cooking Time Analysis
                    </h3>
                    <div className="space-y-3">
                      {allMethods.map((method) => {
                        const time = method.time
                        const percentage = (time / 30) * 100
                        const isRecommended = method.id === bestMethod
                        return (
                          <div key={method.id} className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="flex items-center gap-2">
                                <span>{method.icon}</span>
                                {method.name}
                                {isRecommended && (
                                  <Badge variant="default" className="text-xs">Recommended</Badge>
                                )}
                              </span>
                              <span className="font-medium">{time} min</span>
                            </div>
                            <Progress value={Math.min(percentage, 100)} className={`h-3 ${isRecommended ? 'bg-primary/20' : ''}`} />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Method Explanation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Why {bestMethodName} is Recommended
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {bestMethod === "steam"
                    ? "Steaming uses gentle heat from boiling water without submerging the food, leading to excellent nutrient retention with minimal water usage and lower energy consumption."
                    : bestMethod === "boil"
                      ? "Boiling cooks food in water at 100°C, which can cause some water-soluble vitamins to leach out but ensures thorough cooking and is relatively energy efficient."
                      : bestMethod === "microwave"
                        ? "Microwaving uses electromagnetic waves to heat food quickly with minimal water, preserving nutrients while using significantly less energy than conventional methods."
                        : bestMethod === "bake"
                          ? "Baking uses dry heat in an oven, which concentrates flavors and nutrients effectively, though it requires more energy for longer cooking times."
                          : bestMethod === "fry"
                            ? "Frying cooks food in hot oil, creating appealing textures and flavors, but uses more energy and may reduce some heat-sensitive nutrients."
                            : `${bestMethodName} provides a good balance of nutrient retention and cooking efficiency for ${selectedFood}.`}
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-2xl mb-1">🍎</div>
                    <div className="text-sm font-medium">{bestMethodData.nutrition}%</div>
                    <div className="text-xs text-muted-foreground">Nutrition Retained</div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-2xl mb-1">🌍</div>
                    <div className="text-sm font-medium">{bestMethodData.carbon}g</div>
                    <div className="text-xs text-muted-foreground">CO2 Emissions</div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-2xl mb-1">⏱️</div>
                    <div className="text-sm font-medium">{cookingMethods.find(m => m.id === bestMethod)?.time}m</div>
                    <div className="text-xs text-muted-foreground">Cooking Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // MEAL/RECIPE ANALYSIS
          <div className="space-y-8">
            {/* Meal Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Utensils className="w-6 h-6 text-primary" />
                  <div>
                    <div>{selectedRecipe ? selectedRecipe.name : "Custom Meal"}</div>
                    <div className="text-sm font-normal text-muted-foreground">
                      {ingredients.length} ingredients • {getTotalCookingTime()} minutes total
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Cooking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Cooking Timeline & Process
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Step 1: Individual Ingredient Preparation</h3>
                    <div className="space-y-3">
                      {ingredients.map((ing) => {
                        const method = ing.selectedMethod
                        const time = method ? cookingMethods.find((m) => m.id === method)?.time : 0
                        const methodName = cookingMethods.find((m) => m.id === method)?.name
                        const icon = cookingMethods.find((m) => m.id === method)?.icon
                        return (
                          <div key={ing.name} className="flex items-center justify-between p-2 bg-background rounded">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{ing.icon}</span>
                              <span className="font-medium">{ing.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span>{icon}</span>
                              <span>{methodName}</span>
                              <Badge variant="outline">{time}m</Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {finalMealMethod && (
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <span>{cookingMethods.find((m) => m.id === finalMealMethod)?.icon}</span>
                        Step 2: Final Meal Cooking
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        <div>Method: {cookingMethods.find((m) => m.id === finalMealMethod)?.name}</div>
                        <div>Duration: {cookingMethods.find((m) => m.id === finalMealMethod)?.time} minutes</div>
                      </div>
                    </div>
                  )}

                  <div className="text-center p-3 bg-accent/10 rounded-lg">
                    <div className="text-lg font-bold">Total Cooking Time: {getTotalCookingTime()} minutes</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Individual Ingredient Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5" />
                  Individual Ingredient Nutritional Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {ingredients.map((ingredient) => {
                    const individualMethod = ingredient.selectedMethod || bestMethod
                    const finalMethod = finalMealMethod
                    const individualData = methodData[individualMethod]
                    const individualMethodName = cookingMethods.find((m) => m.id === individualMethod)?.name || individualMethod
                    
                    let combinedNutrition = individualData.nutrition
                    if (finalMethod && individualMethod !== "raw") {
                      combinedNutrition = Math.max(combinedNutrition * 0.85, 40)
                    } else if (finalMethod && individualMethod === "raw") {
                      combinedNutrition = methodData[finalMethod].nutrition
                    }

                    let combinedCarbon = individualData.carbon
                    if (finalMethod && individualMethod !== "raw") {
                      combinedCarbon += methodData[finalMethod].carbon * 0.3
                    } else if (finalMethod && individualMethod === "raw") {
                      combinedCarbon = methodData[finalMethod].carbon * 0.5
                    }

                    return (
                      <div key={ingredient.name} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">{ingredient.icon}</span>
                          <div>
                            <h3 className="font-semibold">{ingredient.name}</h3>
                            <p className="text-sm text-muted-foreground">{individualMethodName} preparation</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium mb-2">Nutrition Retention</div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>After prep:</span>
                                <span>{individualData.nutrition}%</span>
                              </div>
                              <Progress value={individualData.nutrition} className="h-2" />
                              {finalMethod && (
                                <>
                                  <div className="flex justify-between text-xs">
                                    <span>Final result:</span>
                                    <span>{Math.round(combinedNutrition)}%</span>
                                  </div>
                                  <Progress value={combinedNutrition} className="h-2" />
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium mb-2">Carbon Impact</div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Prep only:</span>
                                <span>{individualData.carbon}g</span>
                              </div>
                              <Progress value={(individualData.carbon / 500) * 100} className="h-2" />
                              {finalMethod && (
                                <>
                                  <div className="flex justify-between text-xs">
                                    <span>Total:</span>
                                    <span>{Math.round(combinedCarbon)}g</span>
                                  </div>
                                  <Progress value={Math.min((combinedCarbon / 500) * 100, 100)} className="h-2" />
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Combined Impact Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Overall Meal Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-2xl mb-2">🍎</div>
                    <div className="text-lg font-bold">
                      {Math.round(
                        ingredients.reduce((sum, ing) => {
                          const method = ing.selectedMethod || bestMethod
                          let nutrition = methodData[method].nutrition
                          if (finalMealMethod && method !== "raw") {
                            nutrition = Math.max(nutrition * 0.85, 40)
                          } else if (finalMealMethod && method === "raw") {
                            nutrition = methodData[finalMealMethod].nutrition
                          }
                          return sum + nutrition
                        }, 0) / ingredients.length
                      )}%
                    </div>
                    <div className="text-sm text-muted-foreground">Avg. Nutrition Retained</div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-2xl mb-2">🌍</div>
                    <div className="text-lg font-bold">
                      {Math.round(
                        ingredients.reduce((sum, ing) => {
                          const method = ing.selectedMethod || bestMethod
                          let carbon = methodData[method].carbon
                          if (finalMealMethod && method !== "raw") {
                            carbon += methodData[finalMealMethod].carbon * 0.3
                          } else if (finalMealMethod && method === "raw") {
                            carbon = methodData[finalMealMethod].carbon * 0.5
                          }
                          return sum + carbon
                        }, 0)
                      )}g
                    </div>
                    <div className="text-sm text-muted-foreground">Total CO2 Emissions</div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-2xl mb-2">⏱️</div>
                    <div className="text-lg font-bold">{getTotalCookingTime()}m</div>
                    <div className="text-sm text-muted-foreground">Total Cook Time</div>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Multi-step cooking insight:</strong> When ingredients undergo multiple cooking methods, 
                    some nutrients may be further reduced, but this allows for complex flavor development and proper food safety. 
                    Your meal preparation balances nutritional retention with {prioritySlider[0] > 70 ? "environmental sustainability" : prioritySlider[0] < 30 ? "maximum nutrition" : "both nutrition and environmental impact"}.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-background min-h-screen">
      {currentScreen === "input" && renderInputScreen()}
      {currentScreen === "method" && renderMethodScreen()}
      {currentScreen === "results" && renderResultsScreen()}
      {currentScreen === "details" && renderDetailsScreen()}
    </div>
  )
}
