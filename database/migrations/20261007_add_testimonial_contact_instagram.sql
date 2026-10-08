-- Campo opcional para contato reservado de testemunhos.
-- A publicação pública usa testimonial_publications e não expõe este campo.
ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS contact_instagram text;
COMMENT ON COLUMN public.testimonials.contact_instagram IS
  'Perfil de Instagram informado pela autora; visível apenas para equipe autorizada.';
