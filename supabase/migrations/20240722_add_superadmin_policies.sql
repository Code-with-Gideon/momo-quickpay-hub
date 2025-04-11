
-- Create a function to check if a user is a superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the user's email contains 'admin'
  -- In a production system, you'd use a more robust approach
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() AND email LIKE '%admin%'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow superadmins to view all transactions
CREATE POLICY "Superadmins can view all transactions" 
  ON public.transactions
  FOR SELECT 
  USING (public.is_superadmin());

-- Allow superadmins to view all profiles
CREATE POLICY "Superadmins can view all profiles" 
  ON public.profiles
  FOR SELECT 
  USING (public.is_superadmin());

-- Allow superadmins to update transactions
CREATE POLICY "Superadmins can update transactions" 
  ON public.transactions
  FOR UPDATE 
  USING (public.is_superadmin());

-- Allow superadmins to delete transactions
CREATE POLICY "Superadmins can delete transactions" 
  ON public.transactions
  FOR DELETE 
  USING (public.is_superadmin());

-- Create a view that joins transactions with user profiles for easy admin access
CREATE OR REPLACE VIEW public.admin_transaction_view AS
SELECT 
  t.id,
  t.transaction_type,
  t.amount,
  t.recipient,
  t.description,
  t.reference,
  t.status,
  t.created_at,
  p.display_name,
  p.phone_number,
  p.email,
  t.user_id
FROM 
  public.transactions t
JOIN 
  public.profiles p ON t.user_id = p.id;

-- Create policy for the view
CREATE POLICY "Only superadmins can access admin view" 
  ON public.admin_transaction_view
  FOR SELECT 
  USING (public.is_superadmin());
