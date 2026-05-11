-- Restart Notification ID sequence at 100
DO $$
DECLARE
  seq_name text;
BEGIN
  seq_name := pg_get_serial_sequence('"Notification"', 'id');
  IF seq_name IS NOT NULL THEN
    EXECUTE format('ALTER SEQUENCE %s RESTART WITH 100', seq_name);
    EXECUTE format(
      'SELECT setval(%L, GREATEST((SELECT MAX(id) FROM "Notification"), 99))',
      seq_name
    );
  END IF;
END$$;
