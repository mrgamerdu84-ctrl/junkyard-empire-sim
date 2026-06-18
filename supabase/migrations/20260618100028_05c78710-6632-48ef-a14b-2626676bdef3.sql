
CREATE POLICY "Anyone can read apks" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'apks');
CREATE POLICY "Anyone can upload apks" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'apks');
CREATE POLICY "Anyone can update apks" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'apks');
CREATE POLICY "Anyone can delete apks" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'apks');
