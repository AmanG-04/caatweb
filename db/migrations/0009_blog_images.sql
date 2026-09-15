ALTER TABLE blog_posts ADD COLUMN image_object_key TEXT;
ALTER TABLE blog_posts ADD COLUMN image_alt TEXT;
ALTER TABLE blog_posts ADD COLUMN image_placement TEXT NOT NULL DEFAULT 'top' CHECK (image_placement IN ('top', 'middle', 'end'));
