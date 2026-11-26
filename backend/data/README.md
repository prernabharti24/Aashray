# AASHRAY Database Storage

The legacy JSON file-based database (`climates.json`, `materials.json`) has been completely replaced with **MySQL** as the sole database system.

- Database Name: `aashray_db`
- Tables: `climates`, `materials`, `shelters`, `simulations`, `design_reports`, `users`
- ORM: SQLAlchemy with PyMySQL driver
- Configuration: Controlled via `.env`
- Original JSON datasets have been backed up in `backend/data_backup/` and seeded into MySQL.
