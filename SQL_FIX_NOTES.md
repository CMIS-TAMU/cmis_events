# 🔧 SQL Migration Fix - Notes

## **Issue Fixed**

**Error:** `syntax error at or near "WHERE"` on line 151

**Problem:** PostgreSQL doesn't support WHERE clauses in UNIQUE constraints directly in the table definition.

**Original (Invalid):**
```sql
UNIQUE (student_id, mentor_id, status) WHERE status = 'active',
```

## **Solution**

Removed the invalid constraint from the table definition and created a partial unique index after the table is created.

**Fixed Approach:**
1. Removed the invalid UNIQUE constraint from table definition
2. Added a partial unique index after table creation:

```sql
-- Partial unique index: Ensure a student can only have one active match at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_unique_active_student 
ON matches(student_id) 
WHERE status = 'active';
```

## **Business Logic**

The constraint ensures that:
- A student can only have **ONE active match** at any given time
- This prevents duplicate active matches for the same student
- The constraint only applies to matches with `status = 'active'`
- Completed, dissolved, or failed matches don't count toward this limit

## **How to Apply**

1. If you already tried to run the migration and it failed:
   - The tables might be partially created
   - You may need to drop the `matches` table if it exists:
     ```sql
     DROP TABLE IF EXISTS matches CASCADE;
     ```

2. Run the fixed migration file:
   - `database/migrations/add_mentorship_system.sql`

3. Verify the index was created:
   ```sql
   SELECT indexname, indexdef 
   FROM pg_indexes 
   WHERE tablename = 'matches' 
   AND indexname = 'idx_matches_unique_active_student';
   ```

## **Migration Should Now Work!** ✅

The fixed migration file has been committed to the repository.

