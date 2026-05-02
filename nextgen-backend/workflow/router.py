class WorkflowRouter:
    """
    Routes all workflow app DB operations to MongoDB.
    Everything else (auth, admin, sessions, api, token_blacklist) stays on SQLite.
    """

    MONGO_APPS = {"workflow"}

    def db_for_read(self, model, **hints):
        if model._meta.app_label in self.MONGO_APPS:
            return "mongodb"
        return "default"

    def db_for_write(self, model, **hints):
        if model._meta.app_label in self.MONGO_APPS:
            return "mongodb"
        return "default"

    def allow_relation(self, obj1, obj2, **hints):
        # Allow cross-DB relations between workflow (MongoDB) and auth (SQLite)
        return True

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label in self.MONGO_APPS:
            return db == "mongodb"
        return db == "default"
