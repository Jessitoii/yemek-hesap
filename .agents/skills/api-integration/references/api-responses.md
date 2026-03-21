# API Yanıt Örnekleri

Bu dosyayı `api-integration` skill'i kullanırken oku. Her API'nin gerçek response şekli burada.

---

## Migros API

**Endpoint:** `GET https://www.migros.com.tr/rest/search/screens/products?q=süt`

```json
{
  "successful": true,
  "data": {
    "searchInfo": {
      "storeProductInfos": [
        {
          "id": 20000011011520,
          "name": "Migros %3 Yağlı Uht Süt 1 L",
          "shownPrice": 4625,
          "regularPrice": 4625,
          "discountRate": 0,
          "unitPrice": "(46,25 TL/Litre)",
          "images": [
            { "urls": { "PRODUCT_LIST": "https://ima.mgs.com/..." } }
          ],
          "brand": { "name": "Migros" },
          "category": { "name": "Uzun Ömürlü Süt" }
        }
      ]
    }
  }
}
```

**Kritik:** `shownPrice` kuruş cinsindendir. `4625 / 100 = 46.25 TL`

---

## TheMealDB

**Endpoint:** `GET https://www.themealdb.com/api/json/v1/1/search.php?s=chicken`

```json
{
  "meals": [
    {
      "idMeal": "52772",
      "strMeal": "Teriyaki Chicken Casserole",
      "strCategory": "Chicken",
      "strArea": "Japanese",
      "strInstructions": "Preheat oven to 350...",
      "strMealThumb": "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
      "strIngredient1": "soy sauce",
      "strIngredient2": "water",
      "strIngredient3": "brown sugar",
      "strMeasure1": "3/4 cup",
      "strMeasure2": "1/2 cup",
      "strMeasure3": "1/4 cup"
    }
  ]
}
```

**Kritik:** Malzemeler `strIngredient1`..`strIngredient20` şeklinde flat field'lar. Boş string veya null olanlar atlanmalı.

---

## OpenFoodFacts

**Endpoint:** `GET https://world.openfoodfacts.org/cgi/search.pl?search_terms=yoğurt&json=1&page_size=5`

```json
{
  "products": [
    {
      "product_name": "Sade Yoğurt",
      "nutriments": {
        "energy-kcal_100g": 61,
        "proteins_100g": 3.5,
        "carbohydrates_100g": 4.7,
        "fat_100g": 3.3
      }
    }
  ]
}
```

**Kritik:** `energy-kcal_100g` alanı her ürün için mevcut olmayabilir. Her zaman kontrol et.

---

## USDA FoodData Central

**Endpoint:** `GET https://api.nal.usda.gov/fdc/v1/foods/search?query=yogurt&api_key=DEMO_KEY`

```json
{
  "foods": [
    {
      "description": "Yogurt, plain, whole milk",
      "foodNutrients": [
        { "nutrientName": "Energy", "value": 61, "unitName": "KCAL" },
        { "nutrientName": "Protein", "value": 3.47, "unitName": "G" },
        { "nutrientName": "Carbohydrate, by difference", "value": 4.66, "unitName": "G" },
        { "nutrientName": "Total lipid (fat)", "value": 3.25, "unitName": "G" }
      ]
    }
  ]
}
```

**Kritik:** Nutrient adını `toLowerCase().includes(...)` ile bul. Tam eşleşme arama.

---

## MyMemory Translation

**Endpoint:** `GET https://api.mymemory.translated.net/get?q=spring+onion&langpair=en|tr`

```json
{
  "responseData": {
    "translatedText": "taze soğan",
    "match": 1
  },
  "responseStatus": 200
}
```

**Kritik:** `responseStatus !== 200` ise çeviri başarısız. İngilizce adı döndür.

---

## Cerebras API

**Endpoint:** `POST https://api.cerebras.ai/v1/chat/completions`

**Request body:**
```json
{
  "model": "qwen-3-235b-a22b-instruct-2507",
  "max_tokens": 2048,
  "messages": [
    {
      "role": "system",
      "content": "You are a nutrition expert. Respond ONLY with valid JSON. No markdown, no explanation."
    },
    {
      "role": "user",
      "content": "Create a 3-day meal plan..."
    }
  ]
}
```

**Beklenen response JSON formatı:**
```json
{
  "days": [
    {
      "day": 1,
      "meals": {
        "breakfast": { "name": "Yulaf ezmesi", "calories": 320, "cost_tl": 8.50 },
        "lunch":     { "name": "Mercimek çorbası", "calories": 280, "cost_tl": 12.00 },
        "dinner":    { "name": "Izgara tavuk", "calories": 450, "cost_tl": 35.00 },
        "snack":     { "name": "Elma", "calories": 80, "cost_tl": 4.00 }
      },
      "total_calories": 1130,
      "total_cost_tl": 59.50
    }
  ]
}
```