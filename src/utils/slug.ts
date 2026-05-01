export const generateSlug = (title: string): string => {
	return title
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '') // Remove special characters
		.replace(/[\s_-]+/g, '-') // Replace spaces and underscores with single dash
		.replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
};
