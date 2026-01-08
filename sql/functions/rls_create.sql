-- task_headers
CREATE POLICY task_rls ON task_headers
FOR ALL
USING (is_permited('task_headers', id, 'SELECT'))
WITH CHECK (is_permited('task_headers', id, 'UPDATE'));




-- app_profiles
CREATE POLICY appro_rls ON app_profiles
FOR ALL
USING (is_permited('app_profiles', id, 'SELECT'))
WITH CHECK (is_permited('app_profiles', id, 'UPDATE'));

--app_profiles INSERT
-- Allow inserts (no row_id needed) can't use is_permitted ?
CREATE POLICY appro_insert ON app_profiles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM permissions_view
    WHERE user_id = (SELECT id FROM app_profiles WHERE auth_user_id = auth.uid())
      AND function_name = '(]createApprofile['
      AND scope_id = 'd2cdbb9b-9ab5-4c21-9aca-c43574b95d74'  -- Appros scope
  )
);