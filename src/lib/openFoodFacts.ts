export interface OFFProduct {
	name: string
	category: 'fridge' | 'pantry' | 'freezer'
	imageUrl: string | null
}

const FREEZER_KEYWORDS = ['frozen', 'ice-cream', 'ice-creams', 'sorbet']
const FRIDGE_KEYWORDS = [
	'dairy',
	'milk',
	'yogurt',
	'cheese',
	'meat',
	'fish',
	'seafood',
	'fresh',
	'chilled',
	'deli',
	'eggs',
	'beverages',
	'juice',
	'butter',
	'cream',
]

function mapCategory(
	tags: string[] | undefined,
): 'fridge' | 'pantry' | 'freezer' {
	if (!tags || tags.length === 0) return 'pantry'

	const joined = tags.join(' ').toLowerCase()

	if (FREEZER_KEYWORDS.some((kw) => joined.includes(kw))) return 'freezer'
	if (FRIDGE_KEYWORDS.some((kw) => joined.includes(kw))) return 'fridge'

	return 'pantry'
}

export async function lookupBarcode(
	barcode: string,
): Promise<OFFProduct | null> {
	try {
		const res = await fetch(
			`https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`,
		)
		if (!res.ok) return null

		const data = await res.json()
		if (data.status !== 1 || !data.product) return null

		const product = data.product
		const name =
			product.product_name || product.product_name_en || 'Unknown Product'
		const category = mapCategory(product.categories_tags)
		const imageUrl = product.image_front_url || null

		return { name, category, imageUrl }
	} catch {
		return null
	}
}
