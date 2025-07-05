export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface PostImage {
  id: string
  post_id: string
  image_url: string
  alt_text: string | null
  caption: string | null
  position: number
  created_at: string
}

export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  featured_image: string | null
  images: string[] | null
  author_id: string
  published: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
  post_images?: PostImage[]
}
